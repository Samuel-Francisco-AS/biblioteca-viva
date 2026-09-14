/// <reference types="node" />

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import { Box3, Mesh, Vector3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { disposeObjectTree } from "./referenceScene";

interface F4BAssetExpectation {
  readonly id: string;
  readonly fileName: string;
  readonly hash: string;
  readonly logicalRootName: string;
  readonly meshCount: number;
  readonly dimensions: readonly [number, number, number];
}

const F4_B_ASSETS: readonly F4BAssetExpectation[] = [
  {
    id: "kaykit-shelf-b-large-decorated",
    fileName: "kaykit-shelf-b-large-decorated.glb",
    hash: "03e0b1af929de0a81795aea965b6cc5fbd8ac6e896e1047acef9f5d93b9debbe",
    logicalRootName: "F4_KayKit_ShelfBLargeDecorated",
    meshCount: 1,
    dimensions: [2, 0.817515, 0.5],
  },
  {
    id: "kenney-bookcase-open",
    fileName: "kenney-bookcase-open.glb",
    hash: "6704751f18b91a68ad9689c24ea59e029c09d584264b7f089439e79683c71900",
    logicalRootName: "F4_Kenney_BookcaseOpen",
    meshCount: 1,
    dimensions: [0.4, 0.88, 0.25],
  },
  {
    id: "polyhaven-shelf-01",
    fileName: "polyhaven-shelf-01.glb",
    hash: "33d55c107ea5afd314aad197f7753c64bacc88ea554df3f7e57fc8e7c81415b1",
    logicalRootName: "F4_PolyHaven_Shelf01",
    meshCount: 1,
    dimensions: [1.003444, 2.08031, 0.25698],
  },
  {
    id: "quaternius-bookshelf",
    fileName: "quaternius-bookshelf.glb",
    hash: "aabe7de0adf6b0e3aaf651acbb5704680e44df3180ffa98aa0cb7d19d389f265",
    logicalRootName: "F4_Quaternius_Bookshelf",
    meshCount: 1,
    dimensions: [1.159162, 2.21904, 0.377999],
  },
];

const F4_B_FIXTURES_DIRECTORY = "src/features/library/three/fixtures/f4-b";

let imageSourceDescriptor: PropertyDescriptor | undefined;

beforeAll(() => {
  // jsdom does not decode the embedded images in the two textured GLBs. F4-B
  // asserts the installed loader's scene conversion only; texture fidelity is
  // intentionally reserved for F4-C.
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

function expectIdentityTransform(object: {
  readonly position: Vector3;
  readonly rotation: {
    readonly x: number;
    readonly y: number;
    readonly z: number;
  };
  readonly scale: Vector3;
}): void {
  expect(object.position.toArray()).toEqual([0, 0, 0]);
  expect([object.rotation.x, object.rotation.y, object.rotation.z]).toEqual([
    0, 0, 0,
  ]);
  expect(object.scale.toArray()).toEqual([1, 1, 1]);
}

describe("F4-B — gate de eixos no GLTFLoader instalado", () => {
  it.each(F4_B_ASSETS)(
    "$id mantém geometria normalizada sem correção específica no Three",
    async ({ fileName, hash, logicalRootName, meshCount, dimensions }) => {
      const bytes = await readFile(`${F4_B_FIXTURES_DIRECTORY}/${fileName}`);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(hash);

      const gltf = await new GLTFLoader().parseAsync(
        Uint8Array.from(bytes).buffer,
        "",
      );

      try {
        gltf.scene.updateMatrixWorld(true);
        expectIdentityTransform(gltf.scene);
        expect(gltf.scene.children).toHaveLength(1);

        const logicalRoot = gltf.scene.children[0];
        expect(logicalRoot.name).toBe(logicalRootName);
        expectIdentityTransform(logicalRoot);

        let observedMeshes = 0;
        logicalRoot.traverse((object) => {
          if (object instanceof Mesh) observedMeshes += 1;
        });
        expect(observedMeshes).toBe(meshCount);

        const bounds = new Box3().setFromObject(gltf.scene);
        const size = bounds.getSize(new Vector3());
        expect(bounds.min.y).toBeCloseTo(0, 6);
        expect(bounds.max.y).toBeCloseTo(dimensions[1], 5);
        expect(size.x).toBeCloseTo(dimensions[0], 5);
        expect(size.y).toBeCloseTo(dimensions[1], 5);
        expect(size.z).toBeCloseTo(dimensions[2], 5);
      } finally {
        disposeObjectTree(gltf.scene);
      }
    },
  );
});
