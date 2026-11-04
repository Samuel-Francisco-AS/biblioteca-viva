/** Export artifacts are ephemeral; they never enter records or backups. */
export interface PngArtifact {
  readonly dataUrl: string;
  readonly name: string;
}
export type ImageDeliveryResult = "finished" | "cancelled" | "unavailable";
export interface ImageFilesPort {
  share(image: PngArtifact): Promise<ImageDeliveryResult>;
  save(image: PngArtifact): Promise<ImageDeliveryResult>;
}
