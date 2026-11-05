export interface CompositionStyle {
  readonly aspect: "post" | "story" | "square";
  readonly layout: "nocturne" | "premiere" | "folio";
  readonly frame?: "copper" | "lunar" | "none";
  readonly alignment?: "left" | "center" | "right";
  readonly position?: "lower" | "middle";
  readonly darkness?: number;
  readonly title?: string;
  readonly background?: {
    readonly dataUrl: string;
    readonly width: number;
    readonly height: number;
  };
}
export interface ShareComposition extends CompositionStyle {
  readonly mode: string;
  readonly text: string;
  readonly message: string;
}
export const imageHeight = (aspect: CompositionStyle["aspect"]) =>
  aspect === "story" ? 1920 : aspect === "square" ? 1080 : 1350;
