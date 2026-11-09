import { z } from "zod";
import { deckSelectionSchema, cardReferenceSchema } from "../domain/arcanarium";
import {
  createTrial,
  isTrial,
  selectDeck,
  transitionTrial,
  learningReport,
  type TrialCommand,
  type Trial,
} from "../domain/provations";
import { type ArcanariumDependencies, requireRevision } from "./arcanarium";
import {
  currentTime,
  generatedId,
  parseInput,
  runTransaction,
} from "./internal";
import { ApplicationError } from "./errors";
const selectionInput = z
  .strictObject({
    deckId: z.string().min(1).optional(),
    selection: deckSelectionSchema.optional(),
  })
  .refine((p) => !!p.deckId !== !!p.selection);
export class ProvationsService {
  constructor(private readonly deps: ArcanariumDependencies) {}
  async preview(input: unknown) {
    const p = parseInput(selectionInput, input);
    return runTransaction(this.deps, async () => {
      const data = await this.deps.arcanarium.read();
      const deck = p.deckId
        ? data.decks.find((d) => d.id === p.deckId)
        : undefined;
      const selection = deck?.selection ?? p.selection;
      if (!selection)
        throw new ApplicationError("NOT_FOUND", "Baralho indisponível.");
      return selectDeck(data, selection).filter((r) =>
        data.versions.some(
          (v) =>
            v.cardId === r.cardId &&
            v.revision === r.revision &&
            v.card.type === "question",
        ),
      );
    });
  }
  async start(input: unknown) {
    const p = parseInput(selectionInput, input),
      now = await currentTime(this.deps),
      id = await generatedId(this.deps, "provation");
    return runTransaction(this.deps, async () => {
      const data = await this.deps.arcanarium.read();
      if (data.sessions.some((s) => s.id === id))
        throw new ApplicationError("CONFLICT", "Sessão já existente.");
      const deck = p.deckId
        ? data.decks.find((d) => d.id === p.deckId)
        : undefined;
      const selection = deck?.selection ?? p.selection;
      if (!selection)
        throw new ApplicationError("NOT_FOUND", "Baralho indisponível.");
      const refs = selectDeck(data, selection).filter((r) =>
        data.versions.some(
          (v) =>
            v.cardId === r.cardId &&
            v.revision === r.revision &&
            v.card.type === "question",
        ),
      );
      let session: Trial;
      try {
        session = createTrial(
          data,
          parseInput(z.array(cardReferenceSchema), refs),
          id,
          now,
          deck,
        );
      } catch (e) {
        if (e instanceof ApplicationError) throw e;
        throw new ApplicationError(
          "VALIDATION_FAILED",
          e instanceof Error ? e.message : "Não foi possível iniciar.",
        );
      }
      await this.deps.arcanarium.putSession(session);
      return session;
    });
  }
  async command(input: unknown) {
    const p = parseInput(
      z.strictObject({
        sessionId: z.string().min(1),
        expectedRevision: z.int().positive(),
        command: z.discriminatedUnion("kind", [
          z.strictObject({
            kind: z.literal("answer"),
            alternativeId: z.string().min(1),
          }),
          z.strictObject({
            kind: z.enum(["next", "pause", "resume", "complete", "abandon"]),
          }),
        ]),
      }),
      input,
    );
    const now = await currentTime(this.deps);
    return runTransaction(this.deps, async () => {
      const data = await this.deps.arcanarium.read(),
        session = data.sessions.find((s) => s.id === p.sessionId);
      if (!session || !isTrial(session))
        throw new ApplicationError("NOT_FOUND", "Provação indisponível.");
      requireRevision(session.trial.revision, p.expectedRevision);
      let next: Trial;
      try {
        next = transitionTrial(
          data,
          session,
          p.command satisfies TrialCommand,
          now,
        );
      } catch {
        throw new ApplicationError(
          "CONFLICT",
          "Resposta já confirmada ou estado incompatível. Atualize a sessão; as respostas salvas permanecem.",
        );
      }
      await this.deps.arcanarium.putSession(next);
      return next;
    });
  }
  async report(period?: { from: string; to: string }) {
    const p = period
      ? parseInput(
          z
            .strictObject({ from: z.iso.datetime(), to: z.iso.datetime() })
            .refine((p) => p.from <= p.to),
          period,
        )
      : undefined;
    return runTransaction(this.deps, async () =>
      learningReport(
        await this.deps.arcanarium.read(),
        await currentTime(this.deps),
        p,
      ),
    );
  }
}
