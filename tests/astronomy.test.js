import test from "node:test";
import assert from "node:assert/strict";
import {
  daysInYear,
  eclipticToEquatorial,
  equatorialToHorizontal,
  greenwichApparentSiderealTime,
  julianDateFromDayOfYear,
  julianDateUtc,
  julianDayNumber,
  normalizeDegrees,
  meanObliquity,
  sunEclipticLongitude
} from "../src/astronomy/index.js";

test("J2000.0 besitzt das bekannte julianische Datum", () => {
  assert.equal(julianDateUtc(2000, 1, 1, 720), 2451545.0);
});

test("Mittlere Ekliptikschiefe stimmt am J2000-Epochentag", () => {
  assert.ok(Math.abs(meanObliquity(2451545) - 23.43927944) < 1e-7);
});

test("Ekliptik- und Äquatorkoordinaten stimmen an den Äquinoktien überein", () => {
  const point = eclipticToEquatorial(0, 0, meanObliquity(2451545));
  assert.ok(Math.abs(point.rightAscension) < 1e-12);
  assert.ok(Math.abs(point.declination) < 1e-12);
});

test("Ein Objekt im Meridian besitzt die erwartete Kulminationshöhe", () => {
  const horizontal = equatorialToHorizontal({
    rightAscensionHours: 10,
    declinationDegrees: 20,
    localSiderealDegrees: 150,
    latitudeDegrees: 50
  });
  assert.ok(Math.abs(horizontal.altitude - 60) < 1e-10);
  assert.ok(Math.abs(horizontal.azimuth - 180) < 1e-10);
});

test("Sternzeit am J2000-Referenzzeitpunkt ist plausibel", () => {
  const gast = greenwichApparentSiderealTime(2451545);
  assert.ok(Math.abs(gast - 280.457) < 0.01, `GAST: ${gast}°`);
});

test("Gregorianische Kalenderdaten werden korrekt umgerechnet", () => {
  assert.equal(julianDayNumber(2000, 1, 1), 2451545);
  assert.equal(julianDayNumber(1987, 1, 27), 2446823);
  assert.equal(julianDateFromDayOfYear(2000, 1, 720, 0), 2451545.0);
});

test("Schaltjahrregeln berücksichtigen Jahrhundertjahre", () => {
  assert.equal(daysInYear(2000), 366);
  assert.equal(daysInYear(1900), 365);
  assert.equal(daysInYear(2026), 365);
});

test("Winkel werden in den Bereich 0 bis kleiner 360 normalisiert", () => {
  assert.equal(normalizeDegrees(-10), 350);
  assert.equal(normalizeDegrees(730), 10);
});

test("Sonnenlänge liegt zu den Äquinoktien nahe 0 beziehungsweise 180 Grad", () => {
  const spring = sunEclipticLongitude(julianDateUtc(2026, 3, 20, 900));
  const autumn = sunEclipticLongitude(julianDateUtc(2026, 9, 23, 0));
  const signedSpring = Math.min(spring, 360 - spring);

  assert.ok(signedSpring < 1, `Frühlingspunkt: ${spring}°`);
  assert.ok(Math.abs(autumn - 180) < 1, `Herbstpunkt: ${autumn}°`);
});
