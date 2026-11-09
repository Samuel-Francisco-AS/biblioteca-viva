import type { PerformanceProbe } from "./performanceProbe";
import { withPreparedSkinning } from "./preparedSkinning";
import {
  Box3,
  Box3Helper,
  Matrix4,
  Object3D,
  OrthographicCamera,
  Raycaster,
  Scene,
  SkinnedMesh,
  type Intersection,
  Vector2,
  Vector3,
} from "three";

import type { WorldSelectableObject, WorldSelection } from "../worldRuntime";
import {
  TAP_DRAG_THRESHOLD_PX,
  exceedsTapDragThreshold,
  pointerDistance,
  zoomFromPinch,
  zoomFromWheel,
  type PointerPosition,
} from "./interactionMath";
import { CameraNavigation } from "./CameraNavigation";
import { CAMERA_TARGET_Y } from "./cameraMath";
import type { ReferenceSelectableObject } from "./referenceScene";
import { findExpandedLivingTap } from "./smallLivingTapTargets";
import { WorldPickBroadphase } from "./worldPickBroadphase";
import { InhabitantTouchVolumes } from "./inhabitantTouchVolumes";

type GestureMode = "idle" | "tap" | "pan" | "pinch";

interface ActivePointer {
  readonly id: number;
  readonly start: PointerPosition;
  current: PointerPosition;
  previous: PointerPosition;
}

interface ThreeWorldInteractionOptions {
  readonly probe?: PerformanceProbe;
  readonly onPickStart?: () => void;
  /** Runtime opt-in: let pressed feedback paint before CPU picking. */
  readonly deferPicking?: boolean;
  /** Enable conservative root-level rejection before exact triangle testing. */
  readonly fastPicking?: boolean;
  /** R4 production opt-in: stable mobile hitboxes instead of CPU skinning. */
  readonly inhabitantVolumePicking?: boolean;
  readonly camera: OrthographicCamera;
  readonly canvas: HTMLCanvasElement;
  readonly catalog: readonly WorldSelectableObject[];
  readonly navigation: CameraNavigation;
  readonly onSelectionChange: (selection: WorldSelection) => void;
  readonly onTapObject?: (id: string) => void;
  readonly pickingPriorityRoots?: readonly Object3D[];
  readonly render: () => void;
  readonly scene: Scene;
  readonly selectables: readonly ReferenceSelectableObject[];
}

const TEST_PICK_OBJECT_ID = "crate-01";

export class ThreeWorldInteraction {
  private readonly probe?: PerformanceProbe;
  private readonly onPickStart?: () => void;
  private readonly deferPicking: boolean;
  private readonly fastPicking: boolean;
  private readonly inhabitantVolumePicking: boolean;
  private readonly inhabitantTouchVolumes = new InhabitantTouchVolumes();
  private readonly broadphase = new WorldPickBroadphase();
  private pendingPickCancel?: () => void;
  private highlightFollower?: { root: Object3D; local: Box3 };
  private readonly activePointers = new Map<number, ActivePointer>();
  private readonly camera: OrthographicCamera;
  private readonly canvas: HTMLCanvasElement;
  private disposed = false;
  private gestureMode: GestureMode = "idle";
  private highlight: Box3Helper | undefined;
  private pinchPreviousDistance = 0;
  private pinchPreviousMidpoint: PointerPosition | undefined;
  private readonly raycaster = new Raycaster();
  private readonly render: () => void;
  private readonly scene: Scene;
  private readonly pickingPriorityRoots: readonly Object3D[];
  private readonly environmentalRootSet = new Set<Object3D>();
  private readonly pickingPriorityRootSet: ReadonlySet<Object3D>;
  private pickingRoots: Object3D[] = [];
  private pickingRootsDirty = true;
  private readonly pickPointer = new Vector2();
  private readonly pickIntersections: Intersection[] = [];
  private selectedId: string | null = null;
  private readonly selectableDescriptors = new Map<
    string,
    WorldSelectableObject
  >();
  private readonly selectableRoots = new Map<string, Object3D>();
  private readonly selectableRootIds = new Map<Object3D, string>();
  private viewportHeight = 1;
  private viewportWidth = 1;
  // A tap can only be confirmed by the pointer that started this candidate.
  // This flag is deliberately monotonic for one gesture: interruptions,
  // multi-pointer input and movement beyond the CSS-pixel slop never revive it.
  private tapCandidatePointerId: number | undefined;
  private tapEligible = false;
  private readonly onSelectionChange: (selection: WorldSelection) => void;
  private readonly onTapObject?: (id: string) => void;
  private readonly navigation: CameraNavigation;

