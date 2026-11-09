import contentHashes from "./contentHashes.json";
import { sha256Bytes } from "./packCodec";
import type { PackCataloguePort } from "../../application/packCatalogue";
import { PackError } from "../../application/educationalPacks";
import {
  packManifestSchema,
  type PackManifest,
} from "../../domain/packManifest";
import manifest from "./demoManifest.json";
const enem =
  "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos/2024";
const cnu =
  "https://www.gov.br/gestao/pt-br/concursonacional/caderno-de-provas-e-gabaritos";
function reference(exam: "ENEM" | "CPNU", url: string): PackManifest {
  const isEnem = exam === "ENEM";
  return packManifestSchema.parse({
    ...manifest,
    id: isEnem
      ? "enem-2024-d2-c5-matematica-referencia"
      : "cpnu-2024-bloco8-tarde-referencia",
    name: isEnem ? "ENEM 2024 · Matemática" : "CPNU 2024 · Bloco 8",
    description: isEnem
      ? "Aplicação regular, segundo dia, caderno 5 amarelo. Referência aos materiais do Inep; enunciados não redistribuídos."
      : "Nível intermediário, tarde, gabarito 1. Referência às provas e gabaritos finais; enunciados não redistribuídos.",
    category: "reference",
    institution: isEnem ? "Inep" : "MGI / Fundação Cesgranrio",
    exam,
    year: 2024,
    application: isEnem ? "Regular · segundo dia" : "18/08/2024 · tarde",
    booklet: isEnem ? "5 · amarelo" : "Bloco 8 · gabarito 1",
    expectedCount: isEnem ? 45 : 15,
    publishedCount: 0,
    completeness: "reference-only",
    sources: isEnem
      ? [url]
      : [
          url,
          "https://www.gov.br/gestao/pt-br/concursonacional/gabaritos-finais",
        ],
    rights: {
      status: "unverified",
      basis:
        "O portal informa CC BY-ND 3.0 para seu conteúdo. O alcance aos PDFs, materiais de terceiros e adaptação em questões interativas não foi suficientemente comprovado. Distribuição bloqueada até revisão editorial específica.",
      evidence: [url],
      thirdPartyMedia: "none",
    },
    changes: [
      {
        version: 1,
        date: "2026-11-09T04:00:00.000Z",
        note: "Referência bibliográfica; zero enunciados redistribuídos.",
        source: url,
      },
    ],
    editorialVersion: 1,
    lots: [],
  });
}
export class LocalPackCatalogue implements PackCataloguePort {
  list() {
    return Promise.resolve([
      {
        manifest: packManifestSchema.parse(manifest),
        editions: [
          { version: 1, label: "Lote 1 · 2 questões" },
          { version: 2, label: "Lotes 1 + 2 · 4 questões" },
        ],
      },
      { manifest: reference("ENEM", enem), editions: [] },
      { manifest: reference("CPNU", cnu), editions: [] },
    ]);
  }
  async load(id: string, version: number) {
    if (id !== manifest.id || ![1, 2].includes(version))
      throw new PackError("INVALID", "Edição indisponível no catálogo local.");
    const hashes = new Map(
      Object.entries(contentHashes).map(([v, digest]) => [Number(v), digest]),
    );
    const key = (v: number) =>
      new URL(
        `/__biblioteca-pack-cache/${id}/${v}`,
        globalThis.location?.origin ?? "https://localhost",
      ).href;
    // Cache only redistributable bundled files. No private content or sessions enter CacheStorage.
    // Pinned envelope hashes are independent of the self-declared manifest/checksums.
    let cache: Cache | undefined;
    try {
      cache = await globalThis.caches?.open("biblioteca-viva-public-packs-v1");
      const stored = await cache?.match(key(version));
      if (stored) {
        const content = await stored.text();
        if ((await sha256Bytes(content)) === hashes.get(version))
          return content;
        await cache?.delete(key(version));
      }
    } catch {
      /* Optional web cache; packaged Android assets remain available offline. */
    }
    try {
      const editions = (await import("./bundledContent")).editions;
      for (const [v, content] of editions) {
        if ((await sha256Bytes(content)) !== hashes.get(v))
          throw new PackError(
            "INTEGRITY",
            "Arquivo distribuído diverge do hash fixado no aplicativo.",
          );
        try {
          await cache?.put(
            key(v),
            new Response(content, {
              headers: { "Content-Type": "application/json;charset=utf-8" },
            }),
          );
        } catch {
          /* Quota/cache failure never alters private IndexedDB or blocks APK installation. */
        }
      }
      const content = editions.get(version);
      if (!content) throw new Error();
      return content;
    } catch (e) {
      if (e instanceof PackError) throw e;
      throw new PackError(
        "INVALID",
        "Não foi possível abrir o arquivo local. Reconecte o navegador ou use o arquivo JSON; no APK os arquivos são locais.",
      );
    }
  }
}
