import { chromium } from "playwright";

const targetUrl = process.env.M0_URL || "http://127.0.0.1:4173/";
const pdfPath = process.env.M0_PDF;
if (!pdfPath) throw new Error("M0_PDF is required");

const allowedOrigin = new URL(targetUrl).origin;
const network = [];
const websockets = [];
const failedRequests = [];
const pageErrors = [];
const consoleErrors = [];

function asUrl(raw) {
  try { return new URL(raw, targetUrl); } catch { return null; }
}
function isNetworkProtocol(u) {
  return !!u && ["http:", "https:", "ws:", "wss:"].includes(u.protocol);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();

context.on("request", (req) => {
  const body = req.postDataBuffer();
  network.push({
    method: req.method(),
    url: req.url(),
    resourceType: req.resourceType(),
    bodyBytes: body?.length || 0,
  });
});
context.on("requestfailed", (req) => {
  failedRequests.push({ method: req.method(), url: req.url(), failure: req.failure()?.errorText || "unknown" });
});

await context.addInitScript(() => {
  const attempts = [];
  Object.defineProperty(window, "__M0_EGRESS_ATTEMPTS__", { value: attempts, configurable: false });
  const log = (kind, rawUrl, method = "GET") => {
    try {
      const u = new URL(String(rawUrl ?? ""), location.href);
      if (["http:", "https:", "ws:", "wss:"].includes(u.protocol)) {
        attempts.push({ kind, url: u.href, method: String(method || "GET").toUpperCase() });
      }
    } catch {}
  };

  const nativeFetch = window.fetch.bind(window);
  window.fetch = function(input, init) {
    const rawUrl = typeof input === "string" || input instanceof URL ? input : input?.url;
    const method = init?.method || input?.method || "GET";
    log("fetch", rawUrl, method);
    return nativeFetch(input, init);
  };

  const nativeOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    log("xhr", url, method);
    return nativeOpen.call(this, method, url, ...rest);
  };

  const NativeWebSocket = window.WebSocket;
  function TrackedWebSocket(url, protocols) {
    log("websocket", url, "CONNECT");
    return protocols === undefined ? new NativeWebSocket(url) : new NativeWebSocket(url, protocols);
  }
  TrackedWebSocket.prototype = NativeWebSocket.prototype;
  for (const key of ["CONNECTING", "OPEN", "CLOSING", "CLOSED"]) {
    Object.defineProperty(TrackedWebSocket, key, { value: NativeWebSocket[key] });
  }
  window.WebSocket = TrackedWebSocket;

  if (window.EventSource) {
    const NativeEventSource = window.EventSource;
    function TrackedEventSource(url, options) {
      log("eventsource", url, "GET");
      return new NativeEventSource(url, options);
    }
    TrackedEventSource.prototype = NativeEventSource.prototype;
    window.EventSource = TrackedEventSource;
  }

  if (navigator.sendBeacon) {
    const nativeBeacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = function(url, data) {
      log("beacon", url, "POST");
      return nativeBeacon(url, data);
    };
  }
});

const page = await context.newPage();
page.on("websocket", (ws) => websockets.push(ws.url()));
page.on("pageerror", (err) => pageErrors.push(err?.stack || err?.message || String(err)));
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});

async function dumpBootDiagnostics(reason) {
  const snapshot = await page.evaluate(() => ({
    url: location.href,
    title: document.title,
    readyState: document.readyState,
    rootHtml: document.getElementById("root")?.innerHTML?.slice(0, 4000) || "",
    bodyText: document.body?.innerText?.slice(0, 2000) || "",
    scripts: [...document.scripts].map((s) => s.src || "[inline]"),
    sheetInputs: [...document.querySelectorAll('input[name="sheet-file"]')].map((el, index) => ({
      index,
      connected: el.isConnected,
      files: el.files?.length || 0,
      parentClass: el.parentElement?.className || "",
    })),
    canvases: [...document.querySelectorAll("canvas")].map((c, index) => {
      const r = c.getBoundingClientRect();
      return { index, width: c.width, height: c.height, cssWidth: r.width, cssHeight: r.height };
    }),
  })).catch((err) => ({ diagnosticError: err?.message || String(err) }));
  console.error("M0_BROWSER_BOOT_DIAGNOSTICS=" + JSON.stringify({ reason, snapshot, pageErrors, consoleErrors, failedRequests }));
}

