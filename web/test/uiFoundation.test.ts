import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import AppShell, { FOUNDATION_NAV_TARGETS } from "../src/components/AppShell.jsx";
import UiFoundationPreview from "../src/components/UiFoundationPreview.jsx";
import {
  MEASUREMENT_STATUSES,
  MEASUREMENT_STATUS_META,
  StatusBadge,
  ValidationBadge,
} from "../src/components/ui/index.js";

test("W01 shell exposes the required Hungarian navigation and context labels", () => {
  const html = renderToStaticMarkup(
    React.createElement(AppShell, null, React.createElement("div", null, "Munkaterület")),
  );
  for (const label of ["Projekt", "Dokumentumok", "Mennyiségfelmérés", "Költségvetés", "Ellenőrzés", "Export"]) {
    assert.match(html, new RegExp(label));
  }
  assert.doesNotMatch(html, />BOQ</);
  for (const label of ["Chat", "Megállapítások", "Kontextus"]) {
    assert.match(html, new RegExp(label));
  }
});

test("W01 shell wires only available foundation destinations", () => {
  assert.deepEqual(FOUNDATION_NAV_TARGETS, {
    project: "/app/projects",
    documents: "/app",
    takeoff: "/",
  });
});

test("W01 measurement status enum matches the frozen domain contract exactly", () => {
  assert.deepEqual(MEASUREMENT_STATUSES, [
    "DRAFT",
    "AI_PROPOSED",
    "REVIEW_REQUIRED",
    "MEASUREMENT_RULE_REQUIRED",
    "SCALE_REVIEW_REQUIRED",
    "INVALID_GEOMETRY",
    "ACCEPTED",
    "EDITED",
    "REJECTED",
  ]);
  assert.deepEqual(Object.keys(MEASUREMENT_STATUS_META), MEASUREMENT_STATUSES);
});

test("W01 badges distinguish AI proposals from accepted measurements with text and icon", () => {
  const ai = renderToStaticMarkup(React.createElement(StatusBadge, { status: "AI_PROPOSED" }));
  const accepted = renderToStaticMarkup(React.createElement(StatusBadge, { status: "ACCEPTED" }));
  assert.match(ai, /AI-javaslat/);
  assert.match(ai, /◇/);
  assert.match(accepted, /Elfogadva/);
  assert.match(accepted, /✓/);
  assert.notEqual(ai, accepted);
});

test("W01 validation badges expose PASS REVIEW ERROR without color-only meaning", () => {
  const html = renderToStaticMarkup(React.createElement(React.Fragment, null,
    React.createElement(ValidationBadge, { status: "PASS" }),
    React.createElement(ValidationBadge, { status: "REVIEW" }),
    React.createElement(ValidationBadge, { status: "ERROR" }),
  ));
  assert.match(html, /PASS/);
  assert.match(html, /REVIEW/);
  assert.match(html, /ERROR/);
  assert.match(html, /✓/);
  assert.match(html, /!/);
  assert.match(html, /×/);
});

test("W01 preview renders primitives without business logic", () => {
  const html = renderToStaticMarkup(React.createElement(UiFoundationPreview));
  assert.match(html, /UI foundation/);
  assert.match(html, /AI-javaslat ≠ elfogadott mérés/);
  assert.match(html, /Export blokkolva/);
  assert.match(html, /Költségvetés/);
  assert.doesNotMatch(html, />BOQ</);
});
