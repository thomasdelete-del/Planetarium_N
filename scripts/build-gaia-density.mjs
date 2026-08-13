import fs from "node:fs";
import path from "node:path";

const root=process.cwd(),input=fs.readFileSync(path.join(root,"gaia_merged.bin"));
const source=input.buffer.slice(input.byteOffset,input.byteOffset+input.byteLength),view=new DataView(source);
if(String.fromCharCode(...new Uint8Array(source,0,4))!=="GDR3")throw new Error("keine GDR3-Datei");
const version=view.getUint32(4,true),recordSize=version>=2?44:36,records=view.getUint32(8,true);
const stride=32,minMag=9.5,maxMag=12.3,gridRa=48,gridDec=24,cells=gridRa*gridDec;
const counts=new Uint32Array(cells);let count=0;
for(let i=0;i<records;i++){
  const g=view.getFloat32(16+i*recordSize+24,true);
  if(g>minMag&&g<=maxMag&&((Math.imul(i+1,2654435761)>>>0)%stride===0)){
    const off=16+i*recordSize,ra=((view.getFloat64(off+8,true)%360)+360)%360,de=view.getFloat64(off+16,true);
    const cell=Math.max(0,Math.min(gridDec-1,Math.floor((de+90)/180*gridDec)))*gridRa+Math.min(gridRa-1,Math.floor(ra/360*gridRa));
    counts[cell]++;count++;
  }
}
/* GSMP: reale Gaia-Quellen als flusserhaltende Punktstichprobe. Jede Quelle
   bleibt an ihrer wirklichen Position; ihr Licht steht stellvertretend fuer
   stride benachbarte, im Ueberblick noch nicht einzeln aufgeloeste Quellen. */
const offsets=new Uint32Array(cells+1);for(let c=0;c<cells;c++)offsets[c+1]=offsets[c]+counts[c];
const positions=offsets.slice(0,cells),directoryBytes=(cells+1)*4;
/* GSMP3 speichert zusätzlich ein fertiges Dichte-/Bulge-Gewicht je Zelle.
   Die 1.152 Bytes ersparen jedem Endgerät die galaktische Analyse. */
const boost=new Uint8Array(cells),gcx=-.05487556,gcy=-.87343709,gcz=-.48383502,gpx=-.86766615,gpy=-.19807637,gpz=.45598378;
const mean=count/cells;
for(let cell=0;cell<cells;cell++){
  const ri=cell%gridRa,di=Math.floor(cell/gridRa),ra=(ri+.5)/gridRa*Math.PI*2,de=(di+.5)/gridDec*Math.PI-Math.PI/2,cd=Math.cos(de);
  const x=cd*Math.cos(ra),y=cd*Math.sin(ra),z=Math.sin(de);
  const gc=Math.acos(Math.max(-1,Math.min(1,x*gcx+y*gcy+z*gcz))),gb=Math.asin(Math.max(-1,Math.min(1,x*gpx+y*gpy+z*gpz)));
  const plane=Math.exp(-Math.pow(gb/(12*Math.PI/180),2)),bulge=Math.exp(-Math.pow(gc/(48*Math.PI/180),2));
  const density=Math.max(.7,Math.min(2.2,Math.pow(Math.max(.05,counts[cell]/mean),.28)));
  boost[cell]=Math.max(0,Math.min(5,Math.round(Math.log2((1+5.2*plane*bulge)*density)*2)));
}
const output=new ArrayBuffer(32+directoryBytes+count*16+cells),header=new DataView(output);
new Uint8Array(output,0,4).set([71,83,77,80]);header.setUint32(4,3,true);header.setUint32(8,count,true);
header.setUint16(12,stride,true);header.setUint16(14,gridRa,true);header.setUint16(16,gridDec,true);
header.setFloat32(20,minMag,true);header.setFloat32(24,maxMag,true);
let o=32;new Uint32Array(output,o,cells+1).set(offsets);o+=directoryBytes;
const vec=new Float32Array(output,o,count*3);o+=count*12;const light=new Float32Array(output,o,count);
for(let i=0;i<records;i++){
  const off=16+i*recordSize,g=view.getFloat32(off+24,true);
  if(!(g>minMag&&g<=maxMag&&((Math.imul(i+1,2654435761)>>>0)%stride===0)))continue;
  const raDeg=((view.getFloat64(off+8,true)%360)+360)%360,deDeg=view.getFloat64(off+16,true);
  const cell=Math.max(0,Math.min(gridDec-1,Math.floor((deDeg+90)/180*gridDec)))*gridRa+Math.min(gridRa-1,Math.floor(raDeg/360*gridRa));
  const target=positions[cell]++,ra=raDeg*Math.PI/180,de=deDeg*Math.PI/180,cd=Math.cos(de);
  vec[target*3]=cd*Math.cos(ra);vec[target*3+1]=cd*Math.sin(ra);vec[target*3+2]=Math.sin(de);
  light[target]=Math.pow(10,-.4*(g-minMag))*stride;
}
o+=count*4;new Uint8Array(output,o,cells).set(boost);
const file=path.join(root,"gaia","gaia_density.bin");fs.writeFileSync(file,new Uint8Array(output));
const manifestPath=path.join(root,"gaia","manifest.json"),manifest=JSON.parse(fs.readFileSync(manifestPath,"utf8"));
manifest.version=Math.max(7,manifest.version||1);
manifest.version=Math.max(8,manifest.version||1);
manifest.density={file:"gaia/gaia_density.bin",format:"GSMP3",count,stride,gridRa,gridDec,magnitudeMin:minMag,magnitudeMax:maxMag,cellWeight:"galactic-density-u8"};
fs.writeFileSync(manifestPath,`${JSON.stringify(manifest,null,2)}\n`);
console.log(`Gaia-Flussstichprobe: ${count.toLocaleString("de-DE")} reale Quellen, 1:${stride}.`);
