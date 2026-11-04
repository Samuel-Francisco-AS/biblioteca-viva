import { ApplicationError } from "../../application";
import { presentApplicationError } from "./errorMessages";
export const workoutTypes = {
  strength: "Força",
  resistance: "Resistência",
  cardio: "Aeróbico",
  mobility: "Mobilidade",
  sport: "Esporte",
  mixed: "Mista",
  other: "Outra",
};
export const weekLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}
export function scheduleFromForm(form: FormData) {
  return {
    start: text(form.get("workoutStart")),
    end: text(form.get("workoutEnd")),
    weekdays: form.getAll("workoutWeekday").map(Number),
  };
}

export function workoutFormError(error: unknown) {
  if (error instanceof ApplicationError) {
    const field = error.context.field ?? "";
    if (field === "exercises" || field.startsWith("exercises."))
      return "Adicione exercícios com séries e repetições ou tempo válidos.";
    if (field === "schedule.weekdays")
      return "Escolha ao menos um dia da semana.";
    if (field.startsWith("schedule"))
      return "Revise o período: a data final deve ser igual ou posterior ao início.";
  }
  return presentApplicationError(error).message;
}
