import { Material, Mesh, type Object3D, Texture } from "three";

export interface SceneTextureMetrics {
  readonly materialTextureReferences: number;
  readonly uniqueMaterialTextures: number;
}

function materialTextures(material: Material): readonly Texture[] {
  return Object.values(material).filter(
    (value): value is Texture => value instanceof Texture,
  );
}

function isMaterial(value: unknown): value is Material {
  return value instanceof Material;
}

/**
 * Counts texture references declared on live mesh materials. These are scene
 * metadata, not a replacement for WebGLRenderer.info.memory.textures.
 */
export function collectSceneTextureMetrics(
  root: Object3D,
): SceneTextureMetrics {
  let materialTextureReferences = 0;
  const uniqueTextures = new Set<Texture>();

  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const candidates = Array.isArray(object.material)
      ? object.material
      : [object.material];
    for (const material of candidates) {
      if (!isMaterial(material)) continue;
      const textures = materialTextures(material);
      materialTextureReferences += textures.length;
      for (const texture of textures) uniqueTextures.add(texture);
    }
  });

  return Object.freeze({
    materialTextureReferences,
    uniqueMaterialTextures: uniqueTextures.size,
  });
}
