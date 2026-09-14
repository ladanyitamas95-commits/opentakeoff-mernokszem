# 03_DEVELOPMENT_STATE.md

**Projekt:** MérnökSzem – Product & Development OS
**Dokumentumtípus:** Project Control File / Live Development State
**Verzió:** 1.0
**Snapshot dátum:** 2026-09-14 02:32 CEST
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
| Current program stage | **DAY 0 / START-GATE PREPARATION** |
| Feature development authorization | **NOT YET AUTHORIZED** |
| Day 0 result | **NOT PROVIDED / NOT VERIFIED** |
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
| START-GATE-002 | Writable GitHub remote exists | **UNVERIFIED** | Day 0 repo precheck szükséges |
| START-GATE-003 | Canonical base SHA recorded | **UNVERIFIED** | Day 0 repo precheck szükséges |
| START-GATE-004 | Upstream OpenTakeoff SHA frozen | **UNVERIFIED** | Day 0 repo precheck szükséges |
| START-GATE-005 | Current repo builds or failures documented | **UNVERIFIED CURRENTLY** | korábbi baseline történeti adat, újraellenőrzendő |
| START-GATE-006 | Pre-existing failure registry exists | **NOT VERIFIED FOR DAY 0** | Day 0 report/failure registry szükséges |
| START-GATE-007 | 3 pilot project packages selected | **PENDING** | konkrét A/B/C csomag kijelölendő |
| START-GATE-008 | API/cost cap defined | **PARTIAL** | kb. 150k Ft/hó planning envelope ismert; runtime API hard cap rögzítendő |
| START-GATE-009 | No unresolved P0 contradiction remains | **CONDITIONALLY PASS** | Scope Freeze v2.0 oldotta a fő scope konfliktusokat; Day 0 dokumentumaudit szükséges |
| START-GATE-010 | Product Owner approved Controlled Pilot framing | **PASS** | explicit validáció |

### Current start decision

```text
NO FEATURE DEVELOPMENT YET
```

Az aktuális helyes feladat a Day 0 Start Gate lezárása.

---

# 3. Day 0 artifact state

| Artifact | Status |
|---|---|
| `MS_MVP_SCOPE_FREEZE_v2.0_FINAL.md` | CREATED + PRODUCT OWNER VALIDATED |
| `CODEX_PROMPT_MS_MVP_DAY00_START_GATE_v1.0.md` | CREATED |
| `MS-MVP-DAY00-START-GATE-REPORT.md` | NOT YET PROVIDED |
| `MS-MVP-DAY00-BASELINE-FAILURE-REGISTRY.md` | NOT YET PROVIDED |
| `MS-MVP-DAY00-REPO-INVENTORY.md` | NOT YET PROVIDED / OPTIONAL PER PROMPT |

---

# 4. Repository state

**FIGYELEM:** az alábbi current-state mezők szándékosan nem vesznek át régi chatből SHA-t.

| Mező | Current verified value |
|---|---|
| Repository root | UNKNOWN |
| Remote origin | UNKNOWN |
| Writable remote | UNKNOWN |
| Default branch | UNKNOWN |
| Canonical development branch | UNKNOWN |
| Canonical HEAD SHA | UNKNOWN |
| Upstream OpenTakeoff pinned SHA | UNKNOWN |
| Working tree status | UNKNOWN |
| Active worktrees | UNKNOWN |
| Remote branches synced | UNKNOWN |

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

```text
UNKNOWN UNTIL DAY 0 RE-RUN
```

### Historical evidence only

Korábbi riport szerint:
- build PASS;
- typecheck PASS;
- lint PASS;
- full web suite-ben 49 pre-existing localization/golden failure maradt;
- a W01 UI foundation nem adott új failure countot.

Ez történeti adat.
A Day 0 futásnak újra kell mérnie és failure registry-ben rögzítenie.

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
| MS-MVP-DAY00-START-GATE | Codex planned | repo/start-gate baseline, docs only | UNKNOWN until precheck | **PROMPT READY / RESULT NOT PROVIDED** |
| Claude Code first task | Claude Code | must wait for Start Gate | N/A | **NOT STARTED** |
| Controlled Pilot feature task | any | prohibited before Start Gate PASS | N/A | **BLOCKED BY START GATE** |

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
| A | simple / clean golden path | **TBD** |
| B | medium / realistic | **TBD** |
| C | problematic / incomplete / edge case | **TBD** |

Current status:

```text
PILOT PACKAGES NOT FORMALLY SELECTED
```

Potential historical project materials exist, but they must not be auto-selected without Product Owner approval and legal/professional usability check.

---

# 11. Cost state

### Planning envelope

```text
Technology development envelope: approx. 150,000 HUF / month
```

This is a planning ceiling, not a release proof.

### Still required before runtime-heavy development

```text
RUNTIME_AI_API_HARD_CAP = TBD
PER_REPORT_COST_ALERT = TBD
RUNAWAY_REQUEST_PROTECTION = REQUIRED
```

No new paid tool becomes mandatory without blocker/value justification.

---

# 12. Current blockers

## BLOCKER-001 — Day 0 not closed

No verified:
- writable remote;
- canonical SHA;
- pinned upstream SHA;
- current build/test baseline.

## BLOCKER-002 — Pilot packages not formally selected

3 categories defined, concrete files/packages TBD.

## BLOCKER-003 — API hard cap not explicitly frozen

Monthly envelope exists; runtime cap needs explicit value.

---

# 13. Immediate next action

The next development action is:

```text
RUN / COMPLETE
MS-MVP-DAY00-START-GATE
```

Then ingest the result into this file.

Do **not** start feature development before the Control Tower audits the Day 0 result and issues:

```text
GO
or
CONDITIONAL_GO with explicit non-blocking conditions
```

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

---

**END OF FILE**
