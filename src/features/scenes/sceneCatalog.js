const define = (id, category, title) => Object.freeze({ id, category, title });

/**
 * Zentrale Inventarliste aller aus der Oberfläche direkt erreichbaren Szenen.
 * Fachliche Parameter werden schrittweise ergänzt, sobald die jeweiligen
 * Dispatcher aus dem Legacy-Code extrahiert werden.
 */
export const sceneCatalog = Object.freeze([
  define("current", "general", "Aktueller Himmel"),

  define("obs-equator-spring", "observer", "Äquator zum Frühlingsanfang"),
  define("obs-tropic-spring", "observer", "Nördlicher Wendekreis"),
  define("obs-arctic-spring", "observer", "Nördlicher Polarkreis"),
  define("obs-northpole-spring", "observer", "Nordpol zum Frühlingsanfang"),
  define("obs-northpole-summer", "observer", "Nordpol im Sommer"),
  define("obs-northpole-winter", "observer", "Nordpol im Winter"),
  define("obs-southpole-northsummer", "observer", "Südpol im Nordsommer"),
  define("spring-equinox", "season", "Frühlingsanfang"),
  define("summer-solstice", "season", "Sommeranfang"),
  define("autumn-equinox", "season", "Herbstanfang"),
  define("winter-solstice", "season", "Winteranfang"),
  define("midnight-sun", "season", "Mitternachtssonne"),
  define("polar-night", "season", "Polarnacht"),

  define("solar-eclipse", "eclipse", "Nächste Sonnenfinsternis"),
  define("solar-eclipse-prev", "eclipse", "Vorherige Sonnenfinsternis"),
  define("lunar-eclipse", "eclipse", "Nächste Mondfinsternis"),
  define("lunar-eclipse-prev", "eclipse", "Vorherige Mondfinsternis"),
  define("eclipse-2026-spain", "eclipse", "Sonnenfinsternis Spanien 2026"),

  define("new-moon", "moon", "Neumond"),
  define("first-quarter", "moon", "Erstes Viertel"),
  define("full-moon", "moon", "Vollmond"),
  define("last-quarter", "moon", "Letztes Viertel"),

  define("sim-daily-rotation", "simulation", "Tagesdrehung"),
  define("sim-moon-phases", "simulation", "Mondphasenlauf"),
  define("sim-planet-run", "simulation", "Planetenlauf"),
  define("sim-precession", "simulation", "Präzessionslauf"),
  define("sim-polar-day", "simulation", "Polartag-Simulation"),
  define("sim-seasons", "simulation", "Sonnenjahr"),

  define("prec-year-1", "precession", "Jahr 1"),
  define("prec-today", "precession", "Präzession heute"),
  define("prec-6000", "precession", "Jahr 6000"),
  define("prec-vega", "precession", "Jahr 12000"),
  define("prec-cycle", "precession", "Jahr 26000"),

  define("orion", "constellation", "Orion"),
  define("ursa-major", "constellation", "Großer Wagen"),
  define("cassiopeia", "constellation", "Kassiopeia"),
  define("scorpius", "constellation", "Skorpion"),
  define("milky-way-center", "constellation", "Milchstraßenzentrum"),
  define("widder", "constellation", "Widder"),
  define("stier", "constellation", "Stier"),
  define("zwillinge", "constellation", "Zwillinge"),
  define("loewe", "constellation", "Löwe"),
  define("jungfrau", "constellation", "Jungfrau"),
  define("schuetze", "constellation", "Schütze"),

  define("planet-merkur", "planet", "Merkur"),
  define("planet-venus", "planet", "Venus"),
  define("planet-mars", "planet", "Mars"),
  define("planet-jupiter", "planet", "Jupiter"),
  define("planet-saturn", "planet", "Saturn"),
  define("planet-uranus", "planet", "Uranus"),
  define("planet-neptun", "planet", "Neptun")
]);

const scenesById = new Map();
const scenesByCategory = new Map();
for (const scene of sceneCatalog) {
  if (scenesById.has(scene.id)) throw new Error(`Doppelte Szenen-ID: ${scene.id}`);
  scenesById.set(scene.id, scene);
  const categoryScenes = scenesByCategory.get(scene.category) ?? [];
  categoryScenes.push(scene);
  scenesByCategory.set(scene.category, categoryScenes);
}
for (const [category, scenes] of scenesByCategory) {
  scenesByCategory.set(category, Object.freeze(scenes));
}

const emptyScenes = Object.freeze([]);
export const sceneCategories = Object.freeze([...scenesByCategory.keys()]);

export function getScene(id) {
  return scenesById.get(id) ?? null;
}

export function getScenesByCategory(category) {
  return scenesByCategory.get(category) ?? emptyScenes;
}

export function hasScene(id) {
  return scenesById.has(id);
}
