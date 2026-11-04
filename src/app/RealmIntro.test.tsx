import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { RealmIntro } from "./RealmIntro";

it("shows a distinct illuminated chapter without creating a second banner landmark", () => {
  const { container } = render(
    <RealmIntro
      title="Acervo encantado"
      description="Tudo o que você lê, descobre e constrói."
    />,
  );

  expect(
    screen.getByRole("heading", { name: "Acervo encantado" }),
  ).toBeTruthy();
  expect(container.querySelector(".realm-intro")?.getAttribute("data-realm")).toBe(
    "acervo",
  );
  expect(container.textContent).toContain("PRIMEIRA ALA");
  expect(container.querySelector(".realm-intro__seal")).toBeTruthy();
  expect(screen.queryByRole("banner")).toBeNull();
});

it("gives the Observatory its own sigil and narrative label", () => {
  const { container } = render(
    <RealmIntro
      title="Observatório"
      description="Uma perspectiva sobre o tempo."
    />,
  );
  expect(container.querySelector(".realm-intro")?.getAttribute("data-realm")).toBe(
    "observatorio",
  );
  expect(container.textContent).toContain("CONSTELAÇÕES");
});
