import "fake-indexeddb/auto";
import Dexie from "dexie";
import { afterEach, it, expect, vi } from "vitest";
import {
  render,
  screen,
  within,
  cleanup,
  waitFor,
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
  await Promise.all(names.splice(0).map((n) => Dexie.delete(n)));
});
async function setup(path = "/arcanario/pacotes") {
  const databaseName = `packs-ui-${crypto.randomUUID()}`;
  names.push(databaseName);
  const a = await createApplication({ databaseName });
  apps.push(a);
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/arcanario/*"
          element={<ArcanariumPage application={a} />}
        />
      </Routes>
    </MemoryRouter>,
  );
  return a;
}
it("catalogue, real install/update/remove/reinstall and collection/provation navigation", async () => {
  const a = await setup(),
    u = userEvent.setup();
  const volume = await screen.findByRole("article", {
    name: "Aritmética dos pequenos arquivos",
  });
  expect(
    within(volume).getByText("Disponível para instalar"),
  ).toBeInTheDocument();
  expect(
    within(
      await screen.findByRole("article", { name: "ENEM 2024 · Matemática" }),
    ).queryByRole("button", { name: /Instalar/ }),
  ).not.toBeInTheDocument();
  await u.click(
    within(volume).getByRole("button", { name: "Instalar lote 1" }),
  );
  await within(volume).findByText("Atualização disponível");
  expect((await a.arcanarium.list()).cards).toHaveLength(2);
  await u.click(
    within(volume).getByRole("button", {
      name: "Atualizar · instalar lote adicional",
    }),
  );
  await within(volume).findByText("Instalado");
  expect((await a.arcanarium.list()).cards).toHaveLength(4);
  await u.click(within(volume).getByRole("button", { name: "Remover pacote" }));
  await within(volume).findByText("Desinstalado");
  expect((await a.arcanarium.list()).cards).toHaveLength(4);
  await u.click(
    within(volume).getByRole("button", { name: "Reinstalar pacote" }),
  );
  await within(volume).findByText("Instalado");
  await u.click(
    within(volume).getByRole("link", { name: "Preparar Provação" }),
  );
  await screen.findByRole("heading", { name: "Provações" });
  expect(
    screen.getByRole("button", { name: "Iniciar Provação" }),
  ).toBeEnabled();
  await u.click(screen.getByRole("button", { name: "Iniciar Provação" }));
  await waitFor(async () =>
    expect((await a.arcanarium.list()).sessions).toHaveLength(1),
  );
});
it("file validation has no side effects and recoverable errors leave install usable", async () => {
  const a = await setup(),
    u = userEvent.setup();
  await screen.findByRole("heading", { name: "Biblioteca de Provas" });
  const input = screen.getByLabelText("Arquivo de pacote (.json)");
  await u.upload(
    input,
    new File(["{}"], "invalido.json", { type: "application/json" }),
  );
  await screen.findByRole("alert");
  expect((await a.arcanarium.list()).cards).toHaveLength(0);
  const content = await a.packCatalogue.load(
    "arcanario-matematica-original",
    1,
  );
  const file = new File([content], "seguro.json", { type: "application/json" });
  // jsdom's File lacks Blob.text; use the same bytes the real picker supplies.
  Object.defineProperty(file, "text", {
    value: () => Promise.resolve(content),
  });
  await u.upload(input, file);
  await screen.findByRole("button", { name: "Instalar arquivo conferido" });
  expect((await a.arcanarium.list()).cards).toHaveLength(0);
  await u.click(
    screen.getByRole("button", { name: "Instalar arquivo conferido" }),
  );
  await waitFor(async () =>
    expect((await a.arcanarium.list()).cards).toHaveLength(2),
  );
  expect((await a.educationalPacks.list())[0].assurance).toBe("self-declared");
});
it("portal uses a summary and never reads all question revisions", async () => {
  const databaseName = `packs-ui-${crypto.randomUUID()}`;
  names.push(databaseName);
  const a = await createApplication({ databaseName });
  apps.push(a);
  await a.educationalPacks.install(
    await a.packCatalogue.load("arcanario-matematica-original", 2),
  );
  const fullRead = vi.spyOn(a.arcanarium, "list");
  render(
    <MemoryRouter initialEntries={["/arcanario"]}>
      <Routes>
        <Route
          path="/arcanario/*"
          element={<ArcanariumPage application={a} />}
        />
      </Routes>
    </MemoryRouter>,
  );
  await screen.findByRole("heading", { name: "O Arcanário" });
  expect(screen.getByText(/4 cartas/)).toBeInTheDocument();
  expect(fullRead).not.toHaveBeenCalled();
});
it("archived personal memories remain identifiable and visible in the archived collection", async () => {
  const a = await setup();
  const memory = await a.arcanarium.createCard({
    type: "memory",
    title: "Lembrança arquivada de teste",
    entryIds: [],
  });
  await a.arcanarium.archiveCard({
    cardId: memory.id,
    expectedRevision: memory.revision,
  });
  const u = userEvent.setup();
  await u.click(await screen.findByRole("link", { name: "Portal" }));
  await screen.findByRole("heading", { name: "O Arcanário" });
  await u.click(await screen.findByRole("link", { name: "Relicário" }));
  await screen.findByRole("heading", { name: "O Relicário" });
  await u.click(screen.getByLabelText("Ver arquivadas"));
  await u.click(
    await screen.findByRole("link", {
      name: "Abrir Lembrança arquivada de teste",
    }),
  );
  expect(await screen.findByText(/Lembrança · Arquivada/)).toBeInTheDocument();
  expect(
    screen.queryByText(/Conteúdo indisponível para novas sessões/),
  ).not.toBeInTheDocument();
});
