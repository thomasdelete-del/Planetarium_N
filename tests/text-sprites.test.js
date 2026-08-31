import test from 'node:test';
import assert from 'node:assert/strict';
import {createTextSpriteRenderer} from '../src/features/render/textSprites.js';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

test('sky and observer views dispatch text through the same sprite renderer',()=>{
  const source=readFileSync(new URL('../src/legacy/01-core.js',import.meta.url),'utf8');
  const code=source.slice(source.indexOf('const nativeFillText='),source.indexOf('const zNames='));
  for(const viewMode of ['sky','real']){
    const calls=[];
    const ctx={viewMode,g:{save(){},restore(){}},window:{__renderTextSprite(...args){calls.push(args);return true}},directFillText(){throw Error('unexpected direct text path')}};
    vm.createContext(ctx);vm.runInContext(code+';nativeFillText("Atair",12.25,23.75);',ctx);
    assert.equal(calls.length,1);
    assert.deepEqual(calls[0].slice(1),['Atair',12.25,23.75]);
  }
});

test('label sprites omit shadows and cache glyphs without caching positions',()=>{
  const inks=[], draws=[];
  const render=createTextSpriteRenderer({createCanvas(){
    const ink={measureText:()=>({actualBoundingBoxLeft:0,actualBoundingBoxRight:24,actualBoundingBoxAscent:8,actualBoundingBoxDescent:2}),scale(x,y){this.resolution=[x,y]},fillText(){}};
    inks.push(ink);
    return {getContext:()=>ink};
  }});
  const ctx={font:'10px sans-serif',fillStyle:'#fff',textBaseline:'middle',shadowBlur:4,shadowColor:'black',shadowOffsetX:1,shadowOffsetY:2,
    save(){},restore(){},drawImage(...args){draws.push(args)}};
  assert.equal(render(ctx,'Sonne',20.25,30.5),true);
  ctx.shadowBlur=10;
  assert.equal(render(ctx,'Sonne',21.5,32.75),true);
  assert.equal(inks.length,1);
  assert.equal(inks[0].shadowColor,undefined);
  assert.equal(inks[0].shadowBlur,undefined);
  assert.deepEqual(inks[0].resolution,[2,2]);
  assert.equal(draws[0][0].width,draws[0][3]*2);
  assert.equal(draws[0][0].height,draws[0][4]*2);
  assert.equal(draws[1][1]-draws[0][1],1.25);
  assert.equal(draws[1][2]-draws[0][2],2.25);
});
