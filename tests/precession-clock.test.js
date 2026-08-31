import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../src/legacy/09-precession-simulation.js',import.meta.url),'utf8');
function setup(){
  const frames=new Map(),starts=[];
  let id=0;
  const ctx={console,simYear:2026,paused:false,W:1,showNames:true,
    viewMode:'real',showRefCircles:false,didHidePrec:true,
    document:{getElementById:()=>null},
    // Deliberately oscillating calendar-based sidereal angle.
    LST:()=>100+(ctx.simYear%4)*0.246,
    setScene(){},setYearPlay(){},setSpeedValue(){},setPaused(v){ctx.paused=v},
    togAnim(){ctx.paused=!ctx.paused},
    draw(){},setTimeout(fn){starts.push(fn)},
    requestAnimationFrame(fn){frames.set(++id,fn);return id},
    cancelAnimationFrame(id){frames.delete(id)}};
  ctx.window=ctx;
  vm.createContext(ctx);vm.runInContext(source,ctx);
  ctx.startPrecessionRun100();starts.shift()();
  return {ctx,frame(ts){const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(ts));}};
}
test('precession keeps sidereal projection fixed across leap and century years',()=>{
  const {ctx,frame}=setup();const lst=ctx.LST();
  let previous=ctx.simYear;
  for(let i=1;i<=3000;i++){
    frame(i*16);
    assert.ok(ctx.simYear>=previous);
    assert.ok(ctx.simYear-previous<=2);
    assert.equal(ctx.LST(),lst);
    previous=ctx.simYear;
  }
  assert.ok(ctx.simYear>6800);
  ctx.stopPrecessionRun100();
  assert.equal(ctx.LST(),100+(ctx.simYear%4)*0.246);
  frame(50000);assert.equal(ctx.simYear,previous);
});
test('pause does not accumulate catch-up years',()=>{
  const {ctx,frame}=setup();frame(16);frame(32);
  ctx.paused=true;const y=ctx.simYear;
  frame(5000);assert.equal(ctx.simYear,y);
  ctx.paused=false;frame(5016);assert.ok(ctx.simYear-y<=2);
});
test('start/stop keeps the precession scheduler and projection',()=>{
  const {ctx,frame}=setup();frame(16);frame(32);
  assert.equal(ctx.viewMode,'dome');
  assert.equal(ctx.showRefCircles,true);
  assert.equal(ctx.didHidePrec,false);
  const year=ctx.simYear,lst=ctx.LST();
  ctx.togAnim();frame(48);
  assert.equal(ctx.simYear,year);
  assert.equal(ctx.didacticSimulationMode,'precession');
  assert.equal(ctx.LST(),lst);
  assert.equal(ctx.showRefCircles,true);
  assert.equal(ctx.didHidePrec,false);
  ctx.togAnim();frame(64);
  assert.ok(ctx.simYear>year);
  assert.equal(ctx.viewMode,'dome');
  assert.equal(ctx.showRefCircles,true);
  assert.equal(ctx.didHidePrec,false);
});
test('didactic finalization does not restart the competing year timer',()=>{
  const focus=readFileSync(new URL('../src/legacy/14-didactic-focus.js',import.meta.url),'utf8');
  const branch=focus.split('id==="sim-precession"||id==="sim-seasons"')[1].split('}else{')[0];
  assert.match(branch,/setYearPlay\(false\)/);
  assert.doesNotMatch(branch,/setYearPlay\(true/);
});
