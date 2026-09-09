/// <reference types="node" />

import { readFile } from "node:fs/promises";

import { Mesh } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { describe, expect, it } from "vitest";

import { disposeObjectTree } from "./referenceScene";

describe("fixture GLB técnico da F1-B", () => {
  it("é um arquivo GLB real aceito pelo GLTFLoader instalado", async () => {
    const bytes = await readFile(
      "src/features/library/three/fixtures/f1-technical-pyramid.glb",
    );
    const gltf = await new GLTFLoader().parseAsync(
      Uint8Array.from(bytes).buffer,
      "",
    );

    expect(gltf.scene.name).toBe("F1_technical_fixture");
    expect(gltf.scene.getObjectByName("F1_technical_pyramid")).toBeInstanceOf(
      Mesh,
    );

    disposeObjectTree(gltf.scene);
  });
});
