/**
 * Bindet Szenen deklarativ über `data-scene-id`. Ein einziger Listener genügt
 * auch für später dynamisch erzeugte Schaltflächen.
 */
export function bindSceneButtons({ root = document, selectScene, globalObject = window }) {
  if (typeof selectScene !== "function") throw new TypeError("selectScene fehlt");

  const handleClick = (event) => {
    const button = event.target.closest?.("[data-scene-id]");
    if (!button || !root.contains(button)) return;

    const sceneId = button.dataset.sceneId;
    if (button.dataset.resetSolarLat === "true") {
      globalObject.__solarYearLatOverride = null;
    }
    selectScene(sceneId);
  };

  // Der historische Gestenschutz stoppt Klicks innerhalb von #page-jumps in
  // der Bubble-Phase. Capture stellt sicher, dass der deklarative Controller
  // den Klick vorher verarbeitet.
  root.addEventListener("click", handleClick, { capture: true });
  return () => root.removeEventListener("click", handleClick, { capture: true });
}
