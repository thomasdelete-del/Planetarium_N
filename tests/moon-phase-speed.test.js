import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=name=>readFileSync(new URL('../src/legacy/'+name,import.meta.url),'utf8');
test('all delayed moon-phase confirmations retain 1 day/s; planets retain 1 hour/s',()=>{
  const source=read('14-didactic-focus.js');
  const code=source.slice(source.indexOf('var RUNNING_SIMULATIONS='),source.indexOf('var TOURS='));
  for(const [id,speed] of [['sim-moon-phases',86400],['sim-planet-run',3600]]){
    const callbacks=[],speeds=[];
    const ctx={window:{__lastJumpId:id,setGear:(v,noStart)=>speeds.push([v,noStart]),__queueAtomicSkyCommit:fn=>callbacks.push(fn)},setTimeout:fn=>callbacks.push(fn),redraw(){}};
    vm.createContext(ctx);vm.runInContext(code+`;confirmSimulationRunning('${id}');`,ctx);
    callbacks.forEach(fn=>fn());
    assert.deepEqual(speeds,[[speed,false],[speed,false],[speed,false]]);
  }
});
test('moon-phase scene starts at full moon with 86400 simulated seconds per second',()=>{
  const source=read('06-season-refinements.js');
  const start=source.indexOf("if(id==='sim-moon-phases'){");
  const block=source.slice(start,source.indexOf('const r=oldJumpScene',start));
  const calls=[];
  const ctx={jumpMoonPhase:(phase,label,view)=>{calls.push(phase);assert.equal(view,'dome')},sceneRun:speed=>calls.push(speed),setTimeout(){}};
  vm.createContext(ctx);vm.runInContext(`(function(id){${block}})('sim-moon-phases');`,ctx);
  assert.deepEqual(calls,[180,86400]);
});

test('moon-phase run selects full sky without entering observer view',()=>{
  const source=read('01-core.js');
  const code=source.slice(source.indexOf('function jumpMoonPhase('),source.indexOf('function startYearSimulation('));
  for(const previous of ['dome','real']){
    const ctx={viewMode:previous,orientMode:true,zoom:8,panX:20,panY:30,zoomedObj:'Mond',
      beginAtomicSkyJump(){},findNextMoonPhase:()=>1,findMoonTransitNear:()=>2,
      setSceneFromJD(){ctx.orientMode=false},syncViewModeButtons(){},updateTouchMode(){},showToast(){},
      pointObserverAtMoon(){throw Error('must not enter observer view')}
    };
    vm.createContext(ctx);vm.runInContext(code+';jumpMoonPhase(180,"Vollmond","dome");',ctx);
    assert.equal(ctx.viewMode,'dome');assert.equal(ctx.orientMode,false);
    assert.equal(ctx.zoom,1);assert.equal(ctx.panX,0);assert.equal(ctx.panY,0);assert.equal(ctx.zoomedObj,null);
  }
});
