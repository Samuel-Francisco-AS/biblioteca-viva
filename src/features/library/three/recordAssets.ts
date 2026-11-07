import { createProceduralBookVolume } from "./proceduralContent";
import {
  createProceduralMovieRecord,
  createProceduralSeriesRecord,
  createProceduralStudyRecord,
  createProceduralPhysicalActivityRecord,
  createProceduralWorkRecord,
} from "./libraryRecordRepresentations";
import type {
  RecordAssetFactory,
  RecordAssetIdentity,
  RecordAssetType,
} from "./recordAssetContract";
/** Stateless factory registry. No asset/resource cache and no identity derived from appearance. */
export const RECORD_ASSETS = {
  "book-volume": createProceduralBookVolume,
  "movie-record": createProceduralMovieRecord,
  "series-record": createProceduralSeriesRecord,
  "study-record": createProceduralStudyRecord,
  "physical-activity-record": createProceduralPhysicalActivityRecord,
  "work-record": createProceduralWorkRecord,
} satisfies {
  [T in RecordAssetType]: RecordAssetFactory<RecordAssetIdentity<T>>;
};

export function createRecordAsset(identity: RecordAssetIdentity) {
  switch (identity.modelTypeId) {
    case "book-volume":
      return RECORD_ASSETS["book-volume"]({
        ...identity,
        modelTypeId: "book-volume",
      });
    case "movie-record":
      return RECORD_ASSETS["movie-record"]({
        ...identity,
        modelTypeId: "movie-record",
      });
    case "series-record":
      return RECORD_ASSETS["series-record"]({
        ...identity,
        modelTypeId: "series-record",
      });
    case "study-record":
      return RECORD_ASSETS["study-record"]({
        ...identity,
        modelTypeId: "study-record",
      });
    case "physical-activity-record":
      return RECORD_ASSETS["physical-activity-record"]({
        ...identity,
        modelTypeId: "physical-activity-record",
      });
    case "work-record":
      return RECORD_ASSETS["work-record"]({
        ...identity,
        modelTypeId: "work-record",
      });
  }
  throw new Error("Modelo BF-3 desconhecido.");
}
