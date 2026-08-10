import type { Clock } from "./ports";

export const DIALOGUE_EVENTS = [
  "librarian.interaction",
  "creature.interaction",
  "book.first-completed",
] as const;

export type DialogueEvent = (typeof DIALOGUE_EVENTS)[number];

export const DIALOGUE_FACTS = [
  "completedBooks",
  "daysSinceLastVisit",
  "inProgressBooks",
  "totalBooks",
] as const;

export type DialogueFact = (typeof DIALOGUE_FACTS)[number];
export type DialogueConditionOperator = "eq" | "gte" | "lte";

export interface DialogueCondition {
  readonly fact: DialogueFact;
  readonly operator: DialogueConditionOperator;
  readonly value: number;
}

export interface DialogueDefinition {
  readonly characterId: string;
  readonly conditions: readonly DialogueCondition[];
  readonly cooldownHours: number;
  readonly events: readonly DialogueEvent[];
  readonly id: string;
  readonly once: boolean;
  readonly priority: number;
  readonly textKey: string;
}

export interface CharacterDefinition {
  readonly dialogueEvents: readonly DialogueEvent[];
  readonly eyebrowKey: string;
  readonly id: string;
  readonly nameKey: string;
  readonly panelTitleKey: string;
}

export interface DialogueCatalog {
  readonly characters: readonly CharacterDefinition[];
  readonly defaultLocale: string;
  readonly dialogues: readonly DialogueDefinition[];
  readonly fallbacks: Readonly<Record<DialogueEvent, string>>;
}

export interface DialogueFacts {
  readonly completedBooks: number;
  readonly daysSinceLastVisit?: number;
  readonly inProgressBooks: number;
  readonly totalBooks: number;
}

export interface DialogueHistory {
  readonly lastLibraryVisitAt?: string;
  readonly lastShownAt: Readonly<Record<string, string>>;
  readonly shownOnceIds: readonly string[];
}

export const EMPTY_DIALOGUE_HISTORY: DialogueHistory = Object.freeze({
  lastShownAt: Object.freeze({}),
  shownOnceIds: Object.freeze([]),
});

export interface DialogueHistoryPort {
  load(): Promise<DialogueHistory | undefined>;
  save(history: DialogueHistory): Promise<void>;
}

export interface LocalizedText {
  readonly locale: string;
  readonly text: string;
}

export interface DialogueLocalizer {
  translate(key: string, locale?: string): LocalizedText;
}

export interface LocalizedDialogue {
  readonly characterId: string;
  readonly closeLabel: string;
  readonly eyebrow: string;
  readonly id: string;
  readonly locale: string;
  readonly text: string;
  readonly title: string;
}

export interface LibraryDialogueFacts {
  readonly completedBooks: number;
  readonly inProgressBooks: number;
  readonly totalBooks: number;
}

export interface DialoguePort {
  enterLibrary(facts: LibraryDialogueFacts): Promise<void>;
  select(event: DialogueEvent): Promise<LocalizedDialogue>;
  updateLibraryFacts(facts: LibraryDialogueFacts): void;
}

export interface DialogueErrorReporter {
  warn(code: string): void;
}

export interface DialogueSelectionInput {
  readonly catalog: DialogueCatalog;
  readonly event: DialogueEvent;
  readonly facts: DialogueFacts;
  readonly history: DialogueHistory;
  readonly now: string;
}

function conditionMatches(
  condition: DialogueCondition,
  facts: DialogueFacts,
): boolean {
  const actual = facts[condition.fact];
  if (actual === undefined) return false;
  if (condition.operator === "eq") return actual === condition.value;
  if (condition.operator === "gte") return actual >= condition.value;
  return actual <= condition.value;
}

function cooldownElapsed(
  definition: DialogueDefinition,
  history: DialogueHistory,
  now: string,
): boolean {
  const lastShownAt = history.lastShownAt[definition.id];
  if (!lastShownAt) return true;
  return (
    Date.parse(now) - Date.parse(lastShownAt) >=
    definition.cooldownHours * 60 * 60 * 1000
  );
}

function lastShownValue(
  definition: DialogueDefinition,
  history: DialogueHistory,
): number {
  const value = history.lastShownAt[definition.id];
  return value ? Date.parse(value) : Number.NEGATIVE_INFINITY;
}

/** Pure selection policy. It has no persistence, platform or presentation APIs. */
export class DialogueSelector {
  select(input: DialogueSelectionInput): DialogueDefinition {
    const fallbackId = input.catalog.fallbacks[input.event];
    const shownOnce = new Set(input.history.shownOnceIds);
    const candidates = input.catalog.dialogues
      .filter(
        (definition) =>
          definition.id !== fallbackId &&
          definition.events.includes(input.event) &&
          (!definition.once || !shownOnce.has(definition.id)) &&
          cooldownElapsed(definition, input.history, input.now) &&
          definition.conditions.every((condition) =>
            conditionMatches(condition, input.facts),
          ),
      )
      .sort(
        (left, right) =>
          right.priority - left.priority ||
          lastShownValue(left, input.history) -
            lastShownValue(right, input.history) ||
          left.id.localeCompare(right.id),
      );
    const selected =
      candidates[0] ??
      input.catalog.dialogues.find(({ id }) => id === fallbackId);
    if (!selected) throw new Error("DIALOGUE_FALLBACK_MISSING");
    return selected;
  }
}