try {
  const response = await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 30_000 });
  if (!response?.ok()) throw new Error(`M0 page load failed: HTTP ${response?.status()}`);

  const csp = response.headers()["content-security-policy"] || "";
  if (!/connect-src\s+'none'/.test(csp)) {
    throw new Error(`Production response is missing connect-src 'none' CSP: ${csp}`);
  }

  // Two sheet-file inputs are expected while the empty-project PlanNavigator is
  // mounted: the first belongs to TakeoffCanvas, the second to PlanNavigator.
  // Both call the same ingest path, but targeting the primary input keeps the
  // probe stable under Playwright strict mode.
  const inputs = page.locator('input[name="sheet-file"]');
  const input = inputs.first();
  try {
    await input.waitFor({ state: "attached", timeout: 15_000 });
  } catch (err) {
    await dumpBootDiagnostics("sheet-file input did not mount");
    throw err;
  }
  if ((await inputs.count()) < 1) {
    await dumpBootDiagnostics("no sheet-file input found");
    throw new Error("M0 sheet-file input missing");
  }
  await input.setInputFiles(pdfPath);

  try {
    await page.waitForFunction(() => {
      const body = document.body?.innerText || "";
      // Successful ingest moves the app out of the empty-project landing view.
      // Use the rendered CSS box here, not canvas.width/height: M0's tile
      // compositor is free to choose its backing-store density independently.
      const leftEmptyProjectView = !/No PDFs yet/i.test(body);
      const hasRenderedPlanCanvas = [...document.querySelectorAll("canvas")]
        .some((c) => {
          const r = c.getBoundingClientRect();
          return r.width >= 150 && r.height >= 150;
        });
      return leftEmptyProjectView && hasRenderedPlanCanvas;
    }, null, { timeout: 30_000 });
  } catch (err) {
    await dumpBootDiagnostics("PDF import did not reach a rendered plan surface");
    throw err;
  }

  // Exercise the real canvas without requiring a calibrated scale: pan + zoom.
  const canvases = page.locator("canvas");
  let best = null;
  for (let i = 0; i < await canvases.count(); i++) {
    const box = await canvases.nth(i).boundingBox();
    if (!box || box.width < 150 || box.height < 150) continue;
    const area = box.width * box.height;
    if (!best || area > best.area) best = { area, box };
  }
  if (!best) throw new Error("No usable rendered plan canvas found after PDF import");

  const x = best.box.x + best.box.width * 0.55;
  const y = best.box.y + best.box.height * 0.55;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 24, y + 18, { steps: 4 });
  await page.mouse.up();
  await page.mouse.wheel(0, -140);
  await page.waitForTimeout(2_000);

  const attempts = await page.evaluate(() => window.__M0_EGRESS_ATTEMPTS__ || []);
  const perfResources = await page.evaluate(() => performance.getEntriesByType("resource").map((e) => e.name));

  const externalNetwork = network.filter((r) => {
    const u = asUrl(r.url);
    return isNetworkProtocol(u) && u.origin !== allowedOrigin;
  });
  const mutatingSameOrigin = network.filter((r) => {
    const u = asUrl(r.url);
    return isNetworkProtocol(u) && u.origin === allowedOrigin && !["GET", "HEAD"].includes(r.method);
  });
  const externalAttempts = attempts.filter((a) => {
    const u = asUrl(a.url);
    return isNetworkProtocol(u) && u.origin !== allowedOrigin;
  });
  const forbiddenTransportAttempts = attempts.filter((a) => ["websocket", "eventsource", "beacon"].includes(a.kind));
  const mutatingSameOriginAttempts = attempts.filter((a) => {
    const u = asUrl(a.url);
    return isNetworkProtocol(u) && u.origin === allowedOrigin && !["GET", "HEAD"].includes(a.method);
  });
  const externalPerfResources = perfResources.filter((raw) => {
    const u = asUrl(raw);
    return isNetworkProtocol(u) && u.origin !== allowedOrigin;
  });

  const result = {
    pageOrigin: allowedOrigin,
    totalNetworkRequests: network.length,
    externalNetworkRequests: externalNetwork.length,
    sameOriginMutatingRequests: mutatingSameOrigin.length,
    websocketConnections: websockets.length,
    externalApiAttempts: externalAttempts.length,
    forbiddenTransportAttempts: forbiddenTransportAttempts.length,
    sameOriginMutatingApiAttempts: mutatingSameOriginAttempts.length,
    externalPerformanceResources: externalPerfResources.length,
    requestFailures: failedRequests.length,
    pageErrors: pageErrors.length,
    consoleErrors: consoleErrors.length,
    interaction: "PDF import + rendered-plan pan + zoom",
  };
  console.log("M0_BROWSER_EGRESS_RESULT=" + JSON.stringify(result));

  const failures = [];
  if (externalNetwork.length) failures.push(`external network requests: ${JSON.stringify(externalNetwork)}`);
  if (mutatingSameOrigin.length) failures.push(`same-origin mutating requests: ${JSON.stringify(mutatingSameOrigin)}`);
  if (websockets.length) failures.push(`WebSocket connections: ${JSON.stringify(websockets)}`);
  if (externalAttempts.length) failures.push(`external API attempts: ${JSON.stringify(externalAttempts)}`);
  if (forbiddenTransportAttempts.length) failures.push(`WebSocket/EventSource/beacon attempts: ${JSON.stringify(forbiddenTransportAttempts)}`);
  if (mutatingSameOriginAttempts.length) failures.push(`same-origin mutating API attempts: ${JSON.stringify(mutatingSameOriginAttempts)}`);
  if (externalPerfResources.length) failures.push(`external performance resources: ${JSON.stringify(externalPerfResources)}`);
  if (pageErrors.length) failures.push(`page runtime errors: ${JSON.stringify(pageErrors)}`);

  if (failures.length) {
    console.error("M0 REAL-BROWSER EGRESS: FAIL");
    for (const failure of failures) console.error(failure);
    process.exitCode = 1;
  } else {
    console.log("M0 REAL-BROWSER EGRESS: PASS");
  }
} finally {
  await context.close();
  await browser.close();
}
