/** Equality for immutable, renderer-neutral plain snapshots; no serialization. */
export function equalSnapshot(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) && Array.isArray(right))
    return (
      left.length === right.length &&
      left.every((value, i) => equalSnapshot(value, right[i]))
    );
  if (
    left === null ||
    right === null ||
    typeof left !== "object" ||
    typeof right !== "object"
  )
    return false;
  const a = Object.entries(left);
  const b = Object.entries(right);
  return (
    a.length === b.length &&
    a.every(
      ([key, value]) =>
        Object.hasOwn(right, key) &&
        equalSnapshot(value, Reflect.get(right, key)),
    )
  );
}

import type { LibraryWorldSnapshot } from "./libraryWorldEntryContract";

/** Only inputs consumed by scene construction. Progress remains current in React. */
export function worldSceneIdentity(
  snapshot: LibraryWorldSnapshot | undefined,
): unknown {
  if (!snapshot) return undefined;
  return {
    categories: snapshot.categories.map((category) => ({
      type: category.type,
      entries: category.entries.map((entry) => ({
        entryId: entry.entryId,
        instanceId: entry.instanceId,
        modelTypeId: entry.modelTypeId,
        ...(category.type === "book"
          ? {
              title: entry.title,
              author: "author" in entry ? entry.author : undefined,
            }
          : {}),
      })),
    })),
    scrolls: snapshot.scrolls?.map((scroll) => ({
      id: scroll.id,
      annotationId: scroll.annotationId,
      entryId: scroll.entryId,
      kind: scroll.kind,
      category: scroll.category,
    })),
  };
}
