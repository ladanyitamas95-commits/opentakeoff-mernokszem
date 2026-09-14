# 00_PROJECT_INDEX.md

**Projekt:** MérnökSzem – Product & Development OS
**Dokumentumtípus:** Project Control File / Master Index
**Verzió:** 1.0
**Dátum:** 2026-09-14
**Státusz:** ACTIVE CONTROL FILE
**Tulajdonos:** Product Owner
**Frissítési felelős:** Development Control Tower
**Cél:** egyetlen rövid belépési pontot adni minden emberi és AI közreműködőnek a projekt aktuális struktúrájához, authority-rendszeréhez és működési szabályaihoz.

---

## 1. Projektdefiníció

A MérnökSzem egy magyar nyelvű, építőipari AI-döntéstámogató platform.

Az aktuális fejlesztési cél:

> **MérnökSzem Controlled Pilot MVP**

A 3 hetes cél **nem** teljes production SaaS, teljes ERP, teljes ÉPOS, automatikus AI TakeOff engine vagy a Projektelőkészítő AI Report Engine v1.0.

A Controlled Pilot MVP frozen release objective:

```text
PUBLIC LANDING
→ TRIAL / DEMO LEAD
→ MANUAL ACCOUNT ACTIVATION
→ LOGIN
→ PROJECT CREATE
→ PDF + XLSX UPLOAD
→ PDF VIEWER
→ SCALE CONFIRMATION
→ MANUAL GEOMETRY
→ CANONICAL SI RECOMPUTE
→ HUMAN MEASUREMENT REVIEW
→ XLSX KÖLTSÉGVETÉS IMPORT
→ MANUAL COLUMN MAPPING
→ MANUAL MEASUREMENT ↔ ITEM MAPPING
→ DETERMINISTIC QUANTITY COMPARE
→ REVIEW QUEUE
→ AI ASSISTANT FOUNDATION / REPORT v0.1 DRAFT
→ AUDITABLE XLSX EXPORT
→ SOURCE TRACEBACK
```

---

## 2. Projekt működési alapelvei

### 2.1 Termékfejlesztési lánc

```text
IDEA / REQUIREMENT
→ VALIDATION
→ SPECIFICATION
→ DEVELOPMENT_READY
→ TASK
→ CODE
→ TEST
→ COMMIT
→ INDEPENDENT AUDIT
→ ACCEPTANCE
→ NEXT TASK
```

Egy AI-agent „done” állítása önmagában nem bizonyíték.

### 2.2 Mérnöki authority

```text
AI javasol.
Deterministic software számol.
Ember fogad el.
```

AI engineering output nem válhat automatikusan végleges mérnöki eredménnyé.

### 2.3 Technikai igazság

- **Repository + commit + teszt** = aktuális implementációs bizonyíték.
- **Canonical specification** = célviselkedés igazsága.
- Ha code és spec eltér, az eltérést dokumentálni kell; egyik sem írható át csendben.

### 2.4 Scope control

A frozen P0 scope csak Product Owner által jóváhagyott Change Requesttel módosítható.

---

## 3. ChatGPT Project chat-struktúra

Az aktív projektben cél szerint **6 fő chat** legyen.

| ID | Chat | Szerep | Implementálhat? |
|---|---|---|---|
| 00 | PRODUCT OWNER & STRATEGY | scope, üzleti modell, roadmap, végső Product Owner döntések | Nem |
| 01 | DEVELOPMENT CONTROL TOWER | multi-agent koordináció, Git/GitHub, task routing, státusz, acceptance | Nem elsődlegesen |
| 02 | CLAUDE CODE DEV | komplex implementáció, debugging, multi-file fejlesztés | Igen |
| 03 | CODEX DEV & INDEPENDENT QA | célzott implementáció, repo audit, független review | Igen |
| 04 | PRODUCT & KNOWLEDGE LAB | ötlet/tudás → IRL-5 DEVELOPMENT_READY | Nem |
| 05 | QA / PILOT / RELEASE | regresszió, pilot, security, release GO/NO-GO | Nem elsődlegesen |

### Szabály

A régi fejlesztési chatek **nem kerülnek automatikusan** az aktív projektbe.

A régi chatből csak:
- validált döntés,
- újrahasznosítható knowledge asset,
- benchmark/ground truth,
- DEVELOPMENT_READY specifikáció,
- vagy canonical dokumentum

kerülhet át.

---

## 4. Project Control Files

A projekt négy rövid, mindig karbantartott control file-ja:

| Fájl | Funkció |
|---|---|
| `00_PROJECT_INDEX.md` | projekt térképe és működési kerete |
| `01_SOURCE_AUTHORITY_REGISTRY.md` | melyik forrás mennyire kötelező |
| `02_DECISION_REGISTER.md` | validált Product Owner döntések |
| `03_DEVELOPMENT_STATE.md` | aktuális technikai és fejlesztési állapot |

### Kötelező elv

A control file-ok nem helyettesítik a repository-t vagy a canonical specifikációkat.
A control file-ok azok **indexei és aktuális állapot-összefoglalói**.

---

