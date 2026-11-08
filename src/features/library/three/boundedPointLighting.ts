import {
  Mesh,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  ShaderChunk,
  type Material,
  type Object3D,
} from "three";

const pointInfo =
  "getPointLightInfo( pointLight, geometryPosition, directLight );";
const direct =
  "RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );";
/** Three r185 evaluates attenuation and BRDF even beyond a finite light's radius.
 * Keep its exact in-range shading; skip zero-contribution work before normalize,
 * pow/attenuation and BRDF. This is spatial relevance per fragment, not a light
 * budget or a camera-dependent approximation. Unlimited lights remain unlimited.
 */
export function boundedPointLightChunk(
  chunk = ShaderChunk.lights_fragment_begin,
): string {
  const pointStart = chunk.indexOf(pointInfo);
  const pointEnd = chunk.indexOf(direct, pointStart);
  if (pointStart < 0 || pointEnd < 0)
    throw new Error("Unsupported Three point-light shader chunk");
  return (
    chunk.slice(0, pointStart) +
    `
    {
    vec3 bvPointVector = pointLight.position - geometryPosition;
    if (any(notEqual(pointLight.color, vec3(0.0))) &&
        (pointLight.distance <= 0.0 || dot(bvPointVector, bvPointVector) < pointLight.distance * pointLight.distance)) {
    ` +
    chunk.slice(pointStart, pointEnd + direct.length) +
    "\n}\n}\n" +
    chunk.slice(pointEnd + direct.length)
  );
}

type LitMaterial =
  MeshLambertMaterial | MeshPhongMaterial | MeshStandardMaterial;
function isLitMaterial(value: unknown): value is LitMaterial {
  return (
    value instanceof MeshLambertMaterial ||
    value instanceof MeshPhongMaterial ||
    value instanceof MeshStandardMaterial
  );
}
export function createBoundedPointLighting() {
  let enabled = true;
  const applied = new WeakSet<Material>();
  const chunk = boundedPointLightChunk();
  const visit = (root: Object3D, callback: (material: LitMaterial) => void) => {
    root.traverse((node) => {
      if (!(node instanceof Mesh)) return;
      const materials: unknown[] = Array.isArray(node.material)
        ? node.material
        : [node.material];
      for (const material of materials) {
        if (isLitMaterial(material)) callback(material);
      }
    });
  };
  return {
    apply(root: Object3D) {
      visit(root, (material) => {
        if (applied.has(material)) return;
        const compile = material.onBeforeCompile.bind(material);
        const cacheKey = material.customProgramCacheKey();
        material.onBeforeCompile = (shader, renderer) => {
          compile(shader, renderer);
          if (enabled)
            shader.fragmentShader = shader.fragmentShader.replace(
              "#include <lights_fragment_begin>",
              chunk,
            );
        };
        material.customProgramCacheKey = () =>
          `${cacheKey}:bv-point-radius-v1:${enabled}`;
        applied.add(material);
        material.needsUpdate = true;
      });
    },
    setEnabled(value: boolean, root: Object3D) {
      if (enabled === value) return;
      enabled = value;
      visit(root, (material) => {
        if (applied.has(material)) material.needsUpdate = true;
      });
    },
  };
}
