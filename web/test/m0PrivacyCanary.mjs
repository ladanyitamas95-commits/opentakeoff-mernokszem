import { chromium } from "playwright";

const targetUrl = process.env.M0_URL || "http://127.0.0.1:4173/";
const privacyCanary = "CONFIDENTIAL_CANARY_7F8B91";
const visibleCanary = "987654321 Ft";
const sourceFilename = `${privacyCanary}-source.pdf`;
const allowedOrigin = new URL(targetUrl).origin;

const network = [];
const failedRequests = [];
const pageErrors = [];
const consoleMessages = [];
const websockets = [];

function asUrl(raw) {
  try { return new URL(raw, targetUrl); } catch { return null; }
}

function containsCanary(value) {
  return String(value ?? "").includes(privacyCanary);
}

function pdfLiteral(value) {
  return String(value).replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function buildSyntheticPdf() {
  const stream = `BT\n/F1 20 Tf\n72 700 Td\n(${pdfLiteral(visibleCanary)}) Tj\nET\n`;
  const objects = [
    `<< /Type /Catalog /Pages 2 0 R >>`,
    `<< /Type /Pages /Kids [3 0 R] /Count 1 >>`,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>`,
    `<< /Length ${Buffer.byteLength(stream, "ascii")} >>\nstream\n${stream}endstream`,
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`,
    `<< /Title (${privacyCanary}) /Author (${privacyCanary}) /Subject (${privacyCanary}) /Keywords (${privacyCanary}) /Creator (${privacyCanary}) /Producer (${privacyCanary}) >>`,
  ];

  let pdf = "%PDF-1.4\n%M0-CANARY\n";
  const offsets = [0];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(pdf, "ascii"));
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf, "ascii");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, "ascii");
}

async function streamToBuffer(stream) {
  if (!stream) throw new Error("Export download stream is unavailable");
  const chunks = [];
  for await (const chunk of stream) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ acceptDownloads: true });

context.on("request", (req) => {
  network.push({
    method: req.method(),
    url: req.url(),
    resourceType: req.resourceType(),
    headers: req.headers(),
    postData: req.postData() || "",
  });
});
context.on("requestfailed", (req) => {
  failedRequests.push({ method: req.method(), url: req.url(), failure: req.failure()?.errorText || "unknown" });
});

const page = await context.newPage();
page.on("websocket", (ws) => websockets.push(ws.url()));
page.on("pageerror", (err) => pageErrors.push(err?.stack || err?.message || String(err)));
page.on("console", (msg) => consoleMessages.push({ type: msg.type(), text: msg.text() }));

