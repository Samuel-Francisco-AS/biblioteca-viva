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
const QUATERNIUS_FILE = "quaternius-bookshelf.glb";
const QUATERNIUS_HASH =
  "aabe7de0adf6b0e3aaf651acbb5704680e44df3180ffa98aa0cb7d19d389f265";
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
    get(): string {
      return "";
    },
    set(this: HTMLImageElement, value: string): void {
      void value;
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

interface ExperimentalLoadCallbacks {
  fail(error: Error): void;
  succeed(root: Object3D): void;
}

class ControlledAsyncLoad {
  private callbacks: ExperimentalLoadCallbacks | null = null;

  start(callbacks: ExperimentalLoadCallbacks): void {
    if (this.callbacks !== null) {
      throw new Error("A operação controlada já foi iniciada.");
    }
    this.callbacks = callbacks;
  }

  succeed(root: Object3D): void {
    this.callbacks?.succeed(root);
  }

  fail(error: Error): void {
    this.callbacks?.fail(error);
  }
}

class ExperimentalAssetOwner {
  root: Object3D | null = null;
  error: Error | null = null;

  private activeOperation: symbol | null = null;
  private closed = false;

  constructor(readonly host: Object3D) {}

  get hasActiveOperation(): boolean {
    return this.activeOperation !== null;
  }

  get isClosed(): boolean {
    return this.closed;
  }

  accept(root: Object3D): void {
    if (this.closed) {
      throw new Error("O owner experimental já foi encerrado.");
    }
    if (this.root !== null) {
      throw new Error("O owner experimental já possui uma root.");
    }
    this.root = root;
    this.host.add(root);
  }

  beginLoading(): ExperimentalLoadCallbacks {
    if (this.closed || this.root !== null || this.activeOperation !== null) {
      throw new Error("O owner experimental não aceita outra operação.");
    }

    const operation = Symbol("experimental-asset-load");
    this.activeOperation = operation;
    this.error = null;
    return {
      succeed: (root) => this.handleSuccess(operation, root),
      fail: (error) => this.handleError(operation, error),
    };
  }

  abandon(): void {
    this.activeOperation = null;
  }

  unload(): void {
    this.abandon();
    const root = this.root;
    this.root = null;
    if (root) disposeObjectTree(root);
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    this.unload();
  }

  private handleSuccess(operation: symbol, root: Object3D): void {
    if (
      this.closed ||
      this.activeOperation !== operation ||
      this.root !== null
    ) {
      disposeObjectTree(root);
      return;
    }

    this.activeOperation = null;
    this.accept(root);
  }

  private handleError(operation: symbol, error: Error): void {
    if (this.closed || this.activeOperation !== operation) return;
    this.activeOperation = null;
    this.error = error;
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

async function loadQuaternius(): Promise<Object3D> {
  return loadFixture(QUATERNIUS_FILE, QUATERNIUS_HASH);
}

function findFixtureMesh(root: Object3D): Mesh {
  const meshes: Mesh[] = [];
  root.traverse((object) => {
    if (isMesh(object)) meshes.push(object);
  });

  expect(meshes).toHaveLength(1);
  const mesh = meshes[0];
  if (!mesh) throw new Error("O fixture não contém mesh.");
  return mesh;
}

function isMesh(object: Object3D): object is Mesh {
  return object instanceof Mesh;
}

function expectSingleStandardMaterial(root: Object3D): MeshStandardMaterial {
  const material = findFixtureMesh(root).material;
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
  const mesh = findFixtureMesh(root);
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

function observeSimpleFixtureDisposal(root: Object3D): {
  readonly geometry: { count: number };
  readonly material: { count: number };
} {
  const mesh = findFixtureMesh(root);
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
  const mesh = findFixtureMesh(root);
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
    expect(findFixtureMesh(root)).toBeInstanceOf(Mesh);

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
    const kenneyDisposals = observeSimpleFixtureDisposal(kenneyRoot);
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

  it("descarta sucesso tardio depois do abandono lógico", async () => {
    const host = new Scene();
    const originalHost = host;
    const sentinel = new Group();
    host.add(sentinel);
    const owner = new ExperimentalAssetOwner(host);
    const operation = new ControlledAsyncLoad();
    const root = await loadQuaternius();
    const disposals = observeSimpleFixtureDisposal(root);
    let delivered = false;

    try {
      operation.start(owner.beginLoading());
      expect(owner.hasActiveOperation).toBe(true);

      owner.abandon();
      expect(owner.hasActiveOperation).toBe(false);
      expect(owner.root).toBeNull();

      operation.succeed(root);
      delivered = true;

      expect(owner.root).toBeNull();
      expect(root.parent).toBeNull();
      expect(root.children).toHaveLength(0);
      expect(owner.host).toBe(originalHost);
      expect(host.children).toEqual([sentinel]);
      expect(disposals.geometry.count).toBe(1);
      expect(disposals.material.count).toBe(1);
    } finally {
      if (!delivered) disposeObjectTree(root);
    }
  });

  it("aceita no máximo um sucesso por operação e libera o resultado adicional", async () => {
    const host = new Scene();
    const sentinel = new Group();
    host.add(sentinel);
    const owner = new ExperimentalAssetOwner(host);
    const operation = new ControlledAsyncLoad();
    const firstRoot = await loadQuaternius();
    const secondRoot = await loadQuaternius();
    const firstDisposals = observeSimpleFixtureDisposal(firstRoot);
    const secondDisposals = observeSimpleFixtureDisposal(secondRoot);
    let firstAccepted = false;
    let secondDelivered = false;

    try {
      operation.start(owner.beginLoading());
      operation.succeed(firstRoot);
      firstAccepted = true;

      expect(owner.hasActiveOperation).toBe(false);
      expect(owner.root).toBe(firstRoot);
      expect(firstRoot.parent).toBe(host);
      expect(firstDisposals.geometry.count).toBe(0);
      expect(firstDisposals.material.count).toBe(0);

      operation.succeed(secondRoot);
      secondDelivered = true;

      expect(owner.root).toBe(firstRoot);
      expect(firstRoot.parent).toBe(host);
      expect(host.children).toEqual([sentinel, firstRoot]);
      expect(secondRoot.parent).toBeNull();
      expect(secondRoot.children).toHaveLength(0);
      expect(firstDisposals.geometry.count).toBe(0);
      expect(firstDisposals.material.count).toBe(0);
      expect(secondDisposals.geometry.count).toBe(1);
      expect(secondDisposals.material.count).toBe(1);

      owner.unload();

      expect(owner.root).toBeNull();
      expect(firstRoot.parent).toBeNull();
      expect(host.children).toEqual([sentinel]);
      expect(firstDisposals.geometry.count).toBe(1);
      expect(firstDisposals.material.count).toBe(1);
    } finally {
      if (owner.root) owner.unload();
      if (!firstAccepted) disposeObjectTree(firstRoot);
      if (!secondDelivered) disposeObjectTree(secondRoot);
    }
  });

  it("mantém erro individual recuperável para uma nova operação", async () => {
    const host = new Scene();
    const sentinel = new Group();
    host.add(sentinel);
    const owner = new ExperimentalAssetOwner(host);
    const failedOperation = new ControlledAsyncLoad();
    const error = new Error("fixture indisponível");
    const retryOperation = new ControlledAsyncLoad();
    const retryRoot = await loadQuaternius();
    const retryDisposals = observeSimpleFixtureDisposal(retryRoot);
    let retryAccepted = false;

    try {
      failedOperation.start(owner.beginLoading());
      failedOperation.fail(error);

      expect(owner.hasActiveOperation).toBe(false);
      expect(owner.root).toBeNull();
      expect(owner.error).toBe(error);
      expect(host.children).toEqual([sentinel]);

      retryOperation.start(owner.beginLoading());
      expect(owner.error).toBeNull();
      retryOperation.succeed(retryRoot);
      retryAccepted = true;

      expect(owner.hasActiveOperation).toBe(false);
      expect(owner.root).toBe(retryRoot);
      expect(retryRoot.parent).toBe(host);
      expect(host.children).toEqual([sentinel, retryRoot]);
      expect(retryDisposals.geometry.count).toBe(0);
      expect(retryDisposals.material.count).toBe(0);
    } finally {
      if (owner.root) owner.unload();
      if (!retryAccepted) disposeObjectTree(retryRoot);
    }

    expect(owner.root).toBeNull();
    expect(retryRoot.parent).toBeNull();
    expect(host.children).toEqual([sentinel]);
    expect(retryDisposals.geometry.count).toBe(1);
    expect(retryDisposals.material.count).toBe(1);
  });

  it("mantém erro tardio após abandono inerte", () => {
    const host = new Scene();
    const sentinel = new Group();
    host.add(sentinel);
    const owner = new ExperimentalAssetOwner(host);
    const operation = new ControlledAsyncLoad();

    operation.start(owner.beginLoading());
    owner.abandon();
    operation.fail(new Error("erro tardio"));

    expect(owner.hasActiveOperation).toBe(false);
    expect(owner.root).toBeNull();
    expect(owner.error).toBeNull();
    expect(host.children).toEqual([sentinel]);
  });

  it("descarta sucesso tardio quando o owner é encerrado em voo", async () => {
    const host = new Scene();
    const originalHost = host;
    const sentinel = new Group();
    host.add(sentinel);
    const owner = new ExperimentalAssetOwner(host);
    const operation = new ControlledAsyncLoad();
    const root = await loadQuaternius();
    const disposals = observeSimpleFixtureDisposal(root);
    let delivered = false;

    try {
      operation.start(owner.beginLoading());
      owner.close();

      expect(owner.isClosed).toBe(true);
      expect(owner.hasActiveOperation).toBe(false);
      expect(owner.root).toBeNull();

      operation.succeed(root);
      delivered = true;

      expect(owner.isClosed).toBe(true);
      expect(owner.root).toBeNull();
      expect(root.parent).toBeNull();
      expect(root.children).toHaveLength(0);
      expect(owner.host).toBe(originalHost);
      expect(host.children).toEqual([sentinel]);
      expect(disposals.geometry.count).toBe(1);
      expect(disposals.material.count).toBe(1);
    } finally {
      if (!delivered) disposeObjectTree(root);
    }
  });
});
