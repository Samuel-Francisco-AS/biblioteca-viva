import {
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
  type ProceduralContentDefinition,
} from "./proceduralComposition";
import { disposeObjectTree } from "./referenceScene";

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
): ProceduralContentDefinition {
  return {
    identity: { instanceId, modelTypeId: "bookshelf" },
    position,
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
      [3, 0, -2],
    ]);
    expect(composition.instances.map(({ node }) => node.position)).toEqual([
      new Vector3(-3, 0, -2),
      new Vector3(0, 0, -2),
      new Vector3(3, 0, -2),
    ]);
    disposeObjectTree(composition.root);
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

    expect(shelves).toHaveLength(4);
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
});
