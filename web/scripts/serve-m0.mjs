import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const CSP = "default-src 'self'; connect-src 'none'; img-src 'self' data: blob:; media-src 'self' blob:; worker-src 'self' blob:; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-src 'none'; frame-ancestors 'none'; manifest-src 'self'";
export const SECURITY_HEADERS = Object.freeze({
  "Content-Security-Policy": CSP,
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "geolocation=(), camera=(), microphone=(), payment=(), usb=(), serial=(), bluetooth=(), clipboard-read=()",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-DNS-Prefetch-Control": "off",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Strict-Transport-Security": "max-age=31536000",
  "Cache-Control": "no-store",
});

const ROOT = resolve(fileURLToPath(new URL("../dist/", import.meta.url)));
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || "0.0.0.0";
const MIME = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
  [".wasm", "application/wasm"],
  [".pdf", "application/pdf"],
]);

function headers(extra = {}) { return { ...SECURITY_HEADERS, ...extra }; }
function safePath(pathname) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { return null; }
  const target = resolve(ROOT, `.${decoded}`);
  return target === ROOT || target.startsWith(ROOT + sep) ? target : null;
}

async function existingFile(path) {
  try { return (await stat(path)).isFile(); } catch { return false; }
}

export const server = createServer(async (req, res) => {
  // M0 is a static, local-first demo. No server API or upload endpoint exists.
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, headers({ Allow: "GET, HEAD", "Content-Type": "text/plain; charset=utf-8" }));
    res.end("Method Not Allowed");
    return;
  }

  const host = req.headers.host || "localhost";
  let url;
  try { url = new URL(req.url || "/", `https://${host}`); } catch {
    res.writeHead(400, headers()); res.end(); return;
  }
  let target = safePath(url.pathname === "/" ? "/index.html" : url.pathname);
  if (!target) { res.writeHead(400, headers()); res.end(); return; }

  if (!(await existingFile(target))) {
    const acceptsHtml = String(req.headers.accept || "").includes("text/html");
    if (!acceptsHtml) { res.writeHead(404, headers()); res.end(); return; }
    target = resolve(ROOT, "index.html");
  }

  try {
    const body = await readFile(target);
    const type = MIME.get(extname(target).toLowerCase()) || "application/octet-stream";
    res.writeHead(200, headers({ "Content-Type": type, "Content-Length": String(body.length) }));
    if (req.method === "HEAD") res.end(); else res.end(body);
  } catch {
    res.writeHead(404, headers());
    res.end();
  }
});

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  server.listen(PORT, HOST, () => console.log(`M0 static server listening on ${HOST}:${PORT}`));
}
