import { expect, it } from "vitest";
import {
  Group,
  Mesh,
  MeshStandardMaterial,
  MeshBasicMaterial,
  ShaderChunk,
} from "three";
import {
  boundedPointLightChunk,
  createBoundedPointLighting,
} from "./boundedPointLighting";
it("guards the actual Three point-light loop and preserves spot/directional/area/indirect shaders", () => {
  const bounded = boundedPointLightChunk();
  expect(bounded).toContain(
    "dot(bvPointVector, bvPointVector) < pointLight.distance * pointLight.distance",
  );
  expect(bounded).toContain("pointLight.distance <= 0.0");
  expect(bounded.slice(bounded.indexOf("#if ( NUM_SPOT_LIGHTS"))).toBe(
    ShaderChunk.lights_fragment_begin.slice(
      ShaderChunk.lights_fragment_begin.indexOf("#if ( NUM_SPOT_LIGHTS"),
    ),
  );
  expect(bounded.indexOf("if (any")).toBeLessThan(
    bounded.indexOf("getPointLightInfo("),
  );
  expect(() => boundedPointLightChunk("changed upstream chunk")).toThrow(
    "Unsupported Three",
  );
});
it("owns per-runtime shader policy without touching global chunks, geometry or basic/emissive cores", () => {
  const original = ShaderChunk.lights_fragment_begin;
  const controller = createBoundedPointLighting(),
    other = createBoundedPointLighting();
  const root = new Group(),
    mat = new MeshStandardMaterial(),
    basic = new MeshBasicMaterial();
  root.add(
    new Mesh(undefined, mat),
    new Mesh(undefined, mat),
    new Mesh(undefined, basic),
  );
  const basicKey = basic.customProgramCacheKey();
  controller.apply(root);
  const version = mat.version,
    key = mat.customProgramCacheKey();
  controller.apply(root);
  expect(mat.version).toBe(version);
  controller.setEnabled(false, root);
  expect(mat.customProgramCacheKey()).not.toBe(key);
  controller.setEnabled(true, root);
  expect(mat.customProgramCacheKey()).toBe(key);
  const another = new MeshStandardMaterial(),
    tree = new Mesh(undefined, another);
  other.apply(tree);
  const otherKey = another.customProgramCacheKey();
  controller.setEnabled(false, root);
  expect(another.customProgramCacheKey()).toBe(otherKey);
  expect(basic.customProgramCacheKey()).toBe(basicKey);
  expect(ShaderChunk.lights_fragment_begin).toBe(original);
  mat.dispose();
  basic.dispose();
  another.dispose();
});
