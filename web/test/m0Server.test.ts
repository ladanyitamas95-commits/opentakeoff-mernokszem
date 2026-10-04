import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { server, SECURITY_HEADERS } from "../scripts/serve-m0.mjs";

test("M0 runtime security policy denies browser egress and metadata surfaces", () => {
  assert.match(SECURITY_HEADERS["Content-Security-Policy"], /connect-src 'none'/);
  assert.match(SECURITY_HEADERS["Content-Security-Policy"], /frame-ancestors 'none'/);
  assert.equal(SECURITY_HEADERS["Referrer-Policy"], "no-referrer");
  assert.equal(SECURITY_HEADERS["X-Frame-Options"], "DENY");
  assert.equal(SECURITY_HEADERS["X-DNS-Prefetch-Control"], "off");
  assert.match(SECURITY_HEADERS["Permissions-Policy"], /geolocation=\(\)/);
  assert.match(SECURITY_HEADERS["Permissions-Policy"], /camera=\(\)/);
  assert.match(SECURITY_HEADERS["Permissions-Policy"], /microphone=\(\)/);
});

test("M0 runtime exposes no POST/upload API", async (t) => {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise<void>((resolve) => server.close(() => resolve())));
  const addr = server.address();
  assert.ok(addr && typeof addr === "object");

  const response = await fetch(`http://127.0.0.1:${addr.port}/api/upload`, {
    method: "POST",
    body: "CONFIDENTIAL_CANARY_7F8B91",
  });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET, HEAD");
  assert.match(response.headers.get("content-security-policy") || "", /connect-src 'none'/);
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
});
