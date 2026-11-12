import "fake-indexeddb/auto";
import Dexie from "dexie";
import { afterEach, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import {
  createApplication,
  type ApplicationRuntime,
} from "../../app/createApplication";
import ArcanariumPage from "./ArcanariumPage";
const apps: ApplicationRuntime[] = [],
  names: string[] = [];
afterEach(async () => {
  cleanup();
  apps.splice(0).forEach((a) => a.close());
  localStorage.clear();
  await Promise.all(names.splice(0).map((n) => Dexie.delete(n)));
});
async function app() {
  const name = `ui-workshop-${crypto.randomUUID()}`;
  names.push(name);
  const a = await createApplication({ databaseName: name });
  apps.push(a);
  return a;
}
function mount(a: ApplicationRuntime, path = "/arcanario") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/arcanario/*"
          element={<ArcanariumPage application={a} />}
        />
        <Route path="/" element={<h2>Biblioteca de retorno</h2>} />
      </Routes>
    </MemoryRouter>,
  );
}
const echo = {
  type: "flashcard" as const,
  front: "Pista fictícia",
  back: "Resposta fictícia",
};
it("paginates Acervo at 12 flat previews instead of rendering 24 complex cards at once", async () => {
  const a = await app();
  const u = userEvent.setup();
  for (let index = 1; index <= 13; index += 1) {
    await a.arcanarium.createCard({
      type: "flashcard",
      front: `Carta de ensaio ${index}`,
      back: "Verso ilustrativo",
    });
  }
  const view = mount(a, "/arcanario/acervo");
  await screen.findByText("13 cartas encontradas");
  expect(view.container.querySelectorAll(".arcana-grid .arcana-card-link")).toHaveLength(12);
  expect(
    screen.getByRole("navigation", { name: "Páginas do Acervo" }),
  ).toHaveTextContent("Página 1 de 2");
  await u.click(screen.getByRole("button", { name: "Próxima página" }));
  expect(
    await screen.findByRole("navigation", { name: "Páginas do Acervo" }),
  ).toHaveTextContent("Página 2 de 2");
  expect(view.container.querySelectorAll(".arcana-grid .arcana-card-link")).toHaveLength(1);
}, 30000);

it("creates a canonical card from a real editor, previews both faces and keeps a recoverable draft", async () => {
  const a = await app(),
    u = userEvent.setup(),
    view = mount(a, "/arcanario/oficina/nova");
  const front = await screen.findByLabelText(
    "Frente da carta — pergunta ou pista",
  );
  fireEvent.change(front, { target: { value: echo.front } });
  fireEvent.change(
    screen.getByLabelText("Verso da carta — resposta ou descoberta"),
    {
      target: { value: echo.back },
    },
  );
  await u.click(screen.getByRole("button", { name: /Virar prévia/ }));
  expect(
    within(screen.getByLabelText("Prévia da carta")).getByText(echo.back),
  ).toBeVisible();
  view.unmount();
  expect((await a.arcanarium.list()).cards).toHaveLength(0);
  mount(a, "/arcanario/oficina/nova");
  expect(await screen.findByText(/Rascunho recuperado/)).toBeVisible();
  expect(
    screen.getByLabelText("Frente da carta — pergunta ou pista"),
  ).toHaveValue(echo.front);
  await u.click(
    screen.getByRole("button", { name: "Guardar carta no acervo" }),
  );
  // Saving and reloading a canonical card crosses IndexedDB and routing.
  // Preserve the real persisted-card check while allowing worker contention.
  await screen.findByRole(
    "link",
    { name: "Editar na Oficina" },
    { timeout: 10000 },
  );
  expect((await a.arcanarium.list()).cards).toHaveLength(1);
  expect(a.workshopDrafts.read("nova:flashcard")).toBeUndefined();
}, 20000);
it("preserves typed work on a genuine revision conflict and lets the user choose the new base", async () => {
  const a = await app(),
    u = userEvent.setup(),
    c = await a.arcanarium.createCard(echo);
  mount(a, `/arcanario/oficina/${encodeURIComponent(c.id)}`);
  const front = await screen.findByLabelText(
    "Frente da carta — pergunta ou pista",
  );
  fireEvent.change(front, { target: { value: "Meu texto preservado" } });
  await a.arcanarium.updateCard({
    cardId: c.id,
    expectedRevision: 1,
    content: { ...echo, front: "Outra janela" },
  });
  await u.click(
    screen.getByRole("button", { name: "Guardar carta no acervo" }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    /rascunho foi preservado/,
  );
  expect(front).toHaveValue("Meu texto preservado");
  expect((await a.arcanarium.getCard(c.id))?.revision).toBe(2);
});
it("reopens a partial round, requires reveal, persists the remaining answer and shows its history", async () => {
  const a = await app(),
    u = userEvent.setup(),
    c = await a.arcanarium.createCard(echo);
  const s = await a.arcanarium.startReview([
    { cardId: c.id, revision: 1 },
    { cardId: c.id, revision: 1 },
  ]);
  await a.arcanarium.answerReview({
    sessionId: s.id,
    index: 0,
    recalled: true,
  });
  const view = mount(a, `/arcanario/ecos/${s.id}`);
  await screen.findByRole("heading", { name: "Revisão dos Ecos" });
  expect(screen.getByText(/1 de 2 respostas confirmadas/)).toBeVisible();
  expect(
    screen.getByRole("button", { name: "Lembrei · próximo Eco" }),
  ).toBeDisabled();
  await u.click(screen.getByRole("button", { name: /Virar carta/ }));
  await u.click(screen.getByRole("button", { name: "Preciso revisar" }));
  expect(
    await screen.findByRole("heading", { name: "Rodada concluída" }),
  ).toBeVisible();
  expect(await a.arcanarium.progress(c.id)).toMatchObject({
    reviews: 2,
    recalled: 1,
  });
  view.unmount();
  mount(a, "/arcanario/ecos");
  expect(await screen.findByText("2/2 respostas · 1 lembradas")).toBeVisible();
});
it("creates a static deck with real references and reorganizes without copying cards", async () => {
  const a = await app(),
    u = userEvent.setup(),
    c = await a.arcanarium.createCard(echo);
  mount(a, "/arcanario/baralhos/novo");
  await screen.findByLabelText("Nome do baralho");
  fireEvent.change(screen.getByLabelText("Nome do baralho"), {
    target: { value: "Coleção fictícia" },
  });
  await u.click(
    screen.getByRole("button", { name: /Adicionar carta Pista fictícia/ }),
  );
  await u.click(screen.getByRole("button", { name: "Salvar baralho" }));
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { name: "Coleção fictícia" }),
    ).toBeVisible(),
  );
  const data = await a.arcanarium.list();
  expect(data.cards).toHaveLength(1);
  expect(data.decks[0].selection).toEqual({
    kind: "static",
    cards: [{ cardId: c.id }],
  });
});
it("B-R1/B-R2: three native-dialog-free frames update preview, recover draft, persist and cancel without changing saved faces", async () => {
  const a = await app(),
    u = userEvent.setup();
  let view = mount(a, "/arcanario/oficina/nova");
  const front = await screen.findByLabelText(
    "Frente da carta — pergunta ou pista",
  );
  fireEvent.change(front, { target: { value: "Texto da frente" } });
  fireEvent.change(
    screen.getByLabelText("Verso da carta — resposta ou descoberta"),
    { target: { value: "Texto do verso" } },
  );
  fireEvent.change(
    screen.getByLabelText("Nome da carta no acervo (opcional)"),
    { target: { value: "Nome independente" } },
  );
  const preview = screen.getByLabelText("Prévia da carta");
  for (const [name, frame] of [
    [/Constelação · traços celestes/, "constellation"],
    [/Herbário · ramos e folhas/, "herbarium"],
    [/Iluminura · ouro geométrico/, "illuminated"],
  ] as const) {
    await u.click(screen.getByRole("radio", { name }));
    expect(screen.getByRole("radio", { name })).toBeChecked();
    expect(preview.querySelector(`[data-frame="${frame}"]`)).not.toBeNull();
    expect(front).toHaveValue("Texto da frente");
  }
  expect(document.querySelector("select")).toBeNull();
  view.unmount();
  view = mount(a, "/arcanario/oficina/nova");
  await screen.findByText(/Rascunho recuperado/);
  expect(screen.getByRole("radio", { name: /Iluminura/ })).toBeChecked();
  await u.click(
    screen.getByRole("button", { name: "Guardar carta no acervo" }),
  );
  await screen.findByRole("link", { name: "Editar na Oficina" });
  const c = (await a.arcanarium.list()).cards[0];
  expect(c.content).toMatchObject({
    title: "Nome independente",
    front: "Texto da frente",
    back: "Texto do verso",
    appearance: { frame: "illuminated" },
  });
  await u.click(screen.getByRole("link", { name: "Editar na Oficina" }));
  await screen.findByLabelText("Frente da carta — pergunta ou pista");
  await u.click(screen.getByRole("radio", { name: /Herbário/ }));
  view.unmount();
  expect((await a.arcanarium.getCard(c.id))?.content).toEqual(c.content);
  mount(a, `/arcanario/oficina/${encodeURIComponent(c.id)}`);
  await screen.findByText(/Rascunho recuperado/);
  expect(screen.getByRole("radio", { name: /Herbário/ })).toBeChecked();
});
it("B-R1: family filter is a keyboard-accessible radio group without a select", async () => {
  const a = await app(),
    u = userEvent.setup();
  await a.arcanarium.createCard(echo);
  await a.arcanarium.createCard({
    type: "memory",
    title: "Lembrança fictícia",
    entryIds: [],
  });
  mount(a, "/arcanario/acervo");
  await screen.findByRole("heading", { name: "Acervo global" });
  const family = screen.getByRole("group", { name: "Família" });
  expect(family).toHaveClass("arcana-choices--compact");
  expect(within(family).getAllByRole("radio")).toHaveLength(5);
  await u.click(within(family).getByRole("radio", { name: "Lembrança" }));
  expect(screen.getByRole("radio", { name: "Lembrança" })).toBeChecked();
  expect(screen.getAllByRole("link", { name: /Abrir Lembrança/ })).toHaveLength(
    1,
  );
  expect(screen.queryByRole("link", { name: /Abrir Pista/ })).toBeNull();
  expect(document.querySelector("select")).toBeNull();
});
it("C: recovers question draft, reorders stable alternatives, saves metadata and reopens an author question", async () => {
  const a = await app(),
    u = userEvent.setup();
  const view = mount(a, "/arcanario/oficina/nova?tipo=question");
  await screen.findByRole("heading", { name: "Criar questão autoral" });
  fireEvent.change(
    screen.getByLabelText("Nome da questão no acervo (opcional)"),
    { target: { value: "Identificação fictícia" } },
  );
  fireEvent.change(screen.getByLabelText("Enunciado da questão"), {
    target: { value: "Enunciado independente" },
  });
  fireEvent.change(screen.getByLabelText("Alternativa A"), {
    target: { value: "Alternativa correta fictícia" },
  });
  fireEvent.change(screen.getByLabelText("Alternativa B"), {
    target: { value: "Alternativa incorreta fictícia" },
  });
  await u.click(screen.getByRole("radio", { name: "Gabarito A" }));
  fireEvent.change(screen.getByLabelText("Explicação da resolução"), {
    target: { value: "Explicação após resposta" },
  });
  await u.click(screen.getByRole("button", { name: "Descer alternativa 1" }));
  expect(screen.getByRole("radio", { name: "Gabarito B" })).toBeChecked();
  view.unmount();
  mount(a, "/arcanario/oficina/nova?tipo=question");
  await screen.findByText(/Rascunho de questão recuperado/);
  expect(screen.getByLabelText("Enunciado da questão")).toHaveValue(
    "Enunciado independente",
  );
  expect(screen.getByRole("radio", { name: "Gabarito B" })).toBeChecked();
  await u.click(
    screen.getByRole("button", { name: "Guardar questão no acervo" }),
  );
  await screen.findByRole("link", { name: "Editar na Oficina" });
  const c = (await a.arcanarium.list()).cards[0];
  expect(c.content).toMatchObject({
    type: "question",
    title: "Identificação fictícia",
    statement: "Enunciado independente",
    explanation: "Explicação após resposta",
  });
  expect(a.workshopDrafts.read("nova:question")).toBeUndefined();
  await u.click(screen.getByRole("link", { name: "Editar na Oficina" }));
  expect(await screen.findByLabelText("Enunciado da questão")).toHaveValue(
    "Enunciado independente",
  );
});
it("C: response UI reveals no explanation before confirmation, persists correction and resumes from saved position", async () => {
  const a = await app(),
    u = userEvent.setup(),
    c = await a.arcanarium.createCard({
      type: "question",
      statement: "Enunciado fictício",
      alternatives: [
        { id: "a", text: "Certa" },
        { id: "b", text: "Outra" },
      ],
      correctAlternativeId: "a",
      explanation: "Explicação reservada",
      classification: { knowledgeTagIds: [], personalTagIds: [] },
    });
  const s = await a.provations.start({
    selection: { kind: "static", cards: [{ cardId: c.id }] },
  });
  const view = mount(a, `/arcanario/provacoes/${s.id}`);
  await screen.findByRole("heading", { name: "Questão 1 de 1" });
  expect(screen.queryByText("Explicação reservada")).toBeNull();
  expect(
    screen.getByRole("button", { name: "Confirmar resposta" }),
  ).toBeDisabled();
  await u.click(screen.getByRole("radio", { name: /A Certa/ }));
  await u.click(screen.getByRole("button", { name: "Confirmar resposta" }));
  expect(await screen.findByText("Explicação reservada")).toBeVisible();
  await u.click(screen.getByRole("button", { name: "Pausar e sair" }));
  await screen.findByRole("heading", { name: "Provações" });
  view.unmount();
  mount(a, `/arcanario/provacoes/${s.id}`);
  await screen.findByRole("heading", { name: "Provação pausada" });
  await u.click(screen.getByRole("button", { name: "Retomar Provação" }));
  await screen.findByText("Explicação reservada");
  await u.click(screen.getByRole("button", { name: "Concluir Provação" }));
  expect(
    await screen.findByRole("heading", { name: "Resultado da Provação" }),
  ).toBeVisible();
  expect(screen.getByText("100%")).toBeVisible();
});
it("C: genuine question conflicts keep all typed fields", async () => {
  const a = await app(),
    u = userEvent.setup(),
    c = await a.arcanarium.createCard({
      type: "question",
      statement: "Original",
      alternatives: [
        { id: "a", text: "Certa" },
        { id: "b", text: "Outra" },
      ],
      correctAlternativeId: "a",
      classification: { knowledgeTagIds: [], personalTagIds: [] },
    });
  mount(a, `/arcanario/oficina/${encodeURIComponent(c.id)}`);
  const statement = await screen.findByLabelText("Enunciado da questão");
  fireEvent.change(statement, {
    target: { value: "Meu enunciado preservado" },
  });
  await a.arcanarium.updateCard({
    cardId: c.id,
    expectedRevision: 1,
    content: { ...c.content, statement: "Outra janela" },
  });
  await u.click(
    screen.getByRole("button", { name: "Guardar questão no acervo" }),
  );
  await screen.findByRole("alert");
  expect(statement).toHaveValue("Meu enunciado preservado");
  expect((await a.arcanarium.getCard(c.id))?.revision).toBe(2);
  expect(a.workshopDrafts.read(c.id)).toContain("Meu enunciado preservado");
});

it("ignores a late full-snapshot read after navigating to the lightweight portal", async () => {
  const a = await app();
  const data = await a.arcanarium.list();
  let resolve: ((value: typeof data) => void) | undefined;
  vi.spyOn(a.arcanarium, "list").mockImplementationOnce(
    () =>
      new Promise((r) => {
        resolve = r;
      }),
  );
  mount(a, "/arcanario/acervo");
  await userEvent.click(screen.getByRole("link", { name: "Portal" }));
  await screen.findByRole("heading", { name: "O Arcanário" });
  await act(async () => {
    resolve?.(data);
    await Promise.resolve();
  });
  expect(screen.getByRole("heading", { name: "O Arcanário" })).toBeVisible();
  expect(screen.queryByRole("heading", { name: "Acervo global" })).toBeNull();
});
