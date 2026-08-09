import { daysInYear } from "../astronomy/julianDate.js";
import { SECONDS_PER_YEAR } from "../features/time/speed.js";

const finite = (value, name) => {
  if (!Number.isFinite(value)) throw new TypeError(`${name} muss endlich sein`);
  return value;
};

const range = (value, minimum, maximum, name) => {
  finite(value, name);
  if (value < minimum || value > maximum) {
    throw new RangeError(`${name} liegt außerhalb ${minimum}…${maximum}`);
  }
};

const integerRange = (value, minimum, maximum, name) => {
  range(value, minimum, maximum, name);
  if (!Number.isInteger(value)) throw new TypeError(`${name} muss ganzzahlig sein`);
};

export function validateAppState(state) {
  if (!state || typeof state !== "object") throw new TypeError("App-Zustand fehlt");
  const { observer, simulation, view, layers, scene } = state;
  if (![observer, simulation, view, layers, scene].every((part) => part && typeof part === "object")) {
    throw new TypeError("App-Zustand ist unvollständig");
  }

  range(observer.latitude, -90, 90, "Breitengrad");
  range(observer.longitude, -180, 180, "Längengrad");
  range(observer.utcOffsetHours, -14, 14, "UTC-Abweichung");
  if (typeof observer.name !== "string") throw new TypeError("Ortsname muss Text sein");

  integerRange(simulation.year, -5000, 12000, "Jahr");
  if (simulation.year === 0) throw new RangeError("Ein Jahr 0 ist nicht zulässig");
  integerRange(simulation.dayOfYear, 1, daysInYear(simulation.year), "Jahrestag");
  range(simulation.minuteOfDay, 0, 1440, "Tagesminute");
  range(simulation.speed, 0, SECONDS_PER_YEAR, "Geschwindigkeit");
  if (typeof simulation.running !== "boolean") throw new TypeError("Laufstatus muss boolesch sein");

  if (!["dome", "horizon"].includes(view.mode)) throw new TypeError("Unbekannter Ansichtsmodus");
  range(view.zoom, Number.EPSILON, 6000, "Vergrößerung");
  finite(view.panX, "Horizontale Verschiebung");
  finite(view.panY, "Vertikale Verschiebung");
  if (typeof view.fullscreen !== "boolean") throw new TypeError("Vollbildstatus muss boolesch sein");

  for (const [name, value] of Object.entries(layers)) {
    if (typeof value !== "boolean") throw new TypeError(`Ebenenstatus muss boolesch sein: ${name}`);
  }
  if (scene.activeId !== null && typeof scene.activeId !== "string") {
    throw new TypeError("Aktive Szenen-ID ist ungültig");
  }
  if (typeof scene.focusMode !== "boolean") throw new TypeError("Fokusmodus muss boolesch sein");
  return state;
}
