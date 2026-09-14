# MS-MVP Day 1 Commit 03 — Foundation Contracts Report

Date: 2026-09-14
Task: `MS-MVP-DAY01-COMMIT03-FOUNDATION-CONTRACTS`
Status: PASS
Recommendation: GO for a separately authorized Commit 4

## Repository verification

| Field | Verified value |
|---|---|
| Repository | `https://github.com/ladanyitamas95-commits/opentakeoff-mernokszem` |
| Branch | `codex/w01-ui-foundation` |
| Starting HEAD | `fa7fc80fb89b27fb9349b21c70ce4f1be21f3687` |
| Final HEAD | The commit containing this report; exact SHA is recorded in the task final output |
| Initial working tree | Clean |
| `origin` | Writable fork: `https://github.com/ladanyitamas95-commits/opentakeoff-mernokszem.git` |
| `upstream` | Reference only: `https://github.com/Kentucky-ai/opentakeoff.git` |

The checked-out HEAD exactly matched the Product Owner-authorized Commit 2 SHA. Branch, ancestry and remotes passed pre-flight verification.

## Implementation summary

Added a dependency-free, browser-independent JavaScript contract module for Project, Document, DocumentVersion, ReviewItem and AuditEvent records. The module validates required fields and enum vocabularies, applies explicit defaults, returns new records, preserves safe future fields, sanitizes audit metadata and normalizes additive foundation-state collections.

This commit defines pure contracts only. It does not import from or connect to React, auth, Drive, `store.js`, `cloudStore.js`, upload/ingest, canvas, UI or any backend.

## Files changed

- `web/src/lib/foundationModel.js`
- `web/test/foundationModel.test.ts`
- `docs/generated/audits/MS-MVP-DAY01-COMMIT03-FOUNDATION-CONTRACTS-REPORT.md`

## Exported constants

- `FOUNDATION_PROJECT_STATUSES`
- `FOUNDATION_DOCUMENT_TYPES`
- `FOUNDATION_DOCUMENT_PROCESSING_STATUSES`
- `FOUNDATION_REVIEW_STATUSES`
- `FOUNDATION_REVIEW_SEVERITIES`
- `FOUNDATION_REVIEW_REASONS`
- `FOUNDATION_AUDIT_ACTIONS`
- `FOUNDATION_AUDIT_SENSITIVE_KEYS`

All exported vocabularies are frozen arrays.

## Exported helpers

- `createProject(input)`
- `createDocument(input)`
- `createDocumentVersion(input)`
- `appendDocumentVersion(document, versions, versionInput)`
- `createReviewItem(input)`
- `createAuditEvent(input)`
- `sanitizeAuditMetadata(input)`
- `normalizeFoundationState(input)`

No required export name was changed or omitted.

## Contract matrix

| Contract | Required output fields | Validation and normalization | Defaults |
|---|---|---|---|
| Project | `id`, `name`, `status`, `created_at`, `updated_at` | Non-empty trimmed id/name; canonical ISO timestamps; status enum | `status=active`; generated `created_at`; `updated_at=created_at` when absent |
| Document | `id`, `project_id`, `document_type`, `filename`, `current_version_id`, `created_at` | Non-empty trimmed ids/filename; type enum; legacy internal `boq` becomes `cost_schedule`; canonical ISO timestamp | `document_type=other`; `current_version_id=null`; generated `created_at` |
| DocumentVersion | `id`, `document_id`, `content_hash`, `mime_type`, `size_bytes`, `page_count`, `processing_status`, `created_at` | Required trimmed strings; finite non-negative size; null or finite non-negative integer page count; status enum; canonical ISO timestamp | `page_count=null`; `processing_status=pending`; generated `created_at` |
| ReviewItem | `id`, `project_id`, `entity_type`, `entity_id`, `review_reason`, `severity`, `blocking`, `status`, `created_at` | Required trimmed strings; reason/severity/status enums; strict boolean blocking; canonical ISO timestamp | `severity=warning`; `blocking=false`; `status=open`; generated `created_at` |
| AuditEvent | `id`, `actor`, `action`, `entity_type`, `entity_id`, `before_hash`, `after_hash`, `timestamp`, `correlation_id` | Required trimmed strings; action enum; nullable hashes; required canonical ISO timestamp; sanitized optional metadata | `before_hash=null`; `after_hash=null`; no default for required event timestamp |

Invalid values throw deterministic errors prefixed with `foundationModel:` and naming the rejected field.

## Enum vocabularies

- Project statuses: `active`, `archived`.
- Document types: `drawing`, `cost_schedule`, `technical_description`, `other`.
- Document processing statuses: `pending`, `processed`, `failed`.
- Review statuses: `open`, `resolved`, `dismissed`.
- Review severities: `info`, `warning`, `critical`.
- Review reasons: `missing_scale`, `mapping_issue`, `unit_mismatch`, `significant_discrepancy`, `missing_source`, `export_blocking`.
- Audit actions: `PROJECT_CREATED`, `DOCUMENT_UPLOADED`, `DOCUMENT_PROCESSED`.

No visible/user-facing `BOQ` label was introduced. The lower-case legacy internal value `boq` is accepted only as input and normalized to `cost_schedule`.

## Immutability behavior

