# MS-MVP Day 1 Commit 05 — Project Create/Open Hardening Report

Date: 2026-09-17
Task: `MS-MVP-DAY01-COMMIT05-WIP-HARDENING`
Status: PASS
Recommendation: STOP — wait for a separately authorized next task

## Repository verification

| Field | Verified value |
|---|---|
| Repository | `https://github.com/ladanyitamas95-commits/opentakeoff-mernokszem` |
| Branch | `copilot/ms-mvp-day01-commit05-wip-hardening` |
| Starting HEAD | `740e3fdc02abc977d70eeb2adbc4f5901031bc69` |
| Required base SHA match | PASS |
| Initial working tree | Clean |
| `origin` | Writable fork: `http://localhost:26831/ladanyitamas95-commits/opentakeoff-mernokszem` |
| Selected worktree | `/home/runner/work/opentakeoff-mernokszem/opentakeoff-mernokszem` |
| Final HEAD | `01c07e826456dba9c8714197558cfa8fe8563b3f` |

No branch comparison was repeated. The task proceeded only because the checked-out HEAD exactly matched the required canonical Commit 5 base SHA.

## Authoritative sources read

- `AGENTS.md`
- `docs/project-control/02_DECISION_REGISTER.md`
- `docs/product/MS_MVP_SCOPE_FREEZE_v2.0_FINAL.md`
- `docs/project-control/03_DEVELOPMENT_STATE.md`
- `docs/generated/plans/MS-MVP-DAY01-DAY03-FOUNDATION-WORKSTREAM-PLAN.md`

## Scope guard

This task modified only the existing Project Create/Open path and the required audit/state/docs surfaces. It did **not** add or replace:

- `ProjectHome`
- `/projects`, `/app/projects`, or `/?project=`
- router structure
- persistence abstraction
- project JSON format
- database
- dependency set
- auth system
- `TakeoffCanvas`

## Files changed

- `web/src/lib/projectHome.js`
- `web/src/components/ProjectHome.jsx`
- `web/test/projectHome.test.ts`
- `README.md`
- `docs/USER_GUIDE.md`
- `CHANGELOG.md`
- `docs/project-control/03_DEVELOPMENT_STATE.md`
- `docs/generated/audits/MS-MVP-DAY01-COMMIT05-WIP-HARDENING-REPORT.md`

## Hardened behavior

### 1. Create waits for the authoritative visible project list

The existing create path already trimmed names, rejected blank input and blocked obvious duplicates against the currently visible folder list. The hardening gap was timing: while the Drive list was still loading, that visible list was empty, so a fast user could submit before duplicate protection had authoritative data.

`ProjectHome.jsx` now disables **Létrehozás** while the project list is still loading or failed, and `projectHome.js` exposes a pure `createProjectDisabledReason()` helper so the UI and tests share the same rule. If the list failed, the create path stays closed and shows a Hungarian retry message instead of creating against an incomplete view.

### 2. Browser-local recents are reconciled against the live visible list

Browser-local recents were previously rendered from localStorage before the live Drive folder list arrived. That could leave stale or no-longer-visible project names on screen. The task added `reconcileVisibleRecentProjects()` and a narrow `replace()` write on the existing recents store.

After a successful list load, the screen now:

- keeps only recents whose folder ids are still visible in the current Projects root;
- refreshes their display names from Drive if the folder was renamed;
- drops malformed or duplicate stored recents before rendering;
- persists that reconciled subset back to browser storage.

### 3. Existing open/navigation contract is unchanged

Listed projects, reconciled recents and newly created projects still use the same encoded `/?project=<id>` contract through `projectHomeOpenUrl()`. The task did not introduce a second open path or a second project-home component.

## Tests and exact results

| Check | Result |
|---|---|
| `cd web && node --import tsx --test test/projectHome.test.ts` | PASS — 22/22 |
| `cd web && npm run typecheck` | PASS |
| `cd web && npm run lint` | PASS |
| `cd web && npm run build` | PASS — non-blocking chunk-size warning only |
| `cd web && npm test` | Baseline retained — 1753 pass, 49 fail, 3 skip |

## Known pre-existing failures

- The full web suite still contains the accepted 49 baseline failures.
- Those failures remain outside the touched ProjectHome scope and were not changed or reclassified here.

## New regressions

None detected. The targeted ProjectHome suite gained new coverage, and the full web suite retained exactly the registered 49 failures and 3 skips.

## Browser/runtime evidence

- `npm run build` passed with the touched JSX path present, which verifies the new helpers are imported and referenced correctly in the production bundle.
- A post-edit identifier grep confirmed the new `createProjectDisabledReason`, `reconcileVisibleRecentProjects` and `recentsStore` references are present only on the intended ProjectHome path.

## Acceptance summary

| ID | Status | Evidence |
|---|---|---|
| AC-FND-006 | PASS | create is disabled until list load completes; blank/duplicate tests still pass |
| AC-FND-007 | PASS | existing create path still records one Project and one `PROJECT_CREATED` event and navigates by returned folder id |
| AC-FND-008 | PASS | listed, recent and newly created projects still share `projectHomeOpenUrl()` |
| AC-FND-021 | PASS | no new secret-bearing config, storage key or URL surface was introduced |
| AC-FND-022 | PASS | targeted tests, typecheck, lint and build pass; full suite adds zero failures |
| AC-FND-023 | PASS | this report records scope, files, commands, baseline comparison and outcome |

## Stop condition

This bounded task is complete. Do not begin upload integration, canvas/viewer work, XLSX import, review queue work, AI/report work or any broader foundation task without separate authorization.
