# MS-MVP-DAY00-REPO-INVENTORY

Date: 2026-09-14

## Repository identity

| Field | Value |
|---|---|
| Repository root | `/Users/Tomi/Documents/Codex/2026-09-09/feladat-1-opentakeoff-frontend-felm-r/work/opentakeoff-w01-ui-foundation` |
| Selected worktree | Same as repository root |
| Branch | `codex/w01-ui-foundation` |
| Starting HEAD | `4d6d26bf0e806f0a6aafda0cd0d1971573eccd8f` |
| Remote origin | `https://github.com/Kentucky-ai/opentakeoff.git` |
| Remote default HEAD | `refs/heads/main` at remote SHA `d8a5b5aa305f81e0f0d391275fb16bfd6de3270f` on 2026-09-14 |
| Remote readability | PASS via `git ls-remote --symref origin HEAD` |
| Remote writability | UNPROVEN; dry-run push could not obtain HTTPS credentials |
| Canonical MérnökSzem base SHA | `4d6d26bf0e806f0a6aafda0cd0d1971573eccd8f` at Day 0 start |
| Pinned OpenTakeoff upstream SHA | `37b7f1cbcb229476a9c50c5e1cbd927af5eb589f` |
| Upstream pin evidence | Branch merge-base with local `main`; tagged `mcp-v0.9.77`; local `origin/main` and `origin/HEAD` point to the same inspected base |

The remote `main` branch has advanced beyond the pinned base. Day 0 does not merge or fetch upstream changes into the MérnökSzem branch.

## Relevant worktrees

| Worktree | Branch | SHA | Day 0 role |
|---|---|---|---|
| `opentakeoff-w01-ui-foundation` | `codex/w01-ui-foundation` | `4d6d26b` at start | Canonical selected worktree |
| `opentakeoff-phase-00-baseline` | `codex/phase-00-baseline` | `41e0f43` | Ancestor/baseline history |
| `opentakeoff` | `feat/mernokszem-hu-frontend` | `d245e27` | Divergent earlier development state |
| `opentakeoff-copilot-localization-tests` | `copilot/w00-5-localization-tests` | `41e0f43` | QA/localization-only; excluded as canonical base |

## Repository structure

| Path | Role |
|---|---|
| `web/` | React/Vite browser application, Netlify function, unit tests and geometry benchmark |
| `mcp/` | TypeScript OpenTakeoff MCP server and test suite |
| `server/` | FastAPI AI sandbox and pytest suite |
| `capture/` | Capture server and selftest |
| `scripts/` | Repository documentation/link tooling |
| `docs/` | Product, architecture, governance, regression and generated audit documentation |
| `evals/` | Evaluation fixture/package area; `four-asks-2026-09-02` pins published MCP `0.9.68` |
| `.github/workflows/` | CI and MCP publish workflows |

## Package and runtime inventory

| Area | Manifest/lock | Runtime | Install command used |
|---|---|---|---|
| Web | `web/package.json`, `web/package-lock.json` | Node 24 required | `npm --prefix web ci --no-audit --no-fund` |
| MCP | `mcp/package.json`, `mcp/package-lock.json` | Node >=20 | `npm --prefix mcp ci --no-audit --no-fund` |
| Server | `server/requirements.txt`, `server/requirements-dev.txt` | CI Python 3.12 | isolated venv plus `pip install -r ...` |
| Root | No root `package.json` | `.nvmrc` pins Node 24 | Not applicable |

Observed audit runtime: Node `v24.19.0`, ephemeral npm `11.6.0`, Python `3.12.14` for server tests. The host PATH itself had no `node` or `npm` command.

## Discovered commands

| Category | Area | Repository-defined command | Day 0 result |
|---|---|---|---|
| Install | Web | `npm ci` in `web/` | PASS |
| Typecheck | Web | `npm run typecheck` | PASS |
| Lint | Web | `npm run lint` | PASS |
| Unit tests | Web | `npm test` | FAIL, documented |
| Benchmark | Web | `npm run bench` | PASS; tracked results unchanged |
| Build | Web | `npm run build` | PASS |
| Aggregate check | Web | `npm run check` | Components executed separately to preserve individual results |
| Install | MCP | `npm ci` in `mcp/` | PASS |
| Typecheck | MCP | `npm run typecheck` | PASS |
| Tests/integration/E2E | MCP | `npm test` | FAIL, 2 documented failures |
| Tool count | MCP | `npm run check:tool-count` | PASS |
| Build | MCP | `npm run build` | PASS |
| Distribution smoke | MCP | `npm run smoke:dist` | PASS |
| Install | Server | `pip install -r requirements.txt -r requirements-dev.txt` | PASS in isolated venv |
| Tests | Server | `python -m pytest -q` | PASS, 11 tests |
| Docs | Root | `node scripts/check-doc-links.mjs` | PASS |
| Capture | Root | `python3 capture/capture_server.py selftest` | PASS |
| Browser E2E | Web | No package script or CI job found | NOT_CONFIGURED |

