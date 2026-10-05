import { PDFDocument, PDFName, PDFDict } from "pdf-lib";
import { m0DemoEnabled, clearM0LocalProjectData } from "./m0Demo.js";
import { localStore } from "./store.js";

const SAFE_PROTOCOLS = new Set(["blob:", "data:"]);
const SAFE_METHODS = new Set(["GET", "HEAD"]);
const PRIVACY_SCHEMA_KEY = "m0_privacy_schema";
const NAME_SECRET_KEY = "opentakeoff_m0_name_secret_v1";
// v4 adds stable HMAC-pseudonymous filenames + stricter stream-dictionary
// cleanup and input bounds. Purge older local records once before re-import.
const PRIVACY_SCHEMA = "4";
export const M0_MAX_PDF_BYTES = 150 * 1024 * 1024;
export const M0_MAX_PDF_PAGES = 500;

function baseUrl(origin) {
  return origin || (typeof window !== "undefined" ? window.location.href : "https://m0.invalid/");
}

function asUrl(value, origin) {
  if (typeof Request !== "undefined" && value instanceof Request) return new URL(value.url, baseUrl(origin));
  return new URL(String(value), baseUrl(origin));
}

function requestMethod(value, init = {}) {
  const fromInit = init?.method;
  if (fromInit) return String(fromInit).toUpperCase();
  if (typeof Request !== "undefined" && value instanceof Request) return String(value.method || "GET").toUpperCase();
  return "GET";
}

export function isAllowedM0Request(value, init = {}, origin) {
  try {
    const u = asUrl(value, origin);
    const method = requestMethod(value, init);
    return SAFE_METHODS.has(method) && SAFE_PROTOCOLS.has(u.protocol);
  } catch {
    return false;
  }
}

export function isM0AllowedNetworkTarget(value, init = {}) {
  if (!m0DemoEnabled()) return true;
  return isAllowedM0Request(value, init);
}

function privacyError(target) {
  let shown = "ismeretlen cél";
  try { shown = asUrl(target).origin; } catch { /* ignore */ }
  return new Error(`Az M0 adatvédelmi mód blokkolta a hálózati kapcsolatot: ${shown}`);
}

