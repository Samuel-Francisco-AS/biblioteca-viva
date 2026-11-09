import { readFileSync } from "node:fs";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { disposeObjectTree } from "./referenceScene";
import {
  AnimationMixer,
  Box3,
  Box3Helper,
  SkinnedMesh,
  Vector3,
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  OrthographicCamera,
  Scene,
} from "three";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CameraNavigation } from "./CameraNavigation";
import { ThreeWorldInteraction } from "./ThreeWorldInteraction";
import type { WorldSelectableObject, WorldSelection } from "../worldRuntime";

const disposals: (() => void)[] = [];
afterEach(() => {
  for (const dispose of disposals.splice(0)) dispose();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
function setup() {
  const canvas = document.createElement("canvas");
  vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue(
    new DOMRect(0, 0, 400, 400),
  );
  const scene = new Scene();
  const camera = new OrthographicCamera(-2, 2, 2, -2, 0.1, 100);
  const navigation = new CameraNavigation(camera);
  navigation.setViewport(400, 400);
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);
  camera.left = camera.bottom = -2;
  camera.right = camera.top = 2;
  camera.updateProjectionMatrix();
  const geometry = new BoxGeometry(0.5, 0.5, 0.1);
  const material = new MeshBasicMaterial();
  const selectables: { descriptor: WorldSelectableObject; root: Object3D }[] =
    [];
  const priority: Object3D[] = [];
  const add = (id: string, z = 0, parent: Object3D = scene) => {
    const root = new Group();
    const mesh = new Mesh(geometry, material);
    root.add(mesh);
    root.position.z = z;
    parent.add(root);
    selectables.push({
      descriptor: {
        id,
        label: id,
        entryId: id.startsWith("record:") ? "entry-1" : undefined,
      },
      root,
    });
    return { root, mesh };
  };
  const mount = (deferPicking = false, fastPicking = false) => {
    const selection = vi.fn<(selection: WorldSelection) => void>();
    const activation = vi.fn();
    const interaction = new ThreeWorldInteraction({
      deferPicking,
      fastPicking,
      camera,
      canvas,
      scene,
      navigation,
      catalog: selectables.map((s) => s.descriptor),
      selectables,
      pickingPriorityRoots: priority,
      onSelectionChange: selection,
      onTapObject: activation,
      render: () => {},
    });
    disposals.push(() => {
      interaction.dispose();
      geometry.dispose();
      material.dispose();
    });
    const tap = (x = 200, y = 200) => {
      for (const type of ["pointerdown", "pointerup"]) {
        const event = new MouseEvent(type, {
          clientX: x,
          clientY: y,
          bubbles: true,
          cancelable: true,
        });
        Object.defineProperty(event, "pointerId", { value: 1 });
        canvas.dispatchEvent(event);
      }
    };
    return { interaction, selection, activation, tap };
  };
  return { canvas, scene, camera, add, mount, priority };
}

describe("Touch continuity", () => {
  it("acknowledges a candidate before raycast and cancels the echo on a drag", () => {
    const h = setup();
    const host = document.createElement("div");
    host.className = "world-host";
    host.append(h.canvas);
    h.mount();
    const emit = (type: string, x: number) => {
      const e = new MouseEvent(type, {
        bubbles: true,
        clientX: x,
        clientY: 20,
        cancelable: true,
      });
      Object.defineProperty(e, "pointerId", { value: 1 });
      h.canvas.dispatchEvent(e);
    };
    emit("pointerdown", 20);
    expect(host.dataset.worldTouch).toBe("pressed");
    emit("pointermove", 50);
    expect(host.dataset.worldTouch).toBe("cancelled");
    emit("pointerup", 50);
    emit("pointerdown", 200);
    expect(host.dataset.worldTouch).toBe("pressed");
    emit("pointerup", 200);
    expect(host.dataset.worldTouch).toBe("released");
    host.remove();
  });
});

describe("R3: candidate rejection for empty-world taps", () => {
  it("avoids skeletal raycasts on empty taps, but retains precise hits nearby", () => {
    const h = setup();
    const character = h.add("character:lua");
    const skinRay = vi.spyOn(character.mesh, "raycast");
    const { tap, selection, activation } = h.mount(false, true);
    tap(390, 30);
    expect(skinRay).not.toHaveBeenCalled();
    expect(selection).not.toHaveBeenCalled();
    tap(200, 200);
    expect(skinRay).toHaveBeenCalledOnce();
    expect(selection.mock.lastCall?.[0]?.id).toBe("character:lua");
    expect(activation).toHaveBeenCalledOnce();
  });

  it("keeps translated character targets selectable and rejects their old location", () => {
    const h = setup();
    const actor = h.add("character:lua");
    const { tap, selection, activation } = h.mount(false, true);
    actor.root.position.x += 1;
    tap(200, 200);
    expect(selection).not.toHaveBeenCalled();
    tap(300, 200);
    expect(selection.mock.lastCall?.[0]?.id).toBe("character:lua");
    expect(activation).toHaveBeenCalledOnce();
  });

  it("does not discard a nested registered target when the broadphase root is its parent", () => {
    const h = setup();
    const actor = h.add("character:lua");
    h.add("record:book", 0.2, actor.root);
    const { tap, selection } = h.mount(false, true);
    tap(200, 200);
    expect(selection.mock.lastCall?.[0]?.id).toBe("record:book");
  });
});

describe("R2: confirmed gesture scheduling", () => {
  it("presents feedback before picking, then publishes once", () => {
    const callbacks: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      callbacks.push(cb);
      return callbacks.length;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    const h = setup();
    h.add("character:lua");
    const { tap, selection, activation } = h.mount(true);
    tap();
    expect(selection).not.toHaveBeenCalled();
    expect(activation).not.toHaveBeenCalled();
    callbacks.shift()?.(0);
    expect(selection).not.toHaveBeenCalled();
    callbacks.shift()?.(16);
    expect(selection.mock.lastCall?.[0]?.id).toBe("character:lua");
    expect(activation).toHaveBeenCalledOnce();
  });

  it("does not select after gesture teardown", () => {
    const callbacks: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      callbacks.push(cb);
      return callbacks.length;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    const h = setup();
    h.add("character:lua");
    const { tap, selection, interaction } = h.mount(true);
    tap();
    callbacks.shift()?.(0);
    interaction.cancelActiveGestures();
    callbacks.shift()?.(16);
    expect(selection).not.toHaveBeenCalled();
  });
});

describe("R2: stable visual highlight", () => {
  it("follows the character root without rescanning articulated triangles per frame", () => {
    const h = setup();
    const character = h.add("character:lua");
    const { interaction, tap } = h.mount();
    tap();
    const helper = h.scene.getObjectByName("f1-c-selection-highlight");
    expect(helper).toBeInstanceOf(Box3Helper);
    if (!(helper instanceof Box3Helper)) return;
    const before = helper.box.getCenter(new Vector3());
    const expensive = vi.spyOn(Box3.prototype, "setFromObject");
    character.root.position.x += 1;
    interaction.updateHighlightBounds();
    const after = helper.box.getCenter(new Vector3());
    expect(after.x).toBeGreaterThan(before.x);
    expect(expensive).not.toHaveBeenCalled();
  });
});

describe("R1: picking without scene-wide matrix forcing or duplicate rays", () => {
  it("tests nested books only once, excludes decorations, and keeps instance/entry identity", () => {
    const h = setup();
    const shelf = h.add("shelf");
    const book = h.add("record:book", 1, shelf.root);
    h.priority.push(shelf.root);
    const decoration = new Object3D();
    h.scene.add(decoration);
    const decorMatrices = vi.spyOn(decoration, "updateWorldMatrix");
    const globalMatrices = vi.spyOn(h.scene, "updateMatrixWorld");
    const bookRays = vi.spyOn(book.mesh, "raycast");
    const shelfRays = vi.spyOn(shelf.mesh, "raycast");
    const { tap, selection } = h.mount();
    tap();
    expect(selection).toHaveBeenLastCalledWith({
      id: "record:book",
      entryId: "entry-1",
      label: "record:book",
    });
    expect(bookRays).toHaveBeenCalledTimes(1);
    expect(shelfRays).toHaveBeenCalledTimes(1);
    expect(globalMatrices).not.toHaveBeenCalled();
    expect(decorMatrices).not.toHaveBeenCalled();
    bookRays.mockClear();
    shelfRays.mockClear();
    tap(399, 1);
    expect(selection).toHaveBeenLastCalledWith(null);
    expect(bookRays).toHaveBeenCalledTimes(1);
    expect(shelfRays).toHaveBeenCalledTimes(1);
  });

  it.each(["living:lamp", "character:ytha", "scroll:note"])(
    "preserves occlusion and depth tolerance for %s",
    (id) => {
      const h = setup();
      const record = h.add("record:film");
      const environmental = h.add(id, 0.01);
      h.add("technical-fallback", 2);
      h.priority.push(record.root);
      const { tap, selection, activation } = h.mount();
      tap();
      expect(selection.mock.lastCall?.[0]?.id).toBe("record:film");
      environmental.root.position.z = 0.04;
      tap();
      expect(selection.mock.lastCall?.[0]?.id).toBe(id);
      if (!id.startsWith("scroll:"))
        expect(activation).toHaveBeenLastCalledWith(id);
      environmental.root.position.z = -1;
      tap();
      expect(selection.mock.lastCall?.[0]?.id).toBe("record:film");
    },
  );

  it("keeps the nearest registered child of an environmental hierarchy eligible", () => {
    const h = setup();
    const actor = h.add("character:lua");
    h.add("record:book", 0.2, actor.root);
    const { tap, selection, activation } = h.mount();
    tap();
    expect(selection.mock.lastCall?.[0]?.id).toBe("record:book");
    expect(activation).not.toHaveBeenCalled();
  });

  it("refreshes dynamic registrations, replacement children and matrices before render; repeated taps still activate", () => {
    const h = setup();
    const actor = h.add("character:lua");
    const { tap, interaction, selection, activation } = h.mount();
    tap();
    tap();
    expect(selection).toHaveBeenCalledTimes(1);
    expect(activation).toHaveBeenCalledTimes(2);
    actor.root.position.x = 10;
    tap();
    expect(selection).toHaveBeenLastCalledWith(null);
    actor.root.position.x = 0;
    const oldMesh = actor.mesh;
    actor.root.remove(oldMesh);
    const replacement = new Mesh(oldMesh.geometry, oldMesh.material);
    actor.root.add(replacement);
    tap();
    expect(selection.mock.lastCall?.[0]?.id).toBe("character:lua");
    interaction.removeSelectable("character:lua");
    actor.root.removeFromParent();
    tap();
    expect(selection).toHaveBeenLastCalledWith(null);
    const added = h.add("record:work", 1);
    interaction.addSelectable(
      { id: "record:work", label: "Work", entryId: "work-1" },
      added.root,
    );
    tap();
    expect(selection).toHaveBeenLastCalledWith({
      id: "record:work",
      label: "Work",
      entryId: "work-1",
    });
    interaction.dispose();
    tap();
    expect(selection).toHaveBeenCalledTimes(5);
  });
});

it.each(["samael", "aryn", "ytha", "lua"])(
  "R5Q shares exact tap vertices with highlight and restores before publication: %s",
  async (key) => {
    const gltf = await new GLTFLoader().parseAsync(
      new Uint8Array(
        readFileSync(`src/features/library/three/assets/${key}.glb`),
      ).buffer,
      "",
    );
    const h = setup(),
      actor = h.add(`character:${key}`);
    actor.root.remove(actor.mesh);
    actor.root.add(gltf.scene);
    const skins: SkinnedMesh[] = [];
    const isSkin = (node: Object3D): node is SkinnedMesh =>
      node instanceof SkinnedMesh;
    gltf.scene.traverse((node) => {
      if (isSkin(node)) skins.push(node);
    });
    const mixer = new AnimationMixer(gltf.scene);
    const { interaction, selection, tap } = h.mount();
    selection.mockImplementation(() => {
      expect(
        skins.every((skin) => !Object.hasOwn(skin, "getVertexPosition")),
      ).toBe(true);
    });
    const reader = vi.spyOn(Mesh.prototype, "getVertexPosition");
    for (const clipName of ["idle", "walk", "magic"]) {
      interaction.selectObject(null);
      mixer.stopAllAction();
      const clip = gltf.animations.find((c) => c.name === clipName)!;
      mixer.clipAction(clip).play();
      mixer.setTime(clip.duration * 0.31);
      actor.root.updateMatrixWorld(true);
      const expected = new Box3().setFromObject(actor.root, true);
      const center = expected.getCenter(new Vector3());
      h.camera.position.set(center.x, center.y, expected.max.z + 10);
      h.camera.lookAt(center);
      reader.mockClear();
      tap();
      expect(selection).toHaveBeenLastCalledWith({
        id: `character:${key}`,
        label: `character:${key}`,
      });
      const helper = h.scene.getObjectByName("f1-c-selection-highlight");
      expect(helper).toBeInstanceOf(Box3Helper);
      if (!(helper instanceof Box3Helper))
        throw new Error("Missing exact highlight");
      expect(helper.box).toEqual(expected);
      // The base/morph reader runs once per vertex, not again for highlight.
      expect(
        reader.mock.instances.filter(
          (instance) => instance instanceof SkinnedMesh,
        ),
      ).toHaveLength(
        skins.reduce(
          (total, skin) => total + skin.geometry.getAttribute("position").count,
          0,
        ),
      );
    }
    mixer.stopAllAction();
    mixer.uncacheRoot(gltf.scene);
    disposals.push(() => disposeObjectTree(gltf.scene));
  },
);
