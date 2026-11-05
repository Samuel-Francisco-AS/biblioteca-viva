import { z } from "zod";
import {
  createLibraryEntryUpdatedEvent,
  changeEntryStatus,
  ENTRY_STATUSES,
} from "../domain";
import {
  emptyWorkPlan,
  replaceWorkPlan,
  workStageSchema,
  workTaskSchema,
  workJournalSchema,
} from "../domain/endeavors";
import type { WorkEntry } from "../domain";
import type { ApplicationDependencies } from "./ports";
import { ApplicationError } from "./errors";
import {
  applyDomain,
  currentTime,
  generatedId,
  parseInput,
  publishEvent,
  runTransaction,
  saveEntity,
} from "./internal";
const id = z.string().trim().min(1).max(160);
const operation = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("stage"),
    value: workStageSchema.omit({ id: true }),
    itemId: id.optional(),
  }),
  z.strictObject({
    kind: z.literal("task"),
    value: workTaskSchema.omit({ id: true }),
    itemId: id.optional(),
  }),
  z.strictObject({
    kind: z.literal("state"),
    itemId: id,
    state: workTaskSchema.shape.state,
  }),
  z.strictObject({ kind: z.literal("deleteStage"), itemId: id }),
  z.strictObject({ kind: z.literal("deleteTask"), itemId: id }),
  z.strictObject({
    kind: z.literal("move"),
    itemId: id,
    collection: z.enum(["stages", "tasks"]),
    direction: z.enum(["up", "down"]),
  }),
  z.strictObject({
    kind: z.literal("next"),
    itemId: id.optional(),
    text: z.string().trim().max(4000).optional(),
  }),
  z.strictObject({
    kind: z.literal("journal"),
    value: workJournalSchema.omit({ id: true, createdAt: true }),
    itemId: id.optional(),
  }),
  z.strictObject({ kind: z.literal("deleteJournal"), itemId: id }),
  z.strictObject({ kind: z.literal("status"), status: z.enum(ENTRY_STATUSES) }),
]);
const schema = z.strictObject({
  id,
  expectedRevision: z.int().positive(),
  operation,
});
export type WorkOperation = z.infer<typeof operation>;
type Dependencies = Pick<
  ApplicationDependencies,
  "clock" | "ids" | "events" | "libraryEntries" | "transaction"
>;
export class SaveEndeavor {
  constructor(private readonly deps: Dependencies) {}
  async execute(input: unknown): Promise<WorkEntry> {
    const parsed = parseInput(schema, input);
    const now = await currentTime(this.deps);
    const eventId = await generatedId(this.deps, "endeavor_event");
    const newId = await generatedId(this.deps, "endeavor_item");
    const updated = await runTransaction(this.deps, async () => {
      const entry = await this.deps.libraryEntries.getById(parsed.id);
      if (!entry || entry.type !== "work")
        throw new ApplicationError("NOT_FOUND", "Empreitada não encontrada.");
      if (entry.revision !== parsed.expectedRevision)
        throw new ApplicationError(
          "CONFLICT",
          "A empreitada mudou em outra tela. Reabra antes de salvar.",
        );
      const plan = structuredClone(entry.plan ?? emptyWorkPlan());
      const op = parsed.operation;
      function requireItem<T extends { id: string }>(
        items: T[],
        itemId: string,
      ) {
        const index = items.findIndex((item) => item.id === itemId);
        if (index < 0)
          throw new ApplicationError("NOT_FOUND", "Item não encontrado.");
        return index;
      }
      switch (op.kind) {
        case "stage": {
          const item = { ...op.value, id: op.itemId ?? newId };
          if (op.itemId)
            plan.stages[requireItem(plan.stages, op.itemId)] = item;
          else plan.stages.push(item);
          break;
        }
        case "task": {
          const item = { ...op.value, id: op.itemId ?? newId };
          if (op.itemId) plan.tasks[requireItem(plan.tasks, op.itemId)] = item;
          else plan.tasks.push(item);
          break;
        }
        case "state":
          plan.tasks[requireItem(plan.tasks, op.itemId)].state = op.state;
          break;
        case "deleteStage": {
          plan.stages.splice(requireItem(plan.stages, op.itemId), 1);
          for (const task of plan.tasks)
            if (task.stageId === op.itemId) delete task.stageId;
          break;
        }
        case "deleteTask":
          plan.tasks.splice(requireItem(plan.tasks, op.itemId), 1);
          break;
        case "deleteJournal":
          plan.journal.splice(requireItem(plan.journal, op.itemId), 1);
          break;
        case "move": {
          const list = plan[op.collection];
          const from = requireItem(list, op.itemId);
          const visible = list.filter(
            (item) =>
              op.collection === "stages" ||
              ("stageId" in item ? item.stageId : undefined) ===
                ("stageId" in list[from] ? list[from].stageId : undefined),
          );
          const at = visible.findIndex((item) => item.id === op.itemId);
          const neighbor = visible[at + (op.direction === "up" ? -1 : 1)];
          if (neighbor) {
            const to = list.findIndex((item) => item.id === neighbor.id);
            [list[from], list[to]] = [list[to], list[from]];
          }
          break;
        }
        case "next":
          plan.nextTaskId = op.itemId;
          break;
        case "journal": {
          if (op.itemId) {
            const index = requireItem(plan.journal, op.itemId);
            plan.journal[index] = { ...plan.journal[index], ...op.value };
          } else plan.journal.push({ ...op.value, id: newId, createdAt: now });
          break;
        }
        case "status":
          break;
      }
      if (
        plan.nextTaskId &&
        !plan.tasks.some(
          (task) => task.id === plan.nextTaskId && task.state !== "completed",
        )
      )
        delete plan.nextTaskId;
      // Explicit invalid next selections are rejected, rather than silently choosing a priority.
      if (op.kind === "next" && op.itemId && plan.nextTaskId !== op.itemId)
        throw new ApplicationError(
          "VALIDATION_FAILED",
          "Escolha uma tarefa aberta.",
        );
      const result = applyDomain(() => {
        if (op.kind === "status") {
          const changed = changeEntryStatus(entry, op.status, now);
          if (changed.type !== "work")
            throw new ApplicationError(
              "VALIDATION_FAILED",
              "Tipo incompatível.",
            );
          return changed;
        }
        return replaceWorkPlan(
          {
            ...entry,
            ...(op.kind === "next" && { nextAction: op.text || undefined }),
          },
          plan,
          now,
        );
      });
      await saveEntity(
        () => this.deps.libraryEntries.save(result),
        "save_endeavor",
      );
      return result;
    });
    await publishEvent(
      this.deps,
      createLibraryEntryUpdatedEvent({
        eventId,
        aggregateId: updated.id,
        occurredAt: now,
        revision: updated.revision,
        payload: {
          entryType: "work",
          changedFields: [
            parsed.operation.kind === "status" ? "status" : "plan",
          ],
        },
      }),
    );
    return updated;
  }
}
