import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { BVDatePicker, BVSelectSheet } from "./BVPicker";
import { chooseOption } from "../test/pickers";
it("stages options, cancels with Back without changing the form, confirms and resets uncontrolled values", async () => {
  const user = userEvent.setup(),
    change = vi.fn();
  render(
    <form aria-label="Foco">
      <label>
        Duração do foco
        <BVSelectSheet name="duration" defaultValue="25" onChange={change}>
          <option value="15">15 minutos</option>
          <option value="25">25 minutos</option>
          <option disabled value="45">
            45 minutos
          </option>
        </BVSelectSheet>
      </label>
      <button type="reset">Reiniciar</button>
    </form>,
  );
  const trigger = screen.getByRole("combobox", { name: /Duração do foco/ });
  expect(document.querySelector("select")).toBeNull();
  await user.click(trigger);
  await user.click(screen.getByRole("radio", { name: "15 minutos" }));
  expect(screen.getByRole("radio", { name: "45 minutos" })).toBeDisabled();
  const back = new Event("biblioteca-viva:native-back", { cancelable: true });
  fireEvent(window, back);
  expect(back.defaultPrevented).toBe(true);
  expect(change).not.toHaveBeenCalled();
  expect(trigger).toHaveFocus();
  const form = screen.getByRole("form");
  if (!(form instanceof HTMLFormElement)) throw new Error("form");
  expect(new FormData(form).get("duration")).toBe("25");
  await chooseOption(user, trigger, "15");
  expect(new FormData(form).get("duration")).toBe("15");
  expect(change).toHaveBeenCalledWith({ target: { value: "15" } });
  await user.click(screen.getByRole("button", { name: "Reiniciar" }));
  expect(new FormData(form).get("duration")).toBe("25");
});
it("validates civil dates, leap days, bounds, optional clearing and cancellation without a native date input", async () => {
  const user = userEvent.setup(),
    change = vi.fn();
  render(
    <label>
      Dia
      <BVDatePicker
        name="day"
        defaultValue="2028-02-29"
        min="2028-02-01"
        max="2028-03-15"
        onChange={change}
      />
    </label>,
  );
  const trigger = screen.getByLabelText("Dia", { selector: "button" });
  await user.click(trigger);
  expect(document.querySelector('input[type="date"]')).toBeNull();
  expect(
    within(screen.getByRole("dialog")).getByRole("button", {
      name: "29/02/2028",
    }),
  ).toHaveAttribute("aria-pressed", "true");
  const year = screen.getByLabelText("Ano");
  await user.clear(year);
  await user.type(year, "2027");
  await user.tab();
  expect(screen.getByRole("button", { name: "Confirmar" })).toBeDisabled();
  await user.click(screen.getByRole("button", { name: "Cancelar" }));
  expect(trigger).toHaveTextContent("29/02/2028");
  await user.click(trigger);
  await user.click(screen.getByRole("button", { name: "Próximo mês" }));
  expect(screen.getByRole("button", { name: "16/03/2028" })).toBeDisabled();
  await user.click(screen.getByRole("button", { name: "15/03/2028" }));
  await user.click(screen.getByRole("button", { name: "Confirmar" }));
  expect(change).toHaveBeenLastCalledWith({ target: { value: "2028-03-15" } });
  expect(trigger).toHaveTextContent("15/03/2028");
  await user.click(trigger);
  await user.click(screen.getByRole("button", { name: "Sem data" }));
  await user.click(screen.getByRole("button", { name: "Confirmar" }));
  expect(change).toHaveBeenLastCalledWith({ target: { value: "" } });
});
it("owns Back before a parent modal or page guard", async () => {
  const user = userEvent.setup(),
    parent = vi.fn();
  render(
    <dialog open aria-label="Ateliê">
      <label>
        Escolha
        <BVSelectSheet>
          <option value="a">A</option>
          <option value="b">B</option>
        </BVSelectSheet>
      </label>
    </dialog>,
  );
  window.addEventListener("biblioteca-viva:native-back", parent);
  try {
    await user.click(screen.getByRole("combobox"));
    const top = screen.getAllByRole("dialog").at(-1);
    if (!top) throw new Error("dialog");
    expect(within(top).getByRole("button", { name: "Cancelar" })).toBeVisible();
    fireEvent(
      window,
      new Event("biblioteca-viva:native-back", { cancelable: true }),
    );
    expect(parent).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "Ateliê" })).toBeVisible();
  } finally {
    window.removeEventListener("biblioteca-viva:native-back", parent);
  }
});
it("opens only the first missing required date and keeps the second required date invalid", async () => {
  const user = userEvent.setup();
  render(
    <form aria-label="Plano">
      <label>
        Início
        <BVDatePicker name="start" required />
      </label>
      <label>
        Fim
        <BVDatePicker name="end" required />
      </label>
      <button type="submit">Salvar</button>
    </form>,
  );
  await user.click(screen.getByRole("button", { name: "Salvar" }));
  expect(screen.getAllByRole("dialog")).toHaveLength(1);
  expect(screen.getByRole("dialog")).toHaveAccessibleName("Início");
  expect(
    screen.queryByRole("button", { name: "Sem data" }),
  ).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Confirmar" })).toBeDisabled();
  await user.click(screen.getByRole("button", { name: "Cancelar" }));
  expect(screen.getByLabelText("Início")).toHaveFocus();
});
