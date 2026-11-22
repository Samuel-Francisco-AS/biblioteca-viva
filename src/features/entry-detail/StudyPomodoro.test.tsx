import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import { createStudy } from "../../domain";
import type { SessionApplication } from "../sessions/SessionPanel";
import { StudyPomodoro } from "./StudyPomodoro";

it("removes the redundant focus instruction while keeping duration and start working", () => {
  const entry = createStudy({
    id: "study-focus-design",
    title: "Matemática",
    progressUnit: "hours",
    createdAt: "2026-11-11T12:00:00.000Z",
  });
  const startSession = vi.fn().mockResolvedValue(undefined);
  const act = vi.fn(async (operation: () => Promise<unknown>) => {
    await operation();
  });
  const application = {
    commands: { startSession: { execute: startSession } },
  } as unknown as SessionApplication;
  const view = render(
    <MemoryRouter>
      <StudyPomodoro
        application={application}
        entry={entry}
        loading={false}
        busy={false}
        act={act}
      />
    </MemoryRouter>,
  );
  expect(
    screen.getByRole("heading", { name: "Acenda seu foco" }),
  ).toBeVisible();
  expect(screen.getByLabelText("Duração do foco")).toBeInTheDocument();
  expect(
    screen.getByRole("timer", { name: "Tempo restante" }),
  ).toHaveTextContent("25:00");
  expect(
    screen.queryByText(/Pode apagar a tela ou sair do app/),
  ).not.toBeInTheDocument();
  expect(view.container.querySelector(".study-hint")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Iniciar foco" }));
  expect(act).toHaveBeenCalledOnce();
  expect(startSession).toHaveBeenCalledWith({
    entryId: entry.id,
    entryType: "study",
    focusDurationSeconds: 25 * 60,
  });
});
