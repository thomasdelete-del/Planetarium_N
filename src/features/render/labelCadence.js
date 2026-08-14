const COPY_PROPERTIES = [
  "font", "fillStyle", "strokeStyle", "lineWidth", "textAlign", "textBaseline",
  "direction", "globalAlpha", "shadowColor", "shadowBlur", "shadowOffsetX", "shadowOffsetY"
];

function copyTextState(source, target) {
  for (const property of COPY_PROPERTIES) target[property] = source[property];
  target.setTransform(source.getTransform());
}

function isConstellationStroke(style) {
  const value = String(style).replace(/\s+/g, "");
  return value === "rgba(120,175,255,0.5)" || value === "rgba(190,215,255,0.52)" || value === "rgba(120,175,255,0.42)" ||
    value === "rgba(120,175,255,.5)" || value === "rgba(190,215,255,.52)" || value === "rgba(120,175,255,.42)";
}

export function installLabelCadence({ globalObject = window, intervalMs = 200 } = {}) {
  if (globalObject.__planetariumLabelCadence) return globalObject.__planetariumLabelCadence;
  let canvas = null, context = null, lastFrame = -Infinity, force = true;

  function ensureLayer(sourceCanvas) {
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "sky-label-layer";
      canvas.setAttribute("aria-hidden", "true");
      Object.assign(canvas.style, { position: "absolute", inset: "0", width: "100%", height: "100%", pointerEvents: "none", zIndex: "4" });
      sourceCanvas.parentElement.appendChild(canvas);
      context = canvas.getContext("2d");
    }
    if (canvas.width !== sourceCanvas.width || canvas.height !== sourceCanvas.height) {
      canvas.width = sourceCanvas.width;
      canvas.height = sourceCanvas.height;
      force = true;
    }
  }

  function aroundDraw(drawContext) {
    const sourceCanvas = document.getElementById("cv");
    const source = sourceCanvas?.getContext("2d");
    if (!sourceCanvas || !source) return drawContext.next(...drawContext.args);
    ensureLayer(sourceCanvas);
    const now = performance.now();
    /* Bei schnellem Zeitlauf bewegt sich der Himmel sichtbar zwischen zwei
       200-ms-Schritten. Namen und Sternbildlinien muessen deshalb mit jedem
       ohnehin erzeugten Himmelsbild mitlaufen. Bei normaler Zeit bleibt die
       sparsame 5-Hz-Ebene aktiv. Es wird kein zusaetzlicher Frame angefordert. */
    const legacy = globalObject.__planetariumLegacy;
    const fastSky = legacy && Math.abs(Number(legacy.get("speed")) || 0) >= 900 && !legacy.get("paused");
    const refresh = force || fastSky || now - lastFrame >= intervalMs;
    if (refresh) {
      force = false;
      lastFrame = now;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
    const originalFill = source.fillText;
    const originalStroke = source.strokeText;
    const originalBeginPath = source.beginPath;
    const originalMoveTo = source.moveTo;
    const originalLineTo = source.lineTo;
    const originalPathStroke = source.stroke;
    source.beginPath = function () {
      if (refresh) { copyTextState(source, context); context.beginPath(); }
      return originalBeginPath.call(source);
    };
    source.moveTo = function (x, y) {
      if (refresh) context.moveTo(x, y);
      return originalMoveTo.call(source, x, y);
    };
    source.lineTo = function (x, y) {
      if (refresh) context.lineTo(x, y);
      return originalLineTo.call(source, x, y);
    };
    source.stroke = function (...args) {
      if (!isConstellationStroke(source.strokeStyle)) return originalPathStroke.apply(source, args);
      if (refresh) { copyTextState(source, context); context.stroke(); }
    };
    source.fillText = function (text, x, y, maxWidth) {
      if (!refresh) return;
      if (globalObject.__planetariumLabelAllowed && !globalObject.__planetariumLabelAllowed(text)) return;
      copyTextState(source, context);
      return maxWidth === undefined ? context.fillText(text, x, y) : context.fillText(text, x, y, maxWidth);
    };
    source.strokeText = function (text, x, y, maxWidth) {
      if (!refresh) return;
      if (globalObject.__planetariumLabelAllowed && !globalObject.__planetariumLabelAllowed(text)) return;
      copyTextState(source, context);
      return maxWidth === undefined ? context.strokeText(text, x, y) : context.strokeText(text, x, y, maxWidth);
    };
    try { return drawContext.next(...drawContext.args); }
    finally {
      source.fillText = originalFill;
      source.strokeText = originalStroke;
      source.beginPath = originalBeginPath;
      source.moveTo = originalMoveTo;
      source.lineTo = originalLineTo;
      source.stroke = originalPathStroke;
    }
  }

  const api = Object.freeze({
    intervalMs,
    invalidate() { force = true; },
    get lastFrame() { return lastFrame; }
  });
  globalObject.__planetariumLabelCadence = api;
  const install = () => globalObject.__planetariumRender?.registerAroundDraw("label-cadence-5hz", aroundDraw);
  if (globalObject.__planetariumRender) install(); else globalObject.addEventListener("load", install, { once: true });
  return api;
}
