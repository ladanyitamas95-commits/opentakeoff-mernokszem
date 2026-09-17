# MS-MVP Day 1 Commit 05 — Project Create/Open Hardening Report

Date: 2026-09-17
Task: `MS-MVP-DAY01-COMMIT05-WIP-HARDENING`
Status: PASS
Recommendation: STOP — do not merge until PR review accepts the corrected Commit 5 evidence

## Repository verification

| Field | Verified value |
|---|---|
| Repository | `https://github.com/ladanyitamas95-commits/opentakeoff-mernokszem` |
| Branch | `copilot/ms-mvp-day01-commit05-wip-hardening` |
| Required current base HEAD | `0cec2273412dc8c6b936402e5d625c428924aceb` |
| Required current base match | PASS |
| Initial working tree | Clean |
| `origin` | Writable fork: `http://localhost:26831/ladanyitamas95-commits/opentakeoff-mernokszem` |
| Selected worktree | `/home/runner/work/opentakeoff-mernokszem/opentakeoff-mernokszem` |
| Final HEAD | Recorded in the task final output |

The follow-up ran on the existing branch and started exactly from the required current head.

## Scope guard

This follow-up fixed the actual Commit 5 acceptance gaps without changing the constrained architecture. It did **not** add or replace:

- a second `ProjectHome`
- a new route
- a new persistence abstraction
- a project JSON/database layer
- a `TakeoffCanvas` change
- Draft PR #1 architecture

## Files changed

- `web/src/lib/projectHome.js`
- `web/src/components/ProjectHome.jsx`
- `web/test/projectHome.test.ts`
- `README.md`
- `docs/USER_GUIDE.md`
- `CHANGELOG.md`
- `docs/project-control/03_DEVELOPMENT_STATE.md`
- `docs/generated/audits/MS-MVP-DAY01-COMMIT05-WIP-HARDENING-REPORT.md`

## Corrected acceptance gaps

### 1. No invented actor fallback

Project creation and retry initialization now require a real authenticated actor derived from `user.email` or `user.sub` in `ProjectHome.jsx`. `projectHome.js` rejects a blank actor before any `Drive.createFolder()` call and before any annotation load/save path. The previous `signed-in-user` fallback was removed.

### 2. Existing annotations are preserved

Initialization no longer writes a fresh empty payload. It reopens the scoped store for the target folder, loads the current annotations, preserves unrelated fields verbatim, and appends only the missing foundation pieces:

- exactly one matching `Project` record
- exactly one matching `PROJECT_CREATED` audit event

Existing unrelated fields such as `conditions`, `shapes`, custom safe data and non-foundation fields remain intact.

### 3. Same-folder retry after partial failure is idempotent

If the Drive folder exists but foundation persistence failed, retry now targets that same folder id. The retry path skips `Drive.createFolder()`, reuses the existing folder id, and writes no duplicate Project or duplicate `PROJECT_CREATED` audit event. The follow-up added explicit tests proving the root project-folder creation count stays at one.

### 4. Child folders are classified on refresh

The folder refresh path now reopens each folder's scoped store and classifies it as:

- `initialized`
- `recoverable_incomplete`
- `corrupt_unreadable`

Recoverable incomplete rows are visibly not successful and offer **Inicializálás újra** on that same folder. Corrupt or unreadable annotations surface an error message and do not open as an empty success state.

### 5. Open is verified before recents or navigation

Before a listed or recent project is remembered or navigated, the project browser reopens the scoped store and verifies the matching foundation Project record. Missing, corrupt or foreign project state now blocks both recents creation and navigation.

## Tests and exact results

| Check | Result |
|---|---|
| `cd web && node --import tsx --test test/projectHome.test.ts` | PASS — 26/26 |
| `cd web && npm run typecheck` | PASS |
| `cd web && npm run lint` | PASS |
| `cd web && npm run build` | PASS — non-blocking chunk-size warning only |
| `cd web && npm test` | Baseline retained — 1757 pass, 49 fail, 3 skip |

### Targeted coverage added

The corrected targeted suite now explicitly covers:

- missing actor preflight with zero Drive calls
- preservation of unrelated existing annotations
- same-folder retry after partial failure
- no second root folder create
- no duplicate Project record
- no duplicate `PROJECT_CREATED` event
- initialized / incomplete / corrupt folder classification
- no false recents or navigation on missing / corrupt / foreign project state

## Known pre-existing failures

The full web suite still contains the accepted 49 baseline failures. The failure identities remained unchanged in this task.

## New regressions

None detected. The full web suite retained the same 49 failures and 3 skips while the targeted `projectHome` suite increased from 22 to 26 passing tests.

## Acceptance summary

| Gap | Status | Evidence |
|---|---|---|
| Missing actor fallback removal | PASS | targeted missing-actor test; no Drive/save calls |
| Preserve existing annotations | PASS | targeted preserved-fields test; real `createCloudStore` recovery test |
| Same-folder retry / no second folder | PASS | targeted retry test; exactly one root `createFolder` call |
| Incomplete/corrupt classification | PASS | targeted folder classification test |
| Guarded open / no false recents | PASS | targeted verify/open tests |
| Architecture constraints preserved | PASS | changed-file set limited to existing ProjectHome path + required docs |

## Remaining limitations

- Folder classification currently treats duplicate or foreign project foundation records as corrupt and blocked; it does not attempt automatic repair.
- No browser smoke/E2E harness exists in this task scope; runtime evidence is from the production build plus the targeted/unit coverage above.
- The full-suite baseline remains noisy because the accepted 49 failures are still present outside the touched area.

## Stop condition

This bounded follow-up is complete. Do not start Commit 6 or any broader foundation task without separate authorization.
