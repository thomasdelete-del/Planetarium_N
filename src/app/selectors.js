import { julianDateFromDayOfYear } from "../astronomy/julianDate.js";

const requireState = (state) => {
  if (!state || typeof state !== "object") throw new TypeError("App-Zustand fehlt");
  return state;
};

export const selectObserver = (state) => requireState(state).observer;
export const selectSimulation = (state) => requireState(state).simulation;
export const selectView = (state) => requireState(state).view;
export const selectLayers = (state) => requireState(state).layers;
export const selectScene = (state) => requireState(state).scene;

export function selectCurrentJulianDate(state) {
  const observer = selectObserver(state);
  const simulation = selectSimulation(state);
  return julianDateFromDayOfYear(
    simulation.year,
    simulation.dayOfYear,
    simulation.minuteOfDay,
    observer.utcOffsetHours
  );
}
