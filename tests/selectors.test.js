import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/app/state.js";
import {
  selectCurrentJulianDate,
  selectLayers,
  selectObserver,
  selectScene,
  selectSimulation,
  selectView
} from "../src/app/selectors.js";

test("Teilzustandsselektoren liefern die unveränderten Store-Bereiche", () => {
  const state = createInitialState(new Date("2026-08-09T12:00:00Z"));
  assert.equal(selectObserver(state), state.observer);
  assert.equal(selectSimulation(state), state.simulation);
  assert.equal(selectView(state), state.view);
  assert.equal(selectLayers(state), state.layers);
  assert.equal(selectScene(state), state.scene);
});

test("Julianisches Datum wird aus Simulation und Beobachterzone abgeleitet", () => {
  const state = createInitialState();
  state.simulation.year = 2000;
  state.simulation.dayOfYear = 1;
  state.simulation.minuteOfDay = 780;
  state.observer.utcOffsetHours = 1;
  assert.equal(selectCurrentJulianDate(state), 2451545.0);
});

test("Selektoren weisen einen fehlenden Zustand verständlich zurück", () => {
  assert.throws(() => selectObserver(null), /App-Zustand fehlt/);
  assert.throws(() => selectCurrentJulianDate(), /App-Zustand fehlt/);
});
