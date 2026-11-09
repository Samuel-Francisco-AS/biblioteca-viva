import fs from "node:fs";
import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import { officialCards } from "../../domain/duel/catalogue";
import { duelArtUrl } from "./duelArt";
import manifest from "../../../assets/duel/source/refinement/manifest.json";
it("resolves all 48 painted assets with exact hashes without changing card identities or author fallbacks", () => {
  expect(manifest.illustrations).toHaveLength(48);
  for (const c of officialCards) {
    if (c.content.type !== "combat" || !c.content.combat)
      throw new Error("Combat fixture missing");
    const id = c.content.combat.artId,
      entry = manifest.illustrations.find((a) => a.id === id);
    expect(entry).toBeDefined();
    const url = duelArtUrl(id);
    expect(url).toBe(`/assets/duel/painted/${id}.webp`);
    const data = fs.readFileSync(`public${url}`);
    expect(createHash("sha256").update(data).digest("hex")).toBe(entry!.sha256);
    expect(data.toString("ascii", 8, 12)).toBe("WEBP");
    expect(fs.existsSync(`public/assets/duel/${id}.svg`)).toBe(true);
  }
  expect(new Set(manifest.illustrations.map((a) => a.sha256)).size).toBe(48);
  expect(duelArtUrl("author-crest")).toBe("/assets/duel/author-crest.svg");
});
