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
  persistedBookSchema,
  persistedNoteSchema,
  persistedQuoteSchema,
  persistedSettingSchema,
} from "../database/schema";

const digestSchema = z.string().regex(/^[a-f0-9]{64}$/u);
const backupSettingSchema = persistedSettingSchema.extend({ value: z.json() });
const dataSchema = z.strictObject({
  libraryEntries: z.array(persistedBookSchema),
  notes: z.array(persistedNoteSchema),
  quotes: z.array(persistedQuoteSchema),
  activities: z.array(persistedActivitySchema),
  settings: z.array(backupSettingSchema),
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
    notes: data.notes.length,
    quotes: data.quotes.length,
    activities: data.activities.length,
    settings: data.settings.length,
  });
}

function sortData(data: BackupData): BackupData {
  const byId = <T extends { readonly id: string }>(values: readonly T[]) =>
    [...values].sort((a, b) => a.id.localeCompare(b.id));
  return Object.freeze({
    libraryEntries: Object.freeze(byId(data.libraryEntries)),
    notes: Object.freeze(byId(data.notes)),
    quotes: Object.freeze(byId(data.quotes)),
    activities: Object.freeze(byId(data.activities)),
    settings: Object.freeze(
      [...data.settings].sort((a, b) => a.key.localeCompare(b.key)),
    ),
  });
}

function rejectDuplicates(data: BackupData): void {
  const collections: readonly [string, readonly string[]][] = [
    ["libraryEntries", data.libraryEntries.map((item) => item.id)],
    ["notes", data.notes.map((item) => item.id)],
    ["quotes", data.quotes.map((item) => item.id)],
    ["activities", data.activities.map((item) => item.id)],
    ["settings", data.settings.map((item) => item.key)],
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
    const data = dataSchema.parse(sortData(input.data));
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
    if (root.formatVersion !== BACKUP_FORMAT_VERSION)
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
    rejectDuplicates(parsed.data.data);
    const { integrity, ...unsigned } = parsed.data;
    if ((await sha256(checksumMaterial(unsigned))) !== integrity.digest)
      throw new BackupError(
        "CHECKSUM_MISMATCH",
        "A integridade do backup não pôde ser confirmada.",
      );
    const data = sortData(parsed.data.data);
    return Object.freeze({
      data,
      summary: Object.freeze({
        createdAt: parsed.data.createdAt,
        appVersion: parsed.data.appVersion,
        databaseVersion: parsed.data.databaseVersion,
        formatVersion: BACKUP_FORMAT_VERSION,
        policy: "replace",
        counts: counts(data),
        warnings: Object.freeze(
          parsed.data.databaseVersion > 2
            ? [
                "O backup foi criado por um schema de banco mais recente, mas o formato é compatível.",
              ]
            : [],
        ),
      }),
    });
  }
}

export { canonicalize, checksumMaterial };
