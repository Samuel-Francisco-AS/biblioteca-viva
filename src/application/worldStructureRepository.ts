import type { PlacedObject } from "./world";
import type { WorldStructureState } from "./worldStructure";

/** Application port: persistence is owned by infrastructure, never Phaser. */
export interface WorldStructureRepository {
  get(): Promise<WorldStructureState | undefined>;
  initializeIfAbsent(
    state: WorldStructureState,
    recoverObjects: (
      objects: readonly PlacedObject[],
    ) => readonly PlacedObject[],
  ): Promise<WorldStructureState>;
  /** Atomically replaces the current layout only when its revision is current. */
  save(
    state: WorldStructureState,
    expectedRevision: number,
  ): Promise<WorldStructureState>;
}

export class GetWorldStructure {
  constructor(private readonly repository: WorldStructureRepository) {}

  async execute(): Promise<WorldStructureState | undefined> {
    return this.repository.get();
  }
}
