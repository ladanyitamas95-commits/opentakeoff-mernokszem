# MS-MVP W01 — UI Foundation Report

Date: 2026-09-11
Branch: `codex/w01-ui-foundation`
Starting HEAD: `41e0f43d22d816d18d8d2ed338f7f83792272ff8`
Scope: T0 Brand foundation, T1 Application shell, T2 reusable UI primitives/states

## Implementation scope

Implemented documentation/runtime UI foundation only:

- centralized MérnökSzem semantic design tokens;
- Poppins typography through the existing CSS token layer;
- desktop-first application shell preview;
- left sidebar with Hungarian navigation labels;
- top bar with identity, current project selector, search, status and account area;
- collapsible right context panel with `Chat`, `Megállapítások`, `Kontextus`;
- reusable UI primitive components for W01;
- frozen domain status representation for UI badges;
- focused SSR tests for new W01 behavior.

Not implemented:

- no T3–T7 feature screen;
- no backend;
- no database/auth/RBAC;
- no production persistence;
- no geometry calculation;
- no SI calculation engine;
- no BOQ calculation/export engine;
- no AI/LLM integration;
- no dependency change.

## Files changed

| File | Change |
| --- | --- |
| `web/src/styles/tokens.css` | Added MérnökSzem brand tokens, semantic UI tokens and Poppins primary font mapping. |
| `web/src/styles/app.css` | Added W01 shell and primitive CSS classes using semantic tokens. |
| `web/src/components/ui/primitives.jsx` | Added Button, IconButton, Input, Select, Textarea, Checkbox, Tabs, Chip, Panel, DataTable shell, Toast, Alert, Tooltip, Dialog, StatusBadge, ValidationBadge, ConfidenceBadge, EmptyState, LoadingState, ErrorState, BlockedState. |
| `web/src/components/ui/index.js` | Re-export entrypoint for UI primitives. |
| `web/src/components/AppShell.jsx` | Added desktop-first MérnökSzem shell with sidebar, topbar, workspace and collapsible context panel. |
| `web/src/components/UiFoundationPreview.jsx` | Added non-business preview surface for T0–T2 foundation. |
| `web/src/main.jsx` | Added minimal `/ui-foundation` route only; no router replacement or route redesign. |
| `web/test/uiFoundation.test.ts` | Added focused SSR tests for shell labels, status model and badges. |
| `docs/generated/audits/MS-MVP-W01-UI-FOUNDATION-REPORT.md` | This report. |

## Components created/adapted

Created:

- `AppShell`
- `UiFoundationPreview`
- `Button`
- `IconButton`
- `Input`
- `Select`
- `Textarea`
- `Checkbox`
- `Tabs`
- `Chip`
- `Panel`
- `DataTableShell`
- `Toast`
- `Alert`
- `Tooltip`
- `Dialog`
- `StatusBadge`
- `SystemStatusBadge`
- `ValidationBadge`
- `ConfidenceBadge`
- `EmptyState`
- `LoadingState`
- `ErrorState`
- `BlockedState`

Adapted:

- existing CSS token import path;
- existing `main.jsx` route list with one minimal preview route.

## Brand-token implementation

Brand values implemented centrally in `web/src/styles/tokens.css`:

- Primary Navy: `#0D1B2A`
- Primary Gold: `#C79A35`
- Poppins primary application typography

Semantic tokens added for:

- background;
- surface;
- surface-muted;
- text-primary;
- text-secondary;
- border;
- primary;
- accent;
- muted;
- focus;
- disabled.

Semantic state tokens added for:

- pass;
- warning;
- error;
- review;
- blocked.

New W01 components use CSS variables/classes instead of raw hex values in component files.

## Status model

The frozen `MeasurementStatus` values are represented:

- `DRAFT`
- `AI_PROPOSED`
- `REVIEW_REQUIRED`
- `MEASUREMENT_RULE_REQUIRED`
- `SCALE_REVIEW_REQUIRED`
- `INVALID_GEOMETRY`
- `ACCEPTED`
- `EDITED`
- `REJECTED`

General UI/system states are kept separate:

- `PROCESSING`
- `READY`
- `PASS`
- `WARNING`
- `ERROR`
- `BLOCKED`

Badges use icon + text and do not rely on color alone. `AI_PROPOSED` and `ACCEPTED` render as distinct text/icon states.

## Known limitations

- The `/ui-foundation` route is a W01 foundation preview route. It is not a final product screen.
- Existing legacy CSS still contains pre-W01 paper/skeleton texture rules and the previous theme infrastructure. W01 did not introduce a new dark mode or decorative SaaS styling.
- The existing root takeoff workflow remains intact; final integration of the shell around production screens should be handled in later scoped tasks.
- Live browser preview could not be served in this sandbox because `vite --host 127.0.0.1 --port 5177` failed with `listen EPERM`.

## Portability notes

- No new UI framework was introduced.
- No new router was introduced.
- No dependency was added or upgraded.
- Components are plain React 18 components and CSS classes.
- The Lovable/UI reference remains design intent only; production code uses the existing stack.

## Test results

Dependency note:

- The W01 worktree had no local `web/node_modules`.
- No dependencies were installed.
- Existing sibling worktree `../opentakeoff/web/node_modules` was used via temporary symlink for command execution, then should be removed before commit.
- The bundled runtime provided Node 24 but no `npm` binary, so equivalent direct commands were run.

| Check | Command equivalent | Result |
| --- | --- | --- |
| Relevant UI/component tests | `node --import tsx --test test/uiFoundation.test.ts` | PASS, 5/5 |
| Typecheck | `tsc --noEmit` | PASS |
| Lint | `eslint src netlify/functions` | PASS |
| Web build | `vite build` | PASS |
| Full web test suite | `node --import tsx --test test/*.test.ts` | FAIL, 1757 total, 1705 pass, 49 fail |

## Existing failures vs new failures

Pre-existing failures:

- 49 full-suite failures remain from the Phase 00 baseline.
- Failure pattern is still localization/golden drift around OpenTakeoff/Hungarian labels, report/export/RFI labels, relative time text and related snapshots.

New regressions attributable to W01:

- none observed;
- failure count stayed at 49 while the new W01 test file adds 5 passing tests.

## Screenshots / manual QA results

Live screenshot QA:

- NOT_AVAILABLE in this sandbox due `listen EPERM` when starting Vite.

Static/source QA:

- 1366px desktop: grid uses `236px + flexible workspace + 280–336px context panel`, leaving a usable center workspace.
- 1920px desktop: center workspace is capped with useful max width and keeps sidebar/context hierarchy.
- Tablet-width behavior: media rule below `1200px` moves the context panel under the workspace instead of breaking the grid.
- Right panel open/closed states are represented by `is-context-collapsed` and an accessible toggle with `aria-expanded`.
- New shell/component files contain no raw hex values and use semantic brand tokens.
- New W01 UI classes do not add gradients, neon, glow, glassmorphism, 3D effects or decorative background effects.

## Remaining blockers before T3–T6

- Product screen integration should be scoped separately; do not wrap/refactor `TakeoffCanvas.jsx` without single-owner plan.
- Existing localization/golden test failures need the separate Copilot-owned cleanup stream.
- Production shell wiring around real screens needs a routing/file-ownership decision.
- Backend/auth/persistence remains future-role-ready but not implemented in W01.
- BOQ/geometry/measurement calculations remain out of W01 scope.

## Acceptance

Result: `CONDITIONAL_PASS`

Reason:

- T0, T1 and T2 are implemented and verified by focused tests/build/typecheck/lint.
- No new regression was observed.
- Live visual QA could not be completed in the sandbox because local server binding is blocked.
