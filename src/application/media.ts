/** One bounded, locally normalized cover per book/movie/series. Export backgrounds are ephemeral. */
export interface RecordImage {
  readonly entryId: string;
  readonly dataUrl: string;
  readonly width: number;
  readonly height: number;
}
export interface RecordImagesPort {
  get(entryId: string): Promise<RecordImage | undefined>;
  save(poster: RecordImage): Promise<void>;
  remove(entryId: string): Promise<void>;
}

/** Compatibility names for the audiovisual callers delivered in Part 2D. */
export type LocalPoster = RecordImage;
export type PosterPort = RecordImagesPort;
