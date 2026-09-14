# MS-MVP Day 1 Commit 04 — Foundation Persistence Seam Report

Date: 2026-09-14
Task: `MS-MVP-DAY01-COMMIT04-FOUNDATION-PERSISTENCE-SEAM`
Status: PASS
Recommendation: GO for a separately authorized Commit 5

## Repository verification

| Field | Verified value |
|---|---|
| Repository | `https://github.com/ladanyitamas95-commits/opentakeoff-mernokszem` |
| Branch | `codex/w01-ui-foundation` |
| Starting HEAD | `f0f3ee55fdb44642a137f2d0ae83f58433c4d941` |
| Final HEAD | The commit containing this report; exact SHA is recorded in the task final output |
| Initial working tree | Clean |
| `origin` | Writable fork: `https://github.com/ladanyitamas95-commits/opentakeoff-mernokszem.git` |
| `upstream` | Reference only: `https://github.com/Kentucky-ai/opentakeoff.git` |

The checked-out HEAD exactly matched the Product Owner-authorized Commit 3 SHA. Branch, ancestry, worktree and remotes passed pre-flight verification.

## Files changed

- `web/src/lib/foundationModel.js`
- `web/src/lib/store.js`
- `web/src/lib/cloudStore.js`
- `web/test/foundationModel.test.ts`
- `web/test/store.test.ts`
- `web/test/cloudStore.test.ts`
- `docs/generated/audits/MS-MVP-DAY01-COMMIT04-FOUNDATION-PERSISTENCE-SEAM-REPORT.md`

No UI, route, auth, Drive implementation, ingest, canvas, PDF, measurement, XLSX, AI, report-engine, dependency or configuration file changed.

## Mandatory source inspection result

| Mechanism | Confirmed pre-change behavior |
|---|---|
| `emptyAnnotations()` | Returned schema plus `conditions`, `shapes`, `markups`, `sheets`, `sheet_group`, `last_group`, `sheet_tabs`, `rules`, `approvals` and `stitches` arrays |
| Local load | Read the `annotations` value from IndexedDB `meta`, falling back to `emptyAnnotations()` |
| Local save | Wrote one complete annotation object under `annotations` and stamped `ANN_SCHEMA` |
| Project-scoped local | `createLocalStore(folderId)` overrode only annotation load/save and used `annotations:<folderId>` |
| Cloud load | Resolved sidecar/legacy `annotations.json`, retained `CloudLoadError` for unreadable JSON and returned empty annotations when absent/falsy |
| Cloud save | Used memoized `ensureAnnId()` and one complete `putJson()` to `.opentakeoff/annotations.json` |
| Legacy Drive migration | Read a loose file; first save created/seeded the sidecar while retaining the loose file |
| Project isolation | Store-instance folder key locally and Drive parent-folder scope in cloud; no record-query repository |
| Schema stamping | `ANN_SCHEMA = opentakeoff.takeoff_canvas.v1` stamped at save time |

These mechanisms were extended, not redesigned.

## Exact persistence architecture

The five foundation collections remain additive fields inside the existing annotation payload:

- `projects`
- `documents`
- `document_versions`
- `review_items`
- `audit_events`

Local anonymous state continues to use IndexedDB `meta["annotations"]`. Project-scoped local state continues to use `meta["annotations:<folderId>"]`. Cloud state continues to use exactly one `<project>/.opentakeoff/annotations.json` file and the existing write target, id cache, create-once promise and sidecar migration logic.

`hydrateFoundationCollections(payload)` performs narrow load-time hydration. It creates a new top-level object and new foundation arrays, but passes every unrelated annotation field through unchanged.

`prepareFoundationCollectionsForPersistence(payload)` performs narrow save-time preparation. It validates/sanitizes records in the five foundation arrays using the Commit 3 builders while passing every unrelated field through unchanged. Stores then apply the existing schema stamp and existing single-blob write.

## Why no database migration was required

