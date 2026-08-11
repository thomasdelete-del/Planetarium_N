export const GAIA_MAG_MIN = -2;
export const GAIA_MAG_STEP = 1 / 16;

const COLOR_MIN = -1;
const COLOR_SPAN = 6;

export function compactGaiaCatalog(buffer, gridRa, gridDec, namedStars = [], options = {}) {
  const view = new DataView(buffer);
  const signature = String.fromCharCode(
    view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3)
  );
  if (signature !== "GDR3") throw new Error("keine GDR3-Datei");

  const sourceCount = view.getUint32(8, true);
  const maxMagnitude = Number.isFinite(options.maxMagnitude) ? options.maxMagnitude : Infinity;
  let count = 0;
  if (16 + sourceCount * 36 !== buffer.byteLength) {
    throw new Error(`Länge passt nicht zu ${sourceCount} Sätzen`);
  }

  for (let index = 0; index < sourceCount; index += 1) {
    if (view.getFloat32(16 + index * 36 + 24, true) <= maxMagnitude) count += 1;
  }

  const cellCount = gridRa * gridDec;
  const counts = new Uint32Array(cellCount);
  const cells = new Uint16Array(count);
  const magnitudes = new Uint8Array(count);
  const rightAscensions = new Uint32Array(count);
  const declinations = new Int32Array(count);
  const colors = new Uint8Array(count);

  let selectedIndex = 0;
  for (let index = 0; index < sourceCount; index += 1) {
    const offset = 16 + index * 36;
    const ra = view.getFloat64(offset + 8, true);
    const dec = view.getFloat64(offset + 16, true);
    const g = view.getFloat32(offset + 24, true);
    const bp = view.getFloat32(offset + 28, true);
    const rp = view.getFloat32(offset + 32, true);
    let raCell = Math.floor((((ra / 15) % 24) + 24) % 24 / 24 * gridRa);
    if (raCell >= gridRa) raCell = gridRa - 1;
    let decCell = Math.floor((dec + 90) / 180 * gridDec);
    decCell = Math.max(0, Math.min(gridDec - 1, decCell));
    const cell = decCell * gridRa + raCell;
    if (g > maxMagnitude) continue;
    const target = selectedIndex++;
    cells[target] = cell;
    counts[cell] += 1;
    rightAscensions[target] = ((((ra % 360) + 360) % 360) / 360 * 4294967296) >>> 0;
    declinations[target] = Math.max(-2147483648, Math.min(2147483647, Math.round(dec / 90 * 2147483648)));
    const color = bp > 0 && rp > 0 ? bp - rp : 0.8;
    const correctedColor = Math.max(-0.5, Math.min(5, color));
    const visualMagnitude = g + 0.0176 + 0.00686 * correctedColor + 0.1732 * correctedColor ** 2;
    magnitudes[target] = Math.max(0, Math.min(254, Math.round((visualMagnitude - GAIA_MAG_MIN) / GAIA_MAG_STEP)));
    colors[target] = Math.max(0, Math.min(255,
      Math.round((Math.max(COLOR_MIN, Math.min(COLOR_MIN + COLOR_SPAN, color)) - COLOR_MIN) / COLOR_SPAN * 255)
    ));
  }

  const offsets = new Uint32Array(cellCount + 1);
  for (let cell = 0; cell < cellCount; cell += 1) offsets[cell + 1] = offsets[cell] + counts[cell];
  const positions = offsets.slice(0, cellCount);
  const order = new Uint32Array(count);
  for (let index = 0; index < count; index += 1) order[positions[cells[index]]++] = index;
  for (let cell = 0; cell < cellCount; cell += 1) {
    const start = offsets[cell], end = offsets[cell + 1];
    if (end - start > 1) {
      const part = Array.from(order.subarray(start, end));
      part.sort((left, right) => magnitudes[left] - magnitudes[right]);
      order.set(part, start);
    }
  }

  const sortedRa = new Uint32Array(count), sortedDec = new Int32Array(count);
  const sortedMag = new Uint8Array(count), sortedColor = new Uint8Array(count);
  for (let index = 0; index < count; index += 1) {
    const source = order[index];
    sortedRa[index] = rightAscensions[source];
    sortedDec[index] = declinations[source];
    sortedMag[index] = magnitudes[source];
    sortedColor[index] = colors[source];
  }

  const removed = new Uint8Array(count);
  let duplicateCount = 0;
  const radians = Math.PI / 180;
  for (const star of namedStars) {
    let raCell = Math.floor((((star.ra % 24) + 24) % 24) / 24 * gridRa);
    if (raCell >= gridRa) raCell = gridRa - 1;
    let decCell = Math.floor((star.de + 90) / 180 * gridDec);
    decCell = Math.max(0, Math.min(gridDec - 1, decCell));
    let best = -1, bestDistance = Infinity;
    for (let deltaRa = -1; deltaRa <= 1; deltaRa += 1) {
      for (let deltaDec = -1; deltaDec <= 1; deltaDec += 1) {
        const candidateRa = ((raCell + deltaRa) % gridRa + gridRa) % gridRa;
        const candidateDec = decCell + deltaDec;
        if (candidateDec < 0 || candidateDec >= gridDec) continue;
        const cell = candidateDec * gridRa + candidateRa;
        for (let index = offsets[cell]; index < offsets[cell + 1]; index += 1) {
          if (removed[index]) continue;
          const ra = sortedRa[index] * (360 / 4294967296) / 15;
          const dec = sortedDec[index] * (90 / 2147483648);
          const longitudeDistance = (((ra - star.ra) % 24 + 36) % 24 - 12) * 15
            * Math.cos((dec + star.de) / 2 * radians);
          const distance = Math.hypot(longitudeDistance, dec - star.de);
          if (distance < bestDistance) { bestDistance = distance; best = index; }
        }
      }
    }
    if (best >= 0 && bestDistance < 0.03) { removed[best] = 1; duplicateCount += 1; }
  }

  const compactOffsets = new Uint32Array(cellCount + 1);
  const kept = new Uint32Array(count);
  let compactCount = 0;
  for (let cell = 0; cell < cellCount; cell += 1) {
    compactOffsets[cell] = compactCount;
    for (let index = offsets[cell]; index < offsets[cell + 1]; index += 1) {
      if (!removed[index]) kept[compactCount++] = index;
    }
  }
  compactOffsets[cellCount] = compactCount;

  const headerLength = 32;
  const directoryLength = 4 * (cellCount + 1);
  const output = new ArrayBuffer(headerLength + directoryLength + 10 * compactCount);
  const outputView = new DataView(output);
  outputView.setUint8(0, 71); outputView.setUint8(1, 68);
  outputView.setUint8(2, 82); outputView.setUint8(3, 51);
  outputView.setUint32(4, 1, true);
  outputView.setUint32(8, compactCount, true);
  outputView.setFloat32(12, GAIA_MAG_MIN, true);
  outputView.setFloat32(16, GAIA_MAG_STEP, true);
  outputView.setUint16(20, gridRa, true);
  outputView.setUint16(22, gridDec, true);
  let outputOffset = headerLength;
  new Uint32Array(output, outputOffset, cellCount + 1).set(compactOffsets);
  outputOffset += directoryLength;
  const outputRa = new Uint32Array(output, outputOffset, compactCount); outputOffset += 4 * compactCount;
  const outputDec = new Int32Array(output, outputOffset, compactCount); outputOffset += 4 * compactCount;
  const outputMag = new Uint8Array(output, outputOffset, compactCount); outputOffset += compactCount;
  const outputColor = new Uint8Array(output, outputOffset, compactCount);
  for (let index = 0; index < compactCount; index += 1) {
    const source = kept[index];
    outputRa[index] = sortedRa[source]; outputDec[index] = sortedDec[source];
    outputMag[index] = sortedMag[source]; outputColor[index] = sortedColor[source];
  }
  return { buffer: output, count: compactCount, duplicateCount };
}
