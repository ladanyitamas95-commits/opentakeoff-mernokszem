# MS_MVP_SCOPE_FREEZE_v2.0_FINAL

**Projekt:** MérnökSzem MVP
**Dokumentumtípus:** Végleges scope freeze / fejlesztési indítási döntési dokumentum
**Verzió:** v2.0 FINAL
**Dátum:** 2026-09-13
**Státusz:** FINAL DRAFT – felhasználói validálásra előkészítve
**Döntési cél:** a 3 hetes MVP-fejlesztés hibás, túlzott vagy nem valid alapokon történő elindításának megakadályozása
**Elsődleges közönség:** Product Owner, AI fejlesztő agent, senior fejlesztő, QA, üzleti döntéshozó
**Nyelv:** magyar
**Bizalmasság:** BELSŐ / BIZALMAS

---

## 0. Vezetői döntés

A MérnökSzem első fejlesztési célja nem teljes értékű production SaaS és nem teljes építőipari AI platform.

A 3 hetes fejlesztési cél:

> **MérnökSzem Controlled Pilot MVP**
> kontrollált pilotra alkalmas, auditálható, magyar nyelvű építőipari webalkalmazás, amely PDF-terveken manual quantity takeoffot támogat, a mért mennyiségeket XLSX költségvetéssel összeveti, review workflow-t és alap AI-riport/asszisztens foundationt biztosít.

A 3 hetes MVP célja tehát:

1. a technikai és termékoldali alap workflow bizonyítása;
2. a mérés–költségvetés–review–export lánc működtetése;
3. egy korlátozott, forrásolt Projektelőkészítő Riport v0.1 foundation beépítése;
4. kontrollált pilot ügyfélhasználat előkészítése;
5. a későbbi, magasabb minőségű Projektelőkészítő AI Report Engine v1.0 alapjainak lerakása.

A 3 hetes MVP **nem vállalja**, hogy eléri vagy meghaladja a Káldi/Szitamajori referencia-riport minőségét. Ez a kötelező minőségi szabály a **Projektelőkészítő AI Report Engine v1.0** kiadási feltétele.

---

## 1. Supersession – mely korábbi dokumentumokat írja felül ez a scope freeze?

Ez a dokumentum a további fejlesztési döntésekben **elsődleges scope dokumentum**.

Az alábbi dokumentumok továbbra is történeti és szakmai forrásként használhatók, de scope-ütközés esetén ez a v2.0 FINAL dokumentum az irányadó:

| Dokumentum | Státusz ebben a v2.0 döntésben |
|---|---|
| `MS_MVP_SCOPE_FREEZE_v1.0` | SUPERSEDED |
| `MS_MVP_SCOPE_FREEZE_v1.0.1` | SUPERSEDED FOR SCOPE; historical source only |
| `MS_MVP_CANONICAL_DEVELOPMENT_PLAN_v1.0` | PARTIALLY AUTHORITATIVE; csak ahol nem ütközik ezzel a scope freeze-zel |
| `MS_AI_Development_Orchestration_Plan_v1.0` | TOOL GOVERNANCE SOURCE; scope-ra nem végső |
| `MS_PUBLIC_GTM_SCREEN_SPEC_v1.0` | GTM SOURCE; public AI support és payment határok e dokumentum szerint szűkítve |
| `MS_AI_ASSISTANT_EXTERNAL_SOURCE_PACK_v1.0` | AI ARCHITECTURE SOURCE; P0 scope e dokumentum szerint szűkítve |
| `MERNOKSZEM_PROJECT_PREPARATION_AI_FUNCTIONAL_SPEC_v1.0` | REPORT ENGINE V1 SOURCE; nem teljes P0 követelmény |
| `MS_KNOWLEDGE_SOURCE_REGISTER_v1.1` | KNOWLEDGE SOURCE REGISTER; P0 corpus nem tekinthető teljesnek |
| `MS_MVP_BENCHMARK_AND_GROUND_TRUTH_PACK_v1.0.1` | BENCHMARK SOURCE; accuracy és vendor go-live gate külön marad |

---

## 2. Normatív szabályok

A dokumentumban használt kötelező kifejezések:

| Kifejezés | Jelentés |
|---|---|
| **MUST / KÖTELEZŐ** | E nélkül a fejlesztés vagy release nem validálható. |
| **MUST NOT / TILOS** | Ilyen működés vagy állítás nem kerülhet a termékbe. |
| **SHOULD / JAVASOLT** | Erős ajánlás; csak indokolt döntéssel térhetünk el. |
| **MAY / LEHET** | Opcionális; nem release blocker. |
| **P0** | A 3 hetes Controlled Pilot MVP kötelező része. |
| **P1** | A pilot után következő fejlesztési blokk. |
| **V1.0** | Piacképesebb, benchmarkolt, magasabb minőségű termékmodul-verzió. |
| **OOS** | Out of scope; nem fejlesztjük az adott release-ben. |

---

## 3. Végleges termékdefiníció

