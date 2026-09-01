import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const core = readFileSync(new URL("../src/legacy/01-core.js", import.meta.url), "utf8");
const didactics = readFileSync(new URL("../src/legacy/14-didactic-focus.js", import.meta.url), "utf8");
const didacticOrbits = readFileSync(new URL("../src/legacy/02-didactic-orbits.js", import.meta.url), "utf8");
const didacticNavigation = readFileSync(new URL("../src/legacy/12-didactic-navigation.js", import.meta.url), "utf8");

test("central render planner coalesces forced and optimal frames in the main loop", () => {
  assert.match(core, /let __forcedSkyFrame=false,__optimalSkyFrame=false/);
  assert.match(core, /function __scheduleSkyDraw\(reason,optimal\)/);
  assert.match(core, /const __act=__forceThisFrame\|\|interacting>0/);
  assert.match(core, /__lastRenderedJD=__jdNow;__forcedSkyFrame=false/);
});

test("settled, time and optimal renders use the central planner", () => {
  assert.match(core, /__scheduleSkyDraw\("settled",true\)/);
  assert.match(core, /__scheduleSkyDraw\("time-settled",true\)/);
  assert.match(core, /__scheduleSkyDraw\("optimal",true\)/);
  assert.doesNotMatch(core, /requestAnimationFrame\(\(\)=>\{if\(W\)draw\(\)\}\)/);
});

test("didactic redraws enter the same planner", () => {
  assert.match(didactics, /window\.scheduleDidacticSkyDraw\("didactic"\)/);
  assert.match(didacticOrbits, /scheduleDidacticSkyDraw\('didactic-orbit'\)/);
  assert.match(didacticNavigation, /scheduleDidacticSkyDraw\('didactic-navigation'\)/);
});

test("resize listeners are rebound to the central planner", () => {
  assert.match(core, /window\.removeEventListener\("resize",__directFitToScreen\)/);
  assert.match(core, /fitToScreen=function\(\)\{resize\(\);__scheduleSkyDraw\("resize",true\)\}/);
});

test("didactic jumps render the correct target quickly and refine it once", () => {
  assert.match(core, /function __scheduleDidacticSkyDraw\(reason\)/);
  assert.match(core, /window\.__skyRenderQuality=0/);
  assert.match(core, /profile==="low"\?140:70/);
  assert.match(core, /window\.__skyRenderQuality=2/);
});

test("repeated ephemerides for one Julian date use a single-entry cache", () => {
  assert.match(core, /const __sunLonRaw=sunLon,__moonTopoRaw=moonTopo,__allPlanetsRaw=allPlanets/);
  assert.match(core, /sunLon=function\(jd0\)\{if\(jd0!==__sunLonMemoJD\)/);
  assert.match(core, /moonTopo=function\(jd0\)\{if\(jd0!==__moonTopoMemoJD\)/);
  assert.match(core, /allPlanets=function\(jd0\)\{if\(jd0!==__planetsMemoJD\)/);
});
