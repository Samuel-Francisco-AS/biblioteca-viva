import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppErrorBoundary } from "./AppErrorBoundary";

const boundarySource = Object.values(
  import.meta.glob<string>("./AppErrorBoundary.tsx", {
    eager: true,
    query: "?raw",
    import: "default",
  }),
)[0];

let shouldThrow = true;
function Broken() {
  if (shouldThrow) throw new Error("Dexie /private/path conteúdo interno");
  return <p>recuperado</p>;
}

describe("AppErrorBoundary", () => {
  it("oculta detalhes, preserva dados e permite tentar novamente", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    shouldThrow = true;
    render(
      <AppErrorBoundary>
        <Broken />
      </AppErrorBoundary>,
    );
    expect(
      screen.getByRole("heading", { name: "A tela encontrou um problema" }),
    ).toBeVisible();
    expect(
      screen.queryByText(/Dexie|private\/path|conteúdo interno/u),
    ).not.toBeInTheDocument();
    shouldThrow = false;
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(screen.getByText("recuperado")).toBeVisible();
  });

  it("recarrega somente por ação explícita sem expor erro ou limpar dados", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const reloadApplication = vi.fn();
    shouldThrow = true;
    render(
      <AppErrorBoundary reloadApplication={reloadApplication}>
        <Broken />
      </AppErrorBoundary>,
    );
    expect(reloadApplication).not.toHaveBeenCalled();
    expect(boundarySource).not.toMatch(
      /deleteDatabase|\.delete\(|\.clear\(|Dexie|indexedDB/iu,
    );
    expect(
      screen.queryByText(/Dexie|private\/path|conteúdo interno/u),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Recarregar aplicativo" }),
    );
    expect(reloadApplication).toHaveBeenCalledOnce();
  });
});
