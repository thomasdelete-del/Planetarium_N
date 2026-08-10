import { mergeActionGroups } from "./actionRegistry.js";
import { createLegacyFunctionResolver } from "./legacyFunctionResolver.js";
import { assertAllowed, readEnum, readFiniteNumber } from "./dataAttributes.js";

/** Adapter zwischen deklarativen UI-Aktionen und noch globalen Legacy-Funktionen. */
export function createLegacyUiActions(globalObject = window) {
  const getFunction = createLegacyFunctionResolver(globalObject);
  const call = (name) => () => getFunction(name)();
  const callWithNumber = (name, datasetKey) => ({ element }) => {
    const value = readFiniteNumber(element, datasetKey, name);
    return getFunction(name)(value);
  };

  const navigation = {
    "scroll-to-sky": call("scrollToSky"),
    "toggle-legend": call("toggleLegend"),
    "scroll-to-guide": call("scrollToGuide"),
    "home-view": call("homeView"),
    "open-map": call("openMap"),
    "close-map": call("closeMap")
  };

  const display = {
    "toggle-names": call("togNames"),
    "toggle-altitude-grid": call("togAlt"),
    "toggle-ra-grid": call("togRA"),
    "toggle-constellation-lines": call("togLines"),
    "toggle-reference-circles": call("togRefCircles"),
    "toggle-zodiac": call("togZodiac"),
    "toggle-twilight": call("togTwilight"),
    "toggle-meteors": call("togMeteors"),
    "toggle-telescope": call("toggleTelescope"),
    "toggle-iss": call("togISS")
  };

  const timeAndLocation = {
    "prompt-year": call("promptYear"),
    "prompt-date": call("promptDate"),
    "step-year": callWithNumber("stepYear", "step"),
    "step-day": callWithNumber("stepDay", "step"),
    "toggle-animation": call("togAnim"),
    "set-now": call("setNow"),
    "toggle-location-panel": call("togLocPanel"),
    "toggle-dst": call("togDST"),
    "open-coordinates": call("openCoords"),
    "apply-coordinates": call("applyManual"),
    "get-gps": call("getGPS"),
    "set-sky-quality": callWithNumber("setSkyQuality", "magnitude"),
    "set-gear": ({ element }) => {
      const rawValue = element.dataset.gear;
      const value = rawValue === "year" ? rawValue : Number(rawValue);
      if (value !== "year" && !Number.isFinite(value)) throw new TypeError("Ungültiger Gang");
      return getFunction("setGear")(value);
    }
  };

  const didactics = {
    "toggle-solar-year-lines": ({ element }) => getFunction("toggleSolarYearLines")(element),
    "start-solar-year-at-latitude": callWithNumber("startSolarYearAtLat", "latitude"),
    "jump-to-eclipse": ({ element }) => {
      const direction = assertAllowed(
        readFiniteNumber(element, "direction", "Finsternisrichtung"),
        [1, -1],
        "Finsternisrichtung"
      );
      const type = readEnum(element, "eclipseType", ["solar", "lunar"], "Finsternistyp");
      return getFunction("jumpToEclipse")(direction, type);
    }
  };

  const devicesAndMedia = {
    "toggle-orientation": call("toggleOrient"),
    "toggle-vr-camera": call("toggleVrCamera"),
    "toggle-view-mode": call("toggleViewMode"),
    "calibrate-orientation": call("calibrateOrient"),
    "manual-orientation": ({ element }) => {
      const azimuth = readFiniteNumber(element, "azimuth", "Lagekorrektur");
      const altitude = readFiniteNumber(element, "altitude", "Lagekorrektur");
      return getFunction("manualOrient")(azimuth, altitude);
    },
    "open-gaia-dialog": call("gaiaDialogZeigen"),
    "start-rocket-launch": call("startRocketLaunch"),
    "load-apollo-file": call("loadApolloFile"),
    "abort-rocket-launch": call("abortRocketLaunch")
  };

  return mergeActionGroups(navigation, display, timeAndLocation, didactics, devicesAndMedia);
}
