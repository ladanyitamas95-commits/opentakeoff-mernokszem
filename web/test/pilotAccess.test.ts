import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StaticRouter } from "react-router";
import { PilotAccessView } from "../src/components/PilotAccessBoundary.jsx";
import {
  PILOT_ACCESS_STATES,
  PILOT_APP_ROUTES,
  isPilotAppPath,
  resolvePilotAccess,
} from "../src/lib/pilotAccess.js";

function renderAccess(state: string) {
  return renderToStaticMarkup(
    React.createElement(
      StaticRouter,
      { location: "/app" },
      React.createElement(
        PilotAccessView,
        {
          state,
          onSignIn() {},
          children: React.createElement("div", null, "PRIVATE_PROJECT_CONTENT"),
        },
      ),
    ),
  );
}

test("pilot access defaults and malformed inputs fail closed", () => {
  assert.equal(resolvePilotAccess(), PILOT_ACCESS_STATES.BLOCKED_CONFIG);
  assert.equal(resolvePilotAccess(null), PILOT_ACCESS_STATES.BLOCKED_CONFIG);
  assert.equal(resolvePilotAccess({ configured: true }), PILOT_ACCESS_STATES.BLOCKED_CONFIG);
  assert.equal(resolvePilotAccess({ configured: true, ready: true, user: "truthy" }), PILOT_ACCESS_STATES.UNAUTHENTICATED);
});

test("pilot access maps the four explicit states deterministically", () => {
  assert.equal(resolvePilotAccess({ configured: false, ready: true, user: { sub: "u1" } }), PILOT_ACCESS_STATES.BLOCKED_CONFIG);
  assert.equal(resolvePilotAccess({ configured: true, ready: false, user: null }), PILOT_ACCESS_STATES.LOADING);
  assert.equal(resolvePilotAccess({ configured: true, ready: true, user: null }), PILOT_ACCESS_STATES.UNAUTHENTICATED);
  assert.equal(resolvePilotAccess({ configured: true, ready: true, user: { email: "pilot@example.com" } }), PILOT_ACCESS_STATES.AUTHORIZED);
});

test("non-authorized access views never render private project children", () => {
  for (const state of [
    PILOT_ACCESS_STATES.LOADING,
    PILOT_ACCESS_STATES.UNAUTHENTICATED,
    PILOT_ACCESS_STATES.BLOCKED_CONFIG,
    "unknown_future_state",
  ]) {
    assert.doesNotMatch(renderAccess(state), /PRIVATE_PROJECT_CONTENT/);
  }
  assert.match(renderAccess(PILOT_ACCESS_STATES.AUTHORIZED), /PRIVATE_PROJECT_CONTENT/);
});

test("access views expose Hungarian loading, sign-in and configuration states", () => {
  assert.match(renderAccess(PILOT_ACCESS_STATES.LOADING), /Pilot-hozzáférés ellenőrzése/);
  assert.match(renderAccess(PILOT_ACCESS_STATES.UNAUTHENTICATED), /Bejelentkezés szükséges/);
  assert.match(renderAccess(PILOT_ACCESS_STATES.BLOCKED_CONFIG), /pilot hozzáférés nincs konfigurálva/);
});

test("route contract preserves public surfaces and identifies every app subpath as protected", () => {
  assert.deepEqual(PILOT_APP_ROUTES, {
    local: "/",
    foundation: "/ui-foundation",
    app: "/app",
    projects: "/app/projects",
  });
  assert.equal(isPilotAppPath("/"), false);
  assert.equal(isPilotAppPath("/ui-foundation"), false);
  assert.equal(isPilotAppPath("/app"), true);
  assert.equal(isPilotAppPath("/app/projects"), true);
  assert.equal(isPilotAppPath("/application"), false);
});
