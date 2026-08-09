import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createLegacyUiActions } from "../src/ui/legacyUiActions.js";
import { createLegacyInputActions } from "../src/ui/legacyInputActions.js";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

function attributeValues(pattern) {
  return [...new Set([...html.matchAll(pattern)].map((match) => match[1]))].sort();
}

test("HTML und Klick-Aktionsregister stimmen vollständig überein", () => {
  const used = attributeValues(/\bdata-action="([^"]+)"/g);
  const registered = Object.keys(createLegacyUiActions({})).sort();
  assert.deepEqual(registered, used);
});

test("HTML und Input-Aktionsregister stimmen vollständig überein", () => {
  const used = attributeValues(/\bdata-(?:input|change|focus)-action="([^"]+)"/g);
  const registered = Object.keys(createLegacyInputActions({})).sort();
  assert.deepEqual(registered, used);
});

test("HTML enthält keine Inline-Ereignishandler", () => {
  assert.doesNotMatch(html, /\son[a-z]+\s*=/i);
});
