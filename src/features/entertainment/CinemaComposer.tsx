import { useCallback, useMemo } from "react";
import type { ImageFilesPort } from "../../application/imageFiles";
import type { LocalPoster } from "../../application/media";
import type { EntertainmentEntry } from "../../domain/entertainment";
import { releaseDays } from "../../domain/entertainment";
import { BVShareComposer } from "../share-composer/BVShareComposer";
import type { ShareComposition } from "../share-composer/composition";
import {
  BANNER_MODES,
  bannerModeLabels,
  createCinemaImage,
  defaultBannerMessage,
} from "./cinemaImage";
export function CinemaComposer({
  entry,
  poster,
  files,
  today,
}: {
  readonly entry: EntertainmentEntry;
  readonly poster?: LocalPoster;
  readonly files?: ImageFilesPort;
  readonly today: string;
}) {
  const modes = useMemo(
    () =>
      BANNER_MODES.map((mode) => ({
        id: mode,
        label: bannerModeLabels[mode],
        message: defaultBannerMessage(mode, entry, today),
      })),
    [entry, today],
  );
  const renderImage = useCallback(
    (options: ShareComposition) => {
      const mode = BANNER_MODES.find((mode) => mode === options.mode);
      if (!mode) return Promise.reject(new Error("Composição desconhecida."));
      return createCinemaImage(entry, { ...options, mode, today });
    },
    [entry, today],
  );
  return (
    <BVShareComposer
      contentKey={JSON.stringify([entry, today])}
      title={entry.title}
      modes={modes}
      initialMode={
        (releaseDays(entry.catalog?.releaseDate, today) ?? -1) >= 0
          ? "release"
          : "wishlist"
      }
      poster={poster}
      files={files}
      renderImage={renderImage}
      labels={{
        open: "Criar banner cinematográfico",
        close: "Fechar compositor",
        share: "Compartilhar banner",
        save: "Salvar PNG",
        message: "Mensagem do banner",
      }}
    />
  );
}
