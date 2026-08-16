import { z } from "zod";

import { ENTRY_STATUSES } from "./types";

const normalizedRequiredText = z.string().transform((value, context) => {
  const normalized = value.trim().replace(/\s+/gu, " ");
  if (normalized.length === 0) {
    context.addIssue({ code: "custom", message: "Conteúdo obrigatório" });
    return z.NEVER;
  }
  return normalized;
});

const normalizedOptionalText = z
  .string()
  .transform((value) => value.trim().replace(/\s+/gu, " "))
  .optional();

export const createBookInputSchema = z.strictObject({
  id: normalizedRequiredText,
  title: normalizedRequiredText,
  author: normalizedOptionalText,
  status: z.enum(ENTRY_STATUSES).optional(),
  totalPages: z.int().positive().optional(),
  currentPage: z.int().nonnegative().optional(),
  rating: z.int().min(1).max(5).optional(),
  startedAt: z.iso.datetime({ offset: false }).optional(),
  completedAt: z.iso.datetime({ offset: false }).optional(),
  createdAt: z.iso.datetime({ offset: false }),
});

export const updateBibliographicDataInputSchema = z.strictObject({
  title: normalizedRequiredText.optional(),
  author: normalizedOptionalText,
  totalPages: z.union([z.int().positive(), z.null()]).optional(),
  rating: z.union([z.int().min(1).max(5), z.null()]).optional(),
  updatedAt: z.iso.datetime({ offset: false }),
});

export const updateProgressInputSchema = z.strictObject({
  currentPage: z.int().nonnegative(),
  updatedAt: z.iso.datetime({ offset: false }),
});

export const changeStatusInputSchema = z.strictObject({
  status: z.enum(ENTRY_STATUSES),
  updatedAt: z.iso.datetime({ offset: false }),
});

export const createNoteInputSchema = z.strictObject({
  id: normalizedRequiredText,
  entryId: normalizedRequiredText,
  content: normalizedRequiredText,
  createdAt: z.iso.datetime({ offset: false }),
});

export const createQuoteInputSchema = createNoteInputSchema.extend({
  page: z.int().positive().optional(),
});

export const updateNoteInputSchema = z.strictObject({
  content: normalizedRequiredText,
  updatedAt: z.iso.datetime({ offset: false }),
});

export const updateQuoteInputSchema = updateNoteInputSchema.extend({
  page: z.int().positive().optional(),
});

export type ParsedCreateBookInput = z.output<typeof createBookInputSchema>;
