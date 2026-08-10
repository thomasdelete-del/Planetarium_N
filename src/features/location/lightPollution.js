const EARTH_RADIUS_KM = 6371;

export function distanceKm(lat1, lng1, lat2, lng2) {
  const radians = Math.PI / 180;
  const phi1 = lat1 * radians;
  const phi2 = lat2 * radians;
  const deltaPhi = (lat2 - lat1) * radians;
  const deltaLambda = (lng2 - lng1) * radians;
  const a = Math.sin(deltaPhi / 2) ** 2
    + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function estimateSkyQuality(lat, lng, cities = []) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new TypeError("Für die Himmelsqualität sind gültige Koordinaten erforderlich.");
  }
  if (!cities.length) return { magnitude: 5.5, label: "Land", distance: null, nearest: null };

  let nearest = null;
  let distance = Infinity;
  for (const city of cities) {
    const candidate = distanceKm(lat, lng, city.la, city.lo);
    if (candidate < distance) {
      distance = candidate;
      nearest = city;
    }
  }

  const cityLimit = nearest?.cap ? 30 : 20;
  const landLimit = nearest?.cap ? 120 : 80;
  if (distance <= cityLimit) return { magnitude: 4.5, label: "Stadt", distance, nearest };
  if (distance <= landLimit) return { magnitude: 5.5, label: "Land", distance, nearest };
  return { magnitude: 6.5, label: "dunkel", distance, nearest };
}

export function installLightPollutionEstimator({ globalObject = window, documentObject = document, cities = [] } = {}) {
  const apply = (lat, lng) => {
    const result = estimateSkyQuality(lat, lng, cities);
    globalObject.setSkyQuality?.(result.magnitude, "auto");
    globalObject.estimatedSkyQuality = result;
    const status = documentObject.getElementById("skyq-auto-status");
    if (status) {
      const nearest = result.nearest
        ? ` · nächster Listenort: ${result.nearest.n} (${Math.round(result.distance)} km)`
        : "";
      status.textContent = `Automatisch: ${result.label} ${String(result.magnitude).replace(".", ",")}ᵐ · Standort-Näherung${nearest}`;
      status.title = "Vorläufige Schätzung aus der Entfernung zu Orten der eingebauten Liste; kein Messwert und noch keine Falchi-Atlas-Abfrage.";
    }
    return result;
  };
  globalObject.estimateSkyQuality = (lat, lng) => estimateSkyQuality(lat, lng, cities);
  globalObject.applyAutomaticSkyQuality = apply;
  return apply;
}
