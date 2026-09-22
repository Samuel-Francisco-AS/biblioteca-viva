import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  type BufferGeometry,
} from "three";

import type {
  MovieWorldEntry,
  PhysicalActivityWorldEntry,
  SeriesWorldEntry,
  StudyWorldEntry,
  WorkWorldEntry,
} from "../libraryWorldEntryContract";
import {
  getProceduralLibraryRecordDimensions,
  type LibraryRecordModelTypeId,
  type ProceduralLibraryRecordDimensions,
} from "./libraryRecordDimensions";

export {
  getProceduralLibraryRecordDimensions,
  type ProceduralLibraryRecordDimensions,
} from "./libraryRecordDimensions";

export type ProceduralMovieRecordIdentity = Pick<
  MovieWorldEntry,
  "entryId" | "instanceId" | "modelTypeId"
>;
export type ProceduralSeriesRecordIdentity = Pick<
  SeriesWorldEntry,
  "entryId" | "instanceId" | "modelTypeId"
>;
export type ProceduralStudyRecordIdentity = Pick<
  StudyWorldEntry,
  "entryId" | "instanceId" | "modelTypeId"
>;
export type ProceduralPhysicalActivityRecordIdentity = Pick<
  PhysicalActivityWorldEntry,
  "entryId" | "instanceId" | "modelTypeId"
>;
export type ProceduralWorkRecordIdentity = Pick<
  WorkWorldEntry,
  "entryId" | "instanceId" | "modelTypeId"
>;

export type ProceduralLibraryRecordIdentity =
  | ProceduralMovieRecordIdentity
  | ProceduralSeriesRecordIdentity
  | ProceduralStudyRecordIdentity
  | ProceduralPhysicalActivityRecordIdentity
  | ProceduralWorkRecordIdentity;

interface ProceduralLibraryRecordRepresentation<
  TIdentity extends ProceduralLibraryRecordIdentity,
> {
  readonly dimensions: Readonly<ProceduralLibraryRecordDimensions>;
  readonly identity: TIdentity;
  readonly root: Group;
}

export type ProceduralMovieRecord =
  ProceduralLibraryRecordRepresentation<ProceduralMovieRecordIdentity>;
export type ProceduralSeriesRecord =
  ProceduralLibraryRecordRepresentation<ProceduralSeriesRecordIdentity>;
export type ProceduralStudyRecord =
  ProceduralLibraryRecordRepresentation<ProceduralStudyRecordIdentity>;
export type ProceduralPhysicalActivityRecord =
  ProceduralLibraryRecordRepresentation<ProceduralPhysicalActivityRecordIdentity>;
export type ProceduralWorkRecord =
  ProceduralLibraryRecordRepresentation<ProceduralWorkRecordIdentity>;

type RecordModelTypeId = LibraryRecordModelTypeId;
type RecordGeometry = BoxGeometry | CylinderGeometry;

interface BoxPart {
  readonly geometry: RecordGeometry;
  readonly material: MeshStandardMaterial;
  readonly name: string;
  readonly position: readonly [number, number, number];
}

interface RecordSpec {
  readonly dimensions: Readonly<ProceduralLibraryRecordDimensions>;
  readonly rootName: string;
}

const RECORD_SPECS: Readonly<Record<RecordModelTypeId, RecordSpec>> =
  Object.freeze({
    "movie-record": Object.freeze({
      dimensions: getProceduralLibraryRecordDimensions("movie-record"),
      rootName: "procedural-movie-record",
    }),
    "physical-activity-record": Object.freeze({
      dimensions: getProceduralLibraryRecordDimensions(
        "physical-activity-record",
      ),
      rootName: "procedural-physical-activity-record",
    }),
    "series-record": Object.freeze({
      dimensions: getProceduralLibraryRecordDimensions("series-record"),
      rootName: "procedural-series-record",
    }),
    "study-record": Object.freeze({
      dimensions: getProceduralLibraryRecordDimensions("study-record"),
      rootName: "procedural-study-record",
    }),
    "work-record": Object.freeze({
      dimensions: getProceduralLibraryRecordDimensions("work-record"),
      rootName: "procedural-work-record",
    }),
  });

function addPart(root: Group, part: BoxPart): Mesh<BufferGeometry> {
  const mesh = new Mesh(part.geometry, part.material);
  mesh.name = part.name;
  mesh.position.set(...part.position);
  root.add(mesh);
  return mesh;
}

function createMaterial(color: number): MeshStandardMaterial {
  return new MeshStandardMaterial({ color, metalness: 0, roughness: 0.8 });
}

function validateIdentity(
  identity: ProceduralLibraryRecordIdentity,
  modelTypeId: RecordModelTypeId,
): void {
  if (identity.modelTypeId !== modelTypeId) {
    throw new Error(
      `A representação procedural exige modelTypeId: ${modelTypeId}.`,
    );
  }
  if (
    typeof identity.instanceId !== "string" ||
    identity.instanceId.trim().length === 0
  ) {
    throw new Error("A representação procedural exige instanceId não vazio.");
  }
  if (
    typeof identity.entryId !== "string" ||
    identity.entryId.trim().length === 0
  ) {
    throw new Error("A representação procedural exige entryId não vazio.");
  }
}

function createRoot<TIdentity extends ProceduralLibraryRecordIdentity>(
  identity: TIdentity,
  modelTypeId: TIdentity["modelTypeId"],
): ProceduralLibraryRecordRepresentation<TIdentity> {
  validateIdentity(identity, modelTypeId);
  const spec = RECORD_SPECS[modelTypeId];
  const root = new Group();
  root.name = spec.rootName;
  return { dimensions: spec.dimensions, identity, root };
}

