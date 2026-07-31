import { DomainError, InvalidStatusTransitionError } from "../domain";
import { ZodError } from "zod";

export type ApplicationErrorCode =
  | "VALIDATION_FAILED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "PERSISTENCE_FAILED"
  | "ACTIVITY_PERSISTENCE_FAILED"
  | "EVENT_PUBLICATION_FAILED"
  | "UNSAFE_CONTEXT";

export interface ApplicationErrorContext {
  readonly field?: string;
  readonly operation?: string;
}

export class ApplicationError extends Error {
  constructor(
    public readonly code: ApplicationErrorCode,
    message: string,
    public readonly context: ApplicationErrorContext = {},
  ) {
    super(message);
    this.name = "ApplicationError";
  }
}

export function toValidationError(error: unknown): ApplicationError {
  if (error instanceof ZodError) {
    const field = error.issues[0]?.path.join(".") || undefined;
    return new ApplicationError(
      "VALIDATION_FAILED",
      "A entrada informada é inválida.",
      { field },
    );
  }
  if (error instanceof InvalidStatusTransitionError) {
    return new ApplicationError(
      "CONFLICT",
      "A mudança solicitada é incompatível com o estado atual do livro.",
      { field: error.field },
    );
  }
  if (error instanceof DomainError) {
    return new ApplicationError(
      "VALIDATION_FAILED",
      "A entrada viola uma regra do domínio.",
      { field: error.field },
    );
  }
  return new ApplicationError(
    "VALIDATION_FAILED",
    "Não foi possível validar a entrada.",
  );
}

export function notFound(): ApplicationError {
  return new ApplicationError("NOT_FOUND", "Livro não encontrado.", {
    field: "id",
    operation: "get_book",
  });
}

export function persistenceFailed(operation: string): ApplicationError {
  return new ApplicationError(
    "PERSISTENCE_FAILED",
    "Não foi possível salvar os dados.",
    { operation },
  );
}

export function activityPersistenceFailed(): ApplicationError {
  return new ApplicationError(
    "ACTIVITY_PERSISTENCE_FAILED",
    "Os dados foram salvos, mas não foi possível registrar a atividade.",
    { operation: "save_activity" },
  );
}

export function eventPublicationFailed(): ApplicationError {
  return new ApplicationError(
    "EVENT_PUBLICATION_FAILED",
    "Os dados foram salvos, mas não foi possível publicar o evento.",
    { operation: "publish_event" },
  );
}

export function platformCapabilityUnavailable(): ApplicationError {
  return new ApplicationError(
    "UNSAFE_CONTEXT",
    "Este ambiente não oferece todas as APIs necessárias para salvar e exportar com segurança. Abra a aplicação por localhost, HTTPS ou pelo APK Android. Os dados de outras origens do navegador não foram apagados.",
  );
}
