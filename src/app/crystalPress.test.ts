import { afterEach, describe, expect, it, vi } from "vitest";
import { CRYSTAL_PRESS_ECHO_MS, echoCrystalPress } from "./crystalPress";

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

describe("BF-5.7A: tactile echo", () => {
  it("holds the confirmed press beyond pointer release, then releases it", () => {
    vi.useFakeTimers();
    const button = document.createElement("button");
    document.body.append(button);
    echoCrystalPress(button);
    expect(button).toHaveAttribute("data-crystal-pressed", "true");
    vi.advanceTimersByTime(CRYSTAL_PRESS_ECHO_MS - 1);
    expect(button).toHaveAttribute("data-crystal-pressed", "true");
    vi.advanceTimersByTime(1);
    expect(button).not.toHaveAttribute("data-crystal-pressed");
  });

  it("restarts the echo for a second quick tap without stale release", () => {
    vi.useFakeTimers();
    const button = document.createElement("button");
    echoCrystalPress(button);
    vi.advanceTimersByTime(CRYSTAL_PRESS_ECHO_MS - 15);
    echoCrystalPress(button);
    vi.advanceTimersByTime(20);
    expect(button).toHaveAttribute("data-crystal-pressed", "true");
    vi.advanceTimersByTime(CRYSTAL_PRESS_ECHO_MS - 20);
    expect(button).not.toHaveAttribute("data-crystal-pressed");
  });

  it("never marks disabled controls or full-size artwork cards", () => {
    const disabled = document.createElement("button");
    disabled.disabled = true;
    echoCrystalPress(disabled);
    expect(disabled).not.toHaveAttribute("data-crystal-pressed");
    const card = document.createElement("a");
    card.className = "book-card__link";
    echoCrystalPress(card);
    expect(card).not.toHaveAttribute("data-crystal-pressed");
  });

  it("never holds a repeatable page step after click", () => {
    vi.useFakeTimers();
    const step = document.createElement("button");
    step.className = "folio-step";
    echoCrystalPress(step);
    expect(step).not.toHaveAttribute("data-crystal-pressed");
    vi.advanceTimersByTime(CRYSTAL_PRESS_ECHO_MS);
    expect(step).not.toHaveAttribute("data-crystal-pressed");
  });
});
