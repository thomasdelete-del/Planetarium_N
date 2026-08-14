function decodeTile(buffer) {
  const view = new DataView(buffer);
  const signature = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
  if (signature !== "GTV1") throw new Error("keine Gaia-Vektorkachel");
  const count = view.getUint32(8, true);
  const magnitudeMinimum = view.getFloat32(12, true);
  const magnitudeStep = view.getFloat32(16, true);
  const gridRa = view.getUint16(20, true);
  const gridDec = view.getUint16(22, true);
  let offset = 32;
  const directoryBytes = 4 * (gridRa * gridDec + 1);
  const offsets = buffer.slice(offset, offset + directoryBytes); offset += directoryBytes;
  const x = buffer.slice(offset, offset + 4 * count); offset += 4 * count;
  const y = buffer.slice(offset, offset + 4 * count); offset += 4 * count;
  const z = buffer.slice(offset, offset + 4 * count); offset += 4 * count;
  const magnitude = buffer.slice(offset, offset + count); offset += count;
  const color = buffer.slice(offset, offset + count); offset += count;
  if (offset !== buffer.byteLength) throw new Error("Vektorkachel-Länge passt nicht");
  return { count, magnitudeMinimum, magnitudeStep, gridRa, gridDec, offsets, x, y, z, magnitude, color };
}

self.onmessage = event => {
  const { id, buffer } = event.data;
  try {
    const tile = decodeTile(buffer);
    const transfers = [tile.offsets, tile.x, tile.y, tile.z, tile.magnitude, tile.color];
    self.postMessage({ id, tile }, transfers);
  } catch (error) {
    self.postMessage({ id, error: error instanceof Error ? error.message : String(error) });
  }
};