function bytesToHex(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
function hexToBytes(hex) {
  if (!/^[0-9a-f]{64}$/i.test(hex || "")) return null;
  return new Uint8Array(hex.match(/../g).map((x) => Number.parseInt(x, 16)));
}

export function neutralPdfName() {
  const id = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `Tervlap-${id.slice(0, 12)}.pdf`;
}

/** Stable per-browser pseudonym for an original filename. HMAC prevents the
 * original name from being stored while preserving upstream same-name revision
 * grouping. Different browsers intentionally derive different pseudonyms. */
export async function pseudonymousPdfName(sourceName, secretBytes) {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) return neutralPdfName();
  const key = await subtle.importKey("raw", secretBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const normalized = String(sourceName || "PDF").normalize("NFC");
  const sig = new Uint8Array(await subtle.sign("HMAC", key, new TextEncoder().encode(normalized)));
  return `Tervlap-${bytesToHex(sig).slice(0, 16)}.pdf`;
}

let memoryNameSecret = null;
function nameSecret() {
  if (memoryNameSecret) return memoryNameSecret;
  try {
    const stored = hexToBytes(localStorage.getItem(NAME_SECRET_KEY));
    if (stored) return (memoryNameSecret = stored);
  } catch { /* storage unavailable */ }
  const next = new Uint8Array(32);
  globalThis.crypto?.getRandomValues?.(next);
  if (!next.some(Boolean)) for (let i = 0; i < next.length; i++) next[i] = Math.floor(Math.random() * 256);
  memoryNameSecret = next;
  try { localStorage.setItem(NAME_SECRET_KEY, bytesToHex(next)); } catch { /* session-only fallback */ }
  return next;
}

async function stableNeutralPdfName(sourceName) {
  return pseudonymousPdfName(sourceName, nameSecret());
}

const RISKY_DICT_KEYS = [
  "Metadata", "PieceInfo", "LastModified", "Annots", "AA", "OpenAction",
  "AcroForm", "EmbeddedFiles", "JavaScript", "AF",
];

function stripRiskyKeysFromContext(pdf) {
  for (const [, obj] of pdf.context.enumerateIndirectObjects()) {
    // Streams carry their own dictionary; object-level XMP/PieceInfo attached to
    // image/form streams must be scrubbed too, not only plain PDFDict objects.
    const dict = obj instanceof PDFDict ? obj : (obj?.dict instanceof PDFDict ? obj.dict : null);
    if (!dict) continue;
    for (const key of RISKY_DICT_KEYS) dict.delete(PDFName.of(key));
  }
  for (const key of RISKY_DICT_KEYS) pdf.catalog.delete(PDFName.of(key));
  try {
    const infoRef = pdf.context.trailerInfo.Info;
    const info = infoRef ? pdf.context.lookup(infoRef, PDFDict) : undefined;
    if (info) for (const key of [...info.keys()]) info.delete(key);
  } catch { /* malformed optional Info dictionary */ }
}

/** Technical metadata/active-content sanitizer, NOT semantic anonymisation. */
export async function sanitizePdfBytes(inputBytes) {
  const src = inputBytes instanceof Uint8Array ? inputBytes : new Uint8Array(inputBytes);
  if (src.byteLength <= 0 || src.byteLength > M0_MAX_PDF_BYTES) {
    throw new Error(`A PDF mérete meghaladja az M0 adatvédelmi korlátját (${Math.round(M0_MAX_PDF_BYTES / 1024 / 1024)} MB).`);
  }
  let source;
  try {
    source = await PDFDocument.load(src, { updateMetadata: false });
  } catch (e) {
    throw new Error(`A PDF adatvédelmi tisztítása nem sikerült, ezért a fájl nem került betöltésre. ${String(e?.message || e)}`);
  }
  const pageCount = source.getPageCount();
  if (pageCount < 1 || pageCount > M0_MAX_PDF_PAGES) {
    throw new Error(`A PDF oldalszáma nem engedélyezett az M0 demóban (maximum ${M0_MAX_PDF_PAGES} oldal).`);
  }

  for (const page of source.getPages()) {
    for (const key of RISKY_DICT_KEYS) page.node.delete(PDFName.of(key));
  }
  stripRiskyKeysFromContext(source);

  // Rebuild a fresh object graph. Merely deleting catalog references can leave
  // orphaned sensitive strings in serialized bytes; copyPages excludes them.
  const clean = await PDFDocument.create({ updateMetadata: false });
  const copied = await clean.copyPages(source, source.getPageIndices());
  for (const page of copied) clean.addPage(page);
  stripRiskyKeysFromContext(clean);

  const saved = await clean.save({ useObjectStreams: false, addDefaultPage: false });
  return new Uint8Array(saved);
}

export async function sanitizePdfForM0(inputBytes) {
  if (!m0DemoEnabled()) return inputBytes instanceof Uint8Array ? new Uint8Array(inputBytes) : new Uint8Array(inputBytes);
  return sanitizePdfBytes(inputBytes);
}

let guardsInstalled = false;
let migrationPromise = null;

function startPrivacyMigration() {
  if (migrationPromise) return migrationPromise;
  migrationPromise = (async () => {
    try {
      if (localStorage.getItem(PRIVACY_SCHEMA_KEY) === PRIVACY_SCHEMA) return;
    } catch { /* disabled storage: still purge IndexedDB best-effort */ }
    await clearM0LocalProjectData();
    try { localStorage.setItem(PRIVACY_SCHEMA_KEY, PRIVACY_SCHEMA); } catch { /* private mode */ }
  })();
  return migrationPromise;
}

function hardenLocalStore() {
  const migration = startPrivacyMigration();
  const originals = {};
  for (const [key, fn] of Object.entries(localStore)) {
    if (typeof fn !== "function") continue;
    originals[key] = fn.bind(localStore);
  }

  for (const [key, fn] of Object.entries(originals)) {
    if (key === "addPdf") continue;
    localStore[key] = async (...args) => {
      await migration;
      return fn(...args);
    };
  }

  if (originals.addPdf) {
    localStore.addPdf = async (file) => {
      await migration;
      if (!file || !Number.isFinite(file.size) || file.size <= 0 || file.size > M0_MAX_PDF_BYTES) {
        throw new Error("A PDF mérete nem engedélyezett az M0 adatvédelmi módban.");
      }
      const raw = await file.arrayBuffer();
      const sanitized = await sanitizePdfBytes(raw);
      const safeName = await stableNeutralPdfName(file.name);
      // The canvas keeps the same File object in memory after addPdf() and
      // otherwise renders its original name into tabs/status text. Shadow the
      // inherited read-only File.name accessor on this instance so the live UI
      // sees the exact same pseudonym that is persisted in IndexedDB. If a
      // browser ever rejects the shadow, persistence remains safe and the E2E
      // privacy canary will fail rather than silently accepting a UI leak.
      try {
        Object.defineProperty(file, "name", { configurable: true, enumerable: true, value: safeName });
      } catch { /* fail closed at the canary gate; persisted copy is still safe */ }
      const safeFile = new File([sanitized], safeName, { type: "application/pdf", lastModified: 0 });
      return originals.addPdf(safeFile);
    };
  }
}

function blockConstructor(name) {
  if (!(name in window)) return;
  try {
    Object.defineProperty(window, name, {
      configurable: true,
      writable: false,
      value: class M0BlockedTransport {
        constructor() { throw new Error(`${name} az M0 adatvédelmi módban ki van kapcsolva.`); }
      },
    });
  } catch { /* CSP/server headers remain authoritative fallbacks */ }
}

export function installM0PrivacyGuards() {
  if (!m0DemoEnabled() || guardsInstalled || typeof window === "undefined") return;
  guardsInstalled = true;
  hardenLocalStore();

  const nativeFetch = window.fetch?.bind(window);
  if (nativeFetch) {
    window.fetch = (input, init) => {
      if (!isAllowedM0Request(input, init)) return Promise.reject(privacyError(input));
      return nativeFetch(input, init);
    };
  }
  const xhrOpen = window.XMLHttpRequest?.prototype?.open;
  if (xhrOpen) {
    window.XMLHttpRequest.prototype.open = function(method, url, ...rest) {
      if (!isAllowedM0Request(url, { method })) throw privacyError(url);
      return xhrOpen.call(this, method, url, ...rest);
    };
  }
  if (navigator.sendBeacon) {
    try { navigator.sendBeacon = () => false; } catch { /* read-only implementation */ }
  }
  for (const key of [
    "WebSocket", "EventSource", "WebTransport", "RTCPeerConnection",
    "webkitRTCPeerConnection", "SharedWorker", "BroadcastChannel",
  ]) blockConstructor(key);
}
