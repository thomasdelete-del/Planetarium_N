import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const references = [...new Set(
  [...html.matchAll(/(?:src|href)="(?:\.\/)?([^:"?#]+)(?:[?#][^"]*)?"/g)].map((match) => match[1])
)];
const missing = references.filter((file) => !fs.existsSync(path.join(root, file)));

if (missing.length) throw new Error(`Fehlende lokale Dateien: ${missing.join(", ")}`);
if (/(?:src|href)="\/(?!\/)/.test(html)) {
  throw new Error("Lokale Ressourcen müssen für GitHub Pages relative Pfade verwenden.");
}

const gaiaPath = path.join(root, "gaia_merged.bin");
const gaiaHeader = Buffer.alloc(16);
const gaiaFile = fs.openSync(gaiaPath, "r");
try {
  fs.readSync(gaiaFile, gaiaHeader, 0, gaiaHeader.length, 0);
} finally {
  fs.closeSync(gaiaFile);
}
const gaiaVersion = gaiaHeader.readUInt32LE(4);
const gaiaRecordCount = gaiaHeader.readUInt32LE(8);
const gaiaExpectedSize = 16 + gaiaRecordCount * 36;
const gaiaActualSize = fs.statSync(gaiaPath).size;
if (gaiaHeader.toString("ascii", 0, 4) !== "GDR3" || gaiaVersion !== 1) {
  throw new Error("Gaia-Katalog besitzt keine unterstützte GDR3-Kennung oder Formatversion.");
}
if (gaiaActualSize !== gaiaExpectedSize) {
  throw new Error(`Gaia-Katalog ist unvollständig: ${gaiaActualSize} statt ${gaiaExpectedSize} Byte.`);
}
if ((html.match(/<script\b/g) || []).length !== 15) {
  throw new Error("Es werden 14 Legacy-Skripte und ein Modul-Bootstrap erwartet.");
}
if (/onclick="[^"]*\b(?:jumpScene|selectScene)\(/.test(html)) {
  throw new Error("HTML darf keinen Szenen-Dispatcher direkt aufrufen.");
}
if (/\son[a-z]+\s*=/i.test(html)) {
  throw new Error("HTML darf keine Inline-Ereignishandler enthalten.");
}

const htmlIds = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const duplicateIds = [...new Set(htmlIds.filter((id, index) => htmlIds.indexOf(id) !== index))];
if (duplicateIds.length) {
  throw new Error(`Doppelte HTML-IDs: ${duplicateIds.join(", ")}`);
}
for (const legacyNavigation of ["scrollToSky", "toggleLegend", "scrollToGuide"]) {
  if (new RegExp(`onclick="${legacyNavigation}\\(\\)"`).test(html)) {
    throw new Error(`Navigation ${legacyNavigation} muss data-action verwenden.`);
  }
}
const actualSceneButtons = [...html.matchAll(/<button\b[^>]*\bdata-scene-id="([^"]+)"/g)];
if (actualSceneButtons.length !== 52) {
  throw new Error(`52 echte Szenenbuttons erwartet, gefunden: ${actualSceneButtons.length}`);
}

for (const file of fs.readdirSync(path.join(root, "src", "legacy"))) {
  if (!file.endsWith(".js")) continue;
  const source = fs.readFileSync(path.join(root, "src", "legacy", file), "utf8");
  new vm.Script(source, { filename: file });
}

function listJavaScriptFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return listJavaScriptFiles(absolute);
    return entry.isFile() && entry.name.endsWith(".js") ? [absolute] : [];
  });
}

const missingModuleImports = [];
let moduleImportCount = 0;
for (const file of listJavaScriptFiles(path.join(root, "src"))) {
  const source = fs.readFileSync(file, "utf8");
  const specifiers = [
    ...source.matchAll(/\b(?:import|export)\s+(?:[^"']*?\s+from\s+)?["'](\.[^"']+)["']/g)
  ].map((match) => match[1]);
  for (const specifier of specifiers) {
    moduleImportCount += 1;
    const target = path.resolve(path.dirname(file), specifier);
    if (!fs.existsSync(target)) {
      missingModuleImports.push(`${path.relative(root, file)} -> ${specifier}`);
    }
  }
}
if (missingModuleImports.length) {
  throw new Error(`Fehlende Modulimporte: ${missingModuleImports.join(", ")}`);
}

const didacticFocus = fs.readFileSync(
  path.join(root, "src", "legacy", "14-didactic-focus.js"),
  "utf8"
);
if (/\.jump-btn\[onclick\]/.test(didacticFocus)) {
  throw new Error("Didaktik-Rücksprung muss Szenen über data-scene-id finden.");
}
if (/\beval\s*\(|\(\s*0\s*,\s*eval\s*\)/.test(didacticFocus)) {
  throw new Error("Das Didaktik-Modul darf eval() nicht verwenden.");
}

for (const migrated of [
  "02-didactic-orbits.js",
  "08-solar-year.js",
  "09-precession-simulation.js",
  "11-precession-polaris.js",
  "12-didactic-navigation.js",
  "13-precession-labels.js",
  "14-didactic-focus.js"
]) {
  const source = fs.readFileSync(path.join(root, "src", "legacy", migrated), "utf8");
  if (/\b(?:oldDraw|oldDrawTrail)\b|\bdraw\s*=\s*function|\bwindow\.draw\s*=(?!=)/.test(source)) {
    throw new Error(`${migrated} darf draw() nicht mehr ersetzen.`);
  }
}

console.log(
  `Projektprüfung erfolgreich: ${references.length} lokale Referenzen, ` +
  `${moduleImportCount} Modulimporte, ${htmlIds.length} eindeutige HTML-IDs, ` +
  `14 Legacy-Skripte, Gaia DR3 mit ${gaiaRecordCount.toLocaleString("de-DE")} Datensätzen, ` +
  "keine Inline-Handler."
);
