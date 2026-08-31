function automaticPrecessionView() {
  return window.didacticSimulationMode === "precession" || window.__v9PrecessionStatic === true;
}

function syncButton() {
  const button = document.getElementById("bprec");
  if (!button) return;
  const automatic = automaticPrecessionView();
  const visible = automatic || window.showPrecessionCircle === true;
  button.classList.toggle("on", visible);
  button.setAttribute("aria-pressed", String(visible));
  button.title = automatic
    ? "Präzessionskreis ist in dieser Präzessions-Didaktik automatisch sichtbar"
    : "Präzessionskreis anzeigen; erneut drücken: Zoom auf ganzen Himmel zurücksetzen";
}

export function installPrecessionCircleControl() {
  window.showPrecessionCircle = false;
  window.togPrecessionCircle = () => {
    // Zurückschalten beendet nur die Vergrößerung, nicht die Darstellung.
    if (automaticPrecessionView() || window.showPrecessionCircle === true) {
      window.__planetariumLegacy?.set("zoom", 1);
    } else {
      window.showPrecessionCircle = true;
    }
    syncButton();
    window.draw?.();
  };

  window.__planetariumRender?.registerAroundDraw("precession-circle-visibility", context => {
    const previous = window.didHidePrec;
    window.didHidePrec = !(automaticPrecessionView() || window.showPrecessionCircle === true);
    try { return context.next(...context.args); }
    finally {
      window.didHidePrec = previous;
      syncButton();
    }
  });
  syncButton();
}
