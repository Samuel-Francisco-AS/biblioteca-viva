import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import type { QuestProbeEvent } from "./three/performanceProbe";
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

it("consumes native Back for the journal and active conversation", async () => {
  const session = new NarrativeSession();
  const user = userEvent.setup();
  render(<NarrativePanel session={session} failed />);
  await user.click(screen.getByRole("button", { name: /Diário de histórias/ }));
  const back = new Event("biblioteca-viva:native-back", { cancelable: true });
  act(() => {
    window.dispatchEvent(back);
  });
  expect(back.defaultPrevented).toBe(true);
  expect(
    screen.queryByRole("complementary", { name: "Diário de quests" }),
  ).not.toBeInTheDocument();
  act(() => session.open("ashes"));
  const dialogueBack = new Event("biblioteca-viva:native-back", {
    cancelable: true,
  });
  act(() => {
    window.dispatchEvent(dialogueBack);
  });
  expect(dialogueBack.defaultPrevented).toBe(true);
  expect(session.getSnapshot().active).toBeNull();
  session.dispose();
});

it("R5Q observes DOM commit, accessible focus and card animation without changing narrative", () => {
  const session = new NarrativeSession();
  const observeQuest = vi.fn<(event: QuestProbeEvent) => void>();
  render(
    <NarrativePanel
      session={session}
      failed={false}
      questProbe={{ observeQuest }}
    />,
  );
  act(() => session.talk("aryn"));
  expect(screen.getByRole("heading", { name: "Aryn" })).toHaveFocus();
  expect(
    observeQuest.mock.calls.map(([event]) =>
      event.type === "mark" ? event.stage : event.type,
    ),
  ).toEqual(["reactCommit", "focusStart", "focusEnd"]);
  const card = screen.getByRole("article", { name: "Conversa RPG" });
  // jsdom exposes WebkitAnimation but no AnimationEvent, so React registers
  // its vendor-prefixed event names here. Chromium covers native CSS events.
  fireEvent(card, new Event("webkitAnimationStart", { bubbles: true }));
  fireEvent(card, new Event("webkitAnimationEnd", { bubbles: true }));
  expect(observeQuest).toHaveBeenLastCalledWith({
    type: "mark",
    stage: "animationEnd",
    inhabitant: "aryn",
  });
  const count = observeQuest.mock.calls.length;
  fireEvent(
    card.querySelector("h3")!,
    new Event("webkitAnimationStart", { bubbles: true }),
  );
  expect(observeQuest).toHaveBeenCalledTimes(count);
  act(() => session.close());
  expect(
    screen.queryByRole("article", { name: "Conversa RPG" }),
  ).not.toBeInTheDocument();
  session.dispose();
});
