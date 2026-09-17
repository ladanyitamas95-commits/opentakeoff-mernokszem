# 03_DEVELOPMENT_STATE.md

**Projekt:** MérnökSzem – Product & Development OS
**Dokumentumtípus:** Project Control File / Live Development State
**Verzió:** 1.0
**Snapshot dátum:** 2026-09-17 (Commit 5 hardening update)
**Státusz:** ACTIVE / DYNAMIC
**Frissítési felelős:** Development Control Tower
**Alapelv:** ami nincs bizonyítva, az `UNKNOWN` vagy `UNVERIFIED`. Régi chatből nem szabad aktuális Git/repo állapotot feltételezni.

---

# 1. Executive state

| Mező | Aktuális állapot |
|---|---|
| Product | MérnökSzem |
| Release | **Controlled Pilot MVP** |
| Scope | **FROZEN v2.0 FINAL – Product Owner validálta** |
| Current program stage | **DAY 1 / COMMIT 5 COMPLETE — NEXT TASK AWAITING AUTHORIZATION** |
| Feature development authorization | **GO at Start Gate; Commit 5 completed; separate next-task authorization required** |
| Day 0 result | **PASS** |
| Feature freeze | NOT ACTIVE – planned end of Day 12 |
| Staging | NOT STARTED / UNVERIFIED |
| Pilot | NOT STARTED |
| Commercial release | NOT AUTHORIZED |
| Report Engine v1.0 | P1 / separate 8–12 week quality program |

---

# 2. Start Gate

A feature-fejlesztés csak Start Gate PASS után indulhat.

| Gate | Requirement | Current status | Evidence / action |
|---|---|---|---|
| START-GATE-001 | Scope Freeze v2.0 FINAL accepted | **PASS** | Product Owner explicit validáció |
| START-GATE-002 | Writable GitHub remote exists | **PASS_WITH_FORK** | `origin` = writable MérnökSzem fork; Product Owner successful-push evidence |
| START-GATE-003 | Canonical base SHA recorded | **PASS** | Day 0 baseline and blocker-closure reports |
| START-GATE-004 | Upstream OpenTakeoff SHA frozen | **PASS** | `37b7f1cbcb229476a9c50c5e1cbd927af5eb589f` (`mcp-v0.9.77`) |
| START-GATE-005 | Current repo builds or failures documented | **PASS** | Day 0 report and baseline failure registry |
| START-GATE-006 | Pre-existing failure registry exists | **PASS** | `MS-MVP-DAY00-BASELINE-FAILURE-REGISTRY.md` |
| START-GATE-007 | 3 pilot project packages selected | **PASS_WITH_RESERVED_SLOTS** | Pilot A/B/C slots and objectives approved; attachments and ground truth required before pilot execution |
| START-GATE-008 | API/cost cap defined | **PASS** | OpenAI primary; 15,000 HUF/month hard cap; 300 HUF/project report soft cap; fallback frozen |
| START-GATE-009 | No unresolved P0 contradiction remains | **PASS** | Day 0 documentation audit |
| START-GATE-010 | Product Owner approved Controlled Pilot framing | **PASS** | explicit validáció |

### Current start decision

```text
DAY 0 PASS — GO
```

A Day 1 munka csak külön Product Owner-feladattal indulhat; ez a státusz nem indít automatikusan feature-fejlesztést.

---

# 3. Day 0 artifact state

| Artifact | Status |
|---|---|
| `MS_MVP_SCOPE_FREEZE_v2.0_FINAL.md` | CREATED + PRODUCT OWNER VALIDATED |
| `CODEX_PROMPT_MS_MVP_DAY00_START_GATE_v1.0.md` | CREATED |
| `MS-MVP-DAY00-START-GATE-REPORT.md` | PROVIDED + UPDATED TO PASS |
| `MS-MVP-DAY00-BASELINE-FAILURE-REGISTRY.md` | PROVIDED |
| `MS-MVP-DAY00-REPO-INVENTORY.md` | PROVIDED |
| `MS-MVP-DAY00-BLOCKER-CLOSURE-REPORT.md` | PROVIDED |

---

# 4. Repository state

Az alábbi értékek a Day 0 riportból és a blocker-closure friss remote precheckjéből származnak.

