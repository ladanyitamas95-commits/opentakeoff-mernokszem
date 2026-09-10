# MS-MVP-S00 — Full repository audit & baseline

Date: 2026-09-10  
Branch: `codex/phase-00-baseline`  
Audit type: documentation-only Phase 00 baseline

## 1. Executive summary

The repository contains a working OpenTakeoff-derived browser takeoff application with reusable PDF rendering, canvas interaction, drawing, scale, geometry, export and local persistence capabilities.

For MérnökSzem MVP, the repository is not yet a production-ready authoritative measurement system. The main gaps are production backend persistence, explicit SI/Decimal measurement authority, frozen data/API contracts, auth/tenant decisions, validation/review/audit event model and BOQ contract.

## 2. Source authority summary

Observed authoritative source set:

- `docs/product/MS_MVP_FINAL_SCOPE_LOCK_v1.0.md`
- `docs/product/MS_MVP_SCREEN_SPEC_v1.0.md`
- `docs/architecture/MS_MernokSzem_MVP_integracios_terv_v1.0.md`
- `docs/architecture/MS_AI_Development_Orchestration_Plan_v1.0.md`
- `docs/takeoff/MernokSzem_TakeOff_AI_Assisted_Falhossz_Terulet_v0.2.md`
- `docs/development/CODEX_INPUT_PACK_INDEX_v1.0.md`
- `docs/development/CODEX_BUILD_PLAN_MS_MVP_v1.0.md`
- `docs/regression/MS_MVP_REGRESSION_CORPUS_MANIFEST_v1.0.md`
- `docs/brand/source/MernokSzem_BrandBook_v1.0_brandcsalad.docx`
- `docs/README.md`

Baseline rule:

- `REFERENCE != AUTHORITATIVE`
- `GENERATED != VALIDATED`

## 3. Repository structure

Repository tree baseline:

```text
.
├── .github/workflows/
├── capture/
├── demo/
├── docs/
│   ├── architecture/
│   ├── brand/
│   ├── development/
│   ├── generated/
│   ├── product/
│   ├── references/
│   ├── regression/
│   └── takeoff/
├── evals/
├── mcp/
├── scripts/
├── server/
└── web/
```

| Path | Role |
| --- | --- |
| `web/` | React/Vite frontend |
| `web/src/pages/TakeoffCanvas.jsx` | main takeoff canvas UI |
| `web/src/lib/` | geometry, units, sheets, store, export, AI and domain helper modules |
| `web/test/` | frontend unit/regression tests |
| `web/netlify/functions/` | Netlify serverless helper |
| `mcp/` | TypeScript MCP server |
| `server/` | FastAPI AI sandbox |
| `.github/workflows/ci.yml` | CI baseline |
| `docs/` | MérnökSzem documentation structure |
| `capture/`, `evals/`, `demo/` | capture/evaluation/demo assets |

## 4. Stack baseline

| Area | Status | Observed stack |
| --- | --- | --- |
| React | CONFIRMED | React 18.3 in `web/package.json` |
| Vite | CONFIRMED | Vite 6 config in `web/vite.config.js` |
| JavaScript / TypeScript | CONFIRMED | mixed `.js`, `.jsx`, `.ts` |
| PDF.js / pdfjs-dist | CONFIRMED | `pdfjs-dist` dependency and worker usage |
| canvas / geometry tooling | CONFIRMED | canvas UI plus custom geometry modules |
| state management | CONFIRMED | React component state/hooks, no separate global state framework observed |
| persistence | PARTIAL | local IndexedDB/localStorage plus optional Drive/M365/File System Access |
| IndexedDB/localStorage | CONFIRMED | `web/src/lib/store.js`, `web/src/lib/ai.js` |
| backend | PARTIAL | FastAPI sandbox only |
| API layer | PARTIAL | `/ai` proxy/function/sandbox; no production persistence API observed |
| auth | PARTIAL | optional Google/Microsoft paths; no unified production auth |
| database | NOT_PRESENT as production DB | browser IndexedDB only observed |
| file storage | PARTIAL | browser/local/cloud connector paths, no production object store |
| AI/MCP integration | PARTIAL | BYO AI helper, Netlify Gemini function, MCP server |
| testing framework | CONFIRMED | Node test runner + `tsx`, pytest intended for server |
| linting | CONFIRMED | ESLint in `web/eslint.config.mjs` |
| type checking | CONFIRMED | TypeScript configs in web/mcp |
| package manager | PARTIAL | npm scripts/lockfiles observed; runtime also had pnpm available |
| build tooling | CONFIRMED | Vite, tsc, esbuild for MCP |
| deployment config | CONFIRMED | `netlify.toml`, CI workflow |

