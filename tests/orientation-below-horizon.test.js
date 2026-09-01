import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/legacy/01-core.js',import.meta.url),'utf8');
test('orientation mode applies one common soft vignette below the horizon',()=>{
  assert.match(source,/id="orientation-below-layer"/);
  assert.match(source,/zIndex:"3"/);
  assert.match(source,/gg\.addColorStop\(0,"rgba\(8,14,24,\.30\)"\);gg\.addColorStop\(\.18,"rgba\(5,9,17,\.56\)"\);gg\.addColorStop\(\.48,"rgba\(3,6,13,\.72\)"\);gg\.addColorStop\(1,"rgba\(1,3,8,\.78\)"\)/);
  assert.match(source,/_orientBelowDraw\(pts,HH,g\.getTransform\(\)\)/);
  assert.match(source,/const op=orientMode\?baseOp\*nightF\*\(sinAlt>0\?extBySinAlt\(sinAlt\):\(mag>5\.2\?0:\.75\)\)/);
  assert.doesNotMatch(source,/globalCompositeOperation="destination-in"/);
});
test('Gaia below the horizon has fewer faint stars than the visible dark sky',()=>{
  assert.doesNotMatch(source,/belowFactor=/);
  assert.match(source,/sinAlt<=0\.0&&u_allowBelow>\.5&&!densityLayer&&mag>5\.2/);
  assert.match(source,/sinAlt<=0\.0\?\(u_allowBelow>\.5\?\.75:0\.0\)/);
  assert.match(source,/sinAlt>0\?extBySinAlt\(sinAlt\):\(mag>5\.2\?0:\.75\)/);
});
