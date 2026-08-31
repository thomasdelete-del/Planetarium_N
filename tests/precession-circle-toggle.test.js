import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

test('didactic precession zoom button does not call the scene reset',()=>{
  const source=readFileSync(new URL('../src/legacy/14-didactic-focus.js',import.meta.url),'utf8');
  const handler=source.split('pzb.onclick=function(){')[1].split('\n      };')[0];
  const ctx={zoom:4,panX:200,panY:-150,zoomedObj:'Präzessionskreis',
    paused:true,speed:0,simYear:6000,simDay:80,simMin:1320,lat:52.52,lng:13.405,
    didacticSimulationMode:'precession',__v9PrecessionStatic:true,
    showRefCircles:true,didHidePrec:false,viewMode:'dome',
    redraw(){},resetView(){throw new Error('Scene reset must not run')},
    pzb:{classList:{remove(){}}}};
  ctx.window=ctx;
  const snapshot=()=>Object.fromEntries(Object.entries(ctx).filter(([key,value])=>
    !['zoom','panX','panY','zoomedObj','window','pzb'].includes(key)&&typeof value!=='function'));
  const before=snapshot();
  vm.createContext(ctx);vm.runInContext('(function(){'+handler+'})()',ctx);
  assert.deepEqual(snapshot(),before);
  assert.equal(ctx.zoom,1);assert.equal(ctx.panX,0);assert.equal(ctx.panY,0);
  assert.equal(ctx.zoomedObj,null);
});

test('switching the circle off resets only zoom, retaining simulation parameters',()=>{
  const source=readFileSync(new URL('../src/features/didactics/precessionCircle.js',import.meta.url),'utf8').replace('export function','function');
  const state={zoom:4,lat:52.52,lng:13.405,simYear:2400,simDay:80,simMin:600,
    paused:false,speed:0,viewMode:'dome',showRefCircles:true,panX:12,panY:34};
  const before={...state};
  const ctx={document:{getElementById:()=>null},didacticSimulationMode:null,
    __planetariumLegacy:{set(key,value){state[key]=value}},draw(){}};
  ctx.window=ctx;vm.createContext(ctx);vm.runInContext(source,ctx);
  ctx.installPrecessionCircleControl();
  ctx.togPrecessionCircle();assert.deepEqual(state,before);
  assert.equal(ctx.showPrecessionCircle,true);
  ctx.togPrecessionCircle();assert.deepEqual(state,{...before,zoom:1});
  assert.equal(ctx.showPrecessionCircle,true);
  assert.equal(ctx.didacticSimulationMode,null);
  ctx.didacticSimulationMode='precession';state.zoom=4;
  ctx.togPrecessionCircle();assert.deepEqual(state,{...before,zoom:1});
  assert.equal(ctx.showPrecessionCircle,true);
  assert.equal(ctx.didacticSimulationMode,'precession');
});
