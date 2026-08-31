import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../src/legacy/01-core.js',import.meta.url),'utf8');
test('constellation names have one anchor each, including all zodiac constellations',()=>{
  const context={};vm.createContext(context);
  vm.runInContext(source.slice(source.indexOf('const CON_LBL='),source.indexOf('const MW_CENTER='))+';this.labels=CONSTELLATION_LABELS;this.zodiac=ZCON;',context);
  const names=context.labels.map(label=>label.n);
  assert.equal(new Set(names).size,names.length);
  for(const [name] of context.zodiac)assert.equal(names.filter(n=>n===name).length,1);
  for(const name of ['Schwan','Pfeil','Adler'])assert.equal(names.filter(n=>n===name).length,1);
});

test('zodiac constellation names use only the shared constellation drawing pass',()=>{
  assert.equal((source.match(/CONSTELLATION_LABELS\.forEach\(cl=>/g)||[]).length,1);
  assert.equal(source.includes('g.fillText(zc[0],P.x,P.y)'),false);
  assert.equal(source.includes('CON_LBL.forEach(cl=>'),false);
});
