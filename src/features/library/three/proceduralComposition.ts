import { Group } from "three";

import * as proceduralContent from "./proceduralContent";
import {
  type ProceduralBookshelf,
  type ProceduralBookshelfVariant,
  type ProceduralContentIdentity,
} from "./proceduralContent";
import { disposeObjectTree } from "./referenceScene";

export type ProceduralContentPosition = readonly [
  x: number,
  y: number,
  z: number,
];

/** A Three-independent declaration of one procedural world occurrence. */
export interface ProceduralContentDefinition {
  readonly identity: ProceduralContentIdentity;
  readonly position: ProceduralContentPosition;
  readonly variant: ProceduralBookshelfVariant;
}

export interface ProceduralCompositionInstance {
  readonly identity: ProceduralContentIdentity;
  readonly node: Group;
  readonly position: ProceduralContentPosition;
  representation: ProceduralBookshelf;
  variant: ProceduralBookshelfVariant;
}

export interface ProceduralComposition {
  readonly instances: readonly ProceduralCompositionInstance[];
  readonly root: Group;
}

export type ProceduralRepresentationReplacement = "replaced" | "unchanged";

export const READING_SHELF_COMPOSITION_DEFINITIONS: readonly ProceduralContentDefinition[] =
  Object.freeze([
    Object.freeze({
      identity: Object.freeze({
        instanceId: "reading-shelf-01",
        modelTypeId: "bookshelf" as const,
      }),
      position: Object.freeze([-3, 0, -2] as [number, number, number]),
      variant: "reading-balanced",
    }),
    Object.freeze({
      identity: Object.freeze({
        instanceId: "reading-shelf-02",
        modelTypeId: "bookshelf" as const,
      }),
      position: Object.freeze([0, 0, -2] as [number, number, number]),
      variant: "reading-dark-tall",
    }),
    Object.freeze({
      identity: Object.freeze({
        instanceId: "reading-shelf-03",
        modelTypeId: "bookshelf" as const,
      }),
      position: Object.freeze([3, 0, -2.1] as [number, number, number]),
      variant: "reading-light-wide",
    }),
  ]);

function validateDefinitions(
  definitions: readonly ProceduralContentDefinition[],
): void {
  const instanceIds = new Set<string>();
  for (const { identity, position } of definitions) {
    if (identity.instanceId.trim().length === 0) {
      throw new Error("A composição procedural contém instanceId vazio.");
    }
    if (instanceIds.has(identity.instanceId)) {
      throw new Error(
        `A composição procedural contém instanceId duplicado: ${identity.instanceId}.`,
      );
    }
    if (!position.every(Number.isFinite)) {
      throw new Error(
        `A composição procedural contém posição não finita: ${identity.instanceId}.`,
      );
    }
    instanceIds.add(identity.instanceId);
  }
}

/**
 * Creates an unattached composition from declarative content definitions.
 *
 * The returned composition root owns every representation created here and is
 * released with `disposeObjectTree()`. Position lives on an instance wrapper,
 * preserving each factory root's local identity and grounded geometry.
 */
export function createProceduralComposition(
  definitions: readonly ProceduralContentDefinition[],
): ProceduralComposition {
  validateDefinitions(definitions);

  const root = new Group();
  root.name = "procedural-content-composition";
  const instances: ProceduralCompositionInstance[] = [];

  for (const definition of definitions) {
    const representation = proceduralContent.createProceduralBookshelf(
      definition.identity,
      definition.variant,
    );
    const node = new Group();
    node.name = "procedural-content-instance";
    node.position.set(...definition.position);
    node.add(representation.root);
    root.add(node);
    instances.push({
      identity: representation.identity,
      node,
      position: [...definition.position],
      representation,
      variant: definition.variant,
    });
  }

  return { instances, root };
}

/**
 * Replaces one attached bookshelf representation while retaining its stable
 * composition wrapper and logical identity.
 *
 * The composition owns each representation root. The successor is created
 * before the current root is touched; after attaching it to the same wrapper,
 * ownership is updated and only then is the predecessor released.
 */
export function replaceProceduralBookshelfRepresentation(
  composition: ProceduralComposition,
  instanceId: string,
  variant: string,
): ProceduralRepresentationReplacement {
  const instance = composition.instances.find(
    ({ identity }) => identity.instanceId === instanceId,
  );
  if (!instance) {
    throw new Error(
      `A composição procedural não possui instanceId: ${instanceId}.`,
    );
  }
  if (!proceduralContent.isProceduralBookshelfVariant(variant)) {
    throw new Error(`Variante procedural de estante desconhecida: ${variant}.`);
  }
  if (instance.variant === variant) return "unchanged";

  // Factory failures leave the attached representation as the sole owner.
  const replacement = proceduralContent.createProceduralBookshelf(
    instance.identity,
    variant,
  );
  try {
    instance.node.add(replacement.root);
  } catch (error) {
    disposeObjectTree(replacement.root);
    throw error;
  }

  const previous = instance.representation;
  instance.representation = replacement;
  instance.variant = replacement.variant;
  disposeObjectTree(previous.root);
  return "replaced";
}
