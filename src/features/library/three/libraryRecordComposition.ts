import { Group } from "three";

import type { LibraryRecordPlacement } from "../libraryRecordLayout";
import {
  createProceduralMovieRecord,
  createProceduralPhysicalActivityRecord,
  createProceduralSeriesRecord,
  createProceduralStudyRecord,
  createProceduralWorkRecord,
} from "./libraryRecordRepresentations";
import { disposeObjectTree } from "./referenceScene";

export interface LibraryRecordVisual {
  readonly entryId: string;
  readonly instanceId: string;
  readonly modelTypeId: LibraryRecordPlacement["modelTypeId"];
  /** Stable per-mount wrapper; BF-3D2 will add catalog and picking. */
  readonly node: Group;
}

export interface LibraryRecordComposition {
  readonly root: Group;
  readonly instances: readonly LibraryRecordVisual[];
}

function makeRepresentation(placement: LibraryRecordPlacement): Group {
  const identity = {
    entryId: placement.entryId,
    instanceId: placement.instanceId,
  };
  switch (placement.modelTypeId) {
    case "movie-record":
      return createProceduralMovieRecord({
        ...identity,
        modelTypeId: "movie-record",
      }).root;
    case "series-record":
      return createProceduralSeriesRecord({
        ...identity,
        modelTypeId: "series-record",
      }).root;
    case "study-record":
      return createProceduralStudyRecord({
        ...identity,
        modelTypeId: "study-record",
      }).root;
    case "physical-activity-record":
      return createProceduralPhysicalActivityRecord({
        ...identity,
        modelTypeId: "physical-activity-record",
      }).root;
    case "work-record":
      return createProceduralWorkRecord({
        ...identity,
        modelTypeId: "work-record",
      }).root;
    default:
      throw new Error("Modelo BF-3 desconhecido.");
  }
}

/**
 * Builds a detached and disposable root from approved BF-3B placements.
 * Overflow is absent by construction. Selection belongs to BF-3D2.
 */
export function createLibraryRecordComposition(
  placements: readonly LibraryRecordPlacement[],
): LibraryRecordComposition {
  const root = new Group();
  root.name = "library-record-composition";
  const instances: LibraryRecordVisual[] = [];
  const ids = new Set<string>();
  try {
    for (const placement of placements) {
      if (
        !placement.instanceId ||
        ids.has(placement.instanceId) ||
        !placement.position.every(Number.isFinite)
      ) {
        throw new Error("Placement BF-3 inválido ou duplicado.");
      }
      ids.add(placement.instanceId);
      const node = new Group();
      node.name = "library-record-instance:" + placement.instanceId;
      node.userData.libraryRecordInstanceId = placement.instanceId;
      node.position.set(...placement.position);
      root.add(node);
      node.add(makeRepresentation(placement));
      instances.push(
        Object.freeze({
          entryId: placement.entryId,
          instanceId: placement.instanceId,
          modelTypeId: placement.modelTypeId,
          node,
        }),
      );
    }
  } catch (error) {
    disposeObjectTree(root);
    throw error;
  }
  return Object.freeze({ root, instances: Object.freeze(instances) });
}
