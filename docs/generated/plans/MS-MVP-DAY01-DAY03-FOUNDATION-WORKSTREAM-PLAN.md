# MS-MVP Day 1–3 Foundation Workstream Plan

Date: 2026-09-14
Planning task: `MS-MVP-DAY01-DAY03-FOUNDATION-WORKSTREAM-PLAN`
Implementation gate: `FOUNDATION_PASS`
Plan status: implementation-ready, no runtime change performed

## 1. Current repository state

| Field | Verified value |
|---|---|
| Repository | `https://github.com/ladanyitamas95-commits/opentakeoff-mernokszem` |
| Branch | `codex/w01-ui-foundation` |
| Starting HEAD | `5338659eb3dcfb6185b67e40c7100b33a75cf7ae` |
| Working tree at planning start | Clean; matched `origin/codex/w01-ui-foundation` |
| `origin` | Writable fork: `https://github.com/ladanyitamas95-commits/opentakeoff-mernokszem.git` |
| `upstream` | Reference only: `https://github.com/Kentucky-ai/opentakeoff.git` |
| Day 0 status | `PASS_WITH_FORK` |
| Day 0 technical baseline | Web typecheck/lint/benchmark/build PASS; 49 known web test failures; MCP typecheck/build/tool-count/dist smoke PASS; 2 known MCP test failures; server 11/11 PASS |

The implementation task must repeat branch, HEAD, remote and clean-tree verification. It must stop if the branch no longer descends from this plan's final commit or if unrelated changes are present.

## 2. Authority and observed implementation baseline

Authority order for this plan:

1. accepted Product Owner decisions in `docs/project-control/02_DECISION_REGISTER.md`;
2. `docs/product/MS_MVP_SCOPE_FREEZE_v2.0_FINAL.md`;
3. `AGENTS.md` and current project-control state;
4. the current codebase;
5. the canonical development plan only where it does not conflict with Scope Freeze v2.0.

Observed facts that constrain the implementation:

- W01 already provides `AppShell`, UI primitives, semantic state badges and `/ui-foundation`.
- `web/src/main.jsx` already uses React Router and contains optional Google-authenticated Drive project gates plus local, folder-sync and Microsoft 365 workspace gates.
- `ProjectHome` lists and opens Drive folders, but does not create a project.
- `createDrive()` already exposes `createFolder`; a new storage vendor is not required for minimal pilot project creation.
- `store.js` is the live persistence seam. It supports local and cloud adapters, PDF hashing/revisions, scoped annotations and snapshots.
- `ingestFiles()` and `TakeoffCanvas.handleFiles()` already provide PDF/image/ZIP ingest and call `store.addPdf()`.
- `TakeoffCanvas.jsx` already provides PDF rendering, multipage handling, pan/zoom and human scale actions. It is a large, high-risk single-owner component.
- `MEASUREMENT_STATUSES` already matches the frozen status set; `reviewState.js` preserves explicit review semantics.
- User-facing `BOQ` remains in `AppShell`, `UiFoundationPreview` and the W01 test expectation, contrary to `DEC-017`.
- No Supabase dependency is present. `web/.env.example` explicitly warns that every `VITE_*` value is public and must not contain secrets.

## 3. Day 1–3 objective

### Required outcome

Achieve `FOUNDATION_PASS` by delivering a bounded foundation on top of the existing OpenTakeoff runtime:

- a real, protected `/app` route boundary for pilot project data;
- a manually provisioned single-user pilot access path using the existing Google/Drive capability;
- placeholder-safe blocked behavior when pilot auth/storage is not configured;
- a minimal additive Project, Document, DocumentVersion, ReviewItem and AuditEvent model aligned with the canonical fields;
- project creation and reopening through the existing project-folder model;
- document metadata and upload-audit integration without replacing the current ingest/PDF pipeline;
- real application-shell navigation wiring for the foundation routes;
- continuity checks proving the current PDF viewer, scale and measurement/review state mechanisms were not regressed;
- enforced Hungarian user-facing terminology for the touched foundation surfaces.

