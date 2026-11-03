import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { NarrativePanel } from "./NarrativePanel";
import { NarrativeSession } from "./narrative/session";
it("supports keyboard choices, focus, interruption, completion and journal with no WebGL", async () => {
  const session = new NarrativeSession(),
    user = userEvent.setup();
  render(<NarrativePanel session={session} failed />);
  await user.click(screen.getByRole("button", { name: /Diário de histórias/ }));
  const journal = screen.getByRole("complementary", {
    name: "Diário de quests",
  });
  const story = within(journal)
    .getByText("As Cinzas do Caderno")
    .closest("li")!;
  await user.click(
    within(story).getByRole("button", { name: "Descobrir história" }),
  );
  expect(screen.getByRole("heading", { name: "Samael" })).toHaveFocus();
  const dialog = screen.getByRole("article", { name: "Conversa RPG" });
  expect(within(dialog).getAllByRole("button")).toHaveLength(4);
  expect(dialog).toHaveTextContent("nenhuma animação é confirmada");
  await user.click(
    screen.getByRole("button", { name: /Investigar com discrição/ }),
  );
  const objective = session.getSnapshot().quests.ashes.nodeId;
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("article")).not.toBeInTheDocument();
  act(() => session.open("ashes"));
  expect(session.getSnapshot().quests.ashes.nodeId).toBe(objective);
  for (const name of [
    /Examinar o braseiro/,
    /Entregar a prova/,
    /Guardar o episódio/,
  ])
    await user.click(screen.getByRole("button", { name }));
  expect(session.getSnapshot().quests.ashes.status).toBe("resolved");
  await user.click(
    screen.getByRole("button", { name: "Guardar o epílogo no diário" }),
  );
  expect(
    screen.getByRole("complementary", { name: "Diário de quests" }),
  ).toHaveTextContent("companhia discreta");
  expect(
    screen.getByRole("button", { name: /Diário de histórias · 1\/5/ }),
  ).toBeInTheDocument();
  expect(document.querySelector("input, textarea, canvas")).toBeNull();
  session.dispose();
});
