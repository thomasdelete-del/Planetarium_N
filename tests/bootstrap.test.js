import test from "node:test";
import assert from "node:assert/strict";
import { bootstrapApplication } from "../src/app/bootstrap.js";

function createEnvironment() {
  const listeners = [];
  const documentObject = {
    documentElement: { dataset: {} },
    body: { classList: { contains: () => false } },
    addEventListener(type, listener, options) { listeners.push({ type, listener, options }); },
    removeEventListener(type, listener) {
      const index = listeners.findIndex((entry) => entry.type === type && entry.listener === listener);
      if (index >= 0) listeners.splice(index, 1);
    },
    contains: () => true
  };
  const events = [];
  const globalObject = {
    jumpScene: (sceneId) => sceneId,
    setSliderActive: () => {},
    dispatchEvent: (event) => events.push(event.type),
    CustomEvent: class CustomEvent { constructor(type) { this.type = type; } }
  };
  return { documentObject, globalObject, listeners, events };
}

test("Bootstrap ist idempotent und meldet die Bereitschaft genau einmal", () => {
  const environment = createEnvironment();
  const first = bootstrapApplication(environment);
  const listenerCount = environment.listeners.length;
  const second = bootstrapApplication(environment);

  assert.equal(second, first);
  assert.equal(environment.listeners.length, listenerCount);
  assert.deepEqual(environment.events, ["planetarium:ready"]);
  assert.equal(environment.documentObject.documentElement.dataset.appReady, "true");
  assert.equal(typeof first.selectors.selectCurrentJulianDate, "function");
  assert.equal(typeof first.calendar.shiftDay, "function");
  assert.equal(typeof first.speedControl.speedFromSlider, "function");
  assert.equal(first.speedControl.simulationGears.day, 86_400);
  assert.equal(typeof first.subscribeSelector, "function");
});

test("destroy entfernt alle modernen Listener und erlaubt einen Neustart", () => {
  const environment = createEnvironment();
  const first = bootstrapApplication(environment);
  assert.ok(environment.listeners.length > 0);
  first.destroy();

  assert.equal(environment.listeners.length, 0);
  assert.equal(environment.globalObject.planetarium, undefined);
  assert.equal(environment.documentObject.documentElement.dataset.appReady, undefined);
  assert.throws(() => first.dispatch({ type: "unknown" }), /beendet/);

  const second = bootstrapApplication(environment);
  assert.notEqual(second, first);
  assert.equal(environment.events.length, 2);
  second.destroy();
});