- Every builder starts from a sanitized copy and returns a new object.
- Safe nested future fields are copied rather than shared with the input.
- Inputs are not mutated during validation, normalization or sanitization.
- `appendDocumentVersion` returns a new document, a new versions array and the new version.
- The original document, versions array, existing version objects and version input are not mutated.
- Existing versions retain their order and are never overwritten; the new version is appended and becomes `current_version_id`.
- A supplied version `document_id` must match the document id.

## Audit metadata redaction

Sensitive key matching is case-insensitive and separator-insensitive. The patterns cover token, secret, password, authorization, API-key, PDF-byte, raw-file, file-content, provider-error, access-token and refresh-token forms.

Sanitization behavior:

- accepts plain objects only; other roots return `{}`;
- recursively removes sensitive keys;
- drops functions, symbols, bigint, undefined, non-finite numbers, typed arrays, ArrayBuffers, Blob/File-like values, non-plain objects and circular references;
- bounds metadata to five levels, 50 keys per object, 50 items per array and 2048 characters per string;
- returns fresh objects/arrays without changing input;
- applies the same sensitive top-level filtering before AuditEvent construction;
- performs no cryptographic hashing.

## Foundation state normalization

`normalizeFoundationState(input)` always returns these additive arrays:

- `projects`
- `documents`
- `document_versions`
- `review_items`
- `audit_events`

Missing or non-array collections become empty arrays. Existing safe collection values and safe unknown top-level future fields are copied. Functions, binary/file-like values, non-finite numbers, sensitive keys, circular references and other unsafe values are dropped. The helper does not validate or persist individual records and does not mutate its input.

## Tests and validation

Validation used the existing lockfile-installed dependencies and bundled Node 24 runtime. No package, lockfile, dependency or configuration file changed.

| Check | Result |
|---|---|
| Targeted `foundationModel.test.ts` | PASS — 19/19 tests; all 25 required coverage points asserted |
| `npm --prefix web run typecheck` | PASS |
| `npm --prefix web run lint` | PASS |
| `npm --prefix web run build` | PASS — 769 modules; non-blocking chunk-size warning |
| Full `npm --prefix web test` | Baseline retained — 1784 total, 1732 pass, 49 fail, 3 skip |
| `git diff --check` | Required final result recorded in the task final output |
| `git diff --cached --check` | Required final result recorded in the task final output |
| `git status --short` | Required final result recorded in the task final output |

### Covered behaviors

- Complete required fields and defaults for all five contracts.
- Required string trimming/rejection and enum rejection.
- Legacy `boq` normalization without a visible `BOQ` label.
- Numeric validation for version size and page count.
- Append-only version-array behavior and input/history immutability.
- All required review reasons and audit actions.
- Case-insensitive nested audit redaction, unsafe-value removal and bounds.
- Additive state hydration, unsafe-value removal and safe future-field preservation.

### Known pre-existing failures

- 49 registered web localization/golden failures remain. They were not fixed or rebaselined.
- 2 registered MCP failures remain. MCP was outside the touched area and was not run.

### New regressions

None detected. The 19 new foundation tests increased the full-suite passing count while the failure count remained exactly 49.

## Acceptance criteria status

| Criterion | Status | Evidence |
|---|---|---|
| Pure JavaScript, no external dependency or browser-only API | PASS | Import and diff audit; Node-only targeted tests |
| All required constants and helpers exported | PASS | Module export audit and test imports |
| Five contracts expose required fields, defaults and validation | PASS | Builder and rejection tests |
| Legacy `boq` normalizes without visible `BOQ` | PASS | Document and source assertions |
| Document versions append without mutating history | PASS | Identity and deep-equality assertions |
| Review and audit vocabularies are exact and validated | PASS | Complete vocabulary loops and invalid-value tests |
| Audit data excludes sensitive/raw/binary/provider values and remains bounded | PASS | Top-level, nested, binary and bound tests |
| Missing collections hydrate additively; safe future fields survive | PASS | State-normalization tests |
| Builders and normalizers do not mutate input | PASS | Structured-clone comparisons |
| Only authorized files changed | PASS | Final scope audit |
| No new regression | PASS | Targeted checks and full baseline comparison |

## Unresolved risks

- These are pure contracts only; no storage round-trip, migration, project isolation or cloud parity is claimed.
- Generated creation timestamps use the local JavaScript clock when absent; authoritative audit timestamps remain required input.
- Audit metadata redaction is defensive key/value filtering, not a substitute for server-side authorization, schema enforcement or secret-scanning controls.
- Persistence must preserve unknown safe fields and immutable document-version history when integration is later authorized.
- The 49 web and 2 MCP baseline failures continue to reduce broad-suite signal quality.

## GO / NO-GO for Commit 4

**GO**, after separate Product Owner authorization. Because this commit intentionally did not integrate persistence, the next bounded task should add these contracts to the existing local/cloud store seam with legacy hydration, project isolation and round-trip tests. Project creation and upload integration should remain outside that persistence-only commit.

## Stop condition

Stop after this single commit and its authorized push to `origin/codex/w01-ui-foundation`. Do not begin Commit 4 or modify persistence, project UI, upload/ingest, canvas, viewer, measurement, XLSX, AI or report-engine behavior.
