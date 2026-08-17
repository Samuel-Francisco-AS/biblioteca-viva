import {
  changeStatusInputSchema,
  createBookInputSchema,
  createNoteInputSchema,
  updateBibliographicDataInputSchema,
  updateProgressInputSchema,
  updateNoteInputSchema,
} from "../domain";
import { z } from "zod";

const idSchema = z.string().trim().min(1);
const annotationLocationSchema = z.discriminatedUnion("type", [
  z.strictObject({ type: z.literal("book"), page: z.int().positive() }),
  z.strictObject({ type: z.literal("movie"), minute: z.int().nonnegative() }),
  z.strictObject({
    type: z.literal("series"),
    season: z.int().positive(),
    episode: z.int().positive(),
    minute: z.int().nonnegative().optional(),
  }),
  z.strictObject({
    type: z.literal("study"),
    module: z.string().trim().min(1).optional(),
    topic: z.string().trim().min(1).optional(),
  }),
]);

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

export const libraryEntryIdSchema = z.strictObject({ id: idSchema });
export const bookIdSchema = libraryEntryIdSchema;

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

export const addQuoteSchema = createNoteInputSchema
  .omit({ id: true, createdAt: true, location: true })
  .extend({
    page: z.int().positive().optional(),
    location: annotationLocationSchema.optional(),
  });

export const updateNoteSchema = updateNoteInputSchema
  .omit({ updatedAt: true })
  .extend({ id: idSchema });

export const updateQuoteSchema = updateNoteInputSchema
  .omit({ updatedAt: true })
  .extend({
    id: idSchema,
    page: z.int().positive().optional(),
    location: annotationLocationSchema.optional(),
  });

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
