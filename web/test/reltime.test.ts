// reltime.ts — compact relative-age + explicit-UTC-timestamp helpers for the
// Captures panel row. Both take their "now" (or read Date.parse of `iso`)
// deterministically, so every test pins a fixed epoch — no real-clock flake.
// Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { relativeAge, absoluteUtc } from "../src/lib/reltime.ts";

// Fixed "now" used across every relativeAge case: 2026-08-25T19:58:00Z — the
// same instant the brief's absoluteUtc example ("2026. aug. 25. 19:58 (UTC)")
// is built from, so a passing absoluteUtc test on this exact instant doubles
// as a sanity check that the two helpers agree.
const NOW = Date.UTC(2026, 7, 25, 19, 58, 0);
const SEC = 1000, MIN = 60 * SEC, HOUR = 60 * MIN, DAY = 24 * HOUR;
const isoAt = (ms: number) => new Date(ms).toISOString();

// ── relativeAge: bucket boundaries ──────────────────────────────────────────
test("relativeAge: < 45s → just now (interior + right at the 44s edge)", () => {
  assert.equal(relativeAge(isoAt(NOW - 30 * SEC), NOW), "éppen most");
  assert.equal(relativeAge(isoAt(NOW - 44 * SEC), NOW), "éppen most");
});

test("relativeAge: 45s boundary flips just-now → minutes (rounds up to 1m, the 'min 1' floor)", () => {
  assert.equal(relativeAge(isoAt(NOW - 45 * SEC), NOW), "1 perce");
});

test("relativeAge: minutes bucket, interior + just-under-60m edge", () => {
  assert.equal(relativeAge(isoAt(NOW - 5 * MIN), NOW), "5 perce");
  assert.equal(relativeAge(isoAt(NOW - 59 * MIN), NOW), "59 perce");
});

test("relativeAge: 60m boundary flips minutes → hours", () => {
  assert.equal(relativeAge(isoAt(NOW - 60 * MIN), NOW), "1 órája");
});

test("relativeAge: hours bucket, interior + just-under-24h edge", () => {
  assert.equal(relativeAge(isoAt(NOW - 5 * HOUR), NOW), "5 órája");
  assert.equal(relativeAge(isoAt(NOW - 23 * HOUR), NOW), "23 órája");
});

test("relativeAge: 24h boundary flips hours → yesterday", () => {
  assert.equal(relativeAge(isoAt(NOW - 24 * HOUR), NOW), "tegnap");
});

test("relativeAge: yesterday bucket holds through the 47h edge", () => {
  assert.equal(relativeAge(isoAt(NOW - 47 * HOUR), NOW), "tegnap");
});

test("relativeAge: 48h boundary flips yesterday → days", () => {
  assert.equal(relativeAge(isoAt(NOW - 48 * HOUR), NOW), "2 napja");
});

test("relativeAge: days bucket, interior + just-under-7d edge", () => {
  assert.equal(relativeAge(isoAt(NOW - 3 * DAY), NOW), "3 napja");
  assert.equal(relativeAge(isoAt(NOW - 6 * DAY), NOW), "6 napja");
});

test("relativeAge: 7d boundary flips days → a plain UTC date", () => {
  // NOW - 7d = 2026-08-18T19:58:00Z
  assert.equal(relativeAge(isoAt(NOW - 7 * DAY), NOW), "2026. aug. 18.");
});

test("relativeAge: older date is formatted in UTC regardless of local wall-clock", () => {
  assert.equal(relativeAge("2020-01-01T00:00:00Z", NOW), "2020. jan. 1.");
});

// ── relativeAge: guards ─────────────────────────────────────────────────────
test("relativeAge: non-finite / unparseable iso → '' (never throw)", () => {
  assert.equal(relativeAge("", NOW), "");
  assert.equal(relativeAge("not-a-date", NOW), "");
  // deliberately wrong runtime type (a caller could pass one) — guard must not throw
  assert.equal(relativeAge(undefined as any, NOW), "");
  assert.equal(relativeAge(null as any, NOW), "");
});

// ── absoluteUtc ──────────────────────────────────────────────────────────────
test("absoluteUtc: explicit human timestamp, zone spelled out, formatted in UTC", () => {
  assert.equal(absoluteUtc("2026-08-25T19:58:00Z"), "2026. aug. 25. 19:58 (UTC)");
  assert.equal(absoluteUtc("2026-01-05T00:05:00Z"), "2026. jan. 5. 0:05 (UTC)");
});

test("absoluteUtc: unparseable → '' (never throw)", () => {
  assert.equal(absoluteUtc(""), "");
  assert.equal(absoluteUtc("garbage"), "");
  assert.equal(absoluteUtc(undefined as any), "");
});
