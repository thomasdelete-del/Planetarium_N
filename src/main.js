import { bootstrapApplication } from "./app/bootstrap.js";

const start = () => bootstrapApplication();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
