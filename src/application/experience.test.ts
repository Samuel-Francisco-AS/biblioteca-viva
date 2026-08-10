// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import {
  EXPERIENCE_PREFERENCE_DEFAULTS,
  ExperiencePreferencesService,
  resolveExperiencePreferences,
  type ExperiencePreferences,
  type ExperienceSettingsPort,
} from "./experience";

function settings(initial?: ExperiencePreferences): ExperienceSettingsPort {
  return {
    load: vi.fn(() => Promise.resolve(initial)),
    save: vi.fn(() => Promise.resolve()),
  };
}

describe("preferências de experiência", () => {
  it("usa defaults seguros e segue a preferência de movimento do sistema", async () => {
    const service = new ExperiencePreferencesService(settings(), {
      warn: vi.fn(),
    });
    await service.loadPreferences();

    expect(service.preferences()).toEqual(EXPERIENCE_PREFERENCE_DEFAULTS);
    expect(service.resolve(false).reducedMotion).toBe(false);
    expect(service.resolve(true).reducedMotion).toBe(true);
  });

  it("permite reduzir ou manter movimento normal sobre o valor do sistema", () => {
    expect(
      resolveExperiencePreferences(
        { highContrast: false, motion: "reduce", textSize: "default" },
        false,
      ).reducedMotion,
    ).toBe(true);
    expect(
      resolveExperiencePreferences(
        { highContrast: false, motion: "normal", textSize: "default" },
        true,
      ).reducedMotion,
    ).toBe(false);
  });

  it("aplica contraste e texto imediatamente, notifica e persiste em ordem", async () => {
    const save = vi.fn(() => Promise.resolve());
    const repository: ExperienceSettingsPort = {
      load: vi.fn(),
      save,
    };
    const service = new ExperiencePreferencesService(repository, {
      warn: vi.fn(),
    });
    const listener = vi.fn();
    service.subscribe(listener);

    await service.setHighContrast(true);
    await service.setTextSize("larger");
    await service.setMotion("reduce");

    expect(service.preferences()).toEqual({
      highContrast: true,
      motion: "reduce",
      textSize: "larger",
    });
    expect(listener).toHaveBeenCalledTimes(3);
    expect(save).toHaveBeenLastCalledWith(service.preferences());
  });

  it("usa fallback e reporta leitura inválida sem impedir abertura", async () => {
    const reporter = { warn: vi.fn() };
    const service = new ExperiencePreferencesService(
      {
        load: vi.fn(() => Promise.reject(new Error("conteúdo inválido"))),
        save: vi.fn(),
      },
      reporter,
    );

    await service.loadPreferences();

    expect(service.preferences()).toEqual(EXPERIENCE_PREFERENCE_DEFAULTS);
    expect(reporter.warn).toHaveBeenCalledWith(
      "EXPERIENCE_PREFERENCES_LOAD_FAILED",
    );
  });

  it("mantém a escolha da sessão e permite retry depois de falha ao salvar", async () => {
    const save = vi
      .fn()
      .mockRejectedValueOnce(new Error("indisponível"))
      .mockResolvedValueOnce(undefined);
    const service = new ExperiencePreferencesService(
      { load: vi.fn(), save },
      { warn: vi.fn() },
    );

    await expect(service.setHighContrast(true)).rejects.toBeDefined();
    expect(service.preferences().highContrast).toBe(true);
    await expect(service.setTextSize("large")).resolves.toBeUndefined();
    expect(save).toHaveBeenCalledTimes(2);
  });
});
