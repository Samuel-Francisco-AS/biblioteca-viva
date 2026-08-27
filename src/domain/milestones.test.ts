// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
  DECORATION_ID,
  MILESTONE_ID,
  MilestoneEngine,
  REWARD_ID,
  STRUCTURAL_INVENTORY_FAMILY_ID,
  STRUCTURAL_MILESTONE_DEFINITIONS,
  createLibraryEntryCompletedEvent,
  createLibraryEntryCreatedEvent,
  createNoteCreatedEvent,
  createQuoteCreatedEvent,
  type DomainEvent,
  type MilestoneDefinition,
  type MilestoneFacts,
  type MilestoneRewardDefinition,
  type ReachedMilestone,
  evaluateStructuralMilestones,
} from "./index";

const facts: MilestoneFacts = Object.freeze({
  completedBooks: 1,
  totalBooks: 1,
  totalNotes: 1,
  totalQuotes: 1,
});

const rewards: readonly MilestoneRewardDefinition[] = Object.freeze([
  Object.freeze({
    decorationId: DECORATION_ID.readingLamp,
    id: "reward.first-completion-reading-lamp",
    type: "decoration",
  }),
]);

const definitions: readonly MilestoneDefinition[] = Object.freeze([
  {
    conditions: [{ fact: "totalBooks", operator: "gte", value: 1 }],
    eventType: "LibraryEntryCreated",
    id: MILESTONE_ID.firstBook,
    rewardIds: [],
    ruleVersion: 1,
  },
  {
    conditions: [{ fact: "totalNotes", operator: "gte", value: 1 }],
    eventType: "NoteCreated",
    id: MILESTONE_ID.firstNote,
    rewardIds: [],
    ruleVersion: 1,
  },
  {
    conditions: [{ fact: "totalQuotes", operator: "gte", value: 1 }],
    eventType: "QuoteCreated",
    id: MILESTONE_ID.firstQuote,
    rewardIds: [],
    ruleVersion: 1,
  },
  {
    conditions: [{ fact: "completedBooks", operator: "gte", value: 1 }],
    eventType: "LibraryEntryCompleted",
    id: MILESTONE_ID.firstCompletedBook,
    rewardIds: ["reward.first-completion-reading-lamp"],
    ruleVersion: 1,
  },
]);

const metadata = {
  aggregateId: "book-1",
  eventId: "event-1",
  occurredAt: "2026-08-10T12:00:00.000Z",
  revision: 1,
};

const events: readonly [
  DomainEvent,
  (typeof MILESTONE_ID)[keyof typeof MILESTONE_ID],
][] = [
  [
    createLibraryEntryCreatedEvent({
      ...metadata,
      payload: { entryType: "book", status: "planned" },
    }),
    MILESTONE_ID.firstBook,
  ],
  [
    createNoteCreatedEvent({ ...metadata, payload: { noteId: "note-1" } }),
    MILESTONE_ID.firstNote,
  ],
  [
    createQuoteCreatedEvent({ ...metadata, payload: { quoteId: "quote-1" } }),
    MILESTONE_ID.firstQuote,
  ],
  [
    createLibraryEntryCompletedEvent({
      ...metadata,
      payload: { entryType: "book", completedAt: metadata.occurredAt },
    }),
    MILESTONE_ID.firstCompletedBook,
  ],
];

