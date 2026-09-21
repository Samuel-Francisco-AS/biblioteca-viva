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

import { disposeObjectTree } from "./referenceScene";
import {
  createProceduralBookshelf,
  type ProceduralContentIdentity,
} from "./proceduralContent";

function createIdentity(
  instanceId: string,
  entryId?: string,
): ProceduralContentIdentity {
  return { entryId, instanceId, modelTypeId: "bookshelf" };
}

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

describe("fábrica procedural de estante BF-1A", () => {
  it("cria uma root válida com a identidade lógica separada", () => {
    const identity = createIdentity("shelf-reading-01", "book-01");
    const bookshelf = createProceduralBookshelf(identity);

    expect(bookshelf.root).toBeInstanceOf(Group);
    expect(bookshelf.identity).toEqual({
      entryId: "book-01",
      instanceId: "shelf-reading-01",
      modelTypeId: "bookshelf",
    });
    expect(bookshelf.root.name).toBe("procedural-bookshelf");
    expect(bookshelf.root.name).not.toContain(identity.instanceId);
  });

  it("forma uma estante reconhecível com prateleiras", () => {
    const bookshelf = createProceduralBookshelf(createIdentity("shelf-01"));
    const parts = meshes(bookshelf.root);

    expect(parts).toHaveLength(7);
    expect(parts.filter(({ name }) => name === "bookshelf-back")).toHaveLength(
      1,
    );
    expect(parts.filter(({ name }) => name === "bookshelf-side")).toHaveLength(
      2,
    );
    expect(parts.filter(({ name }) => name === "bookshelf-shelf")).toHaveLength(
      4,
    );
  });

  it("tem bounds físicos finitos, positivos e apoiados em Y=0", () => {
    const bookshelf = createProceduralBookshelf(createIdentity("shelf-01"));
    const bounds = new Box3().setFromObject(bookshelf.root);
    const size = bounds.getSize(new Vector3());

    expect([size.x, size.y, size.z, bounds.min.y]).toSatisfy(
      (values: number[]) => values.every(Number.isFinite),
    );
    expect([size.x, size.y, size.z]).toSatisfy((values: number[]) =>
      values.every((value) => value > 0),
    );
    expect(bounds.min.y).toBeCloseTo(0, 6);
  });

  it("mantém a root em identidade", () => {
    const root = createProceduralBookshelf(createIdentity("shelf-01")).root;

    expect(root.position).toEqual(new Vector3(0, 0, 0));
    expect(root.rotation.x).toBe(0);
    expect(root.rotation.y).toBe(0);
    expect(root.rotation.z).toBe(0);
    expect(root.scale).toEqual(new Vector3(1, 1, 1));
  });

  it("isola roots e recursos entre chamadas", () => {
    const first = createProceduralBookshelf(createIdentity("shelf-01"));
    const second = createProceduralBookshelf(createIdentity("shelf-02"));
    const firstParts = meshes(first.root);
    const secondParts = meshes(second.root);
    const firstGeometries = new Set(firstParts.map(({ geometry }) => geometry));
    const secondGeometries = new Set(
      secondParts.map(({ geometry }) => geometry),
    );
    const firstMaterials = materials(firstParts);
    const secondMaterials = materials(secondParts);

    expect(first.root).not.toBe(second.root);
    expect(
      [...firstGeometries].every((geometry) => !secondGeometries.has(geometry)),
    ).toBe(true);
    expect(
      [...firstMaterials].every((material) => !secondMaterials.has(material)),
    ).toBe(true);

    const secondFirstPart = secondParts[0];
    if (!secondFirstPart || Array.isArray(secondFirstPart.material)) {
      throw new Error("A estante procedural deve ter um material simples.");
    }
    const secondGeometryDispose = vi.spyOn(secondFirstPart.geometry, "dispose");
    const secondMaterialDispose = vi.spyOn(secondFirstPart.material, "dispose");
    disposeObjectTree(first.root);

    expect(second.root.children).not.toHaveLength(0);
    expect(secondGeometryDispose).not.toHaveBeenCalled();
    expect(secondMaterialDispose).not.toHaveBeenCalled();
    disposeObjectTree(second.root);
  });

  it("deduplica o descarte dos recursos compartilhados na mesma root", () => {
    const bookshelf = createProceduralBookshelf(createIdentity("shelf-01"));
    const shelves = meshes(bookshelf.root).filter(
      ({ name }) => name === "bookshelf-shelf",
    );
    const shelfGeometry = shelves[0]?.geometry;
    const shelfMaterial = shelves[0]?.material;

    expect(shelves).toHaveLength(4);
    expect(shelves.every(({ geometry }) => geometry === shelfGeometry)).toBe(
      true,
    );
    expect(shelves.every(({ material }) => material === shelfMaterial)).toBe(
      true,
    );
    if (!shelfGeometry || Array.isArray(shelfMaterial)) {
      throw new Error("A estante procedural deve ter recursos de prateleira.");
    }
    const disposeGeometry = vi.spyOn(shelfGeometry, "dispose");
    const disposeMaterial = vi.spyOn(shelfMaterial, "dispose");

    disposeObjectTree(bookshelf.root);

    expect(disposeGeometry).toHaveBeenCalledOnce();
    expect(disposeMaterial).toHaveBeenCalledOnce();
    expect(bookshelf.root.children).toHaveLength(0);
  });
});
