import { render } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { useAppResume } from "./useAppResume";
const native = vi.hoisted(() => ({
  callback: undefined as undefined | ((state: { isActive: boolean }) => void),
  remove: vi.fn(() => Promise.resolve()),
}));
vi.mock("@capacitor/app", () => ({
  App: {
    addListener: vi.fn((_name: string, callback: typeof native.callback) => {
      native.callback = callback;
      return Promise.resolve({ remove: native.remove });
    }),
  },
}));
it("reconciles persisted state on Android/browser resume and removes lifecycle listeners", async () => {
  const refresh = vi.fn();
  function Harness() {
    useAppResume(refresh);
    return null;
  }
  const view = render(<Harness />);
  await Promise.resolve();
  native.callback?.({ isActive: false });
  expect(refresh).not.toHaveBeenCalled();
  native.callback?.({ isActive: true });
  expect(refresh).toHaveBeenCalledTimes(1);
  document.dispatchEvent(new Event("visibilitychange"));
  expect(refresh).toHaveBeenCalledTimes(2);
  view.unmount();
  await Promise.resolve();
  expect(native.remove).toHaveBeenCalledOnce();
  document.dispatchEvent(new Event("visibilitychange"));
  expect(refresh).toHaveBeenCalledTimes(2);
});
