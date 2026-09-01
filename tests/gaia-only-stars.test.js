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
  assert.match(core, /if\(_planetGaiaMaximum\(\)\|\|basis>=6\.49\)return katalogMax/);
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

test("vertical panning keeps Gaia density projected and finishes with a quality frame", () => {
  assert.match(core, /const active=new Map\(\)/);
  assert.match(core, /start\.vertical=Math\.abs\(dy\)>Math\.abs\(dx\)\*1\.15/);
  assert.doesNotMatch(core, /const _gaiaGpuHold=window\.__gaiaVerticalPan===true/);
  assert.match(core, /density:_gaiaGpuDensity/);
  assert.doesNotMatch(core, /draw=function\(\)\{if\(window\.__gaiaVerticalPan\)return/);
  assert.match(core, /window\.__gaiaVerticalPan=false;[\s\S]*?__requestSettledSkyFrame\(\)/);
  assert.match(core, /cv\.addEventListener\("wheel",__requestSettledSkyFrame/);
});

test("mode changes schedule a complete Gaia quality frame", () => {
  assert.match(core, /function __requestSettledSkyFrame\(\)/);
  assert.match(core, /__settledSkyFrameTimer=setTimeout\(\(\)=>\{interacting=0;__scheduleSkyDraw\("settled",true\)\},90\)/);
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
  assert.match(core, /const starNameLimit=viewMode==="real"\?Math\.min\(4,3\.4\+\.3\*Math\.log2\(Math\.max\(1,zEff\)\)\):orientMode\?5:1\.8/);
});

test("orientation mode uses continuous site-aware stellar photometry above and below the horizon", () => {
  assert.match(core, /function orientStarStyle\(mag,scale\)/);
  assert.match(core, /const lim=window\.skyMagBase\|\|5\.5/);
  assert.match(core, /edge\*edge\*\(3-2\*edge\)/);
  assert.match(core, /orientStyle=orientMode\?orientStarStyle\(mag,PX\/zoom\):null/);
  assert.match(core, /orientStyle=orientMode\?orientStarStyle\(mag,rbg\):null/);
  assert.match(core, /sinA>0\?extBySinAlt\(sinA\):1/);
});

test("orientation rendering follows visible pixel motion instead of every sensor event", () => {
  assert.match(core, /function __orientDrawNeeded\(\)/);
  assert.match(core, /const minMs=perf==="low"\?24:16/);
  assert.match(core, /return pixels>=\.10\|\|Math\.abs\(camFov-__orientDrawFov\)>\.01/);
  assert.match(core, /if\(orientMode\)return true/);
  assert.match(core, /const k=1-Math\.exp\(-__orientDt\/__orientTau\)/);
});

test("manual orientation arrows simulate a smooth device movement", () => {
  assert.match(core, /const __orientTau=orientFallback\?\.188:\.130/);
  assert.match(core, /const k=1-Math\.exp\(-__orientDt\/__orientTau\)/);
  assert.match(core, /oAzT=norm360\(oAzT\+da\)/);
  assert.match(core, /oAltT=Math\.max\(-89,Math\.min\(89,oAltT\+dalt\)\)/);
});

test("Gaia depth light is projected in observer mode", () => {
  assert.match(core, /if\(_rm\)\{[\s\S]*?const d=u\*_rsA\*_rcc/);
  assert.doesNotMatch(core, /nightF>\.18&&!_rm/);
  assert.match(core, /if\(!_imBild\(x,y\)\)continue/);
});

test("Gaia depth light uses a persistent GPU buffer in observer mode", () => {
  assert.match(core, /densityLayer:true/);
  assert.match(core, /const _gaiaDichteGpuMoeglich=_gaiaGLInit\(\)/);
  assert.match(core, /density:_gaiaGpuDensity/);
  assert.match(core, /e\.density\?gl\.ONE:gl\.ONE_MINUS_SRC_ALPHA/);
});

test("orientation mode renders Gaia through the persistent GPU pipeline", () => {
  assert.match(core, /const _gaiaGpuBase=!!_GAIA&&/);
  assert.match(core, /allowBelow:_rm&&orientMode/);
  assert.doesNotMatch(core, /if\(orientMode\|\|!_GAIA\)_gaiaGLHide/);
  assert.match(core, /if\(orientMode\)gl\.finish\(\);else gl\.flush\(\)/);
});

test("labels and constellation lines use the main canvas in every frame", () => {
  assert.match(labelCadence, /return context.next\(\.\.\.context.args\)/);
  assert.doesNotMatch(labelCadence, /createElement\("canvas"\)|canvas.animate|source.fillText\s*=|source.stroke\s*=/);
  assert.match(labelCadence, /intervalMs: 0/);
});

test("orientation mode always enables names and constellation lines", () => {
  assert.match(core, /if\(lage&&!kamera\)\{[\s\S]*?showObjectNames=true;[\s\S]*?showConstellationNames=true;[\s\S]*?showLines=true/);
  assert.match(core, /Sternbildnamen sind im Lagemodus immer eingeblendet/);
  assert.match(core, /Sternbildlinien sind im Lagemodus immer eingeblendet/);
  assert.doesNotMatch(core, /constellationLabels\.has\(label\)&&\(!showConstellationNames\|\|\(typeof orientMode/);
});

test("orientation mode keeps the complete sky visible below the horizon", () => {
  assert.match(core, /id="orientation-below-layer"/);
  assert.match(core, /_orientBelowDraw\(pts,HH,g\.getTransform\(\)\)/);
  assert.match(core, /gg\.addColorStop\(1,"rgba\(1,3,8,\.78\)"\)/);
  assert.match(core, /function _altOK\(a\)\{return a>=0\|\|\(orientMode&&a>-900\)\}/);
  assert.match(core, /sinAlt<=0\.0&&u_allowBelow>\.5&&!densityLayer&&mag>5\.2/);
  assert.match(core, /sinAlt<=0\.0\?\(u_allowBelow>\.5\?\.75:0\.0\)/);
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
