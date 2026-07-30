import {
  createBookEntrySchema,
  updateBookEntrySchema,
  type CreateBookEntryInput,
  type UpdateBookEntryInput,
} from "../../application";
import type { BookFormErrors, BookFormValues } from "./types";

type ConversionResult<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly errors: BookFormErrors };

function integerValue(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : Number.NaN;
}

function dateAtEndOfUtcDay(value: string): string | undefined {
  return value === "" ? undefined : `${value}T23:59:59.999Z`;
}

function messageFor(field: string): string {
  const messages: Record<string, string> = {
    currentPage: "Informe uma página atual inteira, igual ou maior que zero.",
    rating: "Escolha uma avaliação entre 1 e 5.",
    startedAt: "Informe uma data de início válida.",
    status: "Escolha um status válido.",
    title: "Informe o título do livro.",
    totalPages: "Informe um total de páginas inteiro e maior que zero.",
  };
  return messages[field] ?? "Revise este campo.";
}

function schemaErrors(
  issues: readonly { path: PropertyKey[] }[],
): BookFormErrors {
  const errors: BookFormErrors = {};
  for (const issue of issues) {
    const field = String(issue.path[0] ?? "");
    if (field in errors) continue;
    if (
      field === "author" ||
      field === "currentPage" ||
      field === "rating" ||
      field === "startedAt" ||
      field === "status" ||
      field === "title" ||
      field === "totalPages"
    ) {
      errors[field] = messageFor(field);
    }
  }
  return errors;
}

export function createInputFromValues(
  values: BookFormValues,
): ConversionResult<CreateBookEntryInput> {
  const candidate = {
    title: values.title,
    ...(values.author.trim() !== "" && { author: values.author }),
    status: values.status,
    ...(integerValue(values.totalPages) !== undefined && {
      totalPages: integerValue(values.totalPages),
    }),
    currentPage: integerValue(values.currentPage),
    ...(integerValue(values.rating) !== undefined && {
      rating: integerValue(values.rating),
    }),
    ...(dateAtEndOfUtcDay(values.startedAt) !== undefined && {
      startedAt: dateAtEndOfUtcDay(values.startedAt),
    }),
  };
  const parsed = createBookEntrySchema.safeParse(candidate);
  return parsed.success
    ? { success: true, data: parsed.data }
    : { success: false, errors: schemaErrors(parsed.error.issues) };
}

export function updateInputFromValues(
  id: string,
  values: BookFormValues,
): ConversionResult<UpdateBookEntryInput> {
  const candidate = {
    id,
    title: values.title,
    author: values.author,
    totalPages: integerValue(values.totalPages) ?? null,
    rating: integerValue(values.rating) ?? null,
  };
  const parsed = updateBookEntrySchema.safeParse(candidate);
  return parsed.success
    ? { success: true, data: parsed.data }
    : { success: false, errors: schemaErrors(parsed.error.issues) };
}
