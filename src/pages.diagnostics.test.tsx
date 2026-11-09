import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
vi.mock("./features/library/WorldHost", () => ({
  WorldHost: () => <div data-testid="real-world-contract" />,
}));
vi.mock("./features/library/PerformanceScenarioHarness", () => ({
  PerformanceScenarioHarness: () => <p>Fixture F5 explícita</p>,
}));
afterEach(() => {
  vi.unstubAllEnvs();
});
it("profiles the real application by default and reserves F5 fixtures for an explicit URL", async () => {
  vi.stubEnv("VITE_ENABLE_DIAGNOSTICS", "true");
  const { LibraryPage } = await import("./pages");
  const execute = vi.fn(() => Promise.resolve([]));
  const app = { queries: { listLibraryEntries: { execute } } };
  render(
    <MemoryRouter>
      <LibraryPage application={app} />
    </MemoryRouter>,
  );
  expect(await screen.findByTestId("real-world-contract")).toBeVisible();
  expect(execute).toHaveBeenCalledOnce();
  expect(screen.queryByText("Fixture F5 explícita")).toBeNull();
  cleanup();
  render(
    <MemoryRouter initialEntries={["/?worldScenario=true"]}>
      <LibraryPage application={app} />
    </MemoryRouter>,
  );
  expect(await screen.findByText("Fixture F5 explícita")).toBeVisible();
  expect(execute).toHaveBeenCalledOnce();
});
