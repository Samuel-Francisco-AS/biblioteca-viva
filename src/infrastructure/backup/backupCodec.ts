import {
  BACKUP_FORMAT_VERSION,
  BACKUP_KIND,
  MAX_BACKUP_BYTES,
  BackupError,
  type BackupArtifact,
  type BackupCodecPort,
  type BackupCounts,
  type BackupData,
  type ValidatedBackup,
} from "../../application";
import { z } from "zod";
import {
  persistedActivitySchema,
  persistedLibraryEntrySchema,
  persistedMilestoneSchema,
  persistedNoteSchema,
  persistedQuoteSchema,
  persistedSettingSchema,
  persistedSessionSchema,
  persistedTagSchema,
} from "../database/schema";

const digestSchema = z.string().regex(/^[a-f0-9]{64}$/u);
const backupSettingSchema = persistedSettingSchema.extend({ value: z.json() });
const isoUtc = z.iso.datetime({ offset: false });
const legacyBookSchema = z.strictObject({
  id: z.string().trim().min(1),
  type: z.literal("book"),
  title: z.string().trim().min(1),
  author: z.string().trim().min(1).optional(),
  status: z.enum([
    "planned",
    "in_progress",
    "paused",
    "completed",
    "abandoned",
  ]),
  totalPages: z.int().positive().optional(),
  currentPage: z.int().nonnegative(),
  rating: z.int().min(1).max(5).optional(),
  startedAt: isoUtc.optional(),
  completedAt: isoUtc.optional(),
  createdAt: isoUtc,
  updatedAt: isoUtc,
  revision: z.int().positive(),
});
const legacyNoteSchema = z.strictObject({
  id: z.string().trim().min(1),
  entryId: z.string().trim().min(1),
  content: z.string().trim().min(1),
  createdAt: isoUtc,
  updatedAt: isoUtc,
  revision: z.int().positive(),
});
const legacyQuoteSchema = legacyNoteSchema.extend({
  page: z.int().positive().optional(),
});
const legacyDataSchema = z.strictObject({
  libraryEntries: z.array(legacyBookSchema),
  notes: z.array(legacyNoteSchema),
  quotes: z.array(legacyQuoteSchema),
  activities: z.array(persistedActivitySchema),
  settings: z.array(backupSettingSchema),
});
const v2DataSchema = z.strictObject({
  libraryEntries: z.array(
    z.union([persistedLibraryEntrySchema, legacyBookSchema]),
  ),
  notes: z.array(z.union([persistedNoteSchema, legacyNoteSchema])),
  quotes: z.array(z.union([persistedQuoteSchema, legacyQuoteSchema])),
  activities: z.array(persistedActivitySchema),
  settings: z.array(backupSettingSchema),
  milestones: z.array(persistedMilestoneSchema),
});
const dataSchema = v2DataSchema.extend({
  tags: z.array(persistedTagSchema),
  sessions: z.array(persistedSessionSchema),
});
const envelopeMetadataSchema = z.strictObject({ policy: z.literal("replace") });
const legacyUnsignedSchema = z.strictObject({
  kind: z.literal(BACKUP_KIND),
  formatVersion: z.literal(1),
  createdAt: z.iso.datetime({ offset: false }),
  appVersion: z.string().trim().min(1),
  databaseVersion: z.int().positive(),
  data: legacyDataSchema,
  metadata: envelopeMetadataSchema,
});
const v2UnsignedSchema = z.strictObject({
  kind: z.literal(BACKUP_KIND),
  formatVersion: z.literal(2),
  createdAt: z.iso.datetime({ offset: false }),
  appVersion: z.string().trim().min(1),
  databaseVersion: z.int().positive(),
  data: v2DataSchema,
  metadata: envelopeMetadataSchema,
});
const unsignedSchema = z.strictObject({
  kind: z.literal(BACKUP_KIND),
  formatVersion: z.literal(BACKUP_FORMAT_VERSION),
  createdAt: z.iso.datetime({ offset: false }),
  appVersion: z.string().trim().min(1),
  databaseVersion: z.int().positive(),
  data: dataSchema,
  metadata: envelopeMetadataSchema,
});
const integritySchema = z.strictObject({
  algorithm: z.literal("SHA-256"),
  digest: digestSchema,
});
const envelopeSchema = z.discriminatedUnion("formatVersion", [
  legacyUnsignedSchema.extend({ integrity: integritySchema }),
  v2UnsignedSchema.extend({ integrity: integritySchema }),
  unsignedSchema.extend({ integrity: integritySchema }),
]);

type JsonValue =
  | null
  | boolean
  | number
  | string
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

function isJsonValue(value: unknown): value is JsonValue {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string"
  ) {
    return true;
  }
  if (Array.isArray(value)) return value.every(isJsonValue);
  if (typeof value !== "object") return false;
  return Object.values(value).every(isJsonValue);
}

function checksumMaterial(value: unknown): JsonValue {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) {
    throw new BackupError(
      "INVALID_BACKUP_DATA",
      "O backup contém dados inválidos ou incompatíveis.",
    );
  }
  const parsed: unknown = JSON.parse(serialized);
  if (!isJsonValue(parsed)) {
    throw new BackupError(
      "INVALID_BACKUP_DATA",
      "O backup contém dados inválidos ou incompatíveis.",
    );
  }
  return parsed;
}

