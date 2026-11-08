import {
  AdditiveBlending,
  DataTexture,
  Mesh,
  MeshBasicMaterial,
  LinearFilter,
  PlaneGeometry,
  Quaternion,
} from "three";

/** Small unlit billboard, owned/disposed with its effect tree. No light or loop.
 * A hollow centre keeps the object readable; depth testing respects the world.
 * Attach outside selectable roots so decorative glow never changes picking/bounds.
 */
export function createMagicHalo(color: number, width: number, height = width) {
  const size = 32;
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const r = Math.hypot((x + 0.5) / 16 - 1, (y + 0.5) / 16 - 1);
      const alpha =
        r < 1 ? (Math.exp(-(((r - 0.52) * 5) ** 2)) * 0.8 + 0.12) * (1 - r) : 0;
      const index = (y * size + x) * 4;
      pixels.set([255, 255, 255, Math.round(255 * alpha)], index);
    }
  const map = new DataTexture(pixels, size, size);
  map.magFilter = map.minFilter = LinearFilter;
  map.needsUpdate = true;
  const material = new MeshBasicMaterial({
    color,
    map,
    transparent: true,
    opacity: 0,
    blending: AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const halo = new Mesh(new PlaneGeometry(width, height), material);
  halo.name = "magic-halo";
  halo.raycast = () => {}; // decorative, never a semantic hit
  const parentRotation = new Quaternion();
  halo.onBeforeRender = (_renderer, _scene, camera) => {
    camera.getWorldQuaternion(halo.quaternion);
    if (halo.parent) {
      halo.parent.getWorldQuaternion(parentRotation).invert();
      halo.quaternion.premultiply(parentRotation);
    }
    // The renderer already updated matrices before this callback.
    halo.updateMatrix();
    if (halo.parent)
      halo.matrixWorld.multiplyMatrices(halo.parent.matrixWorld, halo.matrix);
    else halo.matrixWorld.copy(halo.matrix);
  };
  return halo;
}
