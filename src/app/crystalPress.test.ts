import { afterEach, describe, expect, it, vi } from "vitest";
import { echoCrystalPress } from "./crystalPress";

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
    vi.advanceTimersByTime(120);
    expect(button).toHaveAttribute("data-crystal-pressed", "true");
    vi.advanceTimersByTime(70);
    expect(button).not.toHaveAttribute("data-crystal-pressed");
  });

  it("restarts the echo for a second quick tap without stale release", () => {
    vi.useFakeTimers();
    const button = document.createElement("button");
    echoCrystalPress(button);
    vi.advanceTimersByTime(150);
    echoCrystalPress(button);
    vi.advanceTimersByTime(50);
    expect(button).toHaveAttribute("data-crystal-pressed", "true");
    vi.advanceTimersByTime(140);
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
});
