import { useEffect, useRef, useState } from "react";
import type { ArenaAnchor } from "./arenaScene";
import type { ArenaView } from "./arenaModel";

export function ArenaCanvas({
  view,
  selected,
  targets,
  active,
  onAnchors,
}: {
  readonly view: ArenaView;
  readonly selected?: string;
  readonly targets: ReadonlySet<string>;
  readonly active: boolean;
  readonly onAnchors: (anchors: ArenaAnchor[]) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef({ view, selected, targets, active, onAnchors });
  const runtime = useRef<{ update(): void; activity(): void } | undefined>(
    undefined,
  );
  const [failure, setFailure] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    state.current = { view, selected, targets, active, onAnchors };
    runtime.current?.update();
    runtime.current?.activity();
  }, [view, selected, targets, active, onAnchors]);
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let disposed = false;
    let cleanup = () => {};
    void Promise.all([import("three"), import("./arenaScene")])
      .then(([T, { createArenaScene }]) => {
        if (disposed) return;
        const world = createArenaScene();
        let renderer: InstanceType<typeof T.WebGLRenderer>;
        try {
          renderer = new T.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: "default",
          });
        } catch {
          world.dispose();
          setFailure("O campo 3D não pôde ser iniciado.");
          return;
        }
        renderer.outputColorSpace = T.SRGBColorSpace;
        renderer.setClearColor(0x080b19);
        renderer.domElement.setAttribute("aria-hidden", "true");
        container.append(renderer.domElement);
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
        const reduced = () =>
          reduce.matches ||
          document.querySelector('[data-reduced-motion="true"]') !== null;
        let contextLost = false;
        let raf = 0,
          lastFrame = 0,
          samples = 0,
          slow = 0;
        let ratio = Math.min(devicePixelRatio || 1, 1.75);
        const draw = (time: number) => {
          if (
            disposed ||
            contextLost ||
            !state.current.active ||
            document.visibilityState === "hidden"
          ) {
            raf = 0;
            return;
          }
          if (lastFrame) {
            samples++;
            if (time - lastFrame > 30) slow++;
          }
          lastFrame = time;
          if (samples === 120) {
            if (slow > 60 && ratio > 0.75) {
              ratio = Math.max(0.75, ratio - 0.25);
              renderer.setPixelRatio(ratio);
            }
            samples = 0;
            slow = 0;
          }
          world.animate(time, reduced());
          renderer.render(world.scene, world.camera);
          raf = requestAnimationFrame(draw);
        };
        const activity = () => {
          if (raf) cancelAnimationFrame(raf);
          raf = 0;
          lastFrame = 0;
          if (
            !contextLost &&
            state.current.active &&
            document.visibilityState !== "hidden"
          )
            raf = requestAnimationFrame(draw);
        };
        const update = () => {
          world.update(state.current.view);
          world.select(state.current.selected, new Set(state.current.targets));
          state.current.onAnchors(world.anchors());
          if (
            !contextLost &&
            !state.current.active &&
            document.visibilityState !== "hidden"
          ) {
            world.animate(performance.now(), true);
            renderer.render(world.scene, world.camera);
          }
        };
        const resize = () => {
          const { width, height } = container.getBoundingClientRect();
          if (!width || !height) return;
          renderer.setPixelRatio(ratio);
          renderer.setSize(width, height);
          world.resize(width, height);
          update();
        };
        const loss = (e: Event) => {
          e.preventDefault();
          contextLost = true;
          cancelAnimationFrame(raf);
          raf = 0;
          setFailure("O campo gráfico foi interrompido. Seu duelo está salvo.");
        };
        renderer.domElement.addEventListener("webglcontextlost", loss);
        const observer = new ResizeObserver(resize);
        observer.observe(container);
        document.addEventListener("visibilitychange", activity);
        runtime.current = { update, activity };
        resize();
        activity();
        cleanup = () => {
          runtime.current = undefined;
          cancelAnimationFrame(raf);
          observer.disconnect();
          document.removeEventListener("visibilitychange", activity);
          renderer.domElement.removeEventListener("webglcontextlost", loss);
          world.dispose();
          renderer.dispose();
          renderer.forceContextLoss();
          renderer.domElement.remove();
        };
      })
      .catch(() => {
        if (!disposed) setFailure("O campo 3D não pôde ser carregado.");
      });
    return () => {
      disposed = true;
      cleanup();
    };
  }, [attempt]);
  return (
    <>
      <div ref={host} className="arena-canvas" data-testid="arena-canvas" />
      {failure && (
        <div className="arena-render-error" role="alert">
          {failure}
          <button
            onClick={() => {
              setFailure("");
              setAttempt((n) => n + 1);
            }}
          >
            Recriar campo 3D
          </button>
        </div>
      )}
    </>
  );
}
