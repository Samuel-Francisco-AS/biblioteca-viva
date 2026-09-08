import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AudioPort } from "./application";
import { useAudioExperience } from "./useAudioExperience";

const capacitorMocks = vi.hoisted(() => ({
  appStateListener: undefined as
    ((event: { isActive: boolean }) => void) | undefined,
  isNativePlatform: vi.fn(() => false),
  remove: vi.fn(() => Promise.resolve()),
}));

vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: capacitorMocks.isNativePlatform },
}));

vi.mock("@capacitor/app", () => ({
  App: {
    addListener: vi.fn(
      (
        _eventName: string,
        listener: (event: { isActive: boolean }) => void,
      ) => {
        capacitorMocks.appStateListener = listener;
        return Promise.resolve({ remove: capacitorMocks.remove });
      },
    ),
  },
}));

function audio(): AudioPort {
  return {
    availability: vi.fn(() => "not-initialized" as const),
    dispose: vi.fn(),
    emit: vi.fn(),
    initialize: vi.fn(() => Promise.resolve("ready" as const)),
    pause: vi.fn(),
    preferences: vi.fn(() => ({
      effectsVolume: 0.6,
      muted: false,
    })),
    resume: vi.fn(),
    setEffectsVolume: vi.fn(() => Promise.resolve()),
    setMuted: vi.fn(() => Promise.resolve()),
  };
}

function Harness({ audioPort }: { readonly audioPort: AudioPort }) {
  useAudioExperience(audioPort);
  return (
    <>
      <button type="button">Ação React</button>
      <button type="button">Outra ação</button>
    </>
  );
}

describe("useAudioExperience", () => {
  beforeEach(() => {
    capacitorMocks.appStateListener = undefined;
    capacitorMocks.isNativePlatform.mockReturnValue(false);
    capacitorMocks.remove.mockClear();
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
  });

  it("primeiro gesto React inicializa uma vez e remove os listeners globais", async () => {
    const audioPort = audio();
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Harness audioPort={audioPort} />
      </MemoryRouter>,
    );
    expect(vi.mocked(audioPort.initialize)).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Ação React" }));
    await user.click(screen.getByRole("button", { name: "Ação React" }));
    fireEvent.pointerDown(screen.getByRole("button", { name: "Outra ação" }));
    expect(vi.mocked(audioPort.initialize)).toHaveBeenCalledTimes(1);
  });

  it("primeiro gesto em outro controle também inicializa uma vez", () => {
    const audioPort = audio();
    render(
      <MemoryRouter>
        <Harness audioPort={audioPort} />
      </MemoryRouter>,
    );
    fireEvent.pointerDown(screen.getByRole("button", { name: "Outra ação" }));
    fireEvent.pointerDown(screen.getByRole("button", { name: "Outra ação" }));
    expect(vi.mocked(audioPort.initialize)).toHaveBeenCalledTimes(1);
  });

  it("ignora tecla modificadora e aceita keydown válido", () => {
    const audioPort = audio();
    render(
      <MemoryRouter>
        <Harness audioPort={audioPort} />
      </MemoryRouter>,
    );
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Shift" }));
    expect(vi.mocked(audioPort.initialize)).not.toHaveBeenCalled();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(vi.mocked(audioPort.initialize)).toHaveBeenCalledTimes(1);
  });

  it("pausa e retoma pelo documento sem acumular reprodução", () => {
    const audioPort = audio();
    render(
      <MemoryRouter>
        <Harness audioPort={audioPort} />
      </MemoryRouter>,
    );
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    document.dispatchEvent(new Event("visibilitychange"));
    expect(vi.mocked(audioPort.pause)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(audioPort.resume)).toHaveBeenCalledTimes(1);
  });

  it("integra appStateChange nativo e remove o listener", async () => {
    capacitorMocks.isNativePlatform.mockReturnValue(true);
    const audioPort = audio();
    const view = render(
      <MemoryRouter>
        <Harness audioPort={audioPort} />
      </MemoryRouter>,
    );
    await waitFor(() => expect(capacitorMocks.appStateListener).toBeDefined());
    act(() => capacitorMocks.appStateListener?.({ isActive: false }));
    act(() => capacitorMocks.appStateListener?.({ isActive: true }));
    expect(vi.mocked(audioPort.pause)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(audioPort.resume)).toHaveBeenCalledTimes(1);
    view.unmount();
    await waitFor(() => expect(capacitorMocks.remove).toHaveBeenCalledTimes(1));
  });
});
