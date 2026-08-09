import { DEG_TO_RAD, normalizeDegrees } from "./angles.js";

/**
 * Scheinbare geozentrische ekliptikale Sonnenlänge in Grad.
 * Die Formel entspricht zunächst exakt der produktiven Legacy-Berechnung.
 */
export function sunEclipticLongitude(julianDate) {
  const centuries = (julianDate - 2451545) / 36525;
  const meanLongitude = normalizeDegrees(280.46646 + 36000.76983 * centuries);
  const meanAnomaly = normalizeDegrees(
    357.52911 + 35999.05029 * centuries - 0.0001537 * centuries ** 2
  ) * DEG_TO_RAD;
  const equationOfCenter =
    (1.914602 - 0.004817 * centuries - 0.000014 * centuries ** 2)
      * Math.sin(meanAnomaly)
    + (0.019993 - 0.000101 * centuries) * Math.sin(2 * meanAnomaly)
    + 0.000289 * Math.sin(3 * meanAnomaly);
  const ascendingNode = (125.04 - 1934.136 * centuries) * DEG_TO_RAD;

  return normalizeDegrees(
    meanLongitude
      + equationOfCenter
      - 0.00569
      - 0.00478 * Math.sin(ascendingNode)
  );
}
