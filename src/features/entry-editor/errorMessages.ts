import { ApplicationError } from "../../application";
import type { BookFormErrors, BookFormField } from "./types";

const knownFields = new Set<BookFormField>([
  "author",
  "currentPage",
  "rating",
  "startedAt",
  "status",
  "title",
  "totalPages",
]);

export interface PresentedError {
  readonly fieldErrors: BookFormErrors;
  readonly message: string;
}

export function presentApplicationError(error: unknown): PresentedError {
  if (!(error instanceof ApplicationError)) {
    return {
      fieldErrors: {},
      message: "Algo inesperado aconteceu. Tente novamente.",
    };
  }

  const messages = {
    ACTIVITY_PERSISTENCE_FAILED:
      "O livro foi salvo, mas o histórico não pôde ser atualizado.",
    CONFLICT:
      "O livro mudou desde que foi aberto. Recarregue e tente novamente.",
    EVENT_PUBLICATION_FAILED:
      "O livro foi salvo, mas a atualização não pôde ser anunciada.",
    NOT_FOUND: "Este livro não foi encontrado.",
    PERSISTENCE_FAILED:
      "Não foi possível acessar o armazenamento. Tente novamente.",
    UNSAFE_CONTEXT:
      "Este ambiente não oferece todas as APIs necessárias para salvar e exportar com segurança. Abra a aplicação por localhost, HTTPS ou pelo APK Android. Os dados de outras origens do navegador não foram apagados.",
    VALIDATION_FAILED: "Revise os dados informados e tente novamente.",
  } satisfies Record<ApplicationError["code"], string>;
  const field = error.context.field;
  const fieldErrors: BookFormErrors = {};
  if (field && knownFields.has(field as BookFormField)) {
    fieldErrors[field as BookFormField] = "Este valor não é aceito pelo livro.";
  }
  return { fieldErrors, message: messages[error.code] };
}
