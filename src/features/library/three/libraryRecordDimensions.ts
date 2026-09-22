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
  "movie-record": Object.freeze({ depth: 0.24, height: 0.48, width: 0.72 }),
  "physical-activity-record": Object.freeze({
    depth: 0.4,
    height: 0.59,
    width: 0.46,
  }),
  "series-record": Object.freeze({ depth: 0.2, height: 0.5, width: 0.66 }),
  "study-record": Object.freeze({ depth: 0.4, height: 0.132, width: 0.56 }),
  "work-record": Object.freeze({ depth: 0.4, height: 0.3, width: 0.6 }),
});

/** Returns a frozen value object so callers cannot change the authority. */
export function getProceduralLibraryRecordDimensions(
  modelTypeId: LibraryRecordModelTypeId,
): Readonly<ProceduralLibraryRecordDimensions> {
  const { depth, height, width } =
    PROCEDURAL_LIBRARY_RECORD_DIMENSIONS[modelTypeId];
  return Object.freeze({ depth, height, width });
}
