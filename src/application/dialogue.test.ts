// @vitest-environment node
import { describe, expect, it } from "vitest";

import { PROTOTYPE_CONTENT } from "../content";
import {
  DialogueSelector,
  EMPTY_DIALOGUE_HISTORY,
  type DialogueFacts,
  type DialogueHistory,
} from "./dialogue";

const now = "2026-08-10T12:00:00.000Z";
const neutralFacts: DialogueFacts = {
  completedBooks: 0,
  inProgressBooks: 0,
  totalBooks: 2,
};

function select(
  facts: DialogueFacts = neutralFacts,
  history: DialogueHistory = EMPTY_DIALOGUE_HISTORY,
) {
  return new DialogueSelector().select({
    catalog: PROTOTYPE_CONTENT,
    event: "librarian.interaction",
    facts,
    history,
    now,
  });
}

describe("DialogueSelector", () => {
  it("faz seleção básica para biblioteca vazia", () => {
    expect(
      select({ completedBooks: 0, inProgressBooks: 0, totalBooks: 0 }).id,
    ).toBe("dialogue.librarian.empty");
  });

  it("prioriza primeira conclusão sobre primeiro livro", () => {
    expect(
      select({ completedBooks: 1, inProgressBooks: 0, totalBooks: 1 }).id,
    ).toBe("dialogue.librarian.first-completion");
  });

  it("resolve empate deterministicamente por uso mais antigo e ID", () => {
    expect(select().id).toBe("dialogue.librarian.general-light");
    expect(
      select(neutralFacts, {
        lastShownAt: {
          "dialogue.librarian.general-light": "2026-08-10T11:59:30.000Z",
        },
        shownOnceIds: [],
      }).id,
    ).toBe("dialogue.librarian.general-patience");
  });

  it("aceita condições satisfeitas e rejeita as não satisfeitas", () => {
    expect(
      select({ completedBooks: 0, inProgressBooks: 1, totalBooks: 3 }).id,
    ).toBe("dialogue.librarian.in-progress");
    expect(select(neutralFacts).id).not.toBe("dialogue.librarian.in-progress");
  });

  it("não repete fala once presente no histórico", () => {
    expect(
      select(
        { completedBooks: 1, inProgressBooks: 0, totalBooks: 1 },
        {
          lastShownAt: {},
          shownOnceIds: ["dialogue.librarian.first-completion"],
        },
      ).id,
    ).toBe("dialogue.librarian.first-book");
  });

  it("aplica cooldown e permite repetição depois do período", () => {
    const facts = { completedBooks: 0, inProgressBooks: 0, totalBooks: 0 };
    expect(
      select(facts, {
        lastShownAt: {
          "dialogue.librarian.empty": "2026-08-10T11:00:00.000Z",
        },
        shownOnceIds: [],
      }).id,
    ).not.toBe("dialogue.librarian.empty");
    expect(
      select(facts, {
        lastShownAt: {
          "dialogue.librarian.empty": "2026-08-10T05:59:59.000Z",
        },
        shownOnceIds: [],
      }).id,
    ).toBe("dialogue.librarian.empty");
  });

  it("usa fallback explícito quando nenhum candidato específico está livre", () => {
    const lastShownAt = Object.fromEntries(
      PROTOTYPE_CONTENT.dialogues
        .filter(
          ({ id, events }) =>
            id !== "dialogue.librarian.fallback" &&
            events.includes("librarian.interaction"),
        )
        .map(({ id }) => [id, now]),
    );
    expect(
      select(
        { completedBooks: 0, inProgressBooks: 0, totalBooks: 0 },
        { lastShownAt, shownOnceIds: [] },
      ).id,
    ).toBe("dialogue.librarian.fallback");
  });

  it("aceita histórico vazio e seleciona evento reutilizável de conclusão", () => {
    const selected = new DialogueSelector().select({
      catalog: PROTOTYPE_CONTENT,
      event: "book.first-completed",
      facts: { completedBooks: 1, inProgressBooks: 0, totalBooks: 1 },
      history: EMPTY_DIALOGUE_HISTORY,
      now,
    });
    expect(selected.id).toBe("dialogue.librarian.first-completion");
  });
});
