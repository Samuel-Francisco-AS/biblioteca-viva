import { Group } from "three";

import type { ReadingAreaBook } from "../readingAreaBookContract";
import {
  createProceduralBookVolume,
  type ProceduralBookVolume,
} from "./proceduralContent";
import type { ProceduralComposition } from "./proceduralComposition";
import {
  assignReadingAreaBooksToSlots,
  createReadingAreaBookSlots,
  type ReadingAreaBookPlacement,
} from "./readingAreaBookLayout";

export interface ReadingAreaBookVisual {
  readonly book: ReadingAreaBook;
  node: Group;
  placement: ReadingAreaBookPlacement;
  representation: ProceduralBookVolume;
}

export interface ReadingAreaBookReconciliation {
  readonly added: readonly ReadingAreaBookVisual[];
  readonly removed: readonly ReadingAreaBookVisual[];
  readonly visible: readonly ReadingAreaBookVisual[];
}

/** Validates only the renderer boundary required for factory and selection. */
export function validateReadingAreaBookSnapshot(
  books: readonly ReadingAreaBook[],
): void {
  const instanceIds = new Set<string>();
  for (const book of books) {
    if (typeof book.instanceId !== "string" || book.instanceId.trim() === "") {
      throw new Error("O runtime exige ReadingAreaBook.instanceId não vazio.");
    }
    if (typeof book.entryId !== "string" || book.entryId.trim() === "") {
      throw new Error("O runtime exige ReadingAreaBook.entryId não vazio.");
    }
    if (book.modelTypeId !== "book-volume") {
      throw new Error(
        "O runtime exige ReadingAreaBook.modelTypeId: book-volume.",
      );
    }
    if (instanceIds.has(book.instanceId)) {
      throw new Error(
        `O runtime recebeu ReadingAreaBook.instanceId duplicado: ${book.instanceId}.`,
      );
    }
    instanceIds.add(book.instanceId);
  }
}

function currentSlots(composition: ProceduralComposition) {
  return createReadingAreaBookSlots(
    composition.instances.map(({ identity, variant }) =>
      Object.freeze({ hostInstanceId: identity.instanceId, variant }),
    ),
  );
}

function createVisual(
  book: ReadingAreaBook,
  placement: ReadingAreaBookPlacement,
  composition: ProceduralComposition,
): ReadingAreaBookVisual {
  const host = composition.instances.find(
    ({ identity }) => identity.instanceId === placement.hostInstanceId,
  );
  if (!host) {
    throw new Error(
      `O layout aponta para estante ausente: ${placement.hostInstanceId}.`,
    );
  }
  const representation = createProceduralBookVolume({
    entryId: book.entryId,
    instanceId: book.instanceId,
    modelTypeId: "book-volume",
  });
  const node = new Group();
  node.name = "procedural-reading-area-book";
  node.userData.readingAreaBookInstanceId = book.instanceId;
  node.position.set(...placement.position);
  node.add(representation.root);
  host.node.add(node);
  return { book, node, placement, representation };
}

/**
 * Reconciles visual occurrences from the immutable logical snapshot. Existing
 * visible books retain their wrapper and representation; overflow owns no root.
 */
export function reconcileReadingAreaBookVisuals(
  composition: ProceduralComposition,
  books: readonly ReadingAreaBook[],
  existing: ReadonlyMap<string, ReadingAreaBookVisual>,
): ReadingAreaBookReconciliation {
  const assignment = assignReadingAreaBooksToSlots(
    books,
    currentSlots(composition),
  );
  const placements = new Map(
    assignment.placements.map((placement) => [placement.instanceId, placement]),
  );
  const next = new Map<string, ReadingAreaBookVisual>();
  const added: ReadingAreaBookVisual[] = [];
  const removed: ReadingAreaBookVisual[] = [];

  for (const book of books) {
    const placement = placements.get(book.instanceId);
    if (!placement) continue;
    const current = existing.get(book.instanceId);
    if (!current) {
      const visual = createVisual(book, placement, composition);
      next.set(book.instanceId, visual);
      added.push(visual);
      continue;
    }
    const host = composition.instances.find(
      ({ identity }) => identity.instanceId === placement.hostInstanceId,
    );
    if (!host) {
      throw new Error(
        `O layout aponta para estante ausente: ${placement.hostInstanceId}.`,
      );
    }
    host.node.add(current.node);
    current.node.position.set(...placement.position);
    current.placement = placement;
    next.set(book.instanceId, current);
  }

  for (const [instanceId, visual] of existing) {
    if (next.has(instanceId)) continue;
    removed.push(visual);
  }

  return Object.freeze({
    added: Object.freeze(added),
    removed: Object.freeze(removed),
    visible: Object.freeze(
      assignment.placements.flatMap((placement) => {
        const visual = next.get(placement.instanceId);
        return visual ? [visual] : [];
      }),
    ),
  });
}
