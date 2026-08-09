export const actionTypes = Object.freeze({
  observerChanged: "observer/changed",
  simulationChanged: "simulation/changed",
  viewChanged: "view/changed",
  layersChanged: "layers/changed",
  sceneSelected: "scene/selected",
  stateHydrated: "state/hydrated"
});

const payloadAction = (type) => (payload) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new TypeError(`Objekt-Nutzdaten erforderlich: ${type}`);
  }
  return Object.freeze({ type, payload: deepFreeze(structuredClone(payload)) });
};

export const observerChanged = payloadAction(actionTypes.observerChanged);
export const simulationChanged = payloadAction(actionTypes.simulationChanged);
export const viewChanged = payloadAction(actionTypes.viewChanged);
export const layersChanged = payloadAction(actionTypes.layersChanged);
export const stateHydrated = payloadAction(actionTypes.stateHydrated);

export function sceneSelected(sceneId) {
  if (typeof sceneId !== "string" || !sceneId.trim()) {
    throw new TypeError("Szenen-ID fehlt");
  }
  return Object.freeze({ type: actionTypes.sceneSelected, payload: sceneId });
}
import { deepFreeze } from "./immutable.js";
