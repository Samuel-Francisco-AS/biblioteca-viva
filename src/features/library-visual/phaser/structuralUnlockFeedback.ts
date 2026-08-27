import type { StructuralUnlockFeedback } from "../contracts";

export function shouldPresentStructuralUnlockFeedback(
  previousToken: string | undefined,
  feedback: StructuralUnlockFeedback | null | undefined,
): boolean {
  return (
    feedback !== undefined &&
    feedback !== null &&
    feedback.token !== previousToken
  );
}

export function structuralUnlockFeedbackDuration(
  reducedMotion: boolean,
): number {
  return reducedMotion ? 650 : 900;
}
