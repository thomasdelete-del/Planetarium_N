import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const core = fs.readFileSync(new URL("../src/legacy/01-core.js", import.meta.url), "utf8");

test("Sonnenfinsternis startet am verfeinerten ersten Kontakt", () => {
  assert.match(core, /function _finErsterKontakt\(/);
  assert.match(core, /jd=_finErsterKontakt\(finOrt\.jdMax,finOrt\.stadt\.la,finOrt\.stadt\.lo\)/);
  assert.match(core, /for\(let i=0;i<28;i\+\+\)/);
});

test("Sonnenfinsternis wechselt in die Sonnenansicht mit Echtzeit", () => {
  assert.match(core, /speed=type==="solar"\?1:120/);
  assert.match(core, /type==="solar"&&typeof pointObserverAtSun==="function"/);
  assert.match(core, /function pointObserverAtSun\(\)[\s\S]*?viewMode="real";[\s\S]*?camFov=65;/);
});

test("Finsternisleiste zeigt Navigation und Angaben in fester Reihenfolge", () => {
  assert.match(core, /class="ei-prev"[\s\S]*class="ei-date"[\s\S]*class="ei-place"[\s\S]*class="ei-cover"[\s\S]*class="ei-next"[\s\S]*class="ei-zu"/);
  assert.match(core, /jumpToEclipse\(-1,"solar"\)/);
  assert.match(core, /querySelector\("\.ei-place"\)\.textContent=stadt\+\(land\?", "\+land:""\)/);
  assert.match(core, /if\(window\.__eclipseNavigation\)[\s\S]*zeigeEclBox\(ds,nav\.stadt,nav\.land/);
  assert.match(core, /window\.__eclipseNavigation=null;verbergeEclBox\(\)/);
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
