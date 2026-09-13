/// <reference types="node" />

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import { Mesh, MeshStandardMaterial } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { disposeObjectTree } from "./referenceScene";

const F4_B_FIXTURES_DIRECTORY = "src/features/library/three/fixtures/f4-b";

let imageSourceDescriptor: PropertyDescriptor | undefined;

beforeAll(() => {
  // jsdom does not decode the fixtures' embedded images. This only lets the
  // installed GLTFLoader complete its structural parse; it does not simulate
  // rendering, image fidelity, colour management, or visual UV orientation.
  imageSourceDescriptor = Object.getOwnPropertyDescriptor(
    HTMLImageElement.prototype,
    "src",
  );
  Object.defineProperty(HTMLImageElement.prototype, "src", {
    configurable: true,
    get(this: HTMLImageElement): string {
      return imageSourceDescriptor?.get?.call(this) ?? "";
    },
    set(this: HTMLImageElement, _value: string): void {
      queueMicrotask(() => this.dispatchEvent(new Event("load")));
    },
  });
});

afterAll(() => {
  if (imageSourceDescriptor) {
    Object.defineProperty(
      HTMLImageElement.prototype,
      "src",
      imageSourceDescriptor,
    );
  }
});

async function loadFixture(fileName: string, hash: string) {
  const bytes = await readFile(`${F4_B_FIXTURES_DIRECTORY}/${fileName}`);
  expect(createHash("sha256").update(bytes).digest("hex")).toBe(hash);

  return new GLTFLoader().parseAsync(Uint8Array.from(bytes).buffer, "");
}

function findSingleMesh(scene: {
  traverse(callback: (object: unknown) => void): void;
}): Mesh {
  const meshes: Mesh[] = [];
  scene.traverse((object) => {
    if (object instanceof Mesh) meshes.push(object);
  });

  expect(meshes).toHaveLength(1);
  return meshes[0];
}

function expectStandardMaterial(mesh: Mesh): MeshStandardMaterial {
  const material = mesh.material;
  expect(material).not.toBeInstanceOf(Array);
  expect(material).toBeInstanceOf(MeshStandardMaterial);

  if (Array.isArray(material) || !(material instanceof MeshStandardMaterial)) {
    throw new Error("A fixture F4-C requer um único MeshStandardMaterial.");
  }

  return material;
}

function expectColor(
  material: MeshStandardMaterial,
  expected: readonly [number, number, number],
): void {
  expect(material.color.r).toBeCloseTo(expected[0], 6);
  expect(material.color.g).toBeCloseTo(expected[1], 6);
  expect(material.color.b).toBeCloseTo(expected[2], 6);
}

function expectNoTextureMaps(material: MeshStandardMaterial): void {
  expect(material.map).toBeNull();
  expect(material.alphaMap).toBeNull();
  expect(material.aoMap).toBeNull();
  expect(material.bumpMap).toBeNull();
  expect(material.displacementMap).toBeNull();
  expect(material.emissiveMap).toBeNull();
  expect(material.normalMap).toBeNull();
  expect(material.metalnessMap).toBeNull();
  expect(material.roughnessMap).toBeNull();
}

describe("F4-C3 — contrato experimental de materiais no GLTFLoader instalado", () => {
  it("KayKit preserva Base Color texturizado e UV sem ajuste pós-parse", async () => {
    const gltf = await loadFixture(
      "kaykit-shelf-b-large-decorated.glb",
      "03e0b1af929de0a81795aea965b6cc5fbd8ac6e896e1047acef9f5d93b9debbe",
    );

    try {
      const mesh = findSingleMesh(gltf.scene);
      const material = expectStandardMaterial(mesh);

      expect(mesh.geometry.getAttribute("uv")).toBeDefined();
      expect(material.map).not.toBeNull();
      expectColor(material, [1, 1, 1]);
      expect(material.roughness).toBeCloseTo(0.5, 6);
      expect(material.metalness).toBe(0);
    } finally {
      disposeObjectTree(gltf.scene);
    }
  });

  it("Kenney preserva material por fatores sem exigir textura", async () => {
    const gltf = await loadFixture(
      "kenney-bookcase-open.glb",
      "6704751f18b91a68ad9689c24ea59e029c09d584264b7f089439e79683c71900",
    );

    try {
      const mesh = findSingleMesh(gltf.scene);
      const material = expectStandardMaterial(mesh);

      expect(mesh.geometry.getAttribute("uv")).toBeDefined();
      expectNoTextureMaps(material);
      expectColor(material, [0.8962264, 0.6015712, 0.3931559]);
      expect(material.roughness).toBe(1);
      expect(material.metalness).toBe(0);
    } finally {
      disposeObjectTree(gltf.scene);
    }
  });

  it("Poly Haven preserva maps PBR e compartilha metallic-roughness", async () => {
    const gltf = await loadFixture(
      "polyhaven-shelf-01.glb",
      "33d55c107ea5afd314aad197f7753c64bacc88ea554df3f7e57fc8e7c81415b1",
    );

    try {
      const mesh = findSingleMesh(gltf.scene);
      const material = expectStandardMaterial(mesh);

      expect(mesh.geometry.getAttribute("uv")).toBeDefined();
      expect(material.map).not.toBeNull();
      expect(material.normalMap).not.toBeNull();
      expect(material.metalnessMap).not.toBeNull();
      expect(material.roughnessMap).toBe(material.metalnessMap);
      expectColor(material, [1, 1, 1]);
      expect(material.roughness).toBe(1);
      expect(material.metalness).toBe(1);
    } finally {
      disposeObjectTree(gltf.scene);
    }
  });

  it("Quaternius preserva material por fatores sem textura ou UV", async () => {
    const gltf = await loadFixture(
      "quaternius-bookshelf.glb",
      "aabe7de0adf6b0e3aaf651acbb5704680e44df3180ffa98aa0cb7d19d389f265",
    );

    try {
      const mesh = findSingleMesh(gltf.scene);
      const material = expectStandardMaterial(mesh);

      expect(mesh.geometry.getAttribute("uv")).toBeUndefined();
      expectNoTextureMaps(material);
      expectColor(material, [0.4479754, 0.44329065, 0.42940849]);
      expect(material.roughness).toBeCloseTo(0.5, 6);
      expect(material.metalness).toBe(0);
    } finally {
      disposeObjectTree(gltf.scene);
    }
  });
});
