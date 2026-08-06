import { describe, expect, it } from "vitest";

import {
  TAP_MOVEMENT_THRESHOLD,
  TapSelectionPolicy,
} from "./tapSelectionPolicy";

describe("TapSelectionPolicy", () => {
  it("aceita toque curto e pequeno tremor uma única vez", () => {
    const policy = new TapSelectionPolicy();
    policy.begin("shelf", 1, 10, 10);
    policy.move(1, 15, 14);
    expect(policy.end(1)).toBe("shelf");
    expect(policy.end(1)).toBeUndefined();
  });

  it("rejeita arraste acima do limiar inclusive vertical", () => {
    const policy = new TapSelectionPolicy();
    policy.begin("librarian", 2, 20, 20);
    policy.move(2, 20, 20 + TAP_MOVEMENT_THRESHOLD + 1);
    expect(policy.end(2)).toBeUndefined();
  });

  it("rejeita pointer cancel e cancelamento por destroy", () => {
    const policy = new TapSelectionPolicy();
    policy.begin("creature", 3, 0, 0);
    expect(policy.end(3, true)).toBeUndefined();
    policy.begin("creature", 3, 0, 0);
    policy.cancel();
    expect(policy.end(3)).toBeUndefined();
  });

  it("ignora eventos de outro pointer", () => {
    const policy = new TapSelectionPolicy();
    policy.begin("highlighted-book", 4, 0, 0);
    policy.move(5, 100, 100);
    expect(policy.end(5)).toBeUndefined();
    expect(policy.end(4)).toBe("highlighted-book");
  });

  it("preserva clique de mouse pelo mesmo caminho sem delay", () => {
    const policy = new TapSelectionPolicy();
    policy.begin("shelf", 0, 40, 40);
    expect(policy.end(0)).toBe("shelf");
  });
});
