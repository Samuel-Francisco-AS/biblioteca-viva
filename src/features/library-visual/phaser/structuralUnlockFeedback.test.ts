import { describe, expect, it } from "vitest";

import {
  shouldPresentStructuralUnlockFeedback,
  structuralUnlockFeedbackDuration,
} from "./structuralUnlockFeedback";

describe("feedback efêmero de desbloqueio estrutural", () => {
  const feedback = {
    familyIds: ["structure-family.floor.wood"] as const,
    token: "unlock-1",
  };

  it("executa apenas para um token novo", () => {
    expect(shouldPresentStructuralUnlockFeedback(undefined, feedback)).toBe(
      true,
    );
    expect(shouldPresentStructuralUnlockFeedback("unlock-1", feedback)).toBe(
      false,
    );
    expect(shouldPresentStructuralUnlockFeedback("unlock-0", feedback)).toBe(
      true,
    );
  });

  it("mantém o efeito finito e reduzido sem pulsação", () => {
    expect(structuralUnlockFeedbackDuration(false)).toBe(900);
    expect(structuralUnlockFeedbackDuration(true)).toBe(650);
  });
});
