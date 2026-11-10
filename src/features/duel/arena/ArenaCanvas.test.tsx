import { render, waitFor } from "@testing-library/react";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { fixtureMatch } from "../../../test/duelFixtures";
import { projectArena } from "./arenaModel";
import { ArenaCanvas } from "./ArenaCanvas";
const mock = vi.hoisted(() => ({
  update: vi.fn(),
  select: vi.fn(),
  anchors: vi.fn(() => []),
  animate: vi.fn(),
  resize: vi.fn(),
  dispose: vi.fn(),
  rendererDispose: vi.fn(),
  forceContextLoss: vi.fn(),
  setSize: vi.fn(),
  render: vi.fn(),
}));
vi.mock("./arenaScene", () => ({
  createArenaScene: () => ({
    ...mock,
    scene: {},
    camera: {},
    effectsActive: () => false,
  }),
}));
vi.mock("three", () => ({
  SRGBColorSpace: "srgb",
  WebGLRenderer: class {
    domElement = document.createElement("canvas");
    setPixelRatio = vi.fn();
    setClearColor = vi.fn();
    setSize = mock.setSize;
    render = mock.render;
    dispose = mock.rendererDispose;
    forceContextLoss = mock.forceContextLoss;
  },
}));
beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});
it("selection updates only highlighting, preserves the frame loop and disposes graphics on exit", async () => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(
    new DOMRect(0, 0, 400, 500),
  );
  const raf = vi.spyOn(window, "requestAnimationFrame");
  const view = projectArena(fixtureMatch()),
    targets = new Set<string>(),
    onAnchors = vi.fn();
  const props = { view, targets, onAnchors, active: true };
  const mounted = render(<ArenaCanvas {...props} />);
  await waitFor(() => expect(mock.update).toHaveBeenCalledOnce());
  const scheduled = raf.mock.calls.length;
  mounted.rerender(<ArenaCanvas {...props} selected="fiction" />);
  expect(mock.select).toHaveBeenLastCalledWith("fiction", targets);
  expect(mock.update).toHaveBeenCalledOnce();
  expect(onAnchors).toHaveBeenCalledOnce();
  expect(raf).toHaveBeenCalledTimes(scheduled);
  mounted.unmount();
  expect(mock.dispose).toHaveBeenCalledOnce();
  expect(mock.rendererDispose).toHaveBeenCalledOnce();
  expect(mock.forceContextLoss).toHaveBeenCalledOnce();
});
it("cleans an allocated renderer if initial sizing fails", async () => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(
    new DOMRect(0, 0, 400, 500),
  );
  mock.setSize.mockImplementationOnce(() => {
    throw new Error("synthetic allocation failure");
  });
  const view = render(
    <ArenaCanvas
      view={projectArena(fixtureMatch())}
      targets={new Set()}
      active
      onAnchors={() => {}}
    />,
  );
  await waitFor(() => expect(mock.rendererDispose).toHaveBeenCalledOnce());
  expect(mock.dispose).toHaveBeenCalledOnce();
  view.unmount();
});