## CI workflow inventory

| Workflow/job | Trigger | Baseline |
|---|---|---|
| `.github/workflows/ci.yml` / `web` | push to `main`, pull request | npm ci, typecheck, lint, unit tests, benchmark consistency, build |
| `.github/workflows/ci.yml` / `mcp` | push to `main`, pull request | web+mcp install, MCP typecheck/tests/tool-count/build/dist-smoke on Ubuntu and Windows |
| `.github/workflows/ci.yml` / `server` | push to `main`, pull request | Python 3.12, requirements install, pytest |
| `.github/workflows/ci.yml` / `docs` | push to `main`, pull request | relative path/anchor link check |
| `.github/workflows/ci.yml` / `capture` | push to `main`, pull request | capture server selftest |
| `.github/workflows/publish-mcp.yml` | `mcp-v*` tag or manual dispatch | release/publish workflow; not run by Day 0 |

## Canonical documentation inventory

| Artifact | Status after Day 0 | Notes |
|---|---|---|
| `docs/product/MS_MVP_SCOPE_FREEZE_v2.0_FINAL.md` | FOUND | Copied from canonical source pack; primary scope authority |
| `docs/product/MS_MVP_CANONICAL_DEVELOPMENT_PLAN_v1.0.md` | FOUND | Copied from source pack; authoritative only where non-conflicting with Scope Freeze v2.0 |
| `docs/development/CODEX_PROMPT_MS_MVP_DAY00_START_GATE_v1.0.md` | FOUND | Copied from source pack; Day 0 execution prompt |
| `docs/architecture/MS_AI_Development_Orchestration_Plan_v1.0.md` | FOUND | Existing Markdown derivative/path |
| `docs/product/MS_PUBLIC_GTM_SCREEN_SPEC_v1.0.md` | MISSING | Non-blocking Day 0 document |
| `docs/product/MS_PUBLIC_GTM_CONTENT_BLUEPRINT_v1.0.md` | MISSING | Non-blocking Day 0 document |
| `docs/development/CODEX_INPUT_PACK_INDEX_v1.0.md` | FOUND | Existing |
| `docs/development/CODEX_BUILD_PLAN_MS_MVP_v1.0.md` | FOUND | Existing |
| `docs/regression/MS_MVP_REGRESSION_CORPUS_MANIFEST_v1.0.md` | FOUND | Existing; source-pack hash matched during bootstrap |
| `MS_AI_Development_Orchestration_Plan_v1.0.docx` | ATTACHED ONLY / NOT ADDED | Binary and untracked; explicit separate approval required |

The three copied Markdown files had trailing whitespace mechanically removed for repository hygiene. Their source-pack input hashes were verified against `manifest.json` before normalization.

## Pilot inventory

| Pilot | Required profile | Concrete package | Status |
|---|---|---|---|
| Pilot A | Simple/clean | Not formally selected | FAIL |
| Pilot B | Medium/realistic | Not formally selected | FAIL |
| Pilot C | Problematic/incomplete/edge case | Not formally selected | FAIL |

Repository reference assets include five QTO XLSX files and several sample/test PDFs, but no Product Owner decision maps complete document packages to Pilot A/B/C. These assets must not be promoted to pilot authority by inference.

## API and cost-cap inventory

| Required decision | Evidence | Status |
|---|---|---|
| Monthly tool/API cap | Approximately HUF 150,000/month planning envelope | PARTIAL |
| AI provider | No frozen runtime provider | FAIL |
| Maximum report generation cost per project | `TBD` | FAIL |
| Fallback behavior when cap is reached | Not documented | FAIL |

`START-GATE-008` therefore fails. No API key or secret was inspected or recorded.
