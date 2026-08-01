import { describe, expect, it } from "vitest";

import {
  ESSENTIAL_VISUAL_IDS,
  LIBRARY_VISUAL_MANIFEST,
  resolveVisualSource,
  validateVisualManifest,
  type VisualElementManifestEntry,
} from "./roomManifest";
import {
  LIBRARY_ROOM_ANIMATIONS,
  LIBRARY_ROOM_BUDGET,
  LIBRARY_ROOM_INTERACTION,
} from "./roomConfig";

describe("manifestos visuais da primeira sala", () => {
  it("possui IDs únicos e todos os fallbacks essenciais", () => {
    expect(validateVisualManifest(LIBRARY_VISUAL_MANIFEST)).toBe(true);
    expect(new Set(LIBRARY_VISUAL_MANIFEST.map(({ id }) => id)).size).toBe(
      LIBRARY_VISUAL_MANIFEST.length,
    );
    expect(LIBRARY_VISUAL_MANIFEST.map(({ id }) => id).sort()).toEqual(
      [...ESSENTIAL_VISUAL_IDS].sort(),
    );
    LIBRARY_VISUAL_MANIFEST.forEach((entry) =>
      expect(entry.fallback.length).toBeGreaterThan(0),
    );
  });

  it("aceita somente caminhos internos opcionais e profundidades válidas", () => {
    LIBRARY_VISUAL_MANIFEST.forEach((entry) => {
      expect(
        entry.assetPath === null ||
          entry.assetPath.startsWith("/assets/phaser/"),
      ).toBe(true);
      expect(entry.depth).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(entry.depth)).toBe(true);
    });
  });

  it("registra posições semânticas e as três áreas interativas obrigatórias", () => {
    LIBRARY_VISUAL_MANIFEST.forEach((entry) =>
      expect(entry.position.length).toBeGreaterThan(0),
    );
    expect(
      LIBRARY_VISUAL_MANIFEST.filter(({ interactive }) => interactive).map(
        ({ id }) => id,
      ),
    ).toEqual(expect.arrayContaining(["shelf", "librarian", "creature"]));
    expect(LIBRARY_ROOM_INTERACTION.minimumTargetSize).toBeGreaterThanOrEqual(
      44,
    );
  });

  it("mantém durações positivas, amplitudes pequenas e orçamento documentado", () => {
    expect(LIBRARY_ROOM_ANIMATIONS.librarian.durationMs).toBeGreaterThan(0);
    expect(LIBRARY_ROOM_ANIMATIONS.creature.durationMs).toBeGreaterThan(0);
    expect(LIBRARY_ROOM_ANIMATIONS.highlightedBook.durationMs).toBeGreaterThan(
      0,
    );
    expect(LIBRARY_ROOM_ANIMATIONS.librarian.idleAmplitude).toBeLessThanOrEqual(
      4,
    );
    expect(LIBRARY_ROOM_ANIMATIONS.creature.idleAmplitude).toBeLessThanOrEqual(
      4,
    );
    expect(
      LIBRARY_ROOM_ANIMATIONS.highlightedBook.idleAmplitude,
    ).toBeLessThanOrEqual(0.05);
    expect(
      LIBRARY_ROOM_BUDGET.maximumApproximateDisplayObjects,
    ).toBeLessThanOrEqual(32);
    expect(LIBRARY_ROOM_BUDGET.maximumSimultaneousTweens).toBeLessThanOrEqual(
      3,
    );
    expect(LIBRARY_ROOM_BUDGET.maximumCustomTextures).toBeLessThanOrEqual(7);
    expect(LIBRARY_ROOM_BUDGET).toMatchObject({
      particles: "none",
      physics: "none",
      shaders: "none",
    });
  });

  it("escolhe asset carregado e fallback para ausência ou falha", () => {
    const entry: VisualElementManifestEntry = {
      ...LIBRARY_VISUAL_MANIFEST[1],
      assetPath: "/assets/phaser/shelves/main.png",
    };
    expect(
      resolveVisualSource(entry, {
        failedAssetIds: new Set(),
        loadedAssetIds: new Set([entry.id]),
      }),
    ).toEqual({ kind: "asset", path: entry.assetPath });
    expect(
      resolveVisualSource(entry, {
        failedAssetIds: new Set(),
        loadedAssetIds: new Set(),
      }),
    ).toEqual({ fallback: entry.fallback, kind: "fallback" });
    expect(
      resolveVisualSource(entry, {
        failedAssetIds: new Set([entry.id]),
        loadedAssetIds: new Set([entry.id]),
      }),
    ).toEqual({ fallback: entry.fallback, kind: "fallback" });
  });

  it("preserva fallback e interação numa falha parcial recuperável", () => {
    const failed = new Set(["shelf", "librarian", "creature"] as const);
    LIBRARY_VISUAL_MANIFEST.filter(({ id }) =>
      failed.has(id as "shelf"),
    ).forEach((entry) => {
      expect(
        resolveVisualSource(entry, {
          failedAssetIds: failed,
          loadedAssetIds: failed,
        }).kind,
      ).toBe("fallback");
      expect(entry.interactive).toBe(true);
    });
  });

  it("detecta manifesto estruturalmente inválido", () => {
    const duplicate = [...LIBRARY_VISUAL_MANIFEST, LIBRARY_VISUAL_MANIFEST[0]];
    expect(() => validateVisualManifest(duplicate)).toThrow(/duplicado/u);
    expect(() =>
      validateVisualManifest(LIBRARY_VISUAL_MANIFEST.slice(1)),
    ).toThrow(/ausente/u);
  });
});
