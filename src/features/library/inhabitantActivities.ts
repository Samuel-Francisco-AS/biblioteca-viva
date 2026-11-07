import { SCENIC_BOOK_ANCHORS } from "./three/libraryFurnishingLayout";
import {
  LIBRARY_ACTIVITY_POINTS,
  LIBRARY_ACTIVITY_ZONES,
} from "./librarySpatialLayout";
import type { Position } from "./inhabitantNavigation";
import type { InhabitantKey } from "./inhabitants";

/** Authored activity catalog only: no movement, leases, agent state or renderer.
 * Geometry anchors remain shared with the furniture and visual composition. */
type TaskKind =
  "study" | "reading" | "rest" | "observation" | "plant" | "experiment";
export interface Task {
  readonly id: string;
  readonly kind: TaskKind;
  readonly position: Position;
  readonly facing: number;
  readonly label: string;
  readonly objectId?: string;
  readonly nightLampId?: string;
  readonly sessionReading?: {
    readonly sessionId: string;
    readonly bookId: string;
    readonly source: Position;
  };
  readonly interaction?: {
    readonly source: Position;
    readonly approach: Position;
    readonly destination: Position;
    readonly reach: number;
  };
}
export const tasks: readonly Task[] = [
  ...LIBRARY_ACTIVITY_POINTS.flatMap((p) => {
    const z = LIBRARY_ACTIVITY_ZONES.find((z) => z.id === p.zoneId);
    if (!z || z.activity === "circulation") return [];
    const interaction =
      p.id === "bf4-point:c-study"
        ? {
            source: SCENIC_BOOK_ANCHORS.source,
            approach: SCENIC_BOOK_ANCHORS.approach,
            destination: SCENIC_BOOK_ANCHORS.destinationApproach,
            reach: 1.5,
          }
        : undefined;
    const position = interaction?.approach ?? { x: p.x, z: p.z };
    return [
      {
        id: p.id,
        kind: z.activity,
        position,
        facing: p.facing,
        label:
          z.activity === "study"
            ? "atividade em prop de estudo"
            : z.activity === "reading"
              ? "leitura de ficção cenográfica"
              : z.activity === "rest"
                ? "repouso e observação tranquila"
                : "observação dos mecanismos",
        ...(p.id.endsWith("d-study") ? { objectId: "living:globe" } : {}),
        ...(interaction ? { objectId: "living:book", interaction } : {}),
      },
    ];
  }),
  {
    id: "clock-inspection",
    kind: "observation",
    position: { x: -15.2, z: -6.8 },
    facing: -Math.PI / 2,
    label: "inspeção do relógio cenográfico",
    objectId: "living:clock",
  },
  {
    id: "care-star-plant",
    kind: "plant",
    position: { x: -11.7, z: 5.6 },
    facing: Math.PI,
    label: "cuidado da planta estrelada",
    objectId: "living:plant",
  },
  {
    id: "lua-practice",
    kind: "experiment",
    position: { x: -13, z: 10 },
    facing: Math.PI,
    label: "ensaio mágico sobre folha de treino",
    objectId: "living:globe",
  },
];
export const preferences: Readonly<
  Record<InhabitantKey, Readonly<Record<TaskKind, number>>>
> = {
  samael: {
    study: 9,
    reading: 4,
    rest: 7,
    observation: 8,
    plant: 2,
    experiment: 0,
  },
  aryn: {
    study: 9,
    reading: 8,
    rest: 3,
    observation: 7,
    plant: 6,
    experiment: 0,
  },
  ytha: {
    study: 3,
    reading: 8,
    rest: 7,
    observation: 5,
    plant: 12,
    experiment: 0,
  },
  lua: {
    study: 10,
    reading: 7,
    rest: 4,
    observation: 7,
    plant: 6,
    experiment: 12,
  },
};
