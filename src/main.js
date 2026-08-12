import { bootstrapApplication } from "./app/bootstrap.js";
import { activateDeferredStylesheets } from "./platform/deferredResources.js";
import { bindOrientationCanvasInteractions } from "./ui/orientationCanvasInteractions.js";
import { bindWorldMap } from "./ui/worldMap.js";
import { installLightPollutionEstimator } from "./features/location/lightPollution.js";
import { installPrecessionCircleControl } from "./features/didactics/precessionCircle.js";
import { installRuntimePerformanceProfile } from "./platform/runtimePerformance.js";

activateDeferredStylesheets();

const start = () => {
  installPrecessionCircleControl();
  installRuntimePerformanceProfile();
  installLightPollutionEstimator({
    cities: window.getPlanetariumCities?.() ?? []
  });
  bindWorldMap();
  bindOrientationCanvasInteractions();
  bootstrapApplication();
};

if (document.readyState === "loading" && !document.getElementById("cv")) {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
