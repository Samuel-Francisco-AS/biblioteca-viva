import { z } from "zod";

import {
  createTag,
  organizeAnnotation,
  organizeLibraryEntry,
  renameTag,
  type Note,
  type Quote,
  type Tag,
} from "../domain";
import { ApplicationError, persistenceFailed } from "./errors";
import {
  applyDomain,
  currentTime,
  generatedId,
  parseInput,
  runTransaction,
  saveEntity,
} from "./internal";
import type { ApplicationDependencies } from "./ports";

const idSchema = z.strictObject({ id: z.string().trim().min(1) });
const nameSchema = z.strictObject({ name: z.string().trim().min(1) });
const renameSchema = nameSchema.extend({ id: z.string().trim().min(1) });
const organizationSchema = z.strictObject({
  id: z.string().trim().min(1),
  favorite: z.boolean().optional(),
  tagIds: z.array(z.string().trim().min(1)).optional(),
});

type TagDependencies = Pick<
  ApplicationDependencies,
  | "clock"
  | "ids"
  | "libraryEntries"
  | "notes"
  | "quotes"
  | "tags"
  | "transaction"
>;

function conflict(): ApplicationError {
  return new ApplicationError(
    "CONFLICT",
    "Já existe uma etiqueta com esse nome.",
    {
      field: "name",
    },
  );
}

export class ListTags {
  constructor(private readonly tags: TagDependencies["tags"]) {}
  async execute(): Promise<readonly Tag[]> {
    try {
      return await this.tags.list();
    } catch {
      throw persistenceFailed("list_tags");
    }
  }
}

export class CreateTag {
  constructor(private readonly dependencies: TagDependencies) {}
  async execute(input: unknown): Promise<Tag> {
    const parsed = parseInput(nameSchema, input);
    const [id, now] = await Promise.all([
      generatedId(this.dependencies, "generate_tag_id"),
      currentTime(this.dependencies),
    ]);
    const tag = applyDomain(() =>
      createTag({ id, name: parsed.name, createdAt: now }),
    );
    await runTransaction(this.dependencies, async () => {
      if (await this.dependencies.tags.getByNormalizedName(tag.normalizedName))
        throw conflict();
      await saveEntity(() => this.dependencies.tags.save(tag), "save_tag");
    });
    return tag;
  }
}

export class RenameTag {
  constructor(private readonly dependencies: TagDependencies) {}
  async execute(input: unknown): Promise<Tag> {
    const parsed = parseInput(renameSchema, input);
    const existing = await this.dependencies.tags.getById(parsed.id);
    if (!existing)
      throw new ApplicationError("NOT_FOUND", "Etiqueta não encontrada.");
    const now = await currentTime(this.dependencies);
    const updated = applyDomain(() => renameTag(existing, parsed.name, now));
    await runTransaction(this.dependencies, async () => {
      const collision = await this.dependencies.tags.getByNormalizedName(
        updated.normalizedName,
      );
      if (collision && collision.id !== updated.id) throw conflict();
      await saveEntity(() => this.dependencies.tags.save(updated), "save_tag");
    });
    return updated;
  }
}

export class DeleteTag {
  constructor(private readonly dependencies: TagDependencies) {}
  async execute(input: unknown): Promise<{ readonly deleted: true }> {
    const { id } = parseInput(idSchema, input);
    const now = await currentTime(this.dependencies);
    await runTransaction(this.dependencies, async () => {
      if (!(await this.dependencies.tags.getById(id)))
        throw new ApplicationError("NOT_FOUND", "Etiqueta não encontrada.");
      const [entries, notes, quotes] = await Promise.all([
        this.dependencies.libraryEntries.list(),
        this.dependencies.notes.list(),
        this.dependencies.quotes.list(),
      ]);
      await Promise.all([
        ...entries
          .filter((item) => item.tagIds.includes(id))
          .map((item) =>
            this.dependencies.libraryEntries.save(
              organizeLibraryEntry(
                item,
                { tagIds: item.tagIds.filter((tagId) => tagId !== id) },
                now,
              ),
            ),
          ),
        ...notes
          .filter((item) => item.tagIds.includes(id))
          .map((item) =>
            this.dependencies.notes.save(
              organizeAnnotation(
                item,
                { tagIds: item.tagIds.filter((tagId) => tagId !== id) },
                now,
              ),
            ),
          ),
        ...quotes
          .filter((item) => item.tagIds.includes(id))
          .map((item) =>
            this.dependencies.quotes.save(
              organizeAnnotation(
                item,
                { tagIds: item.tagIds.filter((tagId) => tagId !== id) },
                now,
              ),
            ),
          ),
      ]);
      if (!(await this.dependencies.tags.delete(id)))
        throw new ApplicationError("NOT_FOUND", "Etiqueta não encontrada.");
    });
    return Object.freeze({ deleted: true as const });
  }
}

export class OrganizeLibraryEntry {
  constructor(private readonly dependencies: TagDependencies) {}
  async execute(input: unknown) {
    const parsed = parseInput(organizationSchema, input);
    const existing = await this.dependencies.libraryEntries.getById(parsed.id);
    if (!existing)
      throw new ApplicationError("NOT_FOUND", "Registro não encontrado.");
    await validateTags(this.dependencies, parsed.tagIds);
    const now = await currentTime(this.dependencies);
    const updated = applyDomain(() =>
      organizeLibraryEntry(existing, parsed, now),
    );
    await runTransaction(this.dependencies, () =>
      saveEntity(
        () => this.dependencies.libraryEntries.save(updated),
        "save_entry",
      ),
    );
    return updated;
  }
}

async function validateTags(
  dependencies: TagDependencies,
  ids?: readonly string[],
) {
  if (!ids) return;
  const tags = await dependencies.tags.list();
  const known = new Set(tags.map(({ id }) => id));
  if (ids.some((id) => !known.has(id)))
    throw new ApplicationError(
      "VALIDATION_FAILED",
      "Uma etiqueta não existe.",
      { field: "tagIds" },
    );
}

export class OrganizeNote {
  constructor(private readonly dependencies: TagDependencies) {}
  async execute(input: unknown): Promise<Note> {
    const parsed = parseInput(organizationSchema, input);
    const existing = await this.dependencies.notes.getById(parsed.id);
    if (!existing)
      throw new ApplicationError("NOT_FOUND", "Nota não encontrada.");
    await validateTags(this.dependencies, parsed.tagIds);
    const now = await currentTime(this.dependencies);
    const updated = applyDomain(() =>
      organizeAnnotation(existing, parsed, now),
    );
    await runTransaction(this.dependencies, () =>
      this.dependencies.notes.save(updated),
    );
    return updated;
  }
}

export class OrganizeQuote {
  constructor(private readonly dependencies: TagDependencies) {}
  async execute(input: unknown): Promise<Quote> {
    const parsed = parseInput(organizationSchema, input);
    const existing = await this.dependencies.quotes.getById(parsed.id);
    if (!existing)
      throw new ApplicationError("NOT_FOUND", "Citação não encontrada.");
    await validateTags(this.dependencies, parsed.tagIds);
    const now = await currentTime(this.dependencies);
    const updated = applyDomain(() =>
      organizeAnnotation(existing, parsed, now),
    );
    await runTransaction(this.dependencies, () =>
      this.dependencies.quotes.save(updated),
    );
    return updated;
  }
}