| Mező | Current verified value |
|---|---|
| Repository root | Remote-authoritative GitHub repository; no MacBook-local path dependency |
| Remote origin | `https://github.com/ladanyitamas95-commits/opentakeoff-mernokszem.git` |
| Writable remote | `PASS_WITH_FORK` |
| Default branch | UNKNOWN |
| Canonical development branch | `codex/w01-ui-foundation` |
| Canonical HEAD SHA | `945ef5015533a2dcdfea8a4426c1622285a32905` at blocker-closure start; final closure SHA in closure report/task output |
| Upstream OpenTakeoff pinned SHA | `37b7f1cbcb229476a9c50c5e1cbd927af5eb589f` (`mcp-v0.9.77`) |
| Working tree status | Clean at blocker-closure start |
| Active worktrees | Not applicable to remote-only closure |
| Remote branches synced | `codex/w01-ui-foundation` matched `origin/codex/w01-ui-foundation` at blocker-closure start |

### Historical evidence – NOT CURRENT AUTHORITY

Korábbi fejlesztési beszélgetésekben több lokális worktree/branch szerepelt, többek között:
- `feat/mernokszem-hu-frontend`;
- `codex/phase-00-baseline`;
- `codex/w01-ui-foundation`;
- `copilot/w00-5-localization-tests`.

Ezek **nem tekinthetők jelenlegi canonical állapotnak új Git evidence nélkül**.

---

# 5. Test / QA baseline

### Current verified baseline

- web typecheck, lint, benchmark és build: PASS;
- web test: 1,705 pass, 49 documented pre-existing failures, 3 skip;
- MCP typecheck, tool count, build és dist smoke: PASS;
- MCP test: 224 pass, 2 documented pre-existing failures;
- server test: 11 pass;
- docs link check és capture selftest: PASS.

Részletes evidence: `MS-MVP-DAY00-START-GATE-REPORT.md` és `MS-MVP-DAY00-BASELINE-FAILURE-REGISTRY.md`. A blocker-closure task alkalmazásteszteket nem futtatott újra.

### Rule

Day 0 után:

```text
Any failure not in the baseline registry
= NEW_REGRESSION
```

amíg explicit újra nem osztályozzák.

---

# 6. Active task registry

| Task ID | Agent | Scope | Branch/worktree | Status |
|---|---|---|---|---|
| MS-MVP-DAY00-START-GATE | Codex | repo/start-gate baseline, docs only | `codex/w01-ui-foundation` | **COMPLETE** |
| MS-MVP-DAY00-BLOCKER-CLOSURE | Codex | blocker decisions and audit closure, docs only | `codex/w01-ui-foundation` | **COMPLETE** |
| MS-MVP-DAY01-COMMIT05-WIP-HARDENING | Codex | existing ProjectHome create/open hardening only; no new route, auth, persistence abstraction or canvas path | `copilot/ms-mvp-day01-commit05-wip-hardening` | **COMPLETE** |
| Claude Code first task | Claude Code | must wait for Start Gate | N/A | **NOT STARTED** |
| Controlled Pilot feature task | any | requires a separately authorized task | N/A | **NOT STARTED** |

### Latest accepted task update

| Field | Value |
|---|---|
| Date/time | 2026-09-17T22:17:57Z |
| Task ID | `MS-MVP-DAY01-COMMIT05-WIP-HARDENING` |
| Agent | Codex |
| Branch | `copilot/ms-mvp-day01-commit05-wip-hardening` |
| Starting SHA | `740e3fdc02abc977d70eeb2adbc4f5901031bc69` |
| Final SHA | Recorded in the accepted task output and audit report for this task |
| Test status | Targeted `projectHome` tests PASS; `npm --prefix web run typecheck` PASS; `npm --prefix web run lint` PASS; `npm --prefix web run build` PASS; full `npm --prefix web test` retained the baseline 49 failures and 3 skips |
| New blockers | None |
| Resolved blockers | None |
| Next gate | Separate Product Owner authorization for the next bounded task |

---

# 7. Active chat/workstream state

| Workstream | Status | Purpose |
|---|---|---|
| Product Owner & Strategy | ACTIVE | scope, business, final decisions |
| Development Control Tower | CREATED / setup | task routing, Git/GitHub, acceptance |
| Claude Code Dev | CREATED / governance loaded | implementation after Start Gate |
| Codex Dev & Independent QA | TO CREATE / CONFIGURE | implementation + independent review |
| Product & Knowledge Lab | CREATED / governance loaded | IRL-0 → IRL-5 |
| QA / Pilot / Release | TO CREATE / CONFIGURE | regression, pilot, GO/NO-GO |

---

# 8. Frozen P0 summary

P0 includes:

- project create/open;
- PDF + XLSX upload;
- PDF viewer;
- scale confirmation;
- manual polygon/polyline/count;
- canonical SI recompute;
- human measurement review;
- XLSX cost schedule import;
- manual column mapping;
- manual measurement↔item mapping;
- deterministic quantity discrepancy;
- Review Queue;
- XLSX audit export;
- source lineage;
- AI Assistant Foundation;
- Projektelőkészítő Riport v0.1 Draft;
- Landing / Trial / Login / Lead.

