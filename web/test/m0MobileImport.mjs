import { chromium, webkit, devices } from "playwright";

const targetUrl = process.env.M0_URL || "http://127.0.0.1:4173/";
const pdfPath = process.env.M0_PDF;
if (!pdfPath) throw new Error("M0_PDF is required");

const iphone = devices["iPhone 15"] || devices["iPhone 14"] || {
  viewport: { width: 390, height: 844 },
  screen: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1",
};

const scenarios = [
  { name: "chromium-desktop", browserType: chromium, context: {} },
  { name: "webkit-iphone", browserType: webkit, context: { ...iphone } },
];

async function waitForRenderedPlan(page) {
  await page.waitForFunction(() => {
    const body = document.body?.innerText || "";
    const leftEmptyProjectView = !/No PDFs yet/i.test(body);
    const hasRenderedPlanCanvas = [...document.querySelectorAll("canvas")].some((c) => {
      const r = c.getBoundingClientRect();
      return r.width >= 150 && r.height >= 150;
    });
    return leftEmptyProjectView && hasRenderedPlanCanvas;
  }, null, { timeout: 30_000 });
}

async function installDiagnostics(context) {
  await context.addInitScript(() => {
    const events = [];
    Object.defineProperty(window, "__M0_IMPORT_DIAG__", { value: events, configurable: false });
    const push = (kind, el, extra = {}) => {
      const inputs = [...document.querySelectorAll('input[name="sheet-file"]')];
      events.push({
        kind,
        inputIndex: el instanceof HTMLInputElement ? inputs.indexOf(el) : -1,
        inputName: el instanceof HTMLInputElement ? el.name : "",
        fileCount: el instanceof HTMLInputElement ? (el.files?.length || 0) : 0,
        trusted: extra.trusted ?? null,
        ts: Math.round(performance.now()),
      });
    };
    const nativeClick = HTMLInputElement.prototype.click;
    HTMLInputElement.prototype.click = function(...args) {
      if (this.type === "file") push("programmatic-input-click", this);
      return nativeClick.apply(this, args);
    };
    for (const type of ["click", "input", "change"]) {
      document.addEventListener(type, (event) => {
        const el = event.target;
        if (el instanceof HTMLInputElement && el.type === "file" && el.name === "sheet-file") {
          push("input-" + type, el, { trusted: event.isTrusted });
        }
      }, true);
    }
  });
}

async function chooserFromUserClick(page, locator, label) {
  await locator.waitFor({ state: "visible", timeout: 15_000 });
  const actionability = await locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const top = document.elementFromPoint(x, y);
    return {
      rect: { x: r.x, y: r.y, width: r.width, height: r.height },
      topTag: top?.tagName || null,
      topText: (top?.textContent || "").trim().slice(0, 80),
      topClass: typeof top?.className === "string" ? top.className : "",
      targetOwnsPoint: top === el || el.contains(top),
    };
  });
  const chooserPromise = page.waitForEvent("filechooser", { timeout: 8_000 });
  await locator.click({ timeout: 8_000 });
  const chooser = await chooserPromise;
  const element = chooser.element();
  const inputIndex = await element.evaluate((el) => [...document.querySelectorAll('input[name="sheet-file"]')].indexOf(el));
  return { chooser, inputIndex, actionability, label };
}

async function runScenario(scenario) {
  const browser = await scenario.browserType.launch({ headless: true });
  const context = await browser.newContext({ ...scenario.context, acceptDownloads: true });
  await installDiagnostics(context);
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", (err) => pageErrors.push(err?.stack || err?.message || String(err)));

  try {
    const response = await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 30_000 });
    if (!response?.ok()) throw new Error(scenario.name + ": M0 page load failed: HTTP " + response?.status());

    const initial = await page.evaluate(() => ({
      sheetInputs: [...document.querySelectorAll('input[name="sheet-file"]')].map((el, index) => ({
        index,
        display: getComputedStyle(el).display,
        visibility: getComputedStyle(el).visibility,
        connected: el.isConnected,
        multiple: el.multiple,
        accept: el.accept,
      })),
      viewport: { width: innerWidth, height: innerHeight },
    }));

    // Critical path #1: empty-project CTA -> native file chooser. This is the
    // path the old gate skipped by calling setInputFiles() directly.
    const landing = page.getByRole("button", { name: /Open your plans/i }).first();
    const first = await chooserFromUserClick(page, landing, "empty-project CTA");
    await first.chooser.setFiles(pdfPath);
    await waitForRenderedPlan(page);

    // Critical path #2: with a plan already open, the top-bar Open button must
    // still be physically reachable on the mobile viewport and open the chooser.
    const topbarOpen = page.locator('button[title^="Open plans"]').first();
    const second = await chooserFromUserClick(page, topbarOpen, "top-bar Open");
    await second.chooser.setFiles(pdfPath);
    await waitForRenderedPlan(page);

    // Critical path #3: chooser cancellation/empty selection must not wedge UI.
    const third = await chooserFromUserClick(page, topbarOpen, "top-bar Open cancel");
    await third.chooser.setFiles([]);
    await page.waitForTimeout(250);
    await topbarOpen.waitFor({ state: "visible", timeout: 5_000 });

    const finalState = await page.evaluate(() => ({
      events: window.__M0_IMPORT_DIAG__ || [],
      sheetInputs: [...document.querySelectorAll('input[name="sheet-file"]')].map((el, index) => ({
        index,
        files: el.files?.length || 0,
        connected: el.isConnected,
      })),
      canvases: [...document.querySelectorAll("canvas")].map((c) => {
        const r = c.getBoundingClientRect();
        return { width: r.width, height: r.height };
      }).filter((x) => x.width >= 150 && x.height >= 150).length,
    }));

    const result = {
      scenario: scenario.name,
      initial,
      chooserInputIndexes: [first.inputIndex, second.inputIndex, third.inputIndex],
      actionability: [first, second, third].map(({ label, inputIndex, actionability }) => ({ label, inputIndex, ...actionability })),
      finalState,
      pageErrors,
      consoleErrors,
    };
    console.log("M0_MOBILE_IMPORT_DIAGNOSTIC=" + JSON.stringify(result));

    if (pageErrors.length) throw new Error(scenario.name + ": page errors: " + JSON.stringify(pageErrors));
    if (finalState.canvases < 1) throw new Error(scenario.name + ": rendered plan canvas disappeared");
    if ([first, second, third].some((x) => x.inputIndex < 0)) throw new Error(scenario.name + ": file chooser was not associated with a sheet-file input");
    if ([first, second, third].some((x) => !x.actionability.targetOwnsPoint)) {
      throw new Error(scenario.name + ": a visible import control is covered at its click point: " + JSON.stringify(result.actionability));
    }
    console.log("M0 MOBILE IMPORT " + scenario.name + ": PASS");
    return result;
  } finally {
    await context.close();
    await browser.close();
  }
}

const results = [];
for (const scenario of scenarios) results.push(await runScenario(scenario));
console.log("M0_MOBILE_IMPORT_RESULT=" + JSON.stringify(results.map((r) => ({ scenario: r.scenario, chooserInputIndexes: r.chooserInputIndexes, actionability: r.actionability }))));
console.log("M0 MOBILE IMPORT DIAGNOSTIC: PASS");
