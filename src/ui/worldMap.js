const LAND_DATA_URL = "./assets/ne_110m_land.geojson";

function project(longitude, latitude, width, height) {
  return [(longitude + 180) / 360 * width, (90 - latitude) / 180 * height];
}

function drawGeometry(context, geometry, width, height) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  for (const rings of polygons) {
    context.beginPath();
    for (const points of rings) {
      points.forEach((point, index) => {
        const [x, y] = project(point[0], point[1], width, height);
        if (index) context.lineTo(x, y); else context.moveTo(x, y);
      });
      context.closePath();
    }
    context.fill("evenodd");
    context.stroke();
  }
}

export function createWorldMap({ canvas, hint, loadLand, getLocation, getSkyQuality, onLocationSelected }) {
  if (!canvas) throw new TypeError("Für die Weltkarte wird ein Canvas benötigt.");
  const context = canvas.getContext("2d");
  let land = null;

  const draw = () => {
    const width = canvas.width = 800;
    const height = canvas.height = 400;
    const ocean = context.createLinearGradient(0, 0, 0, height);
    ocean.addColorStop(0, "#0b2945");
    ocean.addColorStop(1, "#061526");
    context.fillStyle = ocean;
    context.fillRect(0, 0, width, height);

    context.lineWidth = 1;
    context.strokeStyle = "rgba(150,205,230,.18)";
    for (let longitude = -150; longitude <= 150; longitude += 30) {
      const [x] = project(longitude, 0, width, height);
      context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height); context.stroke();
    }
    for (let latitude = -60; latitude <= 60; latitude += 30) {
      const [, y] = project(0, latitude, width, height);
      context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke();
    }

    if (land) {
      context.fillStyle = "#294f43";
      context.strokeStyle = "#75a887";
      context.lineWidth = 1.4;
      land.features.forEach(({ geometry }) => drawGeometry(context, geometry, width, height));
    } else {
      context.fillStyle = "rgba(225,244,255,.7)";
      context.font = "600 16px Inter,system-ui,sans-serif";
      context.textAlign = "center";
      context.fillText("Küstenlinien werden geladen …", width / 2, height / 2);
    }

    const [, equator] = project(0, 0, width, height);
    context.strokeStyle = "rgba(245,198,92,.55)";
    context.setLineDash([8, 6]);
    context.beginPath(); context.moveTo(0, equator); context.lineTo(width, equator); context.stroke();
    context.setLineDash([]);

    const { lat, lng } = getLocation();
    const [x, y] = project(lng, lat, width, height);
    context.strokeStyle = "#fff";
    context.fillStyle = "#ffd86b";
    context.lineWidth = 2.5;
    context.beginPath(); context.arc(x, y, 8, 0, Math.PI * 2); context.fill(); context.stroke();
    context.beginPath(); context.moveTo(x - 14, y); context.lineTo(x + 14, y); context.moveTo(x, y - 14); context.lineTo(x, y + 14); context.stroke();

    if (hint) {
      const northSouth = lat >= 0 ? "N" : "S";
      const eastWest = lng >= 0 ? "O" : "W";
      hint.textContent = `Ausgewählt: ${Math.abs(lat).toFixed(2)}° ${northSouth} · ${Math.abs(lng).toFixed(2)}° ${eastWest} · Himmel: ${getSkyQuality()?.label ?? "wird bestimmt"}`;
    }
  };

  canvas.addEventListener("click", () => {
    onLocationSelected(getLocation());
    draw();
  });

  loadLand().then((data) => {
    land = data;
    draw();
  }).catch(() => {
    if (hint) hint.textContent = "Kartendaten konnten nicht geladen werden";
  });

  return Object.freeze({ draw });
}

export function bindWorldMap({ documentObject = document, globalObject = window, fetchObject = fetch } = {}) {
  const canvas = documentObject.getElementById("worldmap");
  if (!canvas) return null;
  const map = createWorldMap({
    canvas,
    hint: documentObject.getElementById("map-hint"),
    loadLand: async () => {
      const response = await fetchObject(LAND_DATA_URL);
      if (!response.ok) throw new Error("Natural-Earth-Daten nicht geladen");
      return response.json();
    },
    getLocation: () => globalObject.getPlanetariumMapLocation?.() ?? { lat: 48, lng: 11.6 },
    getSkyQuality: () => globalObject.estimatedSkyQuality,
    onLocationSelected: ({ lat, lng }) => globalObject.setCurrentGeo?.(lat, lng, "Kartenstandort", "map", false)
  });
  globalObject.drawWorldMap = map.draw;
  return map;
}
