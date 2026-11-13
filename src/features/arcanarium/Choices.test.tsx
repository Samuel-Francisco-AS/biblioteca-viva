import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { Choices } from "./Choices";

it("keeps six named native choices, selection and keyboard groups independent", async () => {
  const options = [
    "Área",
    "Disciplina",
    "Assunto",
    "Subassunto",
    "Habilidade",
    "Etiqueta pessoal",
  ].map((label) => ({ label, value: label }));
  function Form() {
    const [level, setLevel] = useState("Área");
    return (
      <>
        <Choices
          label="Nível"
          value={level}
          options={options}
          onChange={setLevel}
        />
        <Choices
          label="Outro filtro"
          value="Área"
          options={options}
          onChange={() => {}}
        />
      </>
    );
  }
  const user = userEvent.setup();
  render(<Form />);
  const group = within(screen.getByRole("group", { name: "Nível" }));
  expect(group.getAllByRole("radio")).toHaveLength(6);
  await user.click(group.getByRole("radio", { name: "Assunto" }));
  expect(group.getByRole("radio", { name: "Assunto" })).toBeChecked();
  await user.keyboard("{ArrowRight}");
  expect(group.getByRole("radio", { name: "Subassunto" })).toBeChecked();
  expect(
    within(screen.getByRole("group", { name: "Outro filtro" })).getByRole(
      "radio",
      { name: "Área" },
    ),
  ).toBeChecked();
});
