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
    act(() => session.actPrimary("living:lamp"));
    expect(screen.getByTestId("living-feedback")).toHaveTextContent(
      "A luz revela",
    );
    act(() => vi.advanceTimersByTime(3600));
    expect(screen.getByTestId("living-feedback")).toHaveAttribute(
      "data-fading",
      "true",
    );
    act(() => vi.advanceTimersByTime(400));
    expect(screen.queryByTestId("living-feedback")).toBeNull();
    view.unmount();
    session.dispose();
  });

  it("restarts its timer after a subsequent touch", () => {
    vi.useFakeTimers();
    const session = new LivingSession();
    const view = render(<LivingFeedback session={session} />);
    act(() => session.actPrimary("living:lamp"));
    act(() => vi.advanceTimersByTime(2500));
    act(() => session.actPrimary("living:lamp"));
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByTestId("living-feedback")).toHaveTextContent(
      "recolhido",
    );
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.queryByTestId("living-feedback")).toBeNull();
    view.unmount();
    session.dispose();
  });
});
