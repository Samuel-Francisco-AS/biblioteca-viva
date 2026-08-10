import { useEffect, useRef, useState, type ChangeEvent } from "react";

import {
  AUDIO_PREFERENCE_DEFAULTS,
  ApplicationError,
  BackupError,
  MAX_BACKUP_BYTES,
  type BackupCounts,
  type BackupSummary,
} from "../../application";
import type {
  ApplicationDiagnostics,
  ApplicationDiagnosticsSnapshot,
  ApplicationRuntime,
} from "../../app/createApplication";

interface Props {
  readonly application?: SettingsApplication;
  readonly diagnostics?: ApplicationDiagnostics;
}

export interface SettingsApplication {
  readonly audio?: ApplicationRuntime["audio"];
  readonly appVersion: string;
  readonly platform?: ApplicationRuntime["platform"];
  readonly backup: ApplicationRuntime["backup"];
}

const unsafeContextGuidance =
  "Este ambiente não oferece todas as APIs necessárias para salvar e exportar com segurança. Abra a aplicação por localhost, HTTPS ou pelo APK Android. Os dados de outras origens do navegador não foram apagados.";

const errorMessages: Record<string, string> = {
  BACKUP_TOO_LARGE: "O arquivo excede o limite de 10 MiB.",
  INVALID_JSON: "O arquivo selecionado não contém JSON válido.",
  UNRECOGNIZED_FORMAT:
    "O arquivo não é um backup reconhecido da Biblioteca Viva.",
  FUTURE_FORMAT_VERSION:
    "Este backup foi criado em um formato futuro ainda não suportado.",
  UNSUPPORTED_FORMAT_VERSION: "A versão deste backup não é suportada.",
  INVALID_BACKUP_DATA: "O backup contém dados inválidos ou incompatíveis.",
  DUPLICATE_ID: "O backup contém identificadores duplicados.",
  MISSING_CHECKSUM: "O backup não contém checksum de integridade.",
  CHECKSUM_MISMATCH:
    "O arquivo foi alterado ou corrompido; a integridade não confere.",
  BACKUP_DELIVERY_CANCELLED:
    "A entrega do backup de segurança foi cancelada. Nenhum dado foi alterado.",
  SAFETY_BACKUP_FAILED:
    "Não foi possível entregar o backup de segurança. Nenhum dado foi alterado.",
  RESTORE_FAILED:
    "A restauração falhou. Os dados anteriores foram preservados.",
  BACKUP_TEMPORARY_WRITE_FAILED:
    "Não foi possível preparar o arquivo temporário. Nenhum dado foi alterado.",
  BACKUP_SHARE_FAILED:
    "Não foi possível abrir as opções de compartilhamento. Nenhum dado foi alterado.",
  BACKUP_DOCUMENT_PICKER_FAILED:
    "Não foi possível abrir o seletor de arquivos. Tente novamente.",
  BACKUP_DOCUMENT_WRITE_FAILED:
    "Não foi possível salvar o backup. Tente novamente.",
  PLATFORM_CAPABILITY_UNAVAILABLE: unsafeContextGuidance,
};

function publicError(error: unknown): string {
  if (error instanceof BackupError)
    return (
      errorMessages[error.code] ??
      "A operação de backup não pôde ser concluída."
    );
  if (error instanceof ApplicationError && error.code === "UNSAFE_CONTEXT")
    return unsafeContextGuidance;
  return "Ocorreu um erro inesperado. Tente novamente sem alterar o arquivo.";
}

function Counts({ counts }: { readonly counts: BackupCounts }) {
  return (
    <dl className="backup-counts">
      <div>
        <dt>Livros</dt>
        <dd>{counts.libraryEntries}</dd>
      </div>
      <div>
        <dt>Notas</dt>
        <dd>{counts.notes}</dd>
      </div>
      <div>
        <dt>Citações</dt>
        <dd>{counts.quotes}</dd>
      </div>
      <div>
        <dt>Atividades</dt>
        <dd>{counts.activities}</dd>
      </div>
      <div>
        <dt>Marcos históricos</dt>
        <dd>{counts.milestones}</dd>
      </div>
      <div>
        <dt>Configurações</dt>
        <dd>{counts.settings}</dd>
      </div>
    </dl>
  );
}

