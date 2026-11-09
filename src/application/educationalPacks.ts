import { persistenceFailed } from "./errors";
import type { PackManifest, PackReceipt } from "../domain/packManifest";
import type { PackLot, PackQuestion } from "../domain/educationalPacks";
import { educationalCardId } from "../domain/educationalPacks";
import { cardSchema, validateArcanarium } from "../domain/arcanarium";
import { packReceiptSchema } from "../domain/packManifest";
import type { ArcanariumDependencies } from "./arcanarium";
import { persistCard } from "./arcanarium";
import { currentTime } from "./internal";
export class PackError extends Error {
  constructor(
    public readonly code:
      | "INVALID"
      | "INCOMPATIBLE"
      | "INTEGRITY"
      | "CONFLICT"
      | "RIGHTS"
      | "TOO_LARGE",
    message: string,
  ) {
    super(message);
    this.name = "PackError";
  }
}
export interface ValidatedPack {
  manifest: PackManifest;
  lots: { lot: PackLot; sha256: string; bytes: number; digests: string[] }[];
}
export interface PackCodec {
  inspect(content: string): Promise<ValidatedPack>;
  questionDigest(q: Pick<PackQuestion, "content">): Promise<string>;
}
export interface PackStore {
  list(): Promise<PackReceipt[]>;
  put(receipt: PackReceipt): Promise<void>;
}
export class EducationalPacksService {
  constructor(
    private readonly deps: ArcanariumDependencies,
    private readonly store: PackStore,
    private readonly codec: PackCodec,
  ) {}
  private async transaction<T>(work: () => Promise<T>): Promise<T> {
    try {
      return await this.deps.transaction.run(work);
    } catch (e) {
      if (e instanceof PackError) throw e;
      throw persistenceFailed("educational-pack");
    }
  }
  list() {
    return this.store.list();
  }
  inspect(content: string) {
    return this.codec.inspect(content);
  }
  async install(
    content: string,
    assurance: PackReceipt["assurance"] = "self-declared",
  ) {
    // All bytes, hashes, rights declarations and references are checked before any write/transaction.
    const pack = await this.codec.inspect(content),
      now = await currentTime(this.deps);
    return this.transaction(async () => {
      const data = await this.deps.arcanarium.read();
      const previous = (data.packs ?? []).find(
        (p) => p.id === pack.manifest.id,
      );
      if (
        previous &&
        (previous.manifest.editorialVersion > pack.manifest.editorialVersion ||
          (previous.manifest.editorialVersion ===
            pack.manifest.editorialVersion &&
            JSON.stringify(previous.manifest) !==
              JSON.stringify(pack.manifest)) ||
          [
            "exam",
            "year",
            "application",
            "booklet",
            "language",
            "category",
          ].some(
            (k) =>
              Reflect.get(previous.manifest, k) !==
              Reflect.get(pack.manifest, k),
          ))
      )
        throw new PackError(
          "CONFLICT",
          "Manifesto conflitante ou versão editorial anterior. Nenhum dado foi alterado.",
        );
      const lots = new Map(previous?.installedLots.map((l) => [l.id, l]) ?? []);
      const items = new Map(previous?.items.map((i) => [i.cardId, i]) ?? []);
      // A newer manifest must still describe all existing lots (no implicit content deletion).
      for (const old of lots.values())
        if (!pack.manifest.lots.some((l) => l.id === old.id))
          throw new PackError(
            "CONFLICT",
            "Atualização retirou um lote instalado.",
          );
      const incomingTags = new Map(data.tags.map((t) => [t.id, t]));
      for (const file of pack.lots)
        for (const tag of file.lot.tags) {
          const old = incomingTags.get(tag.id);
          if (old && JSON.stringify(old) !== JSON.stringify(tag))
            throw new PackError(
              "CONFLICT",
              "Classificação com identidade conflitante.",
            );
          incomingTags.set(tag.id, tag);
        }
      for (const tag of incomingTags.values())
        if (!data.tags.some((t) => t.id === tag.id))
          await this.deps.arcanarium.putTag(tag);
      let written = 0;
      for (const file of pack.lots) {
        const oldLot = lots.get(file.lot.lotId);
        // Unchanged lots keep all bytes and revisions intact. After restore content may need materializing.
        if (
          oldLot?.sha256 === file.sha256 &&
          previous?.status !== "restore-required" &&
          file.lot.questions.every((q) =>
            data.cards.some((c) => c.id === educationalCardId(q.identity)),
          )
        )
          continue;
        if (
          oldLot &&
          oldLot.sha256 !== file.sha256 &&
          previous?.manifest.editorialVersion === pack.manifest.editorialVersion
        )
          throw new PackError("CONFLICT", "Lote alterado sem nova edição.");
        for (const [index, q] of file.lot.questions.entries()) {
          const cardId = educationalCardId(q.identity);
          const oldItem = items.get(cardId);
          if (oldItem && oldItem.lotId !== file.lot.lotId)
            throw new PackError("CONFLICT", "Questão duplicada entre lotes.");
          const old = await this.deps.arcanarium.getCard(cardId);
          if (
            old &&
            ((old.origin.kind !== "official" &&
              old.origin.kind !== "imported") ||
              old.origin.packId !== pack.manifest.id)
          )
            throw new PackError("CONFLICT", "Colisão de identidade global.");
          const existing = await this.deps.arcanarium.getVersion(
            cardId,
            q.revision,
          );
          if (existing) {
            if (
              JSON.stringify(existing.card.content) !==
                JSON.stringify(q.content) ||
              existing.card.updatedAt !== q.publishedAt
            )
              throw new PackError("CONFLICT", "Revisão imutável conflitante.");
          } else {
            if (
              q.revision !== (old?.revision ?? 0) + 1 ||
              (old && q.publishedAt < old.updatedAt) ||
              (q.revision > 1 && !q.correctionSource)
            )
              throw new PackError(
                "CONFLICT",
                "Revisão incompatível ou correção sem fonte.",
              );
            const card = cardSchema.parse({
              id: cardId,
              revision: q.revision,
              type: "question",
              origin: old?.origin ?? {
                kind:
                  pack.manifest.category === "official"
                    ? "official"
                    : "imported",
                packId: pack.manifest.id,
                itemId: cardId,
                version: "format-1",
              },
              createdAt: old?.createdAt ?? q.publishedAt,
              updatedAt: q.publishedAt,
              archived: false,
              content: q.content,
            });
            await persistCard(this.deps.arcanarium, card);
            written++;
          }
          if (!oldItem || q.revision >= oldItem.revision)
            items.set(cardId, {
              cardId,
              revision: q.revision,
              digest: file.digests[index],
              lotId: file.lot.lotId,
            });
        }
        // Full lot replacement must not silently remove an earlier identity.
        const ids = new Set(
          file.lot.questions.map((q) => educationalCardId(q.identity)),
        );
        if (
          [...items.values()].some(
            (i) => i.lotId === file.lot.lotId && !ids.has(i.cardId),
          )
        )
          throw new PackError(
            "CONFLICT",
            "Lote perdeu identidades existentes.",
          );
        lots.set(file.lot.lotId, {
          id: file.lot.lotId,
          sha256: file.sha256,
          count: ids.size,
          bytes: file.bytes,
        });
      }
      // Missing changed lots must be provided; unchanged lots need not be resent.
      if (
        [...lots.values()].some(
          (l) =>
            !pack.manifest.lots.some(
              (m) => m.id === l.id && m.sha256 === l.sha256,
            ),
        )
      )
        throw new PackError("CONFLICT", "Arquivo atualizado ausente.");
      const receipt = packReceiptSchema.parse({
        id: pack.manifest.id,
        manifest: pack.manifest,
        status: "installed",
        assurance:
          previous?.assurance === "self-declared" ? "self-declared" : assurance,
        installedLots: [...lots.values()],
        items: [...items.values()],
        updatedAt: now,
      });
      await this.store.put(receipt);
      validateArcanarium(
        await this.deps.arcanarium.read(),
        new Set(data.studyLinks.filter((l) => l.active).map((l) => l.studyId)),
      );
      return { receipt, written };
    });
  }
  async remove(id: string) {
    return this.transaction(async () => {
      const receipt = (await this.store.list()).find((p) => p.id === id);
      if (!receipt) throw new PackError("INVALID", "Pacote não encontrado.");
      // Deliberate retention: immutable revisions and identities survive uninstall, no response cascade.
      await this.store.put({
        ...receipt,
        status: "removed",
        updatedAt: await currentTime(this.deps),
      });
    });
  }
  async integrity(id: string) {
    const data = await this.deps.arcanarium.read(),
      receipt = data.packs?.find((p) => p.id === id);
    if (!receipt) throw new PackError("INVALID", "Pacote não encontrado.");
    const corrupt: string[] = [];
    for (const item of receipt.items) {
      const v = data.versions.find(
        (v) => v.cardId === item.cardId && v.revision === item.revision,
      );
      if (
        v &&
        (await this.codec.questionDigest({ content: v.card.content })) !==
          item.digest
      )
        corrupt.push(item.cardId);
    }
    const missing = receipt.items.filter(
      (i) =>
        !data.versions.some(
          (v) => v.cardId === i.cardId && v.revision === i.revision,
        ),
    ).length;
    return {
      missing,
      corrupt: corrupt.length,
      retainedVersions: data.versions.filter(
        (v) =>
          (v.card.origin.kind === "official" ||
            v.card.origin.kind === "imported") &&
          v.card.origin.packId === id,
      ).length,
      status:
        missing || corrupt.length
          ? ("restore-required" as const)
          : ("ok" as const),
    };
  }
}
