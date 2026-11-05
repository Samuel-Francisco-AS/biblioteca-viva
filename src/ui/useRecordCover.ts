import { useCallback, useEffect, useState } from "react";
import type { LocalPoster, PosterPort } from "../application/media";
export function useRecordCover(
  images: PosterPort | undefined,
  entryId: string,
) {
  const [result, setResult] = useState<{
    entryId: string;
    images: PosterPort | undefined;
    cover?: LocalPoster;
    error?: string;
  }>();
  useEffect(() => {
    let active = true;
    void images?.get(entryId).then(
      (cover) => {
        if (active) setResult({ entryId, images, cover });
      },
      () => {
        if (active)
          setResult({
            entryId,
            images,
            error: "Não foi possível carregar a capa local.",
          });
      },
    );
    return () => {
      active = false;
    };
  }, [images, entryId]);
  const setCover = useCallback(
    (cover: LocalPoster | undefined) => setResult({ entryId, images, cover }),
    [entryId, images],
  );
  const current =
    result?.entryId === entryId && result.images === images
      ? result
      : undefined;
  return { cover: current?.cover, error: current?.error, setCover };
}
