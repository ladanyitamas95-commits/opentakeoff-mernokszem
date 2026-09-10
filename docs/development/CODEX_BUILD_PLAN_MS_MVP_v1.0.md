# CODEX_BUILD_PLAN_MS_MVP_v1.0

**Projekt:** MérnökSzem MVP  
**Cél:** 5 órás Codex fejlesztési sessionökre bontott build plan  
**Dátum:** 2026-09-10  
**Státusz:** v1.0 munkaverzió  

## 1. Alapelv

Codex nem kap homályos utasítást, például: "építsd meg a MérnökSzem MVP-t".

Codex mindig egy konkrét, lezárható feladatot kap:

- egy cél;
- korlátozott fájl- és modulscope;
- explicit tiltólista;
- acceptance criteria;
- tesztelési elvárás;
- rövid záró riport.

## 2. Globális fejlesztési szabály

Minden session maximum 5 óra.

Ha a session végén valami nincs kész:

- nem kell pánikszerűen összedrótozni;
- nem kell scope-ot bővíteni;
- a részállapotot commitolhatóan vagy dokumentáltan kell lezárni;
- a blokkoló pontokat `BLOCKED_DECISIONS.md` vagy `KNOWN_ISSUES.md` fájlba kell írni.

## 3. Globális tiltólista minden sessionre

Codex ne építsen:

- NAV szinkront;
- automatikus számlázást;
- TIG workflow-t;
- HR-t;
- flottát;
- teljes szerződésmodult;
- partnerportált;
- teljes RFQ/bid rendszert;
- ÉNGY production automappinget;
- autonóm, ember nélküli AI takeoffot;
- új arculatot validált brandbook nélkül.

## 4. Session sablon

```text
Feladat: MS-MVP-Sxx – [session neve]

Időkeret: maximum 5 óra.

Cél:
[egy mondat]

Érintett modulok:
- [mappák/fájlok]

Forrásfájlok:
- CODEX_INPUT_PACK_INDEX_v1.0.md
- CODEX_BUILD_PLAN_MS_MVP_v1.0.md
- MS_MVP_FINAL_SCOPE_LOCK_v1.0.md
- [aktuális további fájl]

Implementálandó:
- [konkrét lista]

Out-of-scope:
- [konkrét lista]

Acceptance criteria:
- [tesztelhető lista]

Teszt:
- [parancsok vagy manuális ellenőrzés]

Végén add meg:
- módosított fájlok
- futtatott tesztek
- ismert limitációk
- következő ajánlott session
```

## 5. MS-MVP-S00 – Repo audit és baseline

**Cél:** a meglévő repository futtatható, dokumentált baseline állapotának rögzítése.

Érintett modulok:

- repo root;
- `README_DEV.md`;
- `KNOWN_ISSUES.md`;
- `docs/adr/ADR-000-baseline.md`.

Implementálandó:

- függőségek feltérképezése;
- dev szerver indítási parancsok dokumentálása;
- backend/frontend meglétének ellenőrzése;
- tesztparancsok azonosítása;
- ismert hibák listázása.

Out-of-scope:

- új feature;
- UI redesign;
- adatmodell átalakítás.

Acceptance criteria:

- `README_DEV.md` tartalmazza az indítási parancsokat;
- `KNOWN_ISSUES.md` létrejön;
- baseline ADR létrejön;
- Codex leírja, mi futott és mi nem.

Teszt:

- telepítési parancsok futtatása;
- dev szerver indítás, ha lehetséges;
- meglévő tesztek futtatása.

## 6. MS-MVP-S01 – Project Core

**Cél:** projekt létrehozás, listázás és alap workspace.

Érintett modulok:

- `backend/app/projects/`;
- `backend/app/audit/`;
- `web/src/features/projects/`.

Implementálandó:

- `Project` modell;
- `POST /projects`;
- `GET /projects`;
- `GET /projects/{project_id}`;
- frontend projektlista;
- új projekt modal;
- audit event projekt létrehozáskor.

Acceptance criteria:

- UI-ból új projekt hozható létre;
- projektlista frissítés után is működik;
- üres név validációt kap;
- API teszt lefut.

## 7. MS-MVP-S02 – Document Upload

**Cél:** PDF és XLSX dokumentum feltöltése projekthez.

Érintett modulok:

