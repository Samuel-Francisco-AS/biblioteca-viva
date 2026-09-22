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
  createProceduralMovieRecord,
  createProceduralPhysicalActivityRecord,
  createProceduralSeriesRecord,
  createProceduralStudyRecord,
  createProceduralWorkRecord,
  getProceduralLibraryRecordDimensions,
  type ProceduralLibraryRecordIdentity,
  type ProceduralMovieRecordIdentity,
  type ProceduralPhysicalActivityRecordIdentity,
  type ProceduralSeriesRecordIdentity,
  type ProceduralStudyRecordIdentity,
  type ProceduralWorkRecordIdentity,
} from "./libraryRecordRepresentations";

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

const identities = Object.freeze({
  movie: Object.freeze({
    entryId: "movie-01",
    instanceId: "library-movie:movie-01",
    modelTypeId: "movie-record" as const,
  }),
  physicalActivity: Object.freeze({
    entryId: "activity-01",
    instanceId: "library-physical-activity:activity-01",
    modelTypeId: "physical-activity-record" as const,
  }),
  series: Object.freeze({
    entryId: "series-01",
    instanceId: "library-series:series-01",
    modelTypeId: "series-record" as const,
  }),
  study: Object.freeze({
    entryId: "study-01",
    instanceId: "library-study:study-01",
    modelTypeId: "study-record" as const,
  }),
  work: Object.freeze({
    entryId: "work-01",
    instanceId: "library-work:work-01",
    modelTypeId: "work-record" as const,
  }),
});

function createEveryRepresentation() {
  return [
    createProceduralMovieRecord(identities.movie),
    createProceduralSeriesRecord(identities.series),
    createProceduralStudyRecord(identities.study),
    createProceduralPhysicalActivityRecord(identities.physicalActivity),
    createProceduralWorkRecord(identities.work),
  ] as const;
}

