// @vitest-environment node

import { describe, expect, it } from "vitest";

import manifest from "../../../android/app/src/main/AndroidManifest.xml?raw";
import plugin from "../../../android/app/src/main/java/com/samuelfrancisco/bibliotecaviva/BackupDocumentPlugin.java?raw";
import activity from "../../../android/app/src/main/java/com/samuelfrancisco/bibliotecaviva/MainActivity.java?raw";

describe("contrato do seletor Android local", () => {
  it("registra explicitamente o plugin local antes de criar a bridge", () => {
    expect(activity).toMatch(/registerPlugin\(BackupDocumentPlugin\.class\)/u);
    expect(activity.indexOf("registerPlugin")).toBeLessThan(
      activity.indexOf("super.onCreate"),
    );
  });

  it("usa ACTION_CREATE_DOCUMENT, CATEGORY_OPENABLE, MIME e nome sugerido", () => {
    expect(plugin).toContain("Intent.ACTION_CREATE_DOCUMENT");
    expect(plugin).toContain("Intent.CATEGORY_OPENABLE");
    expect(plugin).toContain('"application/json"');
    expect(plugin).toContain("Intent.EXTRA_TITLE");
    expect(plugin).not.toContain("ACTION_OPEN_DOCUMENT_TREE");
  });

  it("distingue cancelamento e exige URI no resultado aprovado", () => {
    expect(plugin).toContain('response.put("status", "cancelled")');
    expect(plugin).toContain("resultData.getData()");
    expect(plugin).toContain("destination == null");
    expect(plugin).toContain('response.put("status", "saved")');
    expect(plugin).toMatch(
      /result\.getResultCode\(\) != Activity\.RESULT_OK[\s\S]*?call\.resolve\(response\);[\s\S]*?return;[\s\S]*?openOutputStream/u,
    );
  });

  it("escreve UTF-8, faz flush e fecha o stream com recurso seguro", () => {
    expect(plugin).toContain("StandardCharsets.UTF_8");
    expect(plugin).toContain("writer.write(contentUtf8)");
    expect(plugin).toContain("writer.flush()");
    expect(plugin).toMatch(/try\s*\(\s*OutputStream stream/su);
    expect(plugin).not.toMatch(/ByteOrderMark|\\uFEFF/u);
  });

  it("não adiciona permissão ampla de armazenamento", () => {
    expect(manifest).not.toMatch(
      /MANAGE_EXTERNAL_STORAGE|READ_EXTERNAL_STORAGE|WRITE_EXTERNAL_STORAGE|requestLegacyExternalStorage/u,
    );
  });
});
