# CODEX_PROMPT_MS_MVP_DAY00_START_GATE_v1.0

**Projekt:** MérnökSzem Controlled Pilot MVP
**Task ID:** MS-MVP-DAY00-START-GATE
**Dokumentumtípus:** Codex / AI fejlesztői prompt
**Verzió:** v1.0
**Dátum:** 2026-09-13
**Kapcsolódó scope:** `MS_MVP_SCOPE_FREEZE_v2.0_FINAL.md`
**Cél:** fejlesztésindítás előtti kötelező start gate, repo-baseline és kockázatlezárás
**Fontos:** ez a futás **NEM fejleszt termékfunkciót**.

---

# ROLE

You are the senior implementation auditor and repository baseline agent for the MérnökSzem Controlled Pilot MVP.

Your job is to prepare the project for controlled development.
Do not build product features yet.
Do not refactor unrelated code.
Do not redesign the UI.
Do not introduce new frameworks.

This task exists to prevent the MVP from starting on invalid, inconsistent or non-reproducible foundations.

---

# 1. AUTHORITATIVE SCOPE

Read and treat as authoritative:

```text
MS_MVP_SCOPE_FREEZE_v2.0_FINAL.md
```

This document supersedes earlier scope freeze versions where there is conflict.

The product target is:

```text
MérnökSzem Controlled Pilot MVP
```

NOT:

```text
Production SaaS
Full MérnökSzem Platform
Projektelőkészítő AI Report Engine v1.0
Automatic AI TakeOff engine
Full ÉPOS
Full ERP
```

---

# 2. ABSOLUTE RULES

## 2.1 No product feature implementation

In this task you MUST NOT implement:

- new measurement features;
- AI report generation;
- Project Assistant;
- Supabase schema changes;
- public landing pages;
- billing/payment;
- Kreo/Kamai adapters;
- MCP write-tool integrations;
- AI geometry proposals;
- full Project Preparation Report Engine v1.0.

This is a start-gate and baseline task only.

## 2.2 No silent assumptions

If a required input is missing, mark it as BLOCKER.

Do not invent:

- repo path;
- base branch;
- upstream SHA;
- current test status;
- missing environment variables;
- unresolved product decisions;
- pilot project availability.

## 2.3 Git discipline

Before any file change:

```bash
git status
git branch --show-current
git rev-parse HEAD
git remote -v
```

If the working tree is dirty: STOP and report.

Do not continue until the dirty state is resolved by the human owner.

---

# 3. REQUIRED INPUTS TO LOCATE

Find and report the exact status of the following:

## 3.1 Repository

Report:

```text
Repository root:
Remote origin:
Remote writable?:
Current branch:
HEAD SHA:
Working tree:
Default branch:
Relevant worktrees:
```

If the repository is not writable or no writable remote exists, mark:

```text
START-GATE-002 FAIL
```

## 3.2 Scope file

Verify that the following file exists either in the repository documentation area or provided working context:

```text
MS_MVP_SCOPE_FREEZE_v2.0_FINAL.md
```

If it is not in the repository, copy it into the appropriate documentation folder only if explicitly available in the current workspace.

Preferred repository path:

```text
docs/product/MS_MVP_SCOPE_FREEZE_v2.0_FINAL.md
```

Do not overwrite an existing file without checking its content.

## 3.3 Existing canonical docs

Look for, but do not require all of them:

```text
docs/product/MS_MVP_CANONICAL_DEVELOPMENT_PLAN_v1.0.md
docs/architecture/MS_AI_Development_Orchestration_Plan_v1.0.md
docs/product/MS_PUBLIC_GTM_SCREEN_SPEC_v1.0.md
docs/product/MS_PUBLIC_GTM_CONTENT_BLUEPRINT_v1.0.md
docs/development/CODEX_INPUT_PACK_INDEX_v1.0.md
docs/development/CODEX_BUILD_PLAN_MS_MVP_v1.0.md
docs/regression/MS_MVP_REGRESSION_CORPUS_MANIFEST_v1.0.md
```

For each file, report:

```text
FOUND / MISSING / DIFFERENT_PATH
```

Do not fail the task only because a non-blocking document is missing.
Do fail if `MS_MVP_SCOPE_FREEZE_v2.0_FINAL.md` is missing.

## 3.4 OpenTakeoff upstream SHA

Determine the current pinned upstream/base SHA used for the MérnökSzem branch.

If no pinned SHA exists, report:

```text
START-GATE-004 FAIL
Reason: upstream OpenTakeoff SHA not frozen
```

Do not automatically merge upstream.

---

# 4. BASELINE COMMAND DISCOVERY

Inspect package scripts and repo structure.

Report available commands for:

```text
install
build
typecheck
lint
test
web tests
mcp tests
server tests
e2e/browser tests
```

Do not guess commands. Read package files and CI workflow files.

Likely files to inspect, if present:

```text
package.json
web/package.json
mcp/package.json
server/pyproject.toml
.github/workflows/*.yml
netlify.toml
```

---

# 5. RUN BASELINE CHECKS

Run only safe verification commands.

Minimum target:

```bash
npm --version
node --version
```

Then run the repository's actual discovered commands.

If the repo has separate packages, run the relevant checks per package.