  constructor(options: ThreeWorldInteractionOptions) {
    this.probe = options.probe;
    this.onPickStart = options.onPickStart;
    this.deferPicking = options.deferPicking ?? false;
    this.fastPicking = options.fastPicking ?? false;
    this.inhabitantVolumePicking = options.inhabitantVolumePicking ?? false;
    this.camera = options.camera;
    this.canvas = options.canvas;
    this.navigation = options.navigation;
    this.onSelectionChange = options.onSelectionChange;
    this.onTapObject = options.onTapObject;
    this.pickingPriorityRoots = options.pickingPriorityRoots ?? [];
    this.pickingPriorityRootSet = new Set(this.pickingPriorityRoots);
    this.render = options.render;
    this.scene = options.scene;
    for (const descriptor of options.catalog) {
      this.selectableDescriptors.set(descriptor.id, descriptor);
    }
    for (const selectable of options.selectables) {
      this.registerSelectableRoot(selectable.descriptor.id, selectable.root);
    }

    try {
      this.canvas.addEventListener("pointerdown", this.handlePointerDown);
      this.canvas.addEventListener("pointermove", this.handlePointerMove);
      this.canvas.addEventListener("pointerup", this.handlePointerUp);
      this.canvas.addEventListener("pointercancel", this.handlePointerCancel);
      this.canvas.addEventListener(
        "lostpointercapture",
        this.handlePointerCancel,
      );
      this.canvas.addEventListener("wheel", this.handleWheel, {
        passive: false,
      });
      this.canvas.dataset.highlightedObject = "";
      this.canvas.dataset.selectedObject = "";
      this.updateDiagnostics();
    } catch (error) {
      this.dispose();
      throw error;
    }
  }

  addSelectable(descriptor: WorldSelectableObject, root: Object3D): void {
    if (this.disposed) return;
    this.selectableDescriptors.set(descriptor.id, descriptor);
    this.registerSelectableRoot(descriptor.id, root);
    if (this.selectedId === descriptor.id) {
      this.clearHighlight();
      this.applyHighlight(root);
      this.render();
    }
    this.updateDiagnostics();
  }

  /** Removes one dynamic root without disturbing other selectable objects. */
  removeSelectable(id: string): void {
    if (this.disposed || !this.selectableDescriptors.has(id)) return;
    const root = this.selectableRoots.get(id);
    this.selectableDescriptors.delete(id);
    if (root) {
      this.selectableRoots.delete(id);
      this.selectableRootIds.delete(root);
      this.environmentalRootSet.delete(root);
      this.broadphase.invalidate(root);
      this.pickingRootsDirty = true;
    }
    if (this.selectedId === id) this.selectObject(null);
    this.updateDiagnostics();
  }

  cancelActiveGestures(): void {
    if (this.disposed) return;
    this.cancelPendingPick();
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
    this.canvas.parentElement?.removeAttribute("data-world-touch");
    this.clearHighlight();
    this.selectableRoots.clear();
    this.selectableRootIds.clear();
    this.environmentalRootSet.clear();
    this.pickingRoots = [];
    this.pickIntersections.length = 0;
  }

  private cancelPendingPick(): void {
    this.pendingPickCancel?.();
    this.pendingPickCancel = undefined;
  }

  selectObject(id: string | null, preparedBounds?: Box3): void {
    if (this.disposed) return;
    const nextId =
      id !== null && this.selectableDescriptors.has(id) ? id : null;
    if (nextId === this.selectedId) return;

    this.selectedId = nextId;
    this.clearHighlight();
    const root = nextId === null ? undefined : this.selectableRoots.get(nextId);
    if (root) this.applyHighlight(root, preparedBounds);
    this.canvas.dataset.selectedObject = nextId ?? "";
    this.canvas.dataset.highlightedObject = root ? (nextId ?? "") : "";
    this.probe?.markQuest("publishStart");
    this.onSelectionChange(
      nextId === null ? null : (this.selectableDescriptors.get(nextId) ?? null),
    );
    this.probe?.markQuest("publishEnd");
    this.render();
    this.updateDiagnostics();
  }

