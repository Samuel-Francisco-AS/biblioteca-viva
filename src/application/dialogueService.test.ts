// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";

import { ContentLocalizer, PROTOTYPE_CONTENT } from "../content";
import type { Clock } from "./ports";
import {
  DialogueSelector,
  DialogueService,
  type DialogueErrorReporter,
  type DialogueHistory,
  type DialogueHistoryPort,
} from "./dialogue";

class FakeClock implements Clock {
  value = "2026-08-10T12:00:00.000Z";
  now(): Promise<string> {
    return Promise.resolve(this.value);
  }
}

class FakeHistory implements DialogueHistoryPort {
  stored?: DialogueHistory;
  failLoad = false;
  failSave = false;
  readonly saves: DialogueHistory[] = [];

  load(): Promise<DialogueHistory | undefined> {
    if (this.failLoad) return Promise.reject(new Error("private load error"));
    return Promise.resolve(this.stored);
  }

  save(history: DialogueHistory): Promise<void> {
    if (this.failSave) return Promise.reject(new Error("private save error"));
    this.stored = history;
    this.saves.push(history);
    return Promise.resolve();
  }
}

describe("DialogueService", () => {
  let clock: FakeClock;
  let history: FakeHistory;
  let warnings: string[];
  let service: DialogueService;

  beforeEach(() => {
    clock = new FakeClock();
    history = new FakeHistory();
    warnings = [];
    const reporter: DialogueErrorReporter = {
      warn: (code) => warnings.push(code),
    };
    service = new DialogueService(
      PROTOTYPE_CONTENT,
      new DialogueSelector(),
      new ContentLocalizer(PROTOTYPE_CONTENT),
      history,
      clock,
      reporter,
    );
  });

  it.each([
    [
      { completedBooks: 0, inProgressBooks: 0, totalBooks: 0 },
      "dialogue.librarian.empty",
    ],
    [
      { completedBooks: 0, inProgressBooks: 0, totalBooks: 1 },
      "dialogue.librarian.first-book",
    ],
    [
      { completedBooks: 0, inProgressBooks: 1, totalBooks: 2 },
      "dialogue.librarian.in-progress",
    ],
    [
      { completedBooks: 1, inProgressBooks: 0, totalBooks: 1 },
      "dialogue.librarian.first-completion",
    ],
  ] as const)("resolve contexto da Biblioteca para %s", async (facts, id) => {
    await service.loadHistory();
    await service.enterLibrary(facts);
    await expect(
      service.select("librarian.interaction"),
    ).resolves.toMatchObject({ id, locale: "pt-BR" });
  });

  it("reconhece retorno após alguns dias sem guardar fatos pessoais", async () => {
    history.stored = {
      lastLibraryVisitAt: "2026-08-05T12:00:00.000Z",
      lastShownAt: {},
      shownOnceIds: [],
    };
    await service.loadHistory();
    await service.enterLibrary({
      completedBooks: 0,
      inProgressBooks: 0,
      totalBooks: 2,
    });
    const dialogue = await service.select("librarian.interaction");
    expect(dialogue.id).toBe("dialogue.librarian.return-after-days");
    expect(JSON.stringify(history.stored)).not.toMatch(
      /title|author|note|quote|content/iu,
    );
  });

  it("preserva o contexto de retorno em entradas repetidas na mesma sessão", async () => {
    history.stored = {
      lastLibraryVisitAt: "2026-08-05T12:00:00.000Z",
      lastShownAt: {},
      shownOnceIds: [],
    };
    await service.loadHistory();
    await Promise.all([
      service.enterLibrary({
        completedBooks: 0,
        inProgressBooks: 0,
        totalBooks: 2,
      }),
      service.enterLibrary({
        completedBooks: 0,
        inProgressBooks: 0,
        totalBooks: 2,
      }),
    ]);

    await expect(
      service.select("librarian.interaction"),
    ).resolves.toMatchObject({ id: "dialogue.librarian.return-after-days" });
    expect(history.saves).toHaveLength(2);
  });

  it("seleciona respostas distintas da criatura", async () => {
    await service.loadHistory();
    await service.enterLibrary({
      completedBooks: 0,
      inProgressBooks: 0,
      totalBooks: 0,
    });
    const first = await service.select("creature.interaction");
    const second = await service.select("creature.interaction");
    expect(first.characterId).toBe("character.creature");
    expect(second.id).not.toBe(first.id);
  });

  it("registra once antes da próxima seleção e não duplica o ID", async () => {
    await service.loadHistory();
    await service.enterLibrary({
      completedBooks: 1,
      inProgressBooks: 0,
      totalBooks: 1,
    });
    const [first, second] = await Promise.all([
      service.select("librarian.interaction"),
      service.select("librarian.interaction"),
    ]);
    expect(first.id).toBe("dialogue.librarian.first-completion");
    expect(second.id).toBe("dialogue.librarian.first-book");
    expect(
      history.stored?.shownOnceIds.filter(
        (id) => id === "dialogue.librarian.first-completion",
      ),
    ).toHaveLength(1);
  });

  it("degrada falhas de carregar e salvar sem expor detalhes", async () => {
    history.failLoad = true;
    await expect(service.loadHistory()).resolves.toBeUndefined();
    history.failSave = true;
    await expect(
      service.enterLibrary({
        completedBooks: 0,
        inProgressBooks: 0,
        totalBooks: 0,
      }),
    ).resolves.toBeUndefined();
    await expect(
      service.select("librarian.interaction"),
    ).resolves.toMatchObject({ characterId: "character.librarian" });
    expect(warnings).toEqual([
      "DIALOGUE_HISTORY_LOAD_FAILED",
      "DIALOGUE_HISTORY_SAVE_FAILED",
      "DIALOGUE_HISTORY_SAVE_FAILED",
    ]);
    expect(warnings.join(" ")).not.toContain("private");
  });
});