/**
 * Creates an unattached audiovisual panel for a conventional movie record.
 * The attaching caller becomes the root owner and releases it with
 * `disposeObjectTree()`; this call owns no resource shared with another call.
 */
export function createProceduralMovieRecord(
  identity: ProceduralMovieRecordIdentity,
): ProceduralMovieRecord {
  const representation = createRoot(identity, "movie-record");
  const housing = createMaterial(0x29363d);
  const screen = createMaterial(0x5d8da0);
  addPart(representation.root, {
    geometry: new BoxGeometry(0.56, 0.06, 0.24),
    material: housing,
    name: "movie-media-base",
    position: [0, 0.03, 0],
  });
  addPart(representation.root, {
    geometry: new BoxGeometry(0.72, 0.42, 0.12),
    material: housing,
    name: "movie-media-panel",
    position: [0, 0.27, 0],
  });
  addPart(representation.root, {
    geometry: new BoxGeometry(0.58, 0.28, 0.016),
    material: screen,
    name: "movie-screen-inset",
    position: [0, 0.27, 0.068],
  });
  return representation;
}

/**
 * Creates an unattached three-case media family for a conventional series.
 * Its repeated cases distinguish it structurally from the single movie panel.
 */
export function createProceduralSeriesRecord(
  identity: ProceduralSeriesRecordIdentity,
): ProceduralSeriesRecord {
  const representation = createRoot(identity, "series-record");
  const caseMaterial = createMaterial(0x445770);
  const stripeMaterial = createMaterial(0xa8bb8b);
  addPart(representation.root, {
    geometry: new BoxGeometry(0.66, 0.06, 0.2),
    material: caseMaterial,
    name: "series-media-base",
    position: [0, 0.03, 0],
  });
  for (const x of [-0.22, 0, 0.22]) {
    addPart(representation.root, {
      geometry: new BoxGeometry(0.18, 0.44, 0.13),
      material: caseMaterial,
      name: "series-media-case",
      position: [x, 0.28, 0],
    });
    addPart(representation.root, {
      geometry: new BoxGeometry(0.13, 0.07, 0.012),
      material: stripeMaterial,
      name: "series-episode-marker",
      position: [x, 0.28, 0.071],
    });
  }
  return representation;
}

/** Creates an unattached, locally grounded notebook for a study record. */
export function createProceduralStudyRecord(
  identity: ProceduralStudyRecordIdentity,
): ProceduralStudyRecord {
  const representation = createRoot(identity, "study-record");
  const cover = createMaterial(0x587c69);
  const pages = createMaterial(0xd9ceb4);
  addPart(representation.root, {
    geometry: new BoxGeometry(0.52, 0.016, 0.4),
    material: cover,
    name: "study-notebook-bottom-cover",
    position: [0, 0.008, 0],
  });
  addPart(representation.root, {
    geometry: new BoxGeometry(0.48, 0.1, 0.34),
    material: pages,
    name: "study-notebook-pages",
    position: [0, 0.066, 0],
  });
  addPart(representation.root, {
    geometry: new BoxGeometry(0.52, 0.016, 0.4),
    material: cover,
    name: "study-notebook-top-cover",
    position: [0, 0.124, 0],
  });
  addPart(representation.root, {
    geometry: new BoxGeometry(0.04, 0.132, 0.4),
    material: cover,
    name: "study-notebook-spine",
    position: [-0.28, 0.066, 0],
  });
  return representation;
}

/**
 * Creates an unattached trail-style marker for a physical-activity record.
 * It deliberately denotes movement/activity without choosing a sport or
 * strength-training symbol.
 */
export function createProceduralPhysicalActivityRecord(
  identity: ProceduralPhysicalActivityRecordIdentity,
): ProceduralPhysicalActivityRecord {
  const representation = createRoot(identity, "physical-activity-record");
  const post = createMaterial(0x8c6246);
  const marker = createMaterial(0xc28d45);
  addPart(representation.root, {
    geometry: new CylinderGeometry(0.2, 0.2, 0.05, 12),
    material: post,
    name: "activity-marker-base",
    position: [0, 0.025, 0],
  });
  addPart(representation.root, {
    geometry: new CylinderGeometry(0.05, 0.05, 0.42, 10),
    material: post,
    name: "activity-marker-post",
    position: [0, 0.26, 0],
  });
  addPart(representation.root, {
    geometry: new BoxGeometry(0.46, 0.12, 0.1),
    material: marker,
    name: "activity-direction-marker",
    position: [0, 0.53, 0],
  });
  return representation;
}

/** Creates an unattached folder and file stack for a work record. */
export function createProceduralWorkRecord(
  identity: ProceduralWorkRecordIdentity,
): ProceduralWorkRecord {
  const representation = createRoot(identity, "work-record");
  const folder = createMaterial(0x9a7143);
  const papers = createMaterial(0xd8cbb0);
  addPart(representation.root, {
    geometry: new BoxGeometry(0.6, 0.05, 0.4),
    material: folder,
    name: "work-folder-base",
    position: [0, 0.025, 0],
  });
  addPart(representation.root, {
    geometry: new BoxGeometry(0.52, 0.18, 0.32),
    material: papers,
    name: "work-file-stack",
    position: [0, 0.14, 0],
  });
  addPart(representation.root, {
    geometry: new BoxGeometry(0.6, 0.1, 0.025),
    material: folder,
    name: "work-folder-front",
    position: [0, 0.1, 0.1875],
  });
  addPart(representation.root, {
    geometry: new BoxGeometry(0.16, 0.07, 0.05),
    material: folder,
    name: "work-folder-tab",
    position: [0.12, 0.265, -0.05],
  });
  return representation;
}
