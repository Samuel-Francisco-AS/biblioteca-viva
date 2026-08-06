import { describe, expect, it } from "vitest";

const applicationSources = import.meta.glob<string>(
  "../../application/**/*.ts",
  {
    eager: true,
    import: "default",
    query: "?raw",
  },
);
const presentationSources = import.meta.glob<string>(
  "../../features/**/*.{ts,tsx}",
  {
    eager: true,
    import: "default",
    query: "?raw",
  },
);
const infrastructureSources = import.meta.glob<string>("../**/*.ts", {
  eager: true,
  import: "default",
  query: "?raw",
});

describe("fronteiras de arquivos nativos e exclusão", () => {
  it("restringe plugins Capacitor à infraestrutura", () => {
    [
      ...Object.entries(applicationSources),
      ...Object.entries(presentationSources),
    ].forEach(([path, source]) => {
      expect(source, path).not.toMatch(
        /@capacitor\/(?:filesystem|share|core)|ContentResolver|ACTION_CREATE_DOCUMENT/u,
      );
    });
  });

  it("mantém o fallback web independente de Capacitor", () => {
    expect(infrastructureSources["./browserFileDelivery.ts"]).not.toMatch(
      /@capacitor/u,
    );
  });

  it("mantém salvamento e compartilhamento nativos separados", () => {
    expect(infrastructureSources["./androidBackupFileSave.ts"]).not.toMatch(
      /@capacitor\/share|Directory\.Cache|AndroidFileDelivery/u,
    );
    expect(infrastructureSources["./androidFileDelivery.ts"]).not.toMatch(
      /BackupDocument|ACTION_CREATE_DOCUMENT|saveBackupDocument/u,
    );
  });

  it("mantém plugins nativos fora do codec", () => {
    expect(infrastructureSources["../backup/backupCodec.ts"]).not.toMatch(
      /@capacitor|FileDelivery/u,
    );
  });

  it("mantém exclusão fora da cena Phaser", () => {
    Object.entries(presentationSources)
      .filter(([path]) => path.includes("/phaser/"))
      .forEach(([path, source]) => {
        expect(source, path).not.toMatch(
          /DeleteBook|deleteBook|excluir|saveBackup|ContentResolver|useCases/iu,
        );
      });
  });

  it("não registra URI nem conteúdo do backup", () => {
    Object.entries(infrastructureSources)
      .filter(([path]) => path.includes("/files/"))
      .forEach(([path, source]) => {
        expect(source, path).not.toMatch(/console\.(?:log|info|debug)\s*\(/u);
        expect(source, path).not.toMatch(
          /console\.warn\s*\([^)]*(?:uri|content)/isu,
        );
      });
  });
});
