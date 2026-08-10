import { parseContentCatalog } from "./schemas";
import { PT_BR_MESSAGES } from "./locales/pt-BR";
import { DECORATION_ID, MILESTONE_ID, REWARD_ID } from "../domain";

const rawPrototypeContent = {
  version: 1,
  defaultLocale: "pt-BR",
  characters: [
    {
      id: "character.librarian",
      nameKey: "character.librarian.name",
      eyebrowKey: "character.librarian.eyebrow",
      panelTitleKey: "character.librarian.panel-title",
      dialogueEvents: ["librarian.interaction", "book.first-completed"],
    },
    {
      id: "character.creature",
      nameKey: "character.creature.name",
      eyebrowKey: "character.creature.eyebrow",
      panelTitleKey: "character.creature.panel-title",
      dialogueEvents: ["creature.interaction"],
    },
  ],
  rooms: [
    {
      id: "room.main",
      nameKey: "room.main.name",
      characterIds: ["character.librarian", "character.creature"],
      decorationIds: [DECORATION_ID.readingLamp],
    },
  ],
  decorations: [
    {
      id: DECORATION_ID.readingLamp,
      nameKey: "decoration.reading-lamp.name",
      descriptionKey: "decoration.reading-lamp.description",
      state: "unlockable",
    },
  ],
  interfaceTexts: [
    { id: "interface.dialogue.close", textKey: "interface.dialogue.close" },
    {
      id: "interface.content.missing",
      textKey: "interface.content.missing",
    },
  ],
  rewards: [
    {
      id: REWARD_ID.firstCompletionReadingLamp,
      type: "decoration",
      decorationId: DECORATION_ID.readingLamp,
    },
  ],
  milestones: [
    {
      id: MILESTONE_ID.firstBook,
      eventType: "LibraryEntryCreated",
      conditions: [{ fact: "totalBooks", operator: "gte", value: 1 }],
      rewardIds: [],
      ruleVersion: 1,
    },
    {
      id: MILESTONE_ID.firstNote,
      eventType: "NoteCreated",
      conditions: [{ fact: "totalNotes", operator: "gte", value: 1 }],
      rewardIds: [],
      ruleVersion: 1,
    },
    {
      id: MILESTONE_ID.firstQuote,
      eventType: "QuoteCreated",
      conditions: [{ fact: "totalQuotes", operator: "gte", value: 1 }],
      rewardIds: [],
      ruleVersion: 1,
    },
    {
      id: MILESTONE_ID.firstCompletedBook,
      eventType: "LibraryEntryCompleted",
      conditions: [{ fact: "completedBooks", operator: "gte", value: 1 }],
      rewardIds: [REWARD_ID.firstCompletionReadingLamp],
      ruleVersion: 1,
    },
  ],
  fallbacks: {
    "librarian.interaction": "dialogue.librarian.fallback",
    "creature.interaction": "dialogue.creature.fallback",
    "book.first-completed": "dialogue.librarian.fallback",
  },
  dialogues: [
    {
      id: "dialogue.librarian.first-completion",
      characterId: "character.librarian",
      textKey: "dialogue.librarian.first-completion",
      events: ["librarian.interaction", "book.first-completed"],
      conditions: [{ fact: "completedBooks", operator: "gte", value: 1 }],
      priority: 120,
      once: true,
      cooldownHours: 0,
    },
    {
      id: "dialogue.librarian.return-after-days",
      characterId: "character.librarian",
      textKey: "dialogue.librarian.return-after-days",
      events: ["librarian.interaction"],
      conditions: [{ fact: "daysSinceLastVisit", operator: "gte", value: 3 }],
      priority: 110,
      once: false,
      cooldownHours: 72,
    },
    {
      id: "dialogue.librarian.empty",
      characterId: "character.librarian",
      textKey: "dialogue.librarian.empty",
      events: ["librarian.interaction"],
      conditions: [{ fact: "totalBooks", operator: "eq", value: 0 }],
      priority: 100,
      once: false,
      cooldownHours: 6,
    },
    {
      id: "dialogue.librarian.first-book",
      characterId: "character.librarian",
      textKey: "dialogue.librarian.first-book",
      events: ["librarian.interaction"],
      conditions: [{ fact: "totalBooks", operator: "eq", value: 1 }],
      priority: 115,
      once: true,
      cooldownHours: 0,
    },
    {
      id: "dialogue.librarian.in-progress",
      characterId: "character.librarian",
      textKey: "dialogue.librarian.in-progress",
      events: ["librarian.interaction"],
      conditions: [{ fact: "inProgressBooks", operator: "gte", value: 1 }],
      priority: 70,
      once: false,
      cooldownHours: 6,
    },
    ...[
      "dialogue.librarian.general-light",
      "dialogue.librarian.general-patience",
      "dialogue.librarian.general-presence",
    ].map((id) => ({
      id,
      characterId: "character.librarian",
      textKey: id,
      events: ["librarian.interaction"],
      conditions: [],
      priority: 10,
      once: false,
      cooldownHours: 0.02,
    })),
    {
      id: "dialogue.librarian.fallback",
      characterId: "character.librarian",
      textKey: "dialogue.librarian.fallback",
      events: ["librarian.interaction", "book.first-completed"],
      conditions: [],
      priority: 0,
      once: false,
      cooldownHours: 0,
    },
    ...[
      "dialogue.creature.circles",
      "dialogue.creature.listens",
      "dialogue.creature.observes",
    ].map((id) => ({
      id,
      characterId: "character.creature",
      textKey: id,
      events: ["creature.interaction"],
      conditions: [],
      priority: 10,
      once: false,
      cooldownHours: 0.02,
    })),
    {
      id: "dialogue.creature.fallback",
      characterId: "character.creature",
      textKey: "dialogue.creature.fallback",
      events: ["creature.interaction"],
      conditions: [],
      priority: 0,
      once: false,
      cooldownHours: 0,
    },
  ],
  locales: [{ locale: "pt-BR", messages: PT_BR_MESSAGES }],
} as const;

/** Parsing at module load makes invalid shipped content fail early. */
export const PROTOTYPE_CONTENT = parseContentCatalog(rawPrototypeContent);
