import test from "node:test";
import assert from "node:assert/strict";
import { bindSceneButtons } from "../src/ui/bindSceneButtons.js";

function createRoot(button) {
  let listener;
  let listenerOptions;
  return {
    addEventListener: (_type, callback, options) => { listener = callback; listenerOptions = options; },
    removeEventListener: (_type, callback) => {
      if (callback === listener) listener = undefined;
    },
    contains: (element) => element === button,
    click: () => listener({ target: button }),
    hasListener: () => Boolean(listener),
    listenerOptions: () => listenerOptions
  };
}

test("Deklarativer Szenenbutton ruft den Controller auf", () => {
  const selected = [];
  const button = {
    dataset: { sceneId: "full-moon" },
    closest: () => button
  };
  const root = createRoot(button);
  const unbind = bindSceneButtons({
    root,
    selectScene: (id) => selected.push(id),
    globalObject: {}
  });

  root.click();
  assert.deepEqual(selected, ["full-moon"]);
  assert.deepEqual(root.listenerOptions(), { capture: true });
  unbind();
  assert.equal(root.hasListener(), false);
});

test("Sonnenjahr-Button setzt die Breitenüberschreibung zurück", () => {
  const globalObject = { __solarYearLatOverride: 66.56 };
  const button = {
    dataset: { sceneId: "sim-seasons", resetSolarLat: "true" },
    closest: () => button
  };
  const root = createRoot(button);
  bindSceneButtons({ root, selectScene: () => {}, globalObject });

  root.click();
  assert.equal(globalObject.__solarYearLatOverride, null);
});
