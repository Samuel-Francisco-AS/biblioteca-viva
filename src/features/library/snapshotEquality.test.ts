import { expect, it } from "vitest";
import { equalSnapshot, worldSceneIdentity } from "./snapshotEquality";
import { projectLibraryWorldEntries } from "./libraryWorldEntries";
import { createBook } from "../../domain";
it("keeps semantic updates separate from physical reconstruction without ignoring identities", () => {
  const book = createBook({
    id: "fixture",
    title: "Fictício",
    createdAt: "2026-11-07T12:00:00.000Z",
  });
  const a = projectLibraryWorldEntries([book]);
  const b = projectLibraryWorldEntries([{ ...book, currentPage: 12 }]);
  expect(equalSnapshot(a, b)).toBe(false);
  expect(equalSnapshot(worldSceneIdentity(a), worldSceneIdentity(b))).toBe(
    true,
  );
  expect(
    equalSnapshot(
      worldSceneIdentity(a),
      worldSceneIdentity(projectLibraryWorldEntries([])),
    ),
  ).toBe(false);
  expect(
    equalSnapshot(
      worldSceneIdentity(a),
      worldSceneIdentity(
        projectLibraryWorldEntries([{ ...book, title: "Outro" }]),
      ),
    ),
  ).toBe(false);
  expect(equalSnapshot({ x: undefined }, {})).toBe(false);
});
