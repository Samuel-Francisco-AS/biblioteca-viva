// @vitest-environment node
import { describe, expect, it } from "vitest";

import { ContentLocalizer } from "./localization";
import { PROTOTYPE_CONTENT } from "./prototypeContent";
import { parseContentCatalog, validateContentReferences } from "./schemas";

describe("conteúdo contextual", () => {
  it("valida o catálogo completo e suas referências", () => {
    expect(parseContentCatalog(PROTOTYPE_CONTENT)).toEqual(PROTOTYPE_CONTENT);
    expect(validateContentReferences(PROTOTYPE_CONTENT)).toEqual([]);
  });

  it("rejeita ID duplicado", () => {
    expect(() =>
      parseContentCatalog({
        ...PROTOTYPE_CONTENT,
        dialogues: [
          ...PROTOTYPE_CONTENT.dialogues,
          PROTOTYPE_CONTENT.dialogues[0],
        ],
      }),
    ).toThrow(/ID duplicado/u);
  });

  it("rejeita ID ausente e locale inválido", () => {
    const source = PROTOTYPE_CONTENT.dialogues[0];
    const withoutId = {
      characterId: source.characterId,
      conditions: source.conditions,
      cooldownHours: source.cooldownHours,
      events: source.events,
      once: source.once,
      priority: source.priority,
      textKey: source.textKey,
    };
    expect(() =>
      parseContentCatalog({
        ...PROTOTYPE_CONTENT,
        dialogues: [withoutId, ...PROTOTYPE_CONTENT.dialogues.slice(1)],
      }),
    ).toThrow();
    expect(() =>
      parseContentCatalog({ ...PROTOTYPE_CONTENT, defaultLocale: "pt_br" }),
    ).toThrow();
  });

  it("rejeita referência inexistente", () => {
    expect(() =>
      parseContentCatalog({
        ...PROTOTYPE_CONTENT,
        rooms: [
          {
            ...PROTOTYPE_CONTENT.rooms[0],
            characterIds: ["character.unknown"],
          },
        ],
      }),
    ).toThrow(/Personagem inexistente/u);
  });

  it("localiza em pt-BR com fallback explícito de locale e chave", () => {
    const localizer = new ContentLocalizer(PROTOTYPE_CONTENT);
    expect(localizer.translate("dialogue.librarian.empty", "pt-BR")).toEqual({
      locale: "pt-BR",
      text: "A sala pode ficar quieta por enquanto. Há espaço quando você quiser.",
    });
    expect(
      localizer.translate("dialogue.librarian.empty", "en-US"),
    ).toMatchObject({ locale: "pt-BR" });
    expect(localizer.translate("dialogue.unknown", "pt-BR")).toEqual({
      locale: "pt-BR",
      text: "Conteúdo indisponível.",
    });
  });

  it("mantém personagens, sala, decoração e interface como dados", () => {
    expect(PROTOTYPE_CONTENT.characters.map(({ id }) => id)).toEqual([
      "character.librarian",
      "character.creature",
      "character.researcher",
      "character.projectionist",
      "character.training-keeper",
      "character.scribe",
    ]);
    expect(PROTOTYPE_CONTENT.rooms[0]?.id).toBe("room.main");
    expect(PROTOTYPE_CONTENT.decorations[0]).toMatchObject({
      id: "decoration.reading-lamp",
      state: "unlockable",
    });
    expect(PROTOTYPE_CONTENT.interfaceTexts).toHaveLength(2);
  });
});
