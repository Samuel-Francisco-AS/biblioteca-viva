import {
  Box3,
  Group,
  Mesh,
  Vector3,
  type BufferGeometry,
  type Material,
  type Object3D,
} from "three";
import { describe, expect, it, vi } from "vitest";

import {
  createProceduralComposition,
  READING_SHELF_COMPOSITION_DEFINITIONS,
  replaceProceduralBookshelfRepresentation,
  type ProceduralContentDefinition,
} from "./proceduralComposition";
import * as proceduralContent from "./proceduralContent";
import {
  createProceduralBookshelf,
  type ProceduralBookshelfVariant,
} from "./proceduralContent";
import { createReferenceScene, disposeObjectTree } from "./referenceScene";

type DisposableMesh = Mesh<BufferGeometry, Material | Material[]>;

function isDisposableMesh(object: Object3D): object is DisposableMesh {
  return object instanceof Mesh;
}

function meshes(root: Group): DisposableMesh[] {
  const result: DisposableMesh[] = [];
  root.traverse((object) => {
    if (isDisposableMesh(object)) result.push(object);
  });
  return result;
}

function materials(parts: readonly DisposableMesh[]): Set<Material> {
  return new Set(
    parts.flatMap(({ material }) =>
      Array.isArray(material) ? material : [material],
    ),
  );
}

function definition(
  instanceId: string,
  position: readonly [number, number, number],
  variant: ProceduralBookshelfVariant = "reading-balanced",
): ProceduralContentDefinition {
  return {
    identity: { instanceId, modelTypeId: "bookshelf" },
    position,
    variant,
  };
}

