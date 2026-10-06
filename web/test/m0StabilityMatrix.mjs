import { chromium, firefox, webkit, devices } from "playwright";

const targetUrl = process.env.M0_URL || "http://127.0.0.1:4173/";
const pdfPath = process.env.M0_PDF;
if (!pdfPath) throw new Error("M0_PDF is required");

const scenarios = [
  { name: "chromium-desktop", browserType: chromium, context: { viewport: { width: 1366, height: 768 } }, touch: false },
  { name: "firefox-desktop", browserType: firefox, context: { viewport: { width: 1366, height: 768 } }, touch: false },
  { name: "webkit-desktop", browserType: webkit, context: { viewport: { width: 1440, height: 900 } }, touch: false },
  { name: "chromium-android", browserType: chromium, context: { ...(devices["Pixel 7"] || devices["Pixel 5"]) }, touch: true },
  { name: "webkit-iphone", browserType: webkit, context: { ...(devices["iPhone 15"] || devices["iPhone 14"]) }, touch: true },
  { name: "webkit-ipad", browserType: webkit, context: { ...(devices["iPad Pro 11"] || devices["iPad (gen 7)"]) }, touch: true },
];

async function importPdfByRealChooser(page) {
  const cta = page.getByRole("button", { name: /Open your plans/i }).first();
  await cta.waitFor({ state: "visible", timeout: 15_000 });
  const chooserPromise = page.waitForEvent("filechooser", { timeout: 8_000 });
  await cta.click({ timeout: 8_000 });
  const chooser = await chooserPromise;
  await chooser.setFiles(pdfPath);
  await page.waitForFunction(() => {
    const body = document.body?.innerText || "";
    const leftEmptyProjectView = !/No PDFs yet/i.test(body);
    const rendered = [...document.querySelectorAll("canvas")].some((c) => {
      const r = c.getBoundingClientRect();
      return r.width >= 150 && r.height >= 150;
    });
    return leftEmptyProjectView && rendered;
  }, null, { timeout: 30_000 });
}

async function setMetricScale(page) {
  const trigger = page.locator('button[title^="Set the scale for"]').first();
  await trigger.waitFor({ state: "visible", timeout: 10_000 });
  await trigger.click();
  const scale = page.getByRole("button", { name: "1:50", exact: true });
  await scale.waitFor({ state: "visible", timeout: 5_000 });
  await scale.click();
  await page.waitForFunction(() => [...document.querySelectorAll("footer span")].some((s) => (s.textContent || "").includes("1:50")), null, { timeout: 5_000 });
}

async function createAndActivateTestCondition(page) {
  // A clean M0 workspace is allowed to have zero conditions. The stability gate
  // must create its own deterministic condition instead of depending on starter
  // templates/palette state from a previous browser profile.
  const add = page.getByRole("button", { name: "+ condition", exact: true }).first();
  await add.waitFor({ state: "visible", timeout: 10_000 });
  page.once("dialog", async (dialog) => {
    if (dialog.type() !== "prompt") throw new Error("Expected condition-name prompt");
    await dialog.accept("STAB-1");
  });
  await add.click();
  await page.waitForFunction(() => [...document.querySelectorAll('input[name="condition-finish-tag"]')].some((el) => el.value === "STAB-1"), null, { timeout: 5_000 });
}

async function planBox(page) {
  return page.evaluate(() => {
    const vw = innerWidth, vh = innerHeight;
    const boxes = [...document.querySelectorAll("canvas")].map((c) => {
      const r = c.getBoundingClientRect();
      const ix0 = Math.max(0, r.left), iy0 = Math.max(0, r.top);
      const ix1 = Math.min(vw, r.right), iy1 = Math.min(vh, r.bottom);
      const iw = Math.max(0, ix1 - ix0), ih = Math.max(0, iy1 - iy0);
      return { x: r.x, y: r.y, width: r.width, height: r.height, visibleArea: iw * ih, ix0, iy0, ix1, iy1 };
    }).filter((b) => b.width >= 150 && b.height >= 150 && b.visibleArea > 10_000);
    boxes.sort((a, b) => b.visibleArea - a.visibleArea);
    return boxes[0] || null;
  });
}

