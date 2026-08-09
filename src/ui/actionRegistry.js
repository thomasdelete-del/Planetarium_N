/** Kombiniert Aktionsgruppen und verhindert unbemerkte Namensüberschreibungen. */
export function mergeActionGroups(...groups) {
  const registry = {};
  for (const group of groups) {
    if (!group || typeof group !== "object") throw new TypeError("Ungültige Aktionsgruppe");
    for (const [name, action] of Object.entries(group)) {
      if (Object.hasOwn(registry, name)) throw new Error(`Doppelte UI-Aktion: ${name}`);
      if (typeof action !== "function") throw new TypeError(`UI-Aktion ist keine Funktion: ${name}`);
      registry[name] = action;
    }
  }
  return Object.freeze(registry);
}
