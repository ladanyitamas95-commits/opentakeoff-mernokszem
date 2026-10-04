import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));
const m0Mode = process.env.VITE_M0_DEMO === "1";

// M0 has no legitimate HTTP/XHR/WebSocket API traffic. App modules/assets use
// their own CSP directives; local plans are File/Blob bytes. Deny connect
// entirely so a missed JS guard cannot exfiltrate even to the same Railway host.
export const m0Csp = "default-src 'self'; connect-src 'none'; img-src 'self' data: blob:; media-src 'self' blob:; worker-src 'self' blob:; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-src 'none'; frame-ancestors 'none'; manifest-src 'self'";

const stub = (name) => fileURLToPath(new URL(`./src/lib/m0Stubs/${name}`, import.meta.url));
const CLOUD_STUB = stub("cloudDisabled.js");
const AGENT_STUB = stub("agentDisabled.js");
const VOICE_STUB = stub("voiceDisabled.js");

const m0DemoPrivacyPlugin = m0Mode ? {
  name: "m0-demo-privacy",
  enforce: "pre",
  resolveId(source) {
    const s = source.replaceAll("\\", "/");
    if (s.endsWith("/lib/google/auth.js")) return stub("googleAuth.js");
    if (s.endsWith("/lib/google/AuthContext.jsx")) return stub("googleAuthContext.jsx");
    if (s.endsWith("/lib/msgraph/config.js")) return stub("msgraphConfig.js");
    if (s.endsWith("/lib/fs/fsAccess.js")) return stub("fsAccess.js");

    // AI/agent/voice are outside the validated M0 scope. Replace them at module
    // resolution time so their provider endpoints, microphone path, model loader
    // and heavy STT runtime are physically absent from the emitted demo bundle.
    if (s.endsWith("/lib/ai.js")) return stub("aiDisabled.js");
    if (s.endsWith("/lib/agentTools.js") || s.endsWith("/lib/agentLoop.js")) return AGENT_STUB;
    if (
      s.endsWith("/lib/voiceActions") || s.endsWith("/lib/voiceActions.ts") ||
      s.endsWith("/lib/voiceRecognizerClient") || s.endsWith("/lib/voiceRecognizerClient.ts") ||
      s.endsWith("/lib/voiceCapture") || s.endsWith("/lib/voiceCapture.ts")
    ) return VOICE_STUB;
    if (s.endsWith("/components/AgentPanel.jsx") || s.endsWith("/components/AiSettings.jsx")) return stub("DisabledPanel.jsx");
    if (s.endsWith("/lib/scheduleScan.js")) return stub("scheduleScanDisabled.js");

    if (
      s.endsWith("/lib/google/drive.js") ||
      s.endsWith("/lib/cloudStore.js") ||
      s.endsWith("/lib/sync/composite.js") ||
      s.endsWith("/lib/msgraph/auth.js") ||
      s.endsWith("/lib/msgraph/graphDrive.js") ||
      s.endsWith("/lib/msgraph/composite.js")
    ) return CLOUD_STUB;
    return null;
  },
  transformIndexHtml(html) {
    let out = html
      .replace('<html lang="en">', '<html lang="hu">')
      .replace('/src/main.jsx', '/src/main.m0.jsx')
      .replace(/\s*<link rel="canonical"[^>]*>\s*/g, "\n")
      .replace(/\s*<meta property="og:[^>]*>\s*/g, "\n")
      .replace(/\s*<meta name="twitter:[^>]*>\s*/g, "\n")
      .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, "\n")
      .replace(/\s*<script[^>]+static\.cloudflareinsights\.com[^>]*><\/script>\s*/g, "\n")
      .replace(/<title>[\s\S]*?<\/title>/, "<title>MérnökSzem M0 – Tervmérés</title>")
      .replace(/<meta name="description"[^>]*>/, '<meta name="description" content="MérnökSzem M0 – helyi, adatvédelmi Tervmérés demo." />');

    const privacyMeta = [
      `<meta http-equiv="Content-Security-Policy" content="${m0Csp}" />`,
      '<meta name="referrer" content="no-referrer" />',
    ].join("\n    ");
    out = out.replace("</head>", `    ${privacyMeta}\n  </head>`);
    return out;
  },
  transform(code, id) {
    const normalized = id.replaceAll("\\", "/");
    if (!normalized.endsWith("/src/styles/tokens.css")) return null;
    return code.replace(/^@import\s+url\(['"]?https:\/\/fonts\.googleapis\.com\/[^\n]+\n?/m, "");
  },
} : null;

const m0Headers = m0Mode ? {
  "Content-Security-Policy": m0Csp,
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "geolocation=(), camera=(), microphone=(), payment=(), usb=(), serial=(), bluetooth=(), clipboard-read=()",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Cache-Control": "no-store",
} : undefined;

export default defineConfig({
  preview: {
    host: "0.0.0.0",
    port: 4173,
    strictPort: true,
    allowedHosts: [".up.railway.app", ".railway.internal", "localhost"],
    headers: m0Headers,
  },
  plugins: [react(), ...(m0DemoPrivacyPlugin ? [m0DemoPrivacyPlugin] : [])],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  worker: { format: "es" },
  server: {
    port: 5173,
    proxy: m0Mode ? {} : {
      "/ai": {
        target: "http://localhost:8000",
        headers: process.env.OT_SANDBOX_API_KEY
          ? { "X-API-Key": process.env.OT_SANDBOX_API_KEY }
          : {},
      },
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
