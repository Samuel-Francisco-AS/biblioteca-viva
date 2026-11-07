import { ThreeWorldInteraction } from "./ThreeWorldInteraction";
import { CameraNavigation } from "./CameraNavigation";
import { LIBRARY_ROOMS, LIBRARY_PASSAGES } from "../libraryBuildingGeometry";
import { INITIAL_LIBRARY_RECORD_SLOTS } from "../libraryRecordLayout";
import { getProceduralLibraryRecordDimensions } from "./libraryRecordDimensions";
import { readFileSync } from "node:fs";
import {
  AnimationMixer,
  BufferGeometry,
  Box3,
  Group,
  Mesh,
  MeshBasicMaterial,
  BoxGeometry,
  Texture,
  Vector3,
  Scene,
  OrthographicCamera,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { describe, expect, it, vi } from "vitest";
import { INHABITANTS } from "../inhabitants";
import { createInhabitantVisuals } from "./inhabitantVisuals";
import { disposeObjectTree } from "./referenceScene";

describe("BF-4F1 inhabitants", () => {
  it("releases all four late models and their textures without anchors or ready callbacks after cancellation", async () => {
    const pending: ((value: { scene: Group; animations: [] }) => void)[] = [];
    const parent = new Group();
    const ready = vi.fn();
    const owner = createInhabitantVisuals(
      parent,
      () =>
        new Promise((resolve) => {
          pending.push(resolve);
        }),
      ready,
    );
    expect(pending).toHaveLength(4);
    owner.dispose();
    const spies = pending.flatMap((resolve) => {
      const geometry = new BoxGeometry(),
        texture = new Texture(),
        material = new MeshBasicMaterial({ map: texture });
      const scene = new Group();
      scene.add(new Mesh(geometry, material));
      const spies = [geometry, material, texture].map((r) =>
        vi.spyOn(r, "dispose"),
      );
      resolve({ scene, animations: [] });
      return spies;
    });
    await Promise.resolve();
    for (const spy of spies) expect(spy).toHaveBeenCalledOnce();
    expect(ready).not.toHaveBeenCalled();
    expect(owner.getCarryAnchor("character:aryn")).toBeNull();
    expect(parent.children).toHaveLength(0);
    owner.dispose();
    for (const spy of spies) expect(spy).toHaveBeenCalledOnce();
  });
  for (const actor of INHABITANTS)
    it(`${actor.key}: real exported GLB, dimensions, clip and ownership`, async () => {
      const bytes = readFileSync(
        `src/features/library/three/assets/${actor.key}.glb`,
      );
      const gltf = await new GLTFLoader().parseAsync(
        new Uint8Array(bytes).buffer,
        "",
      );
      gltf.scene.updateMatrixWorld(true);
      const bounds = new Box3().setFromObject(gltf.scene);
      const size = bounds.getSize(new Vector3());
      expect(size.y).toBeCloseTo(actor.height, 2);
      expect(bounds.min.y).toBeCloseTo(0, 4);
      expect(size.x).toBeGreaterThan(0.3);
      expect(size.z).toBeGreaterThan(0.1);
      expect(gltf.animations.length).toBeGreaterThan(0);
      const mixer = new AnimationMixer(gltf.scene);
      gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
      mixer.update(0.5);
      expect(new Box3().setFromObject(gltf.scene).max.y).toBeLessThan(
        actor.height + 0.05,
      );
      const placed = bounds.clone().translate(new Vector3(actor.x, 0, actor.z));
      expect(
        LIBRARY_ROOMS.some(
          (room) =>
            placed.min.x > room.minX &&
            placed.max.x < room.maxX &&
            placed.min.z > room.minZ &&
            placed.max.z < room.maxZ,
        ),
      ).toBe(true);
      for (const slot of INITIAL_LIBRARY_RECORD_SLOTS) {
        const d = getProceduralLibraryRecordDimensions(slot.modelTypeId);
        const [x, , z] = slot.position;
        const obstacle = new Box3(
          new Vector3(x - d.width / 2, 0, z - d.depth / 2),
          new Vector3(x + d.width / 2, 5, z + d.depth / 2),
        );
        expect(placed.intersectsBox(obstacle)).toBe(false);
      }
      for (const sx of [-1, 1])
        for (const sz of [-1, 1]) {
          const p = LIBRARY_PASSAGES;
          const passage = new Box3(
            new Vector3(sx * p.x - p.length / 2, 0, sz * p.z - p.width / 2),
            new Vector3(sx * p.x + p.length / 2, 5, sz * p.z + p.width / 2),
          );
          expect(placed.intersectsBox(passage)).toBe(false);
        }
      mixer.stopAllAction();
      mixer.uncacheRoot(gltf.scene);
      const scene = new Scene();
      scene.add(gltf.scene);
      gltf.scene.position.set(actor.x, 0, actor.z);
      const canvas = document.createElement("canvas");
      canvas.getBoundingClientRect = () => new DOMRect(0, 0, 640, 360);
      const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
      const navigation = new CameraNavigation(camera, 0.7, LIBRARY_ROOMS);
      navigation.setViewport(640, 360);
      const onSelectionChange = vi.fn();
      const interaction = new ThreeWorldInteraction({
        camera,
        canvas,
        navigation,
        scene,
        render: () => {},
        catalog: [actor],
        selectables: [{ descriptor: actor, root: gltf.scene }],
        onSelectionChange,
      });
      camera.updateMatrixWorld();
      const point = new Vector3(actor.x, actor.height * 0.6, actor.z).project(
        camera,
      );
      for (const type of ["pointerdown", "pointerup"]) {
        const event = new Event(type, { cancelable: true });
        Object.defineProperties(event, {
          button: { value: 0 },
          clientX: { value: (point.x + 1) * 320 },
          clientY: { value: (1 - point.y) * 180 },
          pointerId: { value: 1 },
          pointerType: { value: "touch" },
        });
        canvas.dispatchEvent(event);
      }
      expect(onSelectionChange).toHaveBeenLastCalledWith(actor);
      expect(canvas.dataset.highlightedObject).toBe(actor.id);
      interaction.dispose();
      const resources = new Set<object>();
      const disposed = vi.fn();
      gltf.scene.traverse((o) => {
        if (!(o instanceof Mesh)) return;
        const geometry: unknown = o.geometry;
        if (geometry instanceof BufferGeometry && !resources.has(geometry)) {
          resources.add(geometry);
          geometry.addEventListener("dispose", disposed);
        }
      });
      disposeObjectTree(gltf.scene);
      expect(disposed).toHaveBeenCalledTimes(resources.size);
    });
  it("discards late loads and isolates mounts; failures remain recoverable on remount", async () => {
    let resolve:
      ((value: { scene: Group; animations: [] }) => void) | undefined;
    const parent = new Group();
    const owner = createInhabitantVisuals(
      parent,
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    expect(parent.children).toHaveLength(4);
    owner.dispose();
    owner.dispose();
    const late = new Group();
    resolve?.({ scene: late, animations: [] });
    await Promise.resolve();
    expect(parent.children).toHaveLength(0);
    expect(late.parent).toBeNull();
    const next = createInhabitantVisuals(parent, () =>
      Promise.reject(new Error("unavailable")),
    );
    await new Promise((r) => setTimeout(r, 0));
    expect(
      next.selectables.every(({ root }) => root.userData.loadState === "error"),
    ).toBe(true);
    expect(next.selectables.map(({ descriptor }) => descriptor.id)).toEqual(
      INHABITANTS.map((x) => x.id),
    );
    next.dispose();
    expect(parent.children).toHaveLength(0);
  });
});