The foundation is complete only when the targeted tests pass, the full baseline shows no new failure, and the browser smoke demonstrates that an unauthenticated visitor cannot reach a private project by URL manipulation.

### Explicitly out of scope

- Supabase installation or a new auth/storage provider without a separate Product Owner decision, credentials plan and dependency authorization;
- enterprise RBAC, organizations, invitations, self-service provisioning or admin UI;
- Day 4–7 geometry work: new polygon/polyline/count behavior, SI engine changes, measurement revision implementation or final review UI;
- XLSX cost schedule import/mapping, quantity comparison, export changes, AI Assistant or Report v0.1;
- replacing or refactoring the PDF viewer, `TakeoffCanvas.jsx`, IndexedDB, Google Drive, folder sync or Microsoft 365 sync;
- fixing or re-goldening the 49 web and 2 MCP baseline failures;
- dependency upgrades, upstream synchronization, deployment, pull request creation or production release.

## 4. Implementation scope and bounded tasks

### FND-01 — Project shell, routing and terminology

1. Define route ownership in `main.jsx`: public/legacy `/`, protected `/app`, protected `/app/projects`, and existing `/ui-foundation`.
2. Reuse `AppShell`; do not introduce another router or UI framework.
3. Wire shell navigation through explicit callbacks/links instead of inert buttons where a Day 1–3 destination exists.
4. Keep `/` behavior unchanged so this work does not silently replace the current local OpenTakeoff entry point.
5. Replace user-facing `BOQ` on touched W01 surfaces with `Költségvetés`; internal ids such as `boq` may remain.

Deliverable: protected route skeleton and terminology tests, without feature screens beyond Foundation scope.

### FND-02 — Authenticated pilot app boundary

1. Extract a small `PilotAccessBoundary` around the existing Google auth state; do not duplicate token logic.
2. When Google/Drive pilot configuration is present:
   - unauthenticated `/app*` requests show the Hungarian sign-in state;
   - authenticated requests may reach only project folders authorized by Google Drive;
   - a project id from the URL remains an identifier, never proof of access.
3. When pilot auth/storage is absent, `/app*` renders a blocked configuration state with a safe return to `/`; it must not fall through to private content or silently claim authentication.
4. Keep production secrets out of `VITE_*`, browser storage, URLs, logs and audit payloads.
5. Treat Supabase as an explicit stop condition, not an implied implementation detail.

Deliverable: provider-minimal access state machine with pure unit tests and protected-route integration tests.

### FND-03 — Minimal project/document/audit model

Add an additive, version-tolerant foundation model using the current store seam.

Required shapes:

- `Project`: `id`, `name`, `status`, `created_at`, `updated_at`;
- `Document`: `id`, `project_id`, `document_type`, `filename`, `current_version_id`, `created_at`;
- immutable `DocumentVersion`: `id`, `document_id`, `content_hash`, `mime_type`, `size_bytes`, `page_count`, `processing_status`, `created_at`;
- `ReviewItem`: `id`, `project_id`, `entity_type`, `entity_id`, `review_reason`, `severity`, `blocking`, `status`, `created_at`;
- append-only `AuditEvent`: `id`, `actor`, `action`, `entity_type`, `entity_id`, `before_hash`, `after_hash`, `timestamp`, `correlation_id`.

Rules:

- absent additive collections hydrate to empty arrays;
- unknown future fields survive load/save round trips where the current store already preserves them;
- a DocumentVersion is appended, never overwritten in place;
- audit events contain ids/hashes and bounded metadata, never PDF bytes, tokens or secrets;
- the initial event vocabulary is limited to `PROJECT_CREATED`, `DOCUMENT_UPLOADED` and `DOCUMENT_PROCESSED`; scale/measurement events are only contracts/readiness checks in this workstream.

Deliverable: pure builders/sanitizers, store integration and unit tests. No database migration and no backend are authorized.

### FND-04 — Project create/open and document upload foundation

