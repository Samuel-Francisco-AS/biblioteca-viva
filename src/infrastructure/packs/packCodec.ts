import { z } from "zod";
import {
  PackError,
  type PackCodec,
  type ValidatedPack,
} from "../../application/educationalPacks";
import { packManifestSchema } from "../../domain/packManifest";
import {
  packLotSchema,
  educationalCardId,
  type PackQuestion,
} from "../../domain/educationalPacks";
import {
  emptyArcanarium,
  validateArcanarium,
  cardSchema,
  type Card,
  type CardVersion,
} from "../../domain/arcanarium";
export const MAX_PACK_BYTES = 10 * 1024 * 1024;
const envelope = z.strictObject({
  kind: z.literal("biblioteca-viva-educational-pack"),
  formatVersion: z.literal(1),
  manifest: packManifestSchema,
  files: z.record(z.string(), z.string().max(4 * 1024 * 1024)),
});
/** JSON object keys sorted by UTF-16 code units, array order retained; used only for question fingerprints. */
export function packCanonical(value: unknown): string {
  if (value === null || typeof value !== "object") {
    const s = JSON.stringify(value);
    if (s === undefined)
      throw new PackError("INVALID", "Dado não serializável.");
    return s;
  }
  if (Array.isArray(value)) return `[${value.map(packCanonical).join(",")}]`;
  return `{${Object.entries(value)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${JSON.stringify(k)}:${packCanonical(v)}`)
    .join(",")}}`;
}
export async function sha256Bytes(text: string) {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
export class JsonEducationalPackCodec implements PackCodec {
  questionDigest(q: Pick<PackQuestion, "content">) {
    return sha256Bytes(packCanonical(q.content));
  }
  async inspect(content: string): Promise<ValidatedPack> {
    if (new TextEncoder().encode(content).byteLength > MAX_PACK_BYTES)
      throw new PackError("TOO_LARGE", "O pacote excede 10 MiB.");
    let raw: unknown;
    try {
      raw = JSON.parse(content);
    } catch {
      throw new PackError(
        "INVALID",
        "Arquivo de pacote não contém JSON válido.",
      );
    }
    if (
      raw &&
      typeof raw === "object" &&
      "formatVersion" in raw &&
      (raw.formatVersion !== 1 ||
        ("manifest" in raw &&
          raw.manifest &&
          typeof raw.manifest === "object" &&
          "formatVersion" in raw.manifest &&
          raw.manifest.formatVersion !== 1))
    )
      throw new PackError("INCOMPATIBLE", "Versão de pacote incompatível.");
    const parsed = envelope.safeParse(raw);
    if (!parsed.success)
      throw new PackError(
        "INVALID",
        "Manifesto, limites ou direitos inválidos.",
      );
    const { manifest, files } = parsed.data;
    if (
      manifest.category === "reference" ||
      manifest.rights.status === "unverified"
    )
      throw new PackError(
        "RIGHTS",
        "Referência sem autorização de redistribuição; nenhum conteúdo foi instalado.",
      );
    if (
      !Object.keys(files).length ||
      Object.keys(files).some(
        (path) => !manifest.lots.some((l) => l.path === path),
      )
    )
      throw new PackError("INVALID", "Arquivos ausentes ou não declarados.");
    const lots: ValidatedPack["lots"] = [],
      identities = new Map<string, string>(),
      tags = new Map<string, import("../../domain/arcanarium").KnowledgeTag>();
    for (const m of manifest.lots) {
      const bytes = files[m.path];
      if (bytes === undefined) continue; // increment may include only new/changed lots
      if (
        new TextEncoder().encode(bytes).byteLength !== m.bytes ||
        (await sha256Bytes(bytes)) !== m.sha256
      )
        throw new PackError(
          "INTEGRITY",
          "Integridade dos bytes do lote divergente.",
        );
      let lot;
      try {
        lot = packLotSchema.parse(JSON.parse(bytes));
      } catch {
        throw new PackError("INVALID", "Conteúdo de lote inválido.");
      }
      if (lot.packId !== manifest.id || lot.lotId !== m.id)
        throw new PackError("INVALID", "Referência de lote inválida.");
      if (new Set(lot.tags.map((t) => t.id)).size !== lot.tags.length)
        throw new PackError("INVALID", "Classificação duplicada no lote.");
      const revisions = new Map<string, number>();
      for (const q of lot.questions) {
        const id = educationalCardId(q.identity),
          i = q.identity;
        if (
          i.exam !== manifest.exam ||
          i.year !== manifest.year ||
          i.application !== manifest.application ||
          i.booklet !== manifest.booklet ||
          i.language !== manifest.language ||
          q.content.type !== "question" ||
          q.content.source?.exam !== manifest.exam ||
          q.content.source.year !== manifest.year ||
          q.content.source.booklet !== manifest.booklet ||
          !q.content.editorial ||
          q.content.editorial.canonicalId !== q.identity.canonicalId ||
          JSON.stringify(q.content.editorial.equivalentTo) !==
            JSON.stringify(q.identity.equivalentTo) ||
          q.content.editorial.sourceUrl !== q.source ||
          q.content.editorial.correctionSource !== q.correctionSource ||
          q.content.classification.personalTagIds.length ||
          (q.content.explanation &&
            q.content.editorial.commentary !== "Arcanário")
        )
          throw new PackError(
            "INVALID",
            "Identidade, proveniência ou comentário editorial incompatível.",
          );
        if (
          (identities.has(id) && identities.get(id) !== m.id) ||
          q.revision !== (revisions.get(id) ?? 0) + 1 ||
          (q.revision > 1 && !q.correctionSource)
        )
          throw new PackError(
            "INVALID",
            "Identidade duplicada ou sequência de revisões inválida.",
          );
        identities.set(id, m.id);
        revisions.set(id, q.revision);
      }
      if (revisions.size !== m.count)
        throw new PackError("INVALID", "Contagem do lote incorreta.");
      for (const t of lot.tags) {
        if (
          t.namespace !== "editorial" ||
          !t.id.startsWith(`pack:${manifest.id}:`) ||
          (tags.has(t.id) && packCanonical(tags.get(t.id)) !== packCanonical(t))
        )
          throw new PackError(
            "INVALID",
            "Classificação conflitante ou fora do namespace.",
          );
        tags.set(t.id, t);
      }
      lots.push({
        lot,
        sha256: m.sha256,
        bytes: m.bytes,
        digests: await Promise.all(
          lot.questions.map((q) => this.questionDigest(q)),
        ),
      });
    }
    // Each supplied lot is self-contained in taxonomy; no arbitrary user references.
    for (const { lot } of lots)
      for (const q of lot.questions)
        if (
          q.content.type === "question" &&
          q.content.classification.knowledgeTagIds.some((id) => !tags.has(id))
        )
          throw new PackError("INVALID", "Classificação ausente.");
    try {
      const cards = new Map<string, Card>(),
        versions: CardVersion[] = [];
      for (const { lot } of lots)
        for (const q of lot.questions) {
          const id = educationalCardId(q.identity),
            previous = cards.get(id);
          const card = cardSchema.parse({
            id,
            revision: q.revision,
            type: "question",
            origin: {
              kind: manifest.category === "official" ? "official" : "imported",
              packId: manifest.id,
              itemId: id,
              version: "format-1",
            },
            createdAt: previous?.createdAt ?? q.publishedAt,
            updatedAt: q.publishedAt,
            archived: false,
            content: q.content,
          });
          cards.set(id, card);
          versions.push({ cardId: id, revision: q.revision, card });
        }
      validateArcanarium(
        {
          ...emptyArcanarium(),
          cards: [...cards.values()],
          versions,
          tags: [...tags.values()],
        },
        new Set(),
      );
    } catch {
      throw new PackError(
        "INVALID",
        "Grafo de questões, revisões ou classificações inválido.",
      );
    }
    return { manifest, lots };
  }
}