try {
  const response = await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 30_000 });
  if (!response?.ok()) throw new Error(`M0 page load failed: HTTP ${response?.status()}`);
  const csp = response.headers()["content-security-policy"] || "";
  if (!/connect-src\s+'none'/.test(csp)) throw new Error(`Production response is missing connect-src 'none' CSP: ${csp}`);

  const inputs = page.locator('input[name="sheet-file"]');
  const input = inputs.first();
  await input.waitFor({ state: "attached", timeout: 15_000 });
  if ((await inputs.count()) < 1) throw new Error("M0 sheet-file input missing");

  const sourcePdf = buildSyntheticPdf();
  if (!sourcePdf.includes(Buffer.from(privacyCanary, "ascii"))) throw new Error("Synthetic PDF does not contain the metadata canary before import");
  if (!sourcePdf.includes(Buffer.from(visibleCanary, "ascii"))) throw new Error("Synthetic PDF does not contain the visible-content canary before import");

  await input.setInputFiles({ name: sourceFilename, mimeType: "application/pdf", buffer: sourcePdf });

  await page.waitForFunction(() => {
    const body = document.body?.innerText || "";
    const leftEmptyProjectView = !/No PDFs yet/i.test(body);
    const hasRenderedPlanCanvas = [...document.querySelectorAll("canvas")].some((c) => {
      const r = c.getBoundingClientRect();
      return r.width >= 150 && r.height >= 150;
    });
    return leftEmptyProjectView && hasRenderedPlanCanvas;
  }, null, { timeout: 30_000 });

  const canvases = page.locator("canvas");
  let best = null;
  for (let i = 0; i < await canvases.count(); i++) {
    const box = await canvases.nth(i).boundingBox();
    if (!box || box.width < 150 || box.height < 150) continue;
    const area = box.width * box.height;
    if (!best || area > best.area) best = { area, box };
  }
  if (!best) throw new Error("No usable rendered plan canvas found after canary PDF import");
  const x = best.box.x + best.box.width * 0.55;
  const y = best.box.y + best.box.height * 0.55;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 20, y + 16, { steps: 4 });
  await page.mouse.up();
  await page.mouse.wheel(0, -120);
  await page.waitForTimeout(1_500);

  const sheetMenu = page.locator('button[title^="Sheet —"]').first();
  await sheetMenu.waitFor({ state: "visible", timeout: 10_000 });
  await sheetMenu.click();
  const exportButton = page.getByRole("button", { name: /Export takeoff/i }).first();
  await exportButton.waitFor({ state: "visible", timeout: 10_000 });
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 10_000 }),
    exportButton.click(),
  ]);
  const exportFilename = download.suggestedFilename();
  const exportBytes = await streamToBuffer(await download.createReadStream());
  const exportText = exportBytes.toString("utf8");

  const persistence = await page.evaluate(async ({ privacyCanary }) => {
    const hits = [];
    const domEvidence = [];
    const counters = {
      localStorageEntries: 0,
      sessionStorageEntries: 0,
      indexedDbDatabases: 0,
      indexedDbStores: 0,
      indexedDbRecords: 0,
      bytePayloads: 0,
    };
    const needle = new TextEncoder().encode(privacyCanary);

    const bytesContain = (raw) => {
      const bytes = raw instanceof Uint8Array ? raw : new Uint8Array(raw);
      outer: for (let i = 0; i <= bytes.length - needle.length; i++) {
        for (let j = 0; j < needle.length; j++) if (bytes[i + j] !== needle[j]) continue outer;
        return true;
      }
      return false;
    };

    const scan = async (value, where, seen = new WeakSet()) => {
      if (value == null) return;
      if (typeof value === "string") {
        if (value.includes(privacyCanary)) hits.push(where);
        return;
      }
      if (["number", "boolean", "bigint", "symbol", "function"].includes(typeof value)) return;
      if (value instanceof ArrayBuffer) {
        counters.bytePayloads++;
        if (bytesContain(value)) hits.push(`${where} [ArrayBuffer]`);
        return;
      }
      if (ArrayBuffer.isView(value)) {
        counters.bytePayloads++;
        const bytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
        if (bytesContain(bytes)) hits.push(`${where} [TypedArray]`);
        return;
      }
      if (value instanceof Blob) {
        counters.bytePayloads++;
        if (typeof File !== "undefined" && value instanceof File && value.name.includes(privacyCanary)) hits.push(`${where}.name [File]`);
        const buf = await value.arrayBuffer();
        if (bytesContain(buf)) hits.push(`${where} [Blob bytes]`);
        return;
      }
      if (typeof value !== "object") return;
      if (seen.has(value)) return;
      seen.add(value);
      if (value instanceof Map) {
        for (const [k, v] of value) {
          await scan(k, `${where}.<map-key>`, seen);
          await scan(v, `${where}.<map-value>`, seen);
        }
        return;
      }
      if (value instanceof Set) {
        for (const v of value) await scan(v, `${where}.<set-value>`, seen);
        return;
      }
      for (const key of Reflect.ownKeys(value)) {
        if (typeof key === "string" && key.includes(privacyCanary)) hits.push(`${where}.<key>`);
        let child;
        try { child = value[key]; } catch { continue; }
        await scan(child, `${where}.${String(key)}`, seen);
      }
    };

    for (const storageName of ["localStorage", "sessionStorage"]) {
      const storage = window[storageName];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i) || "";
        const value = storage.getItem(key) || "";
        counters[`${storageName}Entries`]++;
        if (key.includes(privacyCanary)) hits.push(`${storageName}.key`);
        if (value.includes(privacyCanary)) hits.push(`${storageName}.${key}`);
      }
    }

    const dbMetas = typeof indexedDB.databases === "function" ? await indexedDB.databases() : [];
    for (const meta of dbMetas) {
      if (!meta.name) continue;
      counters.indexedDbDatabases++;
      const db = await new Promise((resolve, reject) => {
        const req = indexedDB.open(meta.name);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error || new Error(`Could not open IndexedDB ${meta.name}`));
      });
      try {
        for (const storeName of [...db.objectStoreNames]) {
          counters.indexedDbStores++;
          const tx = db.transaction(storeName, "readonly");
          const store = tx.objectStore(storeName);
          const [keys, values] = await Promise.all([
            new Promise((resolve, reject) => {
              const req = store.getAllKeys();
              req.onsuccess = () => resolve(req.result || []);
              req.onerror = () => reject(req.error);
            }),
            new Promise((resolve, reject) => {
              const req = store.getAll();
              req.onsuccess = () => resolve(req.result || []);
              req.onerror = () => reject(req.error);
            }),
          ]);
          counters.indexedDbRecords += values.length;
          for (let i = 0; i < keys.length; i++) await scan(keys[i], `indexedDB.${meta.name}.${storeName}.key[${i}]`);
          for (let i = 0; i < values.length; i++) await scan(values[i], `indexedDB.${meta.name}.${storeName}.value[${i}]`);
        }
      } finally {
        db.close();
      }
    }

    const html = document.documentElement?.outerHTML || "";
    const htmlAt = html.indexOf(privacyCanary);
    if (htmlAt >= 0) {
      hits.push("DOM.outerHTML");
      const from = Math.max(0, htmlAt - 180);
      const to = Math.min(html.length, htmlAt + privacyCanary.length + 180);
      domEvidence.push(html.slice(from, to).replaceAll(privacyCanary, "[PRIVACY_CANARY]"));
    }
    if ((document.title || "").includes(privacyCanary)) hits.push("DOM.documentTitle");
    for (const [i, el] of [...document.querySelectorAll("input")].entries()) {
      if ((el.value || "").includes(privacyCanary)) hits.push(`DOM.input[${i}].value`);
      for (const file of [...(el.files || [])]) if ((file.name || "").includes(privacyCanary)) hits.push(`DOM.input[${i}].files.name`);
    }

    return { hits: [...new Set(hits)], counters, domEvidence };
  }, { privacyCanary });

  const perfResources = await page.evaluate(() => performance.getEntriesByType("resource").map((e) => e.name));
  const networkCanaryHits = network.filter((entry) => containsCanary(JSON.stringify(entry)));
  const failedRequestCanaryHits = failedRequests.filter((entry) => containsCanary(JSON.stringify(entry)));
  const websocketCanaryHits = websockets.filter(containsCanary);
  const consoleCanaryHits = consoleMessages.filter((entry) => containsCanary(entry.text));
  const pageErrorCanaryHits = pageErrors.filter(containsCanary);
  const performanceCanaryHits = perfResources.filter(containsCanary);
  const externalNetwork = network.filter((entry) => {
    const u = asUrl(entry.url);
    return u && ["http:", "https:", "ws:", "wss:"].includes(u.protocol) && u.origin !== allowedOrigin;
  });

  const exportCanaryHits = [];
  if (containsCanary(exportFilename)) exportCanaryHits.push("download filename");
  if (exportText.includes(privacyCanary)) exportCanaryHits.push("download body");

  const result = {
    sourcePdfMetadataCanaryPresentBeforeImport: true,
    sourceFilenameCanaryPresentBeforeImport: true,
    visibleDocumentCanaryPresentBeforeImport: true,
    externalNetworkRequests: externalNetwork.length,
    networkCanaryHits: networkCanaryHits.length,
    failedRequestCanaryHits: failedRequestCanaryHits.length,
    websocketCanaryHits: websocketCanaryHits.length,
    consoleCanaryHits: consoleCanaryHits.length,
    pageErrorCanaryHits: pageErrorCanaryHits.length,
    performanceCanaryHits: performanceCanaryHits.length,
    persistenceCanaryHits: persistence.hits.length,
    exportCanaryHits: exportCanaryHits.length,
    exportBytes: exportBytes.length,
    persistenceScanned: persistence.counters,
    interaction: "synthetic metadata+filename canary PDF import + render + pan + zoom + takeoff export",
  };
  console.log("M0_PRIVACY_CANARY_RESULT=" + JSON.stringify(result));
  if (persistence.domEvidence.length) console.log("M0_PRIVACY_CANARY_DOM_EVIDENCE=" + JSON.stringify(persistence.domEvidence));

  const failures = [];
  if (externalNetwork.length) failures.push(`external network requests: ${JSON.stringify(externalNetwork)}`);
  if (networkCanaryHits.length) failures.push(`privacy canary reached network requests: ${JSON.stringify(networkCanaryHits)}`);
  if (failedRequestCanaryHits.length) failures.push(`privacy canary reached failed requests: ${JSON.stringify(failedRequestCanaryHits)}`);
  if (websocketCanaryHits.length) failures.push(`privacy canary reached WebSocket URLs: ${JSON.stringify(websocketCanaryHits)}`);
  if (consoleCanaryHits.length) failures.push(`privacy canary reached browser console: ${JSON.stringify(consoleCanaryHits)}`);
  if (pageErrorCanaryHits.length) failures.push(`privacy canary reached page errors: ${JSON.stringify(pageErrorCanaryHits)}`);
  if (performanceCanaryHits.length) failures.push(`privacy canary reached performance resource URLs: ${JSON.stringify(performanceCanaryHits)}`);
  if (persistence.hits.length) failures.push(`privacy canary persisted in browser state: ${JSON.stringify(persistence.hits)}`);
  if (exportCanaryHits.length) failures.push(`privacy canary reached takeoff export: ${JSON.stringify(exportCanaryHits)}`);

  if (failures.length) {
    console.error("M0 END-TO-END PRIVACY CANARY: FAIL");
    for (const failure of failures) console.error(failure);
    process.exitCode = 1;
  } else {
    console.log("M0 END-TO-END PRIVACY CANARY: PASS");
  }
} finally {
  await context.close();
  await browser.close();
}