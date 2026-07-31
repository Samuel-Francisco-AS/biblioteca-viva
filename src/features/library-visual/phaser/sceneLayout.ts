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
  readonly compactCounterLabel: SceneTextPlacement | null;
  readonly counter: SceneRectangle;
  readonly creature: SceneCircle;
  readonly creatureLabel: SceneTextPlacement | null;
  readonly header: {
    readonly completed: SceneTextPlacement;
    readonly title: SceneTextPlacement;
    readonly totalAndInProgress: SceneTextPlacement;
  };
  readonly highlightedBook: SceneTextPlacement;
  readonly highlightedBookDetail: SceneTextPlacement | null;
  readonly highlightedBookMaximumLength: number;
  readonly librarian: SceneCircle;
  readonly librarianLabel: SceneTextPlacement | null;
  readonly milestoneMarker: SceneRectangle;
  readonly mode: LibrarySceneLayoutMode;
  readonly shelf: SceneRectangle;
  readonly shelfLabel: SceneTextPlacement;
  readonly wallHeight: number;
}

const COMPACT = {
  characterBaselineOffset: 20,
  counterHeight: 36,
  counterWidth: 74,
  margin: 12,
  minimumShelfHeight: 52,
  recentTitleMaximumLength: 18,
  shelfTop: 76,
} as const;

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

function compactLayout({ height, width }: SceneLayoutSize): LibrarySceneLayout {
  const margin = COMPACT.margin;
  const counter: SceneRectangle = {
    height: COMPACT.counterHeight,
    width: COMPACT.counterWidth,
    x: width - margin - COMPACT.counterWidth,
    y: height - margin - COMPACT.counterHeight,
  };
  const shelfHeight = Math.max(
    COMPACT.minimumShelfHeight,
    Math.min(64, Math.round(height * 0.28)),
  );
  const shelf: SceneRectangle = {
    height: shelfHeight,
    width: width - margin * 2,
    x: margin,
    y: COMPACT.shelfTop,
  };
  const characterY = height - COMPACT.characterBaselineOffset;
  const fontSize = 13;
  const highlightedBookMaxWidth = counter.x - margin - 20;

  return {
    compactCounterLabel: textPlacement(counter.x + 8, counter.y + 17, 12, 50),
    counter,
    creature: { radius: 12, x: counter.x - 21, y: characterY },
    creatureLabel: null,
    header: {
      completed: textPlacement(margin, 42, 12, width - margin * 2),
      title: textPlacement(margin, 5, 14, width - margin * 2),
      totalAndInProgress: textPlacement(margin, 25, 12, width - margin * 2),
    },
    highlightedBook: textPlacement(
      margin,
      shelf.y + shelf.height + 7,
      fontSize,
      highlightedBookMaxWidth,
    ),
    highlightedBookDetail: null,
    highlightedBookMaximumLength: Math.max(
      10,
      Math.min(
        COMPACT.recentTitleMaximumLength,
        Math.floor((highlightedBookMaxWidth - 58) / 7),
      ),
    ),
    librarian: { radius: 10, x: counter.x - 48, y: characterY },
    librarianLabel: null,
    milestoneMarker: {
      height: 12,
      width: 12,
      x: counter.x + counter.width - 16,
      y: counter.y + 4,
    },
    mode: "compact",
    shelf,
    shelfLabel: textPlacement(margin, 60, 11, width - margin * 2),
    wallHeight: 60,
  };
}

function regularLayout({ height, width }: SceneLayoutSize): LibrarySceneLayout {
  const margin = Math.max(20, Math.round(width * 0.04));
  const wallHeight = Math.round(height * 0.16);
  const shelf: SceneRectangle = {
    height: Math.round(height * 0.42),
    width: Math.round(width * 0.26),
    x: margin,
    y: wallHeight + margin,
  };
  const counter: SceneRectangle = {
    height: Math.round(height * 0.12),
    width: Math.round(width * 0.32),
    x: width - margin - Math.round(width * 0.32),
    y: height - margin - Math.round(height * 0.12),
  };
  const fontSize = Math.max(12, Math.round(width / 55));

  return {
    compactCounterLabel: null,
    counter,
    creature: {
      radius: Math.max(14, width * 0.03),
      x: width * 0.55,
      y: height * 0.62,
    },
    creatureLabel: textPlacement(
      width * 0.49,
      height * 0.7,
      fontSize,
      width * 0.2,
    ),
    header: {
      completed: textPlacement(
        margin,
        Math.max(38, wallHeight * 0.72),
        fontSize,
        width * 0.42,
      ),
      title: textPlacement(
        margin,
        Math.max(8, wallHeight * 0.16),
        fontSize,
        width * 0.42,
      ),
      totalAndInProgress: textPlacement(
        margin,
        Math.max(23, wallHeight * 0.44),
        fontSize,
        width * 0.42,
      ),
    },
    highlightedBook: textPlacement(
      width * 0.48,
      wallHeight + margin,
      fontSize,
      width * 0.44,
    ),
    highlightedBookDetail: textPlacement(
      width * 0.48,
      wallHeight + margin + fontSize + 8,
      fontSize,
      width * 0.44,
    ),
    highlightedBookMaximumLength: 28,
    librarian: {
      radius: Math.max(12, width * 0.025),
      x: width - margin - counter.width * 0.72,
      y: counter.y - Math.max(18, height * 0.05),
    },
    librarianLabel: textPlacement(
      width - margin - counter.width * 0.92,
      counter.y - Math.max(55, height * 0.12),
      fontSize,
      counter.width,
    ),
    milestoneMarker: {
      height: fontSize,
      width: width * 0.24,
      x: width * 0.48,
      y: height * 0.82,
    },
    mode: "regular",
    shelf,
    shelfLabel: textPlacement(
      margin,
      shelf.y - fontSize - 4,
      fontSize,
      shelf.width,
    ),
    wallHeight,
  };
}

function textPlacement(
  x: number,
  y: number,
  fontSize: number,
  maxWidth: number,
): SceneTextPlacement {
  return { fontSize, maxWidth, x, y };
}
