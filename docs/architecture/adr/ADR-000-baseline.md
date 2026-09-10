# ADR-000 — Phase 00 repository baseline

Status: Accepted baseline  
Date: 2026-09-10  
Scope: MérnökSzem MVP repository audit, no product implementation

## Context

The repository is an OpenTakeoff-derived codebase with a working browser-based takeoff frontend, supporting libraries, an MCP server, and an optional FastAPI AI sandbox.

Authoritative MérnökSzem documents in `docs/` define a narrower MVP target than the full legacy OpenTakeoff surface:

- human-in-the-loop AI assistance;
- browser-based plan viewing and measurement reuse where safe;
- confirmed scale before dimensional measurements enter canonical quantities;
- Hungarian, professional construction-domain product surface;
- future production-grade backend contracts for project, document, measurement, review, BOQ and audit data.

Reference materials and generated materials are not automatically authoritative.

## Decision

For Phase 00, the repository baseline is recorded as documentation only.

No frontend feature, backend feature, dependency upgrade, UI redesign, Supabase/auth implementation, geometry refactor, BOQ implementation or AI feature is introduced by this ADR.

The current OpenTakeoff code is treated as a reusable technical baseline, not as the final authoritative MérnökSzem domain model.

## Baseline architecture

| Layer | Current implementation | Baseline decision |
| --- | --- | --- |
| Web app | React + Vite under `web/` | Keep as primary frontend codebase |
| Main takeoff UI | `web/src/pages/TakeoffCanvas.jsx` | Treat as high-risk single-owner area until split/refactor is planned |
| Geometry helpers | `web/src/lib/geometry.js`, `shapeMetrics.js`, `units.ts`, `sheets.ts` | Reuse as reference/adaptable code; do not treat as final SI production authority |
| Local persistence | IndexedDB/localStorage in `web/src/lib/store.js` and related helpers | Keep for local/demo/offline behavior; production persistence contract remains open |
| Export | CSV/JSON/XLSX/PDF helper modules in `web/src/lib` | Adapt for MVP exports after contract freeze |
| AI browser helper | `web/src/lib/ai.js` | Reference only for local/BYO flow; production secret handling must move server-side |
| Netlify function | `web/netlify/functions/parse-schedule.mjs` | Optional server-side AI integration candidate, still needs production auth decisions |
| FastAPI sandbox | `server/app.py` | Sandbox/reference, not production backend |
| MCP server | `mcp/` | Developer automation/integration candidate; not user-facing MVP contract |

## Authoritative source hierarchy

1. Product scope and screen requirements in `docs/product/`
2. Architecture and orchestration documents in `docs/architecture/`
3. Takeoff domain policy in `docs/takeoff/`
4. Regression and QA manifests in `docs/regression/`
5. Brand source in `docs/brand/source/`
6. Non-authoritative references in `docs/references/`
7. Unvalidated generated working material in `docs/generated/`

`REFERENCE != AUTHORITATIVE`  
`GENERATED != VALIDATED`

## Capability baseline

