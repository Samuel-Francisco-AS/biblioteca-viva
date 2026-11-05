import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
export async function chooseOption(
  user: ReturnType<typeof userEvent.setup>,
  trigger: HTMLElement,
  value: string,
) {
  await user.click(trigger);
  const dialog = screen.getAllByRole("dialog").at(-1);
  if (!dialog) throw new Error("Seletor não abriu");
  const option = within(dialog)
    .getAllByRole("radio")
    .find((node) => node instanceof HTMLInputElement && node.value === value);
  if (!option) throw new Error(`Opção ausente: ${value}`);
  await user.click(option);
  await user.click(within(dialog).getByRole("button", { name: "Confirmar" }));
}

export async function chooseDate(
  user: ReturnType<typeof userEvent.setup>,
  trigger: HTMLElement,
  date: string,
) {
  await user.click(trigger);
  const dialog = screen.getAllByRole("dialog").at(-1);
  if (!dialog) throw new Error("Calendário não abriu");
  for (const [i, label] of ["Ano", "Mês", "Dia"].entries()) {
    const field = within(dialog).getByLabelText(label, { exact: true });
    await user.clear(field);
    await user.type(field, date.split("-")[i]);
  }
  await user.tab();
  await user.click(within(dialog).getByRole("button", { name: "Confirmar" }));
}
