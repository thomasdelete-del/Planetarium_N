import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/legacy/01-core.js',import.meta.url),'utf8');
test('Gaia GPU screen position remains finite in centered phone and desktop views',()=>{
  const match=source.match(/gl_Position=vec4\(sx\/u_screen\.z\*2\.0-1\.0,([^,]+),0\.0,1\.0\)/);
  assert.ok(match);
  const projectY=new Function('sy','u_screen','u_view','return '+match[1]);
  for(const height of [780,1080,2340])for(const panY of [0,-100,100]){
    for(const sy of [0,height/2,height]){
      const y=projectY(sy,{w:height},{y:panY});
      assert.ok(Number.isFinite(y));
      assert.equal(y,1-2*sy/height);
    }
  }
});
