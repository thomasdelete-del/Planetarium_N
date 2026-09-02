import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const core = readFileSync(new URL("../src/legacy/01-core.js", import.meta.url), "utf8");

test("Planetenbahnen behalten ihre räumliche z-Komponente", () => {
  assert.match(core, /z=r\*Math\.sin\(lon-O\)\*Math\.sin\(i\)/);
  assert.match(core, /gz=h\.z-E\.z/);
  assert.match(core, /geoLat=Math\.atan2\(gz,Math\.hypot\(gx,gy\)\)\*180\/Math\.PI/);
  assert.match(core, /ecl2rd\(geoLon,geoLat,jd0\)/);
  assert.doesNotMatch(core, /ecl2rd\(geoLon,0,jd0\)/);
});
