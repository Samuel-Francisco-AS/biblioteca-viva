import {
  Box3,
  Group,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  type BufferGeometry,
  type Material,
  type Object3D,
} from "three";
import { describe, expect, expectTypeOf, it, vi } from "vitest";

import { disposeObjectTree } from "./referenceScene";
import {
  createProceduralBookVolume,
  createProceduralBookshelf,
  getProceduralBookVolumeDimensions,
  getProceduralBookVolumeVariant,
  type ProceduralBookVolumeIdentity,
  type ProceduralBookshelfIdentity,
  type ProceduralBookshelfVariant,
} from "./proceduralContent";

function createIdentity(
  instanceId: string,
  entryId?: string,
): ProceduralBookshelfIdentity {
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

function hasPositiveVolumeOverlap(first: Box3, second: Box3): boolean {
  const intersection = first.clone().intersect(second);
  const size = intersection.getSize(new Vector3());
  const tolerance = 0.000_001;
  return size.x > tolerance && size.y > tolerance && size.z > tolerance;
}

describe("fábrica procedural de estante BF-1A", () => {
  it("estreita estante para bookshelf e não aceita o contrato de livro", () => {
    expectTypeOf<ProceduralBookshelfIdentity>().toMatchTypeOf<{
      readonly instanceId: string;
      readonly modelTypeId: "bookshelf";
    }>();
    expectTypeOf<ProceduralBookVolumeIdentity>().not.toMatchTypeOf<ProceduralBookshelfIdentity>();
    expectTypeOf(createProceduralBookshelf)
      .parameter(0)
      .toEqualTypeOf<ProceduralBookshelfIdentity>();
  });

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

    expect(parts).toHaveLength(10);
    expect(parts.filter(({ name }) => name === "bookshelf-base")).toHaveLength(
      1,
    );
    expect(parts.filter(({ name }) => name === "bookshelf-back")).toHaveLength(
      1,
    );
    expect(parts.filter(({ name }) => name === "bookshelf-side")).toHaveLength(
      2,
    );
    expect(parts.filter(({ name }) => name === "bookshelf-shelf")).toHaveLength(
      5,
    );
    expect(
      parts.filter(({ name }) => name === "bookshelf-top-trim"),
    ).toHaveLength(1);
  });

  it("distingue deterministicamente as três variantes da mesma família", () => {
    const variants: readonly ProceduralBookshelfVariant[] = [
      "reading-balanced",
      "reading-dark-tall",
      "reading-light-wide",
    ];
    const bookshelves = variants.map((variant, index) =>
      createProceduralBookshelf(createIdentity(`shelf-${index + 1}`), variant),
    );
    const sizes = bookshelves.map(({ root }) =>
      new Box3().setFromObject(root).getSize(new Vector3()),
    );

    expect(bookshelves.map(({ variant }) => variant)).toEqual(variants);
    expect(sizes.map(({ x }) => x)).toEqual([
      expect.closeTo(2.18, 6),
      expect.closeTo(2.06, 6),
      expect.closeTo(2.5, 6),
    ]);
    expect(sizes.map(({ y }) => y)).toEqual([
      expect.closeTo(3.1, 6),
      expect.closeTo(3.38, 6),
      expect.closeTo(2.86, 6),
    ]);
    expect(sizes.map(({ z }) => z)).toEqual([
      expect.closeTo(0.62, 6),
      expect.closeTo(0.6, 6),
      expect.closeTo(0.66, 6),
    ]);
    expect(
      bookshelves.map(
        ({ root }) =>
          meshes(root).filter(({ name }) => name === "bookshelf-shelf").length,
      ),
    ).toEqual([5, 6, 4]);
    const frameColors = bookshelves.map(({ root }) => {
      const back = meshes(root).find(({ name }) => name === "bookshelf-back");
      if (
        !back ||
        Array.isArray(back.material) ||
        !(back.material instanceof MeshStandardMaterial)
      ) {
        throw new Error("A variante deve expor material de madeira no fundo.");
      }
      return back.material.color.getHex();
    });
    expect(new Set(frameColors)).toHaveLength(3);

    for (const { root } of bookshelves) disposeObjectTree(root);
  });

  it("separa fundo, prateleiras e moldura sem sobreposição de volume", () => {
    const bookshelf = createProceduralBookshelf(createIdentity("shelf-01"));
    const parts = meshes(bookshelf.root);
    const bounds = parts.map((part) => new Box3().setFromObject(part));

    for (const [index, first] of bounds.entries()) {
      for (const second of bounds.slice(index + 1)) {
        expect(hasPositiveVolumeOverlap(first, second)).toBe(false);
      }
    }
    disposeObjectTree(bookshelf.root);
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

    expect(shelves).toHaveLength(5);
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

function createBookIdentity(
  instanceId = "reading-book:book-01",
  entryId = "book-01",
): ProceduralBookVolumeIdentity {
  return { entryId, instanceId, modelTypeId: "book-volume" };
}

describe("fábrica procedural de livro BF-2B", () => {
  it("cria um volume válido com identidade convencional obrigatória", () => {
    const identity = createBookIdentity();
    const book = createProceduralBookVolume(identity);

    expect(book.root).toBeInstanceOf(Group);
    expect(book.identity).toEqual(identity);
    expect(book.identity.modelTypeId).toBe("book-volume");
    expect(book.root.name).toBe("procedural-book-volume");
    disposeObjectTree(book.root);
  });

  it("rejeita entryId ausente ou vazio e modelTypeId inadequado", () => {
    expect(() =>
      createProceduralBookVolume({
        instanceId: "reading-book:missing",
        modelTypeId: "book-volume",
      } as unknown as ProceduralBookVolumeIdentity),
    ).toThrow("entryId não vazio");
    expect(() =>
      createProceduralBookVolume(createBookIdentity("reading-book:blank", " ")),
    ).toThrow("entryId não vazio");
    expect(() =>
      createProceduralBookVolume({
        entryId: "book-wrong-type",
        instanceId: "reading-book:book-wrong-type",
        modelTypeId: "bookshelf",
      } as unknown as ProceduralBookVolumeIdentity),
    ).toThrow("modelTypeId: book-volume");
  });

  it("tem bounds finitos, positivos, localmente apoiados e compatíveis com sua variante", () => {
    const book = createProceduralBookVolume(createBookIdentity());
    const bounds = new Box3().setFromObject(book.root);
    const size = bounds.getSize(new Vector3());
    const dimensions = getProceduralBookVolumeDimensions(book.variant);

    expect([size.x, size.y, size.z, bounds.min.y]).toSatisfy(
      (values: number[]) => values.every(Number.isFinite),
    );
    expect([size.x, size.y, size.z]).toEqual([
      expect.closeTo(dimensions.width, 6),
      expect.closeTo(dimensions.height, 6),
      expect.closeTo(dimensions.depth, 6),
    ]);
    expect(bounds.min.y).toBeCloseTo(0, 6);
    expect(book.root.position).toEqual(new Vector3(0, 0, 0));
    expect(book.root.rotation.x).toBe(0);
    expect(book.root.rotation.y).toBe(0);
    expect(book.root.rotation.z).toBe(0);
    expect(book.root.scale).toEqual(new Vector3(1, 1, 1));
    disposeObjectTree(book.root);
  });

  it("escolhe a variante sem aleatoriedade e a mantém para a mesma identidade", () => {
    const random = vi.spyOn(Math, "random");
    const identity = createBookIdentity("reading-book:stable", "stable");
    const variant = getProceduralBookVolumeVariant(identity);
    expect(random).not.toHaveBeenCalled();
    random.mockRestore();

    const first = createProceduralBookVolume(identity);
    const second = createProceduralBookVolume(identity);
    expect(first.variant).toBe(variant);
    expect(second.variant).toBe(first.variant);
    disposeObjectTree(first.root);
    disposeObjectTree(second.root);
  });

  it("permite variações entre identidades estáveis", () => {
    const variants = ["alpha", "beta", "gamma", "delta"].map((entryId) =>
      getProceduralBookVolumeVariant(
        createBookIdentity(`reading-book:${entryId}`, entryId),
      ),
    );

    expect(new Set(variants).size).toBeGreaterThan(1);
  });

  it("isola recursos entre criações e é descartável por disposeObjectTree", () => {
    const first = createProceduralBookVolume(createBookIdentity());
    const second = createProceduralBookVolume(
      createBookIdentity("reading-book:book-02", "book-02"),
    );
    const firstParts = meshes(first.root);
    const secondParts = meshes(second.root);
    const firstGeometries = new Set(firstParts.map(({ geometry }) => geometry));
    const secondGeometries = new Set(
      secondParts.map(({ geometry }) => geometry),
    );
    const firstMaterials = materials(firstParts);
    const secondMaterials = materials(secondParts);
    const secondPart = secondParts[0];
    if (!secondPart || Array.isArray(secondPart.material)) {
      throw new Error("O volume deve conter material simples descartável.");
    }
    const disposeGeometry = vi.spyOn(secondPart.geometry, "dispose");
    const disposeMaterial = vi.spyOn(secondPart.material, "dispose");

    expect(first.root).not.toBe(second.root);
    expect(
      [...firstGeometries].every((geometry) => !secondGeometries.has(geometry)),
    ).toBe(true);
    expect(
      [...firstMaterials].every((material) => !secondMaterials.has(material)),
    ).toBe(true);
    disposeObjectTree(first.root);

    expect(first.root.children).toHaveLength(0);
    expect(second.root.children).not.toHaveLength(0);
    expect(disposeGeometry).not.toHaveBeenCalled();
    expect(disposeMaterial).not.toHaveBeenCalled();
    disposeObjectTree(second.root);
    expect(disposeGeometry).toHaveBeenCalledOnce();
    expect(disposeMaterial).toHaveBeenCalledOnce();
  });
});