### 3.1 MérnökSzem Controlled Pilot MVP

A MérnökSzem Controlled Pilot MVP egy:

- magyar nyelvű;
- webes;
- projektalapú;
- PDF-terv alapú;
- XLSX költségvetés alapú;
- human-in-the-loop;
- auditálható;
- SI-egység alapú;
- kontrollált pilotra alkalmas

építőipari döntéstámogató alkalmazás.

### 3.2 Egy mondatos definíció

> **A MérnökSzem Controlled Pilot MVP lehetővé teszi, hogy egy felhasználó PDF terven hitelesített méretarány mellett manuális mennyiséget mérjen, a mért adatokat XLSX költségvetési tételekkel összevesse, az eltéréseket review-ban kezelje, alap AI-támogatott magyarázatot/riportot kapjon, majd auditálható XLSX exportot készítsen.**

### 3.3 Márkapozíció

A MérnökSzem nem helyettesíti a mérnököt.
A MérnökSzem gyorsabbá, átláthatóbbá, auditálhatóbbá és döntéstámogatóbbá teszi a mérnök, beszerző és projektelőkészítő munkáját.

---

## 4. Alap rendszerelv

A MérnökSzem hosszú távú saját IP-je nem a PDF viewer, nem egy konkrét AI modell, nem egy konkrét külső takeoff vendor, és nem egy UI framework.

A saját IP:

```text
Canonical Measurement
+
HU Rule Engine
+
Validation
+
Evidence / Source Lineage
+
Human Correction Data
+
Ground Truth Corpus
+
BOQ / Költségvetés Mapping
+
Auditability
+
Project Preparation / Audit / ÉPOS Intelligence
```

---

## 5. Kötelező human-in-the-loop szabály

### 5.1 AI nem lehet végleges mérnöki hatóság

Az AI:

- javasolhat;
- összefoglalhat;
- magyarázhat;
- riporttervezetet készíthet;
- kockázatot jelölhet;
- RFI-javaslatot adhat.

Az AI **nem**:

- fogadhat el automatikusan mérést;
- minősíthet véglegesnek mennyiséget;
- nyilváníthat költségvetési eltérést automatikusan hibának;
- hozhat végleges mérnöki vagy üzleti döntést;
- írhat felül emberi review-t;
- adhat production accuracy claimet benchmark nélkül.

### 5.2 Kritikus állapotváltozások

Minden AI-eredetű mérési vagy riportmegállapítás induló státusza:

```text
AI_PROPOSED / REVIEW_REQUIRED
```

Végleges állapot csak explicit emberi döntéssel lehet:

```text
ACCEPTED
EDITED
REJECTED
```

---

## 6. A 3 hetes MVP P0 scope-ja

### 6.1 P0-A – Foundation és repository

Kötelező:

- saját, writable GitHub remote vagy repository/fork;
- egyetlen canonical repository;
- rögzített induló SHA;
- branch/worktree szabály;
- baseline build/typecheck/lint;
- pre-existing teszthibák külön nyilvántartása;
- `.env.example`;
- minimum startup/deploy runbook;
- explicit known limitations dokumentum.

### 6.2 P0-B – Auth és pilot hozzáférés

Kötelező:

- egyfelhasználós vagy manuálisan provisionált pilot hozzáférés;
- protected `/app` routes;
- privát projektadat alapelv;
- browserben nincs production AI secret;
- felhasználó nem férhet hozzá más projektjéhez URL manipulációval;
- alap audit események.

Nem P0:

- teljes enterprise RBAC;
- self-service organization management;
- több jogosultsági szint részletes admin felülettel.

### 6.3 P0-C – Projekt és dokumentumkezelés

Kötelező:

- projekt létrehozás;
- projekt újranyitás;
- projekt státusz;
- PDF feltöltés;
- XLSX költségvetés feltöltés;
- dokumentum metaadatok;
- verzió és forrásazonosító minimum.

### 6.4 P0-D – PDF viewer és scale

Kötelező:

- PDF megnyitás;
- többoldalas terv kezelése;
- zoom/pan;
- oldalváltás;
- scale létrehozás;
- scale jóváhagyás;
- scale nélküli dimenziós mérés blokkolása;
- scale conflict / review required állapot.

### 6.5 P0-E – Manual quantity takeoff

Kötelező mérési típusok:

| Mérés | P0 státusz |
|---|---|
| Terület / polygon | KÖTELEZŐ |
| Falhossz / polyline | KÖTELEZŐ |
| Darabszám / count | KÖTELEZŐ |
| Falfelület | FELTÉTELES P0: csak explicit paraméterekkel és rule/source jelöléssel |

P0-ban a manual measurement a fő workflow.
AI geometry proposal nem P0 release blocker.

### 6.6 P0-F – Canonical SI quantity

Kötelező:

- SI alapú canonical mennyiség;
- display rounding és calculation precision szétválasztása;
- client-calculated quantity nem authoritative;
- raw geometry megőrzése;
- mennyiségi számítás reprodukálhatósága.

