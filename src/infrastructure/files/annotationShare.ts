import { Capacitor } from "@capacitor/core";

import type {
  AnnotationSharePort,
  AnnotationShareResult,
} from "../../application";

function cancelled(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export class PlatformAnnotationShare implements AnnotationSharePort {
  async share(input: {
    readonly text: string;
    readonly title: string;
  }): Promise<AnnotationShareResult> {
    if (Capacitor.isNativePlatform()) {
      try {
        const { Share } = await import("@capacitor/share");
        await Share.share({ text: input.text, title: input.title });
        return "flow-finished";
      } catch (error: unknown) {
        if (cancelled(error)) return "cancelled";
        throw error;
      }
    }
    if (typeof navigator.share !== "function") return "unavailable";
    try {
      await navigator.share({ text: input.text, title: input.title });
      return "flow-finished";
    } catch (error: unknown) {
      if (cancelled(error)) return "cancelled";
      throw error;
    }
  }
}
