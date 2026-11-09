import { z } from "zod";
const label = z.string().trim().min(1).max(1000);
export const packIdSchema = z.string().regex(/^[a-z0-9][a-z0-9._-]{0,119}$/u);
export const digestSchema = z.string().regex(/^[a-f0-9]{64}$/u);
export const sourceUrlSchema = z
  .url()
  .max(2000)
  .refine((s) => /^https:\/\/[^/@\s]+(?:[/?#]|$)/u.test(s));
export const packManifestSchema = z
  .strictObject({
    id: packIdSchema,
    formatVersion: z.literal(1),
    editorialVersion: z.int().positive(),
    name: label.max(160),
    description: label,
    category: z.enum(["official", "author-demo", "reference"]),
    institution: label.max(160),
    exam: label.max(160),
    year: z.int().min(1900).max(9999),
    application: label.max(160),
    booklet: label.max(160),
    language: label.max(80),
    areas: z.array(label.max(160)).min(1).max(20),
    expectedCount: z.int().min(1).max(10000),
    publishedCount: z.int().min(0).max(10000),
    completeness: z.enum(["partial", "complete", "reference-only"]),
    sources: z.array(sourceUrlSchema).min(1).max(20),
    rights: z.strictObject({
      status: z.enum(["permitted", "unverified", "original"]),
      basis: label.max(4000),
      evidence: z.array(sourceUrlSchema).min(1).max(10),
      thirdPartyMedia: z.literal("none"),
    }),
    verifiedAt: z.iso.datetime(),
    changes: z
      .array(
        z.strictObject({
          version: z.int().positive(),
          date: z.iso.datetime(),
          note: label,
          source: sourceUrlSchema,
        }),
      )
      .min(1)
      .max(100),
    lots: z
      .array(
        z.strictObject({
          id: packIdSchema,
          path: z.string().regex(/^[a-z0-9][a-z0-9._-]{0,119}\.json$/u),
          sha256: digestSchema,
          bytes: z
            .int()
            .min(2)
            .max(4 * 1024 * 1024),
          count: z.int().min(1).max(2000),
        }),
      )
      .max(100),
  })
  .superRefine((m, c) => {
    if (
      m.publishedCount > m.expectedCount ||
      m.lots.reduce((n, l) => n + l.count, 0) !== m.publishedCount ||
      new Set(m.lots.map((l) => l.id)).size !== m.lots.length ||
      new Set(m.lots.map((l) => l.path)).size !== m.lots.length ||
      (m.completeness === "complete" && m.publishedCount !== m.expectedCount) ||
      (m.category === "reference") !== (m.completeness === "reference-only") ||
      (m.category === "reference" &&
        (m.publishedCount !== 0 || m.rights.status !== "unverified")) ||
      (m.category === "official" && m.rights.status !== "permitted") ||
      (m.category === "author-demo" && m.rights.status !== "original")
    )
      c.addIssue({
        code: "custom",
        message: "Contagens, completude ou direitos incompatíveis.",
      });
  });
export type PackManifest = z.infer<typeof packManifestSchema>;
export const packReceiptSchema = z
  .strictObject({
    id: packIdSchema,
    manifest: packManifestSchema,
    status: z.enum(["installed", "removed", "restore-required"]),
    assurance: z.enum(["bundled", "self-declared"]),
    installedLots: z
      .array(
        z.strictObject({
          id: packIdSchema,
          sha256: digestSchema,
          count: z.int().positive(),
          bytes: z.int().positive(),
        }),
      )
      .max(100),
    items: z
      .array(
        z.strictObject({
          cardId: z.string().min(1).max(1000),
          revision: z.int().positive(),
          digest: digestSchema,
          lotId: packIdSchema,
        }),
      )
      .max(10000),
    updatedAt: z.iso.datetime(),
  })
  .superRefine((r, c) => {
    if (
      r.id !== r.manifest.id ||
      new Set(r.items.map((i) => i.cardId)).size !== r.items.length ||
      new Set(r.installedLots.map((l) => l.id)).size !==
        r.installedLots.length ||
      r.installedLots.some(
        (l) =>
          !r.manifest.lots.some(
            (m) =>
              m.id === l.id &&
              m.sha256 === l.sha256 &&
              m.count === l.count &&
              m.bytes === l.bytes,
          ),
      ) ||
      r.items.some((i) => !r.installedLots.some((l) => l.id === i.lotId)) ||
      r.installedLots.some(
        (l) => r.items.filter((i) => i.lotId === l.id).length !== l.count,
      )
    )
      c.addIssue({
        code: "custom",
        message: "Registro de instalação inválido.",
      });
  });
export type PackReceipt = z.infer<typeof packReceiptSchema>;
