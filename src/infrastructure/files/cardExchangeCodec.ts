import { z } from "zod";
import {
  exchangeDataSchema,
  MAX_EXCHANGE_BYTES,
  type ExchangeData,
  type CardExchangeCodec,
} from "../../application/cardExchange";
import { cardMediaSchema } from "../database/cardMedia";
import { canonicalize, checksumMaterial } from "../backup/backupCodec";
const dataSchema = exchangeDataSchema.extend({
  media: z.array(cardMediaSchema).max(500),
});
const unsignedSchema = z.strictObject({
  kind: z.literal("biblioteca-viva-author-deck"),
  formatVersion: z.literal(1),
  data: dataSchema,
});
const envelopeSchema = unsignedSchema.extend({
  integrity: z.strictObject({
    algorithm: z.literal("SHA-256"),
    digest: z.string().regex(/^[a-f0-9]{64}$/u),
  }),
});
async function digest(value: unknown) {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(canonicalize(checksumMaterial(value))),
  );
  return [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
function validate(data: ExchangeData) {
  const refs = new Map(
    data.cards.flatMap((c) =>
      c.content.type === "memory" && c.content.imageId
        ? [[c.content.imageId, c.id] as const]
        : [],
    ),
  );
  const referenceCount = data.cards.filter(
    (c) => c.content.type === "memory" && c.content.imageId,
  ).length;
  if (
    refs.size !== referenceCount ||
    new Set(data.media.map((m) => m.id)).size !== data.media.length ||
    refs.size !== data.media.length ||
    data.media.some((m) => refs.get(m.id) !== m.cardId)
  )
    throw new Error("Imagens ausentes, duplicadas ou sem proprietário.");
}
function limit(content: string) {
  if (new TextEncoder().encode(content).byteLength > MAX_EXCHANGE_BYTES)
    throw new Error("O baralho excede 10 MiB.");
}
export class JsonCardExchangeCodec implements CardExchangeCodec {
  async encode(input: ExchangeData) {
    const data = dataSchema.parse(input);
    validate(data);
    const unsigned = unsignedSchema.parse({
      kind: "biblioteca-viva-author-deck",
      formatVersion: 1,
      data,
    });
    const content = JSON.stringify(
      {
        ...unsigned,
        integrity: { algorithm: "SHA-256", digest: await digest(unsigned) },
      },
      null,
      2,
    );
    limit(content);
    return content;
  }
  async inspect(content: string) {
    limit(content);
    let raw: unknown;
    try {
      raw = JSON.parse(content);
    } catch {
      throw new Error("O arquivo não contém JSON válido.");
    }
    const p = envelopeSchema.safeParse(raw);
    if (!p.success)
      throw new Error(
        "Baralho inválido ou versão incompatível. Use um arquivo autoral v1 da Biblioteca Viva.",
      );
    const { integrity, ...unsigned } = p.data;
    if (integrity.digest !== (await digest(unsigned)))
      throw new Error("A integridade do baralho não confere.");
    validate(unsigned.data);
    return unsigned.data;
  }
}