function canonicalize(value: JsonValue): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  return `{${Object.entries(value)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, child]) => `${JSON.stringify(key)}:${canonicalize(child)}`)
    .join(",")}}`;
}

async function sha256(value: JsonValue): Promise<string> {
  const bytes = new TextEncoder().encode(canonicalize(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function counts(data: BackupData): BackupCounts {
  return Object.freeze({
    libraryEntries: data.libraryEntries.length,
    milestones: data.milestones.length,
    notes: data.notes.length,
    quotes: data.quotes.length,
    activities: data.activities.length,
    settings: data.settings.length,
    sessions: data.sessions.length,
    tags: data.tags.length,
  });
}

function sortData(data: BackupData): BackupData {
  const byId = <T extends { readonly id: string }>(values: readonly T[]) =>
    [...values].sort((a, b) => a.id.localeCompare(b.id));
  return Object.freeze({
    libraryEntries: Object.freeze(byId(data.libraryEntries)),
    milestones: Object.freeze(byId(data.milestones)),
    notes: Object.freeze(byId(data.notes)),
    quotes: Object.freeze(byId(data.quotes)),
    activities: Object.freeze(byId(data.activities)),
    settings: Object.freeze(
      [...data.settings].sort((a, b) => a.key.localeCompare(b.key)),
    ),
    sessions: Object.freeze(byId(data.sessions)),
    tags: Object.freeze(byId(data.tags)),
  });
}

function rejectDuplicates(data: {
  readonly libraryEntries: readonly { readonly id: string }[];
  readonly milestones: readonly { readonly id: string }[];
  readonly notes: readonly { readonly id: string }[];
  readonly quotes: readonly { readonly id: string }[];
  readonly activities: readonly { readonly id: string }[];
  readonly settings: readonly { readonly key: string }[];
  readonly sessions?: readonly { readonly id: string }[];
  readonly tags?: readonly { readonly id: string }[];
}): void {
  const collections: readonly [string, readonly string[]][] = [
    ["libraryEntries", data.libraryEntries.map((item) => item.id)],
    ["milestones", data.milestones.map((item) => item.id)],
    ["notes", data.notes.map((item) => item.id)],
    ["quotes", data.quotes.map((item) => item.id)],
    ["activities", data.activities.map((item) => item.id)],
    ["settings", data.settings.map((item) => item.key)],
    ["sessions", (data.sessions ?? []).map((item) => item.id)],
    ["tags", (data.tags ?? []).map((item) => item.id)],
  ];
  for (const [, ids] of collections) {
    if (new Set(ids).size !== ids.length) {
      throw new BackupError(
        "DUPLICATE_ID",
        "O backup contém identificadores duplicados.",
      );
    }
  }
}

type ParsedV1Data = z.infer<typeof legacyDataSchema>;
type ParsedV2Data = z.infer<typeof v2DataSchema>;
type ParsedV3Data = z.infer<typeof dataSchema>;

function normalizeData(
  data: ParsedV1Data | ParsedV2Data | ParsedV3Data,
  milestones: z.infer<typeof persistedMilestoneSchema>[],
  restoredAt: string,
): BackupData {
  return Object.freeze({
    libraryEntries: Object.freeze(
      data.libraryEntries.map((entry) =>
        "favorite" in entry
          ? entry
          : { ...entry, favorite: false, tagIds: Object.freeze([]) },
      ),
    ),
    notes: Object.freeze(
      data.notes.map((note) =>
        "favorite" in note
          ? note
          : { ...note, favorite: false, tagIds: Object.freeze([]) },
      ),
    ),
    quotes: Object.freeze(
      data.quotes.map((quote) => {
        if ("favorite" in quote) return quote;
        const { page, ...annotation } = quote;
        return {
          ...annotation,
          favorite: false,
          tagIds: Object.freeze([]),
          ...(page !== undefined && {
            location: { type: "book" as const, page },
          }),
        };
      }),
    ),
    activities: Object.freeze([...data.activities]),
    settings: Object.freeze([...data.settings]),
    milestones: Object.freeze([...milestones]),
    tags: Object.freeze("tags" in data ? [...data.tags] : []),
    sessions: Object.freeze(
      "sessions" in data
        ? data.sessions.map((session) =>
            session.status === "active"
              ? {
                  ...session,
                  status: "paused" as const,
                  accumulatedDuration:
                    session.accumulatedDuration +
                    Math.max(
                      0,
                      Math.floor(
                        (Date.parse(restoredAt) -
                          Date.parse(session.activeSince ?? restoredAt)) /
                          1000,
                      ),
                    ),
                  activeSince: undefined,
                }
              : session,
          )
        : [],
    ),
  });
}

function byteLength(content: string): number {
  return new TextEncoder().encode(content).byteLength;
}

export class JsonBackupCodec implements BackupCodecPort {
  async encode(input: {
    readonly appVersion: string;
    readonly createdAt: string;
    readonly databaseVersion: number;
    readonly data: BackupData;
  }): Promise<BackupArtifact> {
    const data = sortData(input.data);
    dataSchema.parse(data);
    rejectDuplicates(data);
    const unsigned = unsignedSchema.parse({
      kind: BACKUP_KIND,
      formatVersion: BACKUP_FORMAT_VERSION,
      createdAt: input.createdAt,
      appVersion: input.appVersion,
      databaseVersion: input.databaseVersion,
      data,
      metadata: { policy: "replace" },
    });
    const finalUnsigned = unsignedSchema.parse(checksumMaterial(unsigned));
    const digest = await sha256(checksumMaterial(finalUnsigned));
    const envelope = {
      ...finalUnsigned,
      integrity: { algorithm: "SHA-256" as const, digest },
    };
    return Object.freeze({
      fileName: "",
      content: `${JSON.stringify(envelope, null, 2)}\n`,
      summary: Object.freeze({
        createdAt: finalUnsigned.createdAt,
        appVersion: finalUnsigned.appVersion,
        databaseVersion: finalUnsigned.databaseVersion,
        formatVersion: BACKUP_FORMAT_VERSION,
        policy: "replace",
        counts: counts(data),
        warnings: Object.freeze([]),
      }),
    });
  }

  async inspect(content: string): Promise<ValidatedBackup> {
    if (byteLength(content) > MAX_BACKUP_BYTES)
      throw new BackupError(
        "BACKUP_TOO_LARGE",
        "O arquivo excede o limite de 10 MiB.",
      );
    let raw: unknown;
    try {
      raw = JSON.parse(content);
    } catch {
      throw new BackupError(
        "INVALID_JSON",
        "O arquivo não contém JSON válido.",
      );
    }
    if (typeof raw !== "object" || raw === null || Array.isArray(raw))
      throw new BackupError(
        "UNRECOGNIZED_FORMAT",
        "O arquivo não é um backup reconhecido da Biblioteca Viva.",
      );
    const root = raw as Record<string, unknown>;
    if (root.kind !== BACKUP_KIND)
      throw new BackupError(
        "UNRECOGNIZED_FORMAT",
        "O arquivo não é um backup reconhecido da Biblioteca Viva.",
      );
    if (
      typeof root.formatVersion !== "number" ||
      !Number.isInteger(root.formatVersion)
    )
      throw new BackupError(
        "UNSUPPORTED_FORMAT_VERSION",
        "A versão do formato de backup não é suportada.",
      );
    if (root.formatVersion > BACKUP_FORMAT_VERSION)
      throw new BackupError(
        "FUTURE_FORMAT_VERSION",
        "Este backup usa uma versão futura ainda não suportada.",
      );
    if (
      root.formatVersion !== 1 &&
      root.formatVersion !== 2 &&
      root.formatVersion !== BACKUP_FORMAT_VERSION
    )
      throw new BackupError(
        "UNSUPPORTED_FORMAT_VERSION",
        "A versão do formato de backup não é suportada.",
      );
    if (
      typeof root.integrity !== "object" ||
      root.integrity === null ||
      !("digest" in root.integrity)
    )
      throw new BackupError(
        "MISSING_CHECKSUM",
        "O backup não contém checksum de integridade.",
      );
    const parsed = envelopeSchema.safeParse(raw);
    if (!parsed.success)
      throw new BackupError(
        "INVALID_BACKUP_DATA",
        "O backup contém dados inválidos ou incompatíveis.",
      );
    const sourceFormatVersion = parsed.data.formatVersion;
    rejectDuplicates({
      ...parsed.data.data,
      milestones: sourceFormatVersion === 1 ? [] : parsed.data.data.milestones,
      sessions: sourceFormatVersion === 3 ? parsed.data.data.sessions : [],
      tags: sourceFormatVersion === 3 ? parsed.data.data.tags : [],
    });
    const { integrity, ...unsigned } = parsed.data;
    if ((await sha256(checksumMaterial(unsigned))) !== integrity.digest)
      throw new BackupError(
        "CHECKSUM_MISMATCH",
        "A integridade do backup não pôde ser confirmada.",
      );
    const data = sortData(
      normalizeData(
        parsed.data.data,
        sourceFormatVersion === 1 ? [] : parsed.data.data.milestones,
        parsed.data.createdAt,
      ),
    );
    return Object.freeze({
      data,
      summary: Object.freeze({
        createdAt: parsed.data.createdAt,
        appVersion: parsed.data.appVersion,
        databaseVersion: parsed.data.databaseVersion,
        formatVersion: sourceFormatVersion,
        policy: "replace",
        counts: counts(data),
        warnings: Object.freeze([
          ...(sourceFormatVersion === 1
            ? [
                "Este backup é anterior aos marcos; nenhum marco será inventado e marcos legítimos existentes serão preservados.",
              ]
            : []),
          ...(parsed.data.databaseVersion > 5
            ? [
                "O backup foi criado por um schema de banco mais recente, mas o formato é compatível.",
              ]
            : []),
        ]),
      }),
    });
  }
}

export { canonicalize, checksumMaterial };
