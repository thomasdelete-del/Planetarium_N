import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

test("Scheduler ersetzt benannte Jobs und räumt sie kontrolliert auf", () => {
  let nextId = 0;
  const active = new Map();
  const window = {};
  const context = vm.createContext({
    window,
    setInterval(callback, intervalMs) { const id = ++nextId; active.set(id, { callback, intervalMs }); return id; },
    clearInterval(id) { active.delete(id); },
    Map, Array, Object, Number, TypeError, RangeError
  });
  vm.runInContext(fs.readFileSync("src/legacy/00-scheduler.js", "utf8"), context);
  const scheduler = window.__planetariumScheduler;
  scheduler.every("scene", () => {}, 200);
  scheduler.every("scene", () => {}, 300);
  assert.equal(active.size, 1);
  assert.deepEqual(scheduler.list().map(job => [job.name, job.intervalMs]), [["scene", 300]]);
  assert.equal(scheduler.cancel("scene"), true);
  assert.equal(active.size, 0);
});
