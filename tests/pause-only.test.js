import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const core=readFileSync(new URL('../src/legacy/01-core.js',import.meta.url),'utf8');
const toggle=core.slice(core.indexOf('function togAnim()')).split('function ')[1];
for(const speed of [0,1,136,3600]){
  test(`start/stop preserves parameters at speed ${speed}`,()=>{
    const ctx={paused:false,speed,userSpeed:136,lat:52.5,lng:13.4,
      simYear:2026,simDay:240,simMin:600,orientMode:true,mode:'real',
      didacticSimulationMode:'precession',__pendingRunSpeed:3600,W:1,
      showRefCircles:true,didHidePrec:false,showPrecessionCircle:true,__v9PrecessionStatic:true,
      frames:0,draw(){},setPaused(value){ctx.paused=value},
      __requestPlanetariumFrame(){ctx.frames++}};
    ctx.window=ctx;
    vm.createContext(ctx);vm.runInContext('function '+toggle,ctx);
    const parameters=()=>JSON.stringify(Object.fromEntries(Object.entries(ctx)
      .filter(([key,value])=>!['paused','frames','window'].includes(key)&&typeof value!=='function')));
    const before=parameters();
    ctx.togAnim();assert.equal(ctx.paused,true);assert.equal(parameters(),before);
    ctx.togAnim();assert.equal(ctx.paused,false);assert.equal(parameters(),before);
    assert.equal(ctx.frames,1);
  });
}
test('button state depends only on pause, not on playback speed',()=>{
  assert.match(core,/const _ez=paused;/);
  assert.doesNotMatch(core,/const _ez=\(paused\|\|Math.abs\(speed-1\)/);
});
