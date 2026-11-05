import { expect, type Locator, type Page } from "@playwright/test";
export async function chooseBVOption(
  page: Page,
  trigger: Locator,
  choice: string | { label?: string; index?: number },
) {
  await trigger.click();
  const dialog = page.locator("dialog[open]").last();
  const radios = dialog.getByRole("radio");
  if (typeof choice === "string") {
    const count = await radios.count();
    let found = false;
    for (let i = 0; i < count; i++) {
      const radio = radios.nth(i);
      if ((await radio.getAttribute("value")) === choice) {
        await radio.check();
        found = true;
        break;
      }
    }
    expect(found, `Opção ${choice}`).toBe(true);
  } else if (choice.index !== undefined) await radios.nth(choice.index).check();
  else if (choice.label)
    await dialog
      .getByRole("radio", { name: choice.label, exact: true })
      .check();
  else throw new Error("Escolha ausente");
  await dialog.getByRole("button", { name: "Confirmar", exact: true }).click();
}
export async function chooseBVDate(page: Page, trigger: Locator, date: string) {
  await trigger.click();
  const dialog = page.locator("dialog[open]").last();
  const [year, month, day] = date.split("-");
  await dialog.getByLabel("Ano", { exact: true }).fill(year);
  await dialog.getByLabel("Mês", { exact: true }).fill(month);
  await dialog.getByLabel("Dia", { exact: true }).fill(day);
  await dialog.getByRole("button", { name: "Confirmar", exact: true }).click();
}
