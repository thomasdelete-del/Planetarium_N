import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  sceneCatalog,
  sceneCategories,
  getScene,
  getScenesByCategory
} from "../src/features/scenes/sceneCatalog.js";
import { createSceneController } from "../src/features/scenes/sceneController.js";

test("Szenenkatalog enthält jede direkt im HTML verwendete Szenen-ID", () => {
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const usedIds = [...html.matchAll(/<button\b[^>]*\bdata-scene-id="([^"]+)"/g)]
    .map((match) => match[1]);
  const catalogIds = sceneCatalog.map((scene) => scene.id);

  assert.deepEqual([...new Set(usedIds)].sort(), [...catalogIds].sort());
  assert.equal(new Set(catalogIds).size, catalogIds.length, "Doppelte Szenen-ID");
  assert.doesNotMatch(html, /onclick="[^"]*(?:jumpScene|selectScene)\(/);
});

test("Szenen lassen sich nach ID und Kategorie abfragen", () => {
  assert.equal(getScene("full-moon")?.category, "moon");
  assert.equal(getScene("does-not-exist"), null);
  assert.equal(getScenesByCategory("planet").length, 7);
});

test("Kategorieindizes sind stabil und unveränderlich", () => {
  const planets = getScenesByCategory("planet");
  assert.equal(getScenesByCategory("planet"), planets);
  assert.equal(Object.isFrozen(planets), true);
  assert.equal(Object.isFrozen(getScenesByCategory("unknown")), true);
  assert.ok(sceneCategories.includes("moon"));
  assert.equal(Object.isFrozen(sceneCategories), true);
  assert.throws(() => planets.push(getScene("full-moon")), TypeError);
});

test("Szenencontroller validiert, aktualisiert Zustand und delegiert", () => {
  const actions = [];
  const calls = [];
  const controller = createSceneController({
    dispatch: (action) => actions.push(action),
    legacyGlobal: { jumpScene: (id) => calls.push(id) }
  });

  controller.select("full-moon");
  assert.deepEqual(actions, [{ type: "scene/selected", payload: "full-moon" }]);
  assert.deepEqual(calls, ["full-moon"]);
  assert.throws(() => controller.select("unknown"), /Unbekannte/);
});
