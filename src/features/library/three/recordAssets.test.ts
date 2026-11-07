import {
  Box3,
  Mesh,
  OrthographicCamera,
  Scene,
  Vector3,
  type Material,
  type BufferGeometry,
  type Object3D,
} from "three";
import { expect, it, vi } from "vitest";
import { INITIAL_LIBRARY_RECORD_SLOTS } from "../libraryRecordLayout";
import {
  createLibraryRecordComposition,
  replaceLibraryRecordRepresentation,
} from "./libraryRecordComposition";
import { createRecordAsset } from "./recordAssets";
import { ThreeWorldInteraction } from "./ThreeWorldInteraction";
import { CameraNavigation } from "./CameraNavigation";
import { disposeObjectTree } from "./referenceScene";
import { collectInhabitantObstacles } from "./inhabitantObstacles";

function isMesh(
  object: Object3D,
): object is Mesh<BufferGeometry, Material | Material[]> {
  return object instanceof Mesh;
}
it.each([
  "movie-record",
  "series-record",
  "study-record",
  "physical-activity-record",
  "work-record",
] as const)(
  "replaces %s while the registered canvas target, semantic selection, highlight, pose and collider stay live",
  (modelTypeId) => {
    const slot = INITIAL_LIBRARY_RECORD_SLOTS.find(
      (s) => s.modelTypeId === modelTypeId,
    )!;
    const composition = createLibraryRecordComposition([
      {
        ...slot,
        position: [0, 0, 0],
        entryId: "fiction",
        instanceId: "record:fiction",
      },
    ]);
    const visual = composition.instances[0],
      node = visual.node,
      old = visual.representation,
      scene = new Scene();
    scene.add(composition.root);
    const canvas = document.createElement("canvas");
    vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue(
      new DOMRect(0, 0, 400, 400),
    );
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 20),
      navigation = new CameraNavigation(camera);
    navigation.setViewport(400, 400);
    const targetX = modelTypeId === "study-record" ? 0.15 : 0;
    const targetY =
      modelTypeId === "study-record"
        ? 0.65
        : modelTypeId === "physical-activity-record"
          ? 0.46
          : visual.representation.dimensions.height * 0.35;
    camera.position.set(targetX, targetY, 5);
    camera.lookAt(targetX, targetY, 0);
    camera.left = camera.bottom = -1;
    camera.right = camera.top = 1;
    camera.updateProjectionMatrix();
    const descriptor = {
        id: visual.instanceId,
        entryId: visual.entryId,
        label: "Registro fictício",
      },
      selection = vi.fn();
    const interaction = new ThreeWorldInteraction({
      camera,
      canvas,
      scene,
      navigation,
      catalog: [descriptor],
      selectables: [{ descriptor, root: node }],
      pickingPriorityRoots: [node],
      onSelectionChange: selection,
      render: () => {},
    });
    const tap = () => {
      for (const type of ["pointerdown", "pointerup"]) {
        const event = new MouseEvent(type, {
          clientX: 200,
          clientY: 200,
          bubbles: true,
        });
        Object.defineProperty(event, "pointerId", { value: 1 });
        canvas.dispatchEvent(event);
      }
    };
    interaction.selectObject(visual.instanceId);
    expect(selection).toHaveBeenLastCalledWith(descriptor);
    const before = collectInhabitantObstacles([node]),
      position = node.position.clone();
    replaceLibraryRecordRepresentation(visual, (identity) => {
      const asset = createRecordAsset(identity);
      asset.root.name = "independent-visual-name";
      const body = asset.root.getObjectByName("projector-body");
      if (body) body.position.y += 0.015;
      return { ...asset, assetId: "fiction:replacement" };
    });
    expect(visual.node).toBe(node);
    expect(node.position).toEqual(position);
    expect(node.children).toEqual([visual.representation.root]);
    expect(old.root.children).toHaveLength(0);
    expect(visual.representation.identity).toMatchObject({
      entryId: "fiction",
      instanceId: "record:fiction",
      modelTypeId,
    });
    // Collider IDs identify the new component owner; geometry and route profile are invariant.
    expect(
      collectInhabitantObstacles([node]).map(({ minX, maxX, minZ, maxZ }) => ({
        minX,
        maxX,
        minZ,
        maxZ,
      })),
    ).toEqual(
      before.map(({ minX, maxX, minZ, maxZ }) => ({ minX, maxX, minZ, maxZ })),
    );
    interaction.refreshHighlightForSelectedObject(visual.instanceId);
    interaction.selectObject(null);
    tap();
    expect(selection).toHaveBeenLastCalledWith(descriptor);
    const highlight = scene.children.find((o) => o.type === "Box3Helper");
    expect(highlight).toBeDefined();
    if (highlight)
      expect(
        new Box3().setFromObject(highlight).getSize(new Vector3()).length(),
      ).toBeGreaterThan(0);
    const current = visual.representation;
    expect(() =>
      replaceLibraryRecordRepresentation(visual, () => current),
    ).toThrow("asset independente");
    expect(visual.representation).toBe(current);
    expect(node.children).toHaveLength(1);
    expect(() =>
      replaceLibraryRecordRepresentation(visual, (identity) =>
        createRecordAsset({ ...identity, entryId: "different" }),
      ),
    ).toThrow("identidade");
    expect(visual.representation).toBe(current);
    expect(() =>
      replaceLibraryRecordRepresentation(visual, (identity) => {
        const asset = createRecordAsset(identity);
        asset.root.position.x = 5;
        return asset;
      }),
    ).toThrow("Bounds");
    expect(() =>
      replaceLibraryRecordRepresentation(visual, (identity) => {
        const asset = createRecordAsset(identity);
        asset.spatial.navigation[0].expandByScalar(0.1);
        return asset;
      }),
    ).toThrow("navegável");
    expect(visual.representation).toBe(current);
    const mesh = visual.representation.root.children.find(isMesh);
    expect(mesh).toBeDefined();
    interaction.dispose();
    disposeObjectTree(scene);
    vi.restoreAllMocks();
  },
);
