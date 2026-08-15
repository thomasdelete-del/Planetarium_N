const EARTH_RADIUS_KM = 6371;

export function sqmToNelm(sqm) {
  if (!Number.isFinite(sqm) || sqm < 10 || sqm > 24) {
    throw new RangeError("SQM muss zwischen 10 und 24 mag/arcsec² liegen.");
  }
  return 7.93 - 5 * Math.log10(10 ** (4.316 - sqm / 5) + 1);
}

export function lightPollutionMapUrl(lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new TypeError("Für den Kartenlink sind gültige Koordinaten erforderlich.");
  }
  const query = new URLSearchParams({
    lat: lat.toFixed(6),
    lng: lng.toFixed(6),
    zoom: "10"
  });
  return `https://lightpollutionmap.app/de/?${query}`;
}

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
  let currentCoordinates = null;
  const input = documentObject.getElementById("skyq-sqm");
  const mapLink = documentObject.getElementById("skyq-map-link");

  const applySqm = (sqm) => {
    const limitingMagnitude = Math.max(1, Math.min(6.49, sqmToNelm(Number(sqm))));
    globalObject.setSkyQuality?.(limitingMagnitude, "sqm");
    globalObject.measuredSkyQuality = { sqm: Number(sqm), limitingMagnitude };
    const status = documentObject.getElementById("skyq-auto-status");
    if (status) {
      status.textContent = `SQM ${Number(sqm).toFixed(2).replace(".", ",")} mag/arcsec² · visuelle Grenzgröße ${limitingMagnitude.toFixed(2).replace(".", ",")}ᵐ`;
      status.title = "Aus dem SQM-Kartenwert berechnete visuelle Grenzgröße (NELM); der Kartenwert ist ein Modellwert und keine Messung vor Ort.";
    }
    return globalObject.measuredSkyQuality;
  };

  if (input) {
    input.addEventListener("input", () => {
      if (input.value === "") return;
      try {
        applySqm(Number(input.value));
        input.setCustomValidity("");
      } catch (error) {
        input.setCustomValidity(error.message);
        input.reportValidity?.();
      }
    });
  }

  const apply = (lat, lng) => {
    currentCoordinates = { lat, lng };
    if (mapLink) mapLink.href = lightPollutionMapUrl(lat, lng);
    if (input) input.value = "";
    const result = estimateSkyQuality(lat, lng, cities);
    globalObject.setSkyQuality?.(result.magnitude, "auto");
    globalObject.estimatedSkyQuality = result;
    const status = documentObject.getElementById("skyq-auto-status");
    if (status) {
      const nearest = result.nearest
        ? ` · nächster Listenort: ${result.nearest.n} (${Math.round(result.distance)} km)`
        : "";
      status.textContent = `Automatisch: ${result.label} ${String(result.magnitude).replace(".", ",")}ᵐ · Standort-Näherung${nearest}`;
      status.title = "Vorläufige Schätzung aus der Entfernung zu Orten der eingebauten Liste; für einen Kartenwert den Link öffnen und den dort angezeigten SQM-Wert eintragen.";
    }
    return result;
  };
  globalObject.estimateSkyQuality = (lat, lng) => estimateSkyQuality(lat, lng, cities);
  globalObject.applySqmSkyQuality = applySqm;
  globalObject.getLightPollutionMapUrl = () => currentCoordinates
    ? lightPollutionMapUrl(currentCoordinates.lat, currentCoordinates.lng)
    : null;
  globalObject.applyAutomaticSkyQuality = apply;
  return apply;
}
