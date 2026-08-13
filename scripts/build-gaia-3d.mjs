import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const inputPath = path.join(root, "gaia_merged.bin");
const outputPath = path.join(root, "gaia", "gaia_3d.bin");
const manifestPath = path.join(root, "gaia", "manifest.json");
const gridRa = 48, gridDec = 24, cellCount = gridRa * gridDec;
const minimumSnr = 5;
const maximumDistancePc = 20000;

const bytes = fs.readFileSync(inputPath);
const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
const view = new DataView(buffer);
const signature = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
const version = view.getUint32(4, true);
const sourceCount = view.getUint32(8, true);
if (signature !== "GDR3" || version < 2 || 16 + sourceCount * 44 !== buffer.byteLength) {
  throw new Error("Der Gaia-Rohkatalog enthaelt noch keine vollstaendigen Parallaxendaten (GDR3 v2).");
}

const counts = new Uint32Array(cellCount);
let reliableCount = 0;
const reliable = (index) => {
  const offset = 16 + index * 44;
  const parallax = view.getFloat32(offset + 36, true);
  const error = view.getFloat32(offset + 40, true);
  if (!(parallax > 0 && error > 0 && parallax / error >= minimumSnr)) return null;
  const distance = 1000 / parallax;
  if (!(distance > 0 && distance <= maximumDistancePc)) return null;
  return { offset, distance };
};
const cellOf = (ra, dec) => {
  const ri = Math.min(gridRa - 1, Math.floor((((ra % 360) + 360) % 360) / 360 * gridRa));
  const di = Math.max(0, Math.min(gridDec - 1, Math.floor((dec + 90) / 180 * gridDec)));
  return di * gridRa + ri;
};

for (let index = 0; index < sourceCount; index++) {
  const item = reliable(index); if (!item) continue;
  const ra = view.getFloat64(item.offset + 8, true), dec = view.getFloat64(item.offset + 16, true);
  counts[cellOf(ra, dec)]++; reliableCount++;
}

const offsets = new Uint32Array(cellCount + 1);
for (let cell = 0; cell < cellCount; cell++) offsets[cell + 1] = offsets[cell] + counts[cell];
const positions = offsets.slice(0, cellCount);
const headerSize = 32, directorySize = 4 * (cellCount + 1);
const recordSize = 16;
const output = new ArrayBuffer(headerSize + directorySize + reliableCount * recordSize);
const outputView = new DataView(output);
new Uint8Array(output, 0, 4).set([71, 51, 86, 50]); // G3V2
outputView.setUint32(4, 2, true);
outputView.setUint32(8, reliableCount, true);
outputView.setFloat32(12, minimumSnr, true);
outputView.setFloat32(16, maximumDistancePc, true);
outputView.setUint16(20, gridRa, true); outputView.setUint16(22, gridDec, true);
let out = headerSize;
new Uint32Array(output, out, cellCount + 1).set(offsets); out += directorySize;
const recordsOffset = out;

for (let index = 0; index < sourceCount; index++) {
  const item = reliable(index); if (!item) continue;
  const raDeg = view.getFloat64(item.offset + 8, true), decDeg = view.getFloat64(item.offset + 16, true);
  const target = positions[cellOf(raDeg, decDeg)]++;
  const ra = raDeg * Math.PI / 180, dec = decDeg * Math.PI / 180, cosDec = Math.cos(dec);
  const recordOffset = recordsOffset + target * recordSize;
  outputView.setFloat32(recordOffset, item.distance * cosDec * Math.cos(ra), true);
  outputView.setFloat32(recordOffset + 4, item.distance * cosDec * Math.sin(ra), true);
  outputView.setFloat32(recordOffset + 8, item.distance * Math.sin(dec), true);
  const g = view.getFloat32(item.offset + 24, true);
  const bp = view.getFloat32(item.offset + 28, true), rp = view.getFloat32(item.offset + 32, true);
  outputView.setUint8(recordOffset + 12, Math.max(0, Math.min(255, Math.round((g + 2) * 16))));
  const bpRp = bp > 0 && rp > 0 ? bp - rp : .8;
  outputView.setUint8(recordOffset + 13, Math.max(0, Math.min(255, Math.round((Math.max(-1, Math.min(5, bpRp)) + 1) / 6 * 255))));
}

fs.writeFileSync(outputPath, new Uint8Array(output));
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest.spatial3d = {
  file: "gaia/gaia_3d.bin", format: "G3V2", recordSize, count: reliableCount,
  bytes: output.byteLength, minimumParallaxSnr: minimumSnr, maximumDistancePc
};
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Gaia 3D: ${reliableCount.toLocaleString("de-DE")} verlaessliche Entfernungsvektoren (${(output.byteLength / 1048576).toFixed(1)} MB).`);