P0 non-core optional:

- Public AI Support Beta.

Not P0:

- Report Engine v1.0;
- AI geometry proposal;
- MCP write agent;
- Kreo/Kamai production dependency;
- online payment;
- enterprise RBAC;
- full ÉPOS;
- full ERP.

---

# 9. Product quality invariants

| Invariant | State |
|---|---|
| AI cannot self-approve engineering output | FROZEN |
| Confirmed scale required for dimensional accepted/exported quantity | FROZEN |
| Canonical quantity uses SI | FROZEN |
| Raw geometry → calculation → authoritative value → display rounding | FROZEN |
| Q2 requires explicit rule/source/version/review | FROZEN |
| >5% discrepancy = REVIEW_REQUIRED, not automatic error | FROZEN |
| Public AI cannot access private project context | FROZEN |
| No public accuracy % before benchmark | FROZEN |
| OpenTakeoff = adapt, not rewrite | FROZEN |

---

# 10. Pilot state

Required structure:

| Pilot | Requirement | Concrete package |
|---|---|---|
| A | simple / clean golden path | **PILOT_SLOT_RESERVED** — files `TO_BE_ATTACHED_LATER`, ground truth `TO_BE_DEFINED` |
| B | Mosonszolnok / hígtrágya jellegű agrár/technológiai tervpilot | **PILOT_SLOT_RESERVED** — files `TO_BE_ATTACHED_LATER`, ground truth `TO_BE_DEFINED` |
| C | Gorzsa kerékmosó / ÉNGY jellegű import- és eltéréskezelési pilot | **PILOT_SLOT_RESERVED** — files `TO_BE_ATTACHED_LATER`, ground truth `TO_BE_DEFINED` |

Current status:

```text
PILOT SLOTS RESERVED — EXECUTION INPUTS PENDING
```

Pilot execution may not begin until the files are attached and ground truth is defined. This is an execution prerequisite, not a Day 0 blocker.

---

# 11. Cost state

### Planning envelope

```text
Technology development envelope: approx. 150,000 HUF / month
```

This is a planning ceiling, not a release proof.

### Frozen runtime AI controls

```text
RUNTIME_AI_PROVIDER = OPENAI_API_PRIMARY
RUNTIME_AI_API_HARD_CAP = 15,000 HUF NET EQUIVALENT / MONTH
PER_PROJECT_AI_REPORT_DRAFT_SOFT_CAP = 300 HUF ESTIMATED EQUIVALENT
CAP_REACHED_FALLBACK = DISABLE_OR_QUEUE_AI_REPORT_AND_ASSISTANT_CALLS
AUTOMATIC_OVERAGE = FORBIDDEN_WITHOUT_PRODUCT_OWNER_APPROVAL
```

No new paid tool becomes mandatory without blocker/value justification.

Required user-facing message:

> Az AI használati keret elérte a beállított limitet. A funkció átmenetileg szünetel, manuális review szükséges.

---

# 12. Current blockers

No remaining Day 0 blockers.

Resolved by `MS-MVP-DAY00-BLOCKER-CLOSURE`:

- `BLOCKER-001`: writable fork and canonical remote state verified;
- `BLOCKER-002`: Pilot A/B/C slots and objectives approved;
- `BLOCKER-003`: provider, hard cap, soft cap and fallback policy frozen.

Non-blocking prerequisite: attach Pilot A/B/C files and define ground truth before pilot execution.

---

# 13. Immediate next action

The next development action is:

```text
PRODUCT OWNER AUTHORIZATION
FOR THE NEXT BOUNDED FOUNDATION TASK
```

Commit 5 completed a bounded hardening change in the existing ProjectHome create/open path only. No follow-on feature task may start without separate authorization.

---

# 14. Update protocol

This file is dynamic.

Update after every accepted development task.

Each update must preserve:

```text
date/time
task ID
agent
branch
starting SHA
final SHA
test status
new blockers
resolved blockers
next gate
```

Never replace `UNKNOWN` with a guessed value.

---

# 15. Change log

| Date | Change |
|---|---|
| 2026-09-14 | v1.0 created from validated Scope Freeze v2.0 and current conversation state. Current Git/repo values intentionally left UNVERIFIED pending Day 0. |
| 2026-09-14 | Day 0 blocker closure: writable fork, pilot slots and runtime AI cost controls validated; Start Gate updated to GO. |
| 2026-09-17 | Commit 5 hardening update: existing ProjectHome create/open path completed on `copilot/ms-mvp-day01-commit05-wip-hardening`; next bounded task again requires separate authorization. |

---

**END OF FILE**
