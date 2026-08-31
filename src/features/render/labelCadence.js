/**
 * Text und Sternbildlinien bleiben in allen Zuständen im Hauptcanvas.
 * Keine zweite Projektion, kein Text-Cache und keine Compositor-Animation.
 * Die API bleibt für bestehende invalidate()-Aufrufe erhalten.
 */
export function installLabelCadence({ globalObject = window } = {}) {
  if (globalObject.__planetariumLabelCadence) return globalObject.__planetariumLabelCadence;
  let lastFrame = -Infinity;
  function aroundDraw(context) {
    document.getElementById("sky-label-layer")?.remove();
    lastFrame = performance.now();
    return context.next(...context.args);
  }
  const api = Object.freeze({
    intervalMs: 0,
    invalidate() {},
    get lastFrame() { return lastFrame; }
  });
  globalObject.__planetariumLabelCadence = api;
  const install = () => globalObject.__planetariumRender?.registerAroundDraw("label-cadence-5hz", aroundDraw);
  if (globalObject.__planetariumRender) install();
  else globalObject.addEventListener("load", install, { once: true });
  return api;
}
