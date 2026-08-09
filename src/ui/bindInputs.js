/** Delegiert Formularereignisse anhand deklarativer data-Attribute. */
export function bindInputs({ root = document, actions, setSliderActive }) {
  if (!actions || typeof actions !== "object") throw new TypeError("Input-Aktionsregister fehlt");
  if (typeof setSliderActive !== "function") throw new TypeError("Slider-Statusfunktion fehlt");

  const eventTypes = ["input", "change", "focus"];
  const listeners = eventTypes.map((eventType) => {
    const attribute = `data-${eventType}-action`;
    const listener = (event) => {
      const element = event.target.closest?.(`[${attribute}]`);
      if (!element || !root.contains(element)) return;
      const name = element.getAttribute(attribute);
      const action = actions[name];
      if (typeof action !== "function") throw new Error(`Unbekannte Input-Aktion: ${name}`);
      action({ element, event });
    };
    root.addEventListener(eventType, listener, eventType === "focus");
    return [eventType, listener, eventType === "focus"];
  });

  const onPointerDown = (event) => {
    if (event.target.closest?.("[data-slider]")) setSliderActive(true);
  };
  const onPointerEnd = () => setSliderActive(false);
  root.addEventListener("pointerdown", onPointerDown);
  root.addEventListener("pointerup", onPointerEnd);
  root.addEventListener("pointercancel", onPointerEnd);

  return () => {
    listeners.forEach(([type, listener, capture]) => root.removeEventListener(type, listener, capture));
    root.removeEventListener("pointerdown", onPointerDown);
    root.removeEventListener("pointerup", onPointerEnd);
    root.removeEventListener("pointercancel", onPointerEnd);
  };
}
