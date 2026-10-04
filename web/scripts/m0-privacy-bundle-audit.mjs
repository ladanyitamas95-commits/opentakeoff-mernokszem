import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../dist/", import.meta.url));
const textExt = new Set([".html", ".js", ".mjs", ".css", ".json", ".svg"]);
const forbidden = [
  "static.cloudflareinsights.com",
  "cloudflareinsights.com",
  "accounts.google.com",
  "googleapis.com",
  "graph.microsoft.com",
  "login.microsoftonline.com",
  "api.openai.com",
  "api.anthropic.com",
  "sentry.io",
  "supabase.co",
];
const forbiddenFileNames = [/graphDrive/i, /cloudStore/i];
const failures = [];
let filesScanned = 0;

async function walk(dir) {
  for (const ent of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) { await walk(p); continue; }
    const rel = relative(root, p);
    for (const rx of forbiddenFileNames) if (rx.test(rel)) failures.push(`${rel}: forbidden cloud chunk name (${rx})`);
    if (!textExt.has(extname(ent.name))) continue;
    filesScanned++;
    const text = await readFile(p, "utf8");
    for (const token of forbidden) {
      if (text.toLowerCase().includes(token.toLowerCase())) failures.push(`${rel}: forbidden remote endpoint token ${token}`);
    }
  }
}

await walk(root);
const index = await readFile(join(root, "index.html"), "utf8");
if (!/connect-src\s+'none'/.test(index)) failures.push("index.html: M0 CSP must contain connect-src 'none'");
if (!/<meta\s+name=["']referrer["']\s+content=["']no-referrer["']/i.test(index)) failures.push("index.html: no-referrer policy is missing");
if (/<script[^>]+src=["']https?:\/\//i.test(index)) failures.push("index.html: external script src survived M0 transform");
if (/\/src\/main\.jsx/.test(index)) failures.push("index.html: generic cloud-capable entrypoint survived M0 build");
if (!/MérnökSzem M0/.test(index)) failures.push("index.html: M0-branded entrypoint marker missing");

if (failures.length) {
  console.error("M0 PRIVACY BUNDLE AUDIT FAILED");
  for (const f of failures) console.error(` - ${f}`);
  process.exit(1);
}
console.log(`M0 privacy bundle audit PASS (${filesScanned} text assets scanned; no forbidden external endpoints/cloud chunks).`);
