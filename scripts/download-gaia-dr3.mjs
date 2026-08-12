import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const cacheDirectory = path.join(root, ".gaia-cache");
const outputPath = path.join(root, "gaia_merged.bin");
const endpoint = process.env.GAIA_TAP_URL || "https://gea.esac.esa.int/tap-server/tap/sync";
const magnitude = Number(process.argv[2] || 10);
const tileWidth = 2;
const declinationHeight = 30;
const raTileCount = 360 / tileWidth;
const declinationTileCount = 180 / declinationHeight;
const tileCount = raTileCount * declinationTileCount;
/* GDR3 v2: bisherige Photometrie plus Parallaxe und Standardfehler.
   Ungueltige oder nicht vorhandene Astrometrie wird als NaN gespeichert. */
const recordSize = 44;
const headerSize = 16;

if (!Number.isFinite(magnitude) || magnitude < 3 || magnitude > 13) {
  throw new Error("Grenzhelligkeit muss zwischen 3 und 13 mag liegen");
}

fs.mkdirSync(cacheDirectory, { recursive: true });

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

function parseCsv(text) {
  if (/^\s*<\?xml|^\s*<VOTABLE/i.test(text)) {
    const decode = value => value
      .replaceAll("&lt;", "<").replaceAll("&gt;", ">")
      .replaceAll("&amp;", "&").replaceAll("&quot;", '"').trim();
    const rows = [];
    for (const match of text.matchAll(/<TR>([\s\S]*?)<\/TR>/gi)) {
      const values = [...match[1].matchAll(/<TD>([\s\S]*?)<\/TD>/gi)].map(cell => decode(cell[1]));
      if (values.length < 8) continue;
      const row = {
        sourceId: values[0], ra: Number(values[1]), dec: Number(values[2]), g: Number(values[3]),
        bp: Number(values[4]) || 0, rp: Number(values[5]) || 0,
        parallax: values[6] === "" ? NaN : Number(values[6]),
        parallaxError: values[7] === "" ? NaN : Number(values[7])
      };
      if (row.sourceId && Number.isFinite(row.ra + row.dec + row.g)) rows.push(row);
    }
    return rows;
  }
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines.shift().split(",").map(value => value.replaceAll('"', "").trim());
  const column = Object.fromEntries(header.map((name, index) => [name, index]));
  const required = ["source_id", "ra", "dec", "phot_g_mean_mag"];
  for (const name of required) if (!(name in column)) throw new Error(`Gaia-Spalte fehlt: ${name}`);
  return lines.filter(Boolean).map(line => {
    const values = line.split(",").map(value => value.replaceAll('"', "").trim());
    return {
      sourceId: values[column.source_id],
      ra: Number(values[column.ra]),
      dec: Number(values[column.dec]),
      g: Number(values[column.phot_g_mean_mag]),
      bp: Number(values[column.phot_bp_mean_mag]) || 0,
      rp: Number(values[column.phot_rp_mean_mag]) || 0,
      parallax: values[column.parallax] === "" ? NaN : Number(values[column.parallax]),
      parallaxError: values[column.parallax_error] === "" ? NaN : Number(values[column.parallax_error])
    };
  }).filter(row => row.sourceId && Number.isFinite(row.ra + row.dec + row.g));
}

async function downloadTile(index) {
  const raIndex = index % raTileCount;
  const declinationIndex = Math.floor(index / raTileCount);
  const minimumRa = raIndex * tileWidth;
  const maximumRa = minimumRa + tileWidth;
  const minimumDeclination = -90 + declinationIndex * declinationHeight;
  const maximumDeclination = minimumDeclination + declinationHeight;
  const query = `SELECT source_id,ra,dec,phot_g_mean_mag,phot_bp_mean_mag,phot_rp_mean_mag,parallax,parallax_error `
    + `FROM gaiadr3.gaia_source WHERE phot_g_mean_mag<=${magnitude.toFixed(4)} `
    + `AND ra>=${minimumRa.toFixed(4)} AND ra<${maximumRa.toFixed(4)} `
    + `AND dec>=${minimumDeclination.toFixed(4)} AND dec<${maximumDeclination.toFixed(4)}`;
  const body = new URLSearchParams({ REQUEST: "doQuery", LANG: "ADQL", FORMAT: "csv", QUERY: query });
  let lastError;
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    try {
      const response = await fetch(endpoint, { method: "POST", body, signal: AbortSignal.timeout(45000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const rows = parseCsv(await response.text());
      if (!rows.length) throw new Error("leere Gaia-Antwort");
      return rows;
    } catch (error) {
      lastError = error;
      if (attempt < 6) await sleep(1500 * attempt);
    }
  }
  throw new Error(`Bereich ${index + 1}/${tileCount}: ${lastError?.message || lastError}`);
}

async function fetchAndCache(index) {
  /* Eigener Cache-Schluessel: alte Kacheln enthalten keine Parallaxen. */
  const tilePath = path.join(cacheDirectory, `g${String(magnitude).replace(".", "_")}p-${String(index).padStart(3, "0")}.json`);
  if (!fs.existsSync(tilePath)) {
    const rows = await downloadTile(index);
    fs.writeFileSync(tilePath, JSON.stringify(rows));
  }
  const rows = JSON.parse(fs.readFileSync(tilePath, "utf8"));
  console.log(`Gaia ${index + 1}/${tileCount}: ${rows.length.toLocaleString("de-DE")} Sterne`);
}

let nextTile = 0;
async function worker() {
  while (nextTile < tileCount) {
    const index = nextTile++;
    await fetchAndCache(index);
  }
}
await Promise.all(Array.from({ length: 6 }, () => worker()));

const tiles = [];
let count = 0;
for (let index = 0; index < tileCount; index += 1) {
  const tilePath = path.join(cacheDirectory, `g${String(magnitude).replace(".", "_")}p-${String(index).padStart(3, "0")}.json`);
  const rows = JSON.parse(fs.readFileSync(tilePath, "utf8"));
  tiles.push(rows); count += rows.length;
}

const output = new ArrayBuffer(headerSize + count * recordSize);
const view = new DataView(output);
new Uint8Array(output, 0, 4).set([71, 68, 82, 51]);
view.setUint32(4, 2, true);
view.setBigUint64(8, BigInt(count), true);
let offset = headerSize;
for (const rows of tiles) for (const row of rows) {
  view.setBigInt64(offset, BigInt(row.sourceId), true);
  view.setFloat64(offset + 8, row.ra, true);
  view.setFloat64(offset + 16, row.dec, true);
  view.setFloat32(offset + 24, row.g, true);
  view.setFloat32(offset + 28, row.bp, true);
  view.setFloat32(offset + 32, row.rp, true);
  view.setFloat32(offset + 36, Number.isFinite(row.parallax) ? row.parallax : NaN, true);
  view.setFloat32(offset + 40, Number.isFinite(row.parallaxError) ? row.parallaxError : NaN, true);
  offset += recordSize;
}
fs.writeFileSync(outputPath, new Uint8Array(output));
console.log(`Fertig: ${count.toLocaleString("de-DE")} Gaia-DR3-Sterne bis ${magnitude} mag.`);
