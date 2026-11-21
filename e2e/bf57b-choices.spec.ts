import { expect, test } from "@playwright/test";

for (const viewport of [
  { width: 390, height: 844 },
  { width: 844, height: 390 },
]) {
  test(`R2: classification radios keep native square paint boxes at ${viewport.width}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/arcanario/assuntos");
    const group = page.getByRole("group", { name: "Nível", exact: true });
    const radios = group.getByRole("radio");
    await expect(radios).toHaveCount(6);
    for (const text of [
      "Área",
      "Disciplina",
      "Assunto",
      "Subassunto",
      "Habilidade",
      "Etiqueta pessoal",
    ]) {
      const radio = group.getByRole("radio", { name: text, exact: true });
      await radio.check();
      await expect(radio).toBeChecked();
      const geometry = await radio.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        const label = element.closest("label")!;
        const span = label.querySelector("span")!;
        const style = getComputedStyle(element);
        return {
          width: bounds.width,
          height: bounds.height,
          target: label.getBoundingClientRect().height,
          text: span.textContent,
          transform: getComputedStyle(span).transform,
          shadow: style.boxShadow,
        };
      });
      expect(geometry.width).toBe(geometry.height);
      expect(geometry.target).toBeGreaterThanOrEqual(44);
      expect(geometry.text).toBe(text);
      expect(geometry.transform).toBe("none");
      expect(geometry.shadow).toBe("none");
    }
    const area = group.getByRole("radio", { name: "Área", exact: true });
    await area.focus();
    await page.keyboard.press("ArrowRight");
    await expect(
      group.getByRole("radio", { name: "Disciplina", exact: true }),
    ).toBeChecked();
    await group.evaluate((element) =>
      element.scrollIntoView({ block: "center" }),
    );
    await group.screenshot({ path: test.info().outputPath("choices.png") });
  });
}
