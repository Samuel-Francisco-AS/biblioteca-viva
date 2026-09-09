import {
  Box3,
  Box3Helper,
  Object3D,
  OrthographicCamera,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
} from "three";

import type { WorldSelectableObject, WorldSelection } from "../worldRuntime";
import {
  exceedsTapDragThreshold,
  panDistanceForPixels,
  pointerDistance,
  zoomFromPinch,
  zoomFromWheel,
  type PointerPosition,
} from "./interactionMath";
import type { ReferenceSelectableObject } from "./referenceScene";

type GestureMode = "idle" | "tap" | "pan" | "pinch";

interface ActivePointer {
  readonly id: number;
  readonly start: PointerPosition;
  current: PointerPosition;
  previous: PointerPosition;
}

interface ThreeWorldInteractionOptions {
  readonly camera: OrthographicCamera;
  readonly canvas: HTMLCanvasElement;
  readonly catalog: readonly WorldSelectableObject[];
  readonly onSelectionChange: (selection: WorldSelection) => void;
  readonly render: () => void;
  readonly scene: Scene;
  readonly selectables: readonly ReferenceSelectableObject[];
}

const CAMERA_TARGET_BOUNDS = {
  maxX: 4.5,
  maxY: 3,
  maxZ: 4.5,
  minX: -4.5,
  minY: 0,
  minZ: -4.5,
} as const;

const TEST_PICK_OBJECT_ID = "crate-01";

export class ThreeWorldInteraction {
  private readonly activePointers = new Map<number, ActivePointer>();
  private readonly camera: OrthographicCamera;
  private readonly cameraTarget = new Vector3(0, 1.1, 0);
  private readonly canvas: HTMLCanvasElement;
  private disposed = false;
  private gestureMode: GestureMode = "idle";
  private highlight: Box3Helper | undefined;
  private pinchInitialDistance = 0;
  private pinchInitialZoom = 1;
  private readonly raycaster = new Raycaster();
  private readonly render: () => void;
  private readonly scene: Scene;
  private selectedId: string | null = null;
  private readonly selectableDescriptors = new Map<
    string,
    WorldSelectableObject
  >();
  private readonly selectableRoots = new Map<string, Object3D>();
  private readonly selectableRootIds = new Map<Object3D, string>();
  private viewportHeight = 1;
  private viewportWidth = 1;
  private readonly onSelectionChange: (selection: WorldSelection) => void;

  constructor(options: ThreeWorldInteractionOptions) {
    this.camera = options.camera;
    this.canvas = options.canvas;
    this.onSelectionChange = options.onSelectionChange;
    this.render = options.render;
    this.scene = options.scene;
    for (const descriptor of options.catalog) {
      this.selectableDescriptors.set(descriptor.id, descriptor);
    }
    for (const selectable of options.selectables) {
      this.registerSelectableRoot(selectable.descriptor.id, selectable.root);
    }

    this.canvas.addEventListener("pointerdown", this.handlePointerDown);
    this.canvas.addEventListener("pointermove", this.handlePointerMove);
    this.canvas.addEventListener("pointerup", this.handlePointerUp);
    this.canvas.addEventListener("pointercancel", this.handlePointerCancel);
    this.canvas.addEventListener(
      "lostpointercapture",
      this.handlePointerCancel,
    );
    this.canvas.addEventListener("wheel", this.handleWheel, { passive: false });
    this.canvas.dataset.highlightedObject = "";
    this.canvas.dataset.selectedObject = "";
    this.updateDiagnostics();
  }

  addSelectable(descriptor: WorldSelectableObject, root: Object3D): void {
    if (this.disposed) return;
    this.selectableDescriptors.set(descriptor.id, descriptor);
    this.registerSelectableRoot(descriptor.id, root);
    if (this.selectedId === descriptor.id) {
      this.applyHighlight(root);
      this.render();
    }
    this.updateDiagnostics();
  }

  cancelActiveGestures(): void {
    if (this.disposed) return;
    for (const pointerId of this.activePointers.keys()) {
      this.releasePointer(pointerId);
    }
    this.activePointers.clear();
    this.resetGesture();
  }

  dispose(): void {
    if (this.disposed) return;
    this.cancelActiveGestures();
    this.disposed = true;
    this.canvas.removeEventListener("pointerdown", this.handlePointerDown);
    this.canvas.removeEventListener("pointermove", this.handlePointerMove);
    this.canvas.removeEventListener("pointerup", this.handlePointerUp);
    this.canvas.removeEventListener("pointercancel", this.handlePointerCancel);
    this.canvas.removeEventListener(
      "lostpointercapture",
      this.handlePointerCancel,
    );
    this.canvas.removeEventListener("wheel", this.handleWheel);
    this.clearHighlight();
    this.selectableRoots.clear();
    this.selectableRootIds.clear();
  }

