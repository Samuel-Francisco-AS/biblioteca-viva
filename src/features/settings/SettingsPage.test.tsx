import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { BackupArtifact, BackupSummary } from "../../application";
import { SettingsPage, type SettingsApplication } from "./SettingsPage";

const counts = {
  libraryEntries: 2,
  notes: 1,
  quotes: 1,
  activities: 4,
  settings: 0,
};
const summary: BackupSummary = {
  createdAt: "2026-07-30T12:00:00.000Z",
  appVersion: "0.2.0-alpha.1",
  databaseVersion: 2,
  formatVersion: 1,
  policy: "replace",
  counts,
  warnings: [],
};
const artifact: BackupArtifact = {
  fileName: "biblioteca-viva-backup-2026.json",
  content: "{}",
  summary,
};

function application(
  overrides: Partial<SettingsApplication["backup"]> = {},
): SettingsApplication {
  return {
    appVersion: "0.2.0-alpha.1",
    backup: {
      export: vi.fn(() => Promise.resolve(artifact)),
      deliver: vi.fn(() => Promise.resolve("delivered" as const)),
      inspect: vi.fn(() => Promise.resolve(summary)),
      import: vi.fn(() => Promise.resolve(counts)),
      ...overrides,
    },
  };
}

describe("Configurações e backup", () => {
  it("orienta e desabilita exportação quando a origem não oferece capacidades seguras", () => {
    const app: SettingsApplication = {
      ...application(),
      platform: {
        secureContext: false,
        secureUuid: false,
        backupIntegrity: false,
        supported: false,
      },
    };
    render(<SettingsPage application={app} />);

    expect(
      screen.getByText(
        /dados de outras origens do navegador não foram apagados/i,
      ),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Exportar backup" }),
    ).toBeDisabled();
  });

  it("mostra informações, privacidade, exporta uma vez e bloqueia clique duplicado", async () => {
    let resolveExport: (value: BackupArtifact) => void = () => undefined;
    const exportPromise = new Promise<BackupArtifact>((resolve) => {
      resolveExport = resolve;
    });
    const app = application({ export: vi.fn(() => exportPromise) });
    render(<SettingsPage application={app} />);
    expect(screen.getByText("0.2.0-alpha.1")).toBeVisible();
    expect(screen.getByText(/texto JSON legível/u)).toBeVisible();
    expect(
      screen.queryByText(
        /dados de outras origens do navegador não foram apagados/i,
      ),
    ).not.toBeInTheDocument();
    const button = screen.getByRole("button", { name: "Exportar backup" });
    fireEvent.click(button);
    fireEvent.click(button);
    const exportMock = vi.mocked(app.backup.export);
    expect(exportMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Preparando…" })).toBeDisabled();
    resolveExport(artifact);
    await screen.findByText(/Backup preparado/u);
  });

  it("valida sem escrever, mostra resumo, move foco e permite cancelar", async () => {
    const app = application();
    const user = userEvent.setup();
    render(<SettingsPage application={app} />);
    const input = screen.getByLabelText("Arquivo de backup");
    const file = new File(["{}"], "backup.json", { type: "application/json" });
    Object.defineProperty(file, "text", { value: () => Promise.resolve("{}") });
    await user.upload(input, file);
    const heading = await screen.findByRole("heading", {
      name: "Confirmar substituição de todos os dados",
    });
    await waitFor(() => expect(heading.parentElement).toHaveFocus());
    const importMock = vi.mocked(app.backup.import);
    expect(importMock).not.toHaveBeenCalled();
    expect(screen.getByText("2", { selector: "dd" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(input).toHaveFocus();
    expect(importMock).not.toHaveBeenCalled();
  });

  it("restaura somente após confirmação e anuncia contagens", async () => {
    const app = application();
    const user = userEvent.setup();
    render(<SettingsPage application={app} />);
    const file = new File(["{}"], "backup.json", { type: "application/json" });
    Object.defineProperty(file, "text", { value: () => Promise.resolve("{}") });
    await user.upload(screen.getByLabelText("Arquivo de backup"), file);
    await user.click(
      await screen.findByRole("button", {
        name: "Criar backup de segurança e substituir dados",
      }),
    );
    const importMock = vi.mocked(app.backup.import);
    expect(importMock).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByRole("heading", { name: "Restauração concluída" }),
    ).toBeVisible();
  });
});