### 6.7 P0-G – Measurement review

Kötelező:

- DRAFT;
- REVIEW_REQUIRED;
- ACCEPTED;
- EDITED;
- REJECTED;
- edit history;
- original AI/manual origin megőrzése;
- human decision audit.

### 6.8 P0-H – XLSX költségvetés import

Kötelező:

- XLSX beolvasás;
- sheet preview;
- manuális oszlopmapping;
- tételnév/mennyiség/egység alapmezők;
- hibás vagy hiányos mapping blokkolása;
- importált költségvetés forrásverziózása.

### 6.9 P0-I – Mérés ↔ költségvetési tétel mapping

Kötelező:

- manuális mapping;
- suggested mapping lehet, de nem auto-final;
- unit mismatch blokkolás;
- uncertain match review required;
- unmatched/partial items listázása.

### 6.10 P0-J – Költségvetési összevetés

Kötelező:

- mért mennyiség;
- költségvetési mennyiség;
- abszolút eltérés;
- százalékos eltérés;
- `<=5%` non-blocking;
- `>5%` REVIEW_REQUIRED;
- nulla baseline eset kezelése;
- eltérés nem automatikusan hiba.

### 6.11 P0-K – Review Queue

Kötelező:

- mérési problémák;
- mapping problémák;
- unit mismatch;
- jelentős mennyiségi eltérés;
- hiányzó forrás;
- export blocking státuszok.

### 6.12 P0-L – AI Assistant Foundation

P0-ban az AI Assistant csak korlátozott, forrásolt foundation.

Kötelező:

- projekt dokumentumokból válaszol;
- forrássnippetet mutat;
- jelzi, ha nincs elég forrás;
- aktív projekt/dokumentum/tétel kontextust kezel;
- review queue-t magyaráz;
- költségvetési eltérés lehetséges okait összefoglalja;
- minden lényegi választ `human_review_required` vagy hasonló figyelmeztetéssel ad, ha mérnöki döntést érint.

Nem P0:

- teljes MérnökSzem knowledge platform;
- teljes ChatGPT history ingestion;
- automatikus self-learning;
- multi-agent szakértői rendszer;
- write tool-using measurement agent;
- teljes Projektelőkészítő AI Report Engine v1.0.

### 6.13 P0-M – Projektelőkészítő Riport v0.1 Foundation

A P0 MVP-be bekerülhet egy fókuszált, korlátozott riportgomb:

```text
Projektelőkészítő riport készítése
```

P0 v0.1 képesség:

- projekt dokumentumokból dolgozik;
- fix riportstruktúrát használ;
- markdown/html riportot generál;
- fő hiányosságokat jelöl;
- alap kockázatlistát ad;
- alap tisztázó kérdéslistát ad;
- forrássnippeteket mellékel;
- minden output `DRAFT / HUMAN REVIEW REQUIRED`;
- nem kommunikálható v1.0-ként;
- nem ígérhető Káldi/Szitamajori minőség felettiként.

P0 v0.1 tiltások:

- nem hívja meg API-n keresztül a meglévő Custom GPT-t;
- nem használ ChatGPT web UI automatizálást;
- nem állítja, hogy teljes projektelőkészítő szakértői riport;
- nem exportál automatikusan végleges szakvéleményt;
- nem ad végleges tenderdöntést.

### 6.14 P0-N – Export

Kötelező:

- XLSX export;
- quantity summary;
- mapped cost item;
- discrepancy;
- review state;
- source lineage;
- audit event reference.

Nem P0 release blocker:

- formázott PDF riport;
- DOCX executive report;
- marked PDF finomítás.

### 6.15 P0-O – Publikus GTM réteg

Kötelező:

- Landing page;
- Trial/Csomagok oldal;
- Belépés link vagy login entry;
- trial/demo/contact lead capture;
- legal/contact linkek;
- marketing content centralizálása;
- árak nem kitalálása;
- bankkártyás checkout kihagyása;
- public/private AI context szétválasztása.

### 6.16 P0-P – Public AI support Beta

Lehet P0, de nem blokkolhatja a core release-t.

Megengedett:

- termékkel kapcsolatos kérdések;
- trial;
- csomagok;
- onboarding;
- kapcsolat;
- FAQ;
- contact handoff.

Tilos:

- privát projektdokumentum elérése;
- bejelentkezett projektkontextus elérése;
- belső ground truth elérése;
- fizetős ügyféladat elérése anonymous módban.

---

## 7. P1 scope – közvetlenül MVP után

P1-be kerül:

1. Projektelőkészítő AI Report Engine v1.0;
2. Káldi/Szitamajor benchmark baseline;
3. issue/risk/RFI register;
4. DOCX/PDF riport export;
5. több riporttípus;
6. részletes user review workflow;
7. tudásforrás registry UI;
8. curated MérnökSzem knowledge base v1;
9. AI evaluation/benchmark suite;
10. AI geometry proposal;
11. OpenTakeoff MCP write-tool integration;
12. real external takeoff adapter sandbox;
13. Kreo/Kamai benchmark;
14. payment provider;
15. auto subscription provisioning;
16. multi-user RBAC;
17. legal/commercial launch hardening.

