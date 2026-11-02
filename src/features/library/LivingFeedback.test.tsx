import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LivingSession } from "./livingObjects";
import { LivingFeedback } from "./LivingControls";

afterEach(() => vi.useRealTimers());

describe("LivingFeedback", () => {
  it("starts hidden, then fades and disappears four seconds after an action", () => {
    vi.useFakeTimers();
    const session = new LivingSession();
    const view = render(<LivingFeedback session={session} />);
    expect(screen.queryByTestId("living-feedback")).toBeNull();
    void act(() => session.actPrimary("living:lamp"));
    expect(screen.getByTestId("living-feedback")).toHaveTextContent(
      "A luz revela",
    );
    void act(() => vi.advanceTimersByTime(3600));
    expect(screen.getByTestId("living-feedback")).toHaveAttribute(
      "data-fading",
      "true",
    );
    void act(() => vi.advanceTimersByTime(400));
    expect(screen.queryByTestId("living-feedback")).toBeNull();
    view.unmount();
    session.dispose();
  });

  it("does not replay an old hint when the clock changes atmosphere", () => {
    vi.useFakeTimers();
    let current = new Date(2026, 10, 2, 21);
    const session = new LivingSession(() => current);
    const view = render(<LivingFeedback session={session} />);
    void act(() => session.actPrimary("living:lamp"));
    void act(() => vi.advanceTimersByTime(4000));
    expect(screen.queryByTestId("living-feedback")).toBeNull();
    current = new Date(2026, 10, 3, 10);
    void act(() => session.refreshContext());
    expect(screen.queryByTestId("living-feedback")).toBeNull();
    view.unmount();
    session.dispose();
  });

  it("restarts its timer after a subsequent touch", () => {
    vi.useFakeTimers();
    const session = new LivingSession();
    const view = render(<LivingFeedback session={session} />);
    void act(() => session.actPrimary("living:lamp"));
    void act(() => vi.advanceTimersByTime(2500));
    void act(() => session.actPrimary("living:lamp"));
    void act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByTestId("living-feedback")).toHaveTextContent(
      "recolhido",
    );
    void act(() => vi.advanceTimersByTime(2000));
    expect(screen.queryByTestId("living-feedback")).toBeNull();
    view.unmount();
    session.dispose();
  });
});
