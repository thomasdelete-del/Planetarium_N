import test from "node:test";
import assert from "node:assert/strict";
import {
  adjacentHistoricalYear,
  dayOfYearFromDate,
  shiftDay,
  shiftYear
} from "../src/features/time/calendar.js";

test("Jahrestag wird ohne lokale Sommerzeit-Artefakte bestimmt", () => {
  assert.equal(dayOfYearFromDate(new Date("2024-02-29T12:00:00Z")), 60);
  assert.equal(dayOfYearFromDate(new Date("2026-12-31T12:00:00Z")), 365);
  assert.throws(() => dayOfYearFromDate(new Date("invalid")), /Gültiges Datum/);
});

test("Tagesverschiebung überschreitet Jahres- und Schaltjahrgrenzen", () => {
  assert.deepEqual(shiftDay({ year: 2026, dayOfYear: 365 }, 1), { year: 2027, dayOfYear: 1 });
  assert.deepEqual(shiftDay({ year: 2024, dayOfYear: 60 }, 307), { year: 2025, dayOfYear: 1 });
  assert.deepEqual(shiftDay({ year: 2026, dayOfYear: 1 }, -1), { year: 2025, dayOfYear: 365 });
});

test("Historische Jahreswechsel überspringen Jahr 0", () => {
  assert.equal(adjacentHistoricalYear(-1, 1), 1);
  assert.equal(adjacentHistoricalYear(1, -1), -1);
  assert.deepEqual(shiftDay({ year: -1, dayOfYear: 365 }, 1), { year: 1, dayOfYear: 1 });
  assert.deepEqual(shiftYear({ year: -1, dayOfYear: 10 }, 1), { year: 1, dayOfYear: 10 });
});

test("Jahresverschiebung klemmt den Schalttag im Zieljahr", () => {
  assert.deepEqual(shiftYear({ year: 2024, dayOfYear: 366 }, 1), {
    year: 2025,
    dayOfYear: 365
  });
});
