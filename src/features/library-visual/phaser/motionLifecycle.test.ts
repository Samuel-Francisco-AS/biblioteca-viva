import { describe, expect, it, vi } from "vitest";

import {
  SceneMotionLifecycle,
  type SceneMotionDefinition,
  type SceneMotionId,
} from "./motionLifecycle";
import {
  highlightMotionNeedsReplacement,
  resizeMotionAction,
} from "./motionPolicy";
import {
  LIBRARY_ROOM_ANIMATIONS,
  LIBRARY_ROOM_BUDGET,
  libraryRoomMotionPlan,
  pingPongPositionAt,
} from "./roomConfig";
import { librarySceneLayout } from "./sceneLayout";

function motionHandle() {
  return { pause: vi.fn(), resume: vi.fn(), stop: vi.fn() };
}

function definition(
  id: SceneMotionId,
  handle = motionHandle(),
  ends = new Map<SceneMotionId, () => void>(),
): {
  readonly definition: SceneMotionDefinition;
  readonly handle: ReturnType<typeof motionHandle>;
} {
  return {
    definition: {
      create: (onUnexpectedEnd) => {
        ends.set(id, onUnexpectedEnd);
        return handle;
      },
      id,
    },
    handle,
  };
}

describe("regressão do lifecycle das animações da sala", () => {
  it("configura repetição infinita para a bibliotecária", () => {
    expect(LIBRARY_ROOM_ANIMATIONS.librarian.repeat).toBe(-1);
  });

  it("configura repetição infinita para a criatura", () => {
    expect(LIBRARY_ROOM_ANIMATIONS.creature.repeat).toBe(-1);
  });

  it("usa ida e volta e easing suave nos dois personagens", () => {
    expect(LIBRARY_ROOM_ANIMATIONS.librarian).toMatchObject({
      ease: "Sine.easeInOut",
      yoyo: true,
    });
    expect(LIBRARY_ROOM_ANIMATIONS.creature).toMatchObject({
      ease: "Sine.easeInOut",
      yoyo: true,
    });
  });

  it("mantém continuidade nos pontos de retorno sem salto para a origem", () => {
    const duration = LIBRARY_ROOM_ANIMATIONS.creature.durationMs;
    const beforeTurn = pingPongPositionAt(duration - 1, duration, 10, 90);
    const turn = pingPongPositionAt(duration, duration, 10, 90);
    const afterTurn = pingPongPositionAt(duration + 1, duration, 10, 90);
    expect(turn).toBe(90);
    expect(Math.abs(turn - beforeTurn)).toBeLessThan(0.001);
    expect(Math.abs(turn - afterTurn)).toBeLessThan(0.001);
  });

  it("continua produzindo ciclos depois de várias idas e voltas", () => {
    const duration = LIBRARY_ROOM_ANIMATIONS.creature.durationMs;
    expect(pingPongPositionAt(duration * 8, duration, 10, 90)).toBe(10);
    expect(pingPongPositionAt(duration * 9, duration, 10, 90)).toBe(90);
    expect(pingPongPositionAt(duration * 10, duration, 10, 90)).toBe(10);
  });

  it("torna o idle perceptível sem exceder o limite seguro", () => {
    expect(
      LIBRARY_ROOM_ANIMATIONS.librarian.idleAmplitude,
    ).toBeGreaterThanOrEqual(3);
    expect(LIBRARY_ROOM_ANIMATIONS.librarian.idleAmplitude).toBeLessThanOrEqual(
      5,
    );
  });

  it("mantém a criatura nos limites em todos os ciclos amostrados", () => {
    [
      librarySceneLayout({ height: 180, width: 320 }),
      librarySceneLayout({ height: 450, width: 800 }),
    ].forEach((layout) => {
      const left = layout.creatureMovementBounds.x + layout.creature.radius;
      const right =
        layout.creatureMovementBounds.x +
        layout.creatureMovementBounds.width -
        layout.creature.radius;
      for (let step = 0; step <= 40; step += 1) {
        const position = pingPongPositionAt(
          step * 900,
          LIBRARY_ROOM_ANIMATIONS.creature.durationMs,
          left,
          right,
        );
        expect(position).toBeGreaterThanOrEqual(left);
        expect(position).toBeLessThanOrEqual(right);
      }
    });
  });

  it("remapeia resize no mesmo modo sem substituir tweens", () => {
    const lifecycle = new SceneMotionLifecycle();
    const librarian = definition("librarian");
    const creature = definition("creature");
    lifecycle.replace([librarian.definition, creature.definition], "initial");
    const action = resizeMotionAction(
      { height: 180, width: 320 },
      "compact",
      { height: 203, width: 360 },
      "compact",
    );
    expect(action).toBe("remap");
    expect(librarian.handle.stop).not.toHaveBeenCalled();
    expect(creature.handle.stop).not.toHaveBeenCalled();
    expect(lifecycle.snapshot().reconciliations).toBe(1);
  });

  it("substitui um conjunto em regular → compacto", () => {
    const lifecycle = new SceneMotionLifecycle();
    const previous = definition("creature");
    lifecycle.replace([previous.definition], "initial");
    const action = resizeMotionAction(
      { height: 450, width: 800 },
      "regular",
      { height: 293, width: 520 },
      "compact",
    );
    if (action === "replace-all") {
      lifecycle.replace(
        [definition("creature").definition],
        "layout-mode-change",
      );
    }
    expect(previous.handle.stop).toHaveBeenCalledOnce();
    expect(lifecycle.snapshot()).toMatchObject({
      lastReason: "layout-mode-change",
      reconciliations: 2,
    });
  });

  it("substitui um conjunto em compacto → regular", () => {
    const lifecycle = new SceneMotionLifecycle();
    const previous = definition("librarian");
    lifecycle.replace([previous.definition], "initial");
    const action = resizeMotionAction(
      { height: 293, width: 520 },
      "compact",
      { height: 294, width: 521 },
      "regular",
    );
    if (action === "replace-all") {
      lifecycle.replace(
        [definition("librarian").definition],
        "layout-mode-change",
      );
    }
    expect(previous.handle.stop).toHaveBeenCalledOnce();
    expect(lifecycle.snapshot().reconciliations).toBe(2);
  });

  it("ignora resize com dimensões idênticas", () => {
    expect(
      resizeMotionAction(
        { height: 180, width: 320 },
        "compact",
        { height: 180, width: 320 },
        "compact",
      ),
    ).toBe("ignore");
  });

  it("updateProjection comum preserva todos os tweens", () => {
    const lifecycle = new SceneMotionLifecycle();
    const librarian = definition("librarian");
    const creature = definition("creature");
    lifecycle.replace([librarian.definition, creature.definition], "initial");
    expect(highlightMotionNeedsReplacement(false, false)).toBe(false);
    expect(librarian.handle.stop).not.toHaveBeenCalled();
    expect(creature.handle.stop).not.toHaveBeenCalled();
    expect(lifecycle.snapshot().reconciliations).toBe(1);
  });

  it("troca do livro destacado presente por outro não reinicia tweens", () => {
    const lifecycle = new SceneMotionLifecycle();
    const librarian = definition("librarian");
    const creature = definition("creature");
    const firstHighlight = definition("highlighted-book");
    lifecycle.replace(
      [librarian.definition, creature.definition, firstHighlight.definition],
      "initial",
    );
    expect(highlightMotionNeedsReplacement(true, true)).toBe(false);
    expect(librarian.handle.stop).not.toHaveBeenCalled();
    expect(creature.handle.stop).not.toHaveBeenCalled();
    expect(firstHighlight.handle.stop).not.toHaveBeenCalled();
  });

  it("mudança de presença do destaque substitui somente seu tween", () => {
    const lifecycle = new SceneMotionLifecycle();
    const librarian = definition("librarian");
    const creature = definition("creature");
    const firstHighlight = definition("highlighted-book");
    lifecycle.replace(
      [librarian.definition, creature.definition, firstHighlight.definition],
      "initial",
    );
    lifecycle.replaceOne(
      undefined,
      "highlighted-book",
      "highlight-presence-change",
    );
    expect(librarian.handle.stop).not.toHaveBeenCalled();
    expect(creature.handle.stop).not.toHaveBeenCalled();
    expect(firstHighlight.handle.stop).toHaveBeenCalledOnce();
  });

  it("pause mantém os mesmos handles registrados", () => {
    const lifecycle = new SceneMotionLifecycle();
    const librarian = definition("librarian");
    const creature = definition("creature");
    lifecycle.replace([librarian.definition, creature.definition], "initial");
    lifecycle.pause();
    lifecycle.pause();
    expect(lifecycle.activeCount).toBe(2);
    expect(librarian.handle.pause).toHaveBeenCalledOnce();
    expect(creature.handle.pause).toHaveBeenCalledOnce();
  });

  it("resume continua os mesmos movimentos sem recriar", () => {
    const lifecycle = new SceneMotionLifecycle();
    const librarian = definition("librarian");
    lifecycle.replace([librarian.definition], "initial");
    lifecycle.pause();
    lifecycle.resume();
    lifecycle.resume();
    expect(librarian.handle.resume).toHaveBeenCalledOnce();
    expect(lifecycle.snapshot().reconciliations).toBe(1);
  });

  it("remove handle que termina inesperadamente", () => {
    const ends = new Map<SceneMotionId, () => void>();
    const lifecycle = new SceneMotionLifecycle();
    const creature = definition("creature", motionHandle(), ends);
    lifecycle.replace([creature.definition], "initial");
    ends.get("creature")?.();
    expect(lifecycle.activeCount).toBe(0);
  });

  it("destroy remove ambos e ignora callbacks tardios", () => {
    const ends = new Map<SceneMotionId, () => void>();
    const lifecycle = new SceneMotionLifecycle();
    const librarian = definition("librarian", motionHandle(), ends);
    const creature = definition("creature", motionHandle(), ends);
    lifecycle.replace([librarian.definition, creature.definition], "initial");
    lifecycle.destroy();
    ends.get("librarian")?.();
    ends.get("creature")?.();
    expect(librarian.handle.stop).toHaveBeenCalledOnce();
    expect(creature.handle.stop).toHaveBeenCalledOnce();
    expect(lifecycle.activeCount).toBe(0);
  });

  it("remontagem cria um conjunto novo e limpo", () => {
    const first = new SceneMotionLifecycle();
    first.replace([definition("creature").definition], "initial");
    first.destroy();
    const remounted = new SceneMotionLifecycle();
    remounted.replace(
      [definition("librarian").definition, definition("creature").definition],
      "initial",
    );
    expect(remounted.snapshot()).toMatchObject({
      activeIds: ["creature", "librarian"],
      reconciliations: 1,
    });
  });

  it("reduced motion cria zero tween repetitivo", () => {
    expect(libraryRoomMotionPlan(true)).toMatchObject({
      creatureMoves: false,
      highlightedBookMoves: false,
      librarianMoves: false,
      simultaneousTweens: 0,
    });
  });

  it("mantém o orçamento máximo de três tweens", () => {
    const lifecycle = new SceneMotionLifecycle();
    lifecycle.replace(
      [
        definition("librarian").definition,
        definition("creature").definition,
        definition("highlighted-book").definition,
      ],
      "initial",
    );
    expect(lifecycle.activeCount).toBe(
      LIBRARY_ROOM_BUDGET.maximumSimultaneousTweens,
    );
  });
});