1. Add a project-create action to `ProjectHome` using the existing injected Drive client and configured Projects root.
2. Accept a trimmed, non-empty project name; do not invent additional naming, retention or status rules.
3. On successful `createFolder`, create the minimal Project record, append `PROJECT_CREATED`, remember the project and navigate using the returned folder id.
4. Existing project rows and recents continue to open `/?project=<encoded-id>` or the protected equivalent chosen in FND-01; both paths must pass through the same auth/store gate.
5. After `ingestFiles()` and `store.addPdf()` succeed, append Document/DocumentVersion metadata and the upload events. A failed or skipped file creates no successful-upload event.
6. Reuse current content hashes/revision results from `store.addPdf()`; do not hash the file a second time if the store contract can safely return the required metadata.
7. Preserve file validation/ZIP guardrails and current viewer handoff.

Deliverable: one controlled project-to-document vertical foundation. XLSX import is not included.

### FND-05 — Viewer, scale, measurement and review readiness

This task is a compatibility gate, not a rewrite.

1. Keep `ingestFiles()`, PDF.js rendering, multipage navigation, pan/zoom and scale calculation logic unchanged unless a failing foundation integration test proves a minimal adapter is required.
2. Prove PDF upload still reaches the existing gallery/canvas path.
3. Prove a human scale action still clears `scaleUnconfirmed` and persists `scale_source`; no automatic confirmation may be introduced.
4. Assert the W01 `MEASUREMENT_STATUSES` set exactly matches the frozen contract and that AI-originated/unreviewed state cannot render as `ACCEPTED`.
5. Provide a pure ReviewItem builder/readiness path for missing scale, mapping issue, unit mismatch, significant discrepancy, missing source and export-blocking states; do not build the final Review Queue screen.
6. Complete browser smoke at desktop width for `/`, `/ui-foundation`, `/app`, `/app/projects`, project create/open, PDF upload/view and scale confirmation.

Deliverable: recorded `FOUNDATION_PASS` evidence with no new runtime regression.

## 5. File impact map

### Expected implementation changes

| Path | Intended change | Risk | Owner | Test impact |
|---|---|---:|---|---|
| `web/src/main.jsx` | Add protected `/app` and `/app/projects` routing; reuse existing gates; preserve `/` and `/ui-foundation` | High | Web routing owner | New route/access tests; full build and browser smoke |
| `web/src/components/PilotAccessBoundary.jsx` (new) | Render loading, sign-in, blocked-config and authorized states from existing auth context | High | Auth boundary owner | New SSR/integration tests for every state |
| `web/src/lib/pilotAccess.js` (new) | Pure access-state and route decision helpers with no token handling | High | Security/domain owner | New unit tests including URL-manipulation cases |
| `web/src/components/AppShell.jsx` | Add explicit navigation hooks/links and change visible `BOQ` label to `Költségvetés` | Medium | UI foundation owner | Update `uiFoundation.test.ts`; browser shell smoke |
| `web/src/components/UiFoundationPreview.jsx` | Replace visible `BOQ` option with `Költségvetés`; keep internal value if useful | Low | UI foundation owner | Update terminology assertion |
| `web/src/components/ProjectHome.jsx` | Add controlled create-project UI and use the same open/navigation gate for created, listed and recent projects | Medium | Project foundation owner | Extend project-home component/integration coverage |
| `web/src/lib/projectHome.js` | Add injected, testable `createProject` helper around `drive.createFolder`; preserve listing and recents | Medium | Project foundation owner | Extend `projectHome.test.ts` for success/error/blank name |
| `web/src/lib/foundationModel.js` (new) | Builders/sanitizers for Project, Document, DocumentVersion, ReviewItem and AuditEvent | High | Domain owner | New exhaustive field, immutability and redaction tests |
| `web/src/lib/store.js` | Add additive foundation collections/metadata through the existing live store seam; expose upload hash/revision metadata needed by callers | High | Persistence owner | Extend `store.test.ts`; verify legacy hydrate and project isolation |
| `web/src/lib/cloudStore.js` | Mirror only the additive store contract required for project-scoped foundation metadata | High | Persistence/cloud owner | Extend `cloudStore.test.ts`; no real network |
| `web/src/pages/TakeoffCanvas.jsx` | Minimal post-success document/audit hook only if FND-04 cannot be implemented at the store boundary; no viewer/geometry refactor | High | Canvas single owner | `ingest`, store, scale and focused canvas tests plus browser smoke |
| `web/test/pilotAccess.test.ts` (new) | Pure and rendered access-boundary matrix | Low | Test owner | Required targeted test |
| `web/test/foundationModel.test.ts` (new) | Canonical model, append-only audit and review-readiness contract tests | Low | Test owner | Required targeted test |
| `web/test/uiFoundation.test.ts` | Assert Hungarian labels and protected shell semantics; remove visible `BOQ` expectation | Low | UI test owner | Required targeted test |
| `web/test/projectHome.test.ts` | Project creation/opening behavior with injected fake Drive | Low | Project test owner | Required targeted test |
| `web/test/store.test.ts` | Additive hydration, isolation, versions and audit persistence | Medium | Persistence test owner | Required targeted test |
| `web/test/cloudStore.test.ts` | Same contract against fake Drive/cloud adapter | Medium | Persistence/cloud test owner | Required targeted test |

