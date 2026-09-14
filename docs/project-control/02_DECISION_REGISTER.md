# 02_DECISION_REGISTER.md

**Projekt:** MérnökSzem – Product & Development OS
**Dokumentumtípus:** Project Control File / Product Owner Decision Register
**Verzió:** 1.0
**Dátum:** 2026-09-14
**Státusz:** ACTIVE CONTROL FILE
**Cél:** egy helyen rögzíteni a már explicit validált, fejlesztést befolyásoló Product Owner döntéseket, hogy az AI-agenteknek ne kelljen régi chatekben következtetniük arra, mi lett végül elfogadva.

---

## 1. Szabály

Csak explicit validált döntés kerülhet ide.

Státuszok:

```text
VALIDATED
SUPERSEDED
REVOKED
PENDING
```

Ha egy új döntés felülír egy régit:
- a régi rekord nem törlődik;
- státusza `SUPERSEDED`;
- az új Decision ID-ra hivatkozik.

---

## 2. Aktív validált döntések

### DEC-001 — Controlled Pilot release framing

**Státusz:** VALIDATED
**Döntés:** A 3 hetes cél neve és szintje:

```text
MérnökSzem Controlled Pilot MVP
```

Nem nevezhető production-ready enterprise SaaS-nak vagy teljes MérnökSzem platformnak.

**Hatás:** release kommunikáció, QA, roadmap, scope.

---

### DEC-002 — Scope Freeze v2.0 az elsődleges scope authority

**Státusz:** VALIDATED
**Döntés:** `MS_MVP_SCOPE_FREEZE_v2.0_FINAL.md` az aktuális P0/P1/OOS és release scope elsődleges dokumentuma.

Korábbi scope freeze / final scope lock dokumentumok scope szempontból felülírtak.

---

### DEC-003 — P0 measurement strategy

**Státusz:** VALIDATED
**Döntés:** A 3 hetes P0 fő mérési workflow:

- manual polygon → area;
- manual polyline → wall length;
- manual count → darabszám;
- wall surface csak explicit paraméterekkel / dokumentált rule-lal.

AI geometry proposal nem P0 release blocker.

---

### DEC-004 — Human-in-the-loop authority

**Státusz:** VALIDATED
**Döntés:**

```text
AI javasol.
Deterministic software számol.
Ember fogad el.
```

AI-originated engineering output nem válhat automatikusan `ACCEPTED` állapotúvá.

---

### DEC-005 — AI Assistant P0 scope

**Státusz:** VALIDATED
**Döntés:** P0-ban `AI Assistant Foundation` készül.

Minimum:
- projekt dokumentumokból forrásolt válasz;
- source snippet;
- bizonytalanság jelzése;
- aktív projekt/dokumentum/tétel kontextus;
- Review Queue és költségvetési eltérés magyarázata.

Nem P0:
- full ChatGPT history ingestion;
- autonomous self-learning;
- teljes knowledge platform;
- multi-agent expert platform;
- AI write-tool measurement agent.

---

### DEC-006 — Projektelőkészítő Riport v0.1 P0

**Státusz:** VALIDATED
**Döntés:** A Controlled Pilot MVP tartalmazhat:

```text
Projektelőkészítő Riport v0.1 DRAFT
```

Kötelező:
- project document grounding;
- fix/strukturált draft riport;
- alap hiányosság/kockázat/RFI;
- source snippet;
- `DRAFT / HUMAN REVIEW REQUIRED`.

Nem kommunikálható Report Engine v1.0-ként.

---

### DEC-007 — Projektelőkészítő AI Report Engine v1.0 külön program

**Státusz:** VALIDATED
**Döntés:** A Projektelőkészítő AI Report Engine v1.0 külön, várhatóan **8–12 hetes** quality program, nem a 3 hetes P0 scope része.

---

### DEC-008 — Report Engine v1.0 minőségi minimum

**Státusz:** VALIDATED
**Döntés:** A Report Engine v1.0 riportminősége csak akkor fogadható el, ha mérhetően **jobb**, mint a Káldi/Szitamajori referencia-riporté.

Release condition:

```text
MérnökSzem Report Engine v1.0 benchmark score
>
Káldi/Szitamajor baseline score
```

Célérték:

