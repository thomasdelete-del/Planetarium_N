import { bootstrapApplication } from "./app/bootstrap.js";
import { activateDeferredStylesheets } from "./platform/deferredResources.js";

activateDeferredStylesheets();

const start = () => bootstrapApplication();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
