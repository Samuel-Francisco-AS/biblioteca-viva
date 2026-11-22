import { expect, test } from "./fixtures";

test("Estudos grava e revisa na fonte global, reabre e retira sem apagar o acervo", async ({
  page,
}) => {
  await page.goto("/novo-registro");
  await page.getByRole("button", { name: /Estudo/ }).click();
  await page
    .getByRole("textbox", { name: "Título", exact: true })
    .fill("Arcanário fictício");
  await page.getByRole("button", { name: "Salvar registro" }).click();
  await expect(
    page.getByRole("heading", { name: "Arcanário fictício" }),
  ).toBeVisible();
  await page.getByText("Inscrever uma nova carta", { exact: true }).click();
  await page.getByLabel("Frente · pergunta ou pista").fill("Pista fictícia");
  await page
    .getByLabel("Verso · resposta ou descoberta")
    .fill("Verso fictício\ncompleto");
  await page
    .getByRole("button", { name: "Guardar carta", exact: true })
    .click();
  await expect(page.locator(".study-card-count")).toHaveText("1 carta");
  await page.reload();
  await page
    .getByRole("button", { name: "Revisar cartas", exact: true })
    .click();
  await page.getByRole("button", { name: /Pergunta: Pista fictícia/ }).click();
  await page.getByRole("button", { name: "Lembrei →", exact: true }).click();
  await expect(page.getByText(/1 de 1 cartas lembradas/)).toBeVisible();
  await page
    .getByRole("button", { name: "Encerrar revisão", exact: true })
    .click();
  await page.getByText("Suas cartas · 1", { exact: true }).click();
  await page.getByRole("button", { name: "Editar carta", exact: true }).click();
  await page.getByLabel("Frente · pergunta ou pista").fill("Pista revista");
  await page.getByRole("button", { name: "Salvar carta", exact: true }).click();
  await expect(page.locator(".study-card-library")).toContainText(
    "Pista revista",
  );
  await page.reload();
  await page.getByText("Suas cartas · 1", { exact: true }).click();
  await expect(page.locator(".study-card-library")).toContainText(
    "Pista revista",
  );
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Excluir carta", exact: true })
    .click();
  await expect(page.locator(".study-card-count")).toHaveText("0 cartas");
  await page.reload();
  await expect(page.locator(".study-card-count")).toHaveText("0 cartas");
  const persisted = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("biblioteca-viva-bf57");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error("fixture read failed"));
    });
    const tables = [
      "libraryEntries",
      "arcanariumCards",
      "arcanariumVersions",
      "cardSessions",
      "studyCardLinks",
    ];
    const result = await Promise.all(
      tables.map(
        (table) =>
          new Promise<unknown[]>((resolve, reject) => {
            const request = db
              .transaction(table, "readonly")
              .objectStore(table)
              .getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () =>
              reject(new Error("fixture table read failed"));
          }),
      ),
    );
    db.close();
    return result;
  });
  expect(persisted[0]).toHaveLength(1);
  expect(persisted[0][0]).not.toHaveProperty("flashCards");
  expect(persisted[1]).toHaveLength(1);
  expect(persisted[1][0]).toMatchObject({
    revision: 2,
    content: { front: "Pista revista", back: "Verso fictício\ncompleto" },
  });
  expect(persisted[2]).toHaveLength(2);
  expect(persisted[3]).toHaveLength(1);
  expect(persisted[3][0]).toMatchObject({
    kind: "flashcard_review",
    cards: [{ revision: 1 }],
    answers: [{ recalled: true }],
  });
  expect(persisted[4]).toHaveLength(1);
  expect(persisted[4][0]).toMatchObject({ active: false });
});
