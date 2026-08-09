import { DEG_TO_RAD, normalizeDegrees } from "./angles.js";
import { meanObliquity } from "./coordinates.js";

/** Greenwich Apparent Sidereal Time in Grad. */
export function greenwichApparentSiderealTime(julianDate) {
  const centuries = (julianDate - 2451545) / 36525;
  const meanSidereal =
    280.46061837
    + 360.98564736629 * (julianDate - 2451545)
    + 0.000387933 * centuries ** 2
    - centuries ** 3 / 38710000;
  const ascendingNode = (125.04452 - 1934.136261 * centuries) * DEG_TO_RAD;
  const solarLongitude = (280.4665 + 36000.7698 * centuries) * DEG_TO_RAD;
  const lunarLongitude = (218.3165 + 481267.8813 * centuries) * DEG_TO_RAD;
  const nutationLongitude =
    -0.00478 * Math.sin(ascendingNode)
    - 0.0003667 * Math.sin(2 * solarLongitude)
    - 0.0001327 * Math.sin(2 * lunarLongitude);

  return normalizeDegrees(
    meanSidereal
      + nutationLongitude * Math.cos(meanObliquity(julianDate) * DEG_TO_RAD)
  );
}

export function localSiderealTime(julianDate, longitudeDegrees) {
  return normalizeDegrees(
    greenwichApparentSiderealTime(julianDate) + longitudeDegrees
  );
}
