#!/usr/bin/env python3
"""Sonda funcional da Construção usando somente a interface pública."""

from __future__ import annotations

import argparse
import hashlib
import os
import re
import tempfile
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse
from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support import expected_conditions as conditions
from selenium.webdriver.support.ui import WebDriverWait


APP_URL = "http://localhost:5173/"
DEFAULT_OUTPUT = Path(
    "art-guides/w3-a-r4-ux-proposal/captures/r4-final"
)
VIEWPORT_WIDTH = 320
VIEWPORT_HEIGHT = 640
DESKTOP_WIDTH = 1280
DESKTOP_HEIGHT = 800
WAIT_SECONDS = 20
VIEWPORT_FRAME_ID = "construction-probe-viewport"
CURRENT_STAGE = "startup"


def mark(stage: str) -> None:
    global CURRENT_STAGE
    CURRENT_STAGE = stage


class ProbeFailure(RuntimeError):
    """Falha associada a uma etapa pública do fluxo."""

    def __init__(self, stage: str, message: str) -> None:
        super().__init__(message)
        self.stage = stage


class ViewportHandler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        params = parse_qs(urlparse(self.path).query)
        width = int(params.get("width", [str(VIEWPORT_WIDTH)])[0])
        height = int(params.get("height", [str(VIEWPORT_HEIGHT)])[0])
        if (width, height) not in {
            (VIEWPORT_WIDTH, VIEWPORT_HEIGHT),
            (DESKTOP_WIDTH, DESKTOP_HEIGHT),
        }:
            self.send_error(400, "Viewport não autorizado pela sonda")
            return
        body = (
            "<!doctype html><html><body style='margin:0;background:#000'>"
            f"<iframe id='{VIEWPORT_FRAME_ID}' src='{APP_URL}' "
            f"width='{width}' height='{height}' "
            "style='display:block;border:0'></iframe></body></html>"
        ).encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format: str, *args: object) -> None:
        del format, args


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--headless", action="store_true")
    parser.add_argument("--pause", action="store_true")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    return parser.parse_args()


def calibrate_viewport(driver: WebDriver, width: int, _height: int) -> None:
    shell = driver.find_element(By.CSS_SELECTOR, ".app-shell")
    if abs(shell.rect["width"] - width) <= 1:
        return
    raise ProbeFailure(
        "viewport",
        f"Layout CSS mede {shell.rect['width']:.0f}px; esperado: {width}px.",
    )


def open_app(
    driver: WebDriver,
    viewport_url: str,
    width: int = VIEWPORT_WIDTH,
    height: int = VIEWPORT_HEIGHT,
) -> None:
    # O Firefox impõe 500 px como largura mínima da janela. Um iframe estático,
    # sem script e sem acesso aos dados da aplicação, oferece o viewport CSS
    # exato de 320×640 e mantém todas as ações dentro do documento real.
    driver.get(APP_URL)
    WebDriverWait(driver, WAIT_SECONDS).until(
        conditions.presence_of_element_located((By.CSS_SELECTOR, ".app-shell"))
    )
    driver.get(f"{viewport_url}?width={width}&height={height}")
    frame = WebDriverWait(driver, WAIT_SECONDS).until(
        conditions.presence_of_element_located((By.ID, VIEWPORT_FRAME_ID))
    )
    driver.switch_to.frame(frame)
    visible_element(driver, By.CSS_SELECTOR, ".app-shell")
    calibrate_viewport(driver, width, height)


def visible_button(driver: WebDriver, text: str, exact: bool = True) -> WebElement:
    normalized = re.sub(r"\s+", " ", text).strip()
    if exact:
        xpath = (
            "//button[not(@disabled) and "
            f'(@aria-label="{normalized}" or contains(normalize-space(.), "{normalized}"))]'
        )
    else:
        xpath = (
            "//button[not(@disabled) and contains(normalize-space(.),"
            f' "{normalized}")]'
        )
    return WebDriverWait(driver, WAIT_SECONDS).until(
        conditions.element_to_be_clickable((By.XPATH, xpath))
    )


