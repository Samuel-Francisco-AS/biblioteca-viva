import type { BookEntry, EntryStatus } from "../../domain";

export interface BookFormValues {
  readonly author: string;
  readonly currentPage: string;
  readonly rating: string;
  readonly startedAt: string;
  readonly status: EntryStatus;
  readonly title: string;
  readonly totalPages: string;
}

export type BookFormField = keyof BookFormValues;
export type BookFormErrors = Partial<Record<BookFormField, string>>;

export const emptyBookFormValues: BookFormValues = {
  author: "",
  currentPage: "0",
  rating: "",
  startedAt: "",
  status: "planned",
  title: "",
  totalPages: "",
};

export function valuesFromBook(book: BookEntry): BookFormValues {
  return {
    author: book.author ?? "",
    currentPage: String(book.currentPage),
    rating: book.rating === undefined ? "" : String(book.rating),
    startedAt: book.startedAt?.slice(0, 10) ?? "",
    status: book.status,
    title: book.title,
    totalPages: book.totalPages === undefined ? "" : String(book.totalPages),
  };
}
