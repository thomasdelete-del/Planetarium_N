import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const core=readFileSync(new URL('../src/legacy/01-core.js',import.meta.url),'utf8');
const code=core.slice(core.indexOf('(function autoStartOrient(){'),core.indexOf('})();(function initLocationByTimezone'))+'})();';
function setup(api){
  const listeners=new Map(),timers=[],frames=[],log=[];
  const button={},ctx={DeviceOrientationEvent:api,viewMode:'dome',orientMode:false,W:1,
    oAz:0,oAlt:0,oAzT:23,oAltT:45,__atomicSkyUntil:0,performance:{now:()=>100},
    document:{getElementById:id=>id==='sensor-start-button'?button:{remove(){log.push('reveal')}},documentElement:{classList:{remove(){}}}},
    addEventListener(n,fn){listeners.set(n,fn)},removeEventListener(n){listeners.delete(n)},
    setTimeout(fn,ms){timers.push({fn,ms});return timers.length},clearTimeout(){},
    requestAnimationFrame(fn){frames.push(fn)},__requestPlanetariumFrame(){},
    orientDirFromEvent:e=>e.absolute?{}:null,enableOrient(){ctx.orientMode=true},
    onDeviceOrient(){},applyOrientView(){},disableOrient(){ctx.orientMode=false},
    setRealHome(){},syncViewModeButtons(){},updateTouchMode(){},draw(){log.push('draw')}};
  ctx.window=ctx;vm.createContext(ctx);vm.runInContext(code,ctx);
  return {ctx,log,listeners,button,run(ms){timers.filter(t=>t.ms===ms).forEach(t=>t.fn());frames.splice(0).forEach(fn=>fn())}};
}
test('no sensor API: observer is drawn before reveal',()=>{
  const s=setup();s.run(0);assert.equal(s.ctx.viewMode,'real');assert.equal(s.ctx.orientMode,false);assert.deepEqual(s.log,['draw','reveal']);
});
test('usable sensor: orientation first, no intermediate view',()=>{
  const s=setup({});assert.deepEqual(s.log,[]);
  s.listeners.get('deviceorientation')({absolute:true,beta:20,gamma:0});s.run(0);
  assert.equal(s.ctx.orientMode,true);assert.deepEqual(s.log,['draw','reveal']);
});
test('sensor without usable readings: observer on timeout',()=>{
  const s=setup({});s.run(500);s.run(0);assert.equal(s.ctx.orientMode,false);assert.deepEqual(s.log,['draw','reveal']);
});
