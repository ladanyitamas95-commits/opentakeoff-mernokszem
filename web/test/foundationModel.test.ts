import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FOUNDATION_AUDIT_ACTIONS,
  FOUNDATION_AUDIT_SENSITIVE_KEYS,
  FOUNDATION_DOCUMENT_PROCESSING_STATUSES,
  FOUNDATION_DOCUMENT_TYPES,
  FOUNDATION_PROJECT_STATUSES,
  FOUNDATION_REVIEW_REASONS,
  FOUNDATION_REVIEW_SEVERITIES,
  FOUNDATION_REVIEW_STATUSES,
  appendDocumentVersion,
  createAuditEvent,
  createDocument,
  createDocumentVersion,
  createProject,
  createReviewItem,
  normalizeFoundationState,
  sanitizeAuditMetadata,
} from "../src/lib/foundationModel.js";

const NOW = "2026-09-14T12:00:00.000Z";

const projectInput = () => ({ id: "project-1", name: " Pilot projekt ", created_at: NOW });
const documentInput = () => ({
  id: "document-1",
  project_id: "project-1",
  filename: " terv.pdf ",
  created_at: NOW,
});
const versionInput = () => ({
  id: "version-1",
  document_id: "document-1",
  content_hash: "sha256:abc",
  mime_type: "application/pdf",
  size_bytes: 1024,
  page_count: 2,
  created_at: NOW,
});
const reviewInput = () => ({
  id: "review-1",
  project_id: "project-1",
  entity_type: "document",
  entity_id: "document-1",
  review_reason: "missing_scale",
  created_at: NOW,
});
const auditInput = () => ({
  id: "audit-1",
  actor: "pilot@example.com",
  action: "PROJECT_CREATED",
  entity_type: "project",
  entity_id: "project-1",
  timestamp: NOW,
  correlation_id: "correlation-1",
});

test("Project builder creates every required field and defaults", () => {
  const project = createProject(projectInput());
  assert.deepEqual(project, {
    id: "project-1",
    name: "Pilot projekt",
    created_at: NOW,
    status: "active",
    updated_at: NOW,
  });
  assert.ok(FOUNDATION_PROJECT_STATUSES.includes(project.status));
});

test("Project rejects empty id and empty name with deterministic errors", () => {
  assert.throws(() => createProject({ ...projectInput(), id: " " }), /project\.id must be a non-empty string/);
  assert.throws(() => createProject({ ...projectInput(), name: " " }), /project\.name must be a non-empty string/);
});

test("Document builder creates required fields, defaults and trimmed filename", () => {
  const document = createDocument(documentInput());
  assert.deepEqual(document, {
    id: "document-1",
    project_id: "project-1",
    filename: "terv.pdf",
    created_at: NOW,
    document_type: "other",
    current_version_id: null,
  });
  assert.deepEqual(FOUNDATION_DOCUMENT_TYPES, ["drawing", "cost_schedule", "technical_description", "other"]);
});

test("Document normalizes legacy internal boq without introducing visible BOQ", () => {
  const document = createDocument({ ...documentInput(), document_type: "boq" });
  assert.equal(document.document_type, "cost_schedule");
  assert.doesNotMatch(JSON.stringify(document), /BOQ/);
});

test("DocumentVersion builder creates required fields and defaults", () => {
  const version = createDocumentVersion({ ...versionInput(), processing_status: undefined });
  assert.equal(version.processing_status, "pending");
  assert.equal(version.page_count, 2);
  assert.ok(FOUNDATION_DOCUMENT_PROCESSING_STATUSES.includes(version.processing_status));
});

test("DocumentVersion validates size_bytes", () => {
  for (const size_bytes of [-1, Number.NaN, Number.POSITIVE_INFINITY, "1024"]) {
    assert.throws(
      () => createDocumentVersion({ ...versionInput(), size_bytes } as any),
      /size_bytes must be a finite non-negative number/,
    );
  }
});

test("DocumentVersion validates nullable finite non-negative integer page_count", () => {
  assert.equal(createDocumentVersion({ ...versionInput(), page_count: null }).page_count, null);
  for (const page_count of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(
      () => createDocumentVersion({ ...versionInput(), page_count }),
      /page_count must be null or a finite non-negative integer/,
    );
  }
});

test("appendDocumentVersion returns new records without mutating history", () => {
  const originalDocument = createDocument(documentInput());
  const historicalVersion = createDocumentVersion({ ...versionInput(), id: "version-0" });
  const originalVersions = [historicalVersion];
  const nextVersionInput = { ...versionInput(), id: "version-2" };
  const documentBefore = structuredClone(originalDocument);
  const versionsBefore = structuredClone(originalVersions);
  const versionInputBefore = structuredClone(nextVersionInput);

  const result = appendDocumentVersion(originalDocument, originalVersions, nextVersionInput);

  assert.notEqual(result.document, originalDocument);
  assert.notEqual(result.versions, originalVersions);
  assert.equal(result.document.current_version_id, "version-2");
  assert.equal(result.versions.length, 2);
  assert.equal(result.versions[0], historicalVersion);
  assert.deepEqual(originalDocument, documentBefore);
  assert.deepEqual(originalVersions, versionsBefore);
  assert.deepEqual(nextVersionInput, versionInputBefore);
});

test("ReviewItem accepts every required review reason with defaults", () => {
  for (const review_reason of FOUNDATION_REVIEW_REASONS) {
    const item = createReviewItem({ ...reviewInput(), review_reason });
    assert.equal(item.review_reason, review_reason);
    assert.equal(item.severity, "warning");
    assert.equal(item.blocking, false);
    assert.equal(item.status, "open");
  }
});

