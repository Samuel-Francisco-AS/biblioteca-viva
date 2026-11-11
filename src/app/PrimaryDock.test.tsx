import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import { cancelPassage, completePassageDeparture } from "./interactionContinuity";
import { PrimaryDock } from "./PrimaryDock";
import { preloadRoute } from "./routeModules";
vi.mock("./routeModules", () => ({ preloadRoute: vi.fn() }));
afterEach(() => cancelPassage());
it("acknowledges navigation while pending, warms on contact and clears feedback permanently on commit and return", () => {
  const view = render(<PrimaryDock pathname="/" />, { wrapper: MemoryRouter });
  const link = screen.getByRole("link", { name: "Coleção" });
  fireEvent.pointerDown(link);
  // Touch must not parse the next route before the press is visible.
  expect(preloadRoute).not.toHaveBeenCalledWith("/colecao");
  fireEvent.click(link);
  expect(link).toHaveAttribute("data-pending", "true");
  view.rerender(<PrimaryDock pathname="/colecao" />);
  expect(link).not.toHaveAttribute("data-pending");
  view.rerender(<PrimaryDock pathname="/" />);
  expect(link).not.toHaveAttribute("data-pending");
  fireEvent.click(link, { ctrlKey: true });
  expect(link).not.toHaveAttribute("data-pending");
});

it("cancels a pending curtain when the active dock tab is selected again", () => {
  const view = render(
    <MemoryRouter>
      <div className="app-shell">
        <PrimaryDock pathname="/" />
      </div>
    </MemoryRouter>,
  );
  const shell = view.container.querySelector(".app-shell");
  fireEvent.click(screen.getByRole("link", { name: "Coleção" }));
  expect(shell).toHaveAttribute("data-passage", "departing");
  fireEvent.click(screen.getByRole("link", { name: "Biblioteca" }));
  expect(shell).not.toHaveAttribute("data-passage");
  expect(
    view.container.querySelector('.primary-dock__link[data-pending="true"]'),
  ).toBeNull();
});

function RoutedDockFixture() {
  const location = useLocation();
  return (
    <div className="app-shell">
      <PrimaryDock pathname={location.pathname} />
      <output data-testid="path">{location.pathname}</output>
    </div>
  );
}

it("commits one dock navigation after the sealed curtain without lazy route loading", async () => {
  const frames: FrameRequestCallback[] = [];
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.push(callback);
    return frames.length;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  const visible = vi.spyOn(document, "visibilityState", "get");
  visible.mockReturnValue("visible");
  const view = render(
    <MemoryRouter>
      <RoutedDockFixture />
    </MemoryRouter>,
  );
  try {
    const path = screen.getByTestId("path");
    fireEvent.click(screen.getByRole("link", { name: "Coleção" }));
    expect(path).toHaveTextContent("/");
    // This test has no Suspense/dynamic route import: navigation itself
    // must work, after two scheduled frames, once the cover is opaque.
    act(() => completePassageDeparture());
    expect(frames).toHaveLength(1);
    await act(async () => frames.shift()?.(560));
    expect(path).toHaveTextContent("/");
    expect(frames).toHaveLength(1);
    await act(async () => frames.shift()?.(576));
    await waitFor(() => expect(path).toHaveTextContent("/colecao"));
  } finally {
    cancelPassage();
    view.unmount();
    visible.mockRestore();
    vi.unstubAllGlobals();
  }
});
