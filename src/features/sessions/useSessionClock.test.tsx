import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  completeSession,
  createTimedSession,
  pauseSession,
  resumeSession,
  type Session,
} from "../../domain";
import { useSessionClock } from "./useSessionClock";

const native = vi.hoisted(() => ({
  listeners: new Set<(state: { isActive: boolean }) => void>(),
  removed: vi.fn(),
}));
vi.mock("@capacitor/app", () => ({
  App: {
    addListener: vi.fn(
      (_event: string, listener: (state: { isActive: boolean }) => void) => {
        native.listeners.add(listener);
        return Promise.resolve({
          remove: () => {
            native.listeners.delete(listener);
            native.removed();
            return Promise.resolve();
          },
        });
      },
    ),
  },
}));
const initial = "2026-11-07T12:00:00.000Z";
const timestamp = () => new Date().toISOString();
const session = () =>
  createTimedSession({
    id: "reading",
    entryId: "book",
    entryType: "book",
    startedAt: initial,
  });
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(initial);
  native.removed.mockClear();
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  native.listeners.clear();
});
describe("session redraw clock", () => {
  it("shares one timer and timestamp across consumers, releasing it after the last unmount", async () => {
    const current = session();
    const first = renderHook(() => useSessionClock(current));
    await act(() => vi.advanceTimersByTime(400));
    const second = renderHook(() => useSessionClock(current));
    expect(vi.getTimerCount()).toBe(1);
    await act(() => vi.advanceTimersByTime(600));
    expect(first.result.current).toBe(1);
    expect(second.result.current).toBe(first.result.current);
    first.unmount();
    expect(vi.getTimerCount()).toBe(1);
    await act(() => vi.advanceTimersByTime(1_000));
    expect(second.result.current).toBe(2);
    second.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("advances every second, freezes on pause, resumes and matches completion exactly", async () => {
    let current = session();
    const view = renderHook(
      ({ value }: { value?: Session }) => useSessionClock(value),
      { initialProps: { value: current } },
    );
    expect(view.result.current).toBe(0);
    for (let second = 1; second <= 3; second++) {
      await act(() => vi.advanceTimersByTime(1_000));
      expect(view.result.current).toBe(second);
    }
    current = pauseSession(current, timestamp());
    view.rerender({ value: current });
    expect(vi.getTimerCount()).toBe(0);
    await act(() => vi.advanceTimersByTime(20_000));
    expect(view.result.current).toBe(3);
    current = resumeSession(current, timestamp());
    view.rerender({ value: current });
    expect(view.result.current).toBe(3);
    await act(() => vi.advanceTimersByTime(2_000));
    expect(view.result.current).toBe(5);
    expect(completeSession(current, timestamp()).accumulatedDuration).toBe(
      view.result.current,
    );
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("suspends hidden/native background ticks and catches up on foreground and remount", async () => {
    const current = session();
    const view = renderHook(() => useSessionClock(current));
    await act(async () => {
      await Promise.resolve();
    });
    expect(vi.getTimerCount()).toBe(1);
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    await act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(vi.getTimerCount()).toBe(0);
    await act(() => vi.advanceTimersByTime(70_000));
    expect(view.result.current).toBe(0);
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
    await act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(view.result.current).toBe(70);
    act(() =>
      native.listeners.forEach((listener) => listener({ isActive: false })),
    );
    expect(vi.getTimerCount()).toBe(0);
    await act(() => vi.advanceTimersByTime(10_000));
    act(() =>
      native.listeners.forEach((listener) => listener({ isActive: true })),
    );
    expect(view.result.current).toBe(80);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(native.listeners.size).toBe(0);
    expect(native.removed).toHaveBeenCalledOnce();
    const reopened = renderHook(() => useSessionClock(current));
    expect(reopened.result.current).toBe(80);
    reopened.unmount();
    // Also removes a native registration whose promise resolves after unmount.
    await act(async () => {
      await Promise.resolve();
    });
    expect(native.listeners.size).toBe(0);
    await act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(vi.getTimerCount()).toBe(0);
  });

  it("has no timer while idle/paused and keeps the Study focus cap", async () => {
    const idle = renderHook(() => useSessionClock());
    expect(idle.result.current).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
    idle.unmount();
    const focus = createTimedSession({
      id: "focus",
      entryId: "study",
      entryType: "study",
      focusDurationSeconds: 60,
      startedAt: initial,
    });
    const view = renderHook(() => useSessionClock(focus));
    await act(() => vi.advanceTimersByTime(90_000));
    expect(view.result.current).toBe(60);
    view.unmount();
  });
});
