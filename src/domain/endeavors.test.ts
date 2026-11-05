import { expect, it } from "vitest";
import { createWork } from "./libraryEntries";
import {
  emptyWorkPlan,
  nextWorkDeadline,
  workPlanSchema,
  workProgress,
  workReferenceSchema,
} from "./endeavors";
it("calculates actual completed tasks, reopens and never fabricates progress without tasks", () => {
  expect(workProgress([])).toEqual({
    completed: 0,
    pending: 0,
    total: 0,
    percentage: undefined,
  });
  const tasks = Array.from({ length: 10 }, (_, i) => ({
    id: String(i),
    title: "Etapa fictícia",
    state: i < 7 ? ("completed" as const) : ("blocked" as const),
  }));
  expect(workProgress(tasks)).toMatchObject({ percentage: 70, pending: 3 });
  expect(
    workProgress([
      ...tasks,
      { id: "extra", title: "Nova tarefa", state: "pending" },
    ]).percentage,
  ).toBe(64);
  expect(
    workProgress(tasks.map((task) => ({ ...task, state: "pending" })))
      .percentage,
  ).toBe(0);
});
it("validates bounded plans, unique identifiers, ownership, explicit priority and safe manual references", () => {
  const plan = {
    ...emptyWorkPlan(),
    stages: [{ id: "stage", title: "Etapa" }],
    tasks: [
      { id: "task", stageId: "stage", title: "Tarefa", state: "blocked" },
    ],
    nextTaskId: "task",
  };
  expect(workPlanSchema.safeParse(plan).success).toBe(true);
  expect(
    workPlanSchema.safeParse({ ...plan, tasks: [...plan.tasks, ...plan.tasks] })
      .success,
  ).toBe(false);
  expect(workPlanSchema.safeParse({ ...plan, stages: [] }).success).toBe(false);
  expect(
    workPlanSchema.safeParse({ ...plan, nextTaskId: "missing" }).success,
  ).toBe(false);
  expect(
    workPlanSchema.safeParse({
      ...plan,
      tasks: [{ ...plan.tasks[0], state: "completed" }],
    }).success,
  ).toBe(false);
  expect(
    workPlanSchema.safeParse({
      ...plan,
      tasks: Array.from({ length: 2001 }, (_, i) => ({
        ...plan.tasks[0],
        id: `t-${i}`,
      })),
    }).success,
  ).toBe(false);
  for (const ref of [
    "javascript:alert(1)",
    "file:///local",
    "data:text/html,test",
    "ftp://example.org",
  ])
    expect(workReferenceSchema.safeParse(ref).success).toBe(false);
  expect(workReferenceSchema.parse("https://example.org/referencia")).toBe(
    "https://example.org/referencia",
  );
});
it("chooses the earliest relevant deadline without presenting any task as automatic priority", () => {
  const work = createWork({
    id: "w",
    title: "Empreitada",
    createdAt: "2026-11-05T12:00:00.000Z",
    deadline: "2026-12-01T00:00:00.000Z",
  });
  expect(
    nextWorkDeadline({
      ...work,
      plan: {
        ...emptyWorkPlan(),
        tasks: [
          {
            id: "a",
            title: "Concluída",
            state: "completed",
            deadline: "2026-10-01",
          },
          {
            id: "b",
            title: "Bloqueada",
            state: "blocked",
            deadline: "2026-11-12",
          },
        ],
      },
    }),
  ).toBe("2026-11-12");
});