- `backend/app/documents/`;
- `web/src/features/documents/`;
- storage adapter.

Implementálandó:

- `Document` modell;
- file hash;
- fájltípus validáció;
- `POST /projects/{project_id}/documents`;
- dokumentumlista UI;
- upload státuszok.

Acceptance criteria:

- PDF feltölthető;
- XLSX feltölthető;
- hibás fájltípus elutasítva;
- audit event készül;
- duplikált hash legalább jelölhető.

## 8. MS-MVP-S03 – PDF Page Extraction és Viewer

**Cél:** feltöltött PDF lapokra bontása és tervlap megjelenítése.

Érintett modulok:

- `backend/app/documents/`;
- `web/src/features/takeoff/`;
- PDF.js integráció.

Implementálandó:

- `DocumentPage` modell;
- oldalszám és page metadata;
- frontend PDF viewer;
- oldalválasztó;
- zoom/pan.

Acceptance criteria:

- többoldalas PDF oldalai listázódnak;
- kiválasztott oldal renderel;
- feldolgozási hiba UI-ban látszik;
- nagyobb PDF nem fagyasztja meg a teljes UI-t.

## 9. MS-MVP-S04 – Scale Calibration

**Cél:** lépték rögzíthető, jóváhagyható és blokkoló validációként használható.

Érintett modulok:

- `backend/app/takeoff/scale`;
- `backend/app/validation/`;
- `web/src/features/takeoff/ScaleReview`.

Implementálandó:

- `ScaleCalibration` modell;
- scale creation API;
- scale confirm/reject API;
- manual scale UI;
- validation gate dimenzionális mérésekhez.

Acceptance criteria:

- scale menthető;
- scale jóváhagyható;
- scale nélkül hossz/terület export blokkol;
- minden scale döntés auditált.

## 10. MS-MVP-S05 – Geometry + SI Calculation Engine

**Cél:** szerveroldali SI geometriai számítás polygon, polyline és count esetén.

Érintett modulok:

- `backend/app/geometry/`;
- `backend/tests/test_geometry.py`.

Implementálandó:

- normalized coordinate schema;
- polygon area;
- polyline length;
- point count;
- scale alkalmazás;
- Decimal vagy nagy pontosságú számítás;
- unit test készlet.

Acceptance criteria:

- legalább 10 ismert tesztgeometria lefut;
- kliens által küldött számított mennyiség nem authoritative;
- szerver újraszámol.

## 11. MS-MVP-S06 – Manual Takeoff Canvas

**Cél:** felhasználó mérést tud rajzolni és menteni.

Érintett modulok:

- `web/src/features/takeoff/`;
- `backend/app/takeoff/measurements`.

Implementálandó:

- polygon eszköz;
- polyline eszköz;
- count marker;
- measurement create/update;
- draft/review/accepted/rejected státusz.

Acceptance criteria:

- polygonból m² számolódik;
- polyline-ból m számolódik;
- count marker db-t ad;
- szerkesztés után újraszámol;
- accept/reject működik.

## 12. MS-MVP-S07 – Rule Engine P0

**Cél:** minimális determinisztikus rule engine.

Érintett modulok:

- `backend/app/rules/`;
- `backend/app/quantities/`.

Implementálandó:

- rule envelope;
- rule registry;
- padlóterület rule;
- falhossz rule;
- falfelület rule;
- Q1/Q2 elkülönítés.

Acceptance criteria:

- minden Q2 érték rule_id-hez kötött;
- rule nélkül nincs technical quantity;
- legalább 3 rule unit teszttel lefedve.

## 13. MS-MVP-S08 – Validation + Review Queue

**Cél:** validációs findings és review queue.

Érintett modulok:

- `backend/app/validation/`;
- `backend/app/confidence/`;
- `web/src/features/review/`.

Implementálandó:

- `ValidationFinding`;
- validation runner;
- review queue API;
- review queue UI;
- blocking/non-blocking findings.

Acceptance criteria:

- missing scale ERROR;
- unit mismatch ERROR;
- low confidence REVIEW;
- blocking finding exportot tilt.

## 14. MS-MVP-S09 – BOQ Import

**Cél:** XLSX BOQ import oszlopmappinggel.

Érintett modulok:

- `backend/app/boq/`;
- `web/src/features/boq/`.

Implementálandó:

