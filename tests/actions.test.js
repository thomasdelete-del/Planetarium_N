import test from "node:test";
import assert from "node:assert/strict";
import { bindActions } from "../src/ui/bindActions.js";
import { createLegacyUiActions } from "../src/ui/legacyUiActions.js";

test("Deklarative UI-Aktion wird genau einmal ausgeführt", () => {
  const calls = [];
  const element = { dataset: { action: "test" }, closest: () => element };
  let listener;
  const root = {
    contains: (candidate) => candidate === element,
    addEventListener: (_type, fn) => { listener = fn; },
    removeEventListener: (_type, fn) => { if (listener === fn) listener = null; }
  };
  const unbind = bindActions({ root, actions: { test: () => calls.push("test") } });

  listener({ target: element });
  assert.deepEqual(calls, ["test"]);
  unbind();
  assert.equal(listener, null);
});

test("UI-Aktionsregister delegiert an vorhandene Legacy-Funktionen", () => {
  const calls = [];
  const actions = createLegacyUiActions({
    scrollToSky: () => calls.push("sky"),
    toggleLegend: () => calls.push("legend"),
    scrollToGuide: () => calls.push("guide"),
    promptYear: () => calls.push("year"),
    promptDate: () => calls.push("date"),
    openMap: () => calls.push("open-map"),
    closeMap: () => calls.push("close-map"),
    togNames: () => calls.push("names"),
    togConstellationNames: () => calls.push("constellation-names"),
    togAlt: () => calls.push("altitude-grid"),
    togRA: () => calls.push("ra-grid"),
    togLines: () => calls.push("constellation-lines"),
    togRefCircles: () => calls.push("reference-circles"),
    togPrecessionCircle: () => calls.push("precession-circle"),
    togZodiac: () => calls.push("zodiac"),
    togTwilight: () => calls.push("twilight"),
    togMeteors: () => calls.push("meteors")
  });

  actions["scroll-to-sky"]();
  actions["toggle-legend"]();
  actions["scroll-to-guide"]();
  actions["prompt-year"]();
  actions["prompt-date"]();
  actions["open-map"]();
  actions["close-map"]();
  actions["toggle-names"]();
  actions["toggle-constellation-names"]();
  actions["toggle-altitude-grid"]();
  actions["toggle-ra-grid"]();
  actions["toggle-constellation-lines"]();
  actions["toggle-reference-circles"]();
  actions["toggle-precession-circle"]();
  actions["toggle-zodiac"]();
  actions["toggle-twilight"]();
  actions["toggle-meteors"]();
  assert.deepEqual(calls, [
    "sky", "legend", "guide", "year", "date", "open-map", "close-map",
    "names", "constellation-names", "altitude-grid", "ra-grid", "constellation-lines",
    "reference-circles", "precession-circle", "zodiac", "twilight", "meteors"
  ]);
});

test("Unbekannte deklarative Aktion wird nicht still ignoriert", () => {
  const element = { dataset: { action: "missing" }, closest: () => element };
  let listener;
  const root = {
    contains: () => true,
    addEventListener: (_type, fn) => { listener = fn; },
    removeEventListener: () => {}
  };
  bindActions({ root, actions: {} });
  assert.throws(() => listener({ target: element }), /Unbekannte UI-Aktion/);
});

test("Parameterisierte UI-Aktionen validieren und konvertieren Datenattribute", () => {
  const calls = [];
  const actions = createLegacyUiActions({
    stepYear: (value) => calls.push(["year", value]),
    stepDay: (value) => calls.push(["day", value]),
    setSkyQuality: (value) => calls.push(["quality", value]),
    setGear: (value) => calls.push(["gear", value])
  });

  actions["step-year"]({ element: { dataset: { step: "-100" } } });
  actions["step-day"]({ element: { dataset: { step: "30" } } });
  actions["set-sky-quality"]({ element: { dataset: { magnitude: "6.5" } } });
  actions["set-gear"]({ element: { dataset: { gear: "3600" } } });
  actions["set-gear"]({ element: { dataset: { gear: "year" } } });

  assert.deepEqual(calls, [
    ["year", -100], ["day", 30], ["quality", 6.5],
    ["gear", 3600], ["gear", "year"]
  ]);
  assert.throws(
    () => actions["step-year"]({ element: { dataset: { step: "ungültig" } } }),
    /Ungültiger Zahlenwert/
  );
});

test("Einfache Bedienschalter sind vollständig im Aktionsregister verfügbar", () => {
  const calls = [];
  const legacyNames = [
    "togAnim", "setNow", "toggleTelescope", "togISS", "togLocPanel",
    "togDST", "openCoords", "applyManual", "gaiaDialogZeigen"
  ];
  const globalObject = Object.fromEntries(
    legacyNames.map((name) => [name, () => calls.push(name)])
  );
  const actions = createLegacyUiActions(globalObject);
  const actionNames = [
    "toggle-animation", "set-now", "toggle-telescope", "toggle-iss",
    "toggle-location-panel", "toggle-dst", "open-coordinates",
    "apply-coordinates", "open-gaia-dialog"
  ];

  actionNames.forEach((name) => actions[name]());
  assert.deepEqual(calls, legacyNames);
});

test("Didaktische Parameteraktionen akzeptieren nur definierte Werte", () => {
  const calls = [];
  const lineButton = { dataset: {} };
  const actions = createLegacyUiActions({
    toggleSolarYearLines: (element) => calls.push(["lines", element]),
    startSolarYearAtLat: (latitude) => calls.push(["latitude", latitude]),
    jumpToEclipse: (direction, type) => calls.push(["eclipse", direction, type])
  });

  actions["toggle-solar-year-lines"]({ element: lineButton });
  actions["start-solar-year-at-latitude"]({ element: { dataset: { latitude: "66.56" } } });
  actions["jump-to-eclipse"]({ element: { dataset: { direction: "-1", eclipseType: "lunar" } } });
  assert.deepEqual(calls, [
    ["lines", lineButton], ["latitude", 66.56], ["eclipse", -1, "lunar"]
  ]);
  assert.throws(
    () => actions["jump-to-eclipse"]({ element: { dataset: { direction: "2", eclipseType: "solar" } } }),
    /Finsternisrichtung/
  );
  assert.throws(
    () => actions["jump-to-eclipse"]({ element: { dataset: { direction: "1", eclipseType: "other" } } }),
    /Finsternistyp/
  );
});

test("Spezialaktionen bleiben synchrone Aufrufe des Klickereignisses", () => {
  const calls = [];
  const legacyNames = [
    "homeView", "toggleOrient", "toggleViewMode", "calibrateOrient",
    "startRocketLaunch", "loadApolloFile", "getGPS", "abortRocketLaunch"
  ];
  const globalObject = Object.fromEntries(
    legacyNames.map((name) => [name, () => calls.push(name)])
  );
  globalObject.manualOrient = (azimuth, altitude) => calls.push(["manualOrient", azimuth, altitude]);
  const actions = createLegacyUiActions(globalObject);

  [
    "home-view", "toggle-orientation", "toggle-view-mode", "calibrate-orientation",
    "start-rocket-launch", "load-apollo-file", "get-gps", "abort-rocket-launch"
  ].forEach((name) => actions[name]());
  actions["manual-orientation"]({ element: { dataset: { azimuth: "-12", altitude: "8" } } });

  assert.deepEqual(calls, [...legacyNames, ["manualOrient", -12, 8]]);
  assert.throws(
    () => actions["manual-orientation"]({ element: { dataset: { azimuth: "x", altitude: "0" } } }),
    /Lagekorrektur/
  );
});