---

## 8. P2 / Later scope

P2 vagy későbbi:

- teljes ÉPOS;
- teljes tender engine;
- RFQ modul;
- ár- és beszállítói intelligencia;
- ajánlat-összehasonlítás teljes ártükörrel;
- tárgyalási riportok;
- vendor scoring;
- supplier portal;
- NAV/számlázás;
- ERP modulok;
- BIM/IFC production pipeline;
- automatikus vasalásfelismerés;
- teljes szakági automatikus classification;
- automatikus nyílászáró-konszignáció;
- full enterprise RBAC;
- audit assistant teljes platformmodul;
- saját finetune vagy saját LLM;
- knowledge graph / GraphRAG.

---

## 9. Explicit out of scope a 3 hetes MVP-ben

A 3 hetes Controlled Pilot MVP-ben TILOS:

1. teljes ERP-t építeni;
2. teljes ÉPOS-t építeni;
3. bankkártyás fizetési rendszert építeni;
4. online számlázást bevezetni;
5. Kreo/Kamai production dependency-t létrehozni;
6. automatic takeoff accuracy claimet tenni;
7. 95–96% pontosságot marketingben vagy release DoD-ban szerepeltetni;
8. teljes ChatGPT corpus ingestiont vállalni;
9. Custom GPT-t UI-automatizálással meghívni;
10. AI-t automatikus mérnöki döntéshozóként használni;
11. ember nélküli final measurement acceptance-et engedni;
12. teljes multi-user enterprise RBAC-ot építeni;
13. új PDF renderert írni, ha az OpenTakeoff megfelelően adaptálható;
14. teljes projektelőkészítő v1.0 riportmotort P0-ba tolni;
15. a Káldi/Szitamajori minőségi benchmarkot P0 MVP release blockernek tekinteni;
16. proof nélküli marketing állításokat használni.

---

## 10. Végleges 3 hetes golden path

A 3 hetes MVP sikeres, ha az alábbi lánc kontrollált pilot környezetben működik:

```text
PUBLIC LANDING
  ↓
TRIAL / DEMO LEAD
  ↓
MANUAL ACCOUNT ACTIVATION
  ↓
LOGIN
  ↓
PROJECT CREATE
  ↓
PDF + XLSX DOCUMENT UPLOAD
  ↓
PDF VIEWER
  ↓
SCALE CONFIRMATION
  ↓
MANUAL GEOMETRY
  ↓
CANONICAL SI RECOMPUTE
  ↓
MEASUREMENT REVIEW
  ↓
ACCEPTED / EDITED / REJECTED MEASUREMENT
  ↓
XLSX BOQ / KÖLTSÉGVETÉS IMPORT
  ↓
MANUAL COLUMN MAPPING
  ↓
MANUAL MEASUREMENT ↔ ITEM MAPPING
  ↓
DETERMINISTIC QUANTITY COMPARE
  ↓
REVIEW QUEUE
  ↓
AI ASSISTANT FOUNDATION / REPORT v0.1 DRAFT
  ↓
AUDITABLE XLSX EXPORT
  ↓
SOURCE TRACEBACK
```

---

## 11. Projektelőkészítő AI Report Engine v1.0 – külön release szabály

### 11.1 Validált termékminőségi szabály

A **Projektelőkészítő AI Report Engine v1.0** riportminősége csak és kizárólag jobb lehet, mint a Káldi/Szitamajori referencia-riport minősége.

Ez nem marketingcél, hanem release-blocking acceptance criterion.

### 11.2 Káldi/Szitamajor baseline státusz

A Káldi/Szitamajori riport innentől:

```text
BENCHMARK_BASELINE
```

Nem egyszerű inspiráció, nem stílusminta, hanem kötelező minőségi viszonyítási alap.

### 11.3 Kötelező benchmark dokumentum

A Report Engine v1.0 előtt létre kell hozni:

```text
MS_REPORT_ENGINE_V1_QUALITY_BENCHMARK_KALD_SZITAMAJOR_v1.0
```

Minimum tartalom:

1. referencia-riport fejezetei;
2. szakmai mélység;
3. azonosított kockázatok;
4. RFI-k és tisztázó kérdések;
5. döntéstámogatási érték;
6. forrásoltság;
7. auditálhatóság;
8. riporthasználhatóság;
9. hiányosságok;
10. v1.0-nál elvárt javulási pontok;
11. scorecard;
12. minimum pass criterion.

### 11.4 AC-REPORT-V1-001

