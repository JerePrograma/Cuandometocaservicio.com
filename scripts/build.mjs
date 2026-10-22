import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "dist");
const files = [
  ["index.html", "index.html"],
  ["style.css", "style.css"],
  ["script.js", "script.js"],
  ["schedule.mjs", "schedule.mjs"],
  ["pdf.mjs", "pdf.mjs"],
  ["img/Logo_JerePrograma_500mp.png", "img/Logo_JerePrograma_500mp.png"],
  ["node_modules/fullcalendar/index.global.min.js", "vendor/fullcalendar-6.1.22.min.js"],
  ["node_modules/@fullcalendar/core/locales/es.global.min.js", "vendor/fullcalendar-es-6.1.22.min.js"],
  ["node_modules/html2canvas/dist/html2canvas.min.js", "vendor/html2canvas-1.4.1.min.js"],
  ["node_modules/jspdf/dist/jspdf.umd.min.js", "vendor/jspdf-4.2.1.min.js"],
  ["node_modules/fullcalendar/LICENSE.md", "vendor/LICENSE-fullcalendar.txt"],
  ["node_modules/@fullcalendar/core/LICENSE.md", "vendor/LICENSE-fullcalendar-core.txt"],
  ["node_modules/html2canvas/LICENSE", "vendor/LICENSE-html2canvas.txt"],
  ["node_modules/jspdf/LICENSE", "vendor/LICENSE-jspdf.txt"]
];
const hashes = {};
for (const [source, destination] of files) {
  const target = resolve(output, destination);
  await mkdir(dirname(target), { recursive: true });
  await copyFile(resolve(root, source), target);
  hashes[destination] = createHash("sha256").update(await readFile(target)).digest("hex");
}
const packageJson = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
let commit = process.env.SOURCE_COMMIT || null;
if (!commit) {
  try { commit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(); }
  catch { /* A source archive can be built without Git metadata. */ }
}
await writeFile(resolve(output, "deployment.json"), JSON.stringify({
  application: "calendario-servicios",
  basePath: "/calendario-servicios/",
  sourceCommit: commit,
  dependencies: packageJson.dependencies,
  files: hashes
}, null, 2) + "\n");
console.log(`Distribución pública preparada en dist: ${files.length + 1} archivos, sin dependencias de red en tiempo de ejecución.`);
