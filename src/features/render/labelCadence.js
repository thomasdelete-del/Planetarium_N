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
  let previousAnchors = new Map(), currentAnchors = null, anchorOccurrences = null;
  let labelMotion = null;

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
    const legacy = globalObject.__planetariumLegacy;
    /* Die Legacy-API steht je nach Startreihenfolge erst nach der Installation
       dieser Middleware bereit. Die am body gesetzte Modusklasse ist dagegen
       in jedem Einstiegspfad aktuell. Ohne diesen zweiten Nachweis blieb die
       alte 5-Hz-Ebene im Lagemodus sichtbar und lief dem Hauptcanvas nach. */
    const orientationSky = (legacy && legacy.get("orientMode") === true) ||
      document.body.classList.contains("orient-mode");
    const runningTime = legacy && !legacy.get("paused") && Math.abs(Number(legacy.get("speed")) || 0) > 0;
    const movingView = legacy && Number(legacy.get("interacting")) > 0;
    /* Die Lagebewegung wird bereits im Legacy-Renderer pixelgenau gedrosselt.
       Eine zweite Ebene wuerde beim Schwenken sichtbar hinterherlaufen. */
    /* Dasselbe gilt fuer Zeitlauf und manuelles Schwenken: Selbst bei identischen
       Projektionskoordinaten kann der Browser zwei Canvas-Ebenen in
       aufeinanderfolgenden Compositor-Schritten darstellen. Texte und
       Sternbildlinien wirken dann, als liefen sie den Sternen hinterher. In
       bewegten Bildern landen deshalb alle astronomischen Elemente im selben
       Legacy-Canvas und damit garantiert im selben praesentierten Frame. */
    if (orientationSky || movingView) {
      if (canvas) canvas.style.display = "none";
      return drawContext.next(...drawContext.args);
    }
    ensureLayer(sourceCanvas);
    canvas.style.display = "block";
    const now = performance.now();
    /* Bei schnellem Zeitlauf bewegt sich der Himmel sichtbar zwischen zwei
       200-ms-Schritten. Namen und Sternbildlinien muessen deshalb mit jedem
       ohnehin erzeugten Himmelsbild mitlaufen. Bei normaler Zeit bleibt die
       sparsame 5-Hz-Ebene aktiv. Es wird kein zusaetzlicher Frame angefordert. */
    const fastSky = legacy && Math.abs(Number(legacy.get("speed")) || 0) >= 900 && !legacy.get("paused");
    /* Auch der normale Zeitlauf verschiebt Beschriftungen zwar langsam, aber
       kontinuierlich. Eine 5-Hz-Ebene macht diese Bewegung als kleine Spruenge
       sichtbar. Es werden keine Extra-Frames erzeugt; vorhandene Zeitbilder
       erhalten lediglich die dazugehoerige Text- und Linienprojektion. */
    /* Maus-, Touch-, Rad- und simulierte Pfeilbewegungen setzen im Legacy-
       Renderer `interacting`. Solange dieser Zaehler aktiv ist, muessen Texte
       und Sternbildlinien dasselbe Kamerabild wie die Sterne verwenden. */
    /* Im Lagemodus ist die Kameralage selbst die Animation. Die getrennte
       Beschriftungs- und Sternbildlinienebene muss deshalb mit jedem bereits
       freigegebenen Himmelsbild neu projiziert werden. Ein 5-Hz-Cache wuerde
       beim Schwenken sichtbar hinter den Sternen herspringen. */
    const refresh = force || fastSky || runningTime || movingView || now - lastFrame >= intervalMs;
    const frameGap = isFinite(lastFrame) ? now - lastFrame : 16;
    if (refresh) {
      force = false;
      lastFrame = now;
      currentAnchors = new Map();
      anchorOccurrences = new Map();
    }
    /* Der Legacy-Renderer kann einen zu kleinen Sensor-Zwischenschritt direkt
       am Anfang verwerfen. Die alte Fassung hatte die sichtbare Ebene bereits
       vorher geleert; dadurch verschwanden Namen und Linien bis zum nächsten
       echten Lagebild. Erst die erste tatsächliche Zeichenoperation bestätigt,
       dass dieser Aufruf ein vollständiges Bild erzeugt. */
    let layerPrepared = !refresh;
    const prepareLayer = () => {
      if (layerPrepared) return;
      layerPrepared = true;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
    const originalFill = source.fillText;
    const originalStroke = source.strokeText;
    const originalBeginPath = source.beginPath;
    const originalMoveTo = source.moveTo;
    const originalLineTo = source.lineTo;
    const originalPathStroke = source.stroke;
    source.beginPath = function () {
      if (refresh) { prepareLayer(); copyTextState(source, context); context.beginPath(); }
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
      prepareLayer();
      copyTextState(source, context);
      /* Astronomische Himmelsansicht: Westen rechts, Osten links. Die bereits
         projizierten Legacy-Kuerzel werden unveraendert uebernommen. */
      let drawX = x, drawY = y;
      if (legacy && legacy.get("viewMode") !== "real") {
        const compassToken = /^(N|NO|O|SO|S|SW|W|NW|★|·|●|▲)$/.test(String(text));
        if (compassToken) {
          /* Die alte Tagesdarstellung zog die Marker auf 93 % des Radius nach
             innen. Einheitlich knapp am Horizontkreis wirken Punkt und Text
             wie bei den uebrigen Himmelsrichtungen und bleiben lesbar. */
          const outward = legacy.get("showTwilight") ? 1.07 : 1.03;
          drawX *= outward;
          drawY *= outward;
        }
      }
      const label = String(text);
      const occurrence = anchorOccurrences.get(label) || 0;
      anchorOccurrences.set(label, occurrence + 1);
      const matrix = source.getTransform();
      currentAnchors.set(`${label}\u0000${occurrence}`, {
        x: matrix.a * drawX + matrix.c * drawY + matrix.e,
        y: matrix.b * drawX + matrix.d * drawY + matrix.f
      });
      return maxWidth === undefined ? context.fillText(text, drawX, drawY) : context.fillText(text, drawX, drawY, maxWidth);
    };
    source.strokeText = function (text, x, y, maxWidth) {
      if (!refresh) return;
      if (globalObject.__planetariumLabelAllowed && !globalObject.__planetariumLabelAllowed(text)) return;
      prepareLayer();
      copyTextState(source, context);
      return maxWidth === undefined ? context.strokeText(text, x, y) : context.strokeText(text, x, y, maxWidth);
    };
    let result;
    try { result = drawContext.next(...drawContext.args); }
    finally {
      source.fillText = originalFill;
      source.strokeText = originalStroke;
      source.beginPath = originalBeginPath;
      source.moveTo = originalMoveTo;
      source.lineTo = originalLineTo;
      source.stroke = originalPathStroke;
    }
    /* Mittelpunkt der Kuppelprojektion = Zenit. Diese Beschriftung wird erst
       nach dem Legacy-Bild gesetzt und kann daher nicht von spaeteren Ebenen
       ueberzeichnet werden. */
    if (refresh && legacy && legacy.get("viewMode") !== "real") {
      prepareLayer();
      context.save();
      context.setTransform(1, 0, 0, 1, 0, 0);
      const x = Number(legacy.get("ORX")) + Number(legacy.get("panX"));
      const y = Number(legacy.get("ORY")) + Number(legacy.get("panY"));
      const pixelRatio = globalObject.devicePixelRatio || 1;
      const shortSide = Math.min(globalObject.innerWidth || 720, globalObject.innerHeight || 720);
      const mobileScale = shortSide >= 720 ? 1 : Math.max(.62, shortSide / 720);
      context.font = `700 ${Math.max(9 * pixelRatio, 14 * pixelRatio * mobileScale)}px Inter,system-ui,sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "bottom";
      context.fillStyle = "rgba(225,235,255,.92)";
      context.shadowColor = "rgba(2,6,18,.98)";
      context.shadowBlur = 6 * pixelRatio * mobileScale;
      context.fillText("Zenit", x, y - 12 * pixelRatio * mobileScale);
      context.restore();
    }
    /* Der astronomische Renderer liefert weiterhin die exakten Zielpunkte.
       Zwischen zwei teuren Bildern bewegt der Browser die gesamte Text- und
       Sternbildlinienebene im Compositor um die robuste mittlere
       Bildverschiebung weiter. Dadurch werden keine erfundenen Sternorte
       dauerhaft verwendet: Jeder neue Rechenframe rastet wieder exakt ein. */
    if (refresh && runningTime && previousAnchors.size && currentAnchors.size) {
      const dx = [], dy = [];
      for (const [key, point] of currentAnchors) {
        const previous = previousAnchors.get(key);
        if (!previous) continue;
        const mx = previous.x - point.x, my = previous.y - point.y;
        if (isFinite(mx) && isFinite(my) && Math.abs(mx) < canvas.width * .12 && Math.abs(my) < canvas.height * .12) {
          dx.push(mx); dy.push(my);
        }
      }
      if (dx.length >= 2) {
        dx.sort((a, b) => a - b); dy.sort((a, b) => a - b);
        const mid = Math.floor(dx.length / 2);
        const scaleX = sourceCanvas.getBoundingClientRect().width / sourceCanvas.width;
        const scaleY = sourceCanvas.getBoundingClientRect().height / sourceCanvas.height;
        const fromX = dx[mid] * scaleX, fromY = dy[mid] * scaleY;
        if (labelMotion) labelMotion.cancel();
        labelMotion = canvas.animate(
          [{ transform: `translate(${fromX}px,${fromY}px)` }, { transform: "translate(0px,0px)" }],
          { duration: Math.max(16, Math.min(80, frameGap)), easing: "linear", fill: "both" }
        );
      }
    } else if (refresh && labelMotion) {
      labelMotion.cancel(); labelMotion = null;
      canvas.style.transform = "translate(0px,0px)";
    }
    if (refresh) previousAnchors = currentAnchors;
    return result;
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