  /** Rebuilds only the active helper after a stable selectable root changes. */
  refreshHighlightForSelectedObject(id: string): void {
    if (this.disposed) return;
    const root = this.selectableRoots.get(id);
    if (!root) return;
    if (this.fastPicking) this.broadphase.register(root, id);
    if (this.selectedId !== id) return;
    this.clearHighlight();
    this.applyHighlight(root);
    this.render();
    this.updateDiagnostics();
  }

  /** Follow articulated bounds without rebuilding helper resources per frame. */
  updateHighlightBounds(): void {
    if (this.disposed || !this.highlight || !this.selectedId) return;
    const root = this.selectableRoots.get(this.selectedId);
    if (root) {
      root.updateWorldMatrix(true, false);
      // Only visual decoration: reuse a slightly generous local envelope
      // for articulated inhabitants and orbiting constructions. Exact
      // skinning remains in picking, not in every animation frame.
      if (this.highlightFollower?.root === root) {
        this.highlight.box
          .copy(this.highlightFollower.local)
          .applyMatrix4(root.matrixWorld);
      } else {
        root.updateMatrixWorld(true);
        this.highlight.box.setFromObject(root);
      }
    }
  }

  setViewport(width: number, height: number): void {
    this.viewportWidth = Math.max(1, width);
    this.viewportHeight = Math.max(1, height);
    this.updateDiagnostics();
  }

  private applyHighlight(root: Object3D, preparedBounds?: Box3): void {
    this.probe?.markQuest("highlightStart");
    root.updateWorldMatrix(true, false);
    const actorBounds =
      this.inhabitantVolumePicking && this.selectedId
        ? this.inhabitantTouchVolumes.bounds(this.selectedId)
        : null;
    const bounds = actorBounds
      ? actorBounds.applyMatrix4(root.matrixWorld)
      : preparedBounds ?? new Box3();
    if (!actorBounds) {
      root.updateMatrixWorld(true);
      if (!preparedBounds) {
        if (this.selectedId?.startsWith("character:"))
          withPreparedSkinning([root], () => bounds.setFromObject(root, true));
        else bounds.setFromObject(root);
      }
    }
    if (bounds.isEmpty()) return;
    if (
      this.selectedId?.startsWith("character:") ||
      this.selectedId === "portal:duelo-arcano"
    ) {
      const local = actorBounds
        ? this.inhabitantTouchVolumes.bounds(this.selectedId ?? "")
        : bounds.clone().applyMatrix4(
            new Matrix4().copy(root.matrixWorld).invert(),
          );
      if (!local) return;
      const size = local.getSize(new Vector3());
      // The envelope covers arm gestures and grimoire rotation without
      // precise per-vertex CPU scans while the frame loop is running.
      local.expandByScalar(Math.max(size.x, size.y, size.z) * 0.09);
      this.highlightFollower = { root, local };
    }
    const highlight = new Box3Helper(bounds, 0x45d9ff);
    highlight.name = "f1-c-selection-highlight";
    this.scene.add(highlight);
    this.highlight = highlight;
    this.probe?.markQuest("highlightEnd");
    this.canvas.dataset.highlightedObject = this.selectedId ?? "";
  }

  private readonly handlePointerCancel = (event: PointerEvent): void => {
    if (!this.activePointers.has(event.pointerId)) return;
    this.invalidateTapCandidate();
    this.activePointers.delete(event.pointerId);
    this.releasePointer(event.pointerId);
    this.continueAfterPointerEnd();
  };

  private touchEcho(
    state: "pressed" | "resolving" | "released" | "cancelled",
    event?: PointerEvent,
  ): void {
    const host = this.canvas.parentElement;
    if (!host?.classList.contains("world-host")) return;
    if (event) {
      // Offset coordinates are already CSS pixels; avoid layout reads on down.
      host.style.setProperty("--world-touch-x", `${event.offsetX}px`);
      host.style.setProperty("--world-touch-y", `${event.offsetY}px`);
    }
    host.dataset.worldTouch = state;
  }

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (
      this.disposed ||
      (event.pointerType === "mouse" && event.button !== 0)
    ) {
      return;
    }
    if (this.activePointers.size >= 2) return;
    this.cancelPendingPick();
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
      this.beginTapCandidate(event.pointerId);
      this.gestureMode = "tap";
      this.touchEcho("pressed", event);
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

