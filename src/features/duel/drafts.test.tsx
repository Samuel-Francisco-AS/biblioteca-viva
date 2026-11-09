import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useDuelDraft } from "./drafts";
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});
it("coalesces edits but flushes the latest committed draft on pagehide and unmount", () => {
  vi.useFakeTimers();
  const port = { read: vi.fn(), write: vi.fn(), remove: vi.fn() };
  const view = renderHook(
    ({ text }) => useDuelDraft(port, "fiction", { text }),
    { initialProps: { text: "A" } },
  );
  view.rerender({ text: "AB" });
  view.rerender({ text: "ABC" });
  expect(port.write).not.toHaveBeenCalled();
  act(() => {
    vi.advanceTimersByTime(150);
  });
  expect(port.write).toHaveBeenCalledExactlyOnceWith(
    "fiction",
    JSON.stringify({ text: "ABC" }),
  );
  view.rerender({ text: "ABCD" });
  act(() => {
    window.dispatchEvent(new Event("pagehide"));
  });
  expect(port.write).toHaveBeenLastCalledWith(
    "fiction",
    JSON.stringify({ text: "ABCD" }),
  );
  view.rerender({ text: "ABCDE" });
  view.unmount();
  expect(port.write).toHaveBeenLastCalledWith(
    "fiction",
    JSON.stringify({ text: "ABCDE" }),
  );
  const count = port.write.mock.calls.length;
  act(() => {
    vi.runAllTimers();
    window.dispatchEvent(new Event("pagehide"));
  });
  expect(port.write).toHaveBeenCalledTimes(count);
});
it("never resurrects a draft after a successful save", () => {
  vi.useFakeTimers();
  const port = { read: vi.fn(), write: vi.fn(), remove: vi.fn() };
  const view = renderHook(() =>
    useDuelDraft(port, "fiction", { text: "saved" }),
  );
  act(() => {
    view.result.current.finish();
    vi.runAllTimers();
    window.dispatchEvent(new Event("pagehide"));
  });
  view.unmount();
  expect(port.remove).toHaveBeenCalledExactlyOnceWith("fiction");
  expect(port.write).not.toHaveBeenCalled();
});
