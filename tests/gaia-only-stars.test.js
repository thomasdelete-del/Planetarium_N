import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const core = readFileSync(new URL("../src/legacy/01-core.js", import.meta.url), "utf8");

test("background star generator is disabled in favor of Gaia DR3", () => {
  assert.match(core, /function buildStarField\(\)\{return\[\{ra:0,de:0,mag:99,gaiaGridSentinel:true\}\]/);
  assert.match(core, /function loadStarTier\(\)\{return false/);
  assert.match(core, /const namen=\["gaia_compact\.bin"/);
});

test("Gaia visibility depth follows zoom and catalog depth", () => {
  assert.match(core, /\(window\.skyMagBase\|\|6\.5\)\+\(zEff-1\)\*\.62/);
  assert.match(core, /bgLimit=Math\.min\(bgLimit,_GAIA\.magMax\+\.05\)/);
  assert.match(core, /if\(mag>lim\)break/);
});

test("stereographic view cone includes the complete viewport edge", () => {
  assert.match(core, /_angR=2\*Math\.atan\(Math\.hypot/);
  assert.doesNotMatch(core, /_angR=Math\.atan\(Math\.hypot/);
});
