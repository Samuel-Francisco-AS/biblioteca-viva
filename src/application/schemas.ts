import {
  changeStatusInputSchema,
  createBookInputSchema,
  createNoteInputSchema,
  createQuoteInputSchema,
  updateBibliographicDataInputSchema,
  updateProgressInputSchema,
  updateNoteInputSchema,
  updateQuoteInputSchema,
} from "../domain";
import { z } from "zod";

const idSchema = z.string().trim().min(1);

export const createBookEntrySchema = createBookInputSchema.omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const updateBookEntrySchema = updateBibliographicDataInputSchema
  .omit({ updatedAt: true })
  .extend({ id: idSchema })
  .refine(
    (input) =>
      Object.entries(input).some(
        ([key, value]) => key !== "id" && value !== undefined,
      ),
    { message: "Informe ao menos um campo para atualizar" },
  );

export const bookIdSchema = z.strictObject({ id: idSchema });

export const updateBookProgressSchema = updateProgressInputSchema
  .omit({ updatedAt: true })
  .extend({ id: idSchema });

export const changeBookStatusSchema = changeStatusInputSchema
  .omit({ updatedAt: true })
  .extend({ id: idSchema });

export const addNoteSchema = createNoteInputSchema.omit({
  id: true,
  createdAt: true,
});

export const addQuoteSchema = createQuoteInputSchema.omit({
  id: true,
  createdAt: true,
});

export const updateNoteSchema = updateNoteInputSchema
  .omit({ updatedAt: true })
  .extend({ id: idSchema });

export const updateQuoteSchema = updateQuoteInputSchema
  .omit({ updatedAt: true })
  .extend({ id: idSchema });

export const annotationIdSchema = z.strictObject({ id: idSchema });

export type CreateBookEntryInput = z.input<typeof createBookEntrySchema>;
export type UpdateBookEntryInput = z.input<typeof updateBookEntrySchema>;
export type BookIdInput = z.input<typeof bookIdSchema>;
export type UpdateBookProgressInput = z.input<typeof updateBookProgressSchema>;
export type ChangeBookStatusInput = z.input<typeof changeBookStatusSchema>;
export type AddNoteInput = z.input<typeof addNoteSchema>;
export type AddQuoteInput = z.input<typeof addQuoteSchema>;
export type UpdateNoteInput = z.input<typeof updateNoteSchema>;
export type UpdateQuoteInput = z.input<typeof updateQuoteSchema>;
