import { PDFDocument, PDFName, PDFDict } from "pdf-lib";
import { m0DemoEnabled } from "./m0Demo.js";

const SAFE_PROTOCOLS = new Set(["blob:", "data:"]);

function asUrl(value) {
  if (value instanceof Request) return new URL(value.url, window.location.href);
  return new URL(String(value), window.location.href);
}

export function isM0AllowedNetworkTarget(value) {
  if (!m0DemoEnabled()) return true;
  try {
    const u = asUrl(value);
    return SAFE_PROTOCOLS.has(u.protocol) || u.origin === window.location.origin;
  } catch {
    return false;
  }
}

function privacyError(target) {
  let shown = "ismeretlen cél";
  try { shown = asUrl(target).origin; } catch { /* ignore */ }
  return new Error(`Az M0 adatvédelmi mód blokkolta a külső hálózati kapcsolatot: ${shown}`);
}

let guardsInstalled = false;

export function installM0PrivacyGuards() {
  if (!m0DemoEnabled() || guardsInstalled || typeof window === "undefined") return;
  guardsInstalled = true;

  const nativeFetch = window.fetch?.bind(window);
  if (nativeFetch) {
    window.fetch = (input, init) => {
      if (!isM0AllowedNetworkTarget(input)) return Promise.reject(privacyError(input));
      return nativeFetch(input, init);
    };
  }

  const xhrOpen = window.XMLHttpRequest?.prototype?.open;
  if (xhrOpen) {
    window.XMLHttpRequest.prototype.open = function(method, url, ...rest) {
      if (!isM0AllowedNetworkTarget(url)) throw privacyError(url);
      return xhrOpen.call(this, method, url, ...rest);
    };
  }

  if (navigator.sendBeacon) {
    const nativeBeacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = (url, data) => {
      if (!isM0AllowedNetworkTarget(url)) return false;
      return nativeBeacon(url, data);
    };
  }

  // Collaboration/remote-presence transports are intentionally unavailable in
  // the private internal demo. Disabling them also prevents ICE/STUN based IP
  // discovery from browser code.
  for (const key of ["WebSocket", "EventSource", "RTCPeerConnection", "webkitRTCPeerConnection"]) {
    if (!(key in window)) continue;
    try {
      Object.defineProperty(window, key, {
        configurable: true,
        writable: false,
        value: class M0BlockedTransport {
          constructor() { throw new Error(`${key} az M0 adatvédelmi módban ki van kapcsolva.`); }
        },
      });
    } catch { /* CSP remains the authoritative fallback */ }
  }
}

export function neutralPdfName() {
  const id = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `Tervlap-${id.slice(0, 12)}.pdf`;
}

/**
 * Removes standard identifying PDF metadata, annotations/form fields and embedded
 * file references before M0 persists a plan locally. This is metadata/privacy
 * hardening, NOT semantic anonymisation: visible/hidden drawing text can still
 * contain identifying information and must be anonymised before import.
 */
export async function sanitizePdfForM0(inputBytes) {
  if (!m0DemoEnabled()) return inputBytes instanceof ArrayBuffer ? inputBytes : inputBytes.buffer;

  const src = inputBytes instanceof Uint8Array ? inputBytes : new Uint8Array(inputBytes);
  let pdf;
  try {
    pdf = await PDFDocument.load(src, { updateMetadata: false });
  } catch (e) {
    throw new Error(`A PDF adatvédelmi tisztítása nem sikerült, ezért a fájl nem került betöltésre. ${String(e?.message || e)}`);
  }

  pdf.setTitle("");
  pdf.setAuthor("");
  pdf.setSubject("");
  pdf.setKeywords([]);
  pdf.setCreator("");
  pdf.setProducer("");
  const neutralDate = new Date("2000-01-01T00:00:00.000Z");
  pdf.setCreationDate(neutralDate);
  pdf.setModificationDate(neutralDate);

  // XMP metadata, forms/field values, annotations/comments and embedded files
  // can carry names, e-mail addresses or document provenance.
  pdf.catalog.delete(PDFName.of("Metadata"));
  pdf.catalog.delete(PDFName.of("AcroForm"));
  const names = pdf.catalog.lookupMaybe(PDFName.of("Names"), PDFDict);
  if (names) names.delete(PDFName.of("EmbeddedFiles"));
  for (const page of pdf.getPages()) page.node.delete(PDFName.of("Annots"));

  const saved = await pdf.save({ useObjectStreams: false, addDefaultPage: false });
  return saved.buffer.slice(saved.byteOffset, saved.byteOffset + saved.byteLength);
}
