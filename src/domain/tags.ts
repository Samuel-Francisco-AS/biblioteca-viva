import { InvalidFieldError } from "./errors";
import type { Tag } from "./types";
import {
  nextMetadata,
  requireId,
  requireIsoUtc,
  requireText,
} from "./validation";

export function normalizeTagName(value: string): string {
  return requireText(value, "name").toLocaleLowerCase("pt-BR");
}

export function createTag(input: {
  readonly id: string;
  readonly name: string;
  readonly createdAt: string;
}): Tag {
  const createdAt = requireIsoUtc(input.createdAt, "createdAt");
  const name = requireText(input.name, "name");
  return Object.freeze({
    id: requireId(input.id),
    name,
    normalizedName: normalizeTagName(name),
    createdAt,
    updatedAt: createdAt,
    revision: 1,
  });
}

export function renameTag(tag: Tag, nameInput: string, updatedAt: string): Tag {
  const name = requireText(nameInput, "name");
  const normalizedName = normalizeTagName(name);
  if (normalizedName === tag.normalizedName && name === tag.name)
    throw new InvalidFieldError("name", "já possui esse nome");
  return Object.freeze({
    ...tag,
    ...nextMetadata(tag, updatedAt),
    name,
    normalizedName,
  });
}