async function pointInPlan(page, fx, fy) {
  const b = await planBox(page);
  if (!b) throw new Error("No visible plan canvas");
  // Use the full plan box when it fits; otherwise use the visible intersection.
  const x0 = Math.max(b.x, b.ix0), y0 = Math.max(b.y, b.iy0);
  const x1 = Math.min(b.x + b.width, b.ix1), y1 = Math.min(b.y + b.height, b.iy1);
  const padX = Math.min(28, Math.max(8, (x1 - x0) * 0.08));
  const padY = Math.min(28, Math.max(8, (y1 - y0) * 0.08));
  return {
    x: x0 + padX + (x1 - x0 - 2 * padX) * fx,
    y: y0 + padY + (y1 - y0 - 2 * padY) * fy,
  };
}

async function tap(page, scenario, p) {
  if (scenario.touch && page.touchscreen) await page.touchscreen.tap(p.x, p.y);
  else await page.mouse.click(p.x, p.y);
}

async function shapeCount(page) {
  return page.evaluate(async () => {
    const db = await new Promise((resolve, reject) => {
      const req = indexedDB.open("opentakeoff");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    try {
      const tx = db.transaction("meta", "readonly");
      const value = await new Promise((resolve, reject) => {
        const req = tx.objectStore("meta").get("annotations");
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      return Array.isArray(value?.shapes) ? value.shapes.length : 0;
    } finally { db.close(); }
  });
}

async function readAnnotations(page) {
  return page.evaluate(async () => {
    const db = await new Promise((resolve, reject) => {
      const req = indexedDB.open("opentakeoff");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    try {
      const tx = db.transaction("meta", "readonly");
      return await new Promise((resolve, reject) => {
        const req = tx.objectStore("meta").get("annotations");
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } finally { db.close(); }
  });
}

async function waitForShapeCount(page, n) {
  await page.waitForFunction(async (expected) => {
    const db = await new Promise((resolve, reject) => {
      const req = indexedDB.open("opentakeoff");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    try {
      if (!db.objectStoreNames.contains("meta")) return false;
      const tx = db.transaction("meta", "readonly");
      const value = await new Promise((resolve, reject) => {
        const req = tx.objectStore("meta").get("annotations");
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      return (value?.shapes?.length || 0) === expected;
    } finally { db.close(); }
  }, n, { timeout: 10_000 });
}

async function drawMeasurements(page, scenario) {
  // Area
  await page.keyboard.press("a");
  for (const [x, y] of [[0.25, 0.25], [0.55, 0.25], [0.55, 0.52], [0.25, 0.52]]) {
    await tap(page, scenario, await pointInPlan(page, x, y));
  }
  await page.keyboard.press("Enter");
  await waitForShapeCount(page, 1);

  // Linear
  await page.keyboard.press("l");
  await tap(page, scenario, await pointInPlan(page, 0.20, 0.68));
  await tap(page, scenario, await pointInPlan(page, 0.70, 0.68));
  await page.keyboard.press("Enter");
  await waitForShapeCount(page, 2);

  // Count
  await page.keyboard.press("c");
  await tap(page, scenario, await pointInPlan(page, 0.72, 0.38));
  await waitForShapeCount(page, 3);
}

async function exercisePanZoom(page) {
  await page.keyboard.press("v");
  const p = await pointInPlan(page, 0.50, 0.50);
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  await page.mouse.move(p.x + 22, p.y + 16, { steps: 4 });
  await page.mouse.up();
  await page.mouse.move(p.x, p.y);
  await page.mouse.wheel(0, -120);
  await page.waitForTimeout(500);
}

async function exportTakeoff(page) {
  const sheetMenu = page.locator('button[title^="Sheet —"]').first();
  await sheetMenu.waitFor({ state: "visible", timeout: 10_000 });
  await sheetMenu.click();
  const exportButton = page.getByRole("button", { name: "Export takeoff…", exact: true });
  await exportButton.waitFor({ state: "visible", timeout: 5_000 });
  const downloadPromise = page.waitForEvent("download", { timeout: 8_000 });
  await exportButton.click();
  const download = await downloadPromise;
  const text = await (await import("node:fs/promises")).readFile(await download.path(), "utf8");
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed.shapes) || parsed.shapes.length !== 3) throw new Error("Export did not contain the expected 3 shapes");
  return { suggestedFilename: download.suggestedFilename(), shapeCount: parsed.shapes.length, schema: parsed.schema };
}

async function deleteOneAndVerify(page) {
  // Select tool, click near the count point, then Delete.
  await page.keyboard.press("v");
  const p = await pointInPlan(page, 0.72, 0.38);
  await page.mouse.click(p.x, p.y);
  await page.keyboard.press("Delete");
  await waitForShapeCount(page, 2);
}

async function reloadAndVerify(page) {
  await page.waitForFunction(() => document.body?.innerText?.includes("saved"), null, { timeout: 10_000 }).catch(() => {});
  await page.reload({ waitUntil: "networkidle", timeout: 30_000 });
  await page.waitForFunction(() => [...document.querySelectorAll("canvas")].some((c) => {
    const r = c.getBoundingClientRect();
    return r.width >= 150 && r.height >= 150;
  }), null, { timeout: 30_000 });
  await waitForShapeCount(page, 2);
}

async function clearWorkspace(page) {
  await page.keyboard.press("g");
  const manage = page.getByRole("button", { name: "Manage", exact: true });
  await manage.waitFor({ state: "visible", timeout: 10_000 });
  await manage.click();
  const clear = page.getByRole("button", { name: "Clear workspace…", exact: true });
  await clear.waitFor({ state: "visible", timeout: 5_000 });
  await clear.click();
  const confirm = page.getByRole("button", { name: "Clear workspace", exact: true });
  await confirm.waitFor({ state: "visible", timeout: 5_000 });
  await confirm.click();
  await page.waitForFunction(() => /No PDFs yet/i.test(document.body?.innerText || ""), null, { timeout: 10_000 });
}

async function runScenario(scenario) {
  const browser = await scenario.browserType.launch({ headless: true });
  const context = await browser.newContext({ ...scenario.context, acceptDownloads: true });
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(e?.message || String(e)));

  try {
    const response = await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 30_000 });
    if (!response?.ok()) throw new Error(`${scenario.name}: HTTP ${response?.status()}`);

    await importPdfByRealChooser(page);
    await setMetricScale(page);
    await createAndActivateTestCondition(page);
    await drawMeasurements(page, scenario);
    await exercisePanZoom(page);

    const beforeDelete = await readAnnotations(page);
    if ((beforeDelete?.shapes?.length || 0) !== 3) throw new Error(`${scenario.name}: expected 3 shapes before delete`);
    for (const s of beforeDelete.shapes) {
      if (s.measure_role === "count" && s.computed?.count !== 1) throw new Error(`${scenario.name}: count metric invalid`);
      if (s.measure_role === "linear" && !(s.computed?.perimeter_lf > 0)) throw new Error(`${scenario.name}: linear metric invalid`);
      if (s.measure_role === "floor_area" && !(s.computed?.area_sf > 0)) throw new Error(`${scenario.name}: area metric invalid`);
    }

    const exported = await exportTakeoff(page);
    await deleteOneAndVerify(page);
    await reloadAndVerify(page);
    const persisted = await readAnnotations(page);
    await clearWorkspace(page);

    const result = {
      scenario: scenario.name,
      imported: true,
      scale: Object.values(beforeDelete?.scales || {})[0] || null,
      beforeDeleteShapes: beforeDelete.shapes.map((s) => ({ role: s.measure_role, computed: s.computed })),
      export: exported,
      persistedShapeCount: persisted?.shapes?.length || 0,
      pageErrors,
      cleared: (await shapeCount(page)) === 0,
    };
    console.log("M0_STABILITY_SCENARIO=" + JSON.stringify(result));
    if (pageErrors.length) throw new Error(`${scenario.name}: page errors: ${JSON.stringify(pageErrors)}`);
    if (!result.cleared) throw new Error(`${scenario.name}: workspace reset did not clear annotations`);
    console.log(`M0 STABILITY ${scenario.name}: PASS`);
    return result;
  } finally {
    await context.close();
    await browser.close();
  }
}

const results = [];
for (const scenario of scenarios) results.push(await runScenario(scenario));

const summary = results.map((r) => ({
  scenario: r.scenario,
  shapes: r.beforeDeleteShapes.map((s) => ({ role: s.role, computed: s.computed })),
  persistedShapeCount: r.persistedShapeCount,
  cleared: r.cleared,
}));
console.log("M0_STABILITY_MATRIX_RESULT=" + JSON.stringify(summary));
console.log("M0 STABILITY MATRIX: PASS");
