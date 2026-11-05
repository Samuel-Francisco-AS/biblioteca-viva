import { z } from "zod";
import type { WorkEntry } from "./types";
import { nextMetadata } from "./validation";

const id = z.string().trim().min(1).max(160);
const title = z.string().trim().min(1).max(300);
const description = z.string().trim().max(4000).optional();
/** Manual references only. Never fetched; executable and local schemes are refused. */
export const workReferenceSchema = z
  .url()
  .max(2000)
  .refine((value) => /^https?:\/\//i.test(value), "Use um link http ou https.");
export const WORK_KINDS = [
  "personal",
  "professional",
  "service",
  "recurring",
  "other",
] as const;
export const workKindLabels = {
  personal: "Projeto pessoal",
  professional: "Projeto profissional",
  service: "Serviço",
  recurring: "Trabalho recorrente",
  other: "Outro",
} as const;
export const TASK_STATES = [
  "pending",
  "in_progress",
  "blocked",
  "completed",
] as const;
export const taskStateLabels = {
  pending: "Pendente",
  in_progress: "Em andamento",
  blocked: "Bloqueada",
  completed: "Concluída",
} as const;
export const JOURNAL_KINDS = [
  "advance",
  "decision",
  "difficulty",
  "result",
  "observation",
  "milestone",
] as const;
export const journalKindLabels = {
  advance: "Avanço",
  decision: "Decisão",
  difficulty: "Dificuldade",
  result: "Resultado",
  observation: "Observação",
  milestone: "Marco",
} as const;
export const workStageSchema = z.strictObject({
  id,
  title,
  description,
  deadline: z.iso.date().optional(),
  reference: workReferenceSchema.optional(),
});
export const workTaskSchema = z.strictObject({
  id,
  title,
  state: z.enum(TASK_STATES),
  stageId: id.optional(),
  description,
  deadline: z.iso.date().optional(),
  reference: workReferenceSchema.optional(),
});
export const workJournalSchema = z.strictObject({
  id,
  kind: z.enum(JOURNAL_KINDS),
  content: z.string().trim().min(1).max(8000),
  createdAt: z.iso.datetime({ offset: false }),
});
export const workPlanSchema = z
  .strictObject({
    stages: z.array(workStageSchema).max(100),
    tasks: z.array(workTaskSchema).max(2000),
    journal: z.array(workJournalSchema).max(5000),
    nextTaskId: id.optional(),
  })
  .superRefine((plan, ctx) => {
    const ids = [...plan.stages, ...plan.tasks, ...plan.journal].map(
      (item) => item.id,
    );
    if (new Set(ids).size !== ids.length)
      ctx.addIssue({
        code: "custom",
        message: "Identificadores duplicados no planejamento.",
      });
    if (
      plan.tasks.some(
        (task) =>
          task.stageId &&
          !plan.stages.some((stage) => stage.id === task.stageId),
      )
    )
      ctx.addIssue({ code: "custom", message: "Etapa inexistente." });
    if (
      plan.nextTaskId &&
      !plan.tasks.some(
        (task) => task.id === plan.nextTaskId && task.state !== "completed",
      )
    )
      ctx.addIssue({
        code: "custom",
        message: "Próxima ação deve ser uma tarefa aberta.",
      });
  });
export type WorkPlan = z.infer<typeof workPlanSchema>;
export type WorkStage = z.infer<typeof workStageSchema>;
export type WorkTask = z.infer<typeof workTaskSchema>;
export const emptyWorkPlan = (): WorkPlan => ({
  stages: [],
  tasks: [],
  journal: [],
});
export function workProgress(tasks: readonly WorkTask[]) {
  const completed = tasks.filter((task) => task.state === "completed").length;
  return {
    completed,
    total: tasks.length,
    pending: tasks.length - completed,
    percentage: tasks.length
      ? Math.round((completed * 100) / tasks.length)
      : undefined,
  };
}
export function nextWorkDeadline(entry: WorkEntry) {
  return [
    entry.deadline?.slice(0, 10),
    ...(entry.plan?.stages ?? [])
      .filter((stage) => {
        const tasks =
          entry.plan?.tasks.filter((task) => task.stageId === stage.id) ?? [];
        return (
          !tasks.length || tasks.some((task) => task.state !== "completed")
        );
      })
      .map((stage) => stage.deadline),
    ...(entry.plan?.tasks ?? [])
      .filter((task) => task.state !== "completed")
      .map((task) => task.deadline),
  ]
    .filter((value): value is string => Boolean(value))
    .sort()[0];
}
export function replaceWorkPlan(
  entry: WorkEntry,
  plan: WorkPlan,
  now: string,
): WorkEntry {
  return Object.freeze({
    ...entry,
    ...nextMetadata(entry, now),
    plan: workPlanSchema.parse(plan),
  });
}