  selectObject(id: string | null): void {
    if (this.disposed) return;
    const nextId =
      id !== null && this.selectableDescriptors.has(id) ? id : null;
    if (nextId === this.selectedId) return;

    this.selectedId = nextId;
    this.clearHighlight();
    const root = nextId === null ? undefined : this.selectableRoots.get(nextId);
    if (root) this.applyHighlight(root);
    this.canvas.dataset.selectedObject = nextId ?? "";
    this.canvas.dataset.highlightedObject = root ? (nextId ?? "") : "";
    this.onSelectionChange(
      nextId === null ? null : (this.selectableDescriptors.get(nextId) ?? null),
    );
    this.render();
    this.updateDiagnostics();
  }

  setViewport(width: number, height: number): void {
    this.viewportWidth = Math.max(1, width);
    this.viewportHeight = Math.max(1, height);
    this.updateDiagnostics();
  }

  private applyHighlight(root: Object3D): void {
    const bounds = new Box3().setFromObject(root);
    if (bounds.isEmpty()) return;
    const highlight = new Box3Helper(bounds, 0x45d9ff);
    highlight.name = "f1-c-selection-highlight";
    this.scene.add(highlight);
    this.highlight = highlight;
    this.canvas.dataset.highlightedObject = this.selectedId ?? "";
  }

  private readonly handlePointerCancel = (event: PointerEvent): void => {
    if (!this.activePointers.has(event.pointerId)) return;
    this.activePointers.delete(event.pointerId);
    this.releasePointer(event.pointerId);
    if (this.activePointers.size === 0) this.resetGesture();
  };

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (
      this.disposed ||
      (event.pointerType === "mouse" && event.button !== 0)
    ) {
      return;
    }
    event.preventDefault();
    const position = { x: event.clientX, y: event.clientY };
    this.activePointers.set(event.pointerId, {
      current: position,
      id: event.pointerId,
      previous: position,
      start: position,
    });
    this.capturePointer(event.pointerId);

    if (this.activePointers.size === 1) {
      this.gestureMode = "tap";
    } else {
      this.beginPinch();
    }
    this.updateGestureDiagnostic();
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    const pointer = this.activePointers.get(event.pointerId);
    if (this.disposed || !pointer) return;
    event.preventDefault();
    pointer.previous = pointer.current;
    pointer.current = { x: event.clientX, y: event.clientY };

    if (this.activePointers.size >= 2) {
      if (this.gestureMode !== "pinch") this.beginPinch();
      this.updatePinch();
      return;
    }

    if (
      this.gestureMode === "tap" &&
      exceedsTapDragThreshold(pointer.start, pointer.current)
    ) {
      this.gestureMode = "pan";
      this.updateGestureDiagnostic();
    }
    if (this.gestureMode === "pan") {
      this.applyPan(
        pointer.current.x - pointer.previous.x,
        pointer.current.y - pointer.previous.y,
      );
    }
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    const pointer = this.activePointers.get(event.pointerId);
    if (this.disposed || !pointer) return;
    event.preventDefault();
    pointer.current = { x: event.clientX, y: event.clientY };
    const shouldPick =
      this.gestureMode === "tap" &&
      this.activePointers.size === 1 &&
      !exceedsTapDragThreshold(pointer.start, pointer.current);