### Continuity-only files: inspect and test, do not plan to modify

| Path | Required evidence | Risk if changed | Owner | Test impact |
|---|---|---:|---|---|
| `web/src/lib/google/AuthContext.jsx` | Existing user/ready/signIn state is reused | High | Auth owner | `pilotAccess.test.ts`, browser sign-in smoke |
| `web/src/lib/google/auth.js` | Existing domain/auth behavior remains the credential authority | High | Auth owner | Existing `authDomain.test.ts` |
| `web/src/lib/google/drive.js` | Existing `createFolder`, `listChildren` and permissions remain the Drive seam | High | Cloud owner | Existing `drive.test.ts` plus project-home tests |
| `web/src/lib/ingest.js` | Existing PDF/image/ZIP conversion and archive limits remain intact | High | Ingest owner | Existing `ingest.test.ts` |
| `web/src/lib/reviewState.js` | Existing review normalization remains unchanged | High | Review owner | Existing review/state tests plus foundation model tests |
| `web/src/components/PlanNavigator.jsx` | Existing viewer navigation and close-project behavior continue | High | Canvas/navigation owner | Browser multipage smoke |
| `web/src/styles/tokens.css` and `web/src/styles/app.css` | Existing W01 tokens/layout are reused; only add CSS if new states cannot use primitives | Medium | UI foundation owner | Build, visual smoke, `uiFoundation.test.ts` |

Any proposed change outside the expected-change table requires task re-scoping. Any modification to a continuity-only file requires a written cause in the implementation report and must remain inside this workstream's acceptance criteria.

## 6. Acceptance criteria

