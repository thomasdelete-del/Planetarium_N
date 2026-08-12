const PROFILE_KEY = "planetarium-device-profile-v1";

function skyContains(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left - rect.width / 2;
  const y = clientY - rect.top - rect.height / 2;
  return Math.hypot(x, y) <= Math.min(rect.width, rect.height) * 0.51;
}

async function sampleFrames(count = 24) {
  const samples = [];
  let previous = performance.now();
  for (let index = 0; index < count; index += 1) {
    await new Promise(requestAnimationFrame);
    const now = performance.now();
    samples.push(now - previous);
    previous = now;
  }
  samples.sort((a, b) => a - b);
  return samples[Math.floor(samples.length * 0.75)] || 16.7;
}

function sampleCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 360;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return 99;
  const started = performance.now();
  context.fillStyle = "#dfe8ff";
  for (let pass = 0; pass < 4; pass += 1) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let index = 0; index < 12000; index += 1) {
      const x = (Math.imul(index + 1, 2654435761) >>> 0) % canvas.width;
      const y = (Math.imul(index + 7, 2246822519) >>> 0) % canvas.height;
      context.fillRect(x, y, 1, 1);
    }
  }
  return performance.now() - started;
}

function classify(frameP75, canvasMs) {
  if (frameP75 <= 19 && canvasMs <= 22) return "high";
  if (frameP75 <= 27 && canvasMs <= 48) return "medium";
  return "low";
}

export async function installRuntimePerformanceProfile() {
  const canvas = document.getElementById("cv");
  if (!canvas) return;

  // Der kurze Test läuft erst nach dem ersten stabilen Bild und verändert die
  // sichtbare Milchstraße nicht. Er bestimmt nur Interaktions- und LOD-Budgets.
  await new Promise(resolve => setTimeout(resolve, 700));
  const frameP75 = await sampleFrames();
  const canvasMs = sampleCanvas();
  const profile = { level: classify(frameP75, canvasMs), frameP75, canvasMs };
  window.__devicePerformanceProfile = profile;
  document.documentElement.dataset.performanceProfile = profile.level;
  try { sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch {}

  let refinementTimer = 0;
  const begin = event => {
    if (!skyContains(canvas, event.clientX, event.clientY)) return;
    clearTimeout(refinementTimer);
    window.__skyRenderQuality = 0;
  };
  const move = event => {
    if (window.__skyRenderQuality !== 0 || !skyContains(canvas, event.clientX, event.clientY)) return;
    window.requestPlanetariumFrame?.();
  };
  const end = () => {
    if (window.__skyRenderQuality !== 0) return;
    window.__skyRenderQuality = 1;
    window.requestPlanetariumFrame?.();
    refinementTimer = setTimeout(() => {
      window.__skyRenderQuality = 2;
      window.requestPlanetariumFrame?.();
    }, profile.level === "low" ? 180 : 90);
  };
  canvas.addEventListener("pointerdown", begin, { passive: true });
  window.addEventListener("pointermove", move, { passive: true });
  window.addEventListener("pointerup", end, { passive: true });
  window.addEventListener("pointercancel", end, { passive: true });
}