describe("composição procedural BF-1B", () => {
  it("constrói as três estantes declaradas com identidade e posições preservadas", () => {
    const composition = createProceduralComposition(
      READING_SHELF_COMPOSITION_DEFINITIONS,
    );

    expect(composition.root).toBeInstanceOf(Group);
    expect(composition.instances).toHaveLength(3);
    expect(
      composition.instances.map(({ identity }) => ({
        instanceId: identity.instanceId,
        modelTypeId: identity.modelTypeId,
      })),
    ).toEqual([
      { instanceId: "reading-shelf-01", modelTypeId: "bookshelf" },
      { instanceId: "reading-shelf-02", modelTypeId: "bookshelf" },
      { instanceId: "reading-shelf-03", modelTypeId: "bookshelf" },
    ]);
    expect(composition.instances.map(({ position }) => position)).toEqual([
      [-3, 0, -2],
      [0, 0, -2],
      [3, 0, -2.1],
    ]);
    expect(composition.instances.map(({ variant }) => variant)).toEqual([
      "reading-balanced",
      "reading-dark-tall",
      "reading-light-wide",
    ]);
    expect(composition.instances.map(({ node }) => node.position)).toEqual([
      new Vector3(-3, 0, -2),
      new Vector3(0, 0, -2),
      new Vector3(3, 0, -2.1),
    ]);
    disposeObjectTree(composition.root);
  });

  it("mantém as variantes separadas dos proxies selecionáveis da fixture F1", () => {
    const composition = createProceduralComposition(
      READING_SHELF_COMPOSITION_DEFINITIONS,
    );
    const referenceScene = createReferenceScene();

    for (const instance of composition.instances) {
      const instanceBounds = new Box3().setFromObject(instance.node);
      for (const selectable of referenceScene.selectables) {
        expect(
          instanceBounds.intersectsBox(
            new Box3().setFromObject(selectable.root),
          ),
        ).toBe(false);
      }
    }
    disposeObjectTree(composition.root);
    disposeObjectTree(referenceScene.root);
  });

  it("posiciona pelo wrapper sem alterar a representação local da fábrica", () => {
    const composition = createProceduralComposition(
      READING_SHELF_COMPOSITION_DEFINITIONS,
    );

    for (const instance of composition.instances) {
      expect(instance.node.children).toEqual([instance.representation.root]);
      expect(instance.representation.root.position).toEqual(
        new Vector3(0, 0, 0),
      );
      expect(instance.representation.root.rotation.x).toBe(0);
      expect(instance.representation.root.rotation.y).toBe(0);
      expect(instance.representation.root.rotation.z).toBe(0);
      expect(instance.representation.root.scale).toEqual(new Vector3(1, 1, 1));
    }
    disposeObjectTree(composition.root);
  });

  it("é determinística e não altera as definições recebidas", () => {
    const definitions = [
      definition("first", [-1, 0, 2]),
      definition("second", [1, 0, 2]),
    ];
    const expectedDefinitions = structuredClone(definitions);
    const first = createProceduralComposition(definitions);
    const second = createProceduralComposition(definitions);

    expect(definitions).toEqual(expectedDefinitions);
    expect(
      first.instances.map(({ identity, position }) => ({
        identity,
        position,
      })),
    ).toEqual(
      second.instances.map(({ identity, position }) => ({
        identity,
        position,
      })),
    );
    expect(first.root).not.toBe(second.root);
    expect(first.instances.map(({ node }) => node)).not.toEqual(
      second.instances.map(({ node }) => node),
    );
    disposeObjectTree(first.root);
    disposeObjectTree(second.root);
  });

  it("rejeita instanceId duplicado antes de construir uma composição", () => {
    expect(() =>
      createProceduralComposition([
        definition("duplicated", [0, 0, 0]),
        definition("duplicated", [2, 0, 0]),
      ]),
    ).toThrow("instanceId duplicado: duplicated");
  });

  it.each(["", "   "])(
    "rejeita instanceId vazio antes de construir uma composição: %j",
    (instanceId) => {
      expect(() =>
        createProceduralComposition([definition(instanceId, [0, 0, 0])]),
      ).toThrow("instanceId vazio");
    },
  );

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "rejeita coordenada não finita antes de construir uma composição: %s",
    (coordinate) => {
      expect(() =>
        createProceduralComposition([
          definition("invalid-position", [coordinate, 0, 0]),
        ]),
      ).toThrow("posição não finita: invalid-position");
    },
  );

  it("isola recursos entre composições e mantém a outra utilizável", () => {
    const first = createProceduralComposition(
      READING_SHELF_COMPOSITION_DEFINITIONS,
    );
    const second = createProceduralComposition(
      READING_SHELF_COMPOSITION_DEFINITIONS,
    );
    const firstParts = meshes(first.root);
    const secondParts = meshes(second.root);
    const firstGeometries = new Set(firstParts.map(({ geometry }) => geometry));
    const secondGeometries = new Set(
      secondParts.map(({ geometry }) => geometry),
    );
    const firstMaterials = materials(firstParts);
    const secondMaterials = materials(secondParts);

    expect(
      [...firstGeometries].every((geometry) => !secondGeometries.has(geometry)),
    ).toBe(true);
    expect(
      [...firstMaterials].every((material) => !secondMaterials.has(material)),
    ).toBe(true);

    const secondPart = secondParts[0];
    if (!secondPart || Array.isArray(secondPart.material)) {
      throw new Error("A composição deve conter materiais simples.");
    }
    const disposeGeometry = vi.spyOn(secondPart.geometry, "dispose");
    const disposeMaterial = vi.spyOn(secondPart.material, "dispose");
    disposeObjectTree(first.root);

    expect(second.root.children).toHaveLength(3);
    expect(disposeGeometry).not.toHaveBeenCalled();
    expect(disposeMaterial).not.toHaveBeenCalled();
    disposeObjectTree(second.root);
  });

  it("descarta toda a composição e deduplica recursos de uma estante", () => {
    const composition = createProceduralComposition(
      READING_SHELF_COMPOSITION_DEFINITIONS,
    );
    const shelves = meshes(composition.instances[0].representation.root).filter(
      ({ name }) => name === "bookshelf-shelf",
    );
    const shelfGeometry = shelves[0]?.geometry;
    const shelfMaterial = shelves[0]?.material;

    expect(shelves).toHaveLength(5);
    if (!shelfGeometry || Array.isArray(shelfMaterial)) {
      throw new Error("A composição deve conter recursos de prateleira.");
    }
    const disposeGeometry = vi.spyOn(shelfGeometry, "dispose");
    const disposeMaterial = vi.spyOn(shelfMaterial, "dispose");

    disposeObjectTree(composition.root);

    expect(disposeGeometry).toHaveBeenCalledOnce();
    expect(disposeMaterial).toHaveBeenCalledOnce();
    expect(composition.root.children).toHaveLength(0);
  });

  it("BF-1D substitui somente a representação, preservando identidade, posição e wrapper", () => {
    const composition = createProceduralComposition([
      {
        identity: {
          entryId: "book-02",
          instanceId: "reading-shelf-02",
          modelTypeId: "bookshelf",
        },
        position: [0, 0, -2],
        variant: "reading-dark-tall",
      },
      definition("reading-shelf-03", [3, 0, -2.1], "reading-light-wide"),
    ]);
    const target = composition.instances[0];
    const untouched = composition.instances[1];
    if (!target || !untouched)
      throw new Error("A composição deve ter estantes.");
    const previous = target.representation;
    const node = target.node;
    const previousPart = meshes(previous.root)[0];
    if (!previousPart || Array.isArray(previousPart.material)) {
      throw new Error("A estante deve conter recursos descartáveis.");
    }
    const disposePreviousGeometry = vi.spyOn(previousPart.geometry, "dispose");
    const disposePreviousMaterial = vi.spyOn(previousPart.material, "dispose");

    expect(
      replaceProceduralBookshelfRepresentation(
        composition,
        "reading-shelf-02",
        "reading-balanced",
      ),
    ).toBe("replaced");

    expect(target.identity).toEqual({
      entryId: "book-02",
      instanceId: "reading-shelf-02",
      modelTypeId: "bookshelf",
    });
    expect(target.position).toEqual([0, 0, -2]);
    expect(target.node).toBe(node);
    expect(target.node.position).toEqual(new Vector3(0, 0, -2));
    expect(target.variant).toBe("reading-balanced");
    expect(target.representation).not.toBe(previous);
    expect(target.node.children).toEqual([target.representation.root]);
    expect(previous.root.parent).toBeNull();
    expect(previous.root.children).toHaveLength(0);
    expect(disposePreviousGeometry).toHaveBeenCalledOnce();
    expect(disposePreviousMaterial).toHaveBeenCalledOnce();
    expect(untouched.variant).toBe("reading-light-wide");
    expect(untouched.node.children).toEqual([untouched.representation.root]);

    const replacementPart = meshes(target.representation.root)[0];
    if (!replacementPart || Array.isArray(replacementPart.material)) {
      throw new Error("A substituta deve conter recursos descartáveis.");
    }
    const disposeReplacementGeometry = vi.spyOn(
      replacementPart.geometry,
      "dispose",
    );
    expect(disposeReplacementGeometry).not.toHaveBeenCalled();
    disposeObjectTree(composition.root);
    expect(disposeReplacementGeometry).toHaveBeenCalledOnce();
  });

  it("BF-1D repete trocas sem acumular roots e torna a variante ativa inerte", () => {
    const composition = createProceduralComposition([
      definition("reading-shelf-02", [0, 0, -2], "reading-dark-tall"),
    ]);
    const instance = composition.instances[0];
    if (!instance) throw new Error("A composição deve ter uma estante.");
    const initial = instance.representation;

    expect(
      replaceProceduralBookshelfRepresentation(
        composition,
        "reading-shelf-02",
        "reading-dark-tall",
      ),
    ).toBe("unchanged");
    expect(instance.representation).toBe(initial);
    expect(instance.node.children).toEqual([initial.root]);

    for (const variant of [
      "reading-balanced",
      "reading-light-wide",
      "reading-dark-tall",
    ] as const) {
      expect(
        replaceProceduralBookshelfRepresentation(
          composition,
          "reading-shelf-02",
          variant,
        ),
      ).toBe("replaced");
      expect(instance.node.children).toEqual([instance.representation.root]);
    }
    disposeObjectTree(composition.root);
  });

  it("BF-1D rejeita entrada e falha de preparação sem corromper a representação atual", () => {
    const composition = createProceduralComposition([
      definition("reading-shelf-02", [0, 0, -2], "reading-dark-tall"),
    ]);
    const instance = composition.instances[0];
    if (!instance) throw new Error("A composição deve ter uma estante.");
    const previous = instance.representation;

    expect(() =>
      replaceProceduralBookshelfRepresentation(
        composition,
        "missing-shelf",
        "reading-balanced",
      ),
    ).toThrow("não possui instanceId: missing-shelf");
    expect(() =>
      replaceProceduralBookshelfRepresentation(
        composition,
        "reading-shelf-02",
        "unknown-variant",
      ),
    ).toThrow("Variante procedural de estante desconhecida: unknown-variant");
    expect(instance.representation).toBe(previous);

    const factory = vi
      .spyOn(proceduralContent, "createProceduralBookshelf")
      .mockImplementation(() => {
        throw new Error("factory unavailable");
      });
    expect(() =>
      replaceProceduralBookshelfRepresentation(
        composition,
        "reading-shelf-02",
        "reading-balanced",
      ),
    ).toThrow("factory unavailable");
    expect(instance.representation).toBe(previous);
    expect(instance.node.children).toEqual([previous.root]);
    factory.mockRestore();
    disposeObjectTree(composition.root);
  });

  it("BF-1D libera uma substituta preparada se o attach ao wrapper falhar", () => {
    const composition = createProceduralComposition([
      definition("reading-shelf-02", [0, 0, -2], "reading-dark-tall"),
    ]);
    const instance = composition.instances[0];
    if (!instance) throw new Error("A composição deve ter uma estante.");
    const previous = instance.representation;
    const replacement = createProceduralBookshelf(
      previous.identity,
      "reading-balanced",
    );
    const replacementPart = meshes(replacement.root)[0];
    if (!replacementPart || Array.isArray(replacementPart.material)) {
      throw new Error("A substituta deve conter recursos descartáveis.");
    }
    const disposeReplacementGeometry = vi.spyOn(
      replacementPart.geometry,
      "dispose",
    );
    const factory = vi
      .spyOn(proceduralContent, "createProceduralBookshelf")
      .mockReturnValue(replacement);
    const attach = vi.spyOn(instance.node, "add").mockImplementation(() => {
      throw new Error("attach unavailable");
    });

    expect(() =>
      replaceProceduralBookshelfRepresentation(
        composition,
        "reading-shelf-02",
        "reading-balanced",
      ),
    ).toThrow("attach unavailable");
    expect(instance.representation).toBe(previous);
    expect(instance.node.children).toEqual([previous.root]);
    expect(replacement.root.parent).toBeNull();
    expect(replacement.root.children).toHaveLength(0);
    expect(disposeReplacementGeometry).toHaveBeenCalledOnce();
    attach.mockRestore();
    factory.mockRestore();
    disposeObjectTree(composition.root);
  });
});
