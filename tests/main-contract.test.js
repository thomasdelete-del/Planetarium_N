import test from "node:test";
import assert from "node:assert/strict";
import * as astronomy from "../src/astronomy/index.js";

test("Astronomie-Namespace ist ohne erneutes Einfrieren als API verwendbar", () => {
  assert.equal(typeof astronomy.sunEclipticLongitude, "function");
  assert.equal(typeof astronomy.equatorialToHorizontal, "function");
  assert.equal(Object.isExtensible(astronomy), false);
});
