import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StaticRouter } from "react-router";
import {
  PilotAccessBoundaryContent,
  PilotAccessView,
} from "../src/components/PilotAccessBoundary.jsx";
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

function renderBoundary(
  access: Record<string, unknown>,
  location = "/app",
) {
  return renderToStaticMarkup(
    React.createElement(
      StaticRouter,
      { location },
      React.createElement(
        PilotAccessBoundaryContent,
        {
          ...access,
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
  assert.equal(resolvePilotAccess({ googleConfigured: true }), PILOT_ACCESS_STATES.BLOCKED_CONFIG);
  assert.equal(resolvePilotAccess({ googleConfigured: true, projectsRootConfigured: true, ready: true, user: "truthy" }), PILOT_ACCESS_STATES.UNAUTHENTICATED);
});

test("pilot access maps the required state matrix deterministically", () => {
  assert.equal(resolvePilotAccess({ googleConfigured: false, projectsRootConfigured: true, ready: true, user: { sub: "u1" } }), PILOT_ACCESS_STATES.BLOCKED_CONFIG);
  assert.equal(resolvePilotAccess({ googleConfigured: true, projectsRootConfigured: false, ready: true, user: { sub: "u1" } }), PILOT_ACCESS_STATES.BLOCKED_CONFIG);
  assert.equal(resolvePilotAccess({ googleConfigured: true, projectsRootConfigured: true, ready: false, user: null }), PILOT_ACCESS_STATES.LOADING);
  assert.equal(resolvePilotAccess({ googleConfigured: true, projectsRootConfigured: true, user: null }), PILOT_ACCESS_STATES.LOADING);
  assert.equal(resolvePilotAccess({ googleConfigured: true, projectsRootConfigured: true, ready: true, user: null }), PILOT_ACCESS_STATES.UNAUTHENTICATED);
  assert.equal(resolvePilotAccess({ googleConfigured: true, projectsRootConfigured: true, ready: true, user: { email: "pilot@example.com" } }), PILOT_ACCESS_STATES.AUTHORIZED);
});

test("rendered pilot boundary matrix never exposes private children before authorization", () => {
  const cases = [
    { googleConfigured: false, projectsRootConfigured: true, ready: true, user: { sub: "u1" } },
    { googleConfigured: true, projectsRootConfigured: false, ready: true, user: { sub: "u1" } },
    { googleConfigured: true, projectsRootConfigured: true, ready: false, user: { sub: "u1" } },
    { googleConfigured: true, projectsRootConfigured: true, ready: true, user: null },
    { googleConfigured: true, projectsRootConfigured: true, ready: true, user: { email: " " } },
  ];
  for (const access of cases) {
    assert.doesNotMatch(renderBoundary(access), /PRIVATE_PROJECT_CONTENT/);
  }
  assert.match(renderBoundary({
    googleConfigured: true,
    projectsRootConfigured: true,
    ready: true,
    user: { sub: "pilot-user" },
  }), /PRIVATE_PROJECT_CONTENT/);
});

test("unknown view state fails closed", () => {
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

test("route, query and project identifiers never grant pilot access", () => {
  const injectedIdentifiers = {
    pathname: "/app/projects",
    search: "?project=fake",
    projectId: "fake",
  };
  assert.equal(resolvePilotAccess(injectedIdentifiers), PILOT_ACCESS_STATES.BLOCKED_CONFIG);
  assert.equal(resolvePilotAccess({
    ...injectedIdentifiers,
    googleConfigured: true,
    projectsRootConfigured: true,
    ready: true,
    user: null,
  }), PILOT_ACCESS_STATES.UNAUTHENTICATED);
  assert.doesNotMatch(renderBoundary({
    googleConfigured: true,
    projectsRootConfigured: true,
    ready: true,
    user: null,
    projectId: "fake",
  }, "/app/projects?project=fake"), /PRIVATE_PROJECT_CONTENT/);
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
  assert.equal(isPilotAppPath("/app?project=fake"), true);
  assert.equal(isPilotAppPath("/app/projects?project=fake"), true);
  assert.equal(isPilotAppPath("/application"), false);
  assert.equal(isPilotAppPath(42), false);
});
