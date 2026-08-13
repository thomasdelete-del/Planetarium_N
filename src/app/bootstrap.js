import { createInitialState } from "./state.js";
import { createStore } from "./store.js";
import { appReducer } from "./reducer.js";
import { readLegacyState } from "./legacyAdapter.js";
import { stateHydrated } from "./actions.js";
import { validateAppState } from "./validateState.js";
import * as selectors from "./selectors.js";
import * as calendar from "../features/time/calendar.js";
import * as speedControl from "../features/time/speed.js";
import * as astronomy from "../astronomy/index.js";
import { sceneCatalog } from "../features/scenes/sceneCatalog.js";
import { createSceneController } from "../features/scenes/sceneController.js";
import { bindSceneButtons } from "../ui/bindSceneButtons.js";
import { bindActions } from "../ui/bindActions.js";
import { createLegacyUiActions } from "../ui/legacyUiActions.js";
import { bindInputs } from "../ui/bindInputs.js";
import { createLegacyInputActions } from "../ui/legacyInputActions.js";

export function bootstrapApplication({ documentObject = document, globalObject = window } = {}) {
  if (globalObject.planetarium?.getState) return globalObject.planetarium;

  const store = createStore(createInitialState(), appReducer, { validateState: validateAppState });
  store.dispatch(stateHydrated(readLegacyState(globalObject, documentObject)));

  const sceneController = createSceneController({
    dispatch: store.dispatch,
    legacyGlobal: globalObject
  });
  const cleanup = [
    bindSceneButtons({
      root: documentObject,
      selectScene: sceneController.select,
      globalObject
    }),
    bindActions({
      root: documentObject,
      actions: createLegacyUiActions(globalObject)
    }),
    bindInputs({
      root: documentObject,
      actions: createLegacyInputActions(globalObject),
      setSliderActive: (value) => {
        if (typeof globalObject.setSliderActive !== "function") {
          throw new Error("Legacy-Sliderstatus ist nicht verfügbar.");
        }
        globalObject.setSliderActive(value);
      }
    })
  ];

  let api;
  const destroy = () => {
    cleanup.splice(0).reverse().forEach((unbind) => unbind());
    store.destroy();
    delete documentObject.documentElement.dataset.appReady;
    if (globalObject.planetarium === api) delete globalObject.planetarium;
  };
  api = Object.freeze({
    astronomy,
    calendar,
    speedControl,
    scenes: sceneCatalog,
    selectors,
    selectScene: sceneController.select,
    getState: store.getState,
    dispatch: store.dispatch,
    subscribe: store.subscribe,
    subscribeSelector: store.subscribeSelector,
    destroy
  });

  globalObject.planetarium = api;
  documentObject.documentElement.dataset.appReady = "true";
  globalObject.dispatchEvent(new globalObject.CustomEvent("planetarium:ready"));
  return api;
}
