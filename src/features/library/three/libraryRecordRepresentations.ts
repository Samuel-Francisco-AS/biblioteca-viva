import { createRecordArtifact } from "./recordArtifactModels";
import {
  bindRecordSpatial,
  recordSpatial,
  type RecordAsset,
} from "./recordAssetContract";
import type {
  MovieWorldEntry,
  PhysicalActivityWorldEntry,
  SeriesWorldEntry,
  StudyWorldEntry,
  WorkWorldEntry,
} from "../libraryWorldEntryContract";
import { getProceduralLibraryRecordDimensions } from "./libraryRecordDimensions";

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

type ProceduralLibraryRecordRepresentation<
  TIdentity extends ProceduralLibraryRecordIdentity,
> = RecordAsset<TIdentity>;

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

const ASSET_IDS = {
  "movie-record": "bv:records/memory-projector-v1",
  "series-record": "bv:records/episodic-receiver-v1",
  "study-record": "bv:records/research-folio-v1",
  "physical-activity-record": "bv:records/training-weight-v1",
  "work-record": "bv:records/artisan-toolkit-v1",
} as const;
function create<T extends ProceduralLibraryRecordIdentity>(
  identity: T,
  expected: T["modelTypeId"],
): RecordAsset<T> {
  if (identity.modelTypeId !== expected)
    throw new Error(
      `A representação procedural exige modelTypeId: ${expected}.`,
    );
  if (typeof identity.instanceId !== "string" || !identity.instanceId.trim())
    throw new Error("A representação procedural exige instanceId não vazio.");
  if (typeof identity.entryId !== "string" || !identity.entryId.trim())
    throw new Error("A representação procedural exige entryId não vazio.");
  const dimensions = getProceduralLibraryRecordDimensions(expected);
  const { root, scale, materials } = createRecordArtifact(expected, dimensions);
  root.name = `procedural-${expected}`;
  const spatial = recordSpatial(
    dimensions,
    expected === "physical-activity-record" ? 0.54 : dimensions.depth,
  );
  bindRecordSpatial(root, spatial);
  return {
    assetId: ASSET_IDS[expected],
    identity,
    dimensions,
    root,
    spatial,
    materials,
    pivot: [0, 0, 0],
    scale,
    orientation: [0, 0, 0],
  };
}
export function createProceduralMovieRecord(
  identity: ProceduralMovieRecordIdentity,
): ProceduralMovieRecord {
  return create(identity, "movie-record");
}
export function createProceduralSeriesRecord(
  identity: ProceduralSeriesRecordIdentity,
): ProceduralSeriesRecord {
  return create(identity, "series-record");
}
export function createProceduralStudyRecord(
  identity: ProceduralStudyRecordIdentity,
): ProceduralStudyRecord {
  return create(identity, "study-record");
}
export function createProceduralPhysicalActivityRecord(
  identity: ProceduralPhysicalActivityRecordIdentity,
): ProceduralPhysicalActivityRecord {
  return create(identity, "physical-activity-record");
}
export function createProceduralWorkRecord(
  identity: ProceduralWorkRecordIdentity,
): ProceduralWorkRecord {
  return create(identity, "work-record");
}