    if (this.gestureMode === "tap" && !this.remainsTapEligible(pointer)) {
      this.gestureMode = "pan";
      // Consume only the classification slop, preserving the remainder of a
      // fast first move. A one-move drag must move the world too.
      const dx = pointer.current.x - pointer.start.x;
      const dy = pointer.current.y - pointer.start.y;
      const length = Math.hypot(dx, dy);
      const ratio = TAP_DRAG_THRESHOLD_PX / length;
      this.applyPan(
        {
          x: pointer.start.x + dx * ratio,
          y: pointer.start.y + dy * ratio,
        },
        pointer.current,
      );
      this.updateGestureDiagnostic();
      return;
    }
    if (this.gestureMode === "pan") {
      this.applyPan(pointer.previous, pointer.current);
    }
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    const pointer = this.activePointers.get(event.pointerId);
    if (this.disposed || !pointer) return;
    event.preventDefault();
    pointer.current = { x: event.clientX, y: event.clientY };
    this.remainsTapEligible(pointer);
    const shouldPick =
      this.gestureMode === "tap" &&
      this.activePointers.size === 1 &&
      this.tapEligible &&
      this.tapCandidatePointerId === event.pointerId;

    this.activePointers.delete(event.pointerId);
    this.releasePointer(event.pointerId);
    // The halo completes on compositor time, independently of hit-testing.
    // An empty tap must not wait for the second RAF or a raycast to release.
    this.touchEcho(shouldPick ? "released" : "cancelled");
    if (shouldPick) {
      this.onPickStart?.();
      const position = { ...pointer.current };
      const finish = () => {
        if (this.disposed) return;
        this.pick(position);
        this.probe?.markQuest("handlerEnd");
      };
      const reduced =
        document.querySelector('[data-reduced-motion="true"]') !== null ||
        (typeof window.matchMedia === "function" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      // In production, separate the visual acknowledgement from the costly
      // geometry + React publication. Tests may opt into immediate selection.
      if (
        this.deferPicking &&
        !this.inhabitantVolumePicking &&
        !reduced &&
        !document.hidden &&
        typeof requestAnimationFrame === "function"
      ) {
        let nextFrame = 0;
        const firstFrame = requestAnimationFrame(() => {
          nextFrame = requestAnimationFrame(() => {
            this.pendingPickCancel = undefined;
            finish();
          });
        });
        this.pendingPickCancel = () => {
          cancelAnimationFrame(firstFrame);
          if (nextFrame) cancelAnimationFrame(nextFrame);
          this.touchEcho("cancelled");
        };
      } else {
        finish();
      }
    }
    this.continueAfterPointerEnd();
  };

  private readonly handleWheel = (event: WheelEvent): void => {
    if (this.disposed) return;
    event.preventDefault();
    if (this.activePointers.size > 0) {
      // Wheel is never a selection gesture. Ending a current candidate here
      // also makes a later pointerup inert if desktop input interleaves them.
      this.invalidateTapCandidate();
      if (this.gestureMode === "tap") {
        this.gestureMode = "pan";
        this.updateGestureDiagnostic();
      }
    }
    const anchor = this.viewportPosition({
      x: event.clientX,
      y: event.clientY,
    });
    if (!anchor) return;
    const nextZoom = zoomFromWheel(
      this.navigation.getState().zoom,
      event.deltaY,
      event.deltaMode,
      this.viewportHeight,
    );
    if (!this.navigation.zoomBetweenScreenPoints(anchor, anchor, nextZoom)) {
      return;
    }
    this.render();
    this.updateDiagnostics();
  };

  private applyPan(previous: PointerPosition, current: PointerPosition): void {
    const bounds = this.canvas.getBoundingClientRect();
    const previousPosition = this.viewportPosition(previous, bounds);
    const currentPosition = this.viewportPosition(current, bounds);
    if (
      !previousPosition ||
      !currentPosition ||
      !this.navigation.panBetweenScreenPoints(previousPosition, currentPosition)
    ) {
      return;
    }
    this.render();
    this.updateDiagnostics();
  }

