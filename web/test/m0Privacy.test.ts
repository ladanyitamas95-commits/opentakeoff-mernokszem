import test from "node:test";
import assert from "node:assert/strict";
import { PDFDocument, PDFDict, PDFName, PDFString } from "pdf-lib";
import {
  isAllowedM0Request,
  neutralPdfName,
  sanitizePdfBytes,
} from "../src/lib/m0Privacy.js";

const CANARY = "CONFIDENTIAL_CANARY_7F8B91";
const EMAIL = "person.private@example.invalid";

function bytesContain(bytes: ArrayBufferLike | Uint8Array<ArrayBufferLike>, text: string) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return Buffer.from(u8).includes(Buffer.from(text, "utf8"));
}

test("M0 network policy denies all HTTP(S) egress, including same-origin", () => {
  const origin = "https://mernokszem-m0.example/";
  assert.equal(isAllowedM0Request("https://api.openai.com/v1/chat/completions", {}, origin), false);
  assert.equal(isAllowedM0Request("https://api.anthropic.com/v1/messages", {}, origin), false);
  assert.equal(isAllowedM0Request("https://graph.microsoft.com/v1.0/me", {}, origin), false);
  assert.equal(isAllowedM0Request("https://www.googleapis.com/drive/v3/files", {}, origin), false);
  assert.equal(isAllowedM0Request("https://static.cloudflareinsights.com/beacon.min.js", {}, origin), false);
  assert.equal(isAllowedM0Request("/api/schedule-scan", { method: "POST" }, origin), false);
  assert.equal(isAllowedM0Request("/api/anything", { method: "GET" }, origin), false);
  assert.equal(isAllowedM0Request("blob:https://mernokszem-m0.example/123", { method: "GET" }, origin), true);
  assert.equal(isAllowedM0Request("data:application/octet-stream;base64,AA==", { method: "GET" }, origin), true);
  assert.equal(isAllowedM0Request("blob:https://mernokszem-m0.example/123", { method: "POST" }, origin), false);
});

test("M0 neutral filename never persists the source filename", () => {
  const a = neutralPdfName();
  const b = neutralPdfName();
  assert.match(a, /^Tervlap-[a-zA-Z0-9-]{8,12}\.pdf$/);
  assert.match(b, /^Tervlap-[a-zA-Z0-9-]{8,12}\.pdf$/);
  assert.notEqual(a, b);
  assert.equal(a.includes("Tender_Project_Client_Name"), false);
});

test("PDF sanitizer rebuilds pages and removes recoverable metadata/action canaries", async () => {
  const src = await PDFDocument.create({ updateMetadata: false });
  src.setTitle(`Tender ${CANARY}`);
  src.setAuthor(EMAIL);
  src.setSubject(CANARY);
  src.setCreator(CANARY);
  src.setProducer(CANARY);

  const page = src.addPage([842, 595]);
  page.drawText("ANONYMIZED_VISIBLE_DRAWING", { x: 50, y: 500, size: 12 });

  const infoRef = src.context.trailerInfo.Info;
  const info = infoRef ? src.context.lookup(infoRef, PDFDict) : undefined;
  assert.ok(info);
  info.set(PDFName.of("OwnerEmail"), PDFString.of(EMAIL));
  info.set(PDFName.of("InternalProject"), PDFString.of(CANARY));

  const annotation = src.context.obj({
    Type: "Annot",
    Subtype: "Text",
    Rect: [10, 10, 20, 20],
    Contents: PDFString.of(`${CANARY}:${EMAIL}`),
  });
  const annotationRef = src.context.register(annotation);
  page.node.set(PDFName.of("Annots"), src.context.obj([annotationRef]));

  const jsAction = src.context.obj({ S: "JavaScript", JS: PDFString.of(`app.alert('${CANARY}')`) });
  const jsRef = src.context.register(jsAction);
  src.catalog.set(PDFName.of("OpenAction"), jsRef);
  src.catalog.set(PDFName.of("AA"), src.context.obj({ WC: jsRef }));
  src.catalog.set(PDFName.of("AcroForm"), src.context.obj({ Fields: [] }));

  const sourceBytes = await src.save({ useObjectStreams: false });
  assert.equal(bytesContain(sourceBytes, CANARY), true, "fixture must contain the canary");
  assert.equal(bytesContain(sourceBytes, EMAIL), true, "fixture must contain the e-mail");

  const cleaned = await sanitizePdfBytes(sourceBytes);
  const out = await PDFDocument.load(cleaned, { updateMetadata: false });

  assert.equal(out.getPageCount(), 1);
  assert.deepEqual(out.getPage(0).getSize(), { width: 842, height: 595 });
  assert.equal(out.catalog.has(PDFName.of("OpenAction")), false);
  assert.equal(out.catalog.has(PDFName.of("AA")), false);
  assert.equal(out.catalog.has(PDFName.of("AcroForm")), false);
  assert.equal(out.catalog.has(PDFName.of("Metadata")), false);
  assert.equal(out.getPage(0).node.has(PDFName.of("Annots")), false);
  assert.equal(bytesContain(cleaned, CANARY), false, "deleted objects must not survive as orphan bytes");
  assert.equal(bytesContain(cleaned, EMAIL), false, "identity metadata must not survive raw-byte inspection");
});
