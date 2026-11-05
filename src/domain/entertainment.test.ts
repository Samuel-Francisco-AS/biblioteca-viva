import { expect, it } from "vitest";
import { createMovie, createSeries } from "./libraryEntries";
import {
  catalogSchema,
  entertainmentFormat,
  isWishlisted,
  releaseDays,
  watchState,
  statusForWatch,
  catalogForWatch,
} from "./entertainment";
import { deriveCollection } from "../features/collection/collectionControls";
import { projectLibraryWorldEntries } from "../features/library/libraryWorldEntries";
const now = "2026-11-04T12:00:00.000Z";
const movie = createMovie({ id: "m", title: "Aurora", createdAt: now });
const series = createSeries({
  id: "s",
  title: "Constelações",
  createdAt: now,
  episodesWatched: 3,
  totalEpisodes: 12,
});
it("legacy entries retain formats and wishlist fallback without mutation", () => {
  expect(entertainmentFormat(movie)).toBe("film");
  expect(entertainmentFormat(series)).toBe("series");
  expect(isWishlisted(movie)).toBe(true);
  expect(movie).not.toHaveProperty("catalog");
  expect(watchState(series)).toBe("watching");
  expect(isWishlisted({ ...movie, catalog: { wishlist: false } })).toBe(false);
});
it.each([
  ["2026-11-16", "2026-11-04", 12],
  ["2026-11-04", "2026-11-04", 0],
  ["2026-11-03", "2026-11-04", -1],
  ["2028-03-01", "2028-02-28", 2],
  ["2026-03-09", "2026-03-08", 1],
])("civil countdown %s from %s is %s", (date, today, days) =>
  expect(releaseDays(date, today)).toBe(days),
);
it("rejects impossible dates, unknown keys, duplicate and out-of-range seasons", () => {
  expect(releaseDays("2026-02-30", "2026-01-01")).toBeUndefined();
  for (const value of [
    { releaseDate: "2026-02-30" },
    { remoteUrl: "https://example.org" },
    { completedSeasons: [1, 1] },
    { seasonCount: 2, completedSeasons: [3] },
  ])
    expect(catalogSchema.safeParse(value).success).toBe(false);
});
it("maps scoped expectations onto existing statuses without stale intent overriding completion", () => {
  expect(statusForWatch("release")).toBe("planned");
  expect(statusForWatch("rewatching")).toBe("in_progress");
  const catalog = catalogForWatch({ wishlist: true }, "rewatching");
  expect(watchState({ ...movie, status: "completed", catalog })).toBe(
    "completed",
  );
});
it("groups six technical types into visual entertainment and intersects lists without duplicating", () => {
  const anime = {
    ...series,
    catalog: {
      format: "anime" as const,
      wishlist: true,
      releaseDate: "2026-11-16",
      genre: "Fantasia",
    },
    favorite: true,
  };
  const list = [movie, anime];
  const filter = (name: string) =>
    deriveCollection(
      list,
      "",
      "all",
      "title",
      "entertainment",
      false,
      new Map(),
      "all",
      name,
      "2026-11-04",
    );
  expect(filter("all")).toHaveLength(2);
  expect(filter("anime")).toEqual([anime]);
  for (const name of ["wishlist", "favorites", "releases", "watching"])
    expect(filter(name)).toContainEqual(anime);
  expect(
    deriveCollection(list, "fantasia", "all", "recent", "entertainment"),
  ).toEqual([anime]);
  expect(deriveCollection(list, "", "all", "title", "movie")).toEqual([movie]);
});
it("catalog metadata does not change movie/series snapshot identities, slots or model contracts", () => {
  const before = projectLibraryWorldEntries([movie, series]);
  const after = projectLibraryWorldEntries([
    {
      ...movie,
      catalog: {
        format: "animation",
        wishlist: true,
        releaseDate: "2026-11-16",
      },
    },
    { ...series, catalog: { format: "anime", rating: 5 } },
  ]);
  expect(after).toEqual(before);
});
