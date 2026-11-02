import {
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  Vector3,
} from "three";
import { describe, expect, it } from "vitest";
import {
  findExpandedLivingTap,
  SMALL_LIVING_TAP_RADIUS_PX,
} from "./smallLivingTapTargets";

function setup() {
  const camera = new OrthographicCamera(-5, 5, 5, -5, 0.1, 100);
  camera.position.set(0, 10, 10);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);
  const book = new Group();
  book.add(new Mesh(new BoxGeometry(0.1, 0.03, 0.1), new MeshBasicMaterial()));
  book.updateMatrixWorld(true);
  const roots = new Map([["living:book", book]]);
  const bounds = { left: 30, top: 80, width: 400, height: 400 };
  const center = new Vector3(0, 0, 0).project(camera);
  const pointer = {
    x: bounds.left + ((center.x + 1) * bounds.width) / 2,
    y: bounds.top + ((1 - center.y) * bounds.height) / 2,
  };
  return { bounds, camera, pointer, roots };
}

describe("small living tap targets", () => {
  it("accepts nearby taps outside the tiny visible mesh", () => {
    const { bounds, camera, pointer, roots } = setup();
    expect(
      findExpandedLivingTap(roots, camera, bounds, {
        x: pointer.x + SMALL_LIVING_TAP_RADIUS_PX - 2,
        y: pointer.y,
      }),
    ).toBe("living:book");
  });

  it("ignores distant taps and conventional record IDs", () => {
    const { bounds, camera, pointer, roots } = setup();
    expect(
      findExpandedLivingTap(roots, camera, bounds, {
        x: pointer.x + SMALL_LIVING_TAP_RADIUS_PX + 5,
        y: pointer.y,
      }),
    ).toBeUndefined();
    roots.delete("living:book");
    roots.set("reading-shelf-01", new Group());
    expect(
      findExpandedLivingTap(roots, camera, bounds, pointer),
    ).toBeUndefined();
  });

  it("ignores props outside the visible viewport", () => {
    const { bounds, camera, pointer, roots } = setup();
    roots.get("living:book")?.position.set(100, 0, 0);
    roots.get("living:book")?.updateMatrixWorld(true);
    expect(
      findExpandedLivingTap(roots, camera, bounds, pointer),
    ).toBeUndefined();
  });

  it("supports the pergaminho and decorative book independently", () => {
    const { bounds, camera, pointer, roots } = setup();
    const book = roots.get("living:book");
    if (!book) throw new Error("Missing book");
    roots.delete("living:book");
    roots.set("living:table", book);
    expect(findExpandedLivingTap(roots, camera, bounds, pointer)).toBe(
      "living:table",
    );
  });
});