## 5. Current capability matrix

| Capability | Status | Note |
| --- | --- | --- |
| Project management | PARTIAL | browser/local/cloud gate concepts exist, production project backend not observed |
| Document upload | PARTIAL | PDF open/add flows exist, production document service missing |
| PDF upload | WORKING | implemented in web app |
| PDF rendering | WORKING | implemented with pdf.js/canvas |
| Page extraction | WORKING | sheet/page helpers and state exist |
| Multi-page support | WORKING | page count/page switching state exists |
| Page switching | WORKING | UI state exists |
| Zoom | WORKING | canvas view state exists |
| Pan | WORKING | canvas view state exists |
| Scale calibration | WORKING | local scale flow exists, production confirmed scale contract still needed |
| Scale persistence | PARTIAL | local/annotation persistence exists, server authority not observed |
| Polygon drawing | WORKING | shape and vertex paths exist |
| Polyline drawing | WORKING | open metric path exists |
| Count marker | WORKING | count role path exists |
| Geometry calculations | WORKING | current frontend geometry implementation exists; MVP still needs SI/Decimal authority decision |
| Deductions | WORKING | holes/deduct logic exists |
| Measurement persistence | PARTIAL | local/cloud-store style persistence, no production backend |
| Measurement editing | WORKING | shape edit/vertex paths exist |
| Measurement review | PARTIAL | proposal/review states exist |
| AI proposals | PARTIAL | concept exists; production provider/audit flow not final |
| Accept/Edit/Reject | PARTIAL | UI/proposal logic present, backend audit missing |
| BOQ import | NOT IMPLEMENTED as canonical contract | no final BOQ pipeline observed |
| BOQ compare | NOT IMPLEMENTED as canonical contract | no final compare contract observed |
| XLSX export | WORKING | helper module present |
| CSV export | WORKING | helper modules present |
| JSON export | WORKING | helper modules present |
| Marked PDF export | WORKING | PDF export helpers present |
| Validation | PARTIAL | local checks exist, final ValidationFinding contract missing |
| Review queue | PARTIAL | RFI/proposal concepts exist |
| Audit trail | PARTIAL | provenance/revision concepts exist, production AuditEvent missing |
| Authentication | PARTIAL | optional Google/Microsoft flows; no unified production auth baseline |
| Backend persistence | NOT IMPLEMENTED as production baseline | FastAPI app is AI sandbox |
| MCP | PARTIAL | code exists, but dependency install missing in current worktree |
| AI provider integration | PARTIAL | BYO browser, Netlify function, sandbox heuristic |

## 6. Reuse matrix