Expected categories:

```text
build
typecheck
lint
unit tests
integration tests
browser/e2e tests if configured
```

If a command is absent, report:

```text
NOT_CONFIGURED
```

Do not mark absent E2E as PASS. Mark it as:

```text
PARTIAL / NOT_CONFIGURED
```

---

# 6. PRE-EXISTING FAILURE REGISTRY

If any test/check fails, classify each failure.

Create or update:

```text
docs/generated/audits/MS-MVP-DAY00-BASELINE-FAILURE-REGISTRY.md
```

Required structure:

```markdown
# MS-MVP-DAY00-BASELINE-FAILURE-REGISTRY

## Summary

| Check | Status | Notes |
|---|---|---|

## Failure Registry

| ID | Command | Area | Failure type | Pre-existing? | Blocks MVP start? | Notes |
|---|---|---|---|---|---|---|

## New-regression policy

Any failure not listed here after Day 0 is treated as a new regression unless explicitly reclassified.
```

Rules:

- Do not hide failing tests.
- Do not convert failing tests into skipped tests unless explicitly justified.
- Do not update snapshots/goldens just to make the suite green.
- Do not mark unknown failures as non-blocking without explanation.
- If there are many similar known failures, group them with explicit count and representative examples.

---

# 7. START GATE CHECKLIST

Create or update:

```text
docs/generated/audits/MS-MVP-DAY00-START-GATE-REPORT.md
```

Required checklist:

```markdown
# MS-MVP-DAY00-START-GATE-REPORT

## Repository State

| Field | Value |
|---|---|

## Scope Authority

| Artifact | Status | Notes |
|---|---|---|

## Start Gate

| Gate | Requirement | Status | Evidence |
|---|---|---|---|
| START-GATE-001 | Scope Freeze v2.0 FINAL accepted | PASS/FAIL | |
| START-GATE-002 | Writable GitHub remote exists | PASS/FAIL | |
| START-GATE-003 | Canonical base SHA recorded | PASS/FAIL | |
| START-GATE-004 | Upstream OpenTakeoff SHA frozen | PASS/FAIL | |
| START-GATE-005 | Current repo builds or failures documented | PASS/FAIL | |
| START-GATE-006 | Pre-existing failure registry exists | PASS/FAIL | |
| START-GATE-007 | 3 pilot project packages selected | PASS/FAIL | |
| START-GATE-008 | API/cost cap defined | PASS/FAIL | |
| START-GATE-009 | No unresolved P0 contradiction remains | PASS/FAIL | |
| START-GATE-010 | Product Owner approved controlled pilot framing | PASS/FAIL | |

## Development Recommendation

One of:

- GO
- CONDITIONAL_GO
- NO_GO

## Required Human Actions

List only concrete actions.
```

---

# 8. PILOT PROJECT INVENTORY

Do not invent pilot projects.

Search for local or documented pilot packages.

Report:

```text
Pilot A:
Pilot B:
Pilot C:
Status:
Missing documents:
Blocker:
```

Suggested classification:

```text
Pilot A = simple / clean
Pilot B = medium / realistic
Pilot C = problematic / incomplete / edge case
```

If fewer than 3 usable pilot packages exist, mark:

```text
START-GATE-007 FAIL
```

This does not necessarily block repository preparation, but it blocks final Controlled Pilot GO.

---

# 9. COST/API CAP CHECK

Look for documented cost/API cap.

Minimum required decision:

```text
Monthly tool/API cap:
AI provider:
Max report generation cost per project:
Fallback behavior if cap reached:
```

If absent, mark:

```text
START-GATE-008 FAIL
```

Do not add real API keys.

---

# 10. OUTPUT REQUIREMENTS

At the end, return exactly this structure:

```markdown
# MS-MVP-DAY00 RESULT

## Task
MS-MVP-DAY00-START-GATE

## Branch / SHA
- Branch:
- Starting SHA:
- Final SHA:
- Working tree:

## Files changed
- ...

## Commands run
| Command | Status | Notes |
|---|---|---|

## Start gate result
| Gate | Status |
|---|---|

## Decision
GO / CONDITIONAL_GO / NO_GO

## Blockers
- ...

## Required next task
Recommended next task ID:
Recommended branch:
Recommended worktree:
```

---

# 11. COMMIT RULE

Commit only documentation/baseline files created by this task.

Allowed files:

```text
docs/product/MS_MVP_SCOPE_FREEZE_v2.0_FINAL.md
docs/generated/audits/MS-MVP-DAY00-START-GATE-REPORT.md
docs/generated/audits/MS-MVP-DAY00-BASELINE-FAILURE-REGISTRY.md
docs/generated/audits/MS-MVP-DAY00-REPO-INVENTORY.md
```

Forbidden unless explicitly required and justified:

```text
web/src/**
mcp/**
server/**
package-lock.json
package.json
database migrations
auth configuration
runtime code
```

Commit message:

```text
docs: add MernokSzem MVP v2 start gate baseline
```

If no file changes are needed, do not create an empty commit.

---

# 12. STOP CONDITION

Stop after producing the report.

Do not proceed to Day 1 implementation automatically.

The next step requires Product Owner approval of the Day 0 result.
