import { expect, it } from "vitest";
import { InhabitantAgency } from "./inhabitantAgency";
import {
  EMPTY_AGENCY_ENVIRONMENT,
  type AgencyEnvironment,
} from "./inhabitantEnvironment";
import { InhabitantNavigation, distance } from "./inhabitantNavigation";

it("uses the supplied physical snapshot throughout motion, then observes removal on the next update", () => {
  let now = 0;
  const agency = new InhabitantAgency(new InhabitantNavigation([]), {
    now: () => now,
    seed: 51,
  });
  agency.setAvailable("character:aryn", true);
  agency.setMode("running");
  const step = (environment = EMPTY_AGENCY_ENVIRONMENT) => {
    now += 100;
    agency.update(environment);
  };
  for (
    let i = 0;
    i < 80 && !agency.getPoses().some((p) => p.state === "navigate");
    i++
  )
    step();
  const before = agency.getPoses().find((p) => p.key === "aryn")!;
  expect(before.state).toBe("navigate");
  const blocked: AgencyEnvironment = Object.freeze({
    ...EMPTY_AGENCY_ENVIRONMENT,
    physicalObstacles: Object.freeze([
      Object.freeze({
        id: "temporary-book",
        minX: -50,
        maxX: 50,
        minZ: -50,
        maxZ: 50,
      }),
    ]),
  });
  for (let i = 0; i < 10; i++) step(blocked);
  expect(
    distance(
      before,
      agency.getPoses().find((p) => p.key === "aryn")!,
    ),
  ).toBe(0);
  step();
  expect(
    distance(
      before,
      agency.getPoses().find((p) => p.key === "aryn")!,
    ),
  ).toBeGreaterThan(0);
  expect(blocked.physicalObstacles).toHaveLength(1);
  agency.dispose();
});
