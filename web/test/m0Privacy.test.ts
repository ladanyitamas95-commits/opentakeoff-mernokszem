import test from "node:test";
import assert from "node:assert/strict";
import { PDFDocument, PDFDict, PDFName, PDFString } from "pdf-lib";
import {
  isAllowedM0Request,
  M0_MAX_PDF_PAGES,
  pseudonymousPdfName,
  sanitizePdfBytes,
} from "../src/lib/m0Privacy.js";
import { ingestFiles } from "../src/lib/m0Stubs/ingestPdfOnly.js";

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

test("M0 filename pseudonym is stable per secret without persisting source name", async () => {
  const secretA = new Uint8Array(32).fill(0x2a);
  const secretB = new Uint8Array(32).fill(0x7b);
  const source = "Ügyfél_Neve_Titkos_Projekt_PM90.pdf";
  const a1 = await pseudonymousPdfName(source, secretA);
  const a2 = await pseudonymousPdfName(source, secretA);
  const b = await pseudonymousPdfName(source, secretB);
  assert.match(a1, /^Tervlap-[0-9a-f]{16}\.pdf$/);
  assert.equal(a1, a2, "same browser-secret + same source name must preserve revision grouping");
  assert.notEqual(a1, b, "different browser secrets must not produce a global cross-user identifier");
  assert.equal(a1.includes("Ügyfél"), false);
  assert.equal(a1.includes("PM90"), false);
});

test("M0 ingest accepts real PDFs only and rejects disguised/non-PDF files", async () => {
  const real = new File(["%PDF-1.7\n%%EOF"], "private-project.pdf", { type: "application/pdf" });
  const fake = new File(["not a pdf"], "looks-like.pdf", { type: "application/pdf" });
  const image = new File([new Uint8Array([0xff, 0xd8, 0xff])], "photo-with-exif.jpg", { type: "image/jpeg" });
  const { pdfs, skipped } = await ingestFiles([real, fake, image]);
  assert.equal(pdfs.length, 1);
  assert.equal(pdfs[0], real);
  assert.equal(skipped.length, 2);
  assert.equal(skipped.some((x) => String(x.name).includes("private-project")), false, "skipped metadata must not echo source filename");
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

test("PDF sanitizer refuses pathological page counts before persistence", async () => {
  const src = await PDFDocument.create({ updateMetadata: false });
  for (let i = 0; i < M0_MAX_PDF_PAGES + 1; i++) src.addPage([10, 10]);
  const bytes = await src.save({ useObjectStreams: true });
  await assert.rejects(() => sanitizePdfBytes(bytes), /maximum|oldal/i);
});
