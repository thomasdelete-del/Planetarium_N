import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const indexPath = path.join(root, "index.html");
const source = fs.readFileSync(indexPath, "utf8");
const startMarker = '<div class="history-card">';
const endMarker = '    <div class="history-grid">';
const heading = source.indexOf('<h2>Änderungshistorie Version 11</h2>');
const start = source.lastIndexOf(startMarker, heading);
const end = source.indexOf(endMarker, start);
if (start < 0 || end < 0) {
  console.log("Änderungshistorie ist bereits ausgelagert.");
  process.exit(0);
}

const history = source.slice(start, end).trim();
const replacement = `    <div class="history-card">
      <h2>Änderungshistorie</h2>
      <p>Der ausführliche Versionsverlauf wurde aus der Startseite ausgelagert.</p>
      <p><a href="./changelog.html">Änderungshistorie öffnen</a></p>
    </div>\n\n`;
fs.writeFileSync(indexPath, source.slice(0, start) + replacement + source.slice(end));

const document = `<!doctype html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Planetarium · Änderungshistorie</title>
  <link rel="stylesheet" href="./src/styles/legacy.css">
</head>
<body class="history-standalone">
  <main id="history-body">
    <p><a href="./index.html">← Zurück zum Planetarium</a></p>
${history}
  </main>
</body>
</html>\n`;
fs.writeFileSync(path.join(root, "changelog.html"), document);
console.log("Änderungshistorie nach changelog.html ausgelagert.");
