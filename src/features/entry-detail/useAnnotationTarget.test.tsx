import { expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useAnnotationTarget } from "./useAnnotationTarget";
function Fixture({ removed = false }: { removed?: boolean }) {
  const { ref, missing } = useAnnotationTarget(
    removed ? [] : [{ id: "note/1" }],
    [{ id: "quote/1" }],
  );
  return (
    <details>
      <summary>Memórias</summary>
      {missing && <p role="status">Este conteúdo não está mais disponível.</p>}
      <ul ref={ref}>
        {!removed && (
          <li
            tabIndex={-1}
            data-annotation-id="note/1"
            data-annotation-kind="note"
          >
            Nota fictícia
          </li>
        )}
        <li
          tabIndex={-1}
          data-annotation-id="quote/1"
          data-annotation-kind="quote"
        >
          Citação fictícia
        </li>
      </ul>
    </details>
  );
}
it.each(["note", "quote"])(
  "opens and focuses the exact canonical %s target",
  (kind) => {
    render(
      <MemoryRouter
        initialEntries={[
          `/registros/book?annotationKind=${kind}&annotationId=${kind}%2F1&from=%2F`,
        ]}
      >
        <Fixture />
      </MemoryRouter>,
    );
    expect(
      screen.getByText(kind === "note" ? "Nota fictícia" : "Citação fictícia"),
    ).toHaveFocus();
    expect(screen.getByText("Memórias").closest("details")).toHaveAttribute(
      "open",
    );
  },
);
it("handles a removed annotation without redirecting or exposing content", () => {
  render(
    <MemoryRouter
      initialEntries={[
        "/registros/book?annotationKind=note&annotationId=note%2F1",
      ]}
    >
      <Fixture removed />
    </MemoryRouter>,
  );
  expect(screen.getByRole("status")).toHaveTextContent(
    "não está mais disponível",
  );
});
