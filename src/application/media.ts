/** One bounded, locally normalized poster per owning record. Export backgrounds are ephemeral. */
export interface LocalPoster {
  readonly entryId: string;
  readonly dataUrl: string;
  readonly width: number;
  readonly height: number;
}
export interface PosterPort {
  get(entryId: string): Promise<LocalPoster | undefined>;
  save(poster: LocalPoster): Promise<void>;
  remove(entryId: string): Promise<void>;
}
