import test from "node:test";
import assert from "node:assert/strict";
import { mergeActionGroups } from "../src/ui/actionRegistry.js";

test("Aktionsgruppen werden unveränderlich zusammengeführt", () => {
  const first = () => "first";
  const second = () => "second";
  const registry = mergeActionGroups({ first }, { second });
  assert.deepEqual(Object.keys(registry), ["first", "second"]);
  assert.equal(registry.first(), "first");
  assert.equal(Object.isFrozen(registry), true);
});

test("Doppelte oder ungültige Aktionen werden abgewiesen", () => {
  assert.throws(() => mergeActionGroups({ same: () => {} }, { same: () => {} }), /Doppelte UI-Aktion/);
  assert.throws(() => mergeActionGroups({ invalid: true }), /keine Funktion/);
  assert.throws(() => mergeActionGroups(null), /Ungültige Aktionsgruppe/);
});
