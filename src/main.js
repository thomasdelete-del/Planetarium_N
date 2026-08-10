import { bootstrapApplication } from "./app/bootstrap.js";
import { activateDeferredStylesheets } from "./platform/deferredResources.js";
import { bindOrientationCanvasInteractions } from "./ui/orientationCanvasInteractions.js";

activateDeferredStylesheets();

const start = () => {
  bindOrientationCanvasInteractions();
  bootstrapApplication();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
