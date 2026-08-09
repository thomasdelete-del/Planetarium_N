function datasetOf(element) {
  if (!element?.dataset) throw new TypeError("Element mit Datenattributen fehlt");
  return element.dataset;
}

export function readFiniteNumber(element, key, label = key) {
  const value = Number(datasetOf(element)[key]);
  if (!Number.isFinite(value)) throw new TypeError(`Ungültiger Zahlenwert für ${label}`);
  return value;
}

export function readEnum(element, key, allowedValues, label = key) {
  const value = datasetOf(element)[key];
  if (!allowedValues.includes(value)) throw new TypeError(`Ungültiger Wert für ${label}`);
  return value;
}

export function assertAllowed(value, allowedValues, label) {
  if (!allowedValues.includes(value)) throw new TypeError(`Ungültiger Wert für ${label}`);
  return value;
}
