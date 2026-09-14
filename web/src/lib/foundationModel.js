export const FOUNDATION_PROJECT_STATUSES = Object.freeze(["active", "archived"]);
export const FOUNDATION_DOCUMENT_TYPES = Object.freeze([
  "drawing",
  "cost_schedule",
  "technical_description",
  "other",
]);
export const FOUNDATION_DOCUMENT_PROCESSING_STATUSES = Object.freeze([
  "pending",
  "processed",
  "failed",
]);
export const FOUNDATION_REVIEW_STATUSES = Object.freeze(["open", "resolved", "dismissed"]);
export const FOUNDATION_REVIEW_SEVERITIES = Object.freeze(["info", "warning", "critical"]);
export const FOUNDATION_REVIEW_REASONS = Object.freeze([
  "missing_scale",
  "mapping_issue",
  "unit_mismatch",
  "significant_discrepancy",
  "missing_source",
  "export_blocking",
]);
export const FOUNDATION_AUDIT_ACTIONS = Object.freeze([
  "PROJECT_CREATED",
  "DOCUMENT_UPLOADED",
  "DOCUMENT_PROCESSED",
]);
export const FOUNDATION_AUDIT_SENSITIVE_KEYS = Object.freeze([
  "token",
  "secret",
  "password",
  "authorization",
  "apiKey",
  "api_key",
  "pdfBytes",
  "rawFile",
  "fileContent",
  "providerError",
  "accessToken",
  "refreshToken",
]);

const FOUNDATION_COLLECTIONS = Object.freeze([
  "projects",
  "documents",
  "document_versions",
  "review_items",
  "audit_events",
]);
const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const METADATA_MAX_DEPTH = 5;
const METADATA_MAX_KEYS = 50;
const METADATA_MAX_ARRAY_ITEMS = 50;
const METADATA_MAX_STRING_LENGTH = 2048;
const DROP = Symbol("drop");
const SENSITIVE_KEY_PATTERNS = FOUNDATION_AUDIT_SENSITIVE_KEYS.map(normalizeKeyPattern);

function normalizeKeyPattern(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isPlainObject(value) {
  if (!value || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isSensitiveKey(key) {
  const normalized = normalizeKeyPattern(key);
  return SENSITIVE_KEY_PATTERNS.some((pattern) => normalized.includes(pattern));
}

function isBinaryLike(value) {
  if (!value || typeof value !== "object") return false;
  if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) return true;
  const constructorName = value.constructor?.name;
  if (constructorName === "Blob" || constructorName === "File") return true;
  return typeof value.arrayBuffer === "function"
    && typeof value.name === "string"
    && Number.isFinite(value.size);
}

function sanitizeValue(value, options, depth, seen) {
  if (value == null || typeof value === "boolean") return value;
  if (typeof value === "string") {
    return options.stringLimit == null ? value : value.slice(0, options.stringLimit);
  }
  if (typeof value === "number") return Number.isFinite(value) ? value : DROP;
  if (["function", "symbol", "bigint", "undefined"].includes(typeof value)) return DROP;
  if (isBinaryLike(value) || depth >= options.maxDepth || seen.has(value)) return DROP;

  seen.add(value);
  if (Array.isArray(value)) {
    const source = options.arrayLimit == null ? value : value.slice(0, options.arrayLimit);
    const result = source
      .map((item) => sanitizeValue(item, options, depth + 1, seen))
      .filter((item) => item !== DROP);
    seen.delete(value);
    return result;
  }
  if (!isPlainObject(value)) {
    seen.delete(value);
    return DROP;
  }

  const result = {};
  const entries = Object.entries(value);
  const source = options.keyLimit == null ? entries : entries.slice(0, options.keyLimit);
  for (const [key, child] of source) {
    if (isSensitiveKey(key)) continue;
    const sanitized = sanitizeValue(child, options, depth + 1, seen);
    if (sanitized !== DROP) result[key] = sanitized;
  }
  seen.delete(value);
  return result;
}

function sanitizePlainObject(input, options) {
  if (!isPlainObject(input)) return {};
  const sanitized = sanitizeValue(input, options, 0, new WeakSet());
  return sanitized === DROP ? {} : sanitized;
}

function safeRecord(input, label) {
  if (!isPlainObject(input)) throw new Error(`foundationModel: ${label} input must be a plain object`);
  return sanitizePlainObject(input, {
    maxDepth: 12,
    keyLimit: null,
    arrayLimit: null,
    stringLimit: null,
  });
}

function requiredString(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`foundationModel: ${field} must be a non-empty string`);
  }
  return value.trim();
}

function nullableString(value, field) {
  return value == null ? null : requiredString(value, field);
}

function allowedValue(value, allowed, field, fallback) {
  const selected = value == null ? fallback : value;
  if (!allowed.includes(selected)) {
    throw new Error(`foundationModel: ${field} must be one of ${allowed.join(", ")}`);
  }
  return selected;
}

function isoTimestamp(value, field, generate = true) {
  if (value == null && generate) return new Date().toISOString();
  if (typeof value !== "string" || !ISO_PATTERN.test(value) || !Number.isFinite(Date.parse(value))) {
    throw new Error(`foundationModel: ${field} must be an ISO timestamp`);
  }
  return new Date(value).toISOString();
}

function createdTimestamp(value, field = "created_at") {
  return isoTimestamp(value, field, true);
}

export function createProject(input) {
  const safe = safeRecord(input, "project");
  const createdAt = createdTimestamp(input.created_at);
  return {
    ...safe,
    id: requiredString(input.id, "project.id"),
    name: requiredString(input.name, "project.name"),
    status: allowedValue(input.status, FOUNDATION_PROJECT_STATUSES, "project.status", "active"),
    created_at: createdAt,
    updated_at: input.updated_at == null ? createdAt : isoTimestamp(input.updated_at, "project.updated_at"),
  };
}

