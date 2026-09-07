import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  LIBRARY_CONTEXT_LABEL_DURATION_MS,
  LibraryContextLabel,
} from "./LibraryContextLabel";

function renderLabel(reducedMotion = false) {
  return render(
    <LibraryContextLabel
      periodLabel="fim de tarde"
      reducedMotion={reducedMotion}
      roomName="Biblioteca principal"
    />,
  );
}

describe("LibraryContextLabel", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("aparece e é removida da apresentação exatamente aos cinco segundos", async () => {
    vi.useFakeTimers();
    renderLabel();

    expect(
      screen.getByText("Biblioteca principal · fim de tarde"),
    ).toBeVisible();
    await act(() =>
      vi.advanceTimersByTime(LIBRARY_CONTEXT_LABEL_DURATION_MS - 1),
    );
    expect(
      screen.getByText("Biblioteca principal · fim de tarde"),
    ).toBeVisible();
    await act(() => vi.advanceTimersByTime(1));
    expect(
      screen.queryByText("Biblioteca principal · fim de tarde"),
    ).not.toBeInTheDocument();
  });

  it("cancela o ciclo anterior e reinicia somente após uma mudança real", async () => {
    vi.useFakeTimers();
    const rendered = renderLabel();
    await act(() => vi.advanceTimersByTime(3_000));

    rendered.rerender(
      <LibraryContextLabel
        periodLabel="noite"
        reducedMotion={false}
        roomName="Biblioteca principal"
      />,
    );
    await act(() => vi.advanceTimersByTime(4_999));
    expect(screen.getByText("Biblioteca principal · noite")).toBeVisible();
    await act(() => vi.advanceTimersByTime(1));
    expect(
      screen.queryByText("Biblioteca principal · noite"),
    ).not.toBeInTheDocument();
  });

  it("não reinicia o temporizador em rerender comum", async () => {
    vi.useFakeTimers();
    const rendered = renderLabel();
    await act(() => vi.advanceTimersByTime(4_000));

    rendered.rerender(
      <LibraryContextLabel
        periodLabel="fim de tarde"
        reducedMotion={false}
        roomName="Biblioteca principal"
      />,
    );
    await act(() => vi.advanceTimersByTime(1_000));
    expect(
      screen.queryByText("Biblioteca principal · fim de tarde"),
    ).not.toBeInTheDocument();
  });

  it("reinicia o ciclo quando a sala ativa muda", async () => {
    vi.useFakeTimers();
    const rendered = renderLabel();
    await act(() => vi.advanceTimersByTime(4_000));

    rendered.rerender(
      <LibraryContextLabel
        periodLabel="fim de tarde"
        reducedMotion={false}
        roomName="Sala de estudo"
      />,
    );
    await act(() => vi.advanceTimersByTime(4_999));
    expect(screen.getByText("Sala de estudo · fim de tarde")).toBeVisible();
    await act(() => vi.advanceTimersByTime(1));
    expect(
      screen.queryByText("Sala de estudo · fim de tarde"),
    ).not.toBeInTheDocument();
  });

  it("mantém os mesmos cinco segundos sem animação em movimento reduzido", async () => {
    vi.useFakeTimers();
    renderLabel(true);
    const label = screen.getByText("Biblioteca principal · fim de tarde");

    expect(label).not.toHaveClass("library-context-label--animated");
    await act(() => vi.advanceTimersByTime(LIBRARY_CONTEXT_LABEL_DURATION_MS));
    expect(label).not.toBeInTheDocument();
  });

  it("limpa o timer ao desmontar", () => {
    vi.useFakeTimers();
    const clearTimeout = vi.spyOn(window, "clearTimeout");
    const rendered = renderLabel();

    rendered.unmount();

    expect(clearTimeout).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
});
