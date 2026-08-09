import { actionTypes } from "./actions.js";

export function appReducer(state, action) {
  switch (action.type) {
    case actionTypes.observerChanged:
      return { ...state, observer: { ...state.observer, ...action.payload } };
    case actionTypes.simulationChanged:
      return { ...state, simulation: { ...state.simulation, ...action.payload } };
    case actionTypes.viewChanged:
      return { ...state, view: { ...state.view, ...action.payload } };
    case actionTypes.layersChanged:
      return { ...state, layers: { ...state.layers, ...action.payload } };
    case actionTypes.sceneSelected:
      return { ...state, scene: { ...state.scene, activeId: action.payload } };
    case actionTypes.stateHydrated:
      return hydrateState(state, action.payload);
    default:
      return state;
  }
}

function hydrateState(state, payload = {}) {
  const next = { ...state };
  for (const key of ["observer", "simulation", "view", "layers", "scene"]) {
    if (payload[key] && typeof payload[key] === "object") {
      next[key] = { ...state[key], ...payload[key] };
    }
  }
  return next;
}
