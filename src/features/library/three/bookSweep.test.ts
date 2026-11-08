import { expect, it } from "vitest";
import { Box3, Quaternion, Vector3 } from "three";
import { clearBookSegment } from "./sessionBookVisuals";

it("lifts from a supporting tabletop while the wrist rotates, without mixing the starting height with the final extent", () => {
  const a = {
    position: new Vector3(-4.350776608, 0.776457656, 6.499647485),
    rotation: new Quaternion(
      -0.000068884,
      -0.000815232,
      -0.706653239,
      0.70755956,
    ).normalize(),
  };
  const b = {
    position: new Vector3(-4.346831685, 0.786575663, 6.501356885),
    rotation: new Quaternion(
      0.000307848,
      0.00322716,
      -0.70889753,
      0.705304202,
    ).normalize(),
  };
  const table = new Box3(
    new Vector3(-4.951, -0.001, 6.049),
    new Vector3(-4.049, 0.661, 6.951),
  );
  expect(clearBookSegment(a, b, new Vector3(0.1125, 0.2, 0.18), [table])).toBe(
    true,
  );
});

it("rejects obstacles touched by real rotating corners at intermediate poses, including translation and large turns", () => {
  const half = new Vector3(0.1125, 0.2, 0.18);
  for (let sample = 1; sample <= 24; sample++) {
    const axis = new Vector3(
      Math.sin(sample),
      Math.cos(sample * 0.7),
      Math.sin(sample * 0.3),
    ).normalize();
    const a = {
      position: new Vector3(0, 0, 0),
      rotation: new Quaternion().setFromAxisAngle(axis, sample * 0.11),
    };
    const b = {
      position: new Vector3(0.3, 0.2, -0.17),
      rotation: a.rotation
        .clone()
        .multiply(
          new Quaternion().setFromAxisAngle(
            new Vector3(1, 2, 3).normalize(),
            (Math.PI * sample) / 24,
          ),
        ),
    };
    const t = ((sample % 7) + 1) / 9;
    const corner = new Vector3(
      sample % 2 ? half.x : -half.x,
      sample % 3 ? half.y : -half.y,
      sample % 5 ? half.z : -half.z,
    )
      .applyQuaternion(a.rotation.clone().slerp(b.rotation, t))
      .add(a.position.clone().lerp(b.position, t));
    const obstacle = new Box3(
      corner.clone().addScalar(-0.001),
      corner.clone().addScalar(0.001),
    );
    expect(
      clearBookSegment(a, b, half, [obstacle]),
      `swept corner ${sample}`,
    ).toBe(false);
  }
});
