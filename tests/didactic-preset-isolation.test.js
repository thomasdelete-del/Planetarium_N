import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../src/legacy/14-didactic-focus.js',import.meta.url),'utf8');

test('every didactic preset assigns every supported display flag',()=>{
  const flags=[...source.match(/var FLAGS=\[([^\]]+)\]/)[1].matchAll(/"([^"]+)"/g)].map(m=>m[1]);
  const presets=source.slice(source.indexOf('var P={'),source.indexOf('\n  };',source.indexOf('var P={')));
  for(const key of ['seasons','polar','eclipse','moon','prec','planets','rotation']){
    const body=presets.match(new RegExp(`${key}:\\{([^}]*)\\}`))[1];
    for(const flag of flags)assert.match(body,new RegExp(`${flag}:`),`${key} lacks ${flag}`);
  }
});

test('didactic preset application overwrites all flags independently of previous state',()=>{
  assert.match(source,/for\(var fi=0;fi<FLAGS\.length;fi\+\+\)\{var f=FLAGS\[fi\];setFlag\(f,p\[f\]===true\);\}/);
  assert.doesNotMatch(source,/if\(!window\.didacticFocus\|\|!P\[key\]\)return/);
});
