# MS-MVP Day 1 Commit 02 — Pilot Access Hardening Report

Date: 2026-09-14
Task: `MS-MVP-DAY01-COMMIT02-PILOT-ACCESS-HARDENING`
Status: PASS
Recommendation: GO for separately authorized Commit 3

## Repository verification

| Field | Verified value |
|---|---|
| Repository | `https://github.com/ladanyitamas95-commits/opentakeoff-mernokszem` |
| Branch | `codex/w01-ui-foundation` |
| Starting HEAD | `8ae35b0346a97202de62e6ee1e2187bd1b76fa8f` |
| Final HEAD | The commit containing this report; exact SHA is recorded in the task final output |
| Initial working tree | Clean |
| `origin` | Writable fork: `https://github.com/ladanyitamas95-commits/opentakeoff-mernokszem.git` |
| `upstream` | Reference only: `https://github.com/Kentucky-ai/opentakeoff.git` |

The checked-out HEAD exactly matched the Product Owner-authorized Commit 1 SHA. Branch, ancestry and remotes passed pre-flight verification.

## Implementation summary

- Split Google configuration and Projects root-folder configuration into independently evaluated fail-closed inputs.
- Made every unresolved auth-ready value non-authorized and mapped it to `loading` after configuration is present.
- Added a rendered boundary-content seam used by both production and tests, so the complete state matrix is exercised without duplicating auth logic.
- Kept authorization dependent only on explicit configuration, ready auth state and a valid user identity.
- Hardened `/app` path recognition for path, query and fragment forms while rejecting lookalikes and malformed input.
- Replaced raw sign-in exception display with a fixed Hungarian message to avoid exposing provider details.
- Added route/query/project-id injection tests proving identifiers never grant authorization.
- Did not change routing, project opening, Drive permission lookup, persistence, uploads, audit events, review items, `store.js`, `cloudStore.js`, `TakeoffCanvas.jsx`, dependencies or unrelated baseline tests.

## Files changed

- `web/src/lib/pilotAccess.js`
- `web/src/components/PilotAccessBoundary.jsx`
- `web/test/pilotAccess.test.ts`
- `docs/generated/audits/MS-MVP-DAY01-COMMIT02-PILOT-ACCESS-HARDENING-REPORT.md`

## Exact access-state matrix

| Google configured | Projects root configured | Auth ready | User | Result |
|---|---|---|---|---|
| No | Any | Any | Any | `blocked_config` |
| Yes | No | Any | Any | `blocked_config` |
| Yes | Yes | No or unresolved | Any | `loading` |
| Yes | Yes | Yes | Missing | `unauthenticated` |
| Yes | Yes | Yes | Malformed, scalar, array, or blank identity | `unauthenticated` |
| Yes | Yes | Yes | Object with non-empty `sub` or `email` | `authorized` |
| Missing/malformed input | Missing/malformed input | Missing/malformed input | Any | Non-authorized |

Unknown rendered state values use the configuration-blocked view. No route, query parameter or project identifier is an input to the authorization decision.

## Route behavior

| Route | Access contract |
|---|---|
| `/` | Public legacy OpenTakeoff entry; unchanged |
| `/ui-foundation` | Public W01 preview; unchanged |
| `/app` | Protected |
| `/app/projects` | Protected |
| Any `/app/*` | Protected, including query-bearing forms |
| `/application` and other lookalikes | Not classified as the `/app` protected subtree |

No route change was required in this commit. Existing Commit 1 routing continues to wrap `/app`, `/app/projects` and `/app/*` in `PilotAccessBoundary`.

## Project-id and bypass assessment

A project id remains an identifier only. Focused tests inject `pathname`, `search` and `projectId` values, including `/app/projects?project=fake`, into otherwise unconfigured or unauthenticated input. The result remains `blocked_config` or `unauthenticated`, and rendered private children remain absent.

This commit intentionally does not perform Drive permission lookup or open a project. Full inaccessible-project validation remains a later integration task after project-opening behavior is separately authorized.

## Hungarian UI and terminology

- Loading: `Pilot-hozzáférés ellenőrzése…`
- Sign-in: `Bejelentkezés szükséges`
- Configuration block: `A pilot hozzáférés nincs konfigurálva`
- Safe return: `Vissza a helyi tervméréshez`
- Sign-in failure: fixed non-sensitive Hungarian message
- Visible `BOQ` on touched W01 surfaces: none; `Költségvetés` remains the visible term