describe("MilestoneEngine puro", () => {
  const engine = new MilestoneEngine();

  it.each(events)(
    "avalia os quatro eventos do protótipo",
    (event, expectedId) => {
      expect(
        engine.evaluate({ definitions, event, facts, reached: [], rewards }),
      ).toMatchObject([{ id: expectedId, ruleVersion: 1 }]);
    },
  );

  it("não alcança regra cuja condição ainda não existe", () => {
    expect(
      engine.evaluate({
        definitions,
        event: events[0][0],
        facts: { ...facts, totalBooks: 0 },
        reached: [],
        rewards,
      }),
    ).toEqual([]);
  });

  it("ordena múltiplas regras por ID de modo determinístico", () => {
    const duplicateEventDefinitions: readonly MilestoneDefinition[] = [
      definitions[3],
      { ...definitions[0], eventType: "LibraryEntryCompleted" },
    ];
    expect(
      engine
        .evaluate({
          definitions: duplicateEventDefinitions,
          event: events[3][0],
          facts,
          reached: [],
          rewards,
        })
        .map(({ id }) => id),
    ).toEqual([MILESTONE_ID.firstBook, MILESTONE_ID.firstCompletedBook]);
  });

  it("ignora estado já alcançado e reprocessamento sem mutar a entrada", () => {
    const first = engine.evaluate({
      definitions,
      event: events[3][0],
      facts,
      reached: [],
      rewards,
    });
    const reached: readonly ReachedMilestone[] = first;
    expect(
      engine.evaluate({
        definitions,
        event: events[3][0],
        facts,
        reached,
        rewards,
      }),
    ).toEqual([]);
    expect(first[0]?.rewards).toEqual([
      {
        decorationId: DECORATION_ID.readingLamp,
        id: "reward.first-completion-reading-lamp",
        type: "decoration",
      },
    ]);
  });

  it("duas avaliações concorrentes são explícitas e delegam unicidade à persistência", async () => {
    const evaluate = () =>
      Promise.resolve(
        engine.evaluate({
          definitions,
          event: events[3][0],
          facts,
          reached: [],
          rewards,
        }),
      );
    const [left, right] = await Promise.all([evaluate(), evaluate()]);
    expect(left).toEqual(right);
    expect(left).toHaveLength(1);
  });

  it("executa em Node sem DOM", () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");
  });
});

const structuralRewards: readonly MilestoneRewardDefinition[] = Object.freeze([
  ...rewards,
  {
    familyId: STRUCTURAL_INVENTORY_FAMILY_ID.floorWood,
    id: REWARD_ID.structureFirstActivityFloor,
    quantity: 12,
    type: "structure-grant",
  },
  {
    familyId: STRUCTURAL_INVENTORY_FAMILY_ID.wallShort,
    id: REWARD_ID.structureFirstActivityWallShort,
    quantity: 4,
    type: "structure-grant",
  },
  {
    familyId: STRUCTURAL_INVENTORY_FAMILY_ID.wallMedium,
    id: REWARD_ID.structureFirstActivityWallMedium,
    quantity: 2,
    type: "structure-grant",
  },
  {
    familyId: STRUCTURAL_INVENTORY_FAMILY_ID.floorWood,
    id: REWARD_ID.structureLibraryExpansionFloor,
    quantity: 20,
    type: "structure-grant",
  },
  {
    familyId: STRUCTURAL_INVENTORY_FAMILY_ID.wallMedium,
    id: REWARD_ID.structureLibraryExpansionWallMedium,
    quantity: 4,
    type: "structure-grant",
  },
  {
    familyId: STRUCTURAL_INVENTORY_FAMILY_ID.wallLong,
    id: REWARD_ID.structureLibraryExpansionWallLong,
    quantity: 2,
    type: "structure-grant",
  },
  {
    familyId: STRUCTURAL_INVENTORY_FAMILY_ID.cornerStone,
    id: REWARD_ID.structureLibraryExpansionCorner,
    quantity: 1,
    type: "structure-grant",
  },
  {
    familyId: STRUCTURAL_INVENTORY_FAMILY_ID.floorWood,
    id: REWARD_ID.structureNewSpaceFloor,
    quantity: 32,
    type: "structure-grant",
  },
  {
    familyId: STRUCTURAL_INVENTORY_FAMILY_ID.wallLong,
    id: REWARD_ID.structureNewSpaceWallLong,
    quantity: 4,
    type: "structure-grant",
  },
  {
    familyId: STRUCTURAL_INVENTORY_FAMILY_ID.cornerStone,
    id: REWARD_ID.structureNewSpaceCorner,
    quantity: 4,
    type: "structure-grant",
  },
  {
    familyId: STRUCTURAL_INVENTORY_FAMILY_ID.doorHorizontal,
    id: REWARD_ID.structureNewSpaceDoor,
    quantity: 1,
    type: "structure-grant",
  },
  {
    familyId: STRUCTURAL_INVENTORY_FAMILY_ID.floorWood,
    id: REWARD_ID.structureConsolidatedFloor,
    quantity: 48,
    type: "structure-grant",
  },
  {
    familyId: STRUCTURAL_INVENTORY_FAMILY_ID.wallLong,
    id: REWARD_ID.structureConsolidatedWallLong,
    quantity: 6,
    type: "structure-grant",
  },
  {
    familyId: STRUCTURAL_INVENTORY_FAMILY_ID.cornerStone,
    id: REWARD_ID.structureConsolidatedCorner,
    quantity: 4,
    type: "structure-grant",
  },
  {
    familyId: STRUCTURAL_INVENTORY_FAMILY_ID.doorHorizontal,
    id: REWARD_ID.structureConsolidatedDoor,
    quantity: 1,
    type: "structure-grant",
  },
]);

