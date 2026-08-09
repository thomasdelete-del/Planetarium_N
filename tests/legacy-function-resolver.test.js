import test from "node:test";
import assert from "node:assert/strict";
import { createLegacyFunctionResolver } from "../src/ui/legacyFunctionResolver.js";

test("Legacy-Resolver liefert vorhandene Funktionen unverändert", () => {
  const expected = () => 42;
  const resolve = createLegacyFunctionResolver({ expected });
  assert.equal(resolve("expected"), expected);
  assert.equal(resolve("expected")(), 42);
});

test("Legacy-Resolver meldet fehlende Schnittstellen eindeutig", () => {
  assert.throws(() => createLegacyFunctionResolver(), /Globalobjekt fehlt/);
  const resolve = createLegacyFunctionResolver({ missing: true });
  assert.throws(() => resolve("missing"), /Legacy-Funktion fehlt: missing/);
});
