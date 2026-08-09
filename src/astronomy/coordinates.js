import { DEG_TO_RAD, RAD_TO_DEG, clamp, normalizeDegrees } from "./angles.js";

/** Mittlere Schiefe der Ekliptik nach IAU 2006, Ergebnis in Grad. */
export function meanObliquity(julianDate) {
  const centuries = (julianDate - 2451545) / 36525;
  const arcseconds =
    84381.406
    - 46.836769 * centuries
    - 0.0001831 * centuries ** 2
    + 0.0020034 * centuries ** 3
    - 0.000000576 * centuries ** 4
    - 0.0000000434 * centuries ** 5;
  return arcseconds / 3600;
}

/** Ekliptikale Länge/Breite in Rektaszension (Stunden) und Deklination. */
export function eclipticToEquatorial(
  longitudeDegrees,
  latitudeDegrees,
  obliquityDegrees
) {
  const longitude = longitudeDegrees * DEG_TO_RAD;
  const latitude = latitudeDegrees * DEG_TO_RAD;
  const obliquity = obliquityDegrees * DEG_TO_RAD;
  const x = Math.cos(latitude) * Math.cos(longitude);
  const y =
    Math.cos(obliquity) * Math.cos(latitude) * Math.sin(longitude)
    - Math.sin(obliquity) * Math.sin(latitude);
  const z =
    Math.sin(obliquity) * Math.cos(latitude) * Math.sin(longitude)
    + Math.cos(obliquity) * Math.sin(latitude);

  return {
    rightAscension: normalizeDegrees(Math.atan2(y, x) * RAD_TO_DEG) / 15,
    declination: Math.asin(clamp(z, -1, 1)) * RAD_TO_DEG
  };
}

/** Äquatoriale Koordinaten in geometrische Horizontkoordinaten. */
export function equatorialToHorizontal({
  rightAscensionHours,
  declinationDegrees,
  localSiderealDegrees,
  latitudeDegrees
}) {
  const hourAngle = normalizeDegrees(
    localSiderealDegrees - rightAscensionHours * 15
  ) * DEG_TO_RAD;
  const declination = declinationDegrees * DEG_TO_RAD;
  const latitude = latitudeDegrees * DEG_TO_RAD;
  const altitude = Math.asin(
    Math.sin(latitude) * Math.sin(declination)
    + Math.cos(latitude) * Math.cos(declination) * Math.cos(hourAngle)
  );
  const azimuthSouthPositive = Math.atan2(
    Math.sin(hourAngle),
    Math.cos(hourAngle) * Math.sin(latitude)
      - Math.tan(declination) * Math.cos(latitude)
  );

  return {
    altitude: altitude * RAD_TO_DEG,
    // Astronomische Standardzählung: Norden 0°, Osten 90°.
    azimuth: normalizeDegrees(azimuthSouthPositive * RAD_TO_DEG + 180)
  };
}