function elapsedDays(
  previous: string | undefined,
  now: string,
): number | undefined {
  if (!previous) return undefined;
  return Math.max(
    0,
    Math.floor((Date.parse(now) - Date.parse(previous)) / 86_400_000),
  );
}

export class DialogueService implements DialoguePort {
  private daysSinceLastVisit: number | undefined;
  private facts: DialogueFacts = Object.freeze({
    completedBooks: 0,
    inProgressBooks: 0,
    totalBooks: 0,
  });
  private history: DialogueHistory = EMPTY_DIALOGUE_HISTORY;
  private librarySessionPrepared = false;
  private selectionQueue: Promise<void> = Promise.resolve();
  private sessionPreparation: Promise<void> = Promise.resolve();

  constructor(
    private readonly catalog: DialogueCatalog,
    private readonly selector: DialogueSelector,
    private readonly localizer: DialogueLocalizer,
    private readonly historyPort: DialogueHistoryPort,
    private readonly clock: Clock,
    private readonly reporter: DialogueErrorReporter,
  ) {}

  async loadHistory(): Promise<void> {
    try {
      this.history = (await this.historyPort.load()) ?? EMPTY_DIALOGUE_HISTORY;
    } catch {
      this.history = EMPTY_DIALOGUE_HISTORY;
      this.reporter.warn("DIALOGUE_HISTORY_LOAD_FAILED");
    }
    this.daysSinceLastVisit = undefined;
    this.librarySessionPrepared = false;
  }

  enterLibrary(facts: LibraryDialogueFacts): Promise<void> {
    const prepare = async () => {
      if (!this.librarySessionPrepared) {
        const now = await this.clock.now();
        this.daysSinceLastVisit = elapsedDays(
          this.history.lastLibraryVisitAt,
          now,
        );
        this.history = Object.freeze({
          ...this.history,
          lastLibraryVisitAt: now,
        });
        this.librarySessionPrepared = true;
        await this.persistSafely();
      }
      this.facts = Object.freeze({
        ...facts,
        daysSinceLastVisit: this.daysSinceLastVisit,
      });
    };
    this.sessionPreparation = this.sessionPreparation
      .then(prepare)
      .catch(() => {
        this.facts = Object.freeze({ ...facts });
        this.reporter.warn("DIALOGUE_SESSION_PREPARATION_FAILED");
      });
    return this.sessionPreparation;
  }

  updateLibraryFacts(facts: LibraryDialogueFacts): void {
    this.facts = Object.freeze({
      ...facts,
      daysSinceLastVisit: this.daysSinceLastVisit,
    });
  }

  select(event: DialogueEvent): Promise<LocalizedDialogue> {
    let result: LocalizedDialogue | undefined;
    const operation = this.selectionQueue.then(async () => {
      await this.sessionPreparation;
      result = await this.selectNow(event);
    });
    this.selectionQueue = operation.catch(() => undefined);
    return operation.then(() => {
      if (!result) throw new Error("DIALOGUE_SELECTION_FAILED");
      return result;
    });
  }

  private async selectNow(event: DialogueEvent): Promise<LocalizedDialogue> {
    try {
      const now = await this.clock.now();
      const definition = this.selector.select({
        catalog: this.catalog,
        event,
        facts: this.facts,
        history: this.history,
        now,
      });
      this.recordSelection(definition, now);
      await this.persistSafely();
      return this.localize(definition);
    } catch {
      this.reporter.warn("DIALOGUE_SELECTION_FAILED");
      const fallback = this.catalog.dialogues.find(
        ({ id }) => id === this.catalog.fallbacks[event],
      );
      if (!fallback) throw new Error("DIALOGUE_FALLBACK_MISSING");
      return this.localize(fallback);
    }
  }

  private recordSelection(definition: DialogueDefinition, now: string): void {
    const shownOnce = new Set(this.history.shownOnceIds);
    if (definition.once) shownOnce.add(definition.id);
    this.history = Object.freeze({
      ...this.history,
      lastShownAt: Object.freeze({
        ...this.history.lastShownAt,
        [definition.id]: now,
      }),
      shownOnceIds: Object.freeze([...shownOnce].sort()),
    });
  }

  private localize(definition: DialogueDefinition): LocalizedDialogue {
    const character = this.catalog.characters.find(
      ({ id }) => id === definition.characterId,
    );
    if (!character) throw new Error("DIALOGUE_CHARACTER_MISSING");
    const text = this.localizer.translate(
      definition.textKey,
      this.catalog.defaultLocale,
    );
    return Object.freeze({
      characterId: character.id,
      closeLabel: this.localizer.translate(
        "interface.dialogue.close",
        text.locale,
      ).text,
      eyebrow: this.localizer.translate(character.eyebrowKey, text.locale).text,
      id: definition.id,
      locale: text.locale,
      text: text.text,
      title: this.localizer.translate(character.panelTitleKey, text.locale)
        .text,
    });
  }

  private async persistSafely(): Promise<void> {
    try {
      await this.historyPort.save(this.history);
    } catch {
      this.reporter.warn("DIALOGUE_HISTORY_SAVE_FAILED");
    }
  }
}
