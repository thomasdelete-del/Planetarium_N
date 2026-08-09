import test from "node:test";
import assert from "node:assert/strict";
import { bindInputs } from "../src/ui/bindInputs.js";
import { createLegacyInputActions } from "../src/ui/legacyInputActions.js";

test("Input-Aktionen delegieren Werte und Ereignisse typgerecht", () => {
  const calls = [];
  const actions = createLegacyInputActions({
    setSp: (value) => calls.push(["speed", value]),
    setFontScale: (value) => calls.push(["font", value]),
    apolloFilePicked: (event) => calls.push(["file", event])
  });
  const event = { type: "change" };
  actions["change-speed"]({ element: { value: "585" } });
  actions["change-font-scale"]({ element: { value: "120" } });
  actions["select-apollo-file"]({ event });
  assert.deepEqual(calls, [["speed", "585"], ["font", "120"], ["file", event]]);
});

test("Slider-Aktivphase wird zentral gesetzt und wieder aufgehoben", () => {
  const listeners = new Map();
  const states = [];
  const slider = { closest: (selector) => selector === "[data-slider]" ? slider : null };
  const root = {
    contains: () => true,
    addEventListener: (type, listener) => listeners.set(type, listener),
    removeEventListener: (type) => listeners.delete(type)
  };
  const unbind = bindInputs({ root, actions: {}, setSliderActive: (value) => states.push(value) });
  listeners.get("pointerdown")({ target: slider });
  listeners.get("pointerup")({ target: slider });
  assert.deepEqual(states, [true, false]);
  unbind();
  assert.equal(listeners.size, 0);
});