def visible_link(driver: WebDriver, text: str) -> WebElement:
    return WebDriverWait(driver, WAIT_SECONDS).until(
        conditions.element_to_be_clickable(
            (By.XPATH, f'//a[contains(normalize-space(.), "{text}")]')
        )
    )


def visible_element(driver: WebDriver, by: By, value: str) -> WebElement:
    return WebDriverWait(driver, WAIT_SECONDS).until(
        conditions.visibility_of_element_located((by, value))
    )


def wait_absent(driver: WebDriver, by: By, value: str) -> None:
    WebDriverWait(driver, WAIT_SECONDS).until(
        conditions.invisibility_of_element_located((by, value))
    )


def canvas(driver: WebDriver) -> WebElement:
    return visible_element(driver, By.CSS_SELECTOR, ".library-visual-host canvas")


def wait_scene_rendered(driver: WebDriver) -> None:
    display_objects = WebDriverWait(driver, WAIT_SECONDS).until(
        conditions.presence_of_element_located(
            (
                By.XPATH,
                '//section[contains(@class,"library-visual-diagnostics")]'
                '//dt[normalize-space(.)="Display objects"]/following-sibling::dd[1]',
            )
        )
    )
    WebDriverWait(driver, WAIT_SECONDS).until(
        lambda _active: display_objects.text.isdigit()
        and int(display_objects.text) > 0
    )


def canvas_hash(driver: WebDriver) -> str:
    return hashlib.sha256(canvas(driver).screenshot_as_png).hexdigest()


def wait_canvas_change(driver: WebDriver, previous: str, stage: str) -> str:
    try:
        WebDriverWait(driver, WAIT_SECONDS).until(
            lambda active: canvas_hash(active) != previous
        )
    except TimeoutException as error:
        raise ProbeFailure(stage, "O canvas não mudou visualmente.") from error
    return canvas_hash(driver)


def click_canvas(driver: WebDriver, x: float, y: float) -> None:
    target = canvas(driver)
    ActionChains(driver).move_to_element(target).move_by_offset(
        x - target.rect["width"] / 2,
        y - target.rect["height"] / 2,
    ).click().perform()


def choose_valid_move_preview(driver: WebDriver) -> WebElement:
    candidates = (
        (VIEWPORT_WIDTH * 0.62, VIEWPORT_HEIGHT * 0.35),
        (VIEWPORT_WIDTH * 0.40, VIEWPORT_HEIGHT * 0.35),
        (VIEWPORT_WIDTH * 0.58, VIEWPORT_HEIGHT * 0.29),
        (VIEWPORT_WIDTH * 0.42, VIEWPORT_HEIGHT * 0.29),
        (VIEWPORT_WIDTH * 0.58, VIEWPORT_HEIGHT * 0.41),
        (VIEWPORT_WIDTH * 0.42, VIEWPORT_HEIGHT * 0.41),
    )
    for x, y in candidates:
        click_canvas(driver, x, y)
        buttons = driver.find_elements(
            By.XPATH, '//button[contains(normalize-space(.), "Confirmar")]'
        )
        if buttons and buttons[0].is_enabled():
            return buttons[0]
    raise ProbeFailure(
        "move-preview",
        "Nenhuma das posições tocadas no canvas produziu preview válido.",
    )


def paint_expansion(driver: WebDriver) -> None:
    target = canvas(driver)
    width = target.rect["width"]
    # Começa junto à borda leste da planta e mantém o ponteiro na zona de
    # auto-pan. Cada pequeno movimento é um pointermove real e coleta a célula
    # agora exposta, formando uma faixa conectada para fora da planta inicial.
    actions = ActionChains(driver).move_to_element(target).move_by_offset(
        width / 2 - 22,
        -target.rect["height"] * 0.16,
    ).click_and_hold()
    for _step in range(12):
        actions.move_by_offset(-2, 0).move_by_offset(2, 0)
    actions.release().perform()


def pan_to_east_limit(driver: WebDriver) -> None:
    target = canvas(driver)
    for _gesture in range(4):
        ActionChains(driver).move_to_element(target).move_by_offset(
            target.rect["width"] / 2 - 40,
            -target.rect["height"] * 0.1,
        ).click_and_hold().move_by_offset(-220, 0).release().perform()


