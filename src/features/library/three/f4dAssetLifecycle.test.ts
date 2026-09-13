/// <reference types="node" />

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import { Group, Mesh, MeshStandardMaterial, Object3D, Scene } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { disposeObjectTree } from "./referenceScene";

const KAYKIT_FILE = "kaykit-shelf-b-large-decorated.glb";
const KAYKIT_HASH =
  "03e0b1af929de0a81795aea965b6cc5fbd8ac6e896e1047acef9f5d93b9debbe";
const F4_B_FIXTURES_DIRECTORY = "src/features/library/three/fixtures/f4-b";

let imageSourceDescriptor: PropertyDescriptor | undefined;

beforeAll(() => {
  // jsdom does not decode the embedded Base Color image. This only permits
  // the installed GLTFLoader to finish its structural parse; it is not a
  // renderer, texture-fidelity, or visual proof.
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

class ExperimentalAssetOwner {
  root: Object3D | null = null;

  constructor(readonly host: Object3D) {}

  accept(root: Object3D): void {
    if (this.root !== null) {
      throw new Error("O owner experimental já possui uma root.");
    }
    this.root = root;
    this.host.add(root);
  }

  unload(): void {
    const root = this.root;
    this.root = null;
    if (root) disposeObjectTree(root);
  }
}

async function loadKayKit(): Promise<Object3D> {
  const bytes = await readFile(`${F4_B_FIXTURES_DIRECTORY}/${KAYKIT_FILE}`);
  expect(createHash("sha256").update(bytes).digest("hex")).toBe(KAYKIT_HASH);

  const gltf = await new GLTFLoader().parseAsync(
    Uint8Array.from(bytes).buffer,
    "",
  );
  return gltf.scene;
}

function findKayKitMesh(root: Object3D): Mesh {
  const meshes: Mesh[] = [];
  root.traverse((object) => {
    if (object instanceof Mesh) meshes.push(object);
  });

  expect(meshes).toHaveLength(1);
  const mesh = meshes[0];
  if (!mesh) throw new Error("O fixture KayKit não contém mesh.");
  return mesh;
}

function observeKayKitDisposal(root: Object3D): {
  readonly geometry: { count: number };
  readonly material: { count: number };
  readonly texture: { count: number };
} {
  const mesh = findKayKitMesh(root);
  const material = mesh.material;
  expect(material).not.toBeInstanceOf(Array);
  expect(material).toBeInstanceOf(MeshStandardMaterial);
  if (Array.isArray(material) || !(material instanceof MeshStandardMaterial)) {
    throw new Error("O fixture KayKit não possui o material esperado.");
  }

  const texture = material.map;
  expect(texture).not.toBeNull();
  if (!texture) throw new Error("O fixture KayKit não possui Base Color map.");

  const geometry = { count: 0 };
  const materialDisposals = { count: 0 };
  const textureDisposals = { count: 0 };
  mesh.geometry.addEventListener("dispose", () => (geometry.count += 1));
  material.addEventListener("dispose", () => (materialDisposals.count += 1));
  texture.addEventListener("dispose", () => (textureDisposals.count += 1));

  return { geometry, material: materialDisposals, texture: textureDisposals };
}

describe("F4-D2 — lifecycle experimental de asset com host vivo", () => {
  it("carrega, anexa e descarrega KayKit sem destruir o host", async () => {
    const host = new Scene();
    const originalHost = host;
    const sentinel = new Group();
    host.add(sentinel);
    const owner = new ExperimentalAssetOwner(host);
    const root = await loadKayKit();
    const disposals = observeKayKitDisposal(root);

    expect(owner.root).toBeNull();
    owner.accept(root);

    expect(owner.root).toBe(root);
    expect(root.parent).toBe(host);
    expect(host.children).toContain(root);
    expect(host.children).toContain(sentinel);
    expect(findKayKitMesh(root)).toBeInstanceOf(Mesh);

    owner.unload();

    expect(owner.root).toBeNull();
    expect(root.parent).toBeNull();
    expect(owner.host).toBe(originalHost);
    expect(host.children).not.toContain(root);
    expect(host.children).toContain(sentinel);
    expect(disposals.geometry.count).toBe(1);
    expect(disposals.material.count).toBe(1);
    expect(disposals.texture.count).toBe(1);
  });

  it("aceita uma nova root real no mesmo host depois do unload", async () => {
    const host = new Scene();
    const originalHost = host;
    const sentinel = new Group();
    host.add(sentinel);
    const owner = new ExperimentalAssetOwner(host);
    const firstRoot = await loadKayKit();

    owner.accept(firstRoot);
    owner.unload();

    const secondRoot = await loadKayKit();
    try {
      expect(secondRoot).not.toBe(firstRoot);
      expect(owner.root).toBeNull();
      owner.accept(secondRoot);

      expect(owner.root).toBe(secondRoot);
      expect(owner.host).toBe(originalHost);
      expect(secondRoot.parent).toBe(host);
      expect(host.children).toContain(secondRoot);
      expect(host.children).toContain(sentinel);
    } finally {
      owner.unload();
    }
  });
});
