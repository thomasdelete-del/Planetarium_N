import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const core = fs.readFileSync(new URL("../src/legacy/01-core.js", import.meta.url), "utf8");
const didacticFocus = fs.readFileSync(new URL("../src/legacy/14-didactic-focus.js", import.meta.url), "utf8");
const locationScenes = fs.readFileSync(new URL("../src/legacy/03-location-scenes.js", import.meta.url), "utf8");

test("Sonnenfinsternis startet am verfeinerten ersten Kontakt", () => {
  assert.match(core, /function _finErsterKontakt\(/);
  assert.match(core, /jd=_finErsterKontakt\(finOrt\.jdMax,finOrt\.stadt\.la,finOrt\.stadt\.lo\)/);
  assert.match(core, /for\(let i=0;i<28;i\+\+\)/);
});

test("Sonnenfinsternis wechselt in die Sonnenansicht mit 30 s/s", () => {
  assert.match(core, /setSpeedValue\(30\);setPaused\(false\);__requestPlanetariumFrame\(\)/);
  assert.match(core, /type==="solar"&&typeof pointObserverAtSun==="function"/);
  assert.match(core, /function pointObserverAtSun\(\)[\s\S]*?viewMode="real";[\s\S]*?camFov=65;/);
});

test("Finsternisleiste zeigt Navigation und Angaben in fester Reihenfolge", () => {
  assert.match(core, /class="ei-prev"[\s\S]*class="ei-date"[\s\S]*class="ei-place"[\s\S]*class="ei-cover"[\s\S]*class="ei-next"[\s\S]*class="ei-zu"/);
  assert.match(core, /jumpToEclipse\(-1,typ\)/);
  assert.match(core, /querySelector\("\.ei-place"\)\.textContent=stadt\+\(land\?", "\+land:""\)/);
  assert.match(core, /if\(window\.__eclipseNavigation\)[\s\S]*zeigeEclBox\(ds,nav\.stadt,nav\.land/);
  assert.match(core, /window\.__eclipseNavigation=null;verbergeEclBox\(\)/);
  assert.match(core, /function _merkeFinsternisAusgang\(\)/);
  assert.match(core, /function _stelleFinsternisAusgangWiederHer\(heute\)/);
  assert.match(core, /_stelleFinsternisAusgangWiederHer\(false\);jumpToEclipse\(-1,typ\)/);
  assert.match(core, /_stelleFinsternisAusgangWiederHer\(false\);jumpToEclipse\(1,typ\)/);
  assert.match(core, /_pendingEclBox=null;[\s\S]*window\.__eclipseNavigation=null;[\s\S]*_stelleFinsternisAusgangWiederHer\(true\);[\s\S]*window\.__eclipseNavigationOrigin=null/);
  assert.match(core, /if\(!b\|\|!window\.__eclipseNavigation\)return/);
  assert.match(core, /Jede neue Suche aus der Didaktik beginnt am aktuell eingestellten oder per GPS ermittelten Ort/);
});

test("Mondfinsternisse nutzen dieselbe Vor- und Zurueck-Navigation", () => {
  assert.match(core, /const typ=\(window\.__eclipseNavigation&&window\.__eclipseNavigation\.type\)\|\|"solar"/);
  assert.match(core, /type==="lunar"\?"Zur vorherigen Mondfinsternis"/);
  assert.match(core, /type==="lunar"\?"Zur folgenden Mondfinsternis"/);
  assert.match(core, /type==="lunar"\?"im Erdschatten":"bedeckt"/);
  assert.match(core, /function mondfinsternisStadt\(j0\)/);
  assert.match(core, /finOrt=mondfinsternisStadt\(jd\)/);
  assert.match(core, /type==="lunar"&&typeof pointObserverAtMoon==="function"/);
  assert.match(core, /Beginn der Verdeckung · 30 s\/s/);
});

test("Finsternisse berücksichtigen zusätzlich jede am Standort sichtbare Phase", () => {
  assert.match(core, /function _eclipseLocalVisibility\(j0,type,la,lo\)/);
  assert.match(core, /function _besteEuropaeischeFinsternis\(j0,type\)/);
  assert.match(core, /_FIN_EU_LAENDER\.has\(c\.land\)/);
  assert.match(core, /for\(let m=-480;m<=480;m\+=2\)/);
  assert.match(core, /if\(mag<=0\|\|hoehe<=0\)continue/);
  assert.match(core, /const europaSicht=_besteEuropaeischeFinsternis\(jd,type\)[\s\S]*const lokaleSicht=!finOrt\?_eclipseLocalVisibility\(jd,type,lat,lng\):null/);
  assert.doesNotMatch(core, /_nextLocallyVisibleEclipse/);
  assert.match(core, /lokal:true/);
  assert.match(core, /if\(type==="solar"&&!finOrt\)/);
  assert.match(core, /else if\(type==="lunar"&&!finOrt\)/);
});

test("Jetzt beendet die Finsternisnavigation und setzt den aktuellen Standort", () => {
  assert.match(locationScenes, /setNow=function\(\)[\s\S]*window\.__eclipseNavigation=null/);
  assert.match(locationScenes, /window\.__eclipseNavigationOrigin=null/);
  assert.match(locationScenes, /if\(window\.currentGeo\) \{lat=window\.currentGeo\.lat; lng=window\.currentGeo\.lng;\}/);
  assert.match(locationScenes, /verbergeEclBox\(\)/);
});

test("Didaktik zeigt erst den fertig berechneten Finsterniszustand", () => {
  assert.match(core, /function jumpEclipse\(dir,type\)[\s\S]*?return jumpToEclipse\(dir,type\)/);
  assert.match(core, /function jumpEclipse\(dir,type\)[\s\S]*?window\.__eclipseNavigation=null/);
  assert.doesNotMatch(core, /setTimeout\(\(\)=>jumpToEclipse\(dir,type\),220\)/);
  assert.match(core, /function zeigeHimmelsseite\(\)[\s\S]*?queueAtomicSkyCommit\(zeigeHimmelsseite\)/);
  assert.match(core, /function zeigeEclBox[\s\S]*?__atomicSkyUntil>performance\.now\(\)[\s\S]*?b\.classList\.remove\("open"\)/);
  assert.match(core, /function zeigeVorgemerkteEclBoxAufHimmel\(\)/);
  assert.match(didacticFocus, /window\.__didacticSceneJumpActive=true[\s\S]*?window\.__hideEclipseNavigation/);
  assert.match(didacticFocus, /finally\{[\s\S]*?window\.__didacticSceneJumpActive=false/);
});

test("Alle astronomischen Simulationen laufen nach dem fertigen Sprung", () => {
  for (const id of [
    "sim-daily-rotation", "sim-moon-phases", "sim-planet-run",
    "sim-precession", "sim-polar-day", "obs-northpole-winter",
    "obs-northpole-summer", "sim-seasons"
  ]) assert.match(didacticFocus, new RegExp(`"${id}":1`));
  assert.match(didacticFocus, /confirmSimulationRunning\(id\)/);
  assert.match(didacticFocus, /window\.setGear&&window\.setGear\(3600,false\)/);
  assert.match(didacticFocus, /legacy\.call\("setPaused",false\)/);
});

test("Nahe globale Mondfinsternisse werden nicht durch einen Tagesversatz uebersprungen", () => {
  assert.match(core, /let jd=startJD\+\(dir>0&&!navigiertBereits\?-1\.25:0\)/);
  assert.match(core, /const lokalerTag=j=>Math\.floor\(j\+utcOff\/24\+\.5\)/);
  assert.match(core, /const gleicherTag=!navigiertBereits&&lokalerTag\(best\)===lokalerTag\(startJD\)/);
  assert.match(core, /\|\|gleicherTag/);
  assert.match(core, /navigiertBereits\?\.5:-\.5/);
  assert.doesNotMatch(core, /function _findGlobalLunarEclipse[\s\S]*?let jd=startJD\+dir\*\.7/);
});

test("Totale Sonnenfinsternis nutzt eine stabile asymmetrische Korona", () => {
  assert.match(core, /const coronaLayer=\(angle,sx,sy,alpha\)=>/);
  assert.match(core, /coronaLayer\(-\.19,1\.22,\.46,\.34\)/);
  assert.match(core, /const occultR=Math\.max\(sR\*\.985/);
  assert.doesNotMatch(core, /for\(let i=0;i<48;i\+\+\).*Math\.random\(\)/);
});

test("Sonnenfinsternis fällt ohne passende Großstadt auf Land oder Ozean zurück", () => {
  assert.match(core, /function finsternisGebiet\(j0\)/);
  assert.match(core, /function _finOzean\(la,lo\)/);
  assert.match(core, /Arktischer Ozean/);
  assert.match(core, /Indischer Ozean/);
  assert.match(core, /Atlantischer Ozean/);
  assert.match(core, /Pazifischer Ozean/);
  assert.match(core, /finsternisStadt\(jd\)\|\|\(!_finNurEuropa\?finsternisGebiet\(jd\):null\)/);
});

test("Echtzeitstart entkoppelt Finsternis- und UI-Nebenrechnungen vom Bildtakt", () => {
  assert.match(core, /__lastEclipseInfoTS/);
  assert.match(core, /ts-__lastEclipseInfoTS>=250/);
  assert.match(core, /Math\.abs\(speed\)<=2\?1000:250/);
});
