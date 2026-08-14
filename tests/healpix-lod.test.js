import test from "node:test";
import assert from "node:assert/strict";
import { addStarToFluxAggregate, createFluxAggregate, finishFluxAggregate, healpixLodForZoom, healpixPixelCount, vectorToHealpixRing } from "../src/gaia/healpix.js";

test("HEALPix RING assigns every direction to a valid spherical pixel", () => {
  for (const nside of [1, 2, 4, 8, 16]) {
    const count = healpixPixelCount(nside);
    for (const vector of [[1, 0, 0], [0, 1, 0], [-1, 0, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1], [1, 2, 3]]) {
      const pixel = vectorToHealpixRing(...vector, nside);
      assert.ok(Number.isInteger(pixel) && pixel >= 0 && pixel < count, `${nside}:${pixel}`);
    }
  }
});

test("HEALPix LOD doubles resolution only at zoom boundaries", () => {
  assert.deepEqual(healpixLodForZoom(1), { nside: 4, order: 2 });
  assert.deepEqual(healpixLodForZoom(2), { nside: 8, order: 3 });
  assert.deepEqual(healpixLodForZoom(8), { nside: 32, order: 5 });
  assert.deepEqual(healpixLodForZoom(100), { nside: 64, order: 6 });
});

test("unresolved stars preserve their combined physical flux", () => {
  const aggregate = createFluxAggregate();
  addStarToFluxAggregate(aggregate, { magnitude: 5, red: 1, green: .8, blue: .6, x: 1, y: 0, z: 0 });
  addStarToFluxAggregate(aggregate, { magnitude: 5, red: 1, green: .8, blue: .6, x: 1, y: 0, z: 0 });
  const result = finishFluxAggregate(aggregate);
  assert.equal(result.count, 2);
  assert.ok(Math.abs(result.magnitude - (5 - 2.5 * Math.log10(2))) < 1e-12);
  assert.equal(result.x, 1);
});