def piece_count(driver: WebDriver) -> int:
    visible_button(driver, "Peças").click()
    sheet = visible_element(driver, By.CSS_SELECTOR, ".construction-sheet--pieces")
    count = len(sheet.find_elements(By.CSS_SELECTOR, "li"))
    visible_button(driver, "Fechar peças colocadas").click()
    wait_absent(driver, By.CSS_SELECTOR, ".construction-sheet--pieces")
    return count


def wait_notice(driver: WebDriver, text: str) -> None:
    notice = WebDriverWait(driver, WAIT_SECONDS).until(
        conditions.presence_of_element_located((By.CSS_SELECTOR, ".library-placement-toast"))
    )
    if text not in notice.text:
        raise ProbeFailure("visible-error", notice.text)


def screenshot(
    driver: WebDriver,
    output: Path,
    name: str,
    reset_scroll: bool = True,
) -> Path:
    path = output / name
    if reset_scroll:
        driver.find_element(By.TAG_NAME, "body").send_keys(Keys.HOME)
    driver.switch_to.default_content()
    frame = driver.find_element(By.ID, VIEWPORT_FRAME_ID)
    path.write_bytes(frame.screenshot_as_png)
    driver.switch_to.frame(frame)
    return path


def run_flow(driver: WebDriver, output: Path, viewport_url: str) -> list[str]:
    completed: list[str] = []
    mark("open-app")
    open_app(driver, viewport_url)
    wait_scene_rendered(driver)

    mark("open-construction")
    visible_button(driver, "Construir").click()
    visible_element(driver, By.CSS_SELECTOR, ".construction-controls")
    completed.append("1. Construção aberta pela interface")

    # Prepara uma peça própria numa expansão real. Essas ações não geram
    # capturas extras: servem apenas para que a seleção e o movimento finais
    # exercitem uma posição válida e inequívoca.
    mark("floor-tool")
    visible_button(driver, "Piso").click()
    floor_sheet = visible_element(driver, By.CSS_SELECTOR, ".construction-sheet--compact")
    if not re.search(
        r"\d+",
        floor_sheet.find_element(
            By.CSS_SELECTOR, ".construction-sheet__heading .eyebrow"
        ).text,
    ):
        raise ProbeFailure("floor-inventory", "Quantidade de piso não está visível.")
    visible_button(driver, "Adicionar piso").click()
    mark("floor-preview")
    paint_expansion(driver)
    apply_floor = visible_button(driver, "Aplicar piso", exact=False)
    match = re.search(r"(\d+)", apply_floor.text)
    preview_count = int(match.group(1)) if match else 0
    if preview_count < 3:
        raise ProbeFailure(
            "floor-preview",
            f"Preview contém {preview_count} célula(s); esperadas pelo menos 3.",
        )
    mark("floor-commit")
    apply_floor.click()
    wait_notice(driver, "Piso aplicado")
    completed.append(f"2. Expansão auxiliar aplicada ({preview_count} células)")

    mark("structure-palette")
    visible_button(driver, "Estruturas").click()
    short_wall = WebDriverWait(driver, WAIT_SECONDS).until(
        conditions.element_to_be_clickable(
            (
                By.XPATH,
                '(//button[contains(@class,"construction-palette__item") '
                'and contains(normalize-space(.),"Parede curta")])[1]',
            )
        )
    )
    short_wall.click()
    wait_absent(driver, By.CSS_SELECTOR, ".construction-sheet")

    # A câmera permanece na expansão criada. Dois pontos próximos da borda
    # direita exercitam placement e move fora do retângulo original.
    mark("structure-place")
    click_canvas(driver, VIEWPORT_WIDTH - 34, VIEWPORT_HEIGHT * 0.35)
    confirm = visible_button(driver, "Confirmar")
    confirm.click()
    wait_notice(driver, "Peça colocada")
    completed.append("3. Peça auxiliar colocada pela interface")
    wait_absent(driver, By.CSS_SELECTOR, ".library-placement-toast")

    mark("placed-pieces-sheet")
    visible_button(driver, "Peças").click()
    sheet = visible_element(driver, By.CSS_SELECTOR, ".construction-sheet--pieces")
    sheet_height = sheet.rect["height"]
    if sheet_height > VIEWPORT_HEIGHT * 0.32 + 2:
        raise ProbeFailure(
            "placed-pieces-size",
            f"Sheet mede {sheet.rect['width']:.0f}x{sheet_height:.0f}px.",
        )
    pieces = sheet.find_elements(By.CSS_SELECTOR, "li button")
    if len(pieces) < 3:
        raise ProbeFailure("placed-pieces-content", "A faixa não contém peças suficientes.")
    card_rows = {round(piece.rect["y"]) for piece in pieces[:3]}
    if len(card_rows) != 1 or not (pieces[0].rect["x"] < pieces[1].rect["x"]):
        raise ProbeFailure("placed-pieces-layout", "As peças não formam uma faixa horizontal.")
    screenshot(driver, output, "01-pecas-colocadas-compacta-320x640.png")
    completed.append(
        f"4. Peças colocadas em faixa horizontal: {sheet.rect['width']:.0f}x{sheet_height:.0f}px"
    )

    mark("piece-selection")
    before_selection = canvas_hash(driver)
    pieces[-1].click()
    wait_absent(driver, By.CSS_SELECTOR, ".construction-sheet--pieces")
    visible_element(driver, By.CSS_SELECTOR, '[aria-label="Peça selecionada"]')
    selected_canvas = wait_canvas_change(
        driver, before_selection, "piece-highlight-immediate"
    )
    screenshot(driver, output, "02-peca-selecionada-barra-contextual.png")
    completed.append("5. Sheet fechou; peça destacou e barra contextual apareceu")

    mark("structure-move")
    visible_button(driver, "Mover").click()
    move_toolbar = visible_element(driver, By.CSS_SELECTOR, '[aria-label="Posicionar peça"]')
    move_labels = {button.text.splitlines()[-1] for button in move_toolbar.find_elements(By.TAG_NAME, "button")}
    if "Mover" in move_labels or "Remover" in move_labels:
        raise ProbeFailure("move-toolbar", "A barra de seleção permaneceu durante o movimento.")
    confirm_move = choose_valid_move_preview(driver)
    before_move_commit = canvas_hash(driver)
    confirm_move.click()
    wait_notice(driver, "Peça movida")
    moved_canvas = wait_canvas_change(driver, before_move_commit, "move-immediate")
    if moved_canvas == selected_canvas:
        raise ProbeFailure("move-position", "O canvas voltou ao estado anterior após mover.")
    completed.append("6. Movimento apareceu imediatamente no canvas")

    visible_button(driver, "Cancelar").click()
    visible_button(driver, "Sair").click()

    mark("summary-mobile")
    visible_link(driver, "Resumo").click()
    visible_element(driver, By.XPATH, '//h2[normalize-space(.)="Resumo"]')
    chart = visible_element(driver, By.CSS_SELECTOR, ".statistics-chart__plot")
    metrics = driver.find_elements(By.CSS_SELECTOR, ".statistics-metrics > p")
    if len(metrics) != 6 or len({round(metric.rect["x"]) for metric in metrics}) != 2:
        raise ProbeFailure("summary-mobile-metrics", "As métricas não usam duas colunas.")
    if not 190 <= chart.rect["height"] <= 220:
        raise ProbeFailure(
            "summary-mobile-chart", f"Gráfico mobile mede {chart.rect['height']:.0f}px."
        )
    screenshot(driver, output, "03-resumo-completo-320x640.png")
    ledger = visible_element(driver, By.CSS_SELECTOR, ".statistics-ledger")
    dock = visible_element(driver, By.CSS_SELECTOR, ".primary-dock")
    app_content = visible_element(driver, By.CSS_SELECTOR, ".app-content")
    padding_bottom = float(
        app_content.value_of_css_property("padding-bottom").removesuffix("px")
    )
    if padding_bottom + 1 < dock.rect["height"]:
        raise ProbeFailure("summary-mobile-dock", "O dock cobre o fim do Resumo.")
    if ledger.find_elements(By.CSS_SELECTOR, ".content-card"):
        raise ProbeFailure("summary-mobile-ledger", "Sessões ou histórico ainda usam cartão grande.")
    completed.append("7. Resumo mobile inspecionado em 320x640")

    mark("summary-desktop")
    driver.switch_to.default_content()
    driver.set_window_rect(width=1320, height=920)
    driver.get(f"{viewport_url}?width={DESKTOP_WIDTH}&height={DESKTOP_HEIGHT}")
    frame = WebDriverWait(driver, WAIT_SECONDS).until(
        conditions.presence_of_element_located((By.ID, VIEWPORT_FRAME_ID))
    )
    driver.switch_to.frame(frame)
    visible_element(driver, By.CSS_SELECTOR, ".app-shell")
    calibrate_viewport(driver, DESKTOP_WIDTH, DESKTOP_HEIGHT)
    visible_link(driver, "Resumo").click()
    visible_element(driver, By.XPATH, '//h2[normalize-space(.)="Resumo"]')
    desktop_chart = visible_element(driver, By.CSS_SELECTOR, ".statistics-chart__plot")
    if not 230 <= desktop_chart.rect["height"] <= 250:
        raise ProbeFailure(
            "summary-desktop-chart",
            f"Gráfico desktop mede {desktop_chart.rect['height']:.0f}px.",
        )
    type_cards = driver.find_elements(By.CSS_SELECTOR, ".statistics-type")
    type_rows: dict[int, int] = {}
    for card in type_cards:
        row = round(card.rect["y"])
        type_rows[row] = type_rows.get(row, 0) + 1
    if len(type_cards) != 6 or (len(type_rows) > 1 and min(type_rows.values()) == 1):
        raise ProbeFailure("summary-types-layout", "Uma categoria ficou isolada.")
    ActionChains(driver).scroll_by_amount(0, 120).perform()
    screenshot(
        driver,
        output,
        "04-resumo-desktop-metricas-grafico.png",
        reset_scroll=False,
    )
    completed.append("8. Resumo desktop inspecionado em 1280x800")
    return completed