| ID | Testable criterion |
|---|---|
| AC-FND-001 | At the implementation starting SHA, branch is `codex/w01-ui-foundation`, `origin` is the MérnökSzem fork, `upstream` is Kentucky-ai, and the tree is clean. |
| AC-FND-002 | `/app` and `/app/projects` never render private project content while auth is unresolved or unauthenticated. |
| AC-FND-003 | With pilot auth/storage unconfigured, `/app*` renders a Hungarian blocked/configuration state and does not fall through to `TakeoffCanvas` or `ProjectHome`. |
| AC-FND-004 | A manipulated or inaccessible project id cannot bypass the existing Drive permission check; the UI shows a non-sensitive Hungarian error and exposes no project data. |
| AC-FND-005 | `/` and `/ui-foundation` retain their current entry behavior; no automatic redirect to private content is added. |
| AC-FND-006 | A trimmed non-empty project name results in exactly one `createFolder(rootId, name)` call; blank input makes zero Drive calls. |
| AC-FND-007 | Successful creation uses the returned folder id, records one Project and one `PROJECT_CREATED` event, remembers the project and navigates through the protected project gate. |
| AC-FND-008 | Listed, recent and newly created projects use one encoded navigation contract and one auth/store initialization path. |
| AC-FND-009 | The five canonical foundation record types contain every field listed in FND-03; invalid required ids are rejected before persistence. |
| AC-FND-010 | Adding a DocumentVersion appends a new immutable record and updates `Document.current_version_id` without mutating the previous version. |
| AC-FND-011 | A successful PDF add records one Document, one DocumentVersion and bounded upload/processed audit events using the stored content hash; a rejected/skipped/failed file records none of those success events. |
| AC-FND-012 | Legacy annotation payloads without the new collections hydrate successfully with empty foundation collections and keep existing shapes, sheets, scales and unknown fields. |
| AC-FND-013 | Local and cloud project scopes cannot read one another's foundation records in fake-store tests. |
| AC-FND-014 | Audit events are append-only and contain no token, raw PDF bytes, AI secret or full document content. |
| AC-FND-015 | Uploading a supported PDF still opens the existing gallery/canvas; multipage selection, pan and zoom pass browser smoke without viewer replacement. |
| AC-FND-016 | A human scale action still records a source and confirmed state; an unconfirmed/detected scale cannot become confirmed without an explicit human action. |
| AC-FND-017 | `MEASUREMENT_STATUSES` remains exactly `DRAFT`, `AI_PROPOSED`, `REVIEW_REQUIRED`, `MEASUREMENT_RULE_REQUIRED`, `SCALE_REVIEW_REQUIRED`, `INVALID_GEOMETRY`, `ACCEPTED`, `EDITED`, `REJECTED`. |
| AC-FND-018 | An AI-originated or committed-but-unreviewed item cannot be represented as `ACCEPTED` by the new foundation path. |
| AC-FND-019 | ReviewItem builders can represent the six P0 readiness families: missing scale, mapping issue, unit mismatch, significant discrepancy, missing source and export blocker. No final Review Queue UI is claimed. |
| AC-FND-020 | Visible labels on all touched foundation surfaces use `Költségvetés`/`Költségvetési …`; no visible `BOQ` remains in those surfaces or their snapshots. |
| AC-FND-021 | No secret-bearing configuration is added to `web/.env.example`, `VITE_*`, browser storage, URLs or client logs. |
| AC-FND-022 | Targeted tests, typecheck, lint, benchmark consistency and build pass; the full web suite introduces zero failures beyond the registered 49 and MCP introduces zero beyond the registered 2 if MCP checks are triggered. |
| AC-FND-023 | The implementation report lists exact files, commands, baseline comparison, browser scenarios and a `FOUNDATION_PASS`, `CONDITIONAL_PASS` or `FAIL` result without silently fixing baseline tests. |

## 7. Test plan

### Environment precondition

Use the Node version pinned by `.nvmrc` and lockfile-exact installs. The planning environment used for this document did not expose `node`; that is a known environment limitation, not evidence about the repository. Actual implementation may not claim PASS without Node/npm or equivalent CI evidence.

### Required checks after implementation

Run from repository root unless noted:

```bash
npm --prefix web ci
cd web
node --import tsx --test \
  test/pilotAccess.test.ts \
  test/foundationModel.test.ts \
  test/uiFoundation.test.ts \
  test/projectHome.test.ts \
  test/store.test.ts \
  test/cloudStore.test.ts \
  test/authDomain.test.ts \
  test/drive.test.ts \
  test/ingest.test.ts \
  test/scaleDetect.test.ts
cd ..
npm --prefix web run typecheck
npm --prefix web run lint
npm --prefix web test
npm --prefix web run bench
git diff --exit-code -- web/bench/results.json
npm --prefix web run build
git diff --check
git status --short
```

The exact targeted file list may be narrowed only when a listed expected file is not changed and its dependent contract is demonstrably untouched. Typecheck, lint, full web test, benchmark consistency and build are never optional.

