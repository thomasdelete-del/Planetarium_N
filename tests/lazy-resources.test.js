import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const corePath = new URL("../src/legacy/01-core.js", import.meta.url);

test("Apollo-Audio wird erst beim Start der Raketenanimation geladen", async () => {
  const source = await readFile(corePath, "utf8");

  assert.doesNotMatch(
    source,
    /if\("Audio"in window\)\{try\{initApolloAudio\(\)\}/,
    "Apollo-Audio darf beim Seitenstart nicht vorab geladen werden"
  );
  assert.ok(
    source.includes(
      "function startRocketLaunch(){if(rocketActive){abortRocketLaunch();return}if(apolloMode&&!apolloAudio)"
    ),
    "Der erste Raketenstart muss das Audio bei Bedarf initialisieren"
  );
});
