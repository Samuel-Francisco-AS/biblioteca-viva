import {
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Texture,
} from "three";
import { describe, expect, it } from "vitest";

import { collectSceneTextureMetrics } from "./sceneTextureMetrics";

describe("collectSceneTextureMetrics", () => {
  it("separa referências de maps de objetos Texture únicos", () => {
    const sharedMetallicRoughness = new Texture();
    const material = new MeshStandardMaterial({
      map: new Texture(),
      normalMap: new Texture(),
      metalnessMap: sharedMetallicRoughness,
      roughnessMap: sharedMetallicRoughness,
    });
    const root = new Group();
    root.add(new Mesh(new PlaneGeometry(), material));

    expect(collectSceneTextureMetrics(root)).toEqual({
      materialTextureReferences: 4,
      uniqueMaterialTextures: 3,
    });
  });
});