  private beginPinch(): void {
    const pointers = [...this.activePointers.values()];
    if (pointers.length < 2) return;
    this.invalidateTapCandidate();
    this.gestureMode = "pinch";
    this.pinchPreviousDistance = pointerDistance(
      pointers[0]?.current ?? { x: 0, y: 0 },
      pointers[1]?.current ?? { x: 0, y: 0 },
    );
    this.pinchPreviousMidpoint = this.pinchMidpoint(pointers);
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
    this.highlightFollower = undefined;
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

  private continueAfterPointerEnd(): void {
    if (this.activePointers.size === 0) {
      this.resetGesture();
      return;
    }
    if (this.activePointers.size === 1 && this.gestureMode === "pinch") {
      // The remaining pointer must not inherit the pinch origin or turn the
      // end of a two-finger gesture into a tap. Its next movement is a fresh
      // pan delta from its own latest position.
      this.gestureMode = "pan";
      this.updateGestureDiagnostic();
    }
  }

  private beginTapCandidate(pointerId: number): void {
    this.tapCandidatePointerId = pointerId;
    this.tapEligible = true;
  }

  private invalidateTapCandidate(): void {
    this.tapCandidatePointerId = undefined;
    this.tapEligible = false;
    this.touchEcho("cancelled");
  }

  private remainsTapEligible(pointer: ActivePointer): boolean {
    if (!this.tapEligible || this.tapCandidatePointerId !== pointer.id) {
      return false;
    }
    if (
      !exceedsTapDragThreshold(
        pointer.start,
        pointer.current,
        TAP_DRAG_THRESHOLD_PX,
      )
    ) {
      return true;
    }
    this.invalidateTapCandidate();
    return false;
  }

  private pick(position: PointerPosition): void {
    this.probe?.markQuest("pickStart");
    const bounds = this.canvas.getBoundingClientRect();
    const { height, width } = bounds;
    if (
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      width <= 0 ||
      height <= 0
    ) {
      return;
    }
    this.pickPointer.set(
      ((position.x - bounds.left) / width) * 2 - 1,
      -((position.y - bounds.top) / height) * 2 + 1,
    );
    this.camera.updateMatrixWorld();
    this.raycaster.setFromCamera(this.pickPointer, this.camera);
    const allRoots = this.getPickingRoots();
    const roots = this.fastPicking
      ? allRoots.filter((root) =>
          this.broadphase.mayIntersect(
            root,
            this.selectableRootIds.get(root),
            this.raycaster.ray,
          ),
        )
      : allRoots;
    // Test each inhabitant against an invisible authored interaction volume.
    // These roots must never descend into SkinnedMesh geometry during picking.
    const actorRoots = this.inhabitantVolumePicking
      ? roots.filter((root) =>
          this.inhabitantTouchVolumes.has(this.selectableRootIds.get(root)),
        )
      : [];
    const exactRoots = actorRoots.length
      ? roots.filter((root) => !actorRoots.includes(root))
      : roots;
    // A broadphase miss does not prepare skeletons or intersect any triangles.
    // The small-prop expanded hit target is retained as a separate fallback.
    if (roots.length === 0) {
      this.canvas.dataset.pickCandidateRoots = "0";
      this.canvas.dataset.pickSkippedRoots = String(allRoots.length);
      this.selectObject(
        findExpandedLivingTap(
          this.selectableRoots,
          this.camera,
          bounds,
          position,
        ) ?? null,
      );
      this.probe?.markQuest("pickEnd");
      return;
    }
    this.canvas.dataset.pickCandidateRoots = String(roots.length);
    this.canvas.dataset.pickSkippedRoots = String(allRoots.length - roots.length);
    // Update only exact raycast candidates. Updating an avatar's whole rig
    // tree synchronously here would reintroduce the R3 50–140 ms spike.
    for (const root of exactRoots) {
      root.updateWorldMatrix(true, false);
      root.updateMatrixWorld(true);
    }
    const { selectedId, preparedBounds } = withPreparedSkinning(
      exactRoots,
      () => {
        for (const root of exactRoots)
          root.traverse((node) => {
            if (node instanceof SkinnedMesh) {
              node.computeBoundingBox();
              node.computeBoundingSphere();
            }
          });
        this.probe?.markQuest("prepared");
        this.pickIntersections.length = 0;
        this.probe?.markQuest("raycastStart");
        this.raycaster.intersectObjects(exactRoots, true, this.pickIntersections);
        // Only mathematical ray/box tests for avatars. Preserve the common
        // distance ordering with all exact meshes and original priority rules.
        for (const root of actorRoots) {
          const id = this.selectableRootIds.get(root);
          if (!id) continue;
          const hit = this.inhabitantTouchVolumes.intersect(
            root,
            id,
            this.raycaster.ray,
          );
          if (hit) this.pickIntersections.push(hit as Intersection);
        }
        if (actorRoots.length > 0)
          this.pickIntersections.sort((a, b) => a.distance - b.distance);
        this.canvas.dataset.pickActorVolumes = String(actorRoots.length);
        this.probe?.markQuest("raycastEnd");
        // A separately registered child of an avatar (for example a book
        // attached to a character) takes precedence over the synthetic
        // avatar volume. This is independent of proxy-box front faces.
        if (this.inhabitantVolumePicking) {
          const nestedAvatarIds = new Set<string>();
          for (const hit of this.pickIntersections) {
            const id = this.findSelectableId(hit.object);
            if (!id || this.inhabitantTouchVolumes.has(id)) continue;
            let parent: Object3D | null = hit.object.parent;
            while (parent) {
              const parentId = this.selectableRootIds.get(parent);
              if (parentId && this.inhabitantTouchVolumes.has(parentId)) {
                nestedAvatarIds.add(parentId);
                break;
              }
              parent = parent.parent;
            }
          }
          if (nestedAvatarIds.size)
            for (let i = this.pickIntersections.length - 1; i >= 0; i--) {
              const hit = this.pickIntersections[i];
              if (
                hit &&
                nestedAvatarIds.has(this.selectableRootIds.get(hit.object) ?? "")
              ) this.pickIntersections.splice(i, 1);
            }
        }
        let priority: Intersection | undefined;
        let environmental: Intersection | undefined;
        let fallback: Intersection | undefined;
        for (const hit of this.pickIntersections) {
          const id = this.findSelectableId(hit.object);
          if (!id) continue;
          fallback ??= hit;
          if (
            !priority &&
            this.belongsToPickingRoots(hit.object, this.pickingPriorityRootSet)
          ) priority = hit;
          if (
            !environmental &&
            this.belongsToPickingRoots(hit.object, this.environmentalRootSet)
          ) environmental = hit;
        }
        // Keep the original 2 cm depth tolerance, record precedence, and fallback.
        const chosen =
          environmental &&
          (!priority || environmental.distance + 0.02 < priority.distance)
            ? environmental
            : priority;
        const hit = chosen ?? fallback;
        // A projected, larger hit target is considered only after 3D geometry misses.
        // Existing books, shelves and every direct ray hit keep their precedence.
        const selectedId = hit
          ? this.findSelectableId(hit.object)
          : findExpandedLivingTap(
              this.selectableRoots,
              this.camera,
              bounds,
              position,
            );
        const root =
          selectedId &&
          selectedId !== this.selectedId &&
          selectedId.startsWith("character:")
            ? this.selectableRoots.get(selectedId)
            : undefined;
        // Reuse the tap's exact vertices for the immediate highlight too. Return
        // only the detached box; restore readers BEFORE semantic callbacks run.
        if (root) this.probe?.markQuest("highlightStart");
        const preparedBounds = root
          ? new Box3().setFromObject(root, true)
          : undefined;
        return { selectedId, preparedBounds };
      },
      true,
    );
    this.pickIntersections.length = 0;
    this.selectObject(selectedId ?? null, preparedBounds);
    if (
      selectedId?.startsWith("living:") ||
      selectedId?.startsWith("character:")
    )
      this.onTapObject?.(selectedId);
    this.probe?.markQuest("pickEnd");
  }

  private belongsToPickingRoots(
    object: Object3D,
    roots: ReadonlySet<Object3D>,
  ): boolean {
    let current: Object3D | null = object;
    while (current) {
      if (roots.has(current)) return true;
      current = current.parent;
    }
    return false;
  }

  private getPickingRoots(): Object3D[] {
    if (!this.pickingRootsDirty) return this.pickingRoots;
    const candidates = new Set([
      ...this.pickingPriorityRoots,
      ...this.selectableRoots.values(),
    ]);
    // A book may be registered below a shelf that is itself selectable. Raycast
    // its hierarchy once, resolving the nearest registered ancestor per hit.
    this.pickingRoots = [...candidates].filter((root) => {
      let parent = root.parent;
      while (parent) {
        if (candidates.has(parent)) {
          // An avatar proxy cannot descend to a separately selectable book
          // or accessory. Keep its registered child in the exact candidates.
          if (
            this.inhabitantVolumePicking &&
            this.inhabitantTouchVolumes.has(this.selectableRootIds.get(parent))
          ) {
            parent = parent.parent;
            continue;
          }
          return false;
        }
        parent = parent.parent;
      }
      return true;
    });
    this.pickingRootsDirty = false;
    return this.pickingRoots;
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
    const previous = this.selectableRoots.get(id);
    if (previous) {
      this.selectableRootIds.delete(previous);
      this.environmentalRootSet.delete(previous);
      this.broadphase.invalidate(previous);
    }
    if (
      id.startsWith("living:") ||
      id.startsWith("character:") ||
      id.startsWith("scroll:")
    )
      this.environmentalRootSet.add(root);
    this.selectableRoots.set(id, root);
    if (this.fastPicking) this.broadphase.register(root, id);
    this.pickingRootsDirty = true;
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
    this.tapCandidatePointerId = undefined;
    this.tapEligible = false;
    if (this.canvas.parentElement?.dataset.worldTouch === "pressed")
      this.touchEcho("cancelled");
    this.gestureMode = "idle";
    this.pinchPreviousDistance = 0;
    this.pinchPreviousMidpoint = undefined;
    this.updateGestureDiagnostic();
  }

  private updateDiagnostics(): void {
    const state = this.navigation.getState();
    this.canvas.dataset.cameraTargetX = state.targetX.toFixed(3);
    this.canvas.dataset.cameraTargetY = CAMERA_TARGET_Y.toFixed(3);
    this.canvas.dataset.cameraTargetZ = state.targetZ.toFixed(3);
    this.canvas.dataset.cameraZoom = state.zoom.toFixed(3);
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
    const midpoint = this.pinchMidpoint(pointers);
    const previousMidpoint = this.pinchPreviousMidpoint;
    if (!previousMidpoint || !midpoint) return;
    const nextZoom = zoomFromPinch(
      this.navigation.getState().zoom,
      this.pinchPreviousDistance,
      distance,
    );
    const bounds = this.canvas.getBoundingClientRect();
    const previousPosition = this.viewportPosition(previousMidpoint, bounds);
    const currentPosition = this.viewportPosition(midpoint, bounds);
    const changed =
      previousPosition &&
      currentPosition &&
      this.navigation.zoomBetweenScreenPoints(
        previousPosition,
        currentPosition,
        nextZoom,
      );
    this.pinchPreviousDistance = distance;
    this.pinchPreviousMidpoint = midpoint;
    if (changed) {
      this.render();
      this.updateDiagnostics();
    }
  }

  private pinchMidpoint(
    pointers: readonly ActivePointer[],
  ): PointerPosition | undefined {
    const first = pointers[0];
    const second = pointers[1];
    if (!first || !second) return undefined;
    return {
      x: (first.current.x + second.current.x) / 2,
      y: (first.current.y + second.current.y) / 2,
    };
  }

  private viewportPosition(
    position: PointerPosition,
    bounds = this.canvas.getBoundingClientRect(),
  ): PointerPosition | null {
    if (
      !Number.isFinite(bounds.left) ||
      !Number.isFinite(bounds.top) ||
      !Number.isFinite(bounds.width) ||
      !Number.isFinite(bounds.height) ||
      bounds.width <= 0 ||
      bounds.height <= 0
    ) {
      return null;
    }
    return {
      x: ((position.x - bounds.left) * this.viewportWidth) / bounds.width,
      y: ((position.y - bounds.top) * this.viewportHeight) / bounds.height,
    };
  }

  private updateTestPickDiagnostic(): void {
    const root = this.selectableRoots.get(TEST_PICK_OBJECT_ID);
    if (!root) return;
    this.camera.updateMatrixWorld();
    root.updateWorldMatrix(true, true);
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
