import { createLegacyFunctionResolver } from "./legacyFunctionResolver.js";

/** Adapter zwischen deklarativen Formulareingaben und Legacy-Funktionen. */
export function createLegacyInputActions(globalObject = window) {
  const getFunction = createLegacyFunctionResolver(globalObject);
  const call = (name) => () => getFunction(name)();
  const callWithValue = (name) => ({ element }) => getFunction(name)(element.value);
  const callWithEvent = (name) => ({ event }) => getFunction(name)(event);

  return Object.freeze({
    "search-city": call("onCitySearch"),
    "change-year": call("onYearSlider"),
    "change-day": call("onDaySlider"),
    "change-time": call("onSl"),
    "change-latitude": call("onLat"),
    "change-longitude": call("onSlLng"),
    "change-speed": callWithValue("setSp"),
    "change-font-scale": callWithValue("setFontScale"),
    "select-apollo-file": callWithEvent("apolloFilePicked")
  });
}
