import "fake-indexeddb/auto";
import Dexie from "dexie";
import { afterEach, expect, it } from "vitest";
import {
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
it("creates a canonical card from a real editor, previews both faces and keeps a recoverable draft", async () => {
  const a = await app(),
    u = userEvent.setup(),
    view = mount(a, "/arcanario/oficina/nova");
  const front = await screen.findByLabelText("Frente · pergunta ou pista");
  fireEvent.change(front, { target: { value: echo.front } });
  fireEvent.change(screen.getByLabelText("Verso · resposta ou descoberta"), {
    target: { value: echo.back },
  });
  await u.click(screen.getByRole("button", { name: /Virar prévia/ }));
  expect(
    within(screen.getByLabelText("Prévia da carta")).getByText(echo.back),
  ).toBeVisible();
  view.unmount();
  expect((await a.arcanarium.list()).cards).toHaveLength(0);
  mount(a, "/arcanario/oficina/nova");
  expect(await screen.findByText(/Rascunho recuperado/)).toBeVisible();
  expect(screen.getByLabelText("Frente · pergunta ou pista")).toHaveValue(
    echo.front,
  );
  await u.click(
    screen.getByRole("button", { name: "Guardar carta no acervo" }),
  );
  await screen.findByRole("link", { name: "Editar na Oficina" });
  expect((await a.arcanarium.list()).cards).toHaveLength(1);
  expect(a.workshopDrafts.read("nova:flashcard")).toBeUndefined();
});
it("preserves typed work on a genuine revision conflict and lets the user choose the new base", async () => {
  const a = await app(),
    u = userEvent.setup(),
    c = await a.arcanarium.createCard(echo);
  mount(a, `/arcanario/oficina/${encodeURIComponent(c.id)}`);
  const front = await screen.findByLabelText("Frente · pergunta ou pista");
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
