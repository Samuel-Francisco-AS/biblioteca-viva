export type DomainErrorCode =
  | "INVALID_FIELD"
  | "INVALID_PROGRESS"
  | "INVALID_STATUS_TRANSITION"
  | "INVALID_DATE"
  | "INVALID_REVISION";

export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string,
    public readonly field?: string,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export class InvalidFieldError extends DomainError {
  constructor(field: string, reason: string) {
    super("INVALID_FIELD", `Campo ${field} inválido: ${reason}.`, field);
    this.name = "InvalidFieldError";
  }
}

export class InvalidProgressError extends DomainError {
  constructor(reason: string, field = "currentPage") {
    super("INVALID_PROGRESS", `Progresso inválido: ${reason}.`, field);
    this.name = "InvalidProgressError";
  }
}

export class InvalidStatusTransitionError extends DomainError {
  constructor(from: string, to: string, reason?: string) {
    super(
      "INVALID_STATUS_TRANSITION",
      `Transição de status inválida: ${from} → ${to}${reason ? ` (${reason})` : ""}.`,
      "status",
    );
    this.name = "InvalidStatusTransitionError";
  }
}

export class InvalidDateError extends DomainError {
  constructor(field: string, reason: string) {
    super("INVALID_DATE", `Data ${field} inválida: ${reason}.`, field);
    this.name = "InvalidDateError";
  }
}

export class InvalidRevisionError extends DomainError {
  constructor(reason: string) {
    super("INVALID_REVISION", `Revisão inválida: ${reason}.`, "revision");
    this.name = "InvalidRevisionError";
  }
}
