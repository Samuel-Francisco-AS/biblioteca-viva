import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getUiActionProbeSnapshot,
  recordUiActionStart,
  recordUiRouteCommit,
  setUiActionProbeEnabled,
  subscribeUiActionProbe,
  uiRouteCategory,
} from "./uiActionProbe";

afterEach(() => {
  setUiActionProbeEnabled(false);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("BV-UXC R4 UI action diagnostics", () => {
  it("never stores dynamic record or deck IDs in route labels", () => {
    expect(uiRouteCategory("/registros/private-999/editar")).toBe("/registros/:id");
    expect(uiRouteCategory("/arcanario/baralhos/personal-123")).toBe(
      "/arcanario/baralhos",
    );
    expect(uiRouteCategory("/arcanario/duelos/arena/match-secret")).toBe(
      "/arcanario/duelos",
    );
    expect(uiRouteCategory("/")).toBe("/");
  });

  it("measures click-to-RAF and route commit while preserving only route categories", () => {
    const callbacks: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callbacks.push(callback);
      return callbacks.length;
    });
    setUiActionProbeEnabled(true);
    const changed = vi.fn();
    const unsubscribe = subscribeUiActionProbe(changed);
    recordUiActionStart({
      source: "arcanarium",
      kind: "link",
      from: "/arcanario/baralhos/my-secret",
      to: "/arcanario/duelos/arena/game-id",
    });
    expect(getUiActionProbeSnapshot().observations[0]).toMatchObject({
      source: "arcanarium",
      from: "/arcanario/baralhos",
      to: "/arcanario/duelos",
      firstRafMs: null,
    });
    callbacks.shift()?.(16);
    callbacks.shift()?.(32);
    recordUiRouteCommit("/arcanario/duelos/arena/other-secret");
    const result = getUiActionProbeSnapshot().observations[0];
    expect(result?.firstRafMs).not.toBeNull();
    expect(result?.secondRafMs).not.toBeNull();
    expect(result?.routeCommitMs).not.toBeNull();
    expect(changed).toHaveBeenCalled();
    unsubscribe();
  });

  it("drops pending callbacks when the user disables diagnostics", () => {
    const callbacks: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      callbacks.push(cb);
      return callbacks.length;
    });
    setUiActionProbeEnabled(true);
    recordUiActionStart({
      source: "dock",
      kind: "link",
      from: "/",
      to: "/colecao",
    });
    setUiActionProbeEnabled(false);
    callbacks.shift()?.(16);
    expect(getUiActionProbeSnapshot()).toEqual({
      enabled: false,
      observations: [],
    });
  });
});
