# AGENTS.md — a map of this repo for coding agents (and fast-moving humans)

OpenTakeoff is a **client-only React app**: a PDF construction-takeoff canvas for flooring (useful for any trade). No backend, no database, no auth—everything runs and persists in the browser. Apache-2.0. (For the one-page project pitch and vision, see [`AGENT_BRIEF.md`](AGENT_BRIEF.md); for capability → code mapping, see [`FEATURES.md`](FEATURES.md).)

## Run / build / check

```bash
cd web
nvm use          # Node pinned by web/.nvmrc (CI reads the same file)
npm install
npm run dev      # http://localhost:5173 — hot reload
npm test         # node:test over the pure geometry + totals math (test/*.test.ts)
npm run build    # → web/dist/ (static output; this is what Netlify deploys)
npm run check    # typecheck + lint + test + build — exactly what CI runs; green here ⇒ green CI
```

## Shipping — the required steps, every change

`main` is protected on GitHub by a ruleset (PR-only, one approving review,
green `web` check, branch up to date—the repo owner has a standing bypass
as the solo maintainer). **Merging to `main` deploys to production**
(<https://opentakeoff.kentucky-ai.com>)—Netlify's own git integration builds
the merge commit and publishes it. `netlify.toml` holds the whole recipe
(`base = "web"`, `command = npm run build`, `publish = "dist"`), so the deploy
runs a fresh build from the merged source; nothing is uploaded from CI.

`.github/workflows/deploy.yml` used to do this by publishing `web/dist` with
`--no-build`, and it was **deleted on 2026-07-13 in `e701f1a`** ("deploys here
are manual CLI; it fails on every push without the fork's secrets"). Only
`ci.yml` (the `web` check the ruleset gates on) and `publish-mcp.yml` (fires on
an `mcp-v*` tag) remain. The old line here said "Netlify never builds anything
itself", which is now exactly backwards—Netlify is the only thing that
builds production. **Merge = deploy either way: that part has never changed.**

> **This is the canonical `Kentucky-ai/opentakeoff` repo—production is
> <https://opentakeoff.kentucky-ai.com>, nothing else.** A downstream fork
> (`knmurphy/opentakeoff`) tracks this repo as its own upstream and deploys
> separately to `takeoff.345flooring.com`—that URL belongs to *that* fork,
> not this repo. If you see `takeoff.345flooring.com` referenced elsewhere in
> this repo's docs, it's either an example value in the optional cloud-mode
> guides or leftover content from that fork's docs that rode along in a
> wholesale history merge (2026-07-13)—treat it as describing the
> *downstream* fork's deployment, not this one's.

So:

1. **Branch first**—never commit on `main`: `git checkout -b <topic>`.
2. **`npm run check` before pushing** (in `web/`). It is exactly what CI runs,
   on the same Node (`web/.nvmrc`)—green here means green CI.
3. **Open a PR** and wait for the `web` check to pass. Don't merge red or
   pending.
4. **Squash-merge with branch delete**
   (`gh pr merge <n> --squash --delete-branch`), then
   `git checkout main && git pull --ff-only` and delete the local branch
   (`git branch -D <topic>`—squash merges need `-D`).
5. **Remember a merge is a deploy.** Don't merge work you haven't verified in
   the running app.

The tests cover the pure math (`web/test/geometry.test.ts`, `web/test/totals.test.ts`); the canvas itself is verified by hand—**Vite does not flag undefined identifiers in JSX**, so grep for your new identifiers after editing and load the app once before you call it done. The bundled sample plan (`web/public/demo/`, wired to the "Load sample plan" button) is the fastest end-to-end check: load it, press `A`, trace a room, open Report.

## Where things live

| Concern | Path |
|---|---|
| **The canvas—90% of the app** | `web/src/pages/TakeoffCanvas.jsx` (one large, deliberately monolithic component) |
| Geometry: vector extraction, One-Click flood fill, vertex snap | `web/src/lib/oneclick.ts` |
| Sheet/page helpers, scale detection | `web/src/lib/sheets.ts` |
| Totals and materials math (waste, SY, coverage → order qty) | `web/src/lib/totals.js` |
| Persistence (IndexedDB + localStorage) | `web/src/lib/store.js` |
| PDF/image/zip ingest | `web/src/lib/ingest.js` |
| Icon set | `web/src/brand/icons.jsx` |
| Design tokens (colors, spacing—the source of truth) | `web/src/styles/tokens.css` |
| Sheet gallery / report UI | `web/src/components/` |
| Pure-math tests (node:test) | `web/test/` |
| **Optional AI backend** (pluggable adapter: scale/room/finish suggestions) | `server/`—`app.py` + `adapters/base.py` (interface) + `adapters/heuristic.py` (default, no model) |

## How the canvas works (the mental model)

- Each open sheet renders into a `<canvas>` bitmap; **all takeoff geometry is an SVG overlay** on top; pan/zoom is a single CSS transform on the stage div, written imperatively (`tfRef` → `style.transform`) to avoid React re-renders per frame.
- Coordinates: pointer events (client px) → `toImage()` → **stage px**; committed shapes store **normalized [0..1] vertices per sheet** (`verts_norm`), so quantities survive re-renders and zoom.
- Cursor-following UI (crosshair hairlines, readout chip, rubber band) updates through **direct DOM writes in `moveCrosshair`**—never React state per mousemove. Keep it that way.
- Angle snapping: `angleSnap()` locks in-progress segments to the 45° family; endpoint snap (`nearestSnap` over a spatial hash of PDF vector endpoints) takes priority. The committed click reuses the same locked point (`angleRef`).
- Past ~1.15× zoom, a **detail-view canvas** re-renders the visible region from PDF vectors at the current zoom (crispness); the base bitmap stays as first paint.
- pdf.js rendering schedules work on `requestAnimationFrame`—a fully hidden/occluded window will pause mid-render by design; it resumes when visible.

## Conventions

- **SVG presentation attributes take literal colors** (CSS vars don't resolve there): cobalt `#1f3fc7`, danger `#b03a26`, positive `#1f6b4a`—centralized in `web/src/lib/ui.js` (`SVG`, with HUD-dark counterparts through `svgAccent(isDark)`). DOM/HTML chrome may use `var(--…)` from `tokens.css`.
- Condition palettes (`PALETTE` in `web/src/components/hatches.jsx`, the seeded condition colors in `FLOORING_DEFAULTS` in `web/src/lib/canvasConstants.js`, and the mirrored copies in `mcp/src/session.ts`) are **user data**—don't re-theme them.
- Waste applies only in the report (order quantities), never to live measured numbers.
- Keyboard shortcuts are single letters registered on `window` (see `docs/USER_GUIDE.md` §15); toolbar menus pause them through `menuDepthRef`.
- Brand voice: **precision instrument** (2026-08 overhaul). Light theme = "ice": bright white surfaces on a cool field, cool-slate neutrals, cobalt the one saturated thing. Dark theme = "HUD": true-black cockpit, electric blue `#3f8cff`, phosphor `--glow` on exactly five elements (active tool face, status verb, hero quantity, primary CTA, calibration dot). Square corners; the single sanctioned radius is `--r-1` on floating chrome. Mono tabular numerals on every readout. Drafting-table language stays. No vendor mimicry.
- Layout/spacing/type come from the token scales in `tokens.css` (`--sp-*`, `--fs-*`, `--ctl-*`); zIndex comes from the `Z` ladder in `web/src/lib/ui.js`. No new magic numbers.

## Docs to keep in sync when you change behavior

1. `README.md` (Features + "What's in the box")
2. `docs/USER_GUIDE.md` (shortcuts + the relevant section)
3. `CHANGELOG.md`

Touching the **MCP server** adds four more, and they drift independently—the
tool count alone lives in five places, so grep the old number before you assume
you got them all:

4. `mcp/src/tools.ts`—the tool's own `description` **is** its integration.
   An MCP client reads it at runtime; nothing else you write reaches the model.
5. `mcp/server.ts`—the `instructions` block sent at `initialize`. This is the
   decision tree every client receives before its first call. A new *verb* does
   not belong here; a new *step in the standard finish* does.
6. `mcp/README.md` (the tool table) and `docs/MCP.md` (the reach-for-it ordering,
   the example session, and the tool count in its opening line). A new tool also
   needs a row in `mcp/src/staging.ts`'s `TOOL_STAGES`—the four lists must
   partition the tool set exactly, and a test fails CI if one doesn't. If the
   change alters *doctrine* rather than adding a verb—what withholds, what
   refuses, what has no agent verb—it belongs in `docs/AGENT_GUIDE.md` too,
   and the tool count appears there and in `docs/USER_GUIDE.md` §14.
7. **Version, on three surfaces that must agree**: `mcp/package.json`,
   `mcp/server.json`, `web/public/.well-known/mcp.json`. They have drifted
   before (#171, and again at 0.9.28). Check `git show HEAD:mcp/package.json`
   before bumping—a concurrent branch may already have claimed the number.

Architecture rather than behavior—what MCP is versus what the `/ai` sandbox
is, and why the server imports the web engine in-process—lives at the end of
[`docs/MCP.md`](docs/MCP.md) ("Where this sits") and in
[`server/README.md`](server/README.md).

## The doc set, and who each one is for

Four documents carry the product, and they're deliberately split by audience—don't
answer an estimator's question in the agent manual or vice versa:

| Document | Audience | What belongs in it |
|---|---|---|
| [`README.md`](README.md) | everyone, ~60 seconds | what this is, the three doors, what's in the box |
| [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md) | the estimator at the canvas | every shipped UI behavior, the working order on a real bid, the glossary |
| [`docs/AGENT_GUIDE.md`](docs/AGENT_GUIDE.md) | an agent driving the engine | the operating model, the standard finish, withheld doctrine, staging, refusal→next-move |
| [`mcp/README.md`](mcp/README.md) | an agent's integrator | tool-by-tool reference, resources, coordinate contract, limits |

All of them follow one house style—the Apple Style Guide, with the rules that
actually come up written out in [`CONTRIBUTING.md`](CONTRIBUTING.md#docs-house-style).
Interface text quoted in a doc is copied from the code verbatim, so changing a
message means changing it in both places.

[`AGENT_BRIEF.md`](AGENT_BRIEF.md) is the one-page orientation that routes to
all four. A behavior change usually touches two of them; a new MCP tool touches
three plus this file's sync list above.

## MérnökSzem Controlled Pilot MVP governance

### Project and role

The current release is **MérnökSzem – OpenTakeoff Controlled Pilot MVP**.
You are the Codex engineering agent for this release and must work on the
actual repository in bounded, auditable tasks.

This is not a production SaaS release, the full MérnökSzem platform, a full
ERP/ÉPOS system, or the Projektelőkészítő AI Report Engine v1.0.

Do not treat chat history, old prompts, or generated documents as
implementation truth unless the current source authority registry explicitly
lists them as authoritative.

### Source hierarchy

When sources conflict, use this order:

1. Latest explicit Product Owner decision recorded in
   `docs/project-control/02_DECISION_REGISTER.md`.
2. `docs/product/MS_MVP_SCOPE_FREEZE_v2.0_FINAL.md`.
3. Approved Change Request.
4. Domain and architecture canonical files in their own subject area.
5. `docs/product/MS_MVP_CANONICAL_DEVELOPMENT_PLAN_v1.0.md`, only where it
   does not conflict with Scope Freeze v2.0.
6. Actual repository code and tests for current implementation truth.
7. Current audit and implementation reports.
8. Reference-only materials.
9. Legacy chat history.

If a conflict cannot be resolved, do not guess. Record a blocked decision.

### Core rule

AI proposes. Deterministic software calculates. A human accepts.

AI-generated engineering output must never become final accepted engineering
authority automatically.

### Scope control

Do not expand P0 scope. Do not implement P1, P2, Later, or OOS functionality
unless the current task explicitly authorizes it.

P0 contains only the Controlled Pilot golden path:

- public landing, trial, login, and lead flow;
- manual account activation assumptions;
- project create and open;
- PDF and XLSX upload;
- PDF viewer and scale confirmation;
- manual polygon, polyline, and count measurement;
- canonical SI recompute and human measurement review;
- XLSX cost schedule import;
- manual column mapping and measurement-to-item mapping;
- deterministic quantity discrepancy calculation and review queue;
- AI Assistant Foundation;
- Projektelőkészítő Riport v0.1 Draft only;
- auditable XLSX export and source traceback.

Not P0:

- full Report Engine v1.0;
- automatic AI takeoff production engine;
- AI geometry proposal as a release blocker;
- MCP write tools;
- Kreo or Kamai production dependency;
- online payment;
- full enterprise RBAC;
- full ÉPOS or ERP.

Feature development is prohibited until the Day 0 Start Gate is PASS or the
Development Control Tower explicitly accepts a CONDITIONAL_GO.

### Terminology

User-facing Hungarian UI must not use BOQ as the primary label. Use:

- Költségvetés
- Tételes költségvetés
- Költségvetési összevetés
- Költségvetési eltérés
- Árazatlan költségvetés

Internal code may continue to use BOQ or BOQItem where already established.

### Engineering authority and safety

Do not invent engineering measurement rules, tolerances, quantities, pilot
expected values, accuracy percentages, branch or SHA state, test results, API
behavior, or security claims. Mark missing information as UNKNOWN, BLOCKED, or
NEEDS PRODUCT OWNER DECISION.

No production secret may be exposed in browser code. No public AI support
route may access private project context. Client-side-only permission checks
are not authoritative for production. Treat file upload, PDF/XLSX parsing,
export, CORS, authentication, token storage, and AI API boundaries as high-risk
paths.

- Confirmed scale is required for dimensional accepted or exported quantities.
- Canonical quantities use SI units.
- Frontend display values are not authoritative.
- Separate Q1 geometry quantity from Q2 rule-based technical quantity.
- Q2 requires an explicit input, rule, source, version, and review.
- A 5% quantity discrepancy means REVIEW_REQUIRED, not automatic error.
- A unit mismatch cannot be auto-finalized.

### Repository discipline

Before changing files, always report:

```bash
git status
git branch --show-current
git rev-parse HEAD
git remote -v
git worktree list
```

If the working tree is dirty, stop and report unless the current task
explicitly asks you to inspect dirty changes. Do not silently switch branches.
Do not work in a QA-only worktree unless the task explicitly selects it. Never
use `opentakeoff-copilot-localization-tests` as the Day 0 base worktree.

One Codex run equals one bounded task. For every task:

1. Restate the selected task.
2. Verify repository state.
3. Identify authoritative input files.
4. Inspect the existing implementation before editing.
5. Make the minimum necessary change.
6. Run relevant tests.
7. Distinguish pre-existing failures from new regressions.
8. Report changed files.
9. Report commands and results.
10. Stop without starting the next task automatically.

Use relevant existing checks for the touched area. Prefer package scripts and
CI commands discovered from package files, workflows, and repository docs. Do
not invent commands. Where applicable, validate build, typecheck, lint,
relevant unit and integration tests, and required browser smoke or E2E checks.

Day 0 must verify the repo root, remote origin and writability, branch, HEAD,
clean working tree, worktree list, pinned upstream OpenTakeoff SHA, existing
docs, package scripts, CI workflow, build/typecheck/lint/test baseline, and the
pre-existing failure registry.

Every Codex task must end with:

```text
STATUS: PASS / FAIL / BLOCKED
Repository root:
Selected worktree:
Branch:
Starting HEAD:
Final HEAD:
Files changed:
Commands run:
Test results:
Pre-existing failures:
New regressions:
Blocked decisions:
Acceptance criteria:
Commit:
Next recommended task:
```

Do not optimize for appearing finished. Optimize for auditable, reversible,
testable progress.