describe("marcos estruturais declarativos", () => {
  it.each([
    [0, []],
    [1, [MILESTONE_ID.structureFirstActivity]],
    [4, [MILESTONE_ID.structureFirstActivity]],
    [
      5,
      [
        MILESTONE_ID.structureFirstActivity,
        MILESTONE_ID.structureLibraryExpansion,
      ],
    ],
    [
      14,
      [
        MILESTONE_ID.structureFirstActivity,
        MILESTONE_ID.structureLibraryExpansion,
      ],
    ],
    [
      15,
      [
        MILESTONE_ID.structureFirstActivity,
        MILESTONE_ID.structureLibraryExpansion,
        MILESTONE_ID.structureNewSpace,
      ],
    ],
    [
      29,
      [
        MILESTONE_ID.structureFirstActivity,
        MILESTONE_ID.structureLibraryExpansion,
        MILESTONE_ID.structureNewSpace,
      ],
    ],
    [
      30,
      [
        MILESTONE_ID.structureConsolidated,
        MILESTONE_ID.structureFirstActivity,
        MILESTONE_ID.structureLibraryExpansion,
        MILESTONE_ID.structureNewSpace,
      ],
    ],
  ] as const)("avalia limiar %i sem duplicar", (count, expected) => {
    expect(
      evaluateStructuralMilestones({
        definitions: STRUCTURAL_MILESTONE_DEFINITIONS,
        facts: { eligibleCompletedSessionCount: count },
        reached: [],
        reachedAt: metadata.occurredAt,
        rewards: structuralRewards,
        sourceEventId: metadata.eventId,
      }).map(({ id }) => id),
    ).toEqual([...expected].sort());
  });

  it("mantém histórico alcançado e concede payloads exatos", () => {
    const reached = evaluateStructuralMilestones({
      definitions: STRUCTURAL_MILESTONE_DEFINITIONS,
      facts: { eligibleCompletedSessionCount: 5 },
      reached: [],
      reachedAt: metadata.occurredAt,
      rewards: structuralRewards,
      sourceEventId: metadata.eventId,
    });
    expect(
      evaluateStructuralMilestones({
        definitions: STRUCTURAL_MILESTONE_DEFINITIONS,
        facts: { eligibleCompletedSessionCount: 30 },
        reached,
        reachedAt: metadata.occurredAt,
        rewards: structuralRewards,
        sourceEventId: metadata.eventId,
      }).map(({ id }) => id),
    ).toEqual([
      MILESTONE_ID.structureConsolidated,
      MILESTONE_ID.structureNewSpace,
    ]);
    expect(reached[0]?.rewards).toEqual(
      expect.arrayContaining([
        {
          familyId: STRUCTURAL_INVENTORY_FAMILY_ID.floorWood,
          id: REWARD_ID.structureFirstActivityFloor,
          quantity: 12,
          type: "structure-grant",
        },
      ]),
    );
  });
});
