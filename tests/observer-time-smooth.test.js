import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/legacy/01-core.js',import.meta.url),'utf8');

test('stellar extinction has no brightness jumps at lookup-table boundaries',()=>{
  const ctx={};vm.createContext(ctx);
  vm.runInContext(source.slice(source.indexOf('const EXT_LUT='),source.indexOf('function extByAltDeg')),ctx);
  for(let i=1;i<128;i++){
    const left=ctx.extBySinAlt(i/128-1e-9),right=ctx.extBySinAlt(i/128+1e-9);
    assert.ok(Math.abs(right-left)<1e-7,`brightness jump at ${i}/128`);
    assert.ok(right>=left);
  }
  assert.equal(ctx.extBySinAlt(1),1);
  assert.equal(ctx.extBySinAlt(-.1),0);
});
test('observer projection is continuous across the 15 degree refraction boundary',()=>{
  const code=source.slice(source.indexOf('function altazXY('),source.indexOf('let _camCache'));
  const ctx={lat:0,_phiLat:NaN,_phiSin:0,_phiCos:1,viewMode:'real',lst:0,LST(){return ctx.lst},projReal(A,a){return a*180/Math.PI}};
  vm.createContext(ctx);vm.runInContext(code,ctx);
  const at=alt=>{ctx.lst=90-alt;return ctx.altazXY(0,0,1)};
  assert.ok(Math.abs(at(15.00001)-at(14.99999))<0.0001);
  assert.ok(at(14.99999)<at(15.00001));
});
test('1 h/s observer clock uses available animation frames without a second frame-rate gate',()=>{
  const code=source.slice(source.indexOf('function __astronomyFrameInterval()'),source.indexOf('function __requestPlanetariumFrame()'));
  const ctx={speed:3600,viewMode:'real',window:{},__fastTimeIsDaylight:()=>false};
  vm.createContext(ctx);vm.runInContext(code,ctx);
  assert.equal(ctx.__astronomyFrameInterval(),0);
});
