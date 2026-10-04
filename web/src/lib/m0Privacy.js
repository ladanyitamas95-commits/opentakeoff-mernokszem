import { PDFDocument, PDFName, PDFDict } from "pdf-lib";
import { m0DemoEnabled, clearM0LocalProjectData } from "./m0Demo.js";
import { localStore } from "./store.js";

const SAFE_PROTOCOLS = new Set(["blob:", "data:"]);
const SAFE_METHODS = new Set(["GET", "HEAD"]);
const PRIVACY_SCHEMA_KEY = "m0_privacy_schema";
// v3 invalidates v2 PDFs because v3 rebuilds the document graph instead of only
// deleting references, eliminating orphaned metadata/action objects as well.
const PRIVACY_SCHEMA = "3";

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

/** Pure policy used by runtime guards and Node regression tests. M0 has no
 * legitimate HTTP API traffic: plans are local Files and app assets are loaded
 * by the browser's subresource/module loader. Only blob:/data: reads are allowed.
 */
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

export function neutralPdfName() {
  const id = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `Tervlap-${id.slice(0, 12)}.pdf`;
}

const RISKY_DICT_KEYS = [
  "Metadata",
  "PieceInfo",
  "LastModified",
  "Annots",
  "AA",
  "OpenAction",
  "AcroForm",
  "EmbeddedFiles",
  "JavaScript",
  "AF",
];

function stripRiskyKeysFromContext(pdf) {
  for (const [, obj] of pdf.context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFDict)) continue;
    for (const key of RISKY_DICT_KEYS) obj.delete(PDFName.of(key));
  }
  for (const key of RISKY_DICT_KEYS) pdf.catalog.delete(PDFName.of(key));
  try {
    const infoRef = pdf.context.trailerInfo.Info;
    const info = infoRef ? pdf.context.lookup(infoRef, PDFDict) : undefined;
    if (info) for (const key of [...info.keys()]) info.delete(key);
  } catch { /* malformed optional Info dictionary */ }
}

/**
 * Pure PDF sanitizer. It rebuilds a new document from sanitized page graphs
 * rather than merely deleting catalog references. This matters because pdf-lib
 * can otherwise preserve now-unreachable indirect objects in the serialized
 * file, leaving old XMP/annotation/JavaScript strings recoverable by raw-byte
 * inspection even though a PDF viewer no longer exposes them.
 *
 * This is metadata/active-content hardening, NOT semantic anonymisation: visible
 * or hidden drawing text/content streams can still contain identities and must
 * be anonymised before import.
 */
export async function sanitizePdfBytes(inputBytes) {
  const src = inputBytes instanceof Uint8Array ? inputBytes : new Uint8Array(inputBytes);
  let source;
  try {
    source = await PDFDocument.load(src, { updateMetadata: false });
  } catch (e) {
    throw new Error(`A PDF adatvédelmi tisztítása nem sikerült, ezért a fájl nem került betöltésre. ${String(e?.message || e)}`);
  }

  for (const page of source.getPages()) {
    for (const key of RISKY_DICT_KEYS) page.node.delete(PDFName.of(key));
  }
  stripRiskyKeysFromContext(source);

  const clean = await PDFDocument.create({ updateMetadata: false });
  const copied = await clean.copyPages(source, source.getPageIndices());
  for (const page of copied) clean.addPage(page);
  stripRiskyKeysFromContext(clean);

  const saved = await clean.save({ useObjectStreams: false, addDefaultPage: false });
  // Return a typed byte view rather than slicing ArrayBufferLike. This keeps the
  // API stable across Node/browser typings where .buffer may be SharedArrayBuffer.
  return new Uint8Array(saved);
}

export async function sanitizePdfForM0(inputBytes) {
  if (!m0DemoEnabled()) {
    return inputBytes instanceof Uint8Array ? new Uint8Array(inputBytes) : new Uint8Array(inputBytes);
  }
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
      const raw = await file.arrayBuffer();
      const sanitized = await sanitizePdfBytes(raw);
      const safeFile = new File([sanitized], neutralPdfName(), {
        type: "application/pdf",
        lastModified: 0,
      });
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
    "WebSocket",
    "EventSource",
    "WebTransport",
    "RTCPeerConnection",
    "webkitRTCPeerConnection",
    "SharedWorker",
    "BroadcastChannel",
  ]) blockConstructor(key);
}
