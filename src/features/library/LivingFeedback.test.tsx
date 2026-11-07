import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LivingSession } from "./livingObjects";
import { LivingControls, LivingFeedback } from "./LivingControls";

afterEach(() => vi.useRealTimers());

describe("LivingFeedback", () => {
  it("starts hidden, then fades and disappears four seconds after an action", () => {
    vi.useFakeTimers();
    const session = new LivingSession();
    const view = render(<LivingFeedback session={session} />);
    expect(screen.queryByTestId("living-feedback")).toBeNull();
    void act(() => session.actPrimary("living:lamp"));
    expect(screen.getByTestId("living-feedback")).toHaveTextContent(
      "A luz revela",
    );
    void act(() => vi.advanceTimersByTime(3600));
    expect(screen.getByTestId("living-feedback")).toHaveAttribute(
      "data-fading",
      "true",
    );
    void act(() => vi.advanceTimersByTime(400));
    expect(screen.queryByTestId("living-feedback")).toBeNull();
    view.unmount();
    session.dispose();
  });

  it("does not replay an old hint when the clock changes atmosphere", () => {
    vi.useFakeTimers();
    let current = new Date(2026, 10, 2, 21);
    const session = new LivingSession(() => current);
    const view = render(<LivingFeedback session={session} />);
    void act(() => session.actPrimary("living:lamp"));
    void act(() => vi.advanceTimersByTime(4000));
    expect(screen.queryByTestId("living-feedback")).toBeNull();
    current = new Date(2026, 10, 3, 10);
    void act(() => session.refreshContext());
    expect(screen.queryByTestId("living-feedback")).toBeNull();
    view.unmount();
    session.dispose();
  });

  it("restarts its timer after a subsequent touch", () => {
    vi.useFakeTimers();
    const session = new LivingSession();
    const view = render(<LivingFeedback session={session} />);
    void act(() => session.actPrimary("living:lamp"));
    void act(() => vi.advanceTimersByTime(2500));
    void act(() => session.actPrimary("living:lamp"));
    void act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByTestId("living-feedback")).toHaveTextContent(
      "recolhido",
    );
    void act(() => vi.advanceTimersByTime(2000));
    expect(screen.queryByTestId("living-feedback")).toBeNull();
    view.unmount();
    session.dispose();
  });
});

it("keeps contextual and accessible star-book actions in sync without toggling on selection", () => {
  const session = new LivingSession();
  const onSelect = vi.fn();
  const view = render(
    <LivingControls
      session={session}
      selected="living:book"
      onSelect={onSelect}
    />,
  );
  const context = within(
    screen.getByRole("complementary", { name: "Ações do objeto selecionado" }),
  );
  const toggle = context.getByRole("button", { name: "Abrir / fechar livro" });
  const page = context.getByRole("button", { name: "Virar página" });
  expect(toggle).toHaveAttribute("aria-pressed", "false");
  expect(page).toBeDisabled();
  expect(session.getSnapshot().revision).toBe(0);
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-pressed", "true");
  expect(page).toBeEnabled();
  fireEvent.click(context.getByRole("button", { name: "Examinar" }));
  expect(toggle).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(page);
  expect(session.getSnapshot().objects["living:book"].turns).toBe(1);
  const fallbackToggle = screen.getByRole("button", {
    name: "Abrir / fechar livro — Livro da estrela",
  });
  fireEvent.click(fallbackToggle);
  expect(onSelect).toHaveBeenLastCalledWith("living:book");
  expect(toggle).toHaveAttribute("aria-pressed", "false");
  expect(page).toBeDisabled();
  expect(
    screen.getByRole("button", { name: "Virar página — Livro da estrela" }),
  ).toBeDisabled();
  expect(session.getSnapshot().objects["living:book"].active).toBe(false);
  view.unmount();
  session.dispose();
});
