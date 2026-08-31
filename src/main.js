import { bootstrapApplication } from "./app/bootstrap.js?v=20260813b2";
import { activateDeferredStylesheets } from "./platform/deferredResources.js";
import { bindOrientationCanvasInteractions } from "./ui/orientationCanvasInteractions.js";
import { bindWorldMap } from "./ui/worldMap.js";
import { installLightPollutionEstimator } from "./features/location/lightPollution.js?v=20260815-sqm1";
import { installPrecessionCircleControl } from "./features/didactics/precessionCircle.js?v=20260831-keepcircle";
import { installRuntimePerformanceProfile } from "./platform/runtimePerformance.js";
import { installLabelCadence } from "./features/render/labelCadence.js?v=20260831-singlecanvas";
import { createTextSpriteRenderer } from "./features/render/textSprites.js?v=20260831-zoomsharp";

activateDeferredStylesheets();

const start = () => {
  window.__renderTextSprite = createTextSpriteRenderer();
  document.fonts?.addEventListener('loadingdone',()=>window.__renderTextSprite.clear());
  installLabelCadence();
  installPrecessionCircleControl();
  installRuntimePerformanceProfile();
  installLightPollutionEstimator({
    cities: window.getPlanetariumCities?.() ?? []
  });
  bindWorldMap();
  bindOrientationCanvasInteractions();
  bootstrapApplication();
  /* Kritische, reproduzierbare Prüfszene unabhängig von einem eventuell noch
     zwischengespeicherten dokumentweiten Aktionsregister binden. */
  const pareyButton = document.getElementById("skyq-parey");
  if (pareyButton && !pareyButton.dataset.directActionBound) {
    pareyButton.dataset.directActionBound = "true";
    pareyButton.addEventListener("click", (event) => {
      event.stopPropagation();
      window.setPareyProfile();
    });
  }
};

if (document.readyState === "loading" && !document.getElementById("cv")) {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
