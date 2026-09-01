export function installMoonPhaseTracking(globalObject = window) {
  if (globalObject.__moonPhaseTrackingInstalled) return;
  globalObject.__moonPhaseTrackingInstalled = true;
  globalObject.__planetariumRender?.registerAroundDraw("moon-phase-tracking", context => {
    if (globalObject.__moonPhaseTracking && globalObject.__moonPhaseNeedsCenter) {
      globalObject.__moonPhaseNeedsCenter = false;
      globalObject.__trackMoonObserver?.();
    }
    const result = context.next(...context.args);
    globalObject.__drawMoonMeridianTrail?.();
    return result;
  });
}
