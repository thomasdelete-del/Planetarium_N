import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/legacy/01-core.js',import.meta.url),'utf8');
const start=source.indexOf('if(id==="sim-daily-rotation")');
const end=source.indexOf('sceneRun(900);return;',start)+'sceneRun(900);return;'.length;
const branch=source.slice(start,end)+'}';
test('daily rotation always enters observer home before starting the clock',()=>{
  for(const mode of ['real','dome'])for(const sensor of [true,false]){
    const buttons=[];
    const ctx={viewMode:mode,orientMode:sensor,camAz:123,camAlt:-20,camFov:5,zoom:8,panX:42,panY:17,zoomedObj:'Mars',
      document:{getElementById:id=>({classList:{add:()=>buttons.push(id)}})},
      setScene(...args){ctx.sceneArgs=args;ctx.orientMode=false;ctx.zoom=1;ctx.panX=ctx.panY=0;ctx.zoomedObj=null},
      updateTouchMode(){assert.equal(ctx.viewMode,'real')},
      sceneRun(speed){assert.equal(ctx.viewMode,'real');assert.equal(ctx.camAlt,26);ctx.runSpeed=speed}
    };
    vm.createContext(ctx);
    vm.runInContext(source.match(/function setRealHome\(\)\{[^}]+\}/)[0]+`; (function(id){${branch}})('sim-daily-rotation');`,ctx);
    assert.equal(ctx.orientMode,false);
    assert.equal(ctx.camAz,0);assert.equal(ctx.camFov,65);
    assert.equal(ctx.zoom,1);assert.equal(ctx.panX,0);assert.equal(ctx.panY,0);
    assert.equal(ctx.runSpeed,900);assert.equal(ctx.zoomedObj,null);
    assert.deepEqual(buttons,['bview','bview-fs']);
  }
});
