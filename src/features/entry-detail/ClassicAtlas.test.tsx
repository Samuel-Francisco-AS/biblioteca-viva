import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ClassicAtlas } from "./ClassicAtlas";
import { ATLAS_HOLD_MS, ATLAS_DISSOLVE_MS } from "./classicAtlas";
let onIntersection: ((visible: boolean) => void) | undefined;
let onMediaChange: (() => void) | undefined;
let reduced = false;
let decodeFails = false;
const requested: string[] = [];
const disconnect = vi.fn();
beforeEach(() => {
  Object.defineProperty(document, "hidden", {
    configurable: true,
    value: false,
  });
  vi.useFakeTimers();
  reduced = false;
  decodeFails = false;
  requested.length = 0;
  vi.stubGlobal("matchMedia", () => ({
    get matches() {
      return reduced;
    },
    addEventListener: (_name: string, callback: () => void) => {
      onMediaChange = callback;
    },
    removeEventListener: vi.fn(),
  }));
  vi.stubGlobal(
    "IntersectionObserver",
    class implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = "0px";
      readonly scrollMargin = "0px";
      readonly thresholds = [0];
      constructor(callback: IntersectionObserverCallback) {
        onIntersection = (visible) =>
          callback(
            [
              {
                isIntersecting: visible,
                target: document.documentElement,
                time: 0,
                rootBounds: null,
                boundingClientRect: new DOMRect(),
                intersectionRect: new DOMRect(),
                intersectionRatio: visible ? 1 : 0,
              },
            ],
            this,
          );
      }
      observe() {}
      unobserve() {}
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
      disconnect = disconnect;
    },
  );
  vi.stubGlobal(
    "Image",
    class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(value: string) {
        requested.push(value);
        queueMicrotask(() => this.onload?.());
      }
      decode() {
        return decodeFails
          ? Promise.reject(new Error("fixture_decode"))
          : Promise.resolve();
      }
    },
  );
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
async function tick(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}
function openAtlas() {
  const view = render(
    <div data-reduced-motion="false">
      <ClassicAtlas />
    </div>,
  );
  fireEvent.load(screen.getByRole("img"));
  act(() => onIntersection?.(true));
  return view;
}
it("holds a plate, decodes the next before a two-layer dissolve and removes old art afterwards", async () => {
  const view = openAtlas();
  expect(screen.getByRole("img")).toHaveAttribute(
    "src",
    expect.stringContaining("masculino-frontal"),
  );
  await tick(ATLAS_HOLD_MS - 1);
  expect(requested).toHaveLength(0);
  await tick(1);
  expect(requested).toHaveLength(1);
  expect(view.container.querySelectorAll("img")).toHaveLength(2);
  expect(view.container.querySelector("figure")).toHaveAttribute(
    "data-transitioning",
    "true",
  );
  expect(screen.getByRole("img")).toHaveAttribute(
    "src",
    expect.stringContaining("masculino-frontal"),
  );
  await tick(ATLAS_DISSOLVE_MS);
  expect(view.container.querySelectorAll("img")).toHaveLength(1);
  expect(screen.getByRole("img")).toHaveAttribute(
    "src",
    expect.stringContaining("masculino-tres-quartos"),
  );
});
it("pauses offscreen, when hidden and by user choice; cleanup cancels timers and observers", async () => {
  const view = openAtlas();
  act(() => onIntersection?.(false));
  await tick(ATLAS_HOLD_MS * 2);
  expect(requested).toHaveLength(0);
  act(() => onIntersection?.(true));
  fireEvent.click(screen.getByRole("button", { name: "Pausar projeção" }));
  await tick(ATLAS_HOLD_MS * 2);
  expect(requested).toHaveLength(0);
  fireEvent.click(screen.getByRole("button", { name: "Retomar projeção" }));
  Object.defineProperty(document, "hidden", {
    configurable: true,
    value: true,
  });
  fireEvent(document, new Event("visibilitychange"));
  await tick(ATLAS_HOLD_MS * 2);
  expect(requested).toHaveLength(0);
  Object.defineProperty(document, "hidden", {
    configurable: true,
    value: false,
  });
  fireEvent(document, new Event("visibilitychange"));
  view.unmount();
  await tick(ATLAS_HOLD_MS * 2);
  expect(requested).toHaveLength(0);
  expect(disconnect).toHaveBeenCalled();
});
it("honors app and system reduced motion while allowing a static manual change", async () => {
  const view = openAtlas();
  const shell = view.container.firstElementChild;
  if (!shell) throw new Error("fixture shell");
  await act(async () => {
    shell.setAttribute("data-reduced-motion", "true");
    await Promise.resolve();
  });
  await tick(ATLAS_HOLD_MS * 2);
  expect(requested).toHaveLength(0);
  fireEvent.click(screen.getByRole("button", { name: "Próxima arte" }));
  await tick(0);
  expect(view.container.querySelectorAll("img")).toHaveLength(1);
  expect(screen.getByRole("img")).toHaveAttribute(
    "src",
    expect.stringContaining("tres-quartos"),
  );
  await act(async () => {
    shell.setAttribute("data-reduced-motion", "false");
    await Promise.resolve();
  });
  reduced = true;
  act(() => onMediaChange?.());
  await tick(ATLAS_HOLD_MS * 2);
  expect(requested).toHaveLength(1);
});
it("keeps current art on decoding failure and never loops indefinitely through missing files", async () => {
  const view = openAtlas();
  decodeFails = true;
  await tick(ATLAS_HOLD_MS);
  expect(requested).toHaveLength(2);
  expect(screen.getByRole("status")).toHaveTextContent(
    "A arte atual foi mantida",
  );
  expect(screen.getByRole("img")).toHaveAttribute(
    "src",
    expect.stringContaining("frontal"),
  );
  expect(view.container.querySelectorAll("img")).toHaveLength(1);
  await tick(ATLAS_HOLD_MS * 4);
  expect(requested).toHaveLength(2);
});
it("loads a female profile before showing the set and provides a clear fallback on profile failure", async () => {
  const view = render(
    <ClassicAtlas
      profile={{
        load: () => Promise.resolve({ gender: "female" }),
        save: vi.fn(),
      }}
    />,
  );
  await act(async () => {
    await Promise.resolve();
  });
  expect(screen.getByRole("img")).toHaveAttribute(
    "src",
    expect.stringContaining("feminino-frontal"),
  );
  view.unmount();
  render(
    <ClassicAtlas
      profile={{
        load: () => Promise.reject(new Error("fixture")),
        save: vi.fn(),
      }}
    />,
  );
  await act(async () => {
    await Promise.resolve();
  });
  expect(
    screen.getByText(/Perfil indisponível.*coleção padrão masculina/),
  ).toHaveAttribute("role", "status");
  expect(screen.getByRole("img")).toHaveAttribute(
    "src",
    expect.stringContaining("masculino-frontal"),
  );
});
it("cancels a dissolve on pause, preserves the current plate and resumes with a fresh hold", async () => {
  const view = openAtlas();
  await tick(ATLAS_HOLD_MS);
  expect(view.container.querySelectorAll("img")).toHaveLength(2);
  fireEvent.click(screen.getByRole("button", { name: "Pausar projeção" }));
  expect(view.container.querySelectorAll("img")).toHaveLength(1);
  await tick(ATLAS_HOLD_MS * 2);
  expect(screen.getByRole("img")).toHaveAttribute(
    "src",
    expect.stringContaining("frontal"),
  );
  fireEvent.click(screen.getByRole("button", { name: "Retomar projeção" }));
  await tick(ATLAS_HOLD_MS + ATLAS_DISSOLVE_MS);
  expect(screen.getByRole("img")).toHaveAttribute(
    "src",
    expect.stringContaining("tres-quartos"),
  );
});
