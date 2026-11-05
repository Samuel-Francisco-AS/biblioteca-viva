import { chooseBVDate } from "./pickers";
import { expect, test } from "./fixtures";
import { mkdir, readFile, writeFile } from "node:fs/promises";
const evidence = "docs/evidence/BF-5P2D";
test.use({
  locale: "pt-BR",
  timezoneId: "America/Fortaleza",
  hasTouch: true,
  isMobile: true,
  viewport: { width: 390, height: 844 },
});
test("seis combinações de formato mantêm as duas estruturas, campos opcionais e cinco grupos", async ({
  page,
}) => {
  const records = [
    ["Filme", undefined, "movie"],
    ["Série", undefined, "series"],
    ["Anime", "Obra unitária", "movie"],
    ["Anime", "Obra episódica", "series"],
    ["Animação", "Obra unitária", "movie"],
    ["Animação", "Obra episódica", "series"],
  ] as const;
  for (const [index, [format, structure, type]] of records.entries()) {
    await page.goto("/novo-registro");
    await page
      .getByRole("button", { name: /^FÓLIO \d+ Entretenimento/ })
      .click();
    await page.getByRole("button", { name: new RegExp(`^${format}`) }).click();
    if (structure)
      await page.getByRole("radio", { name: structure, exact: true }).check();
    await expect(page.locator(".cinema-editor select")).toHaveCount(0);
    await page
      .getByLabel("Título", { exact: true })
      .fill(`${format} Aurora ${index}`);
    if (index === 2) {
      await mkdir(evidence, { recursive: true });
      await page.screenshot({
        path: `${evidence}/cadastro-anime.png`,
        fullPage: true,
      });
    }
    await page
      .getByRole("button", { name: "Salvar obra", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: `${format} Aurora ${index}`,
        exact: true,
      }),
    ).toBeVisible();
    const id = decodeURIComponent(
      new URL(page.url()).pathname.split("/").pop() ?? "",
    );
    const saved = await page.evaluate(async (entryId) => {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const r = indexedDB.open("biblioteca-viva");
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(new Error("open"));
      });
      try {
        return await new Promise<{ type: string; catalog: { format: string } }>(
          (resolve, reject) => {
            const r = db
              .transaction("libraryEntries")
              .objectStore("libraryEntries")
              .get(entryId);
            r.onsuccess = () => {
              const value: unknown = r.result;
              if (
                typeof value !== "object" ||
                value === null ||
                !("type" in value) ||
                typeof value.type !== "string" ||
                !("catalog" in value) ||
                typeof value.catalog !== "object" ||
                value.catalog === null ||
                !("format" in value.catalog) ||
                typeof value.catalog.format !== "string"
              )
                return reject(new Error("invalid entry"));
              resolve({
                type: value.type,
                catalog: { format: value.catalog.format },
              });
            };
            r.onerror = () => reject(new Error("read"));
          },
        );
      } finally {
        db.close();
      }
    }, id);
    expect(saved.type).toBe(type);
    expect(saved.catalog.format).toBe(
      { Filme: "film", Série: "series", Anime: "anime", Animação: "animation" }[
        format
      ],
    );
  }
  await page.goto("/colecao");
  await expect(
    page
      .getByRole("navigation", { name: "Categorias do acervo" })
      .getByRole("button"),
  ).toHaveCount(6);
  await page
    .getByRole("button", { name: "Entretenimento", exact: true })
    .click();
  await expect(page.locator(".book-card")).toHaveCount(6);
  await page.getByText(/Explorar catálogo/).click();
  await page.getByRole("button", { name: "Anime", exact: true }).click();
  await expect(page.locator(".book-card")).toHaveCount(2);
  await page.goto("/estatisticas?type=entertainment");
  await expect(page.locator(".statistics-type")).toHaveCount(5);
  await expect(
    page.getByRole("heading", { name: "Entretenimento", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .locator(".statistics-metrics p")
      .filter({ hasText: "Registros" })
      .locator("strong"),
  ).toHaveText("6");
});
test("catálogo acompanha estreia, poster, episódios, temporadas, diário, desejos e Arquivo", async ({
  page,
}) => {
  const evidence = "test-results/BF-5P2F-regressao-catalogo";
  await page.clock.setFixedTime(new Date("2026-11-04T12:00:00Z"));
  await page.goto("/novo-registro");
  await page.getByRole("button", { name: /^FÓLIO \d+ Entretenimento/ }).click();
  await page.getByRole("button", { name: /^Anime/ }).click();
  await page.getByRole("radio", { name: "Obra episódica" }).check();
  await page.getByLabel("Título", { exact: true }).fill("A última constelação");
  await page.getByLabel("Quantidade de temporadas").fill("2");
  await page.getByLabel("Total de episódios", { exact: true }).fill("12");
  await chooseBVDate(page, page.getByLabel("Data de estreia"), "2026-11-16");
  await page
    .getByRole("radio", { name: "Aguardando lançamento", exact: true })
    .check();
  await page.getByRole("checkbox", { name: "Favorito", exact: true }).check();
  await page
    .getByLabel("Poster personalizado")
    .setInputFiles("e2e/fixtures/entertainment/ceu-ficticio.jpg");
  await expect(page.getByAltText("Poster selecionado")).toBeVisible();
  await page.getByRole("button", { name: "Salvar obra", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "A última constelação", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Estreia", { exact: true })).toContainText("12");
  await expect(
    page.getByAltText("Poster de A última constelação"),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByAltText("Poster de A última constelação"),
  ).toBeVisible();
  await page.locator(".cinema-state-chooser > summary").click();
  await page.getByRole("radio", { name: "Assistindo", exact: true }).check();
  await page.getByLabel("Temporada atual", { exact: true }).fill("1");
  await page.getByLabel("Episódio atual", { exact: true }).fill("6");
  await page.getByLabel("Episódios assistidos", { exact: true }).fill("6");
  await page
    .getByRole("checkbox", { name: "Temporada atual concluída" })
    .check();
  await page.getByRole("button", { name: "Salvar acompanhamento" }).click();
  await expect(page.locator(".cinema-feedback")).toHaveText(
    "Acompanhamento salvo.",
  );
  await expect(
    page.getByRole("progressbar", { name: "Progresso da obra" }),
  ).toHaveAttribute("value", "6");
  await page.getByRole("radio", { name: "5 de 5 estrelas" }).check();
  await expect(page.locator(".persisted-rating")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  await expect(
    page.getByRole("radio", { name: "5 de 5 estrelas" }),
  ).toBeChecked();
  await page
    .getByLabel("Nova nota", { exact: true })
    .fill("Opinião privada da fixture.");
  await page
    .getByRole("button", { name: "Adicionar nota", exact: true })
    .click();
  await expect(
    page.getByText("Opinião privada da fixture.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Citações", exact: true }).click();
  await page
    .getByLabel("Nova citação", { exact: true })
    .fill("Há luz entre as páginas do céu.");
  await page.getByLabel("Temporada da citação").fill("1");
  await page.getByLabel("Episódio da citação").fill("6");
  await page.getByLabel("Minuto da cena (opcional)").fill("12");
  await page
    .getByRole("button", { name: "Adicionar citação", exact: true })
    .click();
  await expect(page.getByText(/T1 E6 · 12 min/)).toBeVisible();
  await mkdir(evidence, { recursive: true });
  for (const selector of [
    ".cinema-identity h2",
    ".cinema-chapter-heading h3",
    ".cinema-navigation a",
  ]) {
    const ratio = await page
      .locator(selector)
      .first()
      .evaluate((element) => {
        const components = getComputedStyle(element)
          .color.match(/\d+(?:\.\d+)?/g)
          ?.slice(0, 3)
          .map(Number);
        if (!components) return 0;
        const luminance = (values: number[]) =>
          values
            .map((n) => {
              const v = n / 255;
              return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
            })
            .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
        const a = luminance(components),
          b = luminance([245, 235, 217]);
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      });
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `${evidence}/folio-anime-retrato.png`,
    fullPage: true,
  });
  const url = page.url();
  await page.getByLabel("Episódios assistidos", { exact: true }).fill("7");
  page.once("dialog", (d) => void d.dismiss());
  await page
    .getByRole("link", { name: "Voltar à Coleção", exact: true })
    .click();
  await expect(page).toHaveURL(url);
  await page.getByRole("button", { name: "Salvar acompanhamento" }).click();
  await expect(page.locator(".cinema-feedback")).toHaveText(
    "Acompanhamento salvo.",
  );
  await page.clock.setFixedTime(new Date("2026-11-05T12:00:00Z"));
  await page.evaluate(() =>
    document.dispatchEvent(new Event("visibilitychange")),
  );
  await expect(page.getByLabel("Estreia", { exact: true })).toContainText("11");
  await page
    .getByRole("link", { name: "Voltar à Coleção", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Entretenimento", exact: true })
    .click();
  await page.getByText(/Explorar catálogo/).click();
  for (const name of [
    "Desejos",
    "Lançamentos",
    "Favoritos",
    "Em andamento",
    "Anime",
  ]) {
    await page.getByRole("button", { name, exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "A última constelação", exact: true }),
    ).toBeVisible();
  }
  await page.goto("/arquivo?entryType=entertainment");
  await expect(
    page.getByText("Há luz entre as páginas do céu.", { exact: true }),
  ).toBeVisible();
  await page.goto(url);
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(
    page.getByRole("heading", { name: "A última constelação", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `${evidence}/folio-anime-paisagem.png`,
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#cinema-actions > summary").click();
  await page.getByRole("link", { name: "Editar obra", exact: true }).click();
  await expect(page.getByLabel("Título", { exact: true })).toHaveValue(
    "A última constelação",
  );
  await page.getByLabel("Plataforma / serviço").fill("Cinema de bolso");
  await chooseBVDate(page, page.getByLabel("Data de estreia"), "2026-11-20");
  await page
    .getByRole("button", { name: "Salvar alterações", exact: true })
    .click();
  await expect(page).toHaveURL(url);
  await expect(
    page.getByRole("progressbar", { name: "Progresso da obra" }),
  ).toHaveAttribute("value", "7");
  await expect(
    page.getByRole("button", { name: "★ Favorito", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByAltText("Poster de A última constelação"),
  ).toBeVisible();
  await expect(page.getByLabel("Estreia", { exact: true })).toContainText("15");
});
test("compositor exporta PNG real offline nos quatro modos, personaliza fundo e mensagem, prévia e story", async ({
  page,
  context,
}) => {
  await page.clock.setFixedTime(new Date("2026-11-04T12:00:00Z"));
  await page.goto("/novo-registro");
  await page.getByRole("button", { name: /^FÓLIO \d+ Entretenimento/ }).click();
  await page.getByRole("button", { name: /^Filme/ }).click();
  await page
    .getByLabel("Título", { exact: true })
    .fill("O céu depois da meia-noite");
  await chooseBVDate(page, page.getByLabel("Data de estreia"), "2026-11-16");
  await page
    .getByLabel("Poster personalizado")
    .setInputFiles("e2e/fixtures/entertainment/ceu-ficticio.jpg");
  await expect(page.getByAltText("Poster selecionado")).toBeVisible();
  await page.getByRole("button", { name: "Salvar obra" }).click();
  await expect(
    page.getByRole("heading", { name: "O céu depois da meia-noite" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Criar banner cinematográfico" })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("img")).toBeVisible();
  await context.setOffline(true);
  await dialog
    .getByLabel("Mensagem do banner")
    .fill("Uma noite para atravessar o impossível.");
  await expect(dialog.getByRole("img")).toHaveAttribute(
    "alt",
    /atravessar o impossível/,
  );
  await dialog.getByText("Imagem e acabamento", { exact: true }).click();
  await dialog.getByRole("radio", { name: "Gravura do Códice" }).check();
  await expect(dialog.getByRole("img")).toBeVisible();
  const first = await dialog.getByRole("img").getAttribute("src");
  await dialog.getByLabel("Escolher fundo do dispositivo").setInputFiles({
    name: "invalid.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
  });
  await expect(dialog.getByRole("alert")).toContainText("JPEG ou PNG");
  await dialog
    .getByLabel("Escolher fundo do dispositivo")
    .setInputFiles("e2e/fixtures/entertainment/ceu-ficticio.jpg");
  await expect(
    dialog.getByRole("radio", { name: "Minha imagem" }),
  ).toBeChecked();
  await expect(dialog.getByRole("img")).toBeVisible();
  await dialog.getByRole("radio", { name: "Estreia celestial" }).check();
  await expect(dialog.getByRole("img")).not.toHaveAttribute("src", first ?? "");
  await mkdir(evidence, { recursive: true });
  for (const [index, name] of [
    "Lançamento",
    "Lista de desejos",
    "Acompanhamento",
    "Conclusão / recomendação",
  ].entries()) {
    await dialog.getByRole("radio", { name, exact: true }).check();
    await expect(dialog.getByRole("img")).toBeVisible();
    const downloadPromise = page.waitForEvent("download");
    await dialog
      .getByRole("button", { name: "Salvar PNG", exact: true })
      .click();
    const download = await downloadPromise;
    const path = await download.path();
    expect(path).toBeTruthy();
    if (!path) throw new Error("download ausente");
    const bytes = await readFile(path);
    expect(bytes.subarray(0, 8)).toEqual(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    );
    expect(bytes.readUInt32BE(16)).toBe(1080);
    expect(bytes.readUInt32BE(20)).toBe(1350);
    expect(bytes.length).toBeGreaterThan(10000);
    await writeFile(`${evidence}/banner-${index}.png`, bytes);
  }
  await dialog.getByRole("radio", { name: "Story · 9:16" }).check();
  await dialog
    .getByLabel("Mensagem do banner")
    .fill("Uma noite para atravessar o impossível.");
  await expect(dialog.getByRole("img")).toHaveAttribute("height", "1920");
  const storyPromise = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Salvar PNG", exact: true }).click();
  const story = await storyPromise;
  const storyPath = await story.path();
  if (!storyPath) throw new Error("story ausente");
  const bytes = await readFile(storyPath);
  expect(bytes.readUInt32BE(20)).toBe(1920);
  await writeFile(`${evidence}/banner-story.png`, bytes);
  await dialog.evaluate((element) => {
    element.scrollTop = 0;
  });
  await page.screenshot({
    path: `${evidence}/compositor-retrato.png`,
    fullPage: false,
  });
  await page.setViewportSize({ width: 844, height: 390 });
  expect(
    await dialog.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
  await dialog.evaluate((element) => {
    element.scrollTop = 0;
  });
  await page.screenshot({
    path: `${evidence}/compositor-paisagem.png`,
    fullPage: false,
  });
  await page.evaluate(() =>
    window.dispatchEvent(
      new Event("biblioteca-viva:native-back", { cancelable: true }),
    ),
  );
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Criar banner cinematográfico" }),
  ).toBeFocused();
});