```text
AC-REPORT-V1-001

A Projektelőkészítő AI Report Engine v1.0 csak akkor validálható és adható ki fizetős ügyfélnek v1.0 státusszal, ha a validált Káldi/Szitamajori referencia-riporthoz képest mérhetően jobb:

- szakmai mélységben;
- forrás-visszakövetésben;
- auditálhatóságban;
- strukturáltságban;
- kockázati gondolkodásban;
- RFI- és döntéstámogatási minőségben;
- ismételhetőségben;
- exportálhatóságban;
- felhasználói review-folyamatban.

Elfogadási feltétel:
MérnökSzem Report Engine v1.0 benchmark score > Káldi/Szitamajor benchmark score.

Célérték:
MérnökSzem Report Engine v1.0 benchmark score ≥ 120% of Káldi/Szitamajor baseline.
```

### 11.5 v1.0 reális fejlesztési idő

A Projektelőkészítő AI Report Engine v1.0 nem 3 hetes MVP-funkció.

Reális idő:

```text
8–12 hét
```

Ez tartalmazza:

- tudásforrás-leltár;
- dokumentumfeldolgozás;
- RAG;
- riport séma;
- issue/risk/RFI struktúra;
- source trace;
- human review;
- export;
- benchmark;
- QA;
- pilot.

---

## 12. Custom GPT integrációs döntés

A meglévő Projektelőkészítő Custom GPT-t **nem** hívjuk meg közvetlenül API-n keresztül a MérnökSzem alkalmazásból.

### 12.1 Tiltott megoldások

Tilos:

- ChatGPT web UI automatizálása;
- session cookie alapú workaround;
- böngészőrobot, amely a Custom GPT felületén futtat riportot;
- a meglévő Custom GPT-t production backendként kezelni;
- ügyféladatot nem auditálható Custom GPT workflow-ba küldeni.

### 12.2 Elfogadott megoldás

A Custom GPT tudását és viselkedési logikáját saját MérnökSzem backendben reprodukáljuk:

```text
MérnökSzem app
↓
POST /projects/{projectId}/preparation-report
↓
Project document retrieval
↓
RAG / source extraction
↓
Project Preparation Report prompt + schema
↓
OpenAI/Claude API
↓
structured output
↓
human review
↓
MérnökSzem UI + export
```

A felhasználói élmény lehet hasonló:

```text
Rányom a riportgombra → megkapja a riportot
```

De a backend saját, auditálható, skálázható és kontrollált.

---

## 13. 3 hetes fejlesztési terv – corrected execution plan

### 13.1 Day 0 – No-code gate

Kötelező előfeltételek:

- Scope Freeze v2.0 FINAL validálva;
- writable GitHub remote/fork biztosítva;
- canonical base branch kiválasztva;
- induló SHA rögzítve;
- OpenTakeoff upstream SHA rögzítve;
- 3 pilot projekt kijelölve;
- Káldi/Szitamajor referencia-riport külön benchmarkként azonosítva;
- API és költségkeret hard cap rögzítve.

**NO CODE BEFORE DAY 0 PASS.**

### 13.2 Day 1–3 – Foundation

Feladat:

- repo reconciliation;
- baseline build/typecheck/lint;
- pre-existing failures registry;
- Supabase/auth/private storage;
- pilot account;
- project/document minimal schema;
- audit event foundation.

Gate:

```text
FOUNDATION_PASS
```

### 13.3 Day 4–7 – Measurement core

Feladat:

- project create/open;
- PDF upload/view;
- scale confirmation;
- polygon/polyline/count;
- canonical SI recompute;
- measurement review;
- audit events.

Gate:

```text
MEASUREMENT_CORE_PASS
```

### 13.4 Day 8–10 – Költségvetés és review

Feladat:

- XLSX import;
- manual column mapping;
- manual measurement-item mapping;
- unit mismatch;
- deterministic discrepancy;
- review queue;
- XLSX export blocker.

Gate:

```text
BOQ_REVIEW_PASS
```

### 13.5 Day 11–12 – AI foundation és report v0.1

Feladat:

- project document RAG;
- source snippet;
- assistant response;
- review queue explanation;
- Projektelőkészítő Riport v0.1 draft;
- limitations display.

Gate:

```text
AI_FOUNDATION_PASS
```

Day 12 este:

```text
FEATURE_FREEZE
```

Ezután nincs új funkció, csak bugfix, QA, security, copy, dokumentáció.

### 13.6 Day 13–14 – Public GTM

Feladat:

- Landing;
- Trial/Csomagok;
- Login entry;
- lead capture;
- public support beta vagy fallback;
- marketing content config;
- no invented prices;
- no payment.

Gate:

```text
GTM_PASS
```

### 13.7 Day 15–16 – QA, security, staging

Feladat:

- browser smoke;
- targeted regression;
- security review;
- public/private AI boundary;
- staging deploy;
- env/secrets cleanup;
- rollback notes.

Gate:

```text
RC1_PASS
```

### 13.8 Day 17–19 – Pilot projects

Feladat:

- Pilot A: egyszerű projekt;
- Pilot B: közepes projekt;
- Pilot C: problémás projekt;
- reproducible bugs;
- P0-only fixes.

