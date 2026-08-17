import { describe, expect, it } from "vitest";
import { RESIDENT_CATALOG, residentForRoom } from "./residentCatalog";

describe("resident catalog", () => {
  it("mantém as cinco identidades e suas salas", () => {
    expect(RESIDENT_CATALOG.map(({ id }) => id)).toEqual([
      "librarian",
      "researcher",
      "projectionist",
      "training-keeper",
      "scribe",
    ]);
    expect(
      RESIDENT_CATALOG.every(
        ({ dialogueProfileId, routineDefinition }) =>
          dialogueProfileId && routineDefinition.anchors.length > 0,
      ),
    ).toBe(true);
  });

  it("resolve um residente por sala sem uma tabela persistida", () => {
    expect(residentForRoom("study-room")?.id).toBe("researcher");
    expect(residentForRoom("main-library")?.id).toBe("librarian");
  });
});