- `BOQ`;
- `BOQItem`;
- XLSX parser;
- import preview;
- column mapping;
- hibás sorok listázása.

Acceptance criteria:

- legalább egy magyar költségvetés XLSX importálható;
- eredeti sorindex megmarad;
- hibás sorok nem vesznek el;
- import auditált.

## 15. MS-MVP-S10 – BOQ Compare

**Cél:** accepted measurement és BOQ item összevetése.

Érintett modulok:

- `backend/app/boq/compare`;
- `web/src/features/boq/CompareView`.

Implementálandó:

- manual measurement -> BOQItem mapping;
- unit check;
- absolute deviation;
- percentage deviation;
- threshold warning.

Acceptance criteria:

- eltérés mértékegységgel és %-kal látszik;
- unit mismatch blokkol;
- uncertain mapping review queue-ba kerül.

## 16. MS-MVP-S11 – XLSX Export

**Cél:** auditálható Excel export.

Érintett modulok:

- `backend/app/exports/`;
- `web/src/features/exports/`.

Export lapok:

- `Project Summary`;
- `Measurements`;
- `BOQ Compare`;
- `Validation Findings`;
- `Audit Trail`;
- `Sources`.

Acceptance criteria:

- csak accepted/human_verified measurement exportálható approvedként;
- blocking validation esetén export nem indul;
- Excel megnyitható;
- minden export sor forrást tartalmaz.

## 17. MS-MVP-S12 – Chat Support MVP

**Cél:** projektkontextusú support és mérnöki magyarázó chat.

Érintett modulok:

- `backend/app/chat/`;
- `backend/app/agents/`;
- `web/src/features/chat/`.

Implementálandó:

- `ChatMessage`;
- `/chat/message`;
- intent classification;
- export blokk magyarázata;
- BOQ eltérés magyarázata;
- structured response schema.

Acceptance criteria:

- megmondja, mi blokkolja az exportot;
- elmagyarázza a BOQ eltérést;
- nem fogad el mérést ember helyett;
- structured response-t ad.

## 18. MS-MVP-S13 – AI Proposal Adapter

**Cél:** AI-javaslatok egységes proposal contractja.

Érintett modulok:

- `backend/app/agents/`;
- `backend/app/takeoff/proposals`;
- `web/src/features/review/`.

Implementálandó:

- `AgentProposal`;
- proposal batch;
- accept/edit/reject;
- original geometry megőrzése;
- human_verified csak emberi művelettel.

Acceptance criteria:

- AI proposal soha nem accepted automatikusan;
- edit után eredeti agent geometry megmarad;
- minden döntés auditált.

## 19. MS-MVP-S14 – Regression Corpus

**Cél:** ground truth és regressziós teszt minimum.

Érintett fájlok:

- `MS_MVP_REGRESSION_CORPUS_MANIFEST_v1.0.md`;
- `docs/regression/`;
- `docs/sample-data/`.

Implementálandó:

- corpus manifest;
- mintaterv lista;
- expected quantities;
- tolerance mezők;
- QA checklist.

Acceptance criteria:

- minden sample azonosított;
- nincs kitalált expected value;
- hiányzó ground truth `TBD`;
- release előtt lefuttatható checklist.

## 20. Ajánlott első 5 Codex futás

Ha most nulláról vagy félkész repo állapotból indul a fejlesztés, az első sorrend:

1. `MS-MVP-S00` – Repo audit és baseline.
2. `MS-MVP-S01` – Project Core.
3. `MS-MVP-S02` – Document Upload.
4. `MS-MVP-S03` – PDF Page Extraction és Viewer.
5. `MS-MVP-S04` – Scale Calibration.

Csak ezután érdemes mérőeszközöket és BOQ összevetést építeni.

## 21. Kérdéslista

1. A meglévő repo milyen stacken áll most pontosan?
2. Van-e működő backend, vagy csak frontend preview?
3. A fejlesztés OpenTakeoff forkból indul vagy új MérnökSzem repo lesz?
4. Van-e már PostgreSQL setup, vagy Codex scaffoldolja?
5. A 5 órás Codex futások végén kötelező legyen-e commit?
6. Milyen branch naming szabály legyen?
7. Ki végzi a manuális acceptance ellenőrzést?
8. Mikor tekinthető egy session sikertelennek?
