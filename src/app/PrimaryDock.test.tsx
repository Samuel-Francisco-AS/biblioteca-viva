import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import { cancelPassage } from "./interactionContinuity";
afterEach(() => cancelPassage());
import { PrimaryDock } from "./PrimaryDock";
import { preloadRoute } from "./routeModules";
vi.mock("./routeModules", () => ({ preloadRoute: vi.fn() }));
it("acknowledges navigation while pending, warms on contact and clears feedback permanently on commit and return", () => {
  const view = render(<PrimaryDock pathname="/" />, { wrapper: MemoryRouter });
  const link = screen.getByRole("link", { name: "Coleção" });
  fireEvent.pointerDown(link);
  // Touch must not parse the next route before the press is visible.
  expect(preloadRoute).not.toHaveBeenCalledWith("/colecao");
  fireEvent.click(link);
  expect(link).toHaveAttribute("data-pending", "true");
  view.rerender(<PrimaryDock pathname="/colecao" />);
  expect(link).toHaveAttribute("data-pending", "false");
  view.rerender(<PrimaryDock pathname="/" />);
  expect(link).toHaveAttribute("data-pending", "false");
  fireEvent.click(link, { ctrlKey: true });
  expect(link).toHaveAttribute("data-pending", "false");
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
