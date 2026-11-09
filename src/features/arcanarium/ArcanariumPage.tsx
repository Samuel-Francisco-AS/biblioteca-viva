import { Provations, TrialSession } from "./Provations";
import { Taxonomy } from "./Taxonomy";
import { Diagnosis } from "./Diagnosis";
import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import type { ApplicationRuntime } from "../../app/createApplication";
import { Arcana, arcanaError, type ArcanaContext } from "./context";
import { ArcanaSeal } from "./ArcanaArt";
import { ArcanaCard } from "./ArcanaCard";
import { Catalogue, CardDetail } from "./Catalogue";
import { DeckEditor, Decks } from "./Decks";
import { Workshop } from "./Workshop";
import { Echoes, Review } from "./Echoes";
import { DeckImport } from "./DeckImport";
import "./arcanarium.css";
export default function ArcanariumPage({
  application: app,
}: {
  readonly application?: ApplicationRuntime;
}) {
  const [snapshot, setSnapshot] = useState<Omit<ArcanaContext, "reload">>();
  const [error, setError] = useState("");
  const location = useLocation();
  const reload = useCallback(async () => {
    if (!app) return;
    const [data, entries] = await Promise.all([
      app.arcanarium.list(),
      app.queries.listLibraryEntries.execute(),
    ]);
    setSnapshot({ app, data, entries });
    setError("");
  }, [app]);
  useEffect(() => {
    if (!app) return;
    let active = true;
    void Promise.all([
      app.arcanarium.list(),
      app.queries.listLibraryEntries.execute(),
    ])
      .then(([data, entries]) => {
        if (active) setSnapshot({ app, data, entries });
      })
      .catch((e) => {
        if (active) setError(arcanaError(e));
      });
    return () => {
      active = false;
    };
  }, [app]);
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible")
        void reload().catch((e) => setError(arcanaError(e)));
    };
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, [reload]);
  const atPortal = location.pathname.replace(/\/$/, "") === "/arcanario";
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
        <NavLink to="/arcanario/provacoes">Provações</NavLink>
        <NavLink to="/arcanario/assuntos">Assuntos</NavLink>
        <NavLink to="/arcanario/diagnostico">Diagnóstico</NavLink>
        <NavLink to="/arcanario/relicario">Relicário</NavLink>
      </nav>
      {error && (
        <div role="alert" className="arcana-error">
          <p>{error}</p>
          <button
            onClick={() => void reload().catch((e) => setError(arcanaError(e)))}
          >
            Tentar carregar novamente
          </button>
        </div>
      )}
      {!snapshot ? (
        !error && <p role="status">Abrindo os arquivos do Arcanário…</p>
      ) : (
        <Arcana.Provider value={{ ...snapshot, reload }}>
          <Routes>
            <Route index element={<Portal data={snapshot.data} />} />
            <Route path="acervo" element={<Catalogue />} />
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
        </Arcana.Provider>
      )}
    </section>
  );
}
function Portal({ data }: { readonly data: ArcanaContext["data"] }) {
  const cards = data.cards.filter((c) => !c.archived);
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
            {cards.length} cartas · {data.decks.length} baralhos ·{" "}
            {data.sessions.filter((s) => s.kind === "flashcard_review").length}{" "}
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
