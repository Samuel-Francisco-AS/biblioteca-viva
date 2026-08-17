// @vitest-environment node
import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";

import { BibliotecaDatabase } from "../database/database";
import { SystemClock } from "../platform/adapters";
import {
  DexieExperienceSettingsRepository,
  EXPERIENCE_SETTINGS_KEY,
} from "./experienceSettingsRepository";

const databases: BibliotecaDatabase[] = [];

afterEach(async () => {
  const current = databases.splice(0);
  current.forEach((database) => database.close());
  for (const database of current) await database.delete();
});

describe("DexieExperienceSettingsRepository", () => {
  it("grava, recarrega e reabre preferências sem mudar o schema", async () => {
    const name = `experience-settings-${crypto.randomUUID()}`;
    const first = new BibliotecaDatabase(name);
    databases.push(first);
    await first.open();
    const preferences = {
      highContrast: true,
      motion: "reduce" as const,
      textSize: "larger" as const,
    };
    await new DexieExperienceSettingsRepository(first, new SystemClock()).save(
      preferences,
    );
    first.close();

    const reopened = new BibliotecaDatabase(name);
    databases.push(reopened);
    await reopened.open();
    await expect(
      new DexieExperienceSettingsRepository(reopened, new SystemClock()).load(),
    ).resolves.toEqual(preferences);
    expect(reopened.verno).toBe(5);
  });

  it("rejeita valores inválidos e versões futuras com validação estrita", async () => {
    const database = new BibliotecaDatabase(
      `experience-settings-invalid-${crypto.randomUUID()}`,
    );
    databases.push(database);
    await database.open();
    await database.settings.put({
      key: EXPERIENCE_SETTINGS_KEY,
      value: {
        highContrast: true,
        motion: "future",
        textSize: "gigantic",
        futureOption: true,
      },
      updatedAt: "2026-08-10T12:00:00.000Z",
    });

    await expect(
      new DexieExperienceSettingsRepository(database, new SystemClock()).load(),
    ).rejects.toBeDefined();
  });
});
