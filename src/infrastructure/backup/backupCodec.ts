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
  DATABASE_VERSION,
  persistedActivitySchema,
  persistedLibraryEntrySchema,
  persistedMilestoneSchema,
  persistedNoteSchema,
  persistedQuoteSchema,
  persistedSessionSchema,
  persistedSettingSchema,
  persistedTagSchema,
} from "../database/schema";

const digestSchema = z.string().regex(/^[a-f0-9]{64}$/u);
const backupSettingSchema = z.discriminatedUnion("key", [
  persistedSettingSchema.extend({
    key: z.literal("audio.preferences.v1"),
    value: z.strictObject({
      effectsVolume: z.number().min(0).max(1),
      muted: z.boolean(),
    }),
  }),
  persistedSettingSchema.extend({
    key: z.literal("experience.preferences.v1"),
    value: z.strictObject({
      highContrast: z.boolean(),
      motion: z.enum(["system", "reduce", "normal"]),
      textSize: z.enum(["default", "large", "larger"]),
    }),
  }),
]);
const dataSchema = z.strictObject({
  libraryEntries: z.array(persistedLibraryEntrySchema),
  notes: z.array(persistedNoteSchema),
  quotes: z.array(persistedQuoteSchema),
  activities: z.array(persistedActivitySchema),
  settings: z.array(backupSettingSchema),
  milestones: z.array(persistedMilestoneSchema),
  sessions: z.array(persistedSessionSchema),
  tags: z.array(persistedTagSchema),
});
const unsignedSchema = z.strictObject({
  kind: z.literal(BACKUP_KIND),
  formatVersion: z.literal(BACKUP_FORMAT_VERSION),
  createdAt: z.iso.datetime({ offset: false }),
  appVersion: z.string().trim().min(1),
  databaseVersion: z.int().positive(),
  data: dataSchema,
  metadata: z.strictObject({ policy: z.literal("replace") }),
});
const envelopeSchema = unsignedSchema.extend({
  integrity: z.strictObject({
    algorithm: z.literal("SHA-256"),
    digest: digestSchema,
  }),
});

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
  )
    return true;
  if (Array.isArray(value)) return value.every(isJsonValue);
  if (typeof value !== "object") return false;
  return Object.values(value).every(isJsonValue);
}

export function checksumMaterial(value: unknown): JsonValue {
  const serialized = JSON.stringify(value);
  if (serialized === undefined)
    throw new BackupError(
      "INVALID_BACKUP_DATA",
      "O backup contém dados inválidos ou incompatíveis.",
    );
  const parsed: unknown = JSON.parse(serialized);
  if (!isJsonValue(parsed))
    throw new BackupError(
      "INVALID_BACKUP_DATA",
      "O backup contém dados inválidos ou incompatíveis.",
    );
  return parsed;
}

