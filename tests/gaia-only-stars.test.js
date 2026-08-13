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
  assert.match(core, /if\(basis>=6\.49\)return katalogMax/);
  assert.match(core, /Math\.log10\(m\)/);
  assert.match(core, /let bgLimit=Math\.min\(15\.5,_gaiaGrenzmag\(zEff\)\)/);
  assert.doesNotMatch(core, /\(zEff-1\)\*\.62/);
  assert.match(core, /bgLimit=Math\.min\(bgLimit,_GAIA\.magMax\+\.05\)/);
  assert.match(core, /if\(mag>lim\)break/);
});

test("Gaia stages are loaded cumulatively as zoom depth grows", () => {
  assert.match(core, /fetch\("gaia\/manifest\.json\?v=8"\)/);
  assert.match(core, /m\.strategy!=="cumulative"/);
  assert.match(core, /if\(ziel>_gaiaStufeIndex\)_gaiaStufeLaden\(ziel\)/);
  assert.match(core, /_gaiaStufenPruefen\(\)/);
  assert.match(core, /gb\.textContent="✦ Gaia "\+String\(stufe\.magnitude\)/);
});

test("deep Gaia stars are streamed only for visible display tiles", () => {
  assert.match(core, /function _gaiaStreamPruefen\(zellen,bedarf\)/);
  assert.match(core, /sort\(\(a,b\)=>a\[1\]\.used-b\[1\]\.used\)/);
  assert.match(core, /_gaiaStreamPruefen\(_sichtZellen,bgLimit\)/);
  assert.match(core, /const tief=_gaiaStreamFuerZelle\(zk\)/);
  assert.match(core, /function _gaiaKachelDekodieren\(buf\)/);
  assert.match(core, /new Worker\("\.\/src\/workers\/gaiaTileWorker\.js",\{type:"module"\}\)/);
  assert.match(core, /Promise\.resolve\(gaiaVektorKachelLesen\(buf\)\)/);
  assert.match(core, /if\(G\.vector\)\{x0=G\.vx\[i\]/);
  assert.match(core, /_gaiaKachelnLaden\.size>=budget\.parallel/);
  assert.match(core, /function _gaiaStreamBudget\(\)/);
  assert.match(core, /const _sichtZelleHinzufuegen=ri=>/);
  assert.match(core, /if\(_rm&&_cullCos>-1\.5\)/);
  assert.match(core, /_sichtZellen\.push\(zk\)/);
});

test("stereographic view cone includes the complete viewport edge", () => {
  assert.match(core, /_angR=2\*Math\.atan\(Math\.hypot/);
  assert.doesNotMatch(core, /_angR=Math\.atan\(Math\.hypot/);
});

test("Gaia interaction LOD also applies at dark sites", () => {
  assert.match(core, /if\(_gaiaFast\)\{const fastMag=zEff>=4\?9:zEff>=2\?8\.3:7\.4/);
  assert.doesNotMatch(core, /_gaiaFast&&\(window\.skyMagBase\|\|6\.5\)<6\.49/);
});

test("Gaia depth light is projected in observer mode", () => {
  assert.match(core, /if\(_rm\)\{[\s\S]*?const d=u\*_rsA\*_rcc/);
  assert.doesNotMatch(core, /nightF>\.18&&!_rm/);
  assert.match(core, /if\(!_imBild\(x,y\)\)continue/);
});

test("Milky Way resolves progressively into denser Gaia stars near 2x", () => {
  assert.match(core, /const mwZoomFade=_mwMag<=1\.2\?1:Math\.max\(0,1-\(_mwMag-1\.2\)\*\.56\)/);
  assert.match(core, /Math\.round\(16\/Math\.max\(1,zEff\*zEff\)\)/);
  assert.match(core, /Math\.min\(8,Math\.sqrt\(\(b-a\)\/180\)\)/);
  assert.match(core, /boost\[cell\]=Math\.max\(0,Math\.min\(5,Math\.round\(Math\.log2\(\(1\+5\.2\*plane\*bulge\)\*density\)\*2\)\)\)/);
  assert.match(core, /const dichteStufe=D\.boost\?D\.boost\[cell\]:0/);
});

test("Milky Way dust stays behind Gaia catalog stars", () => {
  const dust = core.indexOf("try{window.__mwDunkel()}catch(e){}");
  const gaia = core.indexOf("const drawGaia=(zk,katalog)=>");
  assert.ok(dust >= 0 && gaia > dust);
  assert.match(core, /if\(_mwDunkelGemalt\)return/);
});

test("M24 is resolved into Gaia stars instead of a synthetic glow", () => {
  assert.match(core, /if\(o\.m===24\)return false/);
  assert.match(core, /if\(o\.m===24&&_GAIA&&zVis>=1\.5&&_GAIA\.magMax>=7\.8\)return 1/);
});