Gate:

```text
PILOT_VALIDATION_PASS
```

### 13.9 Day 20–21 – Release decision

Feladat:

- RC2;
- known limitations;
- onboarding note;
- deployment note;
- cost report;
- GO/NO-GO decision.

Gate:

```text
CONTROLLED_PILOT_GO
```

---

## 14. MVP release gates

### 14.1 RG-MVP-CORE

Controlled Pilot MVP csak akkor GO, ha:

- build PASS;
- typecheck PASS;
- lint PASS;
- targeted tests PASS;
- pre-existing failures documented;
- nincs új P0 regresszió;
- project create/open működik;
- PDF upload/view működik;
- scale confirmation működik;
- scale nélküli export blokkol;
- polygon/polyline/count működik;
- canonical SI recompute működik;
- human review működik;
- XLSX import/mapping működik;
- deterministic discrepancy működik;
- review queue működik;
- XLSX export működik;
- source lineage visszakereshető;
- browserben nincs production secret;
- public/private data boundary működik.

### 14.2 RG-AI-FOUNDATION

AI Foundation csak akkor PASS, ha:

- projekt dokumentumból válaszol;
- forrássnippetet ad;
- bizonytalanságot jelöl;
- hallucination esetén nem finalizál;
- nem fér hozzá tiltott public/private adathoz;
- riport v0.1 DRAFT-ként jelenik meg;
- human review required státusz látható.

### 14.3 RG-REPORT-V1

Projektelőkészítő AI Report Engine v1.0 csak akkor PASS, ha:

- Káldi/Szitamajor benchmark dokumentált;
- scorecard elkészült;
- v1.0 riport score > baseline score;
- cél szerint score ≥ 120% baseline;
- issue/risk/RFI struktúra működik;
- forrásolás és trace működik;
- export működik;
- human review működik;
- benchmark legalább 3–5 validált projektmintán lefutott.

### 14.4 RG-ACCURACY

TakeOff production accuracy claim csak akkor engedélyezett, ha:

- annotated HU ground truth corpus elkészült;
- tolerance profile validált;
- benchmark eredmény PASS;
- mérési típusonként külön acceptance van;
- AI detection és deterministic geometry accuracy nincs összekeverve.

### 14.5 RG-VENDOR

Külső TakeOff vendor production go-live csak akkor engedélyezett, ha:

- friss RFI;
- ToS/jogi ellenőrzés;
- GDPR/security check;
- pilot benchmark;
- vendor lock-in elemzés;
- költségmodell.

### 14.6 RG-COMMERCIAL

Fizetős ügyfél élesítése csak akkor engedélyezett, ha:

- jogi dokumentumok minimum elérhetők;
- adatkezelési tájékoztató;
- ÁSZF vagy pilot szerződés;
- impresszum/contact;
- manuális számlázási folyamat;
- trial activation folyamat;
- support/contact folyamat;
- limitations statement.

---

## 15. P0 acceptance criteria

| ID | Acceptance criterion | Gate |
|---|---|---|
| AC-MVP-001 | Scope Freeze v2.0 validálva | BLOCKING |
| AC-MVP-002 | Writable GitHub remote + starting SHA rögzítve | BLOCKING |
| AC-MVP-003 | Baseline build/typecheck/lint ismert | BLOCKING |
| AC-MVP-004 | Pre-existing failures registry elkészült | BLOCKING |
| AC-MVP-005 | Auth/pilot access működik | BLOCKING |
| AC-MVP-006 | Project create/open működik | BLOCKING |
| AC-MVP-007 | PDF upload/view működik | BLOCKING |
| AC-MVP-008 | XLSX upload/import működik | BLOCKING |
| AC-MVP-009 | Scale confirmation működik | BLOCKING |
| AC-MVP-010 | Scale nélküli dimenziós export blokkol | BLOCKING |
| AC-MVP-011 | Polygon/polyline/count működik | BLOCKING |
| AC-MVP-012 | Canonical SI recompute működik | BLOCKING |
| AC-MVP-013 | Human review működik | BLOCKING |
| AC-MVP-014 | AI proposal nem self-approve-olható | BLOCKING |
| AC-MVP-015 | Manual BOQ/Költségvetés mapping működik | BLOCKING |
| AC-MVP-016 | Unit mismatch nem auto-final | BLOCKING |
| AC-MVP-017 | >5% quantity deviation review required | BLOCKING |
| AC-MVP-018 | Review queue működik | BLOCKING |
| AC-MVP-019 | XLSX export megnyílik és lineage-et tartalmaz | BLOCKING |
| AC-MVP-020 | AI Foundation forrásolt és bizonytalanságot jelöl | BLOCKING |
| AC-MVP-021 | Report v0.1 csak DRAFT/HUMAN REVIEW státuszban jelenik meg | BLOCKING |
| AC-MVP-022 | Public/private AI boundary működik | BLOCKING |
| AC-MVP-023 | Landing/trial/login/lead flow működik | BLOCKING |
| AC-MVP-024 | Nincs kitalált ár, social proof vagy accuracy claim | BLOCKING |
| AC-MVP-025 | 3 pilot projektből legalább 2 sikeres golden path | BLOCKING |
| AC-MVP-026 | Known limitations dokumentálva | BLOCKING |
| AC-MVP-027 | GO/NO-GO release report elkészült | BLOCKING |

