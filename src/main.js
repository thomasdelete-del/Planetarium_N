import { bootstrapApplication } from "./app/bootstrap.js";
import { activateDeferredStylesheets } from "./platform/deferredResources.js";
import { bindOrientationCanvasInteractions } from "./ui/orientationCanvasInteractions.js";
import { bindWorldMap } from "./ui/worldMap.js";
import { installLightPollutionEstimator } from "./features/location/lightPollution.js";

activateDeferredStylesheets();

const start = () => {
  installLightPollutionEstimator({
    cities: window.getPlanetariumCities?.() ?? []
  });
  bindWorldMap();
  bindOrientationCanvasInteractions();
  bootstrapApplication();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
