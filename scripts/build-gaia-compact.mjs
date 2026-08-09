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
const result = compactGaiaCatalog(source, 48, 24, namedStars);
fs.writeFileSync(path.join(root, "gaia_compact.bin"), new Uint8Array(result.buffer));
console.log(`Gaia kompakt: ${result.count.toLocaleString("de-DE")} Sterne, ${result.duplicateCount} Dubletten entfernt.`);
