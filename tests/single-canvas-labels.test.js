import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

test('zoom and rest use the identical draw path once without intercepting text',()=>{
  const source=readFileSync(new URL('../src/features/render/labelCadence.js',import.meta.url),'utf8').replace('export function','function');
  let hook,draws=0;
  const ctx={performance:{now:()=>10},document:{getElementById:()=>null},
    __planetariumRender:{registerAroundDraw(name,fn){hook=fn}}};
  ctx.window=ctx;vm.createContext(ctx);vm.runInContext(source,ctx);
  const api=ctx.installLabelCadence();
  for(const interacting of [8,7,0,8,0]){
    ctx.interacting=interacting;
    assert.equal(hook({args:['same-frame'],next(value){draws++;return value}}),'same-frame');
  }
  assert.equal(draws,5);assert.equal(api.intervalMs,0);
  assert.equal(ctx.installLabelCadence(),api);
});
