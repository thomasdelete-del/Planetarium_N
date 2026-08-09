/** Julianische Tagesnummer für ein Datum des proleptischen gregorianischen Kalenders. */
export function julianDayNumber(year, month, day) {
  const offset = Math.floor((14 - month) / 12);
  const adjustedYear = year + 4800 - offset;
  const adjustedMonth = month + 12 * offset - 3;

  return day
    + Math.floor((153 * adjustedMonth + 2) / 5)
    + 365 * adjustedYear
    + Math.floor(adjustedYear / 4)
    - Math.floor(adjustedYear / 100)
    + Math.floor(adjustedYear / 400)
    - 32045;
}

/**
 * Julianisches Datum aus UTC-Komponenten. `minuteOfDay` darf Nachkommastellen
 * für Sekunden enthalten.
 */
export function julianDateUtc(year, month, day, minuteOfDay = 0) {
  return julianDayNumber(year, month, day) - 0.5 + minuteOfDay / 1440;
}

/** Julianisches Datum aus lokaler Jahres-/Tag-/Zeitangabe. */
export function julianDateFromDayOfYear(
  year,
  dayOfYear,
  minuteOfDay,
  utcOffsetHours
) {
  return julianDayNumber(year, 1, 1)
    + dayOfYear
    - 1.5
    + (minuteOfDay - utcOffsetHours * 60) / 1440;
}

export function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function daysInYear(year) {
  return isLeapYear(year) ? 366 : 365;
}