export function createDocument(input) {
  const safe = safeRecord(input, "document");
  const requestedType = input.document_type === "boq" ? "cost_schedule" : input.document_type;
  return {
    ...safe,
    id: requiredString(input.id, "document.id"),
    project_id: requiredString(input.project_id, "document.project_id"),
    document_type: allowedValue(requestedType, FOUNDATION_DOCUMENT_TYPES, "document.document_type", "other"),
    filename: requiredString(input.filename, "document.filename"),
    current_version_id: nullableString(input.current_version_id, "document.current_version_id"),
    created_at: createdTimestamp(input.created_at),
  };
}

export function createDocumentVersion(input) {
  const safe = safeRecord(input, "documentVersion");
  if (typeof input.size_bytes !== "number" || !Number.isFinite(input.size_bytes) || input.size_bytes < 0) {
    throw new Error("foundationModel: documentVersion.size_bytes must be a finite non-negative number");
  }
  if (input.page_count != null && (!Number.isInteger(input.page_count) || input.page_count < 0)) {
    throw new Error("foundationModel: documentVersion.page_count must be null or a finite non-negative integer");
  }
  return {
    ...safe,
    id: requiredString(input.id, "documentVersion.id"),
    document_id: requiredString(input.document_id, "documentVersion.document_id"),
    content_hash: requiredString(input.content_hash, "documentVersion.content_hash"),
    mime_type: requiredString(input.mime_type, "documentVersion.mime_type"),
    size_bytes: input.size_bytes,
    page_count: input.page_count == null ? null : input.page_count,
    processing_status: allowedValue(
      input.processing_status,
      FOUNDATION_DOCUMENT_PROCESSING_STATUSES,
      "documentVersion.processing_status",
      "pending",
    ),
    created_at: createdTimestamp(input.created_at),
  };
}

export function appendDocumentVersion(document, versions, versionInput) {
  if (!Array.isArray(versions)) {
    throw new Error("foundationModel: versions must be an array");
  }
  const currentDocument = createDocument(document);
  const version = createDocumentVersion({
    ...versionInput,
    document_id: versionInput?.document_id ?? currentDocument.id,
  });
  if (version.document_id !== currentDocument.id) {
    throw new Error("foundationModel: documentVersion.document_id must match document.id");
  }
  return {
    document: { ...currentDocument, current_version_id: version.id },
    versions: [...versions, version],
    version,
  };
}

export function createReviewItem(input) {
  const safe = safeRecord(input, "reviewItem");
  if (input.blocking != null && typeof input.blocking !== "boolean") {
    throw new Error("foundationModel: reviewItem.blocking must be a boolean");
  }
  return {
    ...safe,
    id: requiredString(input.id, "reviewItem.id"),
    project_id: requiredString(input.project_id, "reviewItem.project_id"),
    entity_type: requiredString(input.entity_type, "reviewItem.entity_type"),
    entity_id: requiredString(input.entity_id, "reviewItem.entity_id"),
    review_reason: allowedValue(
      input.review_reason,
      FOUNDATION_REVIEW_REASONS,
      "reviewItem.review_reason",
    ),
    severity: allowedValue(input.severity, FOUNDATION_REVIEW_SEVERITIES, "reviewItem.severity", "warning"),
    blocking: input.blocking ?? false,
    status: allowedValue(input.status, FOUNDATION_REVIEW_STATUSES, "reviewItem.status", "open"),
    created_at: createdTimestamp(input.created_at),
  };
}

export function sanitizeAuditMetadata(input) {
  return sanitizePlainObject(input, {
    maxDepth: METADATA_MAX_DEPTH,
    keyLimit: METADATA_MAX_KEYS,
    arrayLimit: METADATA_MAX_ARRAY_ITEMS,
    stringLimit: METADATA_MAX_STRING_LENGTH,
  });
}

export function createAuditEvent(input) {
  const safe = safeRecord(input, "auditEvent");
  return {
    ...safe,
    id: requiredString(input.id, "auditEvent.id"),
    actor: requiredString(input.actor, "auditEvent.actor"),
    action: allowedValue(input.action, FOUNDATION_AUDIT_ACTIONS, "auditEvent.action"),
    entity_type: requiredString(input.entity_type, "auditEvent.entity_type"),
    entity_id: requiredString(input.entity_id, "auditEvent.entity_id"),
    before_hash: nullableString(input.before_hash, "auditEvent.before_hash"),
    after_hash: nullableString(input.after_hash, "auditEvent.after_hash"),
    timestamp: isoTimestamp(input.timestamp, "auditEvent.timestamp", false),
    correlation_id: requiredString(input.correlation_id, "auditEvent.correlation_id"),
    ...(Object.prototype.hasOwnProperty.call(input, "metadata")
      ? { metadata: sanitizeAuditMetadata(input.metadata) }
      : {}),
  };
}

export function normalizeFoundationState(input) {
  const source = isPlainObject(input) ? input : {};
  const safe = sanitizePlainObject(source, {
    maxDepth: 12,
    keyLimit: null,
    arrayLimit: null,
    stringLimit: null,
  });
  const normalized = { ...safe };
  for (const collection of FOUNDATION_COLLECTIONS) {
    normalized[collection] = Array.isArray(source[collection])
      ? sanitizeValue(source[collection], {
        maxDepth: 12,
        keyLimit: null,
        arrayLimit: null,
        stringLimit: null,
      }, 0, new WeakSet())
      : [];
  }
  return normalized;
}