| Existing module | Decision | Affected file/module | Technical reason | MérnökSzem compatibility | Later phase |
| --- | --- | --- | --- | --- | --- |
| PDF viewer | ADAPT | `web/src/pages/TakeoffCanvas.jsx` | working browser viewer/canvas baseline | compatible as UI baseline | WAVE 1 |
| PDF.js integration | KEEP/ADAPT | `web/package.json`, PDF worker usage | proven PDF rendering dependency | compatible if wrapped by document/page contract | WAVE 1 |
| TakeoffCanvas | ADAPT | `web/src/pages/TakeoffCanvas.jsx` | feature-rich but monolithic | compatible only with single-owner control | WAVE 1 |
| Drawing tools | ADAPT | canvas shape logic | polygon/polyline/count workflows exist | compatible after measurement contract | WAVE 1 |
| Geometry functions | ADAPT | `web/src/lib/geometry.js` | reusable helper calculations | needs SI/Decimal validation and regression | WAVE 1 |
| Scale/calibration | ADAPT | `TakeoffCanvas.jsx`, `web/src/lib/sheets.ts` | existing scale UX/state | needs confirmed-scale authority | WAVE 1 |
| Shape model | ADAPT | shape objects in annotations/libs | captures geometry and roles | needs explicit Measurement schema | WAVE 1 |
| Condition model | REPLACE/ADAPT | condition/report modules | useful grouping baseline | final Hungarian taxonomy not frozen | WAVE 1/2 |
| Measurement data | ADAPT | shapes, totals, exports | quantity data exists | needs canonical unit/status/source fields | WAVE 1 |
| Persistence | REPLACE for production | `web/src/lib/store.js` | local/browser-first storage | keep for demo, not authoritative backend | WAVE 1/2 |
| IndexedDB | KEEP | `web/src/lib/store.js` | local PDFs/meta/snapshots work | local/offline cache only | WAVE 1/2 |
| localStorage | KEEP | AI/settings/preferences modules | useful preferences | not for secrets | WAVE 1 |
| Export | ADAPT | `totals.js`, `shapesExport.js`, `rfi.js`, `xlsx.js` | existing CSV/JSON/XLSX/PDF code | needs schema/locale freeze | WAVE 1 |
| AI/MCP | ADAPT | `web/src/lib/ai.js`, `mcp/` | existing proposal/tool concepts | human-in-the-loop only, no browser secrets | WAVE 2 |
| Proposal state | ADAPT | proposal/review modules and canvas state | useful review concept | needs ReviewItem/AuditEvent contract | WAVE 1/2 |
| Imperial unit assumptions | REPLACE | `shapeMetrics.js`, `units.ts` | current internals include legacy unit model | canonical SI/Decimal required | WAVE 1 |

## 7. Data model baseline

| Target entity | Baseline status | Current evidence | Gap |
| --- | --- | --- | --- |
| Project | FRONTEND_ONLY | frontend project gates and metadata | production entity contract |
| Document | FRONTEND_ONLY | PDF file records/local stores | canonical document record |
| DocumentPage | FRONTEND_ONLY | sheet/page state | stable page identity contract |
| ScaleCalibration | FRONTEND_ONLY | sheet scale fields and scale source/confirmation state | authoritative server-side validation/audit |
| CoordinateSystem | SHARED | normalized geometry/canvas assumptions in frontend libs | explicit contract freeze |
| Measurement | FRONTEND_ONLY | shape objects | final unit/status/source contract |
| MeasurementGeometry | SHARED | normalized vertices/hole vertices | final coordinate and precision policy |
| MeasurementStatus | FRONTEND_ONLY | proposal/review/origin status concepts | canonical status enum |
| ValidationFinding | NOT_PRESENT | partial confidence/guard concepts only | canonical finding model |
| ReviewItem | FRONTEND_ONLY | proposals/RFI/origin reviewed flags | queue and audit contract |
| BOQ | NOT_PRESENT | reports/exports only | canonical BOQ model |
| BOQItem | NOT_PRESENT | report rows only | canonical BOQ item contract |
| AuditEvent | NOT_PRESENT | origin/provenance/revision concepts only | immutable audit event store |

Additional observed data/schema notes:

- Identifier examples: `sheet_id`, active sheet/page keys, IndexedDB keys, annotation schema name `opentakeoff.takeoff_canvas.v1`.
- Shape representation: shape objects with role/category/state plus normalized vertices.
- Geometry representation: normalized vertices and hole vertices, with helper calculations in frontend libs.
- Coordinate system: normalized canvas/PDF coordinate model is present; final authoritative coordinate contract is not frozen.
- Scale representation: per-sheet scale fields such as units-per-pixel, scale source and confirmation state were observed.
- Condition representation: condition/category data exists in annotations and report aggregation; final Hungarian taxonomy is not frozen.
- Storage schema: IndexedDB stores PDFs/meta/snapshots/revisions; annotations include conditions, shapes, markups, sheets, rules, approvals and stitches.
- Persistence abstraction: local store plus optional provider gates exist; production server-authoritative persistence is not present.
- API contracts: AI/sandbox endpoints exist; production measurement/project/BOQ API contracts are not present.
- Export schema: report, shape and RFI CSV/JSON/XLSX/PDF export helpers exist; final schema/locale policy must be frozen.

