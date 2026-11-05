import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { chooseOption } from "../../test/pickers";
import { PhysicalProfilePanel } from "./PhysicalProfilePanel";
it("saves and removes presentation without requiring weight or gender and retains voluntary gender independently", async () => {
  const user = userEvent.setup();
  const profile = {
    load: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
  };
  render(<PhysicalProfilePanel profile={profile} />);
  await screen.findByRole("button", { name: "Salvar perfil" });
  await chooseOption(
    user,
    screen.getByLabelText("Apresentação do atlas"),
    "female",
  );
  await user.click(screen.getByRole("button", { name: "Salvar perfil" }));
  await screen.findByText("Perfil salvo neste dispositivo.");
  expect(profile.save).toHaveBeenLastCalledWith({
    weightKg: undefined,
    gender: undefined,
    atlas: "female",
  });
  await chooseOption(user, screen.getByLabelText("Gênero (opcional)"), "male");
  await user.click(screen.getByRole("button", { name: "Salvar perfil" }));
  expect(profile.save).toHaveBeenLastCalledWith({
    weightKg: undefined,
    gender: "male",
    atlas: "female",
  });
  await user.click(screen.getByRole("button", { name: "Remover perfil" }));
  await screen.findByText(/Perfil removido/);
  expect(profile.save).toHaveBeenLastCalledWith(undefined);
  expect(screen.getByLabelText("Gênero (opcional)")).toHaveTextContent(
    "Não preenchido",
  );
  expect(screen.getByLabelText("Apresentação do atlas")).toHaveTextContent(
    "Automático",
  );
});
