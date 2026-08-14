const HEADER_SIZE = 32;
const RECORD_SIZE = 16;

function decodeRecords(buffer, count) {
  const view = new DataView(buffer);
  const x = new Float32Array(count), y = new Float32Array(count), z = new Float32Array(count);
  const magnitude = new Uint8Array(count), color = new Uint8Array(count);
  for (let index = 0; index < count; index++) {
    const offset = index * RECORD_SIZE;
    x[index] = view.getFloat32(offset, true);
    y[index] = view.getFloat32(offset + 4, true);
    z[index] = view.getFloat32(offset + 8, true);
    magnitude[index] = view.getUint8(offset + 12);
    color[index] = view.getUint8(offset + 13);
  }
  return Object.freeze({ count, x, y, z, magnitude, color });
}

export class GaiaSpatialCatalog {
  #manifestUrl;
  #manifest;
  #header;
  #wholeFile;
  #cache = new Map();
  #cacheLimit;

  constructor({ manifestUrl = new URL("../../gaia/manifest.json", import.meta.url), cacheLimit = 24 } = {}) {
    this.#manifestUrl = manifestUrl;
    this.#cacheLimit = cacheLimit;
  }

  async metadata() {
    await this.#ensureHeader();
    return Object.freeze({ ...this.#manifest.spatial3d, ...this.#header });
  }

  async loadCells(cells) {
    await this.#ensureHeader();
    const unique = [...new Set(cells)].filter(cell => Number.isInteger(cell) && cell >= 0 && cell < this.#header.cellCount);
    const result = new Map();
    for (const cell of unique) result.set(cell, await this.#loadCell(cell));
    return result;
  }

  clear() {
    this.#cache.clear();
    this.#wholeFile = undefined;
  }

  async #ensureManifest() {
    if (this.#manifest) return;
    const response = await fetch(this.#manifestUrl);
    if (!response.ok) throw new Error(`Gaia-Manifest: HTTP ${response.status}`);
    this.#manifest = await response.json();
    if (this.#manifest.spatial3d?.format !== "G3V2") throw new Error("Gaia-3D-Katalogformat G3V2 fehlt");
  }

  async #ensureHeader() {
    if (this.#header) return;
    await this.#ensureManifest();
    const fileUrl = new URL(`../../${this.#manifest.spatial3d.file}`, import.meta.url);
    const headerBuffer = await this.#range(fileUrl, 0, HEADER_SIZE - 1);
    const header = new DataView(headerBuffer);
    const magic = String.fromCharCode(...new Uint8Array(headerBuffer, 0, 4));
    if (magic !== "G3V2" || header.getUint32(4, true) !== 2) throw new Error("Ungueltiger Gaia-3D-Header");
    const count = header.getUint32(8, true), gridRa = header.getUint16(20, true), gridDec = header.getUint16(22, true);
    const cellCount = gridRa * gridDec;
    const directoryBuffer = await this.#range(fileUrl, HEADER_SIZE, HEADER_SIZE + 4 * (cellCount + 1) - 1);
    this.#header = Object.freeze({
      fileUrl, count, gridRa, gridDec, cellCount,
      minimumParallaxSnr: header.getFloat32(12, true),
      maximumDistancePc: header.getFloat32(16, true),
      recordsOffset: HEADER_SIZE + 4 * (cellCount + 1),
      offsets: new Uint32Array(directoryBuffer)
    });
  }

  async #range(url, start, end) {
    if (this.#wholeFile) return this.#wholeFile.slice(start, end + 1);
    const response = await fetch(url, { headers: { Range: `bytes=${start}-${end}` } });
    if (!response.ok) throw new Error(`Gaia-3D-Bereich: HTTP ${response.status}`);
    const buffer = await response.arrayBuffer();
    if (response.status === 200) {
      this.#wholeFile = buffer;
      return buffer.slice(start, end + 1);
    }
    return buffer;
  }

  async #loadCell(cell) {
    if (this.#cache.has(cell)) {
      const cached = this.#cache.get(cell); this.#cache.delete(cell); this.#cache.set(cell, cached);
      return cached;
    }
    const startRecord = this.#header.offsets[cell], endRecord = this.#header.offsets[cell + 1];
    const count = endRecord - startRecord;
    if (!count) return decodeRecords(new ArrayBuffer(0), 0);
    const start = this.#header.recordsOffset + startRecord * RECORD_SIZE;
    const buffer = await this.#range(this.#header.fileUrl, start, start + count * RECORD_SIZE - 1);
    const decoded = decodeRecords(buffer, count);
    this.#cache.set(cell, decoded);
    while (this.#cache.size > this.#cacheLimit) this.#cache.delete(this.#cache.keys().next().value);
    return decoded;
  }
}

export function createGaiaSpatialCatalog(options) {
  return new GaiaSpatialCatalog(options);
}
