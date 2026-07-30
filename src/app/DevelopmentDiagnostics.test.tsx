import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ApplicationDiagnostics } from "./createApplication";
import { DevelopmentDiagnostics } from "./DevelopmentDiagnostics";

function diagnostics() {
  const inspect = vi.fn(() =>
    Promise.resolve({
      databaseName: "biblioteca-viva-test",
      databaseVersion: 2,
      isOpen: true,
      persistence: "unsupported" as const,
      counts: {
        activities: 1,
        libraryEntries: 1,
        metadata: 1,
        notes: 0,
        quotes: 0,
        settings: 0,
      },
    }),
  );
  const requestPersistence = vi.fn(() => Promise.resolve("denied" as const));
  const facade: ApplicationDiagnostics = {
    inspect,
    requestPersistence,
  };
  return { facade, inspect, requestPersistence };
}

describe("DevelopmentDiagnostics", () => {
  it("shows only technical metadata and table counts", async () => {
    const { facade } = diagnostics();
    render(<DevelopmentDiagnostics diagnostics={facade} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Consultar contagens" }),
    );
    expect(await screen.findByText("biblioteca-viva-test")).toBeInTheDocument();
    expect(screen.getByText("activities")).toBeInTheDocument();
    expect(
      screen.queryByText("título pessoal secreto"),
    ).not.toBeInTheDocument();
  });

  it("does not offer the temporary diagnostic write action", () => {
    const { facade } = diagnostics();
    render(<DevelopmentDiagnostics diagnostics={facade} />);
    expect(
      screen.queryByRole("button", { name: /criar livro de diagnóstico/i }),
    ).not.toBeInTheDocument();
  });

  it("requests persistence without blocking normal diagnostics", async () => {
    const { facade, requestPersistence } = diagnostics();
    render(<DevelopmentDiagnostics diagnostics={facade} />);
    fireEvent.click(
      screen.getByRole("button", {
        name: "Solicitar armazenamento persistente",
      }),
    );
    await waitFor(() => expect(requestPersistence).toHaveBeenCalledOnce());
    expect(screen.getByRole("status")).toHaveTextContent("denied");
  });
});
