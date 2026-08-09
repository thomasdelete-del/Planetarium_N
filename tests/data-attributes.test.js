import test from "node:test";
import assert from "node:assert/strict";
import { assertAllowed, readEnum, readFiniteNumber } from "../src/ui/dataAttributes.js";

test("Datenattribute werden kontrolliert in Zahlen umgewandelt", () => {
  assert.equal(readFiniteNumber({ dataset: { latitude: "66.56" } }, "latitude"), 66.56);
  assert.throws(() => readFiniteNumber({ dataset: { latitude: "Nord" } }, "latitude"), /Zahlenwert/);
  assert.throws(() => readFiniteNumber(null, "latitude"), /Element/);
});

test("Auswahlwerte werden gegen eine Positivliste geprüft", () => {
  const element = { dataset: { eclipseType: "solar" } };
  assert.equal(readEnum(element, "eclipseType", ["solar", "lunar"]), "solar");
  assert.throws(() => readEnum(element, "eclipseType", ["lunar"]), /Ungültiger Wert/);
  assert.equal(assertAllowed(-1, [-1, 1], "Richtung"), -1);
  assert.throws(() => assertAllowed(2, [-1, 1], "Richtung"), /Richtung/);
});
