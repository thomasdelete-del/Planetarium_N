import test from "node:test";
import assert from "node:assert/strict";
import { compactGaiaCatalog } from "../src/gaia/compact.js";

function rawCatalog(stars) {
  const buffer = new ArrayBuffer(16 + stars.length * 36);
  const view = new DataView(buffer);
  "GDR3".split("").forEach((character, index) => view.setUint8(index, character.charCodeAt(0)));
  view.setUint32(4, 1, true);
  view.setUint32(8, stars.length, true);
  stars.forEach((star, index) => {
    const offset = 16 + index * 36;
    view.setFloat64(offset + 8, star.ra, true);
    view.setFloat64(offset + 16, star.dec, true);
    view.setFloat32(offset + 24, star.g, true);
    view.setFloat32(offset + 28, star.bp, true);
    view.setFloat32(offset + 32, star.rp, true);
  });
  return buffer;
}

test("Gaia-Rohdaten werden sortiert, verdichtet und dedupliziert", () => {
  const input = rawCatalog([
    { ra: 15, dec: 10, g: 5, bp: 5.7, rp: 4.6 },
    { ra: 180, dec: -20, g: 7, bp: 7.5, rp: 6.8 }
  ]);
  const result = compactGaiaCatalog(input, 48, 24, [{ ra: 1, de: 10 }]);
  const view = new DataView(result.buffer);
  assert.equal(String.fromCharCode(...new Uint8Array(result.buffer, 0, 4)), "GDR3");
  assert.equal(view.getUint32(8, true), 1);
  assert.equal(result.count, 1);
  assert.equal(result.duplicateCount, 1);
  assert.equal(result.buffer.byteLength, 32 + 4 * (48 * 24 + 1) + 10);
});

test("Ungültige Gaia-Dateien werden abgewiesen", () => {
  assert.throws(() => compactGaiaCatalog(new ArrayBuffer(32), 48, 24), /GDR3/);
});
