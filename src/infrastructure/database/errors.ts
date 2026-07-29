export class InfrastructureError extends Error {
  constructor(
    public readonly code: "DATABASE_READ_FAILED" | "DATABASE_WRITE_FAILED",
    public readonly operation: string,
  ) {
    super("Falha controlada de infraestrutura.");
    this.name = "InfrastructureError";
  }
}
