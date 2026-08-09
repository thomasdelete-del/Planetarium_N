/**
 * Zentraler Dispatcher für einfache deklarative UI-Aktionen.
 * Fachliche Adapter werden getrennt injiziert.
 */
export function bindActions({ root = document, actions }) {
  if (!actions || typeof actions !== "object") throw new TypeError("Aktionsregister fehlt");

  const handleClick = (event) => {
    const element = event.target.closest?.("[data-action]");
    if (!element || !root.contains(element)) return;

    const name = element.dataset.action;
    const action = actions[name];
    if (typeof action !== "function") throw new Error(`Unbekannte UI-Aktion: ${name}`);
    action({ element, event });
  };

  root.addEventListener("click", handleClick);
  return () => root.removeEventListener("click", handleClick);
}