Foundation data is stored as new properties in an object already persisted in the keyless IndexedDB `meta` store. IndexedDB object structure is schemaless and no new object store or index is needed. Therefore:

- `DB_VERSION` remains `3`;
- no `onupgradeneeded` behavior changed;
- no new IndexedDB store or key was added;
- no existing annotation data moved;
- `ANN_SCHEMA` remains `opentakeoff.takeoff_canvas.v1`;
- no migration framework was introduced.

## Legacy hydration and field preservation

A raw legacy annotation blob with no foundation properties was inserted directly through the existing meta key and loaded through `localStore`. The test covers `conditions`, `shapes`, `markups`, `sheets`, `sheet_group`, `last_group`, `sheet_tabs`, `rules`, `approvals`, `stitches`, schema and a nested custom safe future field.

Every legacy value remained deep-equal after load. Only the five missing foundation arrays were added as empty arrays. A legacy unrelated field named `providerError` inside `conditions` also remained unchanged, proving audit sanitation was not applied destructively to the whole payload.

The existing v1→v3 database regression test was updated only for the intentional additive arrays and continued to preserve PDFs and all prior annotations.

## Local persistence results

- Fresh `emptyAnnotations()` includes all five foundation arrays.
- Project, Document, two ordered DocumentVersions, ReviewItem and AuditEvent survived IndexedDB save/load.
- `Document.current_version_id` remained pointed at the second version.
- The first version remained deep-equal to its pre-save snapshot.
- Audit metadata retained its safe field and removed access-token, raw-file and provider-error data.
- Invalid AuditEvent save failed deterministically before replacing the previous annotation blob.
- Stores for folder A and folder B reloaded only their own foundation project records.
- Anonymous `localStore` remained separate from both scoped stores.
- Existing `annotations` and `annotations:<folderId>` key behavior remained authoritative.

## Cloud fake-Drive results

- A project without annotations returned the foundation-enabled fresh empty shape.
- All five foundation collections and unrelated legacy/future fields survived a fake-Drive save/load round-trip.
- Two ordered DocumentVersions and `current_version_id` survived unchanged.
- Audit metadata retained safe data and removed API-key, PDF-byte and raw-content values.
- Invalid AuditEvent save failed before creating `.opentakeoff` or `annotations.json`.
- Separate fake Drive project folders created separate sidecars and reloaded only their own foundation records.
- The round-trip created only `annotations.json` for foundation state; no foundation-specific JSON file was created.
- Existing concurrent create-once annotations and sidecar tests passed.
- Existing loose annotations migration, corrupt legacy first-save recovery and split-brain tiebreak tests passed.
- Existing unreadable/corrupt JSON test continued to raise tagged `CloudLoadError`; it did not fall back to empty state.

No real network call was made.

## DocumentVersion history result

The test sequence created a Document, created version 1, appended version 2 using `appendDocumentVersion`, persisted the result and reloaded it from both local and fake-Drive stores.

In both stores:

- version count remained two;
- order remained version 1 followed by version 2;
- version 1 remained unchanged;
- version 2 remained present;
- `Document.current_version_id` remained the version 2 id.

No upload hook or version-creation workflow was added.

## AuditEvent sanitation result

The persistence preparation reuses `createAuditEvent()`, which in turn reuses Commit 3 audit sanitation. There is no second sensitive-key implementation in either store.

Before the existing single annotation write:

- sensitive metadata keys are removed recursively and case-insensitively;
- token, secret, password, authorization, API-key, PDF-byte, raw-file, file-content, provider-error, access-token and refresh-token forms are covered;
- binary/file-like values and raw provider data are dropped;
- safe bounded metadata survives;
- invalid AuditEvent records throw deterministic errors;
- unrelated legacy annotation fields are not sanitized or removed.

## Tests and exact results

Validation used the existing lockfile-installed dependencies and bundled Node 24 runtime. No dependency file changed.

