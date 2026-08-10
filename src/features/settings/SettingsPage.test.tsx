import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type {
  AudioPort,
  BackupArtifact,
  BackupSummary,
} from "../../application";
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
      nativeSaveAvailable: false,
      export: vi.fn(() => Promise.resolve(artifact)),
      saveBackupFile: vi.fn(() => Promise.resolve("saved" as const)),
      shareBackupFile: vi.fn(() => Promise.resolve("flow-finished" as const)),
      inspect: vi.fn(() => Promise.resolve(summary)),
      import: vi.fn(() => Promise.resolve(counts)),
      ...overrides,
    },
  };
}

function audio(): AudioPort {
  let preferences = {
    effectsVolume: 0.6,
    musicVolume: 0.35,
    muted: false,
  };
  return {
    availability: () => "not-initialized",
    dispose: vi.fn(),
    emit: vi.fn(),
    initialize: vi.fn(() => Promise.resolve("ready" as const)),
    pause: vi.fn(),
    preferences: () => preferences,
    resume: vi.fn(),
    setEffectsVolume: vi.fn((effectsVolume: number) => {
      preferences = { ...preferences, effectsVolume };
      return Promise.resolve();
    }),
    setMusicVolume: vi.fn((musicVolume: number) => {
      preferences = { ...preferences, musicVolume };
      return Promise.resolve();
    }),
    setMuted: vi.fn((muted: boolean) => {
      preferences = { ...preferences, muted };
      return Promise.resolve();
    }),
  };
}

describe("Configurações e backup", () => {
  it("oferece volumes rotulados, teclado nativo e mute com aplicação imediata", async () => {
    const audioPort = audio();
    const app = { ...application(), audio: audioPort };
    const user = userEvent.setup();
    render(<SettingsPage application={app} />);

    const music = screen.getByRole("slider", { name: /Volume da música/u });
    const effects = screen.getByRole("slider", { name: /Volume dos efeitos/u });
    const mute = screen.getByRole("checkbox", {
      name: "Silenciar música e efeitos",
    });
    expect(music).toHaveValue("35");
    expect(effects).toHaveValue("60");

    fireEvent.change(music, { target: { value: "24" } });
    effects.focus();
    expect(effects).toHaveFocus();
    fireEvent.change(effects, { target: { value: "61" } });
    await user.click(mute);

    expect(vi.mocked(audioPort.setMusicVolume)).toHaveBeenCalledWith(0.24);
    expect(vi.mocked(audioPort.setEffectsVolume)).toHaveBeenCalledWith(0.61);
    expect(vi.mocked(audioPort.setMuted)).toHaveBeenCalledWith(true);
    expect(mute).toBeChecked();
  });

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
    await screen.findByText(/exportação foi encerrada/u);
  });

  it("orienta sobre o destino externo enquanto abre o fluxo", async () => {
    const app = application({
      shareBackupFile: vi.fn(
        () => new Promise<"flow-finished">(() => undefined),
      ),
    });
    const user = userEvent.setup();
    render(<SettingsPage application={app} />);
    await user.click(screen.getByRole("button", { name: "Exportar backup" }));
    expect(
      await screen.findByText(/Escolha Drive, computador ou outro aplicativo/u),
    ).toBeVisible();
  });

  it("distingue cancelamento sem afirmar que o arquivo foi salvo", async () => {
    const app = application({
      shareBackupFile: vi.fn(() => Promise.resolve("cancelled" as const)),
    });
    const user = userEvent.setup();
    render(<SettingsPage application={app} />);
    await user.click(screen.getByRole("button", { name: "Exportar backup" }));
    const status = await screen.findByText(/compartilhamento foi cancelado/u);
    expect(status).not.toHaveTextContent(/salvo|entregue/iu);
  });

  it("separa salvar e compartilhar no Android e só confirma após a escrita", async () => {
    let finishSave: (() => void) | undefined;
    const saveBackupFile = vi.fn(
      () =>
        new Promise<"saved">((resolve) => {
          finishSave = () => resolve("saved");
        }),
    );
    const app = application({ nativeSaveAvailable: true, saveBackupFile });
    const user = userEvent.setup();
    render(<SettingsPage application={app} />);

    const saveButton = screen.getByRole("button", {
      name: "Salvar backup no dispositivo",
    });
    const shareButton = screen.getByRole("button", {
      name: "Compartilhar backup",
    });
    await user.click(saveButton);

    expect(
      await screen.findByRole("button", { name: "Abrindo seletor…" }),
    ).toBeDisabled();
    expect(shareButton).toBeDisabled();
    expect(app.backup.shareBackupFile).not.toHaveBeenCalled();
    expect(screen.queryByText("Backup salvo no local escolhido.")).toBeNull();

    finishSave?.();
    expect(
      await screen.findByText("Backup salvo no local escolhido."),
    ).toBeVisible();
    expect(saveBackupFile).toHaveBeenCalledWith(artifact);
  });

  it("trata cancelamento do seletor como estado normal", async () => {
    const app = application({
      nativeSaveAvailable: true,
      saveBackupFile: vi.fn(() => Promise.resolve("cancelled" as const)),
    });
    const user = userEvent.setup();
    render(<SettingsPage application={app} />);
    await user.click(
      screen.getByRole("button", { name: "Salvar backup no dispositivo" }),
    );
    expect(
      await screen.findByText(
        "O salvamento foi cancelado. Seus dados não foram alterados.",
      ),
    ).toBeVisible();
  });

  it("impede concorrência entre salvar e compartilhar", async () => {
    const app = application({
      nativeSaveAvailable: true,
      saveBackupFile: vi.fn(() => new Promise<"saved">(() => undefined)),
    });
    render(<SettingsPage application={app} />);
    const saveButton = screen.getByRole("button", {
      name: "Salvar backup no dispositivo",
    });
    const shareButton = screen.getByRole("button", {
      name: "Compartilhar backup",
    });
    fireEvent.click(saveButton);
    fireEvent.click(saveButton);
    fireEvent.click(shareButton);
    await waitFor(() => expect(app.backup.export).toHaveBeenCalledTimes(1));
    expect(app.backup.saveBackupFile).toHaveBeenCalledTimes(1);
    expect(app.backup.shareBackupFile).not.toHaveBeenCalled();
  });

  it("ignora retorno tardio depois da desmontagem", async () => {
    let finishSave: (() => void) | undefined;
    const app = application({
      nativeSaveAvailable: true,
      saveBackupFile: vi.fn(
        () =>
          new Promise<"saved">((resolve) => {
            finishSave = () => resolve("saved");
          }),
      ),
    });
    const view = render(<SettingsPage application={app} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Salvar backup no dispositivo" }),
    );
    await waitFor(() => expect(app.backup.saveBackupFile).toHaveBeenCalled());
    view.unmount();
    await act(async () => {
      finishSave?.();
      await Promise.resolve();
    });
    expect(app.backup.saveBackupFile).toHaveBeenCalledTimes(1);
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
