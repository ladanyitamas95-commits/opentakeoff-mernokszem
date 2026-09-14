# MS-MVP-DAY00-BASELINE-FAILURE-REGISTRY

Date: 2026-09-14
Baseline starting SHA: `4d6d26bf0e806f0a6aafda0cd0d1971573eccd8f`

## Summary

| Check | Status | Notes |
|---|---|---|
| Web typecheck | PASS | `tsc --noEmit` |
| Web lint | PASS | ESLint over `src` and `netlify/functions` |
| Web unit tests | FAIL | 1,757 tests: 1,705 pass, 49 fail, 3 skip |
| Web benchmark | PASS | Four explicit known-fail probes remain tracked and excluded by the benchmark policy |
| Web build | PASS | Vite production build completed; large-chunk warning only |
| MCP typecheck | PASS | `tsc --noEmit` |
| MCP tests | FAIL | 226 tests: 224 pass, 2 fail |
| MCP tool-count check | PASS | 52 tools, 4 markers, 0 stale |
| MCP build | PASS | esbuild bundle and finish-build completed |
| MCP dist smoke | PASS | Completed with exit 0 |
| Server tests | PASS | 11 passed, 2 dependency-deprecation warnings |
| Docs relative-link check | PASS | 20 files; all relative paths and anchors resolved |
| Capture selftest | PASS | Completed with exit 0 outside the socket-restricted sandbox |
| Standalone browser E2E | NOT_CONFIGURED | No CI job or package script; MCP suite includes an engine E2E test but no real-browser gate |

## Failure Registry

| ID | Command | Area | Failure type | Pre-existing? | Blocks MVP start? | Notes |
|---|---|---|---|---|---|---|
| DAY00-WEB-001 | `npm --prefix web test` | Web tests | Localization/golden drift | Yes | No for repository preparation; yes before a green CI/release gate | Same 49-failure count and dominant Hungarian-vs-English export/report/RFI pattern recorded in `MS-MVP-S00-REPOSITORY-BASELINE.md`; representative files: `reltime.test.ts` (12), `reportColumns.test.ts` (10), `labelGroupedRows.test.ts` (7), `branding.test.ts`, `rfi.test.ts`, `rfiPanel.test.ts`, `shapesExport.test.ts`, `sheetTotals.test.ts`, `xlsx.test.ts` |
| DAY00-MCP-001 | `npm --prefix mcp test` | MCP tests | Localized RFI marked-PDF expectations | Yes at Day 0 starting SHA; newly observed because prior baseline lacked MCP dependencies | No for repository preparation; yes before a green MCP CI gate | 224/226 pass. Failures expect `RFI SCHEDULE` and a page-2 schedule, while generated output is localized as `RFI-KIMUTATÁS` |
| DAY00-BENCH-001 | `npm --prefix web run bench` | Geometry benchmark | Explicit known-fail corpus cases | Yes | No; benchmark itself passes | Four known-fail probes are reported by the benchmark: annotation ring, partition bank, tile demising, and open margin. They are not represented as passing accuracy claims |

## Non-failure observations

- The first capture selftest attempt was blocked by local sandbox socket policy; the same command passed with the required local permission. This is an environment restriction, not a repository failure.
- The bundled Node runtime did not include npm. An ephemeral npm 11.6.0 CLI plus lockfile-exact `npm ci` was used; manifests and lockfiles were not changed.
- The first server attempt lacked pytest. The CI-declared requirements were installed into an isolated `/private/tmp` virtual environment, after which all 11 tests passed.
- The web build reports chunks above 500 kB. This is a non-blocking build warning, not a failed check.
- Server tests report two third-party deprecation warnings from the resolved FastAPI/Starlette/httpx stack.

## New-regression policy

Any failure not listed here after Day 0 is treated as a new regression unless explicitly reclassified.

For this Day 0 documentation task, `NEW_REGRESSION = NO`: no runtime or test source was changed. The MCP failures are newly measured but existed in the code at the Day 0 starting SHA.
