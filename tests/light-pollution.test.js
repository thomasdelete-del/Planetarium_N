import test from "node:test";
import assert from "node:assert/strict";
import { distanceKm, estimateSkyQuality, installLightPollutionEstimator, lightPollutionMapUrl, sqmToNelm } from "../src/features/location/lightPollution.js";

const cities = [
  { n: "Metropole", la: 52.52, lo: 13.4, cap: 1 },
  { n: "Kleinstadt", la: 48.14, lo: 11.58 }
];

test("Großkreisentfernung ist symmetrisch und am selben Ort null", () => {
  assert.equal(distanceKm(52.52, 13.4, 52.52, 13.4), 0);
  const forward = distanceKm(52.52, 13.4, 48.14, 11.58);
  const backward = distanceKm(48.14, 11.58, 52.52, 13.4);
  assert.ok(Math.abs(forward - backward) < 1e-9);
  assert.ok(forward > 500 && forward < 510);
});

test("Standorte werden reproduzierbar Stadt, Land und dunkel zugeordnet", () => {
  assert.equal(estimateSkyQuality(52.52, 13.4, cities).label, "Stadt");
  assert.equal(estimateSkyQuality(53.2, 13.4, cities).label, "Land");
  assert.equal(estimateSkyQuality(-30, -140, cities).label, "dunkel");
});

test("Installation stellt eine kleine Legacy-Schnittstelle bereit", () => {
  const status = {};
  const globalObject = { setSkyQuality: (magnitude, source) => { globalObject.last = { magnitude, source }; } };
  const documentObject = { getElementById: (id) => id === "skyq-auto-status" ? status : null };
  const apply = installLightPollutionEstimator({ globalObject, documentObject, cities });
  const result = apply(52.52, 13.4);
  assert.equal(result.label, "Stadt");
  assert.deepEqual(globalObject.last, { magnitude: 4.5, source: "auto" });
  assert.match(status.textContent, /Automatisch: Stadt/);
  assert.equal(typeof globalObject.estimateSkyQuality, "function");
});

test("Ungültige Koordinaten werden abgewiesen", () => {
  assert.throws(() => estimateSkyQuality(Number.NaN, 10, cities), /gültige Koordinaten/);
});

test("SQM wird in eine plausible visuelle Grenzgröße umgerechnet", () => {
  assert.ok(Math.abs(sqmToNelm(18.01) - 3.98) < 0.05);
  assert.ok(Math.abs(sqmToNelm(21.7) - 6.48) < 0.05);
  assert.throws(() => sqmToNelm(30), /zwischen 10 und 24/);
});

test("Kartenlink enthält den aktuellen Standort", () => {
  const url = new URL(lightPollutionMapUrl(52.52, 13.405));
  assert.equal(url.hostname, "lightpollutionmap.app");
  assert.equal(url.searchParams.get("lat"), "52.520000");
  assert.equal(url.searchParams.get("lng"), "13.405000");
});
