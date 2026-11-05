import {
  BoxGeometry,
  LatheGeometry,
  Vector2,
  Shape,
  ExtrudeGeometry,
} from "three";

/** A rounded solid with planar support faces. Unit dimensions stay exact. */
export function furnitureBlock(bevel = 0.06) {
  const g = new BoxGeometry(1, 1, 1, 4, 4, 4);
  const p = g.attributes.position;
  const half = 0.5 - bevel;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      y = p.getY(i),
      z = p.getZ(i);
    const cx = Math.max(-half, Math.min(half, x));
    const cy = Math.max(-half, Math.min(half, y));
    const cz = Math.max(-half, Math.min(half, z));
    const length = Math.hypot(x - cx, y - cy, z - cz);
    p.setXYZ(
      i,
      cx + ((x - cx) * bevel) / length,
      cy + ((y - cy) * bevel) / length,
      cz + ((z - cz) * bevel) / length,
    );
  }
  g.computeVertexNormals();
  return g;
}

/** Turned profiles are authored in local metres, not scaled spheres. */
export function turnedProfile(profile: readonly (readonly [number, number])[]) {
  return new LatheGeometry(
    profile.map(([r, y]) => new Vector2(r, y)),
    16,
  );
}

/** Upholstered/wooden back with a curved crest, centred in a unit envelope. */
export function archedPanel() {
  const shape = new Shape();
  shape.moveTo(-0.5, -0.5);
  shape.lineTo(0.5, -0.5);
  shape.lineTo(0.5, 0.25);
  shape.quadraticCurveTo(0.5, 0.5, 0, 0.5);
  shape.quadraticCurveTo(-0.5, 0.5, -0.5, 0.25);
  shape.closePath();
  return new ExtrudeGeometry(shape, {
    depth: 1,
    bevelEnabled: false,
    curveSegments: 12,
  }).translate(0, 0, -0.5);
}