## Browser smoke

Result: not run. The execution sandbox rejected the local Vite listener with `listen EPERM: operation not permitted 127.0.0.1:5177`. No browser PASS is claimed.

### Manual browser smoke checklist

- [ ] `/` opens unchanged local OpenTakeoff entry.
- [ ] `/ui-foundation` opens the UI foundation preview.
- [ ] `/app` without configuration shows Hungarian blocked state.
- [ ] `/app/projects` without configuration shows Hungarian blocked state.
- [ ] `/app` configured but unauthenticated shows Hungarian sign-in state.
- [ ] `/app/projects` configured but unauthenticated shows Hungarian sign-in state.
- [ ] Authenticated and configured access renders the private shell only after auth is ready.
- [ ] Manipulated `/app/projects?project=fake` does not bypass the boundary.

## Tests and validation

Validation used the existing lockfile-installed dependencies and bundled Node 24 runtime. No manifest or lockfile changed.

| Check | Result |
|---|---|
| Targeted `pilotAccess` and W01 UI tests | PASS — 13/13 |
| `npm --prefix web run typecheck` | PASS |
| `npm --prefix web run lint` | PASS |
| `npm --prefix web run build` | PASS — 769 modules; non-blocking chunk-size warning |
| Full `npm --prefix web test` | Baseline retained — 1765 total, 1713 pass, 49 fail, 3 skip |
| Local Vite launch | Not available — sandbox `listen EPERM` |
| `git diff --check` | Required final result recorded in the task final output |
| `git diff --cached --check` | Required final result recorded in the task final output |
| `git status --short` | Required final result recorded in the task final output |

### Known pre-existing failures

- 49 registered web localization/golden failures remain. They were not fixed or rebaselined.
- 2 registered MCP failures remain. MCP was outside the touched area and was not run.

### New regressions

None detected. The full web suite retained exactly the registered 49 failures while the two new hardening tests increased the passing count.

## Acceptance criteria status

| Criterion | Status | Evidence |
|---|---|---|
| Required repository, branch, authorized HEAD, remotes and clean start | PASS | Pre-flight Git verification |
| Missing Google configuration is blocked | PASS | Pure and rendered matrix tests |
| Missing Projects root folder is blocked | PASS | Pure and rendered matrix tests |
| Configured but unresolved auth is loading | PASS | Pure and rendered matrix tests |
| Configured, ready and signed out is unauthenticated | PASS | Pure and rendered matrix tests |
| Only configured, ready and valid user is authorized | PASS | Pure and rendered matrix tests |
| Malformed user and unknown state fail closed | PASS | Pure and rendered tests |
| Route/query/project id cannot grant access | PASS | Identifier-injection and rendered deep-link tests |
| Public and protected route assumptions retained | PASS | Route-contract tests; no router change |
| Touched copy remains Hungarian and visible terminology remains `Költségvetés` | PASS | Rendered access and W01 UI tests |
| Required checks available in the environment run without new regression | PASS | Targeted tests, typecheck, lint, build and baseline comparison |
| Manual checklist recorded when browser smoke is unavailable | PASS | Checklist above |

## Unresolved risks

- The manual browser checklist is pending in an environment that permits a local server and can supply controlled pilot Google/Drive configuration.
- Drive-level denial for an inaccessible project cannot be verified until project-opening integration is separately in scope; URL identifiers do not authorize in the current boundary.
- Client-side gating is not production authorization. The controlled pilot continues to rely on Google Drive permissions as the authoritative data-access layer.
- The 49 web and 2 MCP baseline failures continue to reduce full-suite signal quality.
- Fork/upstream divergence remains an external repository-management risk.

## GO / NO-GO for Commit 3

**GO**, after separate Product Owner authorization. Commit 3 should remain bounded to the planned additive Project, Document, DocumentVersion, ReviewItem and AuditEvent foundation contracts and persistence tests. It must not absorb browser smoke, project creation, upload integration or unrelated baseline fixes.

## Stop condition

Stop after this single commit and its authorized push to `origin/codex/w01-ui-foundation`. Do not begin Commit 3 or any project creation, persistence, upload, canvas, viewer, measurement, XLSX, AI or report-engine work.