Required browser smoke on the implementation build:

1. `/` opens the existing local workflow.
2. `/ui-foundation` renders the W01 shell with Hungarian labels.
3. `/app` and `/app/projects` show blocked or sign-in state while unauthenticated.
4. An inaccessible `project` id does not reveal project data.
5. An authenticated pilot can create, list, reopen and switch a project.
6. A PDF upload reaches the existing viewer; page change, pan and zoom work.
7. A scale can be created and confirmed only by an explicit human action.
8. Reloading the project restores its foundation metadata and existing canvas state.

### Conditional required checks

Run the MCP matrix only if an implementation commit changes `mcp/`, a shared contract consumed by MCP, or any mirrored status vocabulary:

```bash
npm --prefix mcp ci
npm --prefix mcp run typecheck
npm --prefix mcp test
npm --prefix mcp run check:tool-count
npm --prefix mcp run build
npm --prefix mcp run smoke:dist
```

Run server tests only if `server/`, server-facing contracts or CORS/auth assumptions change:

```bash
python -m pytest -q server
```

### Optional checks

- a second browser profile for project isolation and reopen behavior;
- throttled/offline browser simulation after initial authenticated project load;
- Google Drive live smoke in the manually provisioned pilot tenant;
- accessibility inspection of focus order and route-change announcements.

### Known pre-existing failures

- Web: 49 localization/export/report/RFI/golden expectation failures, registered as `DAY00-WEB-001`. They must not be fixed, skipped, re-goldened or reclassified inside this workstream unless the Product Owner explicitly expands scope.
- MCP: 2 localized RFI marked-PDF expectation failures, registered as `DAY00-MCP-001` and `DAY00-MCP-002`.
- Acceptance comparison is by failure identity and count, not only process exit code. Any additional failure is `NEW_REGRESSION` and blocks `FOUNDATION_PASS`.

## 8. Risk register

| Risk | Likelihood | Impact | Control | Stop trigger |
|---|---:|---:|---|---|
| Existing 49 web failures mask a new localization or snapshot regression | High | High | Compare names/count against Day 0 registry; targeted new tests must be green | Any 50th failure or changed failure family |
| Existing 2 MCP failures mask contract drift | Medium | High | Run MCP matrix if shared/mirrored contracts move | Any new MCP failure or tool-count drift |
| Cloud execution environment lacks Node/npm | High in current environment | High | Require Node from `.nvmrc` or equivalent CI before claiming PASS; do not install ad hoc versions | No executable validation path before commit/hand-off |
| Fork diverges from upstream or remote branch advances | Medium | High | Fetch, record merge-base/HEAD, use fork-only push, never merge upstream inside implementation task | Non-fast-forward, unexpected HEAD, or required upstream reconciliation |
| Scope creep into Day 4–7 measurement, XLSX, AI or backend work | Medium | High | Enforce FND task/file map and five-commit ceiling | A requested change cannot be traced to an AC-FND criterion |
| Hungarian terminology drifts, especially visible `BOQ` | High | Medium | Central label assertions and source scan on touched surfaces | Visible `BOQ` remains or golden changes broaden beyond touched surfaces |
| UI foundation integration regresses the large canvas | Medium | High | Keep `TakeoffCanvas.jsx` change minimal, preserve `/`, run full suite/build/browser smoke | Viewer, pan/zoom, upload, scale or existing local mode changes unexpectedly |
| Auth placeholder accidentally grants access | Low–Medium | Critical | Fail closed; blocked config state; project id never authorizes access | Private component mounts before positive auth+store readiness |
| Additive model loses legacy data | Low–Medium | Critical | Pure sanitizer tests, round-trip unknown fields, no DB version bump/destructive migration | Existing shapes/sheets/annotations differ after no-op load/save |
| Duplicate or partial project creation | Medium | Medium | Exactly-one Drive call; navigate only after success; failure leaves form retryable | Duplicate folder/event or navigation without confirmed folder id |
| Sensitive data reaches audit/log/browser config | Low | Critical | Metadata allowlist, redaction tests, keep secrets server-side | Token, bytes, raw content or secret appears in persisted/logged event |