| Check | Result |
|---|---|
| Targeted foundation/store/cloud tests | PASS — 82/82 |
| `foundationModel.test.ts` in the combined targeted run | PASS — 21/21 |
| `store.test.ts` in the combined targeted run | PASS — 28/28 |
| `cloudStore.test.ts` in the combined targeted run | PASS — 33/33 |
| `npm --prefix web run typecheck` | PASS |
| `npm --prefix web run lint` | PASS |
| `npm --prefix web run build` | PASS — 770 modules; non-blocking chunk-size warning |
| Full `npm --prefix web test` | Baseline retained — 1794 total, 1742 pass, 49 fail, 3 skip |
| `git diff --check` | Required final result recorded in the task final output |
| `git diff --cached --check` | Required final result recorded in the task final output |
| `git status --short` | Required final result recorded in the task final output |

The separately reported targeted total of 82 equals 21 foundation + 28 local store + 33 cloud store tests after final coverage.

### Known pre-existing failures

- 49 registered web localization/golden failures remain. They were not fixed or rebaselined.
- 2 registered MCP failures remain. MCP was outside the touched area and was not run.

### New regressions

None. `NEW_WEB_FAILURES = 0`; the full suite retained exactly 49 failures while ten new persistence assertions/tests increased the passing count from the accepted Commit 3 baseline.

## Acceptance criteria

| ID | Status | Evidence |
|---|---|---|
| AC-PERSIST-001 | PASS | `emptyAnnotations()` and fresh local load expose five arrays |
| AC-PERSIST-002 | PASS | Absent fake-Drive annotations return the same five arrays |
| AC-PERSIST-003 | PASS | Raw legacy payload test preserves every established and custom field deep-equal |
| AC-PERSIST-004 | PASS | Full local foundation round-trip |
| AC-PERSIST-005 | PASS | Full fake-Drive foundation round-trip |
| AC-PERSIST-006 | PASS | `annotations:foundation-A` and `annotations:foundation-B` remain isolated |
| AC-PERSIST-007 | PASS | Distinct Drive folder parents and sidecars reload distinct records |
| AC-PERSIST-008 | PASS | Anonymous `annotations` blob reloads separately from scoped stores |
| AC-PERSIST-009 | PASS | Two-version order/history and current version survive both round-trips |
| AC-PERSIST-010 | PASS | Sensitive AuditEvent metadata absent after both round-trips; invalid writes rejected |
| AC-PERSIST-011 | PASS | No DB bump/store/index/key/provider/dependency/new JSON file |
| AC-PERSIST-012 | PASS | `ANN_SCHEMA` unchanged and stamped by every save path |
| AC-PERSIST-013 | PASS | Existing loose→sidecar and concurrency regression tests pass |
| AC-PERSIST-014 | PASS | Existing corrupt-cloud `CloudLoadError` regression test passes |
| AC-PERSIST-015 | PASS | Full suite has exactly the known 49 failures and zero new failure |

All 15 acceptance criteria pass.

## Unresolved risks

- Tests use fake IndexedDB and fake Drive by requirement; no real Drive/network behavior is claimed.
- Load-time hydration intentionally does not validate or sanitize legacy foundation records. They are validated and sanitized on the next save, avoiding destructive load-time migration.
- Existing whole-blob last-writer semantics remain unchanged; this commit adds no independent foundation write and therefore no new split-brain path.
- Foundation record project ids are domain data; actual isolation continues to depend on the existing store-instance folder scope.
- The 49 web and 2 MCP baseline failures continue to reduce broad-suite signal quality.

## GO / NO-GO for Commit 5

**GO**, after separate Product Owner authorization. The next bounded task should implement controlled project create/open foundation using the existing Drive/project-home seams and the now-persisted contracts. Upload integration, canvas changes and broader workflow work should remain separate unless explicitly authorized.

## Stop condition

Stop after this single commit and its authorized push to `origin/codex/w01-ui-foundation`. Do not begin Commit 5 or implement project UI, Drive folder creation, upload/ingest, canvas, PDF, measurement, Review Queue, XLSX, AI or report-engine behavior.