def create_driver(headless: bool, profile_path: Path) -> WebDriver:
    options = Options()
    options.binary_location = "/usr/bin/firefox"
    options.profile = str(profile_path)
    if headless:
        options.add_argument("-headless")
    options.add_argument("--width=1320")
    options.add_argument("--height=920")
    service_environment = os.environ.copy()
    if headless:
        service_environment["MOZ_HEADLESS_WIDTH"] = "1320"
        service_environment["MOZ_HEADLESS_HEIGHT"] = "920"
    return webdriver.Firefox(
        options=options,
        service=Service(env=service_environment),
    )


def main() -> int:
    args = parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    driver: WebDriver | None = None
    viewport_server = ThreadingHTTPServer(("127.0.0.1", 0), ViewportHandler)
    viewport_thread = threading.Thread(
        target=viewport_server.serve_forever,
        daemon=True,
    )
    viewport_thread.start()
    viewport_url = f"http://localhost:{viewport_server.server_port}/"
    try:
        with tempfile.TemporaryDirectory(prefix="biblioteca-viva-firefox-") as profile:
            driver = create_driver(args.headless, Path(profile))
            stages = run_flow(driver, args.output, viewport_url)
            print("Firefox:", "headless" if args.headless else "visível")
            for item in stages:
                print("OK", item)
            if args.pause:
                input("Firefox mantido aberto. Pressione Enter para fechar...")
        return 0
    except ProbeFailure as error:
        stage = error.stage
        print(f"FALHA [{stage}] {error}")
        if driver is not None:
            screenshot(driver, args.output, f"failure-{stage}.png")
        return 1
    except Exception as error:  # Selenium precisa preservar evidência inesperada.
        stage = CURRENT_STAGE
        print(f"FALHA [{stage}] {type(error).__name__}: {error}")
        if driver is not None:
            screenshot(driver, args.output, f"failure-{stage}.png")
        return 1
    finally:
        if driver is not None:
            driver.quit()
        viewport_server.shutdown()
        viewport_server.server_close()


if __name__ == "__main__":
    raise SystemExit(main())
