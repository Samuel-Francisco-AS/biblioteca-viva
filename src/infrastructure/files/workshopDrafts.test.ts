// @vitest-environment jsdom

import { afterEach, expect, it } from "vitest";

import { BrowserWorkshopDrafts } from "./workshopDrafts";

afterEach(() => {
  localStorage.clear();
});

it("isolates new-generation drafts from the previous database identity", () => {
  const legacy = new BrowserWorkshopDrafts("biblioteca-viva");
  const current = new BrowserWorkshopDrafts("biblioteca-viva-bf57");

  legacy.write("card-1", "draft legado");
  expect(current.read("card-1")).toBeUndefined();

  current.write("card-1", "draft novo");
  expect(current.read("card-1")).toBe("draft novo");
  expect(legacy.read("card-1")).toBe("draft legado");
});