export function SettingsPage({ application, diagnostics }: Props) {
  const platformUnavailable = application?.platform?.supported === false;
  const [snapshot, setSnapshot] = useState<ApplicationDiagnosticsSnapshot>();
  const [persistenceStatus, setPersistenceStatus] = useState("");
  const [exportPhase, setExportPhase] = useState<
    "idle" | "preparing-save" | "saving" | "preparing-share" | "sharing"
  >("idle");
  const exporting = exportPhase !== "idle";
  const [exportStatus, setExportStatus] = useState("");
  const [content, setContent] = useState<string>();
  const [summary, setSummary] = useState<BackupSummary>();
  const [importError, setImportError] = useState("");
  const [reading, setReading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [restored, setRestored] = useState<BackupCounts>();
  const [audioPreferences, setAudioPreferences] = useState(
    () => application?.audio?.preferences() ?? AUDIO_PREFERENCE_DEFAULTS,
  );
  const [audioPreferenceError, setAudioPreferenceError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const confirmationRef = useRef<HTMLElement>(null);
  const exportInProgressRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  async function refreshDiagnostics() {
    if (diagnostics) setSnapshot(await diagnostics.inspect());
  }
  useEffect(() => {
    let active = true;
    if (diagnostics) {
      void diagnostics.inspect().then((value) => {
        if (active) setSnapshot(value);
      });
    }
    return () => {
      active = false;
    };
  }, [diagnostics]);

  async function requestPersistence() {
    if (!diagnostics) return;
    const status = await diagnostics.requestPersistence();
    setPersistenceStatus(
      status === "denied"
        ? "A solicitação foi negada. Isso não significa perda imediata nem falha do aplicativo."
        : `Resultado da solicitação: ${status}.`,
    );
    await refreshDiagnostics();
  }

  async function saveBackup() {
    if (!application || exportInProgressRef.current) return;
    exportInProgressRef.current = true;
    setExportPhase("preparing-save");
    setExportStatus("");
    try {
      const artifact = await application.backup.export();
      if (!mountedRef.current) return;
      setExportPhase("saving");
      const result = await application.backup.saveBackupFile(artifact);
      if (!mountedRef.current) return;
      setExportStatus(
        result === "cancelled"
          ? "O salvamento foi cancelado. Seus dados não foram alterados."
          : "Backup salvo no local escolhido.",
      );
    } catch (error) {
      if (mountedRef.current) setExportStatus(publicError(error));
    } finally {
      exportInProgressRef.current = false;
      if (mountedRef.current) setExportPhase("idle");
    }
  }

  async function shareBackup() {
    if (!application || exportInProgressRef.current) return;
    exportInProgressRef.current = true;
    setExportPhase("preparing-share");
    setExportStatus("");
    try {
      const artifact = await application.backup.export();
      if (!mountedRef.current) return;
      setExportPhase("sharing");
      const result = await application.backup.shareBackupFile(artifact);
      if (!mountedRef.current) return;
      setExportStatus(
        result === "cancelled"
          ? "O compartilhamento foi cancelado. Seus dados não foram alterados."
          : application.backup.nativeSaveAvailable
            ? "O menu de compartilhamento foi encerrado. Confirme que o arquivo está disponível no destino escolhido."
            : "A exportação foi encerrada. Confirme que o arquivo está disponível no destino escolhido.",
      );
    } catch (error) {
      if (mountedRef.current) setExportStatus(publicError(error));
    } finally {
      exportInProgressRef.current = false;
      if (mountedRef.current) setExportPhase("idle");
    }
  }

  function clearSelection(focus = true) {
    setContent(undefined);
    setSummary(undefined);
    setImportError("");
    setRestored(undefined);
    if (fileRef.current) fileRef.current.value = "";
    if (focus) fileRef.current?.focus();
  }

  async function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !application) return;
    setReading(true);
    setImportError("");
    setSummary(undefined);
    setRestored(undefined);
    try {
      if (file.size > MAX_BACKUP_BYTES)
        throw new BackupError("BACKUP_TOO_LARGE", "Arquivo grande demais.");
      const selectedContent = await file.text();
      const inspected = await application.backup.inspect(selectedContent);
      setContent(selectedContent);
      setSummary(inspected);
      requestAnimationFrame(() => confirmationRef.current?.focus());
    } catch (error) {
      setContent(undefined);
      setImportError(publicError(error));
      requestAnimationFrame(() => fileRef.current?.focus());
    } finally {
      setReading(false);
    }
  }

  async function restore() {
    if (!application || !content || importing) return;
    setImporting(true);
    setImportError("");
    try {
      const counts = await application.backup.import(content);
      setRestored(counts);
      setSummary(undefined);
      setContent(undefined);
      if (fileRef.current) fileRef.current.value = "";
      await refreshDiagnostics();
    } catch (error) {
      setImportError(publicError(error));
    } finally {
      setImporting(false);
    }
  }

  async function updateMusicVolume(value: number) {
    setAudioPreferences((current) => ({ ...current, musicVolume: value }));
    setAudioPreferenceError("");
    try {
      await application?.audio?.setMusicVolume(value);
    } catch {
      setAudioPreferenceError(
        "O volume foi aplicado nesta sessão, mas não pôde ser persistido.",
      );
    }
  }

  async function updateEffectsVolume(value: number) {
    setAudioPreferences((current) => ({ ...current, effectsVolume: value }));
    setAudioPreferenceError("");
    try {
      await application?.audio?.setEffectsVolume(value);
    } catch {
      setAudioPreferenceError(
        "O volume foi aplicado nesta sessão, mas não pôde ser persistido.",
      );
    }
  }

  async function updateMuted(muted: boolean) {
    setAudioPreferences((current) => ({ ...current, muted }));
    setAudioPreferenceError("");
    try {
      await application?.audio?.setMuted(muted);
    } catch {
      setAudioPreferenceError(
        "A preferência foi aplicada nesta sessão, mas não pôde ser persistida.",
      );
    }
  }

  return (
    <div className="settings-stack">
      <section className="content-card" aria-labelledby="audio-settings-title">
        <p className="eyebrow">Experiência sonora</p>
        <h2 id="audio-settings-title">Áudio</h2>
        <p>
          O som só começa depois de uma interação permitida. Música e efeitos
          pausam quando o aplicativo fica em segundo plano.
        </p>
        <div className="audio-settings-controls">
          <div className="form-field">
            <label htmlFor="music-volume">
              Volume da música: {Math.round(audioPreferences.musicVolume * 100)}
              %
            </label>
            <input
              id="music-volume"
              type="range"
              min="0"
              max="100"
              step="1"
              value={Math.round(audioPreferences.musicVolume * 100)}
              disabled={!application?.audio}
              onChange={(event) =>
                void updateMusicVolume(Number(event.target.value) / 100)
              }
            />
          </div>
          <div className="form-field">
            <label htmlFor="effects-volume">
              Volume dos efeitos:{" "}
              {Math.round(audioPreferences.effectsVolume * 100)}%
            </label>
            <input
              id="effects-volume"
              type="range"
              min="0"
              max="100"
              step="1"
              value={Math.round(audioPreferences.effectsVolume * 100)}
              disabled={!application?.audio}
              onChange={(event) =>
                void updateEffectsVolume(Number(event.target.value) / 100)
              }
            />
          </div>
          <label className="audio-mute-control" htmlFor="audio-muted">
            <input
              id="audio-muted"
              type="checkbox"
              checked={audioPreferences.muted}
              disabled={!application?.audio}
              onChange={(event) => void updateMuted(event.target.checked)}
            />
            Silenciar música e efeitos
          </label>
        </div>
        <p className="field-help">
          A Biblioteca continua totalmente utilizável sem áudio ou caso algum
          som esteja indisponível.
        </p>
        {audioPreferenceError && (
          <p className="field-error" role="alert">
            {audioPreferenceError}
          </p>
        )}
      </section>
      <section className="content-card" aria-labelledby="local-info-title">
        <p className="eyebrow">Dados neste dispositivo</p>
        <h2 id="local-info-title">Informações locais</h2>
        <dl className="backup-counts">
          <div>
            <dt>Versão do aplicativo</dt>
            <dd>{application?.appVersion ?? "Indisponível"}</dd>
          </div>
          <div>
            <dt>Versão do banco</dt>
            <dd>{snapshot?.databaseVersion ?? "Consultando…"}</dd>
          </div>
          <div>
            <dt>Persistência</dt>
            <dd>{snapshot?.persistence ?? "Consultando…"}</dd>
          </div>
        </dl>
        <p>
          O status <code>denied</code> não significa perda imediata nem falha do
          aplicativo. Backups continuam necessários.
        </p>
        {platformUnavailable && (
          <p className="field-error" role="alert">
            {unsafeContextGuidance}
          </p>
        )}
        <button
          className="button button--secondary"
          type="button"
          disabled={!diagnostics}
          onClick={() => void requestPersistence()}
        >
          Solicitar armazenamento persistente
        </button>
        {persistenceStatus && <p role="status">{persistenceStatus}</p>}
      </section>

      <section className="content-card" aria-labelledby="export-title">
        <p className="eyebrow">Cópia recuperável</p>
        <h2 id="export-title">Exportar backup</h2>
        <p>
          O arquivo contém livros, notas e citações em texto JSON legível.
          Guarde-o em um local seguro; ele não é criptografado nem enviado
          automaticamente.
        </p>
        {application?.backup.nativeSaveAvailable ? (
          <div className="backup-export-actions">
            <div>
              <p>
                O Android abrirá o seletor de arquivos para você escolher onde
                guardar o backup.
              </p>
              <button
                className="button"
                type="button"
                disabled={exporting || platformUnavailable}
                onClick={() => void saveBackup()}
              >
                {exportPhase === "preparing-save"
                  ? "Preparando…"
                  : exportPhase === "saving"
                    ? "Abrindo seletor…"
                    : "Salvar backup no dispositivo"}
              </button>
            </div>
            <div>
              <p>
                Use o menu de compartilhamento para enviar o arquivo ao Drive,
                computador ou outro aplicativo.
              </p>
              <button
                className="button button--secondary"
                type="button"
                disabled={exporting || platformUnavailable}
                onClick={() => void shareBackup()}
              >
                {exportPhase === "preparing-share"
                  ? "Preparando…"
                  : exportPhase === "sharing"
                    ? "Abrindo opções…"
                    : "Compartilhar backup"}
              </button>
            </div>
          </div>
        ) : (
          <button
            className="button"
            type="button"
            disabled={!application || exporting || platformUnavailable}
            onClick={() => void shareBackup()}
          >
            {exportPhase === "preparing-share"
              ? "Preparando…"
              : exportPhase === "sharing"
                ? "Abrindo opções…"
                : "Exportar backup"}
          </button>
        )}
        {exportPhase === "sharing" && (
          <p role="status">
            O menu de compartilhamento está sendo aberto. Escolha Drive,
            computador ou outro aplicativo e depois confirme o destino.
          </p>
        )}
        {exportStatus && <p role="status">{exportStatus}</p>}
      </section>

      <section className="content-card" aria-labelledby="import-title">
        <p className="eyebrow">Restauração</p>
        <h2 id="import-title">Importar backup</h2>
        <p>
          Selecione um backup JSON da Biblioteca Viva com até 10 MiB. A seleção
          e a validação não alteram o banco.
        </p>
        <div className="form-field">
          <label htmlFor="backup-file">Arquivo de backup</label>
          <input
            ref={fileRef}
            id="backup-file"
            type="file"
            accept="application/json,.json"
            disabled={!application || reading || importing}
            aria-describedby="backup-file-help backup-file-error"
            onChange={(event) => void selectFile(event)}
          />
          <p className="field-help" id="backup-file-help">
            O tipo e a extensão ajudam na seleção, mas todo o conteúdo será
            validado.
          </p>
          {reading && <p role="status">Lendo e validando…</p>}
          {importError && (
            <p className="field-error" id="backup-file-error" role="alert">
              {importError}
            </p>
          )}
        </div>
        {summary && (
          <section
            className="restore-confirmation"
            aria-labelledby="restore-title"
            ref={confirmationRef}
            tabIndex={-1}
          >
            <h3 id="restore-title">Confirmar substituição de todos os dados</h3>
            <p>
              Backup de {new Date(summary.createdAt).toLocaleString("pt-BR")},
              aplicativo {summary.appVersion}, banco {summary.databaseVersion}.
              Apenas a política <strong>Substituir todos os dados</strong> está
              disponível.
            </p>
            <Counts counts={summary.counts} />
            <p>
              Todos os livros, notas, citações, atividades e configurações
              locais serão substituídos. Se a base atual não estiver vazia, o
              aplicativo exigirá primeiro a entrega de um backup de segurança.
            </p>
            <div className="inline-actions">
              <button
                className="button button--secondary"
                type="button"
                disabled={importing}
                onClick={() => clearSelection()}
              >
                Cancelar
              </button>
              <button
                className="button button--danger"
                type="button"
                disabled={importing}
                onClick={() => void restore()}
              >
                {importing
                  ? "Substituindo…"
                  : "Criar backup de segurança e substituir dados"}
              </button>
            </div>
          </section>
        )}
        {restored && (
          <div className="success-summary" role="status">
            <h3>Restauração concluída</h3>
            <p>
              Os dados restaurados serão consultados novamente ao abrir Coleção
              e Arquivo.
            </p>
            <Counts counts={restored} />
          </div>
        )}
      </section>
    </div>
  );
}
