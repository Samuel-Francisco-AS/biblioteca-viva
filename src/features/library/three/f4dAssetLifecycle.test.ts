/// <reference types="node" />

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import {
  BufferGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Scene,
  Texture,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { disposeObjectTree } from "./referenceScene";

const KAYKIT_FILE = "kaykit-shelf-b-large-decorated.glb";
const KAYKIT_HASH =
  "03e0b1af929de0a81795aea965b6cc5fbd8ac6e896e1047acef9f5d93b9debbe";
const KENNEY_FILE = "kenney-bookcase-open.glb";
const KENNEY_HASH =
  "6704751f18b91a68ad9689c24ea59e029c09d584264b7f089439e79683c71900";
const POLY_HAVEN_FILE = "polyhaven-shelf-01.glb";
const POLY_HAVEN_HASH =
  "33d55c107ea5afd314aad197f7753c64bacc88ea554df3f7e57fc8e7c81415b1";
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

async function loadFixture(fileName: string, hash: string): Promise<Object3D> {
  const bytes = await readFile(`${F4_B_FIXTURES_DIRECTORY}/${fileName}`);
  expect(createHash("sha256").update(bytes).digest("hex")).toBe(hash);

  const gltf = await new GLTFLoader().parseAsync(
    Uint8Array.from(bytes).buffer,
    "",
  );
  return gltf.scene;
}

async function loadKayKit(): Promise<Object3D> {
  return loadFixture(KAYKIT_FILE, KAYKIT_HASH);
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

function expectSingleStandardMaterial(root: Object3D): MeshStandardMaterial {
  const material = findKayKitMesh(root).material;
  expect(material).not.toBeInstanceOf(Array);
  expect(material).toBeInstanceOf(MeshStandardMaterial);
  if (Array.isArray(material) || !(material instanceof MeshStandardMaterial)) {
    throw new Error("O fixture não possui o material esperado.");
  }
  return material;
}

interface KayKitResources {
  readonly geometry: BufferGeometry;
  readonly material: MeshStandardMaterial;
  readonly texture: Texture;
}

function identifyKayKitResources(root: Object3D): KayKitResources {
  const mesh = findKayKitMesh(root);
  const material = expectSingleStandardMaterial(root);
  const texture = material.map;
  expect(texture).not.toBeNull();
  if (!texture) throw new Error("O fixture KayKit não possui Base Color map.");

  return { geometry: mesh.geometry, material, texture };
}

function observeKayKitDisposal(root: Object3D): {
  readonly geometry: { count: number };
  readonly material: { count: number };
  readonly texture: { count: number };
} {
  const {
    geometry: meshGeometry,
    material,
    texture,
  } = identifyKayKitResources(root);

  const geometry = { count: 0 };
  const materialDisposals = { count: 0 };
  const textureDisposals = { count: 0 };
  meshGeometry.addEventListener("dispose", () => (geometry.count += 1));
  material.addEventListener("dispose", () => (materialDisposals.count += 1));
  texture.addEventListener("dispose", () => (textureDisposals.count += 1));

  return { geometry, material: materialDisposals, texture: textureDisposals };
}

function observeKenneyDisposal(root: Object3D): {
  readonly geometry: { count: number };
  readonly material: { count: number };
} {
  const mesh = findKayKitMesh(root);
  const material = expectSingleStandardMaterial(root);
  const geometry = { count: 0 };
  const materialDisposals = { count: 0 };
  mesh.geometry.addEventListener("dispose", () => (geometry.count += 1));
  material.addEventListener("dispose", () => (materialDisposals.count += 1));

  return { geometry, material: materialDisposals };
}

function observePolyHavenDisposal(root: Object3D): {
  readonly baseColor: { count: number };
  readonly geometry: { count: number };
  readonly material: { count: number };
  readonly metallicRoughness: { count: number };
  readonly normal: { count: number };
} {
  const mesh = findKayKitMesh(root);
  const material = expectSingleStandardMaterial(root);
  const baseColor = material.map;
  const normal = material.normalMap;
  const metallicRoughness = material.metalnessMap;
  expect(baseColor).not.toBeNull();
  expect(normal).not.toBeNull();
  expect(metallicRoughness).not.toBeNull();
  expect(material.roughnessMap).toBe(metallicRoughness);
  if (!baseColor || !normal || !metallicRoughness) {
    throw new Error("O fixture Poly Haven não possui os maps esperados.");
  }

  const geometry = { count: 0 };
  const materialDisposals = { count: 0 };
  const baseColorDisposals = { count: 0 };
  const normalDisposals = { count: 0 };
  const metallicRoughnessDisposals = { count: 0 };
  mesh.geometry.addEventListener("dispose", () => (geometry.count += 1));
  material.addEventListener("dispose", () => (materialDisposals.count += 1));
  baseColor.addEventListener("dispose", () => (baseColorDisposals.count += 1));
  normal.addEventListener("dispose", () => (normalDisposals.count += 1));
  metallicRoughness.addEventListener(
    "dispose",
    () => (metallicRoughnessDisposals.count += 1),
  );

  return {
    baseColor: baseColorDisposals,
    geometry,
    material: materialDisposals,
    metallicRoughness: metallicRoughnessDisposals,
    normal: normalDisposals,
  };
}

describe("F4-D — lifecycle experimental de asset com host vivo", () => {
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

  it("mantém unload repetido inerte depois de liberar KayKit", async () => {
    const host = new Scene();
    const sentinel = new Group();
    host.add(sentinel);
    const owner = new ExperimentalAssetOwner(host);
    const root = await loadKayKit();
    const disposals = observeKayKitDisposal(root);

    owner.accept(root);
    owner.unload();
    expect(() => owner.unload()).not.toThrow();

    expect(owner.root).toBeNull();
    expect(root.parent).toBeNull();
    expect(host.children).toContain(sentinel);
    expect(host.children).not.toContain(root);
    expect(disposals.geometry.count).toBe(1);
    expect(disposals.material.count).toBe(1);
    expect(disposals.texture.count).toBe(1);
  });

  it("repete três ciclos KayKit sem acumular roots ou ownership", async () => {
    const host = new Scene();
    const sentinel = new Group();
    host.add(sentinel);
    const owner = new ExperimentalAssetOwner(host);
    const roots: Object3D[] = [];
    const resources: KayKitResources[] = [];

    for (let cycle = 0; cycle < 3; cycle += 1) {
      const root = await loadKayKit();
      const rootResources = identifyKayKitResources(root);
      const disposals = observeKayKitDisposal(root);
      let unloaded = false;
      try {
        expect(roots).not.toContain(root);
        expect(resources.map(({ geometry }) => geometry)).not.toContain(
          rootResources.geometry,
        );
        expect(resources.map(({ material }) => material)).not.toContain(
          rootResources.material,
        );
        expect(resources.map(({ texture }) => texture)).not.toContain(
          rootResources.texture,
        );
        owner.accept(root);
        expect(owner.root).toBe(root);
        expect(root.parent).toBe(host);

        owner.unload();
        unloaded = true;

        expect(owner.root).toBeNull();
        expect(root.parent).toBeNull();
        expect(host.children).toHaveLength(1);
        expect(host.children).toContain(sentinel);
        expect(disposals.geometry.count).toBe(1);
        expect(disposals.material.count).toBe(1);
        expect(disposals.texture.count).toBe(1);
        roots.push(root);
        resources.push(rootResources);
      } finally {
        if (!unloaded) {
          if (owner.root === root) owner.unload();
          else disposeObjectTree(root);
        }
      }
    }

    expect(roots).toHaveLength(3);
    expect(new Set(roots).size).toBe(3);
    expect(new Set(resources.map(({ geometry }) => geometry)).size).toBe(3);
    expect(new Set(resources.map(({ material }) => material)).size).toBe(3);
    expect(new Set(resources.map(({ texture }) => texture)).size).toBe(3);
    expect(owner.root).toBeNull();
    expect(host.children).toHaveLength(1);
    expect(host.children).toContain(sentinel);
  });

  it("descarrega Poly Haven sem afetar Kenney no mesmo host", async () => {
    const host = new Scene();
    const sentinel = new Group();
    host.add(sentinel);
    const polyHavenOwner = new ExperimentalAssetOwner(host);
    const kenneyOwner = new ExperimentalAssetOwner(host);
    const polyHavenRoot = await loadFixture(POLY_HAVEN_FILE, POLY_HAVEN_HASH);
    const kenneyRoot = await loadFixture(KENNEY_FILE, KENNEY_HASH);
    const polyHavenDisposals = observePolyHavenDisposal(polyHavenRoot);
    const kenneyDisposals = observeKenneyDisposal(kenneyRoot);
    let polyHavenUnloaded = false;
    let kenneyUnloaded = false;

    try {
      polyHavenOwner.accept(polyHavenRoot);
      kenneyOwner.accept(kenneyRoot);

      expect(polyHavenOwner.root).toBe(polyHavenRoot);
      expect(kenneyOwner.root).toBe(kenneyRoot);
      expect(polyHavenOwner.host).toBe(host);
      expect(kenneyOwner.host).toBe(host);
      expect(polyHavenRoot.parent).toBe(host);
      expect(kenneyRoot.parent).toBe(host);
      expect(host.children).toContain(sentinel);
      expect(host.children).toContain(polyHavenRoot);
      expect(host.children).toContain(kenneyRoot);

      polyHavenOwner.unload();
      polyHavenUnloaded = true;

      expect(polyHavenOwner.root).toBeNull();
      expect(polyHavenRoot.parent).toBeNull();
      expect(host.children).not.toContain(polyHavenRoot);
      expect(kenneyOwner.root).toBe(kenneyRoot);
      expect(kenneyRoot.parent).toBe(host);
      expect(host.children).toContain(kenneyRoot);
      expect(host.children).toContain(sentinel);
      expect(polyHavenDisposals.geometry.count).toBe(1);
      expect(polyHavenDisposals.material.count).toBe(1);
      expect(polyHavenDisposals.baseColor.count).toBe(1);
      expect(polyHavenDisposals.normal.count).toBe(1);
      expect(polyHavenDisposals.metallicRoughness.count).toBe(1);
      expect(kenneyDisposals.geometry.count).toBe(0);
      expect(kenneyDisposals.material.count).toBe(0);

      kenneyOwner.unload();
      kenneyUnloaded = true;

      expect(kenneyOwner.root).toBeNull();
      expect(kenneyRoot.parent).toBeNull();
      expect(host.children).toContain(sentinel);
      expect(host.children).not.toContain(kenneyRoot);
      expect(kenneyDisposals.geometry.count).toBe(1);
      expect(kenneyDisposals.material.count).toBe(1);
    } finally {
      if (!polyHavenUnloaded) {
        if (polyHavenOwner.root === polyHavenRoot) polyHavenOwner.unload();
        else disposeObjectTree(polyHavenRoot);
      }
      if (!kenneyUnloaded) {
        if (kenneyOwner.root === kenneyRoot) kenneyOwner.unload();
        else disposeObjectTree(kenneyRoot);
      }
    }
  });
});
