# MS-MVP Day 1 Commit 01 — App Route and Access Shell Report

Date: 2026-09-14
Task: `MS-MVP-DAY01-COMMIT01-APP-ROUTE-ACCESS-SHELL`
Status: PASS
Recommendation: GO for separately authorized Commit 2

## Repository verification

| Field | Verified value |
|---|---|
| Repository | `https://github.com/ladanyitamas95-commits/opentakeoff-mernokszem` |
| Branch | `codex/w01-ui-foundation` |
| Starting HEAD | `f0bdc1e4e75e7489b9c58c4657c0224e85498d52` |
| Final HEAD | The commit containing this report; exact SHA is recorded in the task final output |
| Initial working tree | Clean |
| `origin` | Writable fork: `https://github.com/ladanyitamas95-commits/opentakeoff-mernokszem.git` |
| `upstream` | Reference only: `https://github.com/Kentucky-ai/opentakeoff.git` |

The starting HEAD was verified as the checked-out HEAD and as a descendant of the Product Owner-authorized base. No upstream push or pull request was performed.

## Implementation summary

- Added a protected MérnökSzem route skeleton at `/app` and `/app/projects` without changing the legacy `/` entry or `/ui-foundation` preview.
- Added a pure, deterministic pilot access-state helper. Authorization requires explicit configuration, a ready auth context and a non-empty user identity; missing, malformed and unknown input fails closed.
- Added a boundary that reuses the existing Google auth context and configuration helpers. It does not handle tokens, secrets or external API calls.
- Wired available `AppShell` destinations through an injected navigation callback. Destinations without a Commit 1 route remain inert and are marked unavailable.
- Replaced visible `BOQ` labels with `Költségvetés` on the touched W01 shell and preview surfaces. Internal `boq` identifiers remain unchanged.
- Did not modify project creation/opening behavior, persistence models, uploads, audit events, review items, `store.js`, `TakeoffCanvas.jsx`, dependencies or known failing tests.

## Files changed

- `web/src/main.jsx`
- `web/src/components/AppShell.jsx`
- `web/src/components/UiFoundationPreview.jsx`
- `web/src/components/PilotAccessBoundary.jsx`
- `web/src/lib/pilotAccess.js`
- `web/test/pilotAccess.test.ts`
- `web/test/uiFoundation.test.ts`
- `docs/generated/audits/MS-MVP-DAY01-COMMIT01-APP-ROUTE-ACCESS-SHELL-REPORT.md`

## Route behavior

| Route | Result |
|---|---|
| `/` | Existing OpenTakeoff application behavior retained through the unchanged wildcard application route |
| `/ui-foundation` | Existing W01 preview remains directly available |
| `/app` | Protected foundation shell; authorized users see an empty-project state and can navigate to the protected project list |
| `/app/projects` | Existing `ProjectHome` is rendered only inside the pilot access boundary |
| Other `/app/*` paths | Protected by the same boundary and cannot fall through to the legacy application |

## Access-boundary behavior

| State | Behavior |
|---|---|
| `loading` | Hungarian progress state; private children are not mounted |
| `unauthenticated` | Hungarian sign-in state using the existing Google `signIn` action; private children are not mounted |
| `blocked_config` | Hungarian configuration-blocked state with a safe link back to `/`; private children are not mounted |
| `authorized` | Private children render only after explicit configuration, ready auth state and a valid user identity |
| Unknown/malformed | Resolves to a non-authorized state; the view also fails closed for unknown state values |

Configuration is considered available only when the existing Google configuration and Projects root-folder configuration are both present. This commit adds no credential storage and no access bypass based on a route parameter.

## Terminology

- Visible replacement: `Költségvetés`.
- Visible `BOQ` remaining on the touched W01 shell/preview surfaces: no.
- Internal `boq` ids and values: intentionally retained to minimize domain risk.

## Tests and validation

The environment did not expose Node/npm on the default `PATH`. Validation used the bundled Node 24 runtime and a lockfile-exact `npm@11.6.0 ci --prefix web`; no manifest or lockfile was changed.

| Check | Result |
|---|---|
| Targeted `pilotAccess` and W01 UI tests | PASS — 11/11 |
| `npm --prefix web run typecheck` | PASS |
| `npm --prefix web run lint` | PASS |
| `npm --prefix web run build` | PASS — 769 modules; non-blocking existing chunk-size warning |
| Full `npm --prefix web test` | Baseline retained — 1763 total, 1711 pass, 49 fail, 3 skip |
| `git diff --check` | Required final result recorded in the task final output |
| `git status --short` | Required final result recorded in the task final output |
| Browser smoke | Not run: the execution sandbox rejected the local Vite listener with `listen EPERM` |

### Known pre-existing failures

- 49 web test failures remain in the registered localization/golden baseline. They were not changed or rebaselined.
- 2 MCP test failures remain registered. MCP was outside this commit's impact area and was not run.

### New regressions

None detected. The full web suite retained exactly 49 failures while the six added/updated assertions increased the passing count; typecheck, lint, targeted tests and production build passed.

## Acceptance criteria status

| Criterion | Status | Evidence |
|---|---|---|
| Authorized repository, branch, base and clean start | PASS | Git branch, HEAD, ancestry, remotes and initial status verified |
| `/` unchanged and `/ui-foundation` available | PASS | Route order/contract retained; constants covered by focused test |
| `/app` and `/app/projects` exist behind one boundary | PASS | Router wiring and production build |
| Unresolved, unauthenticated, unconfigured and unknown states hide private content | PASS | Pure mapping and rendered boundary matrix tests |
| Existing auth context reused without token duplication | PASS | Boundary delegates only to `useGoogleAuth().signIn` and existing configuration helpers |
| Available shell destinations wired | PASS | Explicit route map and W01 shell test |
| Touched W01 surfaces use Hungarian terminology | PASS | Rendered shell/preview assertions reject visible `BOQ` |
| No out-of-scope implementation or dependency update | PASS | Final file-scope and diff audit |
| No new test regression | PASS | Full web suite remains at the registered 49 failures |

## Unresolved risks

- A live browser/auth-provider smoke remains necessary in an environment that permits a local server and has the pilot Google/Drive configuration.
- This skeleton authorizes an authenticated configured user; project-level Drive authorization remains enforced by the existing project/store flow and needs explicit inaccessible-project coverage in a later authorized task.
- The 49 web and 2 MCP baseline failures continue to reduce broad-suite signal quality.
- Fork/upstream divergence remains a repository-management risk; this commit does not synchronize upstream.

## GO / NO-GO for Commit 2

**GO**, but only after separate Product Owner authorization and with the next scope kept to pilot access integration/hardening. Commit 2 should validate live configured/unauthenticated/authenticated/inaccessible-project behavior and add browser evidence without starting project creation, document metadata or audit persistence.

## Stop condition

Stop after this single commit and its authorized push to `origin/codex/w01-ui-foundation`. Do not begin Commit 2, project creation, document metadata, audit persistence or other Day 1–3 work.
