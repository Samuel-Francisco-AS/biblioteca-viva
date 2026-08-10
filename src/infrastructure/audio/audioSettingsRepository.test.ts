// @vitest-environment node
import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";

import { SystemClock } from "../platform/adapters";
import { BibliotecaDatabase } from "../database/database";
import {
  AUDIO_SETTINGS_KEY,
  DexieAudioSettingsRepository,
} from "./audioSettingsRepository";

const databases: BibliotecaDatabase[] = [];

afterEach(async () => {
  const current = databases.splice(0);
  current.forEach((database) => database.close());
  for (const database of current) await database.delete();
});

describe("DexieAudioSettingsRepository", () => {
  it("persiste e recarrega preferências na tabela settings existente", async () => {
    const name = `audio-settings-${crypto.randomUUID()}`;
    const first = new BibliotecaDatabase(name);
    databases.push(first);
    await first.open();
    const repository = new DexieAudioSettingsRepository(
      first,
      new SystemClock(),
    );
    const preferences = {
      effectsVolume: 0.72,
      musicVolume: 0.18,
      muted: true,
    };
    await repository.save(preferences);
    expect(await repository.load()).toEqual(preferences);
    first.close();

    const reopened = new BibliotecaDatabase(name);
    databases.push(reopened);
    await reopened.open();
    await expect(
      new DexieAudioSettingsRepository(reopened, new SystemClock()).load(),
    ).resolves.toEqual(preferences);
    expect(await reopened.settings.count()).toBe(1);
  });

  it("rejeita valor externo inválido antes de cruzar a infraestrutura", async () => {
    const database = new BibliotecaDatabase(
      `audio-settings-invalid-${crypto.randomUUID()}`,
    );
    databases.push(database);
    await database.open();
    await database.settings.put({
      key: AUDIO_SETTINGS_KEY,
      value: { effectsVolume: 4, musicVolume: "alto", muted: false },
      updatedAt: "2026-08-06T12:00:00.000Z",
    });
    await expect(
      new DexieAudioSettingsRepository(database, new SystemClock()).load(),
    ).rejects.toBeDefined();
  });
});
