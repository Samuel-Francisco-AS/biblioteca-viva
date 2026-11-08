import { act, render } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { CanvasWelcome } from "./CanvasWelcome";

it("shows the identity for 3 s, fades briefly and releases both timers on exit; reentry starts a new vignette", async () => {
  vi.useFakeTimers();
  try {
    const view = render(<CanvasWelcome />);
    const brand = () => view.container.querySelector(".exploration-header");
    expect(brand()).toHaveTextContent("O santuário das histórias");
    await act(() => vi.advanceTimersByTime(2999));
    expect(brand()).toHaveAttribute("data-phase", "visible");
    await act(() => vi.advanceTimersByTime(1));
    expect(brand()).toHaveAttribute("data-phase", "fading");
    await act(() => vi.advanceTimersByTime(220));
    expect(brand()).toBeNull();
    view.unmount();
    const next = render(<CanvasWelcome />);
    expect(next.container.firstChild).toHaveAttribute("data-phase", "visible");
    next.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
