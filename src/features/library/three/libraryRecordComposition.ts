import { Group } from "three";

import type { LibraryRecordPlacement } from "../libraryRecordLayout";
import { createRecordAsset } from "./recordAssets";
import { batchStaticVisual } from "./staticVisuals";
import {
  validateRecordReplacement,
  type RecordAsset,
  type RecordAssetFactory,
  type RecordAssetIdentity,
} from "./recordAssetContract";
import { disposeObjectTree } from "./referenceScene";

export interface LibraryRecordVisual {
  readonly entryId: string;
  readonly instanceId: string;
  readonly modelTypeId: LibraryRecordPlacement["modelTypeId"];
  /** Stable per-mount wrapper used by the runtime catalog and picking. */
  readonly node: Group;
  representation: RecordAsset;
}

export interface LibraryRecordComposition {
  readonly root: Group;
  readonly instances: readonly LibraryRecordVisual[];
}

function makeRepresentation(placement: LibraryRecordPlacement): RecordAsset {
  return createRecordAsset({
    entryId: placement.entryId,
    instanceId: placement.instanceId,
    modelTypeId: placement.modelTypeId,
  });
}

/**
 * Builds a detached and disposable root from approved BF-3B placements.
 * Overflow is absent by construction; the runtime registers attached wrappers.
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
      const representation = makeRepresentation(placement);
      batchStaticVisual(representation.root);
      node.add(representation.root);
      instances.push({
        representation,
        entryId: placement.entryId,
        instanceId: placement.instanceId,
        modelTypeId: placement.modelTypeId,
        node,
      });
    }
  } catch (error) {
    disposeObjectTree(root);
    throw error;
  }
  return Object.freeze({ root, instances: Object.freeze(instances) });
}

/** Preserve the registered wrapper; R1 picking visits its current children. */
export function replaceLibraryRecordRepresentation(
  visual: LibraryRecordVisual,
  factory: RecordAssetFactory,
): void {
  const identity: RecordAssetIdentity = {
    entryId: visual.entryId,
    instanceId: visual.instanceId,
    modelTypeId: visual.modelTypeId,
  };
  const replacement = factory(identity);
  if (replacement.root === visual.representation.root)
    throw new Error("A substituição exige um asset independente.");
  try {
    validateRecordReplacement(
      replacement,
      identity,
      visual.representation.dimensions,
    );
    if (replacement.animation)
      throw new Error("Este perfil de registro é estático.");
    const current = visual.representation.spatial.navigation,
      next = replacement.spatial.navigation;
    if (
      current.length !== next.length ||
      current.some((box, i) => !box.equals(next[i]))
    )
      throw new Error("Substituição visual exige o mesmo contrato navegável.");
    batchStaticVisual(replacement.root);
    visual.node.add(replacement.root);
  } catch (error) {
    if (!replacement.root.parent) disposeObjectTree(replacement.root);
    throw error;
  }
  const previous = visual.representation;
  visual.representation = replacement;
  disposeObjectTree(previous.root);
}
