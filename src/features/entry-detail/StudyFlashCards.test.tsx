import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { createStudy, type StudyEntry } from "../../domain";
import { StudyFlashCards } from "./StudyFlashCards";

it("reveals the back, advances with a slide, revisits missed cards, and keeps drafts after persistence failure", async () => {
  const entry: StudyEntry = {
    ...createStudy({
      id: "study",
      title: "Estudo fictício",
      progressUnit: "hours",
      createdAt: "2026-11-04T12:00:00.000Z",
    }),
    flashCards: [
      {
        id: "a",
        globalCardId: "global:a",
        revision: 1,
        front: "Uma pista?",
        back: "Uma descoberta",
      },
    ],
  };
  const save = vi.fn().mockRejectedValue(new Error("failed"));
  render(
    <StudyFlashCards
      entry={entry}
      onChange={vi.fn()}
      application={{
        arcanarium: {
          startReview: vi.fn().mockResolvedValue({ id: "review" }),
          answerReview: vi.fn().mockResolvedValue({}),
        },
        commands: {
          saveFlashCard: { execute: save },
          deleteFlashCard: { execute: vi.fn() },
        },
      }}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Revisar cartas" }));
  const front = await screen.findByRole("button", {
    name: /Pergunta: Uma pista/,
  });
  expect(front).toHaveAttribute("aria-pressed", "false");
  expect(screen.getByRole("button", { name: "Lembrei →" })).toBeDisabled();
  fireEvent.click(front);
  expect(
    screen.getByRole("button", { name: /Resposta: Uma descoberta/ }),
  ).toHaveAttribute("data-flipped", "true");
  fireEvent.click(screen.getByRole("button", { name: "Rever depois →" }));
  expect(
    await screen.findByText(
      "0 de 1 cartas lembradas. As outras merecem um reencontro.",
    ),
  ).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Revisitar 1 cartas" }));
  fireEvent.click(
    await screen.findByRole("button", { name: /Pergunta: Uma pista/ }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Lembrei →" }));
  expect(await screen.findByText(/1 de 1 cartas lembradas/)).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Encerrar revisão" }));
  fireEvent.click(screen.getByText("Inscrever uma nova carta"));
  fireEvent.change(screen.getByLabelText("Frente · pergunta ou pista"), {
    target: { value: "Novo rascunho" },
  });
  fireEvent.change(screen.getByLabelText("Verso · resposta ou descoberta"), {
    target: { value: "Verso preservado" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Guardar carta" }));
  await waitFor(() => expect(screen.getByRole("alert")).toBeVisible());
  expect(screen.getByLabelText("Frente · pergunta ou pista")).toHaveValue(
    "Novo rascunho",
  );
  expect(screen.getByLabelText("Verso · resposta ou descoberta")).toHaveValue(
    "Verso preservado",
  );
});
