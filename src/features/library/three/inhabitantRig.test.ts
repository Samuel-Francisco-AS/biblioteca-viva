import { readFileSync } from "node:fs";
import { AnimationMixer, Group, Mesh, SkinnedMesh, Vector3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { expect, it, vi } from "vitest";
import { INHABITANTS } from "../inhabitants";
import { disposeObjectTree } from "./referenceScene";
import { createInhabitantVisuals } from "./inhabitantVisuals";

for (const actor of INHABITANTS) {
  it(`${actor.key}: real weighted deformation, anatomical contacts and skeleton disposal`, async () => {
    const load = () =>
      new GLTFLoader().parseAsync(
        new Uint8Array(
          readFileSync(`src/features/library/three/assets/${actor.key}.glb`),
        ).buffer,
        "",
      );
    const { scene, animations } = await load();
    scene.updateMatrixWorld(true);
    const skins: SkinnedMesh[] = [];
    scene.traverse((o) => {
      if (o instanceof SkinnedMesh) skins.push(o);
    });
    expect(skins.length).toBeGreaterThan(0);
    const socket = scene.getObjectByName("socket_carry")!;
    expect(socket).toBeDefined();
    expect(socket.parent?.name).toBe("HandL");
    expect(scene.getObjectByName("socket_seat")?.parent?.name).toBe("Pelvis");
    const start = socket.getWorldPosition(new Vector3());
    expect(start.y).toBeGreaterThan(0.5);
    expect(start.y).toBeLessThan(actor.height);
    let mixed = 0;
    for (const mesh of skins) {
      const weights = mesh.geometry.getAttribute("skinWeight");
      for (let i = 0; i < weights.count; i++) {
        expect(
          weights.getX(i) + weights.getY(i) + weights.getZ(i) + weights.getW(i),
        ).toBeCloseTo(1, 4);
        if (weights.getY(i) > 0) mixed++;
      }
    }
    expect(mixed).toBeGreaterThan(20);
    const points = skins.map((mesh) =>
      Array.from(
        { length: mesh.geometry.getAttribute("position").count },
        (_, i) => mesh.getVertexPosition(i, new Vector3()),
      ),
    );
    const mixer = new AnimationMixer(scene);
    mixer.clipAction(animations.find((c) => c.name === "work")!).play();
    mixer.setTime(1.5);
    scene.updateMatrixWorld(true);
    expect(
      socket.getWorldPosition(new Vector3()).distanceTo(start),
    ).toBeGreaterThan(0.02);
    let displaced = 0;
    skins.forEach((mesh, j) =>
      points[j].forEach((p, i) => {
        const after = mesh.getVertexPosition(i, new Vector3());
        expect(after.toArray().every(Number.isFinite)).toBe(true);
        if (after.distanceTo(p) > 0.01) displaced++;
      }),
    );
    expect(displaced).toBeGreaterThan(100);
    // An attached payload retains its local contact through animation, without moving the agency wrapper.
    const payload = new Mesh();
    socket.add(payload);
    payload.position.set(0, 0, 0);
    mixer.setTime(2);
    scene.updateMatrixWorld(true);
    expect(
      payload
        .getWorldPosition(new Vector3())
        .distanceTo(socket.getWorldPosition(new Vector3())),
    ).toBeLessThan(1e-6);
    socket.remove(payload);
    const skeletons = [...new Set(skins.map((m) => m.skeleton))];
    const spies = skeletons.map((s) => {
      s.computeBoneTexture();
      return vi.spyOn(s.boneTexture!, "dispose");
    });
    mixer.stopAllAction();
    mixer.uncacheRoot(scene);
    disposeObjectTree(scene);
    spies.forEach((spy) => expect(spy).toHaveBeenCalledOnce());
    // Production resolver must return the authored socket, replacing a pre-load fallback.
    const parent = new Group();
    const pending: Array<() => void> = [];
    const owner = createInhabitantVisuals(
      parent,
      () =>
        new Promise((resolve) =>
          pending.push(() => {
            void load().then(resolve);
          }),
        ),
    );
    const fallback = owner.getCarryAnchor(actor.id);
    pending.forEach((run) => run());
    await vi.waitFor(() =>
      expect(
        owner.selectables.every((s) => s.root.userData.loadState === "ready"),
      ).toBe(true),
    );
    const actual = owner.getCarryAnchor(actor.id);
    expect(actual?.name).toBe("socket_carry");
    expect(actual).not.toBe(fallback);
    owner.dispose();
    expect(parent.children).toHaveLength(0);
  });
}