## 5. Canonical Core Source Pack

A minimális, állandó project source pack ajánlott tartalma:

```text
00_PROJECT_INDEX.md
01_SOURCE_AUTHORITY_REGISTRY.md
02_DECISION_REGISTER.md
03_DEVELOPMENT_STATE.md

MS_MVP_SCOPE_FREEZE_v2.0_FINAL.md
MS_MVP_CANONICAL_DEVELOPMENT_PLAN_v1.0.md
DOMAIN_CONTRACT_REGISTRY.md
AGENT_FILE_OWNERSHIP.md
MS_AI_Development_Orchestration_Plan_v1.0
MS_MVP_SCREEN_SPEC_v1.0.md
MernokSzem_BrandBook_v1.0_brandcsalad.docx
MS_MVP_REGRESSION_CORPUS_MANIFEST_v1.0.md
```

**Megjegyzés:** egy fájl jelenléte a Projectben önmagában nem teszi authoritative-vé. Az authority státuszt kizárólag a `01_SOURCE_AUTHORITY_REGISTRY.md` határozza meg.

---

## 6. Phase-specific source packok

Csak akkor legyenek aktív fejlesztési kontextusban, amikor az adott fázishoz ténylegesen szükségesek.

### 6.1 AI / Report Engine

```text
MERNOKSZEM_PROJECT_PREPARATION_AI_FUNCTIONAL_SPEC_v1.0
MS_AI_ASSISTANT_EXTERNAL_SOURCE_PACK_v1.0
MS_KNOWLEDGE_SOURCE_REGISTER_v1.1
MS_REPORT_ENGINE_V1_QUALITY_BENCHMARK_KALD_SZITAMAJOR_v1.0
```

### 6.2 TakeOff / Measurement

```text
MérnökSzem TakeOff – AI-Assisted ... Functional Spec v0.2
MS_MernokSzem_MVP_integracios_terv_v1.0
QTO reference workbooks
validated regression / ground-truth packs
```

### 6.3 GTM

```text
MS_PUBLIC_GTM_SCREEN_SPEC_v1.0.md
MS_PUBLIC_GTM_CONTENT_BLUEPRINT_v1.0.md
```

### 6.4 Principle

```text
JUST-IN-TIME CONTEXT
```

Ne töltsünk minden sessionbe minden dokumentumot.

---

## 7. Aktuális frozen termékdöntések – rövid összefoglaló

A részletes és verziózott döntések a `02_DECISION_REGISTER.md` fájlban vannak.

Kiemelt invariánsok:

- Controlled Pilot MVP a 3 hetes cél.
- Manual takeoff a P0 fő mérési workflow.
- AI Assistant Foundation + Projektelőkészítő Riport v0.1 Draft P0.
- Projektelőkészítő AI Report Engine v1.0 külön 8–12 hetes quality program.
- Report Engine v1.0 kötelezően jobb a Káldi/Szitamajori benchmarknál.
- OpenTakeoff: **ADAPT, DO NOT REWRITE**.
- Kreo/Kamai nem P0 production dependency.
- Online payment nincs P0-ban.
- Public accuracy % claim tilos validált benchmark előtt.
- User-facing UI-ban a „BOQ” helyett magyar szakmai terminológia használandó.
- Public AI és private project AI kontextusa szigorúan külön.
- AI nem final engineering authority.

---

## 8. Aktuális fejlesztési fázis

Az aktuális technikai state **nem ebből a fájlból olvasandó**.

Mindig ezt használd:

```text
03_DEVELOPMENT_STATE.md
```

Ha az ottani adat `UNKNOWN`, `UNVERIFIED` vagy `NOT_RUN`, tilos korábbi chatből vagy memóriából aktuális technikai állapotot feltételezni.

---

## 9. Forráskonfliktus kezelése

Ha két forrás ellentmond:

1. ellenőrizd a `01_SOURCE_AUTHORITY_REGISTRY.md` státuszait;
2. ellenőrizd a `02_DECISION_REGISTER.md` újabb Product Owner döntéseit;
3. ha a konfliktus nem oldható fel, státusz:
   `SOURCE_CONFLICT / BLOCKED_DECISION`;
4. AI-agent nem improvizálhat domain- vagy üzleti szabályt.

---

## 10. Legacy chat szabály

A fejlesztési chat history döntési előzmény és kutatási nyersanyag lehet, de **nem production specification**.

Legacy chat feldolgozási lánc:

```text
OLD CHAT
→ FORENSIC REVIEW
→ KEEP / SUPERSEDED / REJECT
→ CLEAN ARTIFACT
→ AUTHORITY CLASSIFICATION
→ PROJECT SOURCE (csak ha indokolt)
```

---

## 11. Frissítési protokoll

Ezt a fájlt csak akkor kell módosítani, ha változik:

- a projekt chat-architektúrája;
- a core control file rendszer;
- a canonical source pack;
- a release neve vagy alapvető termékstruktúrája.

Napi fejlesztési állapotot **nem itt**, hanem a `03_DEVELOPMENT_STATE.md` fájlban kell frissíteni.

---

**END OF FILE**