---

## 16. Fejlesztési költség és finanszírozási szabály

### 16.1 Költség nem release bizonyíték

AI-előfizetés vagy cloud szolgáltatás aktiválása nem jelenti azt, hogy a termék fejlesztése validált.

Költséget csak gate után indokolt vállalni.

### 16.2 Finanszírozási gate-ek

| Gate | Mikor | Mit lehet fizetni? |
|---|---|---|
| FIN-0 | Scope Freeze v2.0 előtt | Sem jelentős új költés |
| FIN-1 | Scope Freeze + writable repo + baseline után | AI fejlesztői eszközök |
| FIN-2 | Foundation PASS után | Supabase/DB szükség szerint |
| FIN-3 | Golden path közelében | Runtime AI API keret |
| FIN-4 | Staging előtt | Railway/staging |
| FIN-5 | Pilot GO után | Tartós havi infrastructure |

### 16.3 Tiltott pénzügyi döntések

Tilos:

- minden előfizetést vakon elindítani validált baseline nélkül;
- vendor/API költséget release blocker nélkül növelni;
- payment rendszert beépíteni a 3 hetes MVP-be;
- marketingköltséget technikai GO előtt indítani;
- Kreo/Kamai költséget P0-ban kötelezőként kezelni.

---

## 17. Repository és fejlesztési governance

### 17.1 GitHub szabály

A fejlesztés csak akkor indulhat, ha:

- a repository írható;
- minden MérnökSzem baseline commit pusholva van;
- az induló branch és SHA dokumentált;
- dirty working tree nincs;
- minden agent tudja, melyik branch-en dolgozik.

### 17.2 Worktree szabály

Maximum párhuzamos munkaterületek:

1. `core-foundation`;
2. `measurement-boq`;
3. `public-gtm-ai-foundation`.

Ezeknél több párhuzamos agent munka csak külön engedéllyel.

### 17.3 Agent futási szabály

Minden AI fejlesztési futás köteles leadni:

- task ID;
- starting SHA;
- final SHA;
- branch;
- files changed;
- implemented scope;
- not implemented scope;
- tests run;
- build/typecheck/lint státusz;
- pre-existing failures;
- new regressions;
- security impact;
- acceptance PASS/FAIL;
- blockers;
- GO/CONDITIONAL_GO/NO_GO.

---

## 18. Public GTM határok

### 18.1 P0 public pages

Kötelező route-ok:

```text
/
 /csomagok
 /belepes
 /app/...
```

### 18.2 Commercial P0

Kötelező:

- trial lead;
- demo lead;
- contact lead;
- csomagok bemutatása;
- login entry;
- legal/contact links;
- analytics hooks provider nélkül.

Tilos:

- Stripe;
- recurring billing;
- coupons;
- plan upgrades;
- invoicing;
- automatikus subscription provisioning.

### 18.3 Pricing

Tilos kitalált árakat megjeleníteni.

Megengedett:

- `Ár hamarosan`;
- `Egyedi ajánlat`;
- `Érdeklődöm`;
- `Demó kérése`;
- `Ingyenes próba`.

---

## 19. Marketing állítások szabálya

### 19.1 Engedélyezett állítások

Megengedett:

- „AI-támogatott építőipari döntéstámogatás”;
- „manual quantity takeoff támogatás”;
- „költségvetési mennyiségek összevetése”;
- „emberi review-val ellenőrzött workflow”;
- „forrásolt AI válaszok”;
- „kontrollált pilot verzió”.

### 19.2 Tiltott állítások

Tilos:

- „automatikusan pontos mennyiségszámítás”;
- „95–96% pontosság”;
- „minden tervtípust kezel”;
- „mérnök helyett dönt”;
- „teljes ERP”;
- „teljes ÉPOS”;
- „production-ready AI takeoff engine”;
- „jogi/műszaki felelősségvállalás”;
- fake testimonials;
- fake customer logos;
- fake ROI;
- fake social proof.

---

## 20. Adatvédelmi és security minimum

P0-ban kötelező:

- project data private by default;
- AI secret csak server oldalon;
- public support nem fér hozzá private project data-hoz;
- file upload validation;
- controlled CORS;
- audit log critical actions;
- raw PDF/content nem kerül indokolatlanul logba;
- environment variables dokumentálva;
- user/project scoping validált.

---

## 21. Pilot release definíció

A 21. napon a megfelelő release név:

```text
MérnökSzem Controlled Pilot MVP
```

Nem használható release név:

```text
MérnökSzem Production SaaS
MérnökSzem v1.0 Full Platform
MérnökSzem AI TakeOff Production Engine
Projektelőkészítő AI Report Engine v1.0
```