## 8. Build/test baseline

| Area | Result |
| --- | --- |
| Web build | PASS |
| Web typecheck | PASS |
| Web lint | PASS |
| Web tests | FAIL: 1752 total, 1700 pass, 49 fail |
| MCP tests/build | NOT AVAILABLE / FAIL due missing dependencies in current environment |
| Server tests | NOT AVAILABLE / FAIL due missing dev dependencies |

Primary web test failure pattern: localized Hungarian/export/report/RFI strings now differ from tests expecting English/OpenTakeoff labels.

## 9. Security baseline

| Issue | Severity | Evidence |
| --- | --- | --- |
| Browser AI key/localStorage and `VITE_AI_KEY` public-build risk | P1 | `web/src/lib/ai.js`, `web/.env.example` |
| Google audience check inactive when `GOOGLE_CLIENT_ID` missing | P1 | `web/netlify/functions/parse-schedule.mjs` |
| Local PDFs/annotations stored in browser IndexedDB | P2 | `web/src/lib/store.js` |
| FastAPI sandbox wide CORS | P2 | `server/app.py` |
| Auth/provider split across local/Google/Microsoft flows | P2 | `web/src/main.jsx` and auth/store modules |

## 10. Technical debt top 10

| # | Problem | Affected file/area | Consequence | Severity | Recommended phase | Blocks parallel dev? |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Web tests fail after localization | `web/test/*`, export/report/RFI libs | CI cannot be considered green | P1 | Phase 00/WAVE 1 prep | YES |
| 2 | `TakeoffCanvas.jsx` is monolithic | `web/src/pages/TakeoffCanvas.jsx` | high merge/regression risk | P1 | WAVE 1 prep | YES |
| 3 | SI/Decimal authority missing | geometry/metric libs | production measurement risk | P0/P1 | WAVE 1 | YES |
| 4 | Production backend persistence missing | server/future backend | no authoritative project/document/measurement store | P0/P1 | WAVE 1 | YES |
| 5 | Domain/API contracts not frozen | docs/future schema | agents may implement incompatible models | P0/P1 | before WAVE 1 | YES |
| 6 | Legacy unit assumptions remain | `shapeMetrics.js`, `units.ts` | Hungarian SI MVP mismatch risk | P1 | WAVE 1 | YES |
| 7 | Browser-facing AI secret path | `web/src/lib/ai.js` | production secret exposure risk | P1 | before production AI | NO |
| 8 | Canonical BOQ pipeline missing | report/export/future BOQ | MVP scope gap if required | P1 | WAVE 1/2 | YES |
| 9 | Offline dependency install not reproducible | web/mcp env | local baseline reproducibility issue | P2 | Phase 00/WAVE 1 prep | NO |
| 10 | Legacy branding/test drift | web tests/docs/source labels | inconsistent locale expectations | P2/P3 | WAVE 1 prep | NO |

## 11. Parallel development risk

High-risk shared files:

- `web/src/pages/TakeoffCanvas.jsx`
- `web/src/lib/geometry.js`
- `web/src/lib/shapeMetrics.js`
- `web/src/lib/units.ts`
- `web/src/lib/store.js`
- `web/src/lib/totals.js`
- `web/src/lib/shapesExport.js`
- `web/src/lib/rfi.js`
- package/lock files
- CI workflow

## 12. Contract freeze requirements

Minimum pre-WAVE 1 contract freeze:

1. Project
2. Document
3. DocumentPage
4. CoordinateSystem
5. ScaleCalibration
6. MeasurementGeometry
7. Measurement
8. ValidationFinding
9. ReviewItem
10. BOQ and BOQItem
11. AuditEvent
12. Export schema and locale policy

## 13. GO / NO-GO

WAVE 1 status: CONDITIONAL GO.

GO if:

- contract freeze is completed first;
- file ownership is enforced;
- web test localization drift is handled;
- production backend/auth/persistence scope is explicitly decided.

NO-GO for:

- feature implementation directly inside `TakeoffCanvas.jsx` without ownership;
- geometry or unit refactor without regression corpus;
- production AI secrets in browser;
- BOQ implementation without schema freeze.