describe("fábricas isoladas dos registros BF-3C1", () => {
  it("estreita cada fábrica ao modelTypeId semântico já projetado pela BF-3B", () => {
    expectTypeOf<ProceduralMovieRecordIdentity>().toMatchTypeOf<{
      readonly entryId: string;
      readonly instanceId: string;
      readonly modelTypeId: "movie-record";
    }>();
    expectTypeOf<ProceduralSeriesRecordIdentity>().not.toMatchTypeOf<ProceduralMovieRecordIdentity>();
    expectTypeOf<ProceduralStudyRecordIdentity>().not.toMatchTypeOf<ProceduralMovieRecordIdentity>();
    expectTypeOf<ProceduralPhysicalActivityRecordIdentity>().not.toMatchTypeOf<ProceduralMovieRecordIdentity>();
    expectTypeOf<ProceduralWorkRecordIdentity>().not.toMatchTypeOf<ProceduralMovieRecordIdentity>();
    expectTypeOf(createProceduralMovieRecord)
      .parameter(0)
      .toEqualTypeOf<ProceduralMovieRecordIdentity>();
    expectTypeOf(createProceduralSeriesRecord)
      .parameter(0)
      .toEqualTypeOf<ProceduralSeriesRecordIdentity>();
    expectTypeOf(createProceduralStudyRecord)
      .parameter(0)
      .toEqualTypeOf<ProceduralStudyRecordIdentity>();
    expectTypeOf(createProceduralPhysicalActivityRecord)
      .parameter(0)
      .toEqualTypeOf<ProceduralPhysicalActivityRecordIdentity>();
    expectTypeOf(createProceduralWorkRecord)
      .parameter(0)
      .toEqualTypeOf<ProceduralWorkRecordIdentity>();
  });

  it("cria as cinco raízes locais e preserva entryId e instanceId exatamente", () => {
    const representations = createEveryRepresentation();

    expect(representations.map(({ identity }) => identity.modelTypeId)).toEqual(
      [
        "movie-record",
        "series-record",
        "study-record",
        "physical-activity-record",
        "work-record",
      ],
    );
    expect(representations.map(({ identity }) => identity.entryId)).toEqual([
      "movie-01",
      "series-01",
      "study-01",
      "activity-01",
      "work-01",
    ]);
    expect(representations.map(({ identity }) => identity.instanceId)).toEqual([
      "library-movie:movie-01",
      "library-series:series-01",
      "library-study:study-01",
      "library-physical-activity:activity-01",
      "library-work:work-01",
    ]);
    for (const { root } of representations) {
      expect(root).toBeInstanceOf(Group);
      expect(root.parent).toBeNull();
      expect(root.position).toEqual(new Vector3(0, 0, 0));
      expect(root.rotation.toArray()).toEqual([0, 0, 0, "XYZ"]);
      expect(root.scale).toEqual(new Vector3(1, 1, 1));
    }

    for (const { root } of representations) disposeObjectTree(root);
  });

  it("mede envelopes reais positivos e apoia todas as formas no chão local", () => {
    const representations = createEveryRepresentation();

    for (const representation of representations) {
      const bounds = new Box3().setFromObject(representation.root);
      const size = bounds.getSize(new Vector3());
      const measured = {
        depth: size.z,
        height: size.y,
        width: size.x,
      };
      const declared = getProceduralLibraryRecordDimensions(
        representation.identity.modelTypeId,
      );

      expect([size.x, size.y, size.z, bounds.min.y]).toSatisfy(
        (values: number[]) => values.every(Number.isFinite),
      );
      expect([size.x, size.y, size.z]).toSatisfy((values: number[]) =>
        values.every((value) => value > 0),
      );
      expect(measured.depth).toBeCloseTo(declared.depth, 6);
      expect(measured.height).toBeCloseTo(declared.height, 6);
      expect(measured.width).toBeCloseTo(declared.width, 6);
      expect(bounds.min.y).toBeCloseTo(0, 6);
      expect(representation.dimensions).toEqual(declared);
    }

    for (const { root } of representations) disposeObjectTree(root);
  });

  it("mantém componentes internos intencionais sem sobreposição positiva", () => {
    const representations = createEveryRepresentation();
    const expectedPartNames = [
      ["movie-media-base", "movie-media-panel", "movie-screen-inset"],
      [
        "series-media-base",
        "series-media-case",
        "series-episode-marker",
        "series-media-case",
        "series-episode-marker",
        "series-media-case",
        "series-episode-marker",
      ],
      [
        "study-notebook-bottom-cover",
        "study-notebook-pages",
        "study-notebook-top-cover",
        "study-notebook-spine",
      ],
      [
        "activity-marker-base",
        "activity-marker-post",
        "activity-direction-marker",
      ],
      [
        "work-folder-base",
        "work-file-stack",
        "work-folder-front",
        "work-folder-tab",
      ],
    ];

    for (const [index, representation] of representations.entries()) {
      const parts = meshes(representation.root);
      expect(parts.map(({ name }) => name)).toEqual(expectedPartNames[index]);
      expect(
        parts.every(
          ({ material }) =>
            !Array.isArray(material) &&
            material instanceof MeshStandardMaterial,
        ),
      ).toBe(true);
      const bounds = parts.map((part) => new Box3().setFromObject(part));
      for (const [partIndex, first] of bounds.entries()) {
        for (const second of bounds.slice(partIndex + 1)) {
          expect(hasPositiveVolumeOverlap(first, second)).toBe(false);
        }
      }
    }

    for (const { root } of representations) disposeObjectTree(root);
  });

  it("distingue filme e série por composição, não apenas por material", () => {
    const movie = createProceduralMovieRecord(identities.movie);
    const series = createProceduralSeriesRecord(identities.series);

    expect(
      meshes(movie.root).filter(({ name }) => name === "movie-media-panel"),
    ).toHaveLength(1);
    expect(
      meshes(movie.root).filter(({ name }) => name === "series-media-case"),
    ).toHaveLength(0);
    expect(
      meshes(series.root).filter(({ name }) => name === "movie-media-panel"),
    ).toHaveLength(0);
    expect(
      meshes(series.root).filter(({ name }) => name === "series-media-case"),
    ).toHaveLength(3);
    expect(
      meshes(series.root).filter(
        ({ name }) => name === "series-episode-marker",
      ),
    ).toHaveLength(3);

    disposeObjectTree(movie.root);
    disposeObjectTree(series.root);
  });

  it("é determinística para uma identidade e não usa aleatoriedade", () => {
    const first = createEveryRepresentation();
    const second = createEveryRepresentation();

    expect(
      first.map(({ root }) => meshes(root).map(({ name }) => name)),
    ).toEqual(second.map(({ root }) => meshes(root).map(({ name }) => name)));
    expect(
      first.map(({ root }) =>
        new Box3().setFromObject(root).getSize(new Vector3()).toArray(),
      ),
    ).toEqual(
      second.map(({ root }) =>
        new Box3().setFromObject(root).getSize(new Vector3()).toArray(),
      ),
    );

    for (const { root } of [...first, ...second]) disposeObjectTree(root);
  });

  it("não compartilha geometria ou material descartável entre chamadas", () => {
    const first = createEveryRepresentation();
    const second = createEveryRepresentation();

    for (const [index, firstRepresentation] of first.entries()) {
      const firstParts = meshes(firstRepresentation.root);
      const secondParts = meshes(second[index].root);
      const firstGeometries = new Set(
        firstParts.map(({ geometry }) => geometry),
      );
      const secondGeometries = new Set(
        secondParts.map(({ geometry }) => geometry),
      );
      const firstMaterials = materials(firstParts);
      const secondMaterials = materials(secondParts);

      expect(firstRepresentation.root).not.toBe(second[index].root);
      expect(
        [...firstGeometries].every(
          (geometry) => !secondGeometries.has(geometry),
        ),
      ).toBe(true);
      expect(
        [...firstMaterials].every((material) => !secondMaterials.has(material)),
      ).toBe(true);
    }

    for (const { root } of [...first, ...second]) disposeObjectTree(root);
  });

  it("descarta uma root de forma isolada e deduplicada, inclusive se repetido", () => {
    const first = createProceduralSeriesRecord(identities.series);
    const second = createProceduralSeriesRecord({
      ...identities.series,
      entryId: "series-02",
      instanceId: "library-series:series-02",
    });
    const firstCase = meshes(first.root).find(
      ({ name }) => name === "series-media-case",
    );
    const secondCase = meshes(second.root).find(
      ({ name }) => name === "series-media-case",
    );
    if (
      !firstCase ||
      !secondCase ||
      Array.isArray(firstCase.material) ||
      Array.isArray(secondCase.material)
    ) {
      throw new Error("A série precisa expor cases descartáveis.");
    }
    const firstGeometryDispose = vi.spyOn(firstCase.geometry, "dispose");
    const firstMaterialDispose = vi.spyOn(firstCase.material, "dispose");
    const secondGeometryDispose = vi.spyOn(secondCase.geometry, "dispose");
    const secondMaterialDispose = vi.spyOn(secondCase.material, "dispose");

    disposeObjectTree(first.root);
    disposeObjectTree(first.root);

    expect(firstGeometryDispose).toHaveBeenCalledOnce();
    expect(firstMaterialDispose).toHaveBeenCalledOnce();
    expect(first.root.children).toHaveLength(0);
    expect(second.root.children).not.toHaveLength(0);
    expect(secondGeometryDispose).not.toHaveBeenCalled();
    expect(secondMaterialDispose).not.toHaveBeenCalled();
    disposeObjectTree(second.root);
    expect(secondGeometryDispose).toHaveBeenCalledOnce();
    expect(secondMaterialDispose).toHaveBeenCalledOnce();
  });

  it("rejeita identidades inválidas antes de anexar peças ou recursos", () => {
    const add = vi.spyOn(Group.prototype, "add");
    const invalidMovie = {
      entryId: "movie-01",
      instanceId: "library-movie:movie-01",
      modelTypeId: "series-record",
    } as unknown as ProceduralMovieRecordIdentity;
    const invalidSeries = {
      entryId: " ",
      instanceId: "library-series:blank",
      modelTypeId: "series-record",
    } as unknown as ProceduralSeriesRecordIdentity;

    expect(() => createProceduralMovieRecord(invalidMovie)).toThrow(
      "modelTypeId: movie-record",
    );
    expect(() => createProceduralSeriesRecord(invalidSeries)).toThrow(
      "entryId não vazio",
    );
    expect(() =>
      createProceduralWorkRecord({
        ...identities.work,
        instanceId: " ",
      }),
    ).toThrow("instanceId não vazio");
    expect(add).not.toHaveBeenCalled();
    add.mockRestore();
  });

  it("aceita somente as cinco identidades convencionais da BF-3B", () => {
    const all: readonly ProceduralLibraryRecordIdentity[] = [
      identities.movie,
      identities.series,
      identities.study,
      identities.physicalActivity,
      identities.work,
    ];
    expect(all.map(({ modelTypeId }) => modelTypeId)).toEqual([
      "movie-record",
      "series-record",
      "study-record",
      "physical-activity-record",
      "work-record",
    ]);
  });
});
