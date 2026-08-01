import { LIBRARY_ROOM_INTERACTION } from "./roomConfig";

export const COMPACT_LIBRARY_SCENE_MAX_WIDTH = 520;

export type LibrarySceneLayoutMode = "compact" | "regular";

export interface SceneCircle {
  readonly radius: number;
  readonly x: number;
  readonly y: number;
}

export interface SceneLayoutSize {
  readonly height: number;
  readonly width: number;
}

export interface SceneRectangle {
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

export interface SceneTextPlacement {
  readonly fontSize: number;
  readonly maxWidth: number;
  readonly x: number;
  readonly y: number;
}

export interface LibrarySceneLayout {
  readonly counter: SceneRectangle;
  readonly creature: SceneCircle;
  readonly creatureHitArea: SceneRectangle;
  readonly creatureMovementBounds: SceneRectangle;
  readonly header: {
    readonly completed: SceneTextPlacement;
    readonly title: SceneTextPlacement;
    readonly totalAndInProgress: SceneTextPlacement;
  };
  readonly highlightedBook: SceneRectangle;
  readonly highlightedBookHitArea: SceneRectangle;
  readonly highlightedBookLabel: SceneTextPlacement | null;
  readonly highlightedBookMaximumLength: number;
  readonly librarian: SceneCircle;
  readonly librarianHitArea: SceneRectangle;
  readonly lightAreas: readonly SceneCircle[];
  readonly milestoneMarker: SceneRectangle;
  readonly mode: LibrarySceneLayoutMode;
  readonly shelf: SceneRectangle;
  readonly shelfHitArea: SceneRectangle;
  readonly shelfLabel: SceneTextPlacement;
  readonly wallHeight: number;
}

export function librarySceneLayout(size: SceneLayoutSize): LibrarySceneLayout {
  return librarySceneLayoutMode(size.width) === "compact"
    ? compactLayout(size)
    : regularLayout(size);
}

export function librarySceneLayoutMode(width: number): LibrarySceneLayoutMode {
  return width <= COMPACT_LIBRARY_SCENE_MAX_WIDTH ? "compact" : "regular";
}

export function sceneRectanglesOverlap(
  first: SceneRectangle,
  second: SceneRectangle,
): boolean {
  return (
    first.x < second.x + second.width &&
    first.x + first.width > second.x &&
    first.y < second.y + second.height &&
    first.y + first.height > second.y
  );
}

export function sceneRectangleContains(
  outer: SceneRectangle,
  inner: SceneRectangle,
): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

function compactLayout({ height, width }: SceneLayoutSize): LibrarySceneLayout {
  const margin = 12;
  const wallHeight = 56;
  const shelf: SceneRectangle = {
    height: Math.max(50, Math.min(58, height - 104)),
    width: Math.max(116, Math.round(width * 0.46)),
    x: margin,
    y: 64,
  };
  const counter: SceneRectangle = {
    height: 34,
    width: Math.max(72, Math.round(width * 0.28)),
    x: width - margin - Math.max(72, Math.round(width * 0.28)),
    y: height - 42,
  };
  const librarian = {
    radius: 10,
    x: counter.x - 26,
    y: Math.max(82, counter.y - 28),
  };
  const creatureMovementBounds: SceneRectangle = {
    height: 20,
    width: Math.max(18, counter.x - shelf.x - shelf.width - 12),
    x: shelf.x + shelf.width + 6,
    y: height - 36,
  };
  const creatureRadius = 9;
  const creature = {
    radius: creatureRadius,
    x: creatureMovementBounds.x + creatureRadius,
    y: creatureMovementBounds.y + creatureMovementBounds.height / 2,
  };
  const highlightedBook: SceneRectangle = {
    height: 15,
    width: 26,
    x: counter.x + counter.width * 0.5 - 13,
    y: counter.y - 13,
  };

  return {
    counter,
    creature,
    creatureHitArea: centeredHitArea(creature.x, creature.y),
    creatureMovementBounds,
    header: {
      completed: textPlacement(margin, 39, 11, width - margin * 2),
      title: textPlacement(margin, 4, 14, width - margin * 2),
      totalAndInProgress: textPlacement(margin, 22, 11, width - margin * 2),
    },
    highlightedBook,
    highlightedBookHitArea: centeredHitArea(
      highlightedBook.x + highlightedBook.width / 2,
      highlightedBook.y + highlightedBook.height / 2,
    ),
    highlightedBookLabel: null,
    highlightedBookMaximumLength: 16,
    librarian,
    librarianHitArea: centeredHitArea(librarian.x, librarian.y),
    lightAreas: [
      { radius: Math.max(44, width * 0.18), x: width * 0.72, y: height * 0.55 },
    ],
    milestoneMarker: {
      height: 10,
      width: 10,
      x: shelf.x + shelf.width - 16,
      y: shelf.y + 6,
    },
    mode: "compact",
    shelf,
    shelfHitArea: shelf,
    shelfLabel: textPlacement(margin + 5, shelf.y + 4, 11, shelf.width - 10),
    wallHeight,
  };
}

function regularLayout({ height, width }: SceneLayoutSize): LibrarySceneLayout {
  const margin = Math.max(20, Math.round(width * 0.04));
  const wallHeight = Math.max(66, Math.round(height * 0.16));
  const shelf: SceneRectangle = {
    height: Math.round(height * 0.48),
    width: Math.round(width * 0.27),
    x: margin,
    y: wallHeight + margin,
  };
  const counter: SceneRectangle = {
    height: Math.round(height * 0.16),
    width: Math.round(width * 0.32),
    x: width - margin - Math.round(width * 0.32),
    y: height - margin - Math.round(height * 0.16),
  };
  const librarian = {
    radius: Math.max(15, width * 0.025),
    x: counter.x + counter.width * 0.28,
    y: counter.y - Math.max(26, height * 0.075),
  };
  const creatureMovementBounds: SceneRectangle = {
    height: Math.max(34, height * 0.09),
    width: Math.max(80, counter.x - shelf.x - shelf.width - margin * 1.5),
    x: shelf.x + shelf.width + margin * 0.75,
    y: height * 0.64,
  };
  const creatureRadius = Math.max(13, width * 0.022);
  const creature = {
    radius: creatureRadius,
    x: creatureMovementBounds.x + creatureRadius,
    y: creatureMovementBounds.y + creatureMovementBounds.height / 2,
  };
  const highlightedBook: SceneRectangle = {
    height: Math.max(18, height * 0.045),
    width: Math.max(32, width * 0.055),
    x: counter.x + counter.width * 0.62,
    y: counter.y - Math.max(15, height * 0.035),
  };
  const fontSize = Math.max(12, Math.round(width / 55));

  return {
    counter,
    creature,
    creatureHitArea: centeredHitArea(creature.x, creature.y),
    creatureMovementBounds,
    header: {
      completed: textPlacement(
        margin,
        wallHeight * 0.68,
        fontSize,
        width * 0.42,
      ),
      title: textPlacement(
        margin,
        wallHeight * 0.12,
        fontSize + 2,
        width * 0.42,
      ),
      totalAndInProgress: textPlacement(
        margin,
        wallHeight * 0.4,
        fontSize,
        width * 0.42,
      ),
    },
    highlightedBook,
    highlightedBookHitArea: centeredHitArea(
      highlightedBook.x + highlightedBook.width / 2,
      highlightedBook.y + highlightedBook.height / 2,
    ),
    highlightedBookLabel: textPlacement(
      width * 0.47,
      wallHeight + margin,
      fontSize,
      width * 0.46,
    ),
    highlightedBookMaximumLength: 28,
    librarian,
    librarianHitArea: centeredHitArea(librarian.x, librarian.y),
    lightAreas: [
      { radius: width * 0.16, x: width * 0.58, y: height * 0.5 },
      {
        radius: width * 0.11,
        x: counter.x + counter.width * 0.5,
        y: counter.y,
      },
    ],
    milestoneMarker: {
      height: Math.max(12, fontSize),
      width: Math.max(12, fontSize),
      x: shelf.x + shelf.width - fontSize * 1.5,
      y: shelf.y + fontSize,
    },
    mode: "regular",
    shelf,
    shelfHitArea: shelf,
    shelfLabel: textPlacement(
      margin,
      shelf.y - fontSize - 5,
      fontSize,
      shelf.width,
    ),
    wallHeight,
  };
}

function centeredHitArea(x: number, y: number): SceneRectangle {
  const size = LIBRARY_ROOM_INTERACTION.minimumTargetSize;
  return { height: size, width: size, x: x - size / 2, y: y - size / 2 };
}

function textPlacement(
  x: number,
  y: number,
  fontSize: number,
  maxWidth: number,
): SceneTextPlacement {
  return { fontSize, maxWidth, x, y };
}
