/**
 * Einziger vorgesehener Übergang zwischen neuen Modulen und dem historischen
 * globalen Skript. Diese Datei wird mit jedem Migrationsschritt kleiner.
 */
export function readLegacyState(globalObject = window, documentObject = document) {
  const legacy = globalObject.__planetariumLegacy;
  const value = (name, fallback) =>
    typeof legacy?.get(name) !== "undefined"
      ? legacy.get(name)
      : typeof globalObject[name] === "undefined"
        ? fallback
        : globalObject[name];

  return {
    observer: {
      latitude: number(value("lat", 48.137), 48.137),
      longitude: number(value("lng", 11.575), 11.575),
      utcOffsetHours: number(value("utcOff", 2), 2),
      name: String(value("locName", "München"))
    },
    simulation: {
      year: number(value("simYear", new Date().getFullYear()), new Date().getFullYear()),
      dayOfYear: number(value("simDay", 1), 1),
      minuteOfDay: number(value("simMin", 720), 720),
      running: !Boolean(value("paused", true)),
      speed: number(value("speed", 1), 1)
    },
    view: {
      mode: value("viewMode", "dome") === "real" ? "horizon" : "dome",
      zoom: number(value("zoom", 1), 1),
      panX: number(value("panX", 0), 0),
      panY: number(value("panY", 0), 0),
      fullscreen: documentObject.body.classList.contains("fullscreen")
    }
  };
}

function number(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
