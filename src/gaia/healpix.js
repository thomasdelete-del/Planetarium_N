const HALF_PI = Math.PI / 2;
const TWO_PI = Math.PI * 2;

export function assertHealpixNside(nside) {
  if (!Number.isInteger(nside) || nside < 1 || (nside & (nside - 1)) !== 0) {
    throw new RangeError("HEALPix nside muss eine positive Zweierpotenz sein");
  }
  return nside;
}

export function healpixPixelCount(nside) {
  return 12 * assertHealpixNside(nside) ** 2;
}

/* HEALPix RING nach Gorski et al. Die Eingabe ist ein normalisierter
   J2000-Vektor; damit entfallen RA-Naht und Pol-Sonderkacheln des alten
   Rechteckrasters. */
export function vectorToHealpixRing(x, y, z, nside) {
  assertHealpixNside(nside);
  const length = Math.hypot(x, y, z);
  if (!(length > 0)) throw new RangeError("HEALPix benötigt einen Richtungsvektor");
  z = Math.max(-1, Math.min(1, z / length));
  let phi = Math.atan2(y, x);
  if (phi < 0) phi += TWO_PI;
  const za = Math.abs(z), tt = phi / HALF_PI;
  const nl4 = 4 * nside, ncap = 2 * nside * (nside - 1);
  const npix = 12 * nside * nside;
  if (za <= 2 / 3) {
    const jp = Math.floor(nside * (0.5 + tt - 0.75 * z));
    const jm = Math.floor(nside * (0.5 + tt + 0.75 * z));
    const ir = nside + 1 + jp - jm;
    const kshift = 1 - (ir & 1);
    let ip = Math.floor((jp + jm - nside + kshift + 1) / 2) + 1;
    ip = ((ip - 1) % nl4 + nl4) % nl4 + 1;
    return ncap + (ir - 1) * nl4 + ip - 1;
  }
  const tp = tt - Math.floor(tt);
  const tmp = nside * Math.sqrt(3 * (1 - za));
  const jp = Math.floor(tp * tmp), jm = Math.floor((1 - tp) * tmp);
  const ir = jp + jm + 1;
  let ip = Math.floor(tt * ir) + 1;
  const ring = 4 * ir;
  ip = ((ip - 1) % ring + ring) % ring + 1;
  return z > 0 ? 2 * ir * (ir - 1) + ip - 1 : npix - 2 * ir * (ir + 1) + ip - 1;
}

export function healpixLodForZoom(zoom, maximumNside = 64) {
  const z = Math.max(1, Number(zoom) || 1);
  const target = Math.min(assertHealpixNside(maximumNside), 4 * 2 ** Math.max(0, Math.floor(Math.log2(z))));
  return { nside: target, order: Math.log2(target) };
}

export function createFluxAggregate() {
  return { count: 0, flux: 0, red: 0, green: 0, blue: 0, x: 0, y: 0, z: 0 };
}

export function addStarToFluxAggregate(aggregate, star) {
  const flux = 10 ** (-0.4 * Number(star.magnitude));
  aggregate.count++;
  aggregate.flux += flux;
  aggregate.red += flux * star.red;
  aggregate.green += flux * star.green;
  aggregate.blue += flux * star.blue;
  aggregate.x += flux * star.x;
  aggregate.y += flux * star.y;
  aggregate.z += flux * star.z;
  return aggregate;
}

export function finishFluxAggregate(aggregate) {
  const flux = Math.max(Number.MIN_VALUE, aggregate.flux);
  const length = Math.hypot(aggregate.x, aggregate.y, aggregate.z) || 1;
  return Object.freeze({
    count: aggregate.count,
    magnitude: -2.5 * Math.log10(flux),
    red: aggregate.red / flux,
    green: aggregate.green / flux,
    blue: aggregate.blue / flux,
    x: aggregate.x / length,
    y: aggregate.y / length,
    z: aggregate.z / length
  });
}
