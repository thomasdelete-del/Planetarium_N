/** Erstellt den einzigen Resolver für noch globale Legacy-Funktionen. */
export function createLegacyFunctionResolver(globalObject) {
  if (!globalObject || typeof globalObject !== "object") {
    throw new TypeError("Legacy-Globalobjekt fehlt");
  }
  return (name) => {
    const fn = globalObject[name];
    if (typeof fn !== "function") throw new Error(`Legacy-Funktion fehlt: ${name}`);
    return fn;
  };
}
