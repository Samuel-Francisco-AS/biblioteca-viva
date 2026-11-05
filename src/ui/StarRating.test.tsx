import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, it, vi } from "vitest";
import { PersistedRating, StarRating } from "./StarRating";
it("supports all five values, real radio semantics, form data, visible fill and removal without redundant numeric controls", async () => {
  const user = userEvent.setup();
  render(
    <form aria-label="Formulário">
      <StarRating name="rating" />
    </form>,
  );
  const form = screen.getByRole<HTMLFormElement>("form");
  expect(new FormData(form).get("rating")).toBe("");
  for (let i = 1; i <= 5; i++) {
    const radio = screen.getByRole("radio", { name: `${i} de 5 estrelas` });
    await user.click(radio);
    expect(radio).toBeChecked();
    expect(new FormData(form).get("rating")).toBe(String(i));
    expect(form.querySelectorAll('[data-filled="true"]')).toHaveLength(i);
  }
  await user.click(screen.getByRole("button", { name: "Remover avaliação" }));
  expect(new FormData(form).get("rating")).toBe("");
  expect(
    screen
      .getAllByRole("radio")
      .every((radio) => !radio.hasAttribute("aria-checked")),
  ).toBe(true); // native checked semantics
  expect(form.querySelector('input[type="number"]')).toBeNull();
});
it("shows immediate feedback, prevents duplicate writes and rolls back when persistence rejects", async () => {
  let reject: (reason: Error) => void = () => {
    throw new Error("not started");
  };
  const save = vi.fn(
    () =>
      new Promise<void>((_resolve, fail) => {
        reject = fail;
      }),
  );
  render(<PersistedRating value={2} save={save} />);
  fireEvent.click(screen.getByRole("radio", { name: "4 de 5 estrelas" }));
  expect(screen.getByRole("radio", { name: "4 de 5 estrelas" })).toBeChecked();
  fireEvent.click(screen.getByRole("radio", { name: "4 de 5 estrelas" }));
  expect(save).toHaveBeenCalledOnce();
  expect(save).toHaveBeenCalledWith(4);
  reject(new Error("offline fixture disk failure"));
  await screen.findByRole("alert");
  expect(screen.getByRole("radio", { name: "2 de 5 estrelas" })).toBeChecked();
});
it("commits changed/removed ratings exactly once and reflects a reopened persisted value", async () => {
  const save = vi.fn(async () => {});
  function Harness() {
    const [rating, setRating] = useState<number | undefined>(3);
    return (
      <PersistedRating
        value={rating}
        save={async (next) => {
          await save();
          setRating(next);
        }}
      />
    );
  }
  const view = render(<Harness />);
  fireEvent.click(screen.getByRole("radio", { name: "5 de 5 estrelas" }));
  await waitFor(() =>
    expect(screen.getByRole("status")).toHaveTextContent("Avaliação salva"),
  );
  fireEvent.click(screen.getByRole("button", { name: "Remover avaliação" }));
  await waitFor(() =>
    expect(screen.getByRole("status")).toHaveTextContent("Avaliação removida"),
  );
  expect(save).toHaveBeenCalledTimes(2);
  view.rerender(<PersistedRating value={4} save={save} />);
  expect(screen.getByRole("radio", { name: "4 de 5 estrelas" })).toBeChecked();
});
