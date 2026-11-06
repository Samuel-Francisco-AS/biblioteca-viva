import {
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
  const mount = () => {
    const selection = vi.fn<(selection: WorldSelection) => void>();
    const activation = vi.fn();
    const interaction = new ThreeWorldInteraction({
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