export function canonicalize(value: JsonValue): string {
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

function byteLength(content: string): number {
  return new TextEncoder().encode(content).byteLength;
}

function counts(data: BackupData): BackupCounts {
  return Object.freeze({
    libraryEntries: data.libraryEntries.length,
    notes: data.notes.length,
    quotes: data.quotes.length,
    activities: data.activities.length,
    settings: data.settings.length,
    milestones: data.milestones.length,
    sessions: data.sessions.length,
    tags: data.tags.length,
  });
}

function sorted(data: BackupData): BackupData {
  const byId = <T extends { readonly id: string }>(values: readonly T[]) =>
    Object.freeze(
      [...values].sort((left, right) => left.id.localeCompare(right.id)),
    );
  return Object.freeze({
    libraryEntries: byId(data.libraryEntries),
    notes: byId(data.notes),
    quotes: byId(data.quotes),
    activities: byId(data.activities),
    settings: Object.freeze(
      [...data.settings].sort((left, right) =>
        left.key.localeCompare(right.key),
      ),
    ),
    milestones: byId(data.milestones),
    sessions: byId(data.sessions),
    tags: byId(data.tags),
  });
}

function rejectDuplicates(data: BackupData): void {
  const collections: readonly (readonly string[])[] = [
    data.libraryEntries.map(({ id }) => id),
    data.notes.map(({ id }) => id),
    data.quotes.map(({ id }) => id),
    data.activities.map(({ id }) => id),
    data.settings.map(({ key }) => key),
    data.milestones.map(({ id }) => id),
    data.sessions.map(({ id }) => id),
    data.tags.map(({ id }) => id),
  ];
  if (collections.some((ids) => new Set(ids).size !== ids.length))
    throw new BackupError(
      "DUPLICATE_ID",
      "O backup contém identificadores duplicados.",
    );
}

export class JsonBackupCodec implements BackupCodecPort {
  async encode(input: {
    readonly appVersion: string;
    readonly createdAt: string;
    readonly databaseVersion: number;
    readonly data: BackupData;
  }): Promise<BackupArtifact> {
    const data = sorted(
      dataSchema.parse({
        libraryEntries: input.data.libraryEntries,
        notes: input.data.notes,
        quotes: input.data.quotes,
        activities: input.data.activities,
        settings: input.data.settings,
        milestones: input.data.milestones,
        sessions: input.data.sessions,
        tags: input.data.tags,
      }),
    );
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
    const integrity = {
      algorithm: "SHA-256" as const,
      digest: await sha256(checksumMaterial(unsigned)),
    };
    const content = JSON.stringify({ ...unsigned, integrity }, null, 2);
    if (byteLength(content) > MAX_BACKUP_BYTES)
      throw new BackupError(
        "BACKUP_TOO_LARGE",
        "O backup excede o limite de 10 MiB.",
      );
    const summary = Object.freeze({
      createdAt: unsigned.createdAt,
      appVersion: unsigned.appVersion,
      databaseVersion: unsigned.databaseVersion,
      formatVersion: BACKUP_FORMAT_VERSION,
      policy: "replace" as const,
      counts: counts(data),
      warnings: Object.freeze([]),
    });
    return Object.freeze({ fileName: "backup.json", content, summary });
  }

  async inspect(content: string): Promise<ValidatedBackup> {
    if (byteLength(content) > MAX_BACKUP_BYTES)
      throw new BackupError(
        "BACKUP_TOO_LARGE",
        "O backup excede o limite de 10 MiB.",
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
    if (
      !raw ||
      typeof raw !== "object" ||
      (raw as { kind?: unknown }).kind !== BACKUP_KIND
    )
      throw new BackupError(
        "UNRECOGNIZED_FORMAT",
        "O arquivo não é um backup reconhecido.",
      );
    const formatVersion = (raw as { formatVersion?: unknown }).formatVersion;
    if (
      typeof formatVersion === "number" &&
      formatVersion > BACKUP_FORMAT_VERSION
    )
      throw new BackupError(
        "FUTURE_FORMAT_VERSION",
        "O backup usa um formato futuro.",
      );
    if (formatVersion !== BACKUP_FORMAT_VERSION)
      throw new BackupError(
        "UNSUPPORTED_FORMAT_VERSION",
        "Backups produzidos antes do WORLD RESET não são compatíveis com este aplicativo.",
      );
    if (!("integrity" in raw))
      throw new BackupError(
        "MISSING_CHECKSUM",
        "O backup não contém checksum de integridade.",
      );
    const parsed = envelopeSchema.safeParse(raw);
    if (!parsed.success)
      throw new BackupError(
        "INVALID_BACKUP_DATA",
        "O backup contém dados inválidos.",
      );
    const { integrity, ...unsigned } = parsed.data;
    const expected = await sha256(checksumMaterial(unsigned));
    if (integrity.digest !== expected)
      throw new BackupError(
        "CHECKSUM_MISMATCH",
        "A integridade do backup não confere.",
      );
    const data = sorted(parsed.data.data);
    rejectDuplicates(data);
    return Object.freeze({
      data,
      summary: Object.freeze({
        createdAt: parsed.data.createdAt,
        appVersion: parsed.data.appVersion,
        databaseVersion: parsed.data.databaseVersion,
        formatVersion: BACKUP_FORMAT_VERSION,
        policy: "replace" as const,
        counts: counts(data),
        warnings: Object.freeze(
          parsed.data.databaseVersion > DATABASE_VERSION
            ? [
                "O backup foi criado por um schema mais recente, mas o formato é compatível.",
              ]
            : [],
        ),
      }),
    });
  }
}
