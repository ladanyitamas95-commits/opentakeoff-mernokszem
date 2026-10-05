import { M0_MAX_PDF_BYTES } from "../m0Privacy.js";

const PDF_EXT = /\.pdf$/i;
const PDF_MAGIC = "%PDF-";

async function hasPdfMagic(file) {
  try { return (await file.slice(0, 5).text()) === PDF_MAGIC; }
  catch { return false; }
}

// Privacy demo deliberately narrows the upstream multi-format ingest surface.
// Images can carry EXIF/profile metadata; ZIPs add archive-bomb/nesting risk.
// The validated M0 workflow needs PDFs only, and every accepted PDF is sanitized
// again by the localStore privacy wrapper before persistence.
export async function ingestFiles(fileList, { onProgress } = {}) {
  const incoming = Array.from(fileList || []);
  const pdfs = [];
  const skipped = [];
  for (const file of incoming) {
    onProgress?.("PDF ellenőrzése…");
    const typeOk = PDF_EXT.test(file.name || "") || file.type === "application/pdf";
    if (!typeOk) { skipped.push({ name: "fájl", reason: "Az M0 adatvédelmi módban csak PDF engedélyezett." }); continue; }
    if (!Number.isFinite(file.size) || file.size <= 0 || file.size > M0_MAX_PDF_BYTES) {
      skipped.push({ name: "PDF", reason: "A PDF mérete nem engedélyezett." });
      continue;
    }
    if (!(await hasPdfMagic(file))) {
      skipped.push({ name: "PDF", reason: "A fájl nem érvényes PDF fejlécet tartalmaz." });
      continue;
    }
    pdfs.push(file);
  }
  return { pdfs, skipped };
}