```text
>= 120% baseline
```

A benchmarknak szakmai mélységet, forrásolást, kockázatfeltárást, RFI-minőséget, döntéstámogatást, auditálhatóságot, strukturáltságot és ismételhetőséget is mérnie kell.

---

### DEC-009 — Custom GPT production integráció

**Státusz:** VALIDATED
**Döntés:** A meglévő Projektelőkészítő Custom GPT-t nem kezeljük production API/backendként.

Tilos:
- ChatGPT UI automation;
- session-cookie workaround;
- browser robot;
- undocumented Custom GPT API kerülőút.

A tudását/viselkedését saját backend + RAG + report pipeline-ban reprodukáljuk.

---

### DEC-010 — OpenTakeoff stratégia

**Státusz:** VALIDATED
**Döntés:**

```text
ADAPT, DO NOT REWRITE
```

Működő PDF/viewer/geometry képességet nem írunk újra technikai szükség nélkül.

---

### DEC-011 — External TakeOff vendor

**Státusz:** VALIDATED
**Döntés:** Kreo/Kamai vagy más külső TakeOff vendor nem lehet P0 production dependency.

Státusz:

```text
OPTIONAL POST-MVP BENCHMARK / ADAPTER CANDIDATE
```

---

### DEC-012 — Accuracy claim

**Státusz:** VALIDATED
**Döntés:** Nyilvános pontossági százalék — különösen 95–96% — nem kommunikálható validált benchmark és tolerance profile előtt.

---

### DEC-013 — Online payment P0

**Státusz:** VALIDATED
**Döntés:** P0-ban nincs beépített online payment / recurring billing.

Első commercial flow:

```text
trial / subscription intent
→ manual contact
→ agreement / invoice
→ bank transfer
→ manual access activation
```

---

### DEC-014 — Public GTM P0

**Státusz:** VALIDATED
**Döntés:** P0 publikus réteg:

- Landing page;
- Trial/Csomagok;
- Login entry;
- lead capture;
- legal/contact links.

Public AI Support Beta lehet, de non-core blocker.

---

### DEC-015 — Marketing content configurability

**Státusz:** VALIDATED
**Döntés:** Hero, CTA, csomagleírás, FAQ és egyéb marketing copy központi content/config rétegből jöjjön, hogy a szöveg fejlesztési refaktor nélkül módosítható legyen.

---

### DEC-016 — Public vs private AI boundary

**Státusz:** VALIDATED
**Döntés:**

```text
PUBLIC_SUPPORT_CONTEXT
!=
AUTHENTICATED_PROJECT_CONTEXT
```

Anonymous/public support nem férhet hozzá:
- private project documentumhoz;
- user project contexthez;
- private ground truthhoz;
- más ügyfél adatához.

---

### DEC-017 — User-facing költségvetési terminológia

**Státusz:** VALIDATED
**Döntés:** Felhasználói UI-ban a „BOQ” helyett magyar szakmai terminológia használandó.

Példák:
- Költségvetés
- Tételes költségvetés
- Költségvetési összevetés
- Költségvetési eltérés
- Árazatlan költségvetés

Internal code/domain object lehet `BOQ` / `BOQItem`.

---

### DEC-018 — Quantity discrepancy P0 policy

**Státusz:** VALIDATED
**Döntés:**

```text
<= 5% → non-blocking
> 5%  → REVIEW_REQUIRED
```

A >5% eltérés nem automatikusan „hiba”.

Unit mismatch és uncertain mapping nem finalizálható automatikusan.

---

### DEC-019 — Feature freeze

**Státusz:** VALIDATED
**Döntés:** A 3 hetes sprintben Day 12 végén FEATURE FREEZE.

Utána csak:
- bugfix;
- regression fix;
- security fix;
- release blocker fix;
- deployment;
- copy;
- documentation;
- pilot bug.

Új feature → P1 backlog / Change Request.

---

### DEC-020 — Pilot validation

**Státusz:** VALIDATED
**Döntés:** Controlled Pilot release előtt minimum 3 projektminta szükséges:

- Pilot A: egyszerű;
- Pilot B: közepes;
- Pilot C: problémás/edge case.

Release minimum:
- legalább 2/3 golden path PASS;
- a harmadiknál legfeljebb dokumentált non-blocking limitation;
- P0 blocker nem maradhat nyitva.

