import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PhysicalProfilePort } from "../../application/workouts";
import type { PhysicalProfile } from "../../domain/workouts";
import {
  ATLAS_HOLD_MS,
  ATLAS_DISSOLVE_MS,
  atlasCollection,
  atlasPlates,
  type AtlasCollection,
} from "./classicAtlas";
import "./classic-atlas.css";

/** Only image decoding and two opacity layers: no body rig, pose engine or frame loop. */
function AtlasProjection({
  collection,
}: {
  readonly collection: AtlasCollection;
}) {
  const root = useRef<HTMLElement>(null);
  const [frame, setFrame] = useState<{ current: number; incoming?: number }>({
    current: 0,
  });
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);
  const [visible, setVisible] = useState(
    () => typeof IntersectionObserver === "undefined",
  );
  const [foreground, setForeground] = useState(() => !document.hidden);
  const [reduced, setReduced] = useState(
    () =>
      Boolean(
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
      ) || Boolean(document.querySelector('[data-reduced-motion="true"]')),
  );
  const [paused, setPaused] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [request, setRequest] = useState(0);
  const handledRequest = useRef(0);
  const [error, setError] = useState("");
  const currentIndex = frame.current;
  const stopPreview = useCallback(() => {
    setFrame((previous) =>
      previous.incoming === undefined
        ? previous
        : { current: previous.current },
    );
    setPreparing(false);
  }, []);
  const plates = useMemo(() => atlasPlates(collection), [collection]);
  const playing = visible && foreground && !reduced && !paused;
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const shell = node.closest("[data-reduced-motion]");
    const preference = () => {
      const nextReduced =
        Boolean(media?.matches) ||
        shell?.getAttribute("data-reduced-motion") === "true";
      if (nextReduced) stopPreview();
      setReduced(nextReduced);
    };
    const visibility = () => {
      if (document.hidden) stopPreview();
      setForeground(!document.hidden);
    };
    const observer =
      typeof IntersectionObserver === "undefined"
        ? undefined
        : new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) stopPreview();
            setVisible(entry.isIntersecting);
          });
    observer?.observe(node);
    const mutation = new MutationObserver(preference);
    if (shell)
      mutation.observe(shell, {
        attributes: true,
        attributeFilter: ["data-reduced-motion"],
      });
    media?.addEventListener("change", preference);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer?.disconnect();
      mutation.disconnect();
      media?.removeEventListener("change", preference);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [stopPreview]);
  useEffect(() => {
    let active = true;
    let swap: ReturnType<typeof setTimeout> | undefined;
    let cancelLoad: (() => void) | undefined;
    const manual = request !== handledRequest.current;
    handledRequest.current = request;
    if (!ready || (!playing && !manual)) return;
    async function advance() {
      setPreparing(true);
      // Try each other local plate at most once; keep the current art on failure.
      for (let offset = 1; offset < plates.length && active; offset++) {
        const next = (currentIndex + offset) % plates.length;
        const candidate = new Image();
        try {
          await new Promise<void>((resolve, reject) => {
            const release = () => {
              candidate.onload = null;
              candidate.onerror = null;
              cancelLoad = undefined;
            };
            cancelLoad = () => {
              release();
              reject(new Error("atlas_image_cancelled"));
            };
            candidate.onload = () => {
              release();
              resolve();
            };
            candidate.onerror = () => {
              release();
              reject(new Error("atlas_image_unavailable"));
            };
            candidate.src = plates[next].src;
          });
          await candidate.decode();
          if (!active) return;
          setPreparing(false);
          setError("");
          if (playing && !missing) {
            setFrame({ current: currentIndex, incoming: next });
            swap = setTimeout(() => {
              if (active) {
                setMissing(false);
                setFrame({ current: next });
              }
            }, ATLAS_DISSOLVE_MS);
          } else {
            setMissing(false);
            setFrame({ current: next });
          }
          return;
        } catch {
          if (!active) return;
        }
      }
      if (active) {
        setPreparing(false);
        setError(
          "Não foi possível abrir outra prancha. A arte atual foi mantida.",
        );
      }
    }
    const hold = setTimeout(() => void advance(), manual ? 0 : ATLAS_HOLD_MS);
    return () => {
      active = false;
      clearTimeout(hold);
      clearTimeout(swap);
      cancelLoad?.();
    };
    // The set is immutable; the collection key remounts this projection on a profile change.
  }, [plates, currentIndex, ready, playing, request, missing]);
  const transitioning = playing && frame.incoming !== undefined;
  const current = plates[frame.current];
  return (
    <figure
      ref={root}
      className="classic-atlas"
      data-collection={collection}
      data-rotating={playing && ready}
      data-transitioning={transitioning}
      data-plate={current.id}
    >
      <div className="classic-atlas__stage" aria-busy={!ready || preparing}>
        {!missing && (
          <img
            key={current.id}
            className={`classic-atlas__art${transitioning ? " classic-atlas__art--departing" : ""}`}
            src={current.src}
            alt={current.alt}
            width="1024"
            height="1536"
            loading="lazy"
            onLoad={() => setReady(true)}
            onError={() => {
              setMissing(true);
              setReady(true);
              setError("Arte indisponível. Tente a próxima prancha.");
            }}
          />
        )}
        {transitioning && frame.incoming !== undefined && (
          <img
            key={plates[frame.incoming].id}
            className="classic-atlas__art classic-atlas__art--arriving"
            src={plates[frame.incoming].src}
            alt=""
            aria-hidden="true"
            width="1024"
            height="1536"
          />
        )}
        {!ready && (
          <span className="classic-atlas__placeholder" role="status">
            Abrindo o atlas…
          </span>
        )}
        {missing && (
          <span className="classic-atlas__placeholder">
            Prancha indisponível
          </span>
        )}
      </div>
      <figcaption className="classic-atlas__caption">
        <span>
          Atlas {collection === "female" ? "feminino" : "masculino"}{" "}
          <span aria-hidden="true">
            · {String(frame.current + 1).padStart(2, "0")} / 03
          </span>
          <span className="visually-hidden">
            {" "}
            ·{" "}
            {collection === "female" ? "coleção feminina" : "coleção masculina"}
          </span>
        </span>
        <div className="classic-atlas__controls">
          <button
            type="button"
            className="text-button"
            aria-pressed={paused}
            disabled={reduced}
            onClick={() => {
              stopPreview();
              setPaused((value) => !value);
            }}
          >
            {reduced
              ? "Projeção estática"
              : paused
                ? "Retomar projeção"
                : "Pausar projeção"}
          </button>
          <button
            type="button"
            className="text-button"
            disabled={!ready || preparing || transitioning}
            onClick={() => setRequest((value) => value + 1)}
            aria-label="Próxima arte"
          >
            Próxima <span aria-hidden="true">→</span>
          </button>
        </div>
      </figcaption>
      {error && (
        <p className="classic-atlas__error" role="status">
          {error}
        </p>
      )}
    </figure>
  );
}
export function ClassicAtlas({
  profile,
}: {
  readonly profile?: PhysicalProfilePort;
}) {
  const [loaded, setLoaded] = useState<{
    profile?: PhysicalProfile;
    ready: boolean;
    error?: string;
  }>({ ready: !profile });
  useEffect(() => {
    let active = true;
    if (profile)
      void profile.load().then(
        (value) => {
          if (active) setLoaded({ profile: value, ready: true });
        },
        () => {
          if (active)
            setLoaded({
              ready: true,
              error:
                "Perfil indisponível. Exibindo a coleção padrão masculina.",
            });
        },
      );
    return () => {
      active = false;
    };
  }, [profile]);
  const collection = atlasCollection(loaded.profile);
  return (
    <div className="classic-atlas-host">
      {loaded.ready ? (
        <AtlasProjection key={collection} collection={collection} />
      ) : (
        <div className="classic-atlas classic-atlas--loading" role="status">
          Abrindo o atlas…
        </div>
      )}
      {loaded.error && (
        <p className="classic-atlas__error" role="status">
          {loaded.error}
        </p>
      )}
    </div>
  );
}
