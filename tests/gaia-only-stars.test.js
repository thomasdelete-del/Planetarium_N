import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const core = readFileSync(new URL("../src/legacy/01-core.js", import.meta.url), "utf8");
const labelCadence = readFileSync(new URL("../src/features/render/labelCadence.js", import.meta.url), "utf8");

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

test("vertical panning defers Gaia reprojection until gesture end", () => {
  assert.match(core, /const active=new Map\(\)/);
  assert.match(core, /start\.vertical=Math\.abs\(dy\)>Math\.abs\(dx\)\*1\.15/);
  assert.match(core, /const _gaiaGpuHold=window\.__gaiaVerticalPan===true/);
  assert.doesNotMatch(core, /draw=function\(\)\{if\(window\.__gaiaVerticalPan\)return/);
  assert.match(core, /window\.__gaiaVerticalPan=false;[\s\S]*?__requestSettledSkyFrame\(\)/);
  assert.match(core, /cv\.addEventListener\("wheel",__requestSettledSkyFrame/);
});

test("mode changes schedule a complete Gaia quality frame", () => {
  assert.match(core, /function __requestSettledSkyFrame\(\)/);
  assert.match(core, /__settledSkyFrameTimer=setTimeout\(\(\)=>\{interacting=0;if\(W\)draw\(\)\},90\)/);
  assert.match(core, /function toggleViewMode\(\)\{[\s\S]*?__requestSettledSkyFrame\(\)/);
});

test("fast time lapse limits exact astronomy frames by visible pixel motion", () => {
  assert.match(core, /const targetPx=absSpeed>=60\?Math\.max\(\.02,Math\.min\(\.65,absSpeed\/3600\*\.65\)\):1/);
  assert.match(core, /function __fastTimeIsDaylight\(\)/);
  assert.match(core, /function __astronomyFrameInterval\(\)\{const s=Math\.abs\(speed\),p=window\.__devicePerformanceProfile/);
  assert.match(core, /if\(__fastTimeIsDaylight\(\)\)return 16;return p==="low"\?24:16/);
  assert.match(core, /if\(s>=60\)return p==="low"\?24:16/);
  assert.match(core, /__timeMoved&&__frameReady/);
  assert.match(core, /__lastAstronomyTS=ts\|\|0;draw\(\)/);
});

test("observer and orientation modes label more bright stars", () => {
  assert.match(core, /const starNameLimit=viewMode==="real"\?Math\.min\(4,3\.4\+\.3\*Math\.log2\(Math\.max\(1,zEff\)\)\):1\.8/);
});

test("orientation mode uses continuous site-aware stellar photometry", () => {
  assert.match(core, /function orientStarStyle\(mag,scale\)/);
  assert.match(core, /const lim=window\.skyMagBase\|\|5\.5/);
  assert.match(core, /edge\*edge\*\(3-2\*edge\)/);
  assert.match(core, /orientStyle=orientMode\?orientStarStyle\(mag,PX\/zoom\):null/);
  assert.match(core, /orientStyle=orientMode\?orientStarStyle\(mag,rbg\):null/);
  assert.match(core, /sinA>0\?extBySinAlt\(sinA\):orientMode\?0:\.55/);
});

test("Gaia depth light is projected in observer mode", () => {
  assert.match(core, /if\(_rm\)\{[\s\S]*?const d=u\*_rsA\*_rcc/);
  assert.doesNotMatch(core, /nightF>\.18&&!_rm/);
  assert.match(core, /if\(!_imBild\(x,y\)\)continue/);
});

test("Gaia depth light uses a persistent GPU buffer in observer mode", () => {
  assert.match(core, /densityLayer:true/);
  assert.match(core, /const _gaiaDichteGpuMoeglich=!orientMode&&_gaiaGLInit\(\)/);
  assert.match(core, /density:_gaiaGpuDensity/);
  assert.match(core, /e\.density\?gl\.ONE:gl\.ONE_MINUS_SRC_ALPHA/);
});

test("labels and constellation lines follow every rendered fast-time frame", () => {
  assert.match(labelCadence, /Math\.abs\(Number\(legacy\.get\("speed"\)\) \|\| 0\) >= 900/);
  assert.match(labelCadence, /const refresh = force \|\| fastSky \|\| now - lastFrame >= intervalMs/);
});

test("local declination reference circles use stationary hour-angle samples", () => {
  assert.match(core, /function decCircle\(decDeg\)[\s\S]*?const step=\.08,lstH=LST\(\)\/15/);
  assert.match(core, /for\(let hourAngle=-12;hourAngle<=12\.001;hourAngle\+=step\)/);
  assert.match(core, /const raH=lstH-hourAngle/);
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
