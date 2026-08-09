import { getScene } from "./sceneCatalog.js";
import { sceneSelected } from "../../app/actions.js";

export function createSceneController({ dispatch, legacyGlobal = window }) {
  return Object.freeze({
    select(sceneId) {
      const scene = getScene(sceneId);
      if (!scene) throw new Error(`Unbekannte Planetarium-Szene: ${sceneId}`);
      if (typeof legacyGlobal.jumpScene !== "function") {
        throw new Error("Der Legacy-Szenen-Dispatcher ist nicht verfügbar.");
      }

      dispatch(sceneSelected(sceneId));
      return legacyGlobal.jumpScene(sceneId);
    }
  });
}
