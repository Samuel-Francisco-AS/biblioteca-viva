import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PerformanceScenarioHarness } from "./PerformanceScenarioHarness";
import { PERFORMANCE_SCENARIOS } from "./three/performanceScenarios";

const receivedScenarios: string[] = [];

vi.mock("./WorldHost", () => ({
  WorldHost: ({
    performanceScenario,
  }: {
    performanceScenario: { id: string };
  }) => {
    receivedScenarios.push(performanceScenario.id);
    return <div data-testid="world-host-stub" />;
  },
}));

describe("PerformanceScenarioHarness", () => {
  it("troca o cenário por botões DOM e anuncia claramente o ativo", async () => {
    const user = userEvent.setup();
    render(<PerformanceScenarioHarness />);

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Baseline F1" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("Cenário ativo: Baseline F1.")).toBeVisible();

    const stress = screen.getByRole("button", { name: "Corpus F4 ×4" });
    stress.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("button", { name: "Baseline F1" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(stress).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Cenário ativo: Corpus F4 ×4.")).toBeVisible();
    expect(receivedScenarios).toEqual([
      PERFORMANCE_SCENARIOS[0]?.id,
      PERFORMANCE_SCENARIOS[2]?.id,
    ]);
  });
});
