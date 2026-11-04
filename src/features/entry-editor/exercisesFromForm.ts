import type { Exercise } from "../../domain";

export function exercisesFromForm(form: FormData): readonly Exercise[] {
  const names = form.getAll("exerciseName");
  const numeric = (field: string, index: number) => {
    const value = form.getAll(field)[index];
    return typeof value === "string" && value.trim()
      ? Number(value)
      : undefined;
  };
  return names.map((name, index) => ({
    name: typeof name === "string" ? name.trim() : "",
    sets: numeric("exerciseSets", index),
    repetitions: numeric("exerciseRepetitions", index),
    loadKg: numeric("exerciseLoad", index),
    durationSeconds: numeric("exerciseTime", index),
    note: text(form.getAll("exerciseNote")[index]),
  }));
}

function text(value: FormDataEntryValue | undefined) {
  return typeof value === "string" ? value.trim() || undefined : undefined;
}
