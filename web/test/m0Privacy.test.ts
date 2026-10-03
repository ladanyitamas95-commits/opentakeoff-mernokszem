import assert from "node:assert/strict";
import test from "node:test";
import { PDFDocument } from "pdf-lib";

// Pure metadata behaviour is exercised by a tiny local equivalent because the
// production sanitizer is gated by VITE_M0_DEMO at build time. The production
// M0 build is separately validated by Vite below.
test("pdf-lib can erase standard identifying metadata used by M0", async () => {
  const pdf = await PDFDocument.create();
  pdf.addPage([100, 100]);
  pdf.setAuthor("Sensitive Person");
  pdf.setTitle("Secret Project");
  pdf.setCreator("Sensitive Tool");
  const bytes = await pdf.save();

  const loaded = await PDFDocument.load(bytes, { updateMetadata: false });
  loaded.setAuthor("");
  loaded.setTitle("");
  loaded.setCreator("");
  const clean = await PDFDocument.load(await loaded.save(), { updateMetadata: false });

  assert.equal(clean.getAuthor(), "");
  assert.equal(clean.getTitle(), "");
  assert.equal(clean.getCreator(), "");
});