## 9. Stop conditions requiring Product Owner direction

Implementation must stop without broadening scope when any of the following occurs:

1. branch, fork, starting HEAD or clean-tree precheck does not match the authorized task;
2. remote history requires force-push, upstream push, conflict resolution or an unplanned merge/rebase;
3. protected `/app` cannot be delivered with the existing manually provisioned Google/Drive route and a new Supabase/provider dependency appears necessary;
4. credentials, tenant ids, pilot account details, storage location, retention policy or legal permission must be selected rather than merely configured;
5. project isolation cannot be proven by the provider permission check plus local/cloud scoping tests;
6. the additive foundation model requires a destructive IndexedDB migration or changes existing project payload semantics;
7. a change outside the expected file map is required, especially broad edits to `TakeoffCanvas.jsx`, sync transports, XLSX, MCP, server or dependencies;
8. a new test failure appears, baseline failure identity/count changes, benchmark output drifts, or build/typecheck/lint fails;
9. Node/npm and browser smoke are both unavailable, leaving no adequate validation path;
10. a Hungarian term has multiple materially different domain meanings that are not resolved by `DEC-017`;
11. implementation would start Day 4–7 measurement work, AI work, pilot execution or production deployment;
12. a commit would contain unrelated or user-owned changes.

## 10. Recommended implementation sequence

Maximum: five implementation commits. Each commit must be independently reviewable and must contain its focused tests.

| Commit | Bounded scope | Entry condition | Exit evidence |
|---|---|---|---|
| 1. `feat: establish protected MernokSzem app routes` | FND-01 route skeleton, AppShell navigation and Hungarian terminology; add fail-closed access-state helper tests | Clean authorized branch; no dependency change | Route/access unit tests, UI foundation tests, typecheck/lint/build |
| 2. `feat: add pilot access boundary` | FND-02 `PilotAccessBoundary` using existing Google auth; blocked configuration and unauthorized deep-link behavior | Commit 1 green; existing provider sufficient | Access matrix tests and browser smoke for unauthenticated/config-missing states |
| 3. `feat: add project document audit foundation` | FND-03 canonical additive records, sanitizers and store/cloud persistence contract | Commit 2 green; no destructive migration | Model/store/cloud targeted tests and legacy round-trip proof |
| 4. `feat: add controlled project create and upload metadata` | FND-04 create/open flow plus post-success PDF metadata/audit hook | Commit 3 green; Projects root and fake Drive contract confirmed | Project-home, Drive, ingest and persistence tests; created/opened/uploaded browser path |
| 5. `test: verify MernokSzem foundation continuity` | FND-05 targeted/full regression, viewer/scale smoke and implementation report; only minimal corrective edits within listed files | Commits 1–4 green | Full required matrix, baseline comparison, browser evidence and `FOUNDATION_PASS` report |

Do not combine auth, persistence and canvas integration into one commit. If any commit needs unrelated cleanup to pass, stop and report instead of absorbing the cleanup.

## 11. GO / NO-GO recommendation

**GO**, with mandatory entry controls.

Actual implementation may start in a separately authorized task when:

- it starts from this plan commit on `codex/w01-ui-foundation` with a clean tree;
- Node 24/npm and browser smoke are available, or equivalent CI evidence is explicitly authorized;
- the existing Google/Drive manually provisioned pilot path is accepted as the Day 1–3 provider implementation;
- no new dependency, secret, upstream synchronization or scope expansion is required.

If any condition is false, the implementation recommendation becomes **NO-GO** until the Product Owner resolves the corresponding stop condition.

## 12. Recommended next task

Authorize implementation commit 1 only: **protected MérnökSzem `/app` route skeleton, fail-closed pilot access-state helper, AppShell navigation wiring and Hungarian terminology correction**, starting from this plan commit. Do not start commits 2–5 automatically.
