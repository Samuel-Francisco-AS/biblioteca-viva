import { recordUiRouteContentCommit } from "../../app/uiActionProbe";
import { signalPassageReady } from "../../app/interactionContinuity";
import { isArenaRoute } from "../duel/arena/arenaRoute";
import { emptyArcanarium } from "../../domain/arcanarium";
import { cardAvailable } from "../../domain/educationalPacks";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import type { ApplicationRuntime } from "../../app/createApplication";
import { Arcana, arcanaError, type ArcanaContext } from "./context";
import { ArcanaSeal } from "./ArcanaArt";
import { ArcanaCard } from "./ArcanaCard";
import "./arcanarium.css";

// A room is fetched only when entered; portal rendering stays independent.
const DuelHall = lazy(async () => ({
  default: (await import("../duel/DuelHall")).DuelHall,
}));
const DuelTable = lazy(async () => ({
  default: (await import("../duel/DuelTable")).DuelTable,
}));
const DuelDeckEditor = lazy(async () => ({
  default: (await import("../duel/DuelDecks")).DuelDeckEditor,
}));
const DuelRules = lazy(async () => ({
  default: (await import("../duel/DuelRules")).DuelRules,
}));
const ArenaDuel = lazy(async () => ({
  default: (await import("../duel/arena/ArenaDuel")).ArenaDuel,
}));
const PackLibrary = lazy(async () => ({
  default: (await import("./PackLibrary")).PackLibrary,
}));
const Taxonomy = lazy(async () => ({
  default: (await import("./Taxonomy")).Taxonomy,
}));
const Diagnosis = lazy(async () => ({
  default: (await import("./Diagnosis")).Diagnosis,
}));
const Workshop = lazy(async () => ({
  default: (await import("./Workshop")).Workshop,
}));
const DeckImport = lazy(async () => ({
  default: (await import("./DeckImport")).DeckImport,
}));
const Provations = lazy(async () => ({
  default: (await import("./Provations")).Provations,
}));
const TrialSession = lazy(async () => ({
  default: (await import("./Provations")).TrialSession,
}));
const Catalogue = lazy(async () => ({
  default: (await import("./Catalogue")).Catalogue,
}));
const CardDetail = lazy(async () => ({
  default: (await import("./Catalogue")).CardDetail,
}));
const Decks = lazy(async () => ({
  default: (await import("./Decks")).Decks,
}));
const DeckEditor = lazy(async () => ({
  default: (await import("./Decks")).DeckEditor,
}));
const Echoes = lazy(async () => ({
  default: (await import("./Echoes")).Echoes,
}));
const Review = lazy(async () => ({
  default: (await import("./Echoes")).Review,
}));
function RoomCommitted() {
  const location = useLocation();
  // React Router intentionally retains window scroll while nested Arcanarium
  // rooms share their mounted shell. A card opened from far down the catalogue
  // must start at its artwork, not at the previous page's scroll offset.
  // Layout effect runs when the destination room is actually mounted (after
  // Suspense), before the first revealed frame. Query-string-only changes
  // preserve the reader's position.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    recordUiRouteContentCommit(location.pathname);
    signalPassageReady(location.pathname);
  }, [location.pathname]);
  return null;
}
export default function ArcanariumPage({
  application: app,
}: {
  readonly application?: ApplicationRuntime;
}) {
  const [snapshot, setSnapshot] = useState<
    Omit<ArcanaContext, "reload"> & {
      scope: "portal" | "arena" | "full";
      counts?: { cards: number; decks: number; reviews: number };
    }
  >();
  const [error, setError] = useState("");
  const location = useLocation();
  const atPortal = location.pathname.replace(/\/$/, "") === "/arcanario";
  const scope = atPortal
    ? "portal"
    : isArenaRoute(location.pathname)
      ? "arena"
      : "full";
  const readSnapshot = useCallback(async (): Promise<typeof snapshot> => {
    if (!app) return undefined;
    if (scope !== "full") {
      // The 3D arena reads its match through DuelService, not a global
      // materialization of every card, note and personal record.
      const counts = atPortal ? await app.arcanarium.overview() : undefined;
      return { app, data: emptyArcanarium(), entries: [], scope, counts };
    }
    const [data, entries] = await Promise.all([
      app.arcanarium.list(),
      app.queries.listLibraryEntries.execute(),
    ]);
    return { app, data, entries, scope };
  }, [app, atPortal, scope]);
  const request = useRef(0);
  const mounted = useRef(false);
  const invalidateReads = useCallback(() => {
    request.current++;
  }, []);
  const read = useRef(readSnapshot);
  useLayoutEffect(() => {
    read.current = readSnapshot;
    // Invalidate old-scope reads before passive effects or lazy rooms run.
    request.current++;
  }, [readSnapshot]);
  const reload = useCallback(async () => {
    if (!mounted.current) return;
    const token = ++request.current;
    try {
      const value = await read.current();
      if (!mounted.current || token !== request.current) return;
      setSnapshot(value);
      setError("");
    } catch (cause) {
      if (mounted.current && token === request.current)
        setError(arcanaError(cause));
      throw cause;
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    void reload().catch(() => undefined);
    return () => {
      mounted.current = false;
      invalidateReads();
    };
  }, [readSnapshot, reload, invalidateReads]);
  const context = useMemo(
    () => (snapshot ? { ...snapshot, reload } : undefined),
    [snapshot, reload],
  );
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible")
        void reload().catch(() => undefined);
    };
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, [reload]);
  useEffect(() => {
    // Error/no-storage views are usable destinations too. Do not leave the
    // passage waiting forever when a room cannot load.
    if (error || !app) signalPassageReady(location.pathname);
  }, [error, app, location.pathname]);
  if (!app)
    return (
      <p role="alert">O armazenamento do Arcanário não está disponível.</p>
    );
  return (
    <section className="arcanarium" aria-label="O Arcanário">
      <div className="arcana-topline">
        <Link to={atPortal ? "/" : "/arcanario"}>
          ← {atPortal ? "Voltar à Biblioteca" : "Portal do Arcanário"}
        </Link>
        <span>ARQUIVO DE ENCANTAMENTOS</span>
      </div>
      <nav className="arcana-nav" aria-label="Salas do Arcanário">
        <NavLink to="/arcanario" end>
          Portal
        </NavLink>
        <NavLink to="/arcanario/acervo">Acervo</NavLink>
        <NavLink to="/arcanario/baralhos">Baralhos</NavLink>
        <NavLink to="/arcanario/oficina/nova">Oficina</NavLink>
        <NavLink to="/arcanario/ecos">Ecos</NavLink>
        <NavLink to="/arcanario/duelos">Duelo Arcano</NavLink>
        <NavLink to="/arcanario/provacoes">Provações</NavLink>
        <NavLink to="/arcanario/pacotes">Biblioteca de Provas</NavLink>
        <NavLink to="/arcanario/assuntos">Assuntos</NavLink>
        <NavLink to="/arcanario/diagnostico">Diagnóstico</NavLink>
        <NavLink to="/arcanario/relicario">Relicário</NavLink>
      </nav>
      {error && (
        <div role="alert" className="arcana-error">
          <p>{error}</p>
          <button onClick={() => void reload().catch(() => undefined)}>
            Tentar carregar novamente
          </button>
        </div>
      )}
      {!snapshot || snapshot.app !== app || snapshot.scope !== scope ? (
        !error && <p role="status">Abrindo os arquivos do Arcanário…</p>
      ) : (
        <Arcana.Provider value={context}>
          <Suspense
            fallback={
              <div className="arcana-room-opening" role="status">
                <span aria-hidden="true">✧</span>
                <p>Abrindo a próxima sala do Arcanário…</p>
              </div>
            }
          >
            <Routes>
              <Route
                index
                element={
                  <Portal data={snapshot.data} counts={snapshot.counts} />
                }
              />
              <Route path="duelos" element={<DuelHall />} />
              <Route path="duelos/arena/:id" element={<ArenaDuel />} />
              <Route path="duelos/regras" element={<DuelRules />} />
              <Route path="duelos/baralhos/:id" element={<DuelDeckEditor />} />
              <Route
                path="duelos/partida/:id"
                element={<DuelTable key={location.pathname} />}
              />
              <Route path="acervo" element={<Catalogue />} />
              <Route path="pacotes" element={<PackLibrary />} />
              <Route path="relicario" element={<Catalogue memories />} />
              <Route path="cartas/:id" element={<CardDetail />} />
              <Route path="baralhos" element={<Decks />} />
              <Route path="baralhos/novo" element={<DeckEditor />} />
              <Route path="baralhos/:id" element={<DeckEditor />} />
              <Route path="oficina/:id" element={<Workshop />} />
              <Route path="ecos" element={<Echoes />} />
              <Route path="ecos/:id" element={<Review />} />
              <Route path="provacoes" element={<Provations />} />
              <Route path="provacoes/:id" element={<TrialSession />} />
              <Route path="assuntos" element={<Taxonomy />} />
              <Route path="diagnostico" element={<Diagnosis />} />
              <Route path="importar" element={<DeckImport />} />
              <Route
                path="*"
                element={<p>Este caminho não existe. Retorne ao portal.</p>}
              />
            </Routes>
            <RoomCommitted />
          </Suspense>
        </Arcana.Provider>
      )}
    </section>
  );
}
function Portal({
  data,
  counts,
}: {
  readonly data: ArcanaContext["data"];
  readonly counts?: { cards: number; decks: number; reviews: number };
}) {
  const cards = data.cards.filter((c) => cardAvailable(c, data));
  return (
    <>
      <div className="arcana-hero">
        <div className="arcana-hero__copy">
          <p className="arcana-eyebrow">
            Conhecimentos, afetos e pequenos infinitos
          </p>
          <h2>O Arcanário</h2>
          <p>
            Cada descoberta deixa um eco.
            <br />
            Cada lembrança merece um relicário.
          </p>
          <Link className="button button--primary" to="/arcanario/oficina/nova">
            ✧ Abrir a Oficina de Cartas
          </Link>
          <p className="arcana-census">
            {counts?.cards ?? cards.length} cartas ·{" "}
            {counts?.decks ?? data.decks.length} baralhos ·{" "}
            {counts?.reviews ??
              data.sessions.filter((s) => s.kind === "flashcard_review")
                .length}{" "}
            rodadas guardadas
          </p>
        </div>
        <div className="arcana-hero__art" aria-hidden="true">
          <div className="arcana-orbit" />
          <div className="arcana-hero__echo">
            <ArcanaCard
              compact
              content={{
                type: "flashcard",
                front: "O que permanece quando a página se fecha?",
                back: "A descoberta.",
                appearance: { theme: "astral", frame: "constellation" },
              }}
            />
          </div>
          <div className="arcana-hero__memory">
            <ArcanaCard
              compact
              content={{
                type: "memory",
                title: "O jardim entre as páginas",
                text: "",
                entryIds: [],
                appearance: { theme: "verdant", frame: "herbarium" },
              }}
            />
          </div>
        </div>
      </div>
      <div className="arcana-actions">
        <Link className="button button--primary" to="/arcanario/provacoes">
          ◇ Entrar nas Provações
        </Link>
        <Link to="/arcanario/assuntos">A árvore dos saberes</Link>
        <Link to="/arcanario/diagnostico">Diagnóstico local</Link>
      </div>
      <div className="arcana-portals">
        {[
          {
            to: "duelos",
            title: "O Duelo Arcano",
            text: "Quatro tradições, criaturas impossíveis e escolhas que mudam o círculo. Duele offline.",
            kind: "workshop" as const,
            label: "05 · CONJURAR",
          },
          {
            to: "pacotes",
            title: "Biblioteca de Provas",
            text: "Descubra volumes, instale novos lotes e preserve a memória de cada Provação.",
            kind: "workshop" as const,
            label: "04 · EXPANDIR",
          },
          {
            to: "acervo",
            title: "Acervo & baralhos",
            text: "Encontre suas cartas. Reúna ideias em coleções que se cruzam.",
            kind: "echo" as const,
            label: "01 · ORGANIZAR",
          },
          {
            to: "ecos",
            title: "Ecos do conhecimento",
            text: "Vire uma pergunta, reencontre uma resposta. Retome de onde parou.",
            kind: "workshop" as const,
            label: "02 · RELEMBRAR",
          },
          {
            to: "relicario",
            title: "O Relicário",
            text: "Transforme uma obra, um encontro ou uma conquista em lembrança.",
            kind: "memory" as const,
            label: "03 · PRESERVAR",
          },
        ].map((p) => (
          <Link className="arcana-portal" key={p.to} to={`/arcanario/${p.to}`}>
            <ArcanaSeal kind={p.kind} />
            <span className="arcana-eyebrow">{p.label}</span>
            <h3>{p.title}</h3>
            <p>{p.text}</p>
            <span aria-hidden="true">Abrir arquivo →</span>
          </Link>
        ))}
      </div>
    </>
  );
}
