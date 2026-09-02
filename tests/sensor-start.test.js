import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const core=readFileSync(new URL('../src/legacy/01-core.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');

test('phone startup enters orientation mode without a sensor probe',()=>{
  const block=core.slice(core.indexOf('(function autoStartOrient(){'),core.indexOf('})();(function initLocationByTimezone'));
  assert.match(block,/const mobile=/);
  assert.match(block,/if\(api&&typeof api\.requestPermission!=="function"\)enableOrient\(\)/);
  assert.doesNotMatch(block,/deviceorientationabsolute|Lagesensor wird geprüft|setTimeout\(\(\)=>finish/);
});

test('iOS permission is deferred to the first user gesture',()=>{
  const block=core.slice(core.indexOf('(function autoStartOrient(){'),core.indexOf('})();(function initLocationByTimezone'));
  assert.match(block,/document\.addEventListener\("pointerdown",allow,true\)/);
  assert.match(block,/api\.requestPermission\(\)\.then/);
});

test('startup has no sensor-check overlay',()=>{
  assert.doesNotMatch(html,/sensor-starting|id="sensor-start"|Lagesensor wird geprüft/);
});