---

## 22. Pilot validáció

Minimum 3 projektminta:

| Pilot | Projektjellemző | Cél |
|---|---|---|
| Pilot A | egyszerű, kevés dokumentum | golden path bizonyítás |
| Pilot B | közepes, több tétel | normál ügyfélhasználat |
| Pilot C | problémás/hiányos/eltérő | review és AI uncertainty bizonyítása |

Release feltétel:

- legalább 2/3 pilot projekt golden path PASS;
- a harmadiknál legfeljebb dokumentált non-blocking limitation;
- P0 blocker nem maradhat nyitva.

---

## 23. Change control

Scope freeze után bármelyik alábbi változás Change Request:

- új P0 funkció;
- meglévő P0 funkció kivétele;
- adatmodell breaking change;
- API breaking change;
- acceptance criterion változás;
- Report v0.1 → v1.0 átminősítés;
- payment hozzáadása;
- vendor dependency hozzáadása;
- AI write-tool hozzáadása;
- benchmark/accuracy claim módosítása.

Minimum Change Request tartalom:

1. Change ID;
2. üzleti ok;
3. user value;
4. érintett workflow;
5. érintett adatmodell/API;
6. teszt hatás;
7. effort becslés;
8. schedule impact;
9. cost impact;
10. security/legal impact;
11. decision owner;
12. explicit approval.

---

## 24. Végleges P0/P1 döntési táblázat

| Funkció | Státusz |
|---|---|
| Projekt létrehozás | P0 |
| PDF upload/view | P0 |
| Scale confirmation | P0 |
| Manual polygon/polyline/count | P0 |
| Canonical SI recompute | P0 |
| Measurement review | P0 |
| XLSX költségvetés import | P0 |
| Manual mapping | P0 |
| Quantity discrepancy | P0 |
| Review Queue | P0 |
| XLSX export | P0 |
| AI Assistant Foundation | P0 |
| Projektelőkészítő Riport v0.1 Draft | P0 |
| Landing / Trial / Login / Lead | P0 |
| Public AI Support Beta | P0 optional / non-core blocker |
| PDF report | P1 |
| DOCX report | P1 |
| Projektelőkészítő AI Report Engine v1.0 | P1 / 8–12 hét |
| Káldi/Szitamajor feletti minőség | V1.0 release blocker |
| AI geometry proposal | P1 |
| MCP write tools | P1 |
| Kreo/Kamai adapter | P1/P2 |
| Online payment | P1 |
| Multi-user enterprise RBAC | P1/P2 |
| Teljes ÉPOS | P2/Later |
| Teljes ERP | OOS |

---

## 25. Fejlesztési indítási döntés

A fejlesztés akkor indítható, ha az alábbiak PASS:

```text
START-GATE-001 Scope Freeze v2.0 FINAL accepted
START-GATE-002 writable GitHub remote exists
START-GATE-003 canonical base SHA recorded
START-GATE-004 upstream OpenTakeoff SHA frozen
START-GATE-005 current repo builds or failures are documented
START-GATE-006 pre-existing failure registry exists
START-GATE-007 3 pilot project packages selected
START-GATE-008 API/cost cap defined
START-GATE-009 no unresolved P0 contradiction remains
START-GATE-010 Product Owner explicitly approves controlled pilot framing
```

Ha bármelyik FAIL:

```text
NO-GO
```

---

## 26. Záró formális döntés

### 26.1 Frozen product

```text
MérnökSzem Controlled Pilot MVP
```

### 26.2 Frozen release objective

```text
Auditable PDF → manual measurement → human review → XLSX cost schedule comparison → review queue → AI foundation / report draft → XLSX export → source traceback
```

### 26.3 Frozen AI decision

```text
P0: AI Assistant Foundation + Projektelőkészítő Riport v0.1 Draft
P1: Projektelőkészítő AI Report Engine v1.0
```

### 26.4 Frozen quality decision

```text
Projektelőkészítő AI Report Engine v1.0 must be measurably better than the Káldi/Szitamajori benchmark report.
```

### 26.5 Frozen release label

```text
Controlled Pilot MVP
```

### 26.6 Frozen commercial decision

```text
No online payment in P0.
Manual invoice / transfer / access activation.
```

### 26.7 Frozen vendor decision

```text
No external TakeOff vendor production dependency in P0.
Kreo/Kamai optional post-MVP benchmark only.
```

### 26.8 Frozen accuracy decision

```text
No public accuracy percentage claim before validated benchmark and tolerance profile.
```

### 26.9 Final status

```text
SCOPE STATUS: FROZEN v2.0 FINAL
DEVELOPMENT START: AUTHORIZED ONLY AFTER START GATE PASS
3-WEEK TARGET: CONTROLLED PILOT MVP
REPORT ENGINE V1.0: SEPARATE 8–12 WEEK QUALITY PROGRAM
```

---

**END OF DOCUMENT**
