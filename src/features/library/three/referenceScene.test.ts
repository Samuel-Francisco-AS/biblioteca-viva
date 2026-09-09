import {
  BoxGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Texture,
} from "three";
import { describe, expect, it, vi } from "vitest";

import {
  createReferenceScene,
  disposeObjectTree,
  REFERENCE_SCENE_PROXY_TYPES,
} from "./referenceScene";

describe("cena de referência F1-B", () => {
  it("constrói piso, quatro paredes, quatro tipos de proxies e 45 meshes", () => {
    const reference = createReferenceScene();
    const meshes: Object3D[] = [];
    reference.root.traverse((object) => {
      if (object instanceof Mesh) meshes.push(object);
    });

    expect(reference.root.getObjectByName("floor")).toBeInstanceOf(Mesh);
    expect(
      [1, 2, 3, 4].map((index) =>
        reference.root.getObjectByName(`wall-${index}`),
      ),
    ).toSatisfy((walls: unknown[]) => walls.every(Boolean));
    expect(
      reference.root.getObjectsByProperty("name", "bookcase-proxy"),
    ).toHaveLength(3);
    expect(
      reference.root.getObjectsByProperty("name", "table-proxy"),
    ).toHaveLength(2);
    expect(
      reference.root.getObjectsByProperty("name", "bench-proxy"),
    ).toHaveLength(2);
    expect(
      reference.root.getObjectsByProperty("name", "crate-proxy"),
    ).toHaveLength(3);
    expect(
      reference.root.getObjectByName("reference-hemisphere-light"),
    ).toBeInstanceOf(HemisphereLight);
    expect(
      reference.root.getObjectByName("reference-directional-light"),
    ).toBeInstanceOf(DirectionalLight);
    expect(reference.meshCount).toBe(45);
    expect(meshes).toHaveLength(45);
    expect(REFERENCE_SCENE_PROXY_TYPES).toBe(4);
    expect(reference.selectables).toHaveLength(10);
    expect(reference.selectables.map(({ descriptor }) => descriptor)).toEqual([
      { id: "bookshelf-01", label: "Estante técnica 1" },
      { id: "bookshelf-02", label: "Estante técnica 2" },
      { id: "bookshelf-03", label: "Estante técnica 3" },
      { id: "table-01", label: "Mesa técnica 1" },
      { id: "table-02", label: "Mesa técnica 2" },
      { id: "bench-01", label: "Banco técnico 1" },
      { id: "bench-02", label: "Banco técnico 2" },
      { id: "crate-01", label: "Caixa técnica 1" },
      { id: "crate-02", label: "Caixa técnica 2" },
      { id: "crate-03", label: "Caixa técnica 3" },
    ]);
  });

  it("descarta uma única vez recursos compartilhados", () => {
    const root = new Group();
    const geometry = new BoxGeometry();
    const texture = new Texture();
    const material = new MeshBasicMaterial({ map: texture });
    root.add(new Mesh(geometry, material), new Mesh(geometry, material));
    const disposeMaterial = vi.spyOn(material, "dispose");
    const disposeGeometry = vi.spyOn(geometry, "dispose");
    const disposeTexture = vi.spyOn(texture, "dispose");

    disposeObjectTree(root);

    expect(disposeMaterial).toHaveBeenCalledOnce();
    expect(disposeGeometry).toHaveBeenCalledOnce();
    expect(disposeTexture).toHaveBeenCalledOnce();
    expect(root.children).toHaveLength(0);
  });
});
