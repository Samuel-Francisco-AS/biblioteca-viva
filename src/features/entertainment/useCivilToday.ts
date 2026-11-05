import { useCallback, useEffect, useState } from "react";
import { useAppResume } from "../../app/useAppResume";
import { localCivilDate } from "../../domain/entertainment";
export function useCivilToday() {
  const [today, setToday] = useState(() => localCivilDate());
  const update = useCallback(() => setToday(localCivilDate()), []);
  useAppResume(update);
  useEffect(() => {
    const timer = window.setInterval(update, 30000);
    return () => clearInterval(timer);
  }, [update]);
  return today;
}
