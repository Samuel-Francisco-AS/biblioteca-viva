export type LibraryRecordModelTypeId =
  | "movie-record"
  | "series-record"
  | "study-record"
  | "physical-activity-record"
  | "work-record";

/** Measured local envelope of an isolated procedural representation. */
export interface ProceduralLibraryRecordDimensions {
  readonly depth: number;
  readonly height: number;
  readonly width: number;
}

/**
 * The C1 envelopes are the sole numeric authority shared by factories and the
 * renderer-free C2 layout. Factory tests independently measure these values
 * with Box3.
 */
export const PROCEDURAL_LIBRARY_RECORD_DIMENSIONS: Readonly<
  Record<LibraryRecordModelTypeId, Readonly<ProceduralLibraryRecordDimensions>>
> = Object.freeze({
  "movie-record": Object.freeze({ depth: 0.48, height: 1.2, width: 1.296 }),
  "physical-activity-record": Object.freeze({
    depth: 0.8,
    height: 1.18,
    width: 0.92,
  }),
  "series-record": Object.freeze({ depth: 0.4, height: 1.25, width: 1.188 }),
  "study-record": Object.freeze({ depth: 0.8, height: 1.056, width: 1.232 }),
  "work-record": Object.freeze({ depth: 0.8, height: 1.05, width: 1.2 }),
});

/** Returns a frozen value object so callers cannot change the authority. */
export function getProceduralLibraryRecordDimensions(
  modelTypeId: LibraryRecordModelTypeId,
): Readonly<ProceduralLibraryRecordDimensions> {
  const { depth, height, width } =
    PROCEDURAL_LIBRARY_RECORD_DIMENSIONS[modelTypeId];
  return Object.freeze({ depth, height, width });
}