| Capability | Status | Evidence / note |
| --- | --- | --- |
| Project management | PARTIAL | Local/project gate concepts exist; no observed production project backend |
| Document upload | WORKING/PARTIAL | Browser PDF add/open paths exist; production document service not established |
| PDF upload | WORKING | Frontend PDF flow present |
| PDF rendering | WORKING | `pdfjs-dist` and canvas rendering in web frontend |
| Page extraction / sheet handling | WORKING | sheet/page helper and state present |
| Multi-page support | WORKING | active sheet/page state and page count support present |
| Page switching | WORKING | sheet/page UI state present |
| Zoom | WORKING | canvas view/zoom state present |
| Pan | WORKING | canvas view/pan state present |
| Scale calibration | WORKING/PARTIAL | frontend scale state exists; canonical confirmed production scale contract not frozen |
| Scale persistence | WORKING/PARTIAL | local annotation persistence exists; server authority not present |
| Polygon drawing | WORKING | shape/vertex geometry present |
| Polyline drawing | WORKING | open metric geometry present |
| Count marker | WORKING | count role and scale-free metric path present |
| Geometry calculations | WORKING/PARTIAL | frontend JS geometry works; authoritative SI/Decimal engine still required |
| Deductions | WORKING | holes/deduct handling exists |
| Measurement persistence | WORKING/PARTIAL | local/Drive-style persistence exists; production DB not present |
| Measurement editing | WORKING | shape edit/vertex state present |
| Measurement review | PARTIAL | proposal/review/origin flags exist; final review workflow not canonical |
| AI proposals | PARTIAL | AI/proposal concepts exist; production provider and audit flow not final |
| Accept/Edit/Reject | PARTIAL | proposal handling exists; backend audit contract absent |
| BOQ import | NOT IMPLEMENTED as canonical MVP contract | schedule/import helpers exist, but no authoritative BOQ pipeline observed |
| BOQ compare | NOT IMPLEMENTED as canonical MVP contract | no production compare contract observed |
| XLSX export | WORKING | XLSX writer present |
| CSV export | WORKING | report/shape/RFI CSV helpers present |
| JSON export | WORKING | report/shape/RFI JSON helpers present |
| Marked PDF export | WORKING | PDF export helpers present |
| Validation | PARTIAL | local guards/tests exist; canonical validation finding model not frozen |
| Review queue | PARTIAL | RFI/proposal states exist; no production queue contract |
| Audit trail | PARTIAL | origin/provenance/revision concepts exist; no production audit event store observed |
| Authentication | PARTIAL | optional Google/Microsoft paths; local default; no unified production auth baseline |
| Backend persistence | NOT IMPLEMENTED as production baseline | FastAPI sandbox is AI-focused, not persistence backend |
| MCP | IMPLEMENTED, not runnable in current env | code present; dependency install unavailable in audit environment |
| AI provider integration | PARTIAL | BYO browser AI, Netlify Gemini function, sandbox heuristic adapter |

## Reuse decision baseline

| Component | Decision | Rationale |
| --- | --- | --- |
| PDF viewer/rendering | ADAPT | Existing browser workflow is useful |
| Drawing tools | ADAPT | Existing polygon/polyline/count workflows are useful |
| Scale UX | ADAPT | Existing calibration flow is useful, but must add canonical confirmed scale policy |
| Geometry helpers | ADAPT / VERIFY | Useful implementation, but SI/Decimal authority and regression corpus required |
| Measurement model | ADAPT | Existing shape model can inform MVP, but final contract must be explicit |
| Conditions/categories | REPLACE/ADAPT | Existing labels/categories are not the final Hungarian construction taxonomy |
| IndexedDB storage | KEEP for local/demo | Not sufficient as production backend |
| localStorage settings | KEEP for preferences only | Not suitable for secrets |
| AI helper | REPLACE for production path | Browser key handling is not production-safe |
| Export helpers | ADAPT | Working baseline, but schema/locale decisions must be frozen |
| MCP server | KEEP as developer/internal candidate | Not an MVP user-facing contract |
| FastAPI sandbox | KEEP as sandbox/reference | Not production persistence/auth backend |

## Contract freeze required before WAVE 1 implementation

1. Project and tenant/auth boundary
2. Document and document page identity
3. Coordinate system and normalized geometry policy
4. Scale calibration, confirmation and source policy
5. Measurement geometry, quantity, units and status contract
6. Validation finding and review item contract
7. BOQ and BOQ item contract
8. Audit event and immutable revision policy
9. Export schema and locale policy

## Consequences

- The repository is suitable for WAVE 1 only with contract discipline.
- `TakeoffCanvas.jsx`, shared geometry modules, export schemas, package files, routing and persistence modules must not be edited by multiple streams without explicit ownership.
- Current failing web tests must be handled before CI can be considered green.
- Existing legacy OpenTakeoff behavior remains useful, but does not automatically satisfy MérnökSzem MVP production rules.
