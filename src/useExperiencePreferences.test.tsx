import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ExperiencePreferencesService } from "./application";
import { useExperiencePreferences } from "./useExperiencePreferences";

function Probe({
  service,
}: {
  readonly service: ExperiencePreferencesService;
}) {
  const preferences = useExperiencePreferences(service);
  return (
    <output aria-label="Preferências efetivas">
      {JSON.stringify(preferences)}
    </output>
  );
}

describe("useExperiencePreferences", () => {
  it("segue mudanças do sistema e permite overrides sem duplicar a resolução", async () => {
    let matches = true;
    let changeListener: (() => void) | undefined;
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        addEventListener: (_type: string, listener: () => void) => {
          changeListener = listener;
        },
        get matches() {
          return matches;
        },
        removeEventListener: vi.fn(),
      })),
    );
    const service = new ExperiencePreferencesService(
      { load: vi.fn(), save: vi.fn(() => Promise.resolve()) },
      { warn: vi.fn() },
    );
    render(<Probe service={service} />);

    expect(screen.getByLabelText("Preferências efetivas")).toHaveTextContent(
      '"reducedMotion":true',
    );
    await act(() => service.setMotion("normal"));
    expect(screen.getByLabelText("Preferências efetivas")).toHaveTextContent(
      '"reducedMotion":false',
    );
    await act(() => service.setMotion("system"));
    matches = false;
    act(() => changeListener?.());
    expect(screen.getByLabelText("Preferências efetivas")).toHaveTextContent(
      '"reducedMotion":false',
    );
    await act(() => service.setMotion("reduce"));
    expect(screen.getByLabelText("Preferências efetivas")).toHaveTextContent(
      '"reducedMotion":true',
    );
    vi.unstubAllGlobals();
  });
});