    this.activePointers.delete(event.pointerId);
    this.releasePointer(event.pointerId);
    if (shouldPick) this.pick(pointer.current);
    if (this.activePointers.size === 0) this.resetGesture();
  };

  private readonly handleWheel = (event: WheelEvent): void => {
    if (this.disposed) return;
    event.preventDefault();
    const nextZoom = zoomFromWheel(this.camera.zoom, event.deltaY);
    if (nextZoom === this.camera.zoom) return;
    this.camera.zoom = nextZoom;
    this.camera.updateProjectionMatrix();
    this.render();
    this.updateDiagnostics();
  };

  private applyPan(deltaX: number, deltaY: number): void {
    this.camera.updateMatrixWorld();
    const horizontal = panDistanceForPixels(
      deltaX,
      this.camera.right - this.camera.left,
      this.viewportWidth,
      this.camera.zoom,
    );
    const vertical = panDistanceForPixels(
      deltaY,
      this.camera.top - this.camera.bottom,
      this.viewportHeight,
      this.camera.zoom,
    );
    const right = new Vector3()
      .setFromMatrixColumn(this.camera.matrixWorld, 0)
      .normalize();
    const up = new Vector3()
      .setFromMatrixColumn(this.camera.matrixWorld, 1)
      .normalize();
    const desiredTarget = this.cameraTarget
      .clone()
      .addScaledVector(right, -horizontal)
      .addScaledVector(up, vertical);
    desiredTarget.set(
      Math.min(
        CAMERA_TARGET_BOUNDS.maxX,
        Math.max(CAMERA_TARGET_BOUNDS.minX, desiredTarget.x),
      ),
      Math.min(
        CAMERA_TARGET_BOUNDS.maxY,
        Math.max(CAMERA_TARGET_BOUNDS.minY, desiredTarget.y),
      ),
      Math.min(
        CAMERA_TARGET_BOUNDS.maxZ,
        Math.max(CAMERA_TARGET_BOUNDS.minZ, desiredTarget.z),
      ),
    );
    const appliedDelta = desiredTarget.clone().sub(this.cameraTarget);
    if (appliedDelta.lengthSq() === 0) return;
    this.camera.position.add(appliedDelta);
    this.cameraTarget.copy(desiredTarget);
    this.camera.lookAt(this.cameraTarget);
    this.render();
    this.updateDiagnostics();
  }

  private beginPinch(): void {
    const pointers = [...this.activePointers.values()];
    if (pointers.length < 2) return;
    this.gestureMode = "pinch";
    this.pinchInitialDistance = pointerDistance(
      pointers[0]?.current ?? { x: 0, y: 0 },
      pointers[1]?.current ?? { x: 0, y: 0 },
    );
    this.pinchInitialZoom = this.camera.zoom;
    this.updateGestureDiagnostic();
  }

  private capturePointer(pointerId: number): void {
    try {
      this.canvas.setPointerCapture?.(pointerId);
    } catch {
      // Synthetic events and interrupted native gestures may not be capturable.
    }
  }

  private clearHighlight(): void {
    if (!this.highlight) return;
    this.highlight.removeFromParent();
    this.highlight.geometry.dispose();
    if (Array.isArray(this.highlight.material)) {
      for (const material of this.highlight.material) material.dispose();
    } else {
      this.highlight.material.dispose();
    }
    this.highlight = undefined;
    this.canvas.dataset.highlightedObject = "";
  }

  private pick(position: PointerPosition): void {
    const bounds = this.canvas.getBoundingClientRect();
    const width = bounds.width || this.viewportWidth;
    const height = bounds.height || this.viewportHeight;
    if (width <= 0 || height <= 0) return;
    const pointer = new Vector2(
      ((position.x - bounds.left) / width) * 2 - 1,
      -((position.y - bounds.top) / height) * 2 + 1,
    );
    this.camera.updateMatrixWorld();
    this.scene.updateMatrixWorld(true);
    this.raycaster.setFromCamera(pointer, this.camera);
    const intersections = this.raycaster.intersectObjects(
      [...this.selectableRoots.values()],
      true,
    );
    const selectedId = intersections
      .map((intersection) => this.findSelectableId(intersection.object))
      .find((id) => id !== undefined);
    this.selectObject(selectedId ?? null);
  }

  private findSelectableId(object: Object3D): string | undefined {
    let current: Object3D | null = object;
    while (current) {
      const id = this.selectableRootIds.get(current);
      if (id) return id;
      current = current.parent;
    }
    return undefined;
  }

  private registerSelectableRoot(id: string, root: Object3D): void {
    this.selectableRoots.set(id, root);
    this.selectableRootIds.set(root, id);
  }

  private releasePointer(pointerId: number): void {
    try {
      if (this.canvas.hasPointerCapture?.(pointerId)) {
        this.canvas.releasePointerCapture?.(pointerId);
      }
    } catch {
      // Capture may already have been released by the browser.
    }
  }

  private resetGesture(): void {
    this.gestureMode = "idle";
    this.pinchInitialDistance = 0;
    this.pinchInitialZoom = this.camera.zoom;
    this.updateGestureDiagnostic();
  }

  private updateDiagnostics(): void {
    this.canvas.dataset.cameraTargetX = this.cameraTarget.x.toFixed(3);
    this.canvas.dataset.cameraTargetY = this.cameraTarget.y.toFixed(3);
    this.canvas.dataset.cameraTargetZ = this.cameraTarget.z.toFixed(3);
    this.canvas.dataset.cameraZoom = this.camera.zoom.toFixed(3);
    this.canvas.dataset.gesture = this.gestureMode;
    this.canvas.dataset.selectableObjects = String(
      this.selectableDescriptors.size,
    );
    this.updateTestPickDiagnostic();
  }

  private updateGestureDiagnostic(): void {
    this.canvas.dataset.gesture = this.gestureMode;
  }

  private updatePinch(): void {
    const pointers = [...this.activePointers.values()];
    if (pointers.length < 2) return;
    const distance = pointerDistance(
      pointers[0]?.current ?? { x: 0, y: 0 },
      pointers[1]?.current ?? { x: 0, y: 0 },
    );
    const nextZoom = zoomFromPinch(
      this.pinchInitialZoom,
      this.pinchInitialDistance,
      distance,
    );
    if (nextZoom === this.camera.zoom) return;
    this.camera.zoom = nextZoom;
    this.camera.updateProjectionMatrix();
    this.render();
    this.updateDiagnostics();
  }

  private updateTestPickDiagnostic(): void {
    const root = this.selectableRoots.get(TEST_PICK_OBJECT_ID);
    if (!root) return;
    this.camera.updateMatrixWorld();
    this.scene.updateMatrixWorld(true);
    const center = new Box3().setFromObject(root).getCenter(new Vector3());
    center.project(this.camera);
    this.canvas.dataset.testPickObject = TEST_PICK_OBJECT_ID;
    this.canvas.dataset.testPickX = (
      ((center.x + 1) / 2) *
      this.viewportWidth
    ).toFixed(2);
    this.canvas.dataset.testPickY = (
      ((1 - center.y) / 2) *
      this.viewportHeight
    ).toFixed(2);
  }
}
