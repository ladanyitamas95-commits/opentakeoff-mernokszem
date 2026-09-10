# MérnökSzem — AI Development Orchestration Plan v1.0

**Dátum:** 2026-09-10  
**Státusz:** Validált fejlesztési végrehajtási terv  
**Cél:** A MérnökSzem MVP leggyorsabb, kontrollált és auditálható megépítése Codex, GitHub, Copilot Pro, Lovable, Antigravity és ChatGPT összehangolt használatával.

## Végleges eszközszerepek

- **GitHub:** single source of truth, branch/commit/PR/release.
- **Codex:** primary engineering agent; multi-file implementáció, backend/domain/refaktor/teszt.
- **GitHub Copilot Pro:** napi IDE co-pilot, autocomplete, kisebb javítás, unit test, lokális review.
- **Lovable:** célzott UI accelerator, elsősorban App Shell/Project UI és final UI polish.
- **Antigravity:** independent second-opinion reviewer és backup agent kritikus fázisoknál.
- **ChatGPT:** product/architecture/prompt/acceptance orchestration.

## Hard rules

1. GitHub az egyetlen canonical codebase.
2. Egy fázis = egy lezárható scope.
3. FAIL acceptance esetén nincs következő fázis.
4. AI javasol; deterministic engine számol; ember fogad el.
5. Dimenziós quantity confirmed scale nélkül nem approved/exportképes.
6. Q2 rule/policy verzió nélkül nem authoritative.
7. Critical change csak teszt + commit + acceptance után merge-elhető.
8. Két agent ugyanazt a kódot koordinálatlanul nem módosítja.

## Phase routing

| Phase | Scope | Primary | Reviewer |
|---|---|---|---|
| 00 | Repo audit & baseline | Codex | ChatGPT |
| 01 | Supabase/Auth/RLS | Codex | Antigravity/Copilot |
| 02 | App Shell + Project Core | Lovable | Codex |
| 03 | Document Upload | Codex | Copilot |
| 04 | PDF Viewer | Codex | Copilot |
| 05 | Scale Calibration | Codex | Antigravity |
| 06 | Geometry Engine | Codex | Antigravity |
| 07 | Manual Takeoff Canvas | Codex | Copilot |
| 08 | Measurement Review | Codex | ChatGPT |
| 09 | Policy Q1/Q2 | Codex | ChatGPT + Antigravity |
| 10 | Validation + Review Queue | Codex | ChatGPT |
| 11 | BOQ Import | Codex | Copilot |
| 12 | BOQ Compare | Codex | Copilot |
| 13 | XLSX Export | Codex | Copilot |
| 14 | Project Assistant | Codex | ChatGPT |
| 15 | AI Proposal Adapter | Codex | Antigravity |
| 16 | Regression + Pilot Gate | Codex | Antigravity + ChatGPT |
| 17 | UI/UX Polish | Lovable | Codex + Copilot |

## Kötelező development cycle

PRE-CHECK → PLAN → IMPLEMENT → LOCAL VERIFY → SECOND REVIEW (ha kritikus) → FIX → COMMIT → ACCEPTANCE → MERGE/NEXT.

## Kritikus second-opinion fázisok

- Phase 01: security/RLS
- Phase 05: scale calibration
- Phase 06: deterministic geometry
- Phase 09: measurement policy/Q1-Q2
- Phase 15: AI proposal state machine
- Phase 16: pilot release gate

## Első 10 futás

1. Codex — S00 repo audit/baseline.
2. Codex — S01 Supabase/Auth/RLS.
3. Antigravity — S01 read-only security review.
4. Codex — S01 findings fix.
5. Lovable — S02 AppShell/Project UI.
6. Codex — S02 integration/diff review.
7. Codex — S03 Document Upload.
8. Codex — S04 PDF Viewer.
9. Codex — S05 Scale Calibration.
10. Antigravity — S05 read-only scale review.

## Következő fejlesztési futás

**PHASE 00 / MS-MVP-S00 — Repo Audit és Baseline Codexben.**

Cél: a jelenlegi repository stackjének, futtathatóságának, tesztjeinek, ismert hibáinak és fejlesztési határainak rögzítése új feature implementálása nélkül.
