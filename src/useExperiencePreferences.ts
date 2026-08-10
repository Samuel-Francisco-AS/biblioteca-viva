import { useEffect, useState } from "react";

import {
  EXPERIENCE_PREFERENCE_DEFAULTS,
  resolveExperiencePreferences,
  type EffectiveExperiencePreferences,
  type ExperiencePreferences,
  type ExperiencePreferencesPort,
} from "./application";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function systemPrefersReducedMotion(): boolean {
  return window.matchMedia?.(REDUCED_MOTION_QUERY).matches ?? false;
}

export function useExperiencePreferences(
  experience?: ExperiencePreferencesPort,
): EffectiveExperiencePreferences {
  const [preferences, setPreferences] = useState<ExperiencePreferences>(
    () => experience?.preferences() ?? EXPERIENCE_PREFERENCE_DEFAULTS,
  );
  const [systemReducedMotion, setSystemReducedMotion] = useState(
    systemPrefersReducedMotion,
  );

  useEffect(() => {
    if (!experience) return;
    return experience.subscribe(setPreferences);
  }, [experience]);

  useEffect(() => {
    const query = window.matchMedia?.(REDUCED_MOTION_QUERY);
    if (!query) return;
    const update = () => setSystemReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return experience
    ? experience.resolve(systemReducedMotion)
    : resolveExperiencePreferences(preferences, systemReducedMotion);
}
