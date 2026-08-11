import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const directory = path.join(root, "gaia", "tiles");
const levels = [10.5, 11, 11.5];
const groupRa = 4, groupDec = 4;
fs.mkdirSync(directory, { recursive: true });
for (const file of fs.readdirSync(directory)) fs.unlinkSync(path.join(directory, file));

function readCatalog(file) {
  const bytes = fs.readFileSync(file);
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const view = new DataView(buffer);
  const count = view.getUint32(8, true), magMin = view.getFloat32(12, true), magStep = view.getFloat32(16, true);
  const gridRa = view.getUint16(20, true), gridDec = view.getUint16(22, true), cells = gridRa * gridDec;
  let offset = 32;
  const starts = new Uint32Array(buffer, offset, cells + 1); offset += 4 * (cells + 1);
  const ra = new Uint32Array(buffer, offset, count); offset += 4 * count;
  const dec = new Int32Array(buffer, offset, count); offset += 4 * count;
  const mag = new Uint8Array(buffer, offset, count); offset += count;
  const color = new Uint8Array(buffer, offset, count);
  return { count, magMin, magStep, gridRa, gridDec, cells, starts, ra, dec, mag, color };
}

function writeGroup(catalog, level, groupX, groupY) {
  const selected = [];
  for (let dy = 0; dy < groupDec; dy++) for (let dx = 0; dx < groupRa; dx++) {
    const ri = groupX * groupRa + dx, di = groupY * groupDec + dy;
    if (ri >= catalog.gridRa || di >= catalog.gridDec) continue;
    const cell = di * catalog.gridRa + ri;
    for (let index = catalog.starts[cell]; index < catalog.starts[cell + 1]; index++) {
      const magnitude = catalog.magMin + catalog.mag[index] * catalog.magStep;
      if (magnitude > 10.05) selected.push({ cell, index });
    }
  }
  if (!selected.length) return null;
  const offsets = new Uint32Array(catalog.cells + 1);
  for (const item of selected) offsets[item.cell + 1]++;
  for (let cell = 0; cell < catalog.cells; cell++) offsets[cell + 1] += offsets[cell];
  /* GTV1: vorberechnete kartesische J2000-Einheitsvektoren. 14 Byte pro Stern
     statt RA/Dec plus teurer sin/cos-Umrechnung in jedem Renderbild. */
  const size = 32 + 4 * (catalog.cells + 1) + selected.length * 14;
  const output = new ArrayBuffer(size), view = new DataView(output);
  new Uint8Array(output, 0, 4).set([71, 84, 86, 49]);
  view.setUint32(4, 1, true); view.setUint32(8, selected.length, true);
  view.setFloat32(12, catalog.magMin, true); view.setFloat32(16, catalog.magStep, true);
  view.setUint16(20, catalog.gridRa, true); view.setUint16(22, catalog.gridDec, true);
  let out = 32;
  new Uint32Array(output, out, catalog.cells + 1).set(offsets); out += 4 * (catalog.cells + 1);
  const x = new Float32Array(output, out, selected.length); out += 4 * selected.length;
  const y = new Float32Array(output, out, selected.length); out += 4 * selected.length;
  const z = new Float32Array(output, out, selected.length); out += 4 * selected.length;
  const mag = new Uint8Array(output, out, selected.length); out += selected.length;
  const color = new Uint8Array(output, out, selected.length);
  selected.forEach((item, target) => {
    const ra = catalog.ra[item.index] * (Math.PI * 2 / 4294967296);
    const dec = catalog.dec[item.index] * (Math.PI / 2 / 2147483648);
    const cosDec = Math.cos(dec);
    x[target] = cosDec * Math.cos(ra); y[target] = cosDec * Math.sin(ra); z[target] = Math.sin(dec);
    mag[target] = catalog.mag[item.index]; color[target] = catalog.color[item.index];
  });
  const file = `g${String(level).replace(".", "_")}-${groupY}-${groupX}.bin`;
  fs.writeFileSync(path.join(directory, file), new Uint8Array(output));
  return { file: `gaia/tiles/${file}`, count: selected.length, bytes: size };
}

const manifestPath = path.join(root, "gaia", "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest.version = 5;
manifest.streaming = { baseMagnitude: 10, groupRa, groupDec, levels: [] };
for (const level of levels) {
  const catalog = readCatalog(path.join(root, "gaia", `gaia_${String(level).replace(".", "_")}.bin`));
  const tiles = [];
  for (let y = 0; y < Math.ceil(catalog.gridDec / groupDec); y++) {
    for (let x = 0; x < Math.ceil(catalog.gridRa / groupRa); x++) {
      const tile = writeGroup(catalog, level, x, y);
      if (tile) tiles.push({ x, y, ...tile });
    }
  }
  manifest.streaming.levels.push({ magnitude: level, tiles });
  console.log(`Gaia ${level} mag: ${tiles.length} Sichtfeldkacheln.`);
}
/* Vollkataloge oberhalb 10 mag werden zur Laufzeit nicht mehr benoetigt. */
manifest.stages = manifest.stages.filter(stage => stage.magnitude <= 10);
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
fs.copyFileSync(path.join(root, "gaia", "gaia_10.bin"), path.join(root, "gaia_compact.bin"));
for (const level of levels) {
  fs.unlinkSync(path.join(root, "gaia", `gaia_${String(level).replace(".", "_")}.bin`));
}
