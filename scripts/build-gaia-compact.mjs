import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { compactGaiaCatalog } from "../src/gaia/compact.js";

const root = process.cwd();
const core = fs.readFileSync(path.join(root, "src", "legacy", "01-core.js"), "utf8");
const start = core.indexOf("const STARS=[");
const end = core.indexOf("];const LINES=", start);
if (start < 0 || end < 0) throw new Error("STARS-Katalog im Legacy-Kern nicht gefunden");
const literal = core.slice(start + "const STARS=".length, end + 1);
const namedStars = vm.runInNewContext(literal, Object.create(null));
const input = fs.readFileSync(path.join(root, "gaia_merged.bin"));
const source = input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength);
/* Stufen passend zum 70-mm-Teleskopmodell. Die feinen Stufen oberhalb 10 mag
   verhindern, dass bei etwa 5x bereits der gesamte Tiefenkatalog geladen wird. */
const stages = [6.5, 8, 10, 10.5, 11, 11.5];
const outputDirectory = path.join(root, "gaia");
fs.mkdirSync(outputDirectory, { recursive: true });
for (const file of fs.readdirSync(outputDirectory)) {
  if (/^gaia_\d+(?:_\d+)?\.bin$/.test(file)) fs.unlinkSync(path.join(outputDirectory, file));
}
const manifest = { version: 3, strategy: "cumulative", stages: [] };
for (const magnitude of stages) {
  const result = compactGaiaCatalog(source, 48, 24, namedStars, { maxMagnitude: magnitude });
  if (!result.count || manifest.stages.at(-1)?.count === result.count) continue;
  const file = `gaia_${String(magnitude).replace(".", "_")}.bin`;
  fs.writeFileSync(path.join(outputDirectory, file), new Uint8Array(result.buffer));
  manifest.stages.push({ magnitude, file: `gaia/${file}`, count: result.count, bytes: result.buffer.byteLength });
  console.log(`Gaia bis ${magnitude} mag: ${result.count.toLocaleString("de-DE")} Sterne.`);
}
const deepest = manifest.stages.at(-1);
if (deepest) fs.copyFileSync(path.join(root, deepest.file), path.join(root, "gaia_compact.bin"));
fs.writeFileSync(path.join(outputDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
