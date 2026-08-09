import test from "node:test";
import assert from "node:assert/strict";
import {
  actionTypes,
  observerChanged,
  sceneSelected,
  stateHydrated
} from "../src/app/actions.js";

test("Action-Creators erzeugen unveränderliche Aktionen mit kopierten Nutzdaten", () => {
  const payload = { latitude: 52.52 };
  const action = observerChanged(payload);
  payload.latitude = 0;
  assert.deepEqual(action, { type: actionTypes.observerChanged, payload: { latitude: 52.52 } });
  assert.equal(Object.isFrozen(action), true);
  assert.equal(Object.isFrozen(action.payload), true);
});

test("Szenen- und Hydrierungsaktionen validieren ihre Eingaben", () => {
  assert.deepEqual(sceneSelected("full-moon"), {
    type: actionTypes.sceneSelected,
    payload: "full-moon"
  });
  assert.throws(() => sceneSelected(" "), /Szenen-ID/);
  assert.throws(() => stateHydrated(null), /Objekt-Nutzdaten/);
});
