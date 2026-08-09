import test from "node:test";
import assert from "node:assert/strict";
import { activateDeferredStylesheets } from "../src/platform/deferredResources.js";

function fixture() {
  const frames = [];
  const stylesheet = {
    media: "print",
    dataset: {},
    removed: [],
    removeAttribute(name) {
      this.removed.push(name);
    }
  };
  const documentObject = {
    querySelectorAll(selector) {
      assert.equal(selector, "link[data-deferred-stylesheet]");
      return [stylesheet];
    }
  };
  return {
    frames,
    stylesheet,
    documentObject,
    requestFrame: (callback) => frames.push(callback)
  };
}

test("Verzögerte Stylesheets werden erst nach zwei Renderframes aktiviert", () => {
  const setup = fixture();
  activateDeferredStylesheets(setup);

  assert.equal(setup.stylesheet.media, "print");
  setup.frames.shift()();
  assert.equal(setup.stylesheet.media, "print");
  setup.frames.shift()();
  assert.equal(setup.stylesheet.media, "all");
  assert.deepEqual(setup.stylesheet.removed, ["data-deferred-stylesheet"]);
});

test("Abbruch verhindert eine noch ausstehende Aktivierung", () => {
  const setup = fixture();
  const cancel = activateDeferredStylesheets(setup);
  cancel();
  setup.frames.shift()();
  setup.frames.shift()();

  assert.equal(setup.stylesheet.media, "print");
});
