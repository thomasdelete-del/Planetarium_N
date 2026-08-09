import test from "node:test";
import assert from "node:assert/strict";
import {
  MAX_SLIDER_SPEED,
  SECONDS_PER_YEAR,
  formatSimulationSpeed,
  simulationGears,
  sliderFromSpeed,
  speedFromSlider
} from "../src/features/time/speed.js";

test("Geschwindigkeitsskala bildet die Endpunkte korrekt ab", () => {
  assert.equal(speedFromSlider(0), 1);
  assert.ok(Math.abs(speedFromSlider(1000) - MAX_SLIDER_SPEED) < 1e-9);
});

test("Slider- und Geschwindigkeitsumrechnung sind invers", () => {
  for (const slider of [0, 100, 585, 750, 1000]) {
    assert.ok(Math.abs(sliderFromSpeed(speedFromSlider(slider)) - slider) <= 1);
  }
});

test("Geschwindigkeitsbeschriftung bleibt kompatibel zum Bestand", () => {
  assert.equal(formatSimulationSpeed(0.25), "0.3×");
  assert.equal(formatSimulationSpeed(1), "1×");
  assert.equal(formatSimulationSpeed(59), "59×");
  assert.equal(formatSimulationSpeed(60), "1.0min/s");
  assert.equal(formatSimulationSpeed(599), "10.0min/s");
  assert.equal(formatSimulationSpeed(600), "10min/s");
  assert.equal(formatSimulationSpeed(3600), "1h/s");
});

test("Simulationsgänge haben stabile, benannte Werte", () => {
  assert.deepEqual(simulationGears, {
    minute: 60,
    hour: 3600,
    day: 86_400,
    year: SECONDS_PER_YEAR
  });
  assert.ok(Object.isFrozen(simulationGears));
});

test("Ungültige Geschwindigkeitswerte werden abgewiesen", () => {
  assert.throws(() => speedFromSlider(-1), RangeError);
  assert.throws(() => speedFromSlider("unbekannt"), TypeError);
  assert.throws(() => sliderFromSpeed(0), RangeError);
  assert.throws(() => formatSimulationSpeed(-1), RangeError);
});
