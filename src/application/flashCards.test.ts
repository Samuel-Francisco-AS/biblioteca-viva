import { DexieArcanariumRepository } from "../infrastructure/database/arcanariumRepository";
// @vitest-environment node
import "fake-indexeddb/auto";
import Dexie from "dexie";
import { afterEach, expect, it, vi } from "vitest";
import { createStudy, createMovie } from "../domain";
import { BibliotecaDatabase } from "../infrastructure/database/database";
import { DexieLibraryEntryRepository } from "../infrastructure/database/repositories";
import { DexieTransactionRunner } from "../infrastructure/database/transactionRunner";
import { SaveFlashCard, DeleteFlashCard } from "./flashCards";
const names: string[] = [];
afterEach(async () => {
  await Promise.all(names.splice(0).map((name) => Dexie.delete(name)));
});
it("stores editable cards on their study, rejects foreign/blank input, preserves newlines, and publishes only after commit", async () => {
  const name = `flash-cards-${crypto.randomUUID()}`;
  names.push(name);
  const db = new BibliotecaDatabase(name);
  await db.open();
  const entries = new DexieLibraryEntryRepository(db);
  const now = "2026-11-04T12:00:00.000Z";
  await entries.save(
    createStudy({
      id: "study",
      title: "Cartas fictícias",
      progressUnit: "topics",
      createdAt: now,
    }),
  );
  await entries.save(
    createMovie({ id: "film", title: "Filme fictício", createdAt: now }),
  );
  const publish = vi.fn(async () => {
    expect(Dexie.currentTransaction).toBeNull();
    expect((await entries.getById("study"))?.revision).toBeGreaterThan(1);
  });
  let sequence = 0;
  const deps = {
    arcanarium: new DexieArcanariumRepository(db),
    libraryEntries: entries,
    transaction: new DexieTransactionRunner(db),
    clock: { now: () => Promise.resolve(now) },
    ids: { generate: () => Promise.resolve(`card-${++sequence}`) },
    events: { publish },
  };
  const save = new SaveFlashCard(deps);
  const first = await save.execute({
    entryId: "study",
    front: "A pista?",
    back: "Um verso\ncom duas linhas",
  });
  expect(first.flashCards).toHaveLength(1);
  const cardId = first.flashCards![0].id;
  await save.execute({
    entryId: "study",
    front: "Outra pista?",
    back: "Outra resposta",
  });
  const edited = await save.execute({
    entryId: "study",
    cardId,
    front: "Pista revista",
    back: "Um verso\ncom duas linhas",
  });
  expect(edited.flashCards).toHaveLength(2);
  expect(edited.flashCards![0].back).toContain("\n");
  db.close();
  await db.open();
  expect(await entries.getById("study")).toMatchObject({
    flashCards: edited.flashCards,
  });
  await expect(
    save.execute({ entryId: "film", front: "Pista", back: "Resposta" }),
  ).rejects.toMatchObject({ code: "NOT_FOUND" });
  await expect(
    save.execute({ entryId: "study", front: " ", back: "Resposta" }),
  ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  await expect(
    save.execute({
      entryId: "study",
      cardId: "missing",
      front: "Pista",
      back: "Resposta",
    }),
  ).rejects.toMatchObject({ code: "NOT_FOUND" });
  expect(publish).toHaveBeenCalledTimes(3);
  const removed = await new DeleteFlashCard(deps).execute({
    entryId: "study",
    cardId,
  });
  expect(removed.flashCards).toHaveLength(1);
  const before = await entries.getById("study");
  const failedPublish = vi.fn();
  const failing = new SaveFlashCard({
    ...deps,
    events: { publish: failedPublish },
    transaction: {
      run: (operation) =>
        deps.transaction.run(async () => {
          await operation();
          throw new Error("rollback");
        }),
    },
  });
  await expect(
    failing.execute({
      entryId: "study",
      front: "Não guardar",
      back: "Falha fictícia",
    }),
  ).rejects.toMatchObject({ code: "PERSISTENCE_FAILED" });
  expect(await entries.getById("study")).toEqual(before);
  expect(failedPublish).not.toHaveBeenCalled();
  db.close();
});
