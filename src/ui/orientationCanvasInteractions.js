const DOUBLE_TAP_MS = 350;
const TAP_MOVE_PX = 8;

function isOrientationMode() {
  return document.body.classList.contains("orient-mode");
}

function showObjectAt(canvas, clientX, clientY) {
  const point = window.canvasXY(clientX, clientY);
  const object = window.findObject(point.x, point.y);
  if (object) window.showInfo(object, clientX, clientY);
  else window.hideInfo();
}

/** Ergänzt Objekt-Taps und den gewohnten Doppeltipp im sensor-gesteuerten Lagemodus. */
export function bindOrientationCanvasInteractions(globalObject = window) {
  const canvas = document.getElementById("cv");
  if (!canvas || typeof globalObject.canvasXY !== "function") return;

  let touchStart = null;
  let lastTapAt = 0;

  canvas.addEventListener("touchstart", (event) => {
    if (!isOrientationMode() || event.touches.length !== 1) {
      touchStart = null;
      return;
    }
    const touch = event.touches[0];
    touchStart = { x: touch.clientX, y: touch.clientY };
  }, { capture: true, passive: true });

  canvas.addEventListener("touchmove", (event) => {
    if (!touchStart || event.touches.length !== 1) return;
    const touch = event.touches[0];
    if (Math.hypot(touch.clientX - touchStart.x, touch.clientY - touchStart.y) > TAP_MOVE_PX) {
      touchStart = null;
    }
  }, { capture: true, passive: true });

  canvas.addEventListener("touchend", (event) => {
    if (!isOrientationMode() || !touchStart || event.changedTouches.length !== 1) return;
    const touch = event.changedTouches[0];
    event.preventDefault();
    showObjectAt(canvas, touch.clientX, touch.clientY);

    const now = Date.now();
    if (now - lastTapAt < DOUBLE_TAP_MS) {
      globalObject.toggleImmersive();
      lastTapAt = 0;
    } else {
      lastTapAt = now;
    }
    touchStart = null;
  }, { capture: true, passive: false });

  canvas.addEventListener("click", (event) => {
    if (!isOrientationMode() || Date.now() - lastTapAt < 500) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    showObjectAt(canvas, event.clientX, event.clientY);
  }, true);

  canvas.addEventListener("dblclick", (event) => {
    if (!isOrientationMode()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    globalObject.toggleImmersive();
  }, true);
}