test("ReviewItem rejects invalid reason, severity, status and blocking", () => {
  assert.throws(() => createReviewItem({ ...reviewInput(), review_reason: "other" }), /review_reason must be one of/);
  assert.throws(() => createReviewItem({ ...reviewInput(), severity: "urgent" }), /severity must be one of/);
  assert.throws(() => createReviewItem({ ...reviewInput(), status: "closed" }), /status must be one of/);
  assert.throws(() => createReviewItem({ ...reviewInput(), blocking: "yes" }), /blocking must be a boolean/);
  assert.deepEqual(FOUNDATION_REVIEW_SEVERITIES, ["info", "warning", "critical"]);
  assert.deepEqual(FOUNDATION_REVIEW_STATUSES, ["open", "resolved", "dismissed"]);
});

test("AuditEvent accepts only the allowed append-only action vocabulary", () => {
  for (const action of FOUNDATION_AUDIT_ACTIONS) {
    const event = createAuditEvent({ ...auditInput(), action });
    assert.equal(event.action, action);
    assert.equal(event.before_hash, null);
    assert.equal(event.after_hash, null);
  }
  assert.throws(() => createAuditEvent({ ...auditInput(), action: "PROJECT_DELETED" }), /action must be one of/);
});

test("sanitizeAuditMetadata removes sensitive keys case-insensitively and recursively", () => {
  const input = {
    TOKEN: "one",
    Api_Key: "two",
    safe: "retained",
    nested: {
      Authorization: "Bearer secret",
      AccessToken: "three",
      value: 4,
    },
  };
  const before = structuredClone(input);
  const sanitized = sanitizeAuditMetadata(input);
  assert.deepEqual(sanitized, { safe: "retained", nested: { value: 4 } });
  assert.deepEqual(input, before);
  assert.ok(FOUNDATION_AUDIT_SENSITIVE_KEYS.includes("providerError"));
});

test("sanitizeAuditMetadata drops provider errors, raw files, functions and binary values", () => {
  const sanitized = sanitizeAuditMetadata({
    providerError: { message: "private provider detail" },
    rawFile: { name: "plan.pdf", bytes: [1, 2] },
    fileContent: "raw",
    callback() {},
    bytes: new Uint8Array([1, 2, 3]),
    safe: ["one", () => "drop", { password: "drop", keep: true }],
  });
  assert.deepEqual(sanitized, { safe: ["one", { keep: true }] });
});

test("sanitizeAuditMetadata bounds strings, arrays, keys and depth", () => {
  const manyKeys = Object.fromEntries(Array.from({ length: 60 }, (_, index) => [`field_${index}`, index]));
  const sanitized = sanitizeAuditMetadata({
    text: "x".repeat(3000),
    list: Array.from({ length: 60 }, (_, index) => index),
    manyKeys,
    deep: { one: { two: { three: { four: { five: "drop" } } } } },
  });
  assert.equal(sanitized.text.length, 2048);
  assert.equal(sanitized.list.length, 50);
  assert.equal(Object.keys(sanitized.manyKeys).length, 50);
  assert.deepEqual(sanitized.deep, { one: { two: { three: {} } } });
});

test("AuditEvent sanitizes metadata and never preserves sensitive top-level fields", () => {
  const event = createAuditEvent({
    ...auditInput(),
    token: "drop",
    providerError: "drop",
    metadata: { refreshToken: "drop", reason: "created" },
  });
  assert.equal("token" in event, false);
  assert.equal("providerError" in event, false);
  assert.deepEqual(event.metadata, { reason: "created" });
});

test("normalizeFoundationState hydrates every missing or invalid collection", () => {
  assert.deepEqual(normalizeFoundationState(null), {
    projects: [],
    documents: [],
    document_versions: [],
    review_items: [],
    audit_events: [],
  });
  const normalized = normalizeFoundationState({ projects: {}, documents: "bad" });
  assert.deepEqual(normalized.projects, []);
  assert.deepEqual(normalized.documents, []);
});

test("normalizeFoundationState drops unsafe values and preserves safe future fields", () => {
  const input = {
    projects: [{ id: "project-1", callback() {}, bytes: new Uint8Array([1]) }],
    future_contract: { enabled: true, labels: ["one", "two"] },
    unsafe_function() {},
    rawFile: { name: "plan.pdf" },
  };
  const beforeProjectId = input.projects[0].id;
  const normalized = normalizeFoundationState(input);
  assert.deepEqual(normalized.projects, [{ id: "project-1" }]);
  assert.deepEqual(normalized.future_contract, { enabled: true, labels: ["one", "two"] });
  assert.equal("unsafe_function" in normalized, false);
  assert.equal("rawFile" in normalized, false);
  assert.equal(input.projects[0].id, beforeProjectId);
  assert.equal(typeof input.projects[0].callback, "function");
});

test("all builders preserve safe future fields and do not mutate inputs", () => {
  const inputs = [
    [createProject, { ...projectInput(), future: { value: 1 } }],
    [createDocument, { ...documentInput(), future: { value: 1 } }],
    [createDocumentVersion, { ...versionInput(), future: { value: 1 } }],
    [createReviewItem, { ...reviewInput(), future: { value: 1 } }],
    [createAuditEvent, { ...auditInput(), future: { value: 1 } }],
  ] as const;
  for (const [builder, input] of inputs) {
    const before = structuredClone(input);
    const output = builder(input as any);
    assert.deepEqual(input, before);
    assert.deepEqual(output.future, { value: 1 });
    assert.notEqual(output.future, input.future);
  }
});

test("foundation contract source introduces no visible user-facing BOQ label", async () => {
  const source = await import("node:fs/promises").then((fs) => fs.readFile(
    new URL("../src/lib/foundationModel.js", import.meta.url),
    "utf8",
  ));
  assert.doesNotMatch(source, /["'`]BOQ["'`]/);
});
