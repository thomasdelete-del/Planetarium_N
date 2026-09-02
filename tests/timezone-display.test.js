import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const core=readFileSync(new URL('../src/legacy/01-core.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');

test('gespeicherte Weltstädte verwenden IANA-Zeitzonen statt nur den Längengrad',()=>{
  assert.match(core,/"Singapur":"Asia\/Singapore"/);
  assert.match(core,/"New York":"America\/New_York"/);
  assert.match(core,/"Sydney":"Australia\/Sydney"/);
  assert.match(core,/function zoneOffsetsForLocal\(tz,year,doy,minutes\)/);
  assert.match(core,/activeTimeZone=cityTimeZone\(c\)/);
  assert.match(core,/zoneOffsetsForLocal\(activeTimeZone,simYear,simDay,simMin\)/);
});

test('freie GPS-Koordinaten behalten den sicheren Zeitzonen-Fallback',()=>{
  assert.match(core,/function applyGPSResult\(la,lo,label\)\{activeTimeZone=null/);
  assert.match(core,/utcBase=tzFromLng\(lng\);autoDetectDST\(\)/);
});

test('Vergrößerungsanzeige unterscheidet Ansichtsfaktor und Bildfeld',()=>{
  assert.match(core,/function zoomDisplayText\(zm\)/);
  assert.match(core,/camFov\.toFixed\(camFov<10\?1:0\)\+"°"/);
  assert.match(core,/"🔭 Ansicht "\+z\+"×"/);
  assert.match(html,/Relative Bildschirmvergrößerung/);
});
