import { daysInYear } from "../../astronomy/julianDate.js";

export function assertHistoricalYear(year) {
  if (!Number.isInteger(year)) throw new TypeError("Jahr muss ganzzahlig sein");
  if (year === 0) throw new RangeError("Ein historisches Jahr 0 ist nicht zulässig");
  return year;
}

export function dayOfYearFromDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new TypeError("Gültiges Datum erforderlich");
  }
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const current = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((current - start) / 86_400_000);
}

export function adjacentHistoricalYear(year, direction) {
  assertHistoricalYear(year);
  if (![1, -1].includes(direction)) throw new TypeError("Jahresrichtung muss +1 oder -1 sein");
  const candidate = year + direction;
  return candidate === 0 ? direction : candidate;
}

export function shiftDay({ year, dayOfYear }, deltaDays) {
  assertHistoricalYear(year);
  if (!Number.isInteger(dayOfYear) || dayOfYear < 1 || dayOfYear > daysInYear(year)) {
    throw new RangeError("Ungültiger Jahrestag");
  }
  if (!Number.isInteger(deltaDays)) throw new TypeError("Tagesverschiebung muss ganzzahlig sein");

  let shiftedYear = year;
  let shiftedDay = dayOfYear + deltaDays;
  while (shiftedDay > daysInYear(shiftedYear)) {
    shiftedDay -= daysInYear(shiftedYear);
    shiftedYear = adjacentHistoricalYear(shiftedYear, 1);
  }
  while (shiftedDay < 1) {
    shiftedYear = adjacentHistoricalYear(shiftedYear, -1);
    shiftedDay += daysInYear(shiftedYear);
  }
  return Object.freeze({ year: shiftedYear, dayOfYear: shiftedDay });
}

export function shiftYear({ year, dayOfYear }, deltaYears) {
  assertHistoricalYear(year);
  if (!Number.isInteger(dayOfYear) || dayOfYear < 1 || dayOfYear > daysInYear(year)) {
    throw new RangeError("Ungültiger Jahrestag");
  }
  if (!Number.isInteger(deltaYears)) throw new TypeError("Jahresverschiebung muss ganzzahlig sein");
  let shiftedYear = year;
  const direction = Math.sign(deltaYears);
  for (let count = 0; count < Math.abs(deltaYears); count += 1) {
    shiftedYear = adjacentHistoricalYear(shiftedYear, direction);
  }
  return Object.freeze({
    year: shiftedYear,
    dayOfYear: Math.min(dayOfYear, daysInYear(shiftedYear))
  });
}