---

### DEC-021 — Source hierarchy override

**Státusz:** VALIDATED
**Döntés:** A Scope Freeze v2.0 felülírja a korábbi canonical plan régi source-priority és scope részeit ott, ahol konfliktus van.

Régi részletes dokumentum nem emelhet vissza P0-ba később kivett funkciót.

---

### DEC-022 — Writable development fork

**Státusz:** VALIDATED
**Döntés:** A writable development remote a `ladanyitamas95-commits/opentakeoff-mernokszem` fork, az authoritative branch `codex/w01-ui-foundation`.

A `Kentucky-ai/opentakeoff` repository az eredeti upstream referencia; oda ebből a munkafolyamatból push tilos.

**Forrás:** Product Owner update, 2026-09-14; sikeres `git push -u origin codex/w01-ui-foundation` evidence.

---

### DEC-023 — Controlled Pilot A/B/C slots

**Státusz:** VALIDATED
**Döntés:** A három pilot slot kijelölve:

- **Pilot A:** egyszerű kontrollált golden path; PDF feltöltés, skála, kézi poligon/polivonal/db mérés, XLSX költségvetés import, manuális mapping, eltéréskimutatás, Review Queue és XLSX export.
- **Pilot B:** valós agrár/technológiai tervpilot, Mosonszolnok / hígtrágya jellegű projekt; valós tervalapú mennyiségi ellenőrzés és auditálhatóság.
- **Pilot C:** valós költségvetési import és eltéréskezelési pilot, Gorzsa kerékmosó / ÉNGY jellegű projekt; sorazonosítás, mennyiség-összevetés és a `>5% = REVIEW_REQUIRED` szabály.

Mindhárom státusza `PILOT_SLOT_RESERVED`; a fájlok `TO_BE_ATTACHED_LATER`, a ground truth `TO_BE_DEFINED`. Ezek pilot-execution prerequisites, nem Day 0 dokumentációs blocker-ek.

---

### DEC-024 — Runtime AI provider and cost controls

**Státusz:** VALIDATED
**Döntés:** Az elsődleges runtime szolgáltató OpenAI API. Claude API nem P0; Gemini API opcionális későbbi fallback, nem P0 blocker.

- havi runtime AI hard cap: **15 000 HUF net equivalent**;
- projektenkénti AI report draft soft cap: **300 HUF estimated equivalent**;
- automatikus overage nincs Product Owner jóváhagyás nélkül;
- limitnél az AI riportgenerálás és AI Assistant hívások letiltandók vagy sorba állítandók;
- kötelező felhasználói üzenet: „Az AI használati keret elérte a beállított limitet. A funkció átmenetileg szünetel, manuális review szükséges.”

---

## 3. Lezárt korábbi nyitott döntések

A Day 0 blocker closure során lezárt korábbi nyitott rekordok auditnyomként megmaradnak. Aktív nyitott Day 0 döntés nincs.

### OPEN-001 — Aktuális canonical repository state

**Státusz:** SUPERSEDED by `DEC-022` and Day 0 evidence
A writable fork, az authoritative branch, a Day 0 HEAD és az upstream reference dokumentálva.

### OPEN-002 — Három konkrét pilotcsomag kijelölése

**Státusz:** SUPERSEDED by `DEC-023`
A három pilot slot és cél kijelölve. A fájlcsatolás és ground truth meghatározás pilot-execution prerequisite.

### OPEN-003 — API hard cap pontos értéke

**Státusz:** SUPERSEDED by `DEC-024`
Az elsődleges provider, havi hard cap, projektenkénti soft cap, fallback és overage policy explicit rögzítve.

---

## 4. Döntés hozzáadási sablon

```text
DEC-XXX
Title:
Date:
Status:
Decision:
Reason:
Impacted modules:
Supersedes:
Source:
Notes:
```

---

## 5. Frissítési szabály

- Product Owner új explicit validált döntése után a register frissítendő.
- Chat historyból következtetett döntést tilos `VALIDATED` státusszal felvenni.
- Technikai tény (branch/SHA/test status) nem Product Decision; az a `03_DEVELOPMENT_STATE.md` fájlba kerül.

---

**END OF FILE**
