import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/app/state.js";
import { validateAppState } from "../src/app/validateState.js";

test("Initialzustand erfüllt den Zustandsvertrag", () => {
  const state = createInitialState(new Date("2026-08-09T12:00:00Z"));
  assert.equal(validateAppState(state), state);
});

test("Unmögliche Koordinaten und Ansichten werden abgewiesen", () => {
  const invalidLatitude = createInitialState();
  invalidLatitude.observer.latitude = 200;
  assert.throws(() => validateAppState(invalidLatitude), /Breitengrad/);

  const invalidView = createInitialState();
  invalidView.view.mode = "sideways";
  assert.throws(() => validateAppState(invalidView), /Ansichtsmodus/);
});

test("Nicht endliche und falsch typisierte Werte werden abgewiesen", () => {
  const invalidSpeed = createInitialState();
  invalidSpeed.simulation.speed = Number.NaN;
  assert.throws(() => validateAppState(invalidSpeed), /Geschwindigkeit/);

  const invalidLayer = createInitialState();
  invalidLayer.layers.names = "yes";
  assert.throws(() => validateAppState(invalidLayer), /Ebenenstatus/);
});

test("Jahrestag folgt der gregorianischen Schaltjahrregel", () => {
  const commonYear = createInitialState();
  commonYear.simulation.year = 2026;
  commonYear.simulation.dayOfYear = 366;
  assert.throws(() => validateAppState(commonYear), /Jahrestag/);

  const leapYear = createInitialState();
  leapYear.simulation.year = 2024;
  leapYear.simulation.dayOfYear = 366;
  assert.equal(validateAppState(leapYear), leapYear);
});

test("Jahr und Jahrestag müssen ganzzahlig sein und Jahr 0 ist ausgeschlossen", () => {
  const yearZero = createInitialState();
  yearZero.simulation.year = 0;
  assert.throws(() => validateAppState(yearZero), /Jahr 0/);

  const fractionalDay = createInitialState();
  fractionalDay.simulation.dayOfYear = 42.5;
  assert.throws(() => validateAppState(fractionalDay), /ganzzahlig/);
});
