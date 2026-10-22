import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";

const output = resolve(dirname(fileURLToPath(import.meta.url)), "../dist");
const manifest = JSON.parse(readFileSync(resolve(output, "deployment.json"), "utf8"));
const allowed = new Set([...Object.keys(manifest.files), "deployment.json"]);
const walk = directory => readdirSync(directory).flatMap(name => {
  const path = resolve(directory, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});
for (const file of walk(output)) {
  const relative = file.slice(output.length + 1).split(sep).join("/");
  assert.ok(allowed.has(relative), `Archivo fuera de la distribución permitida: ${relative}`);
  if (manifest.files[relative]) {
    assert.equal(createHash("sha256").update(readFileSync(file)).digest("hex"), manifest.files[relative], `Hash incorrecto: ${relative}`);
  }
}
const html = readFileSync(resolve(output, "index.html"), "utf8");
assert.match(html, /lang="es-AR"/);
assert.doesNotMatch(html, /googletagmanager|googlesyndication|adsbygoogle|gtag\(|cvuInput|aliasInput|mailto:/i);
for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
  const ref = match[1];
  if (/^https:\/\//.test(ref)) continue;
  assert.ok(!/^[a-z]+:/i.test(ref) && !ref.startsWith("/"), `Recurso no relativo: ${ref}`);
  assert.ok(existsSync(resolve(output, ref)), `Recurso ausente: ${ref}`);
}
for (const match of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)) {
  assert.ok(!/^https?:/.test(match[1]), "Los scripts deben servirse localmente.");
}
console.log("OK: distribución permitida, hashes, recursos relativos y ausencia de publicidad o datos de donación.");
