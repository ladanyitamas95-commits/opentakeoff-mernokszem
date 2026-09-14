# MS_MVP_CANONICAL_DEVELOPMENT_PLAN_v1.0

**Projekt:** MérnökSzem MVP
**Dokumentum típusa:** Kanonikus fejlesztési terv / Master Development Baseline
**Verzió:** 1.0
**Dátum:** 2026-09-12
**Státusz:** FINAL / CANONICAL BASELINE
**Elsődleges célközönség:** senior fejlesztő, AI coding agent, product owner, solution architect, QA engineer
**Elsődleges implementációs alap:** OpenTakeoff adaptáció + saját MérnökSzem domainréteg
**Termékfilozófia:** human-in-the-loop, auditálható, SI-alapú mérnöki döntéstámogatás

---

# 0. Dokumentum célja

Ez a dokumentum a MérnökSzem MVP teljes, egységes és kanonikus fejlesztési terve.

A dokumentum célja, hogy:

1. egyetlen elsődleges fejlesztési referenciát adjon bármely emberi vagy AI-fejlesztő számára;
2. feloldja a korábbi specifikációk közötti scope-, architektúra- és terminológiai eltéréseket;
3. rögzítse a kötelező domain-invariánsokat;
4. rögzítse az MVP funkcionális és technikai határait;
5. meghatározza a rendszer komponenseit, adatmodelljét, workflow-jait és minőségi kapuit;
6. biztosítsa, hogy a fejlesztő AI ne találjon ki hiányzó szakmai vagy termékdöntést;
7. lehetővé tegye a kontrollált, párhuzamos, több-agent fejlesztést;
8. egyértelmű Definition of Done feltételeket biztosítson az MVP release-hez.

Ez a dokumentum **nem helyettesíti** az alacsonyabb szintű API-, adatbázis-, rule- és regression-specifikációkat, hanem azok kanonikus keretét adja.

---

# 1. Normatív kulcsszavak

- **MUST / KÖTELEZŐ:** implementálandó vagy betartandó.
- **MUST NOT / TILOS:** nem implementálható vagy nem sérthető meg.
- **SHOULD / AJÁNLOTT:** alapértelmezett döntés; eltérés csak dokumentált indokkal.
- **MAY / LEHET:** opcionális.
- **P0:** MVP release-kritikus.
- **P1:** csak stabil P0 után.
- **REFERENCE_ONLY:** referenciaként használható, authoritative üzleti szabályként nem.
- **AUTHORITATIVE:** elsődleges és kötelező érvényű forrás.
- **CANONICAL:** a MérnökSzem rendszerben használt normalizált, belső igazságmodell.
- **HITL:** human-in-the-loop.
- **Q1:** geometriai mennyiség.
- **Q2:** szabályalapú műszaki mennyiség.

---

# 2. Forrásprioritás és konfliktusfeloldás

## 2.1 Authority Level A — termékszerződés

1. `MS_MVP_FINAL_SCOPE_LOCK_v1.0.md`
2. `MS_MVP_SCREEN_SPEC_v1.0.md`
3. `MérnökSzem TakeOff – AI-Assisted Falhossz- és Területmérés Funkcionális Specifikáció v0.2.md`
4. jelen dokumentum: `MS_MVP_CANONICAL_DEVELOPMENT_PLAN_v1.0.md`

A jelen dokumentum a korábbi A-szintű forrásokból összeállított, konfliktusokat feloldó master terv.

## 2.2 Authority Level B — technikai architektúra

- `MS_MernokSzem_MVP_integracios_terv_v1.0.md`
- `CODEX_BUILD_PLAN_MS_MVP_v1.0.md`
- `MS_MVP_REGRESSION_CORPUS_MANIFEST_v1.0.md`
- `CODEX_INPUT_PACK_INDEX_v1.0.md`
- repository auditok, ADR-ek és domain contract registry

## 2.3 Authority Level C — domain/IP tudás

- PRJ-001 ÉPOS Knowledge Package
- ÉPOS Knowledge Harvest
- Építőipari Audit Asszisztens specifikációk
- PRJ-002 Global Technology Partner Research

Ezekből csak olyan elemek emelhetők át P0-ba, amelyek nem bővítik a scope-ot, hanem auditálhatóságot, source/evidence kezelést, canonical adatmodellt vagy adapter-patternöket erősítenek.

## 2.4 Authority Level D — referenciaadat

A QTO Excel-sablonok:

- `Architectural_QTO_HU.xlsx`
- `Civil_Quantity_Take_off_HU.xlsx`
- `Electrical_Quantity_Take_off_HU.xlsx`
- `HVAC_Quantity_Take_off_HU.xlsx`
- `Plumbing_Quantity_Take_off_HU.xlsx`

felhasználhatók taxonomy referenciaként, XLSX parser fixture-ként, import/export UX kialakítására, assembly-struktúra mintaként és regression tesztinputként.

**TILOS** ezeket magyar mérnöki norma, fajlagos vagy szabály authoritative forrásaként kezelni.

## 2.5 Authority Level E — fejlesztési chat history

A fejlesztési chat-exportok döntési előzményt adnak, de nem production specificationök.

## 2.6 Konfliktusfeloldási szabály

Ha két forrás ellentmond:

1. jelen dokumentum;
2. Authority Level A;
3. Authority Level B;
4. Authority Level C;
5. Authority Level D;
6. chat history.

Ha a konfliktus ezen hierarchiával nem oldható fel, a fejlesztő **MUST NOT** improvizálni. Az esetet rögzíteni kell a `BLOCKED_DECISIONS.md` fájlban.

---

# 3. Termékdefiníció

> **A MérnökSzem MVP egy PDF-alapú, magyar nyelvű, SI-mértékegységű, auditálható mennyiségfelmérő és BOQ-ellenőrző mérnöki webalkalmazás, amelyben az AI javaslatot adhat, de mérnöki eredményt emberi jóváhagyás nélkül nem véglegesíthet.**

A felhasználó képes projektet létrehozni, tervet feltölteni, léptéket jóváhagyni, kézzel mérni, javaslatokat ellenőrizni, mérést elfogadni/szerkeszteni/elutasítani, BOQ XLSX-et importálni, mennyiséget összevetni, hibákat kezelni, auditálható exportot készíteni és projektkontextusú AI magyarázatot kérni.

---

# 4. MVP scope

## 4.1 P0 kötelező funkciók

| Funkció | P0 | Megjegyzés |
|---|---:|---|
| Projekt létrehozás | Igen | Minimális projektadat |
| Projektlista | Igen | Megnyitás, státusz |
| PDF feltöltés | Igen | Drawing |
| XLSX feltöltés | Igen | BOQ |
| PDF viewer | Igen | OpenTakeoff/PDF.js adaptáció |
| Oldalválasztás | Igen | Többoldalas PDF |
| Zoom/pan | Igen | |
| Lépték rögzítés | Igen | Manuális |
| Scale confirmation | Igen | Dimenzionális gate |
| Polygon mérés | Igen | Terület |
| Polyline mérés | Igen | Falhossz |
| Count marker | Igen | Darabszám |
| Falfelület | Igen | Hossz × explicit magasság - explicit nyílás |
| Szerver/domain SI számítás | Igen | Frontend nem authoritative |
| Rule Engine minimum | Igen | P0 measurement rules |
| Q1/Q2 elkülönítés | Igen | |
| Measurement Review | Igen | Accept/Edit/Reject |
| Validation Engine | Igen | |
| Review Queue | Igen | |
| BOQ Import | Igen | XLSX |
| BOQ Compare | Igen | Manual mapping |
| XLSX Export | Igen | Auditálható |
| Audit Trail | Igen | Minden mutáció |
| Chat Support MVP | Igen | Projektkontextus |
| Browser smoke/E2E | Igen | Release gate |
| Regression corpus | Igen | Release gate |

## 4.2 P0 mérési kategóriák

Implementációs prioritás:

```text
AREA
  ↓
WALL_LENGTH
  ↓
COUNT
  ↓
WALL_AREA
```

### AREA
- unit: `m²`
- input: polygon
- optional holes/deductions
- confirmed scale szükséges

### WALL_LENGTH
- unit: `m`
- input: polyline
- measurement reference kötelező
- confirmed scale szükséges

### COUNT
- unit: `db`
- input: point markers
- scale nem szükséges

### WALL_AREA
- unit: `m²`
- input: accepted wall length + explicit wall height - explicit deductions
- height nem következtethető automatikusan
- Q2 measurement rule kötelező

## 4.3 P1

Csak stabil P0 után:

- AI geometry proposal adapter;
- assisted room/wall detection;
- seed-based symbol sweep;
- automatikus BOQ column suggestion;
- egyszerű material recipe;
- revision overlay;
- dense table mode;
- marked PDF finomítás.

---

# 5. Explicit OUT OF SCOPE

Az MVP-be **TILOS** beépíteni:

- teljes ERP;
- NAV;
- számlázás;
- TIG;
- HR;
- flotta;
- partnerportál;
- supplier portal;
- teljes RFQ;
- teljes ártükör;
- ÉNGY automapping;
- procurement engine;
- vendor scoring;
- teljes ÉPOS;
- teljes Audit Asszisztens;
- IFC/DWG production pipeline;
- BIM takeoff;
- automatikus vasalásfelismerés;
- univerzális szerkezetfelismerés;
- automatikus nyílászáró-konszignáció;
- minden szakági automatikus classification;
- ember nélküli AI acceptance;
- teljes enterprise RBAC;
- mobil-first UX;
- dark mode P0;
- microservice decomposition;
- új PDF renderer;
- saját táblázatfájl-formátum.

---

# 6. Canonical rendszerarchitektúra

## 6.1 Alapelv

Az MVP **moduláris monolit**, nem microservice-rendszer.

```text
┌──────────────────────────────────────────────┐
│               MÉRNÖKSZEM WEB                │
│ Project / Viewer / Takeoff / BOQ / Review    │
│ Export / Assistant                           │
└────────────────────┬─────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────┐
│              APPLICATION CORE                │
│ Project / Document / Scale / Measurement     │
│ Rules / Validation / Review / BOQ            │
│ Export / Audit / Assistant                   │
└────────────┬─────────────────┬───────────────┘
             │                 │
             ▼                 ▼
     Persistence Layer    Adapter Layer
                              │
               ┌──────────────┼──────────────┐
               ▼              ▼              ▼
         OpenTakeoff      AI Provider   Future Engines
```

## 6.2 Függőségi szabály

A core domain **MUST NOT** függjön:

- OpenTakeoff belső state shape-től;
- konkrét LLM providertől;
- vendor engine payloadtól;
- konkrét Excel cella-layouttól.

Az adapterek függhetnek a core contractoktól. A core nem függhet az adapterektől.

---

# 7. OpenTakeoff újrafelhasználási stratégia

## 7.1 ADAPT

- PDF.js viewer;
- oldalkezelés;
- zoom/pan;
- line/polyline/polygon drawing;
- count;
- deductions;
- normalized geometry;
- canvas interaction;
- scale UX;
- export helper-ek;
- releváns geometry fixture-k;
- MCP minták belső fejlesztői/test adapterként.

## 7.2 REPLACE / BUILD OWN

Nem authoritative-ként használandó:

- imperial internal quantity authority;
- browser-only persistence;
- browser AI secret;
- vendor-specific shape model;
- automatikus accepted AI shape;
- OpenTakeoff export-model mint domainmodell.

## 7.3 Tiltás

**Új PDF viewer írása tilos**, amíg a meglévő OpenTakeoff/PDF.js komponens adaptálható.

---

# 8. Fizikai geometria és mérési geometria

## 8.1 Invariáns

```text
PHYSICAL_GEOMETRY != MEASUREMENT_GEOMETRY
```

## 8.2 Wall measurement reference

```text
CENTERLINE
INNER_FACE
OUTER_FACE
SIDE_A_FACE
SIDE_B_FACE
BOUNDARY
CUSTOM_LINE
```

## 8.3 Nincs univerzális default

Ha a mérési policy nem egyértelmű:

```text
MEASUREMENT_RULE_REQUIRED
```

A rendszer **MUST NOT** csendben választani.

---

# 9. Q1 / Q2 modell

## 9.1 Q1

```text
Q1 = geometry + confirmed scale
```

Példák: polygon → m², polyline → m, point markers → db.

## 9.2 Q2

```text
Q2 = Q1 + measurement rule + explicit parameters + deduction policy
```

Példa:

```text
wall_area = accepted_wall_length × explicit_height - explicit_opening_deductions
```

## 9.3 Kritikus invariáns

Q2 **MUST NOT** létezni `measurement_rule_id` nélkül.

---

# 10. Unit és numeric authority

Canonical unit policy:

```text
length = m
area   = m²
volume = m³
count  = db
```

Canonical érték nem lokalizált string. Helyes:

```json
{"value":"12.450000","unit":"m2"}
```

Nem helyes:

```text
"12,45 m²"
```

A formázás külön presentation/export layer. Scale, geometry, quantity, BOQ compare és export határon Decimal/fixed precision szükséges. Canonical calculationben prezentációs kerekítés nem alkalmazható.

---

# 11. Canonical domain object model

## 11.1 Project

```text
Project
- id
- name
- status
- created_at
- updated_at
```

P0: single-user pilot. A schema lehet future-role-ready.

## 11.2 Document

```text
Document
- id
- project_id
- document_type
- filename
- current_version_id
- created_at
```

## 11.3 DocumentVersion

```text
DocumentVersion
- id
- document_id
- content_hash
- mime_type
- size_bytes
- page_count
- processing_status
- created_at
```

Immutable.

## 11.4 DocumentPage

```text
DocumentPage
- id
- document_version_id
- page_index
- label
- width
- height
- rotation
- text_available
- vector_available
```

## 11.5 ScaleCalibration

```text
ScaleCalibration
- id
- page_id
- version
- method
- ratio
- unit
- evidence
- status
- confirmed_by
- confirmed_at
- rejected_at
```

Dimenzionális measurement csak confirmed scale-lel finalizálható.

## 11.6 Measurement és MeasurementRevision

`Measurement` stabil üzleti azonosító. Minden edit új revision.

Minimum revision mezők:

```text
revision_id
revision_no
measurement_id
project_id
document_version_id
page_index
geometry_type
geometry
geometry_hash
coordinate_space
scale_calibration_id
scale_snapshot
quantity_type
q1_value
q2_value
unit
measurement_rule_id
rule_version
rule_run_id
source_kind
source_run_id
validation_status
validation_run_id
review_state
reviewed_by
reviewed_at
review_note
parent_revision_ids
created_by
created_at
superseded_at
```

## 11.7 CoordinateSystem

Minimum canonical coordinate space:

```text
normalized_page_v1
```

## 11.8 MeasurementGeometry

```text
POINT
POLYLINE
POLYGON
MULTIPOLYGON
```

## 11.9 ValidationFinding

```text
ValidationFinding
- id
- code
- severity
- blocking
- entity_type
- entity_id
- message
- evidence_refs
- suggestion
- status
- created_at
```

## 11.10 ReviewItem

```text
ReviewItem
- id
- project_id
- entity_type
- entity_id
- review_reason
- severity
- blocking
- status
- created_at
```

## 11.11 BOQ / BOQItem

```text
BOQ
- id
- project_id
- source_document_id
- sheet_name
- import_status
- created_at
```

```text
BOQItem
- id
- boq_id
- source_row_index
- code
- description
- unit
- quantity
- unit_rate
- total
- raw_values
```

## 11.12 AuditEvent

```text
AuditEvent
- id
- actor
- action
- entity_type
- entity_id
- before_hash
- after_hash
- timestamp
- correlation_id
```

Append-only.

---

# 12. Authority model

Engedélyezett címkék:

```text
CLIENT_ONLY
SERVER_AUTHORITATIVE
SHARED
DERIVED
REFERENCE_ONLY
```

Alapelvek:

- frontend display quantity nem authoritative;
- AI proposal nem authoritative;
- accepted server/domain recompute authoritative lehet;
- reference workbook nem engineering authority;
- derived output visszavezethető canonical inputra.

---

# 13. Measurement státuszmodell

Canonical MeasurementStatus:

```text
DRAFT
AI_PROPOSED
REVIEW_REQUIRED
MEASUREMENT_RULE_REQUIRED
SCALE_REVIEW_REQUIRED
INVALID_GEOMETRY
ACCEPTED
EDITED
REJECTED
```

Külön ValidationStatus:

```text
PASS
WARNING
ERROR
REVIEW
```

A kettő nem ugyanaz az enum.

---

# 14. Human-in-the-loop modell

```text
AI result
   ↓
AI_PROPOSED
   ↓
Validation
   ↓
Human Review
 ┌─────┼─────┐
Accept Edit Reject
```

Csak explicit emberi művelet eredményezhet `ACCEPTED` állapotot.

AI **MUST NOT**:

- measurementet elfogadni;
- scale-t confirmálni;
- mérési szabályt kitalálni;
- source nélküli szakmai tényt finalizálni;
- BOQ quantity-t véglegesíteni;
- audit eventet törölni;
- hard gate-et felülírni.

---

# 15. Rule Engine

Rule type-ok:

```text
DETECTION
MEASUREMENT
VALIDATION
MAPPING
PROCUREMENT
```

P0 authoritative:

```text
MEASUREMENT
VALIDATION
```

MAPPING P0-ban szűk BOQ mapping. PROCUREMENT nem P0.

`RuleDefinition` minimum:

```text
rule_id
rule_type
version
status
jurisdiction
trade_scope
element_scope
input_schema
output_schema
applicability
precedence
operation
ambiguity_conditions
confidence_effects
authority
test_cases
owner
reviewers
change_note
content_hash
```

Lifecycle:

```text
DRAFT → REVIEW → PUBLISHED → DEPRECATED/WITHDRAWN
```

Published rule immutable.

---

# 16. Kötelező P0 measurement rules

## 16.1 Floor Net Area

```text
outer_polygon_area - sum(hole_areas)
```

Hard gate: self-intersection, invalid ring, hole outside parent, missing scale.

## 16.2 Wall Run Length

```text
polyline_length(measurement_geometry)
```

Kötelező explicit measurement reference és confirmed scale.

## 16.3 Wall Area

```text
wall_area = wall_length × height - opening_deductions
```

Height **MUST NOT** be guessed.

## 16.4 Count

```text
COUNT(marker)
```

Scale independent.

---

# 17. Validation Engine

Minimum hard gate-ek:

```text
NO_CONFIRMED_SCALE
INVALID_GEOMETRY
UNIT_MISMATCH
MISSING_MEASUREMENT_RULE
MISSING_REQUIRED_PARAMETER
MISSING_SOURCE_REFERENCE
INVALID_QUANTITY
STALE_DOCUMENT_VERSION
UNSUPPORTED_RULE_VERSION
AI_SCHEMA_INVALID
```

Blocking finding esetén:

```text
export = disabled
accepted_projection = forbidden
```

Confidence **MUST NOT** hard gate-et felülírni.

---

# 18. Confidence modell

Külön fogalom:

1. confidence;
2. validation finding;
3. review state;
4. quality metric.

Lehetséges komponensek:

```text
geometry_confidence
classification_confidence
scale_confidence
rule_confidence
document_source_confidence
```

A confidence nem bizonyított helyességi valószínűség, és a UI nem kommunikálhatja úgy.

---

# 19. Review Queue

Minimum item típusok:

- missing scale;
- AI proposal;
- low confidence;
- measurement rule missing;
- invalid geometry;
- BOQ deviation;
- unit mismatch;
- missing source reference;
- export blocking error.

Prioritás:

```text
ERROR → REVIEW → WARNING → PASS
```

Minden decision auditált.

---

# 20. BOQ Import

P0 formátum: `XLSX`.

Minimum mapping:

```text
code
description
unit
quantity
```

Optional:

```text
unit_rate
total
```

Kötelező lineage:

```text
source_file
sheet_name
original_row_index
raw_values
```

Hibás sor **MUST NOT** silently disappear.

---

# 21. QTO workbook referencia

Jellemző struktúra:

```text
Item ID
Category
Description
Unit
Drawing 1..N
Total Quantity
```

Assembly jellegű struktúra:

```text
Assembly Ref
Component
Unit
Ratio
Primary Quantity
Extended Quantity
Unit Rate
Total Cost
Trade
Note
```

Felhasználás: parser fixture, UX/reference, taxonomy, future assembly model.

Tiltás: workbook ratio, labour/material factor vagy külföldi fajlagos nem lehet authoritative HU rule.

---

# 22. BOQ Compare

Input:

```text
ACCEPTED MeasurementRevision + BOQItem
```

P0 mapping: manual.

Output:

```text
boq_quantity
measured_quantity
absolute_deviation
percentage_deviation
unit_status
review_status
source_reference
```

Initial deviation policy:

```text
abs(deviation_percent) <= 5%  → non-blocking
abs(deviation_percent) > 5%   → REVIEW_REQUIRED
```

5% feletti eltérés nem automatikus hiba. A threshold konfigurálható domain policy, nem szétszórt frontend konstans.

---

# 23. Export

P0 export:

```text
MernokSzem_Export.xlsx
```

Kötelező worksheet-ek:

1. `Project Summary`
2. `Measurements`
3. `BOQ Compare`
4. `Validation Findings`
5. `Audit Trail`
6. `Sources`

Approved outputba csak:

```text
ACCEPTED + human reviewed + non-blocking
```

measurement kerülhet.

Export provenance:

- document version;
- page;
- measurement revision;
- rule/version;
- source reference;
- validation;
- audit event.

---

# 24. Audit Trail

Auditálni kell legalább:

```text
PROJECT_CREATED
DOCUMENT_UPLOADED
DOCUMENT_PROCESSED
SCALE_PROPOSED
SCALE_CONFIRMED
SCALE_REJECTED
MEASUREMENT_CREATED
MEASUREMENT_EDITED
MEASUREMENT_ACCEPTED
MEASUREMENT_REJECTED
BOQ_IMPORTED
BOQ_MAPPING_CHANGED
EXPORT_REQUESTED
EXPORT_COMPLETED
CHAT_ACTION_SUGGESTED
```

---

# 25. AI Assistant

P0 képességek:

- programhasználati kérdés;
- projektstátusz;
- measurement státusz;
- export blocker magyarázat;
- BOQ deviation magyarázat;
- suggested action;
- target navigation.

Javasolt response contract:

```json
{
  "answer": "...",
  "blockers": [],
  "findings": [],
  "suggested_actions": [],
  "target_refs": []
}
```

Assistant jogosultság: read-heavy.

**MUST NOT** közvetlenül módosítani:

```text
Measurement
ScaleCalibration
BOQ accepted quantity
Audit history
```

AI API-key kizárólag szerveroldali.

---

# 26. External Takeoff Engine Adapter

A MérnökSzem ne függjön egyetlen vendor engine-től.

Legyen:

```text
TakeoffEngineAdapter
```

Csak canonical `TAKEOFF_ENGINE_RESULT` kerülhet core-ba. Vendor raw payload nem.

Lehetséges future engine: Kamai, Kreo, Exayard, EstimateHawk, saját detector, más kompatibilis engine.

Külső engine **nem MVP release blocker**. A manual/OpenTakeoff workflow önállóan működjön.

---

# 27. UI és screen inventory

A 12 kanonikus screen:

1. Project Home
2. Project Workspace
3. Document Upload
4. Drawing Viewer
5. Scale Review
6. Takeoff Canvas
7. Measurement Review
8. BOQ Import
9. BOQ Compare
10. Review Queue
11. Export
12. Chat Panel

Globális layout:

```text
┌────────────────────────────────────────────────────────────┐
│ TOP BAR                                                    │
├──────────────┬──────────────────────────────┬───────────────┤
│ LEFT SIDEBAR │ MAIN WORKSPACE               │ RIGHT PANEL   │
│ Projekt      │                              │ Chat          │
│ Dokumentumok │                              │ Megállapítások│
│ Mennyiségfel.│                              │ Kontextus     │
│ BOQ          │                              │               │
│ Ellenőrzés   │                              │               │
│ Export       │                              │               │
└──────────────┴──────────────────────────────┴───────────────┘
```

Responsive priority:

- 1366px desktop: kötelező;
- 1920px desktop: kötelező;
- tablet: no-break;
- mobile: nem P0.

---

# 28. Visual system

Authoritative brand:

```text
Primary Navy: #0D1B2A
Primary Gold: #C79A35
Typography: Poppins
```

Style:

- Swiss minimalism;
- high contrast;
- restrained premium;
- engineering precision;
- thin geometric line icons;
- consistent stroke;
- generous white space.

Tiltott:

- gradients;
- neon;
- glassmorphism;
- glow;
- 3D;
- heavy shadow;
- decorative effects;
- dark mode P0;
- logo recolour/distortion;
- random new palette.

---

# 29. Kötelező UI state-ek

Minden releváns screen:

```text
EMPTY
LOADING
ERROR
BLOCKED
SUCCESS
```

Blocked state mindig megnevezi a hiányzó feltételt, elmagyarázza az okot és megmutatja a következő lépést.

---

# 30. UI primitives

P0 reusable set:

```text
Button
IconButton
Input
Select
Textarea
Checkbox
Tabs
Chip
Panel
DataTableShell
Toast
Alert
Tooltip
Dialog
StatusBadge
ValidationBadge
ConfidenceBadge
EmptyState
LoadingState
ErrorState
BlockedState
```

Status soha nem csak szín. Ikon + szöveg ajánlott.

---

# 31. Security baseline

P0 minimum:

- secret nem kerül browserbe;
- AI secret server-only;
- uploaded PDF untrusted;
- MIME validation;
- size limit;
- page-count limit;
- content hash;
- timeout;
- memory limit;
- filename nem storage path;
- production CORS nem wildcard;
- source data nem system instruction;
- prompt injection elleni boundary;
- audit log secret redaction;
- dependency lockfile;
- release-time dependency/security review.

---

# 32. Licensing baseline

## OpenTakeoff
Apache-2.0. LICENSE, NOTICE és változtatási nyom kötelező.

## OpenConstructionERP
REFERENCE ONLY. Tilos source code import, service-call dependency, submodule, runtime container vagy production package dependency.

## PyMuPDF
OCE-ből production dependencyként automatikusan nem emelhető át.

## Future CI

```text
SBOM
dependency license scan
forbidden-license gate
security dependency scan
```

---

# 33. Regression corpus

MVP pilot előtt minimum:

- 3 sample project;
- 3 PDF terv;
- 2 BOQ XLSX;
- 20 validált measurement;
- 5 validált BOQ compare eset;
- 5 negatív teszt;
- 1 expected export;
- 1 manuális QA jegyzőkönyv.

Tilos expected quantity-t kitalálni. Ha nincs validálva:

```text
TBD_VALIDATION_REQUIRED
```

---

# 34. Kötelező P0 regression tesztek

```text
REG-PDF-001  PDF upload
REG-PDF-002  multi-page page count
REG-SCALE-001 manual scale confirmation
REG-SCALE-002 block without scale
REG-GEO-001 polygon area
REG-GEO-002 polyline length
REG-GEO-003 count
REG-RULE-001 floor area
REG-RULE-002 wall length
REG-RULE-003 wall area
REG-BOQ-001 XLSX import
REG-BOQ-002 unit mismatch
REG-BOQ-003 deviation
REG-EXPORT-001 XLSX export
REG-EXPORT-002 blocking finding export block
REG-CHAT-001 blocker explanation
```

---

# 35. Browser E2E / smoke

P0 release előtt minimum:

```text
Open project
Upload PDF
Render page
Switch page
Zoom/pan
Confirm scale
Draw polygon
Save measurement
Accept measurement
Import BOQ
Map measurement
Compare quantity
Open Review Queue
Export XLSX
```

5–10 stabil golden-path teszt elegendő.

---

# 36. Performance requirement

A UI:

- ne fagyjon le nagyobb PDF-től;
- feldolgozási státuszt mutasson;
- retryolható hibát támogasson;
- oldalanként rendereljen;
- ne renderelje újra szükségtelenül a teljes dokumentumot;
- hosszú background feladatot ne tartson blocking UI threaden.

---

# 37. ÉPOS integrációs határ

ÉPOS nem P0 modul.

Megőrzendő pattern: source hierarchy, technical parity, evidence, decision rules, correction register, risk patterns, knowledge objects.

Jövőbeli lánc:

```text
TakeOff → Canonical BOQ → ÉPOS → RFQ → Bid Comparison → Negotiation
```

---

# 38. Audit Asszisztens integrációs határ

P0-ba átvehető:

```text
SourceReference
ValidationFinding
Evidence
HumanReview
AuditTrail
Risk/Issue pattern
```

Nem P0: teljes design/spec audit, 12 szakági audit, RFI workflow, ajánlati audit, komplex constructability analysis.

---

# 39. Repository logikai felosztás

```text
web/
  src/
    features/
      projects/
      documents/
      viewer/
      takeoff/
      review/
      boq/
      export/
      chat/

server/
  project/
  document/
  scale/
  measurement/
  rules/
  validation/
  review/
  boq/
  export/
  chat/
  audit/

shared/
  contracts/
  schemas/
  enums/

docs/
  canonical/
  architecture/
  development/
  regression/
  generated/audits/
```

**MUST NOT** nagy refaktort indítani csak azért, hogy a mappák pontosan ezt kövessék.

---

# 40. Single-owner kritikus fájlok

```text
TakeoffCanvas.jsx
geometry.js
shapeMetrics.js
store.js
routing
shared contracts
export schema
package manifests
lockfiles
CI
DB migrations
```

Két agent egyszerre ezeket nem módosíthatja.

---

# 41. Multi-agent fejlesztési protokoll

Minden task elején:

```text
1. Verify repository.
2. Verify branch/worktree.
3. Verify HEAD.
4. Verify git status.
5. Read ONLY the 2–5 source documents needed.
6. Identify allowed files.
7. Identify forbidden files.
8. Inspect existing implementation.
9. Reuse existing code where safe.
10. Do not invent product/domain rules.
11. Implement the smallest complete vertical slice.
12. Add/update tests.
13. Run build.
14. Run typecheck.
15. Run lint.
16. Run affected tests.
17. Run relevant regression tests.
18. Separate pre-existing failures from new regressions.
19. Write implementation report.
20. Commit only passing scope.
21. STOP.
```

---

# 42. Kötelező task output

```text
TASK ID
Branch
Starting SHA
Final SHA
Implemented
Not implemented
Files changed
Tests: build/typecheck/lint/unit/integration/E2E
Pre-existing failures
New regressions
Security impact
Schema impact
API impact
Migration impact
Acceptance criteria PASS/FAIL
Known blockers
GO / CONDITIONAL_GO / NO_GO
```

---

# 43. Build wave sorrend

```text
W00   Repository baseline
 ↓
W00.5 Domain contracts
 ↓
W01   UI foundation
 ↓
W02   Project + Document
 ↓
W03   Viewer + Scale
 ↓
W04   Geometry + Manual Takeoff
 ↓
W05   Measurement Rules
 ↓
W06   Validation + Review
 ↓
W07   BOQ Import
 ↓
W08   BOQ Compare
 ↓
W09   Export
 ↓
W10   AI Assistant
 ↓
W11   Regression + Browser QA
 ↓
W12   AI Proposal Adapter
```

Az AI proposal adapter csak azután indulhat, hogy a `PDF → measurement → review → BOQ → export` lánc AI nélkül végig működik.

---

# 44. Golden Path

```text
Create project
       ↓
Upload PDF
       ↓
PDF processed
       ↓
Open page
       ↓
Confirm scale
       ↓
Draw polygon/polyline/count
       ↓
Domain recompute
       ↓
Apply rule
       ↓
Validation
       ↓
Human Accept
       ↓
Import BOQ XLSX
       ↓
Map measurement
       ↓
Compare
       ↓
Review deviations
       ↓
Ask Assistant
       ↓
Export XLSX
       ↓
Trace result back to source geometry
```

---

# 45. API baseline

A részletes OpenAPI külön fájl, de a minimum contract-család:

```text
POST /projects
GET  /projects
GET  /projects/{id}
POST /projects/{id}/documents
GET  /projects/{id}/documents
GET  /document-versions/{id}/pages
POST /pages/{id}/scale-calibrations
POST /scale-calibrations/{id}/confirm
POST /scale-calibrations/{id}/reject
POST /measurements
POST /measurements/{id}/revisions
POST /measurements/{id}/decisions
GET  /projects/{id}/review-queue
POST /projects/{id}/boq/import
POST /boq-items/{id}/measurement-mappings
GET  /projects/{id}/boq/compare
POST /projects/{id}/exports
GET  /exports/{id}
POST /projects/{id}/chat/messages
GET  /projects/{id}/audit-events
```

Invariáns: client quantity nem authoritative; decision endpoint idempotens; mutation auditált; source/project scope validált.

---

# 46. Error/Domain code registry baseline

```text
NO_CONFIRMED_SCALE
SCALE_CONFLICT
SCALE_REVIEW_REQUIRED
INVALID_GEOMETRY
GEOMETRY_SELF_INTERSECTION
GEOMETRY_OUT_OF_PAGE
HOLE_OUTSIDE_PARENT
MEASUREMENT_RULE_REQUIRED
MISSING_REQUIRED_PARAMETER
UNIT_MISMATCH
INVALID_QUANTITY
MISSING_SOURCE_REFERENCE
STALE_DOCUMENT_VERSION
AI_SCHEMA_INVALID
AI_PROPOSAL_REVIEW_REQUIRED
BOQ_MAPPING_REQUIRED
BOQ_DEVIATION_REVIEW_REQUIRED
EXPORT_BLOCKED
```

A UI magyar üzenetet mutathat, de a canonical code stabil.

---

# 47. Audit és provenance invariánsok

Minden végleges measurement legyen visszavezethető:

```text
Project
→ Document
→ DocumentVersion
→ Page
→ Geometry
→ ScaleCalibration
→ MeasurementRule
→ RuleRun
→ ValidationRun
→ Human Decision
→ BOQ mapping
→ Export row
```

Bármely törött lineage P0 blocker.

---

# 48. Adatmegőrzési elv

- rejected proposal megmarad auditban;
- edited proposal original geometry-ja megmarad;
- superseded revision nem törlődik;
- published rule nem módosul in-place;
- document version immutable.

---

# 49. Deployment baseline

MVP: single-user pilot.

A rendszernek futnia kell fejlesztői lokális és reprodukálható staging/pilot környezetben.

Nem P0: Kubernetes, komplex autoscaling, multi-region, service mesh.

Kötelező:

- `.env.example`;
- dokumentált startup;
- production secret separation;
- build/test commandok;
- minimum deploy runbook.

---

# 50. Observability minimum

Loggable:

```text
request/correlation id
project id
document id
measurement id
rule id/version
validation run id
export id
AI run id
error code
duration
```

Secret/PDF raw content nem kerülhet indokolatlanul logba.

---

# 51. Accessibility minimum

- keyboard focus látható;
- icon-only control tooltip/aria-label;
- status nem csak szín;
- form label;
- keyboard-kezelhető dialog;
- inputhoz kötött error message.

---

# 52. Localization

Default UI: `hu-HU`.

Elsődleges terminológia:

- Projekt
- Dokumentumok
- Mennyiségfelmérés
- Mérés / Mérések
- Lépték
- Ellenőrzés
- Eltérés
- Export
- Megállapítások
- Kontextus

`TakeOff` terméknévként/modulnévként előfordulhat, de a normál UX magyar.

---

# 53. Known implementation status baseline

Elkészült:

- W00 repository audit;
- W00.5 domain contract freeze;
- unit policy;
- authority model;
- measurement status model;
- product decision closure;
- W01 T0 Brand foundation;
- W01 T1 App Shell;
- W01 T2 UI primitives.

W01: build PASS, typecheck PASS, lint PASS, targeted UI tests PASS; pre-existing localization/golden drift külön workstream; W01 új regresszió nem azonosított.

Következő technikai fókusz: localization expectation cleanup, live browser QA, Project + Document vertical slice.

---

# 54. Release quality gates

## Functional
- project create működik;
- PDF upload/view működik;
- XLSX import működik;
- scale confirmation működik;
- manual area működik;
- manual wall length működik;
- count működik;
- wall area működik;
- review működik;
- BOQ compare működik;
- export működik;
- assistant blocker explanation működik.

## Domain
- SI authoritative calculation;
- Q1/Q2 szétválasztás;
- rule lineage;
- unit validation;
- source reference;
- review state;
- audit trail.

## QA
- build PASS;
- typecheck PASS;
- lint PASS;
- unit PASS;
- integration PASS;
- browser golden path PASS;
- regression corpus PASS;
- 0 ismert P0 runtime defect.

## Security
- browserben nincs production AI secret;
- production CORS kontrollált;
- file validation aktív;
- dependency állapot dokumentált.

---

# 55. Definition of Done

- [ ] új projekt létrehozható;
- [ ] projekt újranyitható;
- [ ] PDF feltölthető;
- [ ] PDF renderel;
- [ ] több oldal kezelhető;
- [ ] zoom/pan működik;
- [ ] scale létrehozható;
- [ ] scale jóváhagyható;
- [ ] scale nélkül dimensional export blokkol;
- [ ] polygon area működik;
- [ ] polyline length működik;
- [ ] count működik;
- [ ] wall area működik;
- [ ] SI mennyiség reprodukálható;
- [ ] frontend quantity nem authoritative;
- [ ] Q1/Q2 külön;
- [ ] Q2 rule_id-hez kötött;
- [ ] validation findings működnek;
- [ ] review queue működik;
- [ ] Accept/Edit/Reject működik;
- [ ] AI proposal nem lesz automatikusan accepted;
- [ ] BOQ XLSX import működik;
- [ ] manual BOQ mapping működik;
- [ ] unit mismatch ERROR;
- [ ] deviation abs és % számítódik;
- [ ] >5% review trigger;
- [ ] export blocker működik;
- [ ] XLSX export megnyitható;
- [ ] approved export csak accepted human-reviewed adat;
- [ ] audit trail megvan;
- [ ] source lineage drill-down működik;
- [ ] assistant megnevezi a blocker okát;
- [ ] browser smoke PASS;
- [ ] regression corpus PASS;
- [ ] 0 ismert P0 runtime defect.

---

# 56. Nem validált / nyitott területek

A fejlesztő AI nem találhatja ki:

## 56.1 Measurement tolerance

- floor area tolerance;
- wall length tolerance;
- wall area tolerance;
- count tolerance.

## 56.2 Regression sample-ek

A corpus szerkezet kész, a 3 végleges pilot/sample project kijelölendő.

## 56.3 Engineering rule authority

Minden szakmai rule-hoz kell:

```text
authority
source
reviewer
version
```

## 56.4 Production external engine

Vendor selection nem final.

## 56.5 Full RBAC

P0: `single-user pilot`. Future schema lehet role-ready.

---

# 57. Kötelező kapcsolódó kanonikus fájlok

```text
docs/canonical/
  MS_MVP_CANONICAL_DEVELOPMENT_PLAN_v1.0.md
  MS_MVP_API_CONTRACT_v1.0.yaml
  MS_MVP_DOMAIN_SCHEMA_v1.0.md
  MS_MVP_RULE_REGISTRY_v1.0.yaml
  MS_MVP_VALIDATION_REGISTRY_v1.0.yaml
  MS_MVP_RELEASE_GATES_v1.0.md

docs/regression/
  corpus_manifest.md
```

Brand token:

```text
MS_BRAND_TOKENS_v1.0.json
```

---

# 58. Change control

Ez a dokumentum canonical baseline.

Módosítása csak product owner döntés, domain invariant változás, architecture ADR vagy release blocker miatt indokolt scope-korrekció esetén történhet.

Minden változásnál kötelező:

```text
version bump
change note
decision source
impacted modules
migration impact
test impact
```

---

# 59. Fejlesztő AI számára kötelező induló instrukció

```text
You are implementing the MernokSzem MVP.

Treat MS_MVP_CANONICAL_DEVELOPMENT_PLAN_v1.0.md as the canonical
product and technical baseline.

Do not expand scope.
Do not invent engineering rules.
Do not replace working OpenTakeoff capabilities without technical necessity.
Do not make AI authoritative.
Do not silently bypass validation, review, provenance or audit.
Do not modify single-owner critical files unless explicitly assigned.

Before implementation:
- verify repo, branch, HEAD, git status;
- read only relevant source docs;
- inspect existing implementation;
- identify allowed and forbidden files.

After implementation:
- run build, typecheck, lint and relevant tests;
- distinguish pre-existing failures from new regressions;
- report acceptance criteria;
- commit only passing scope;
- stop.
```

---

# 60. Záró rendszerelv

A MérnökSzem hosszú távú saját IP-je nem a PDF viewer, nem egy konkrét AI modell, nem egy konkrét TakeOff vendor és nem egy UI framework.

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
BOQ Mapping
+
Auditability
+
később Audit és ÉPOS Intelligence
```

---

# 61. Canonical Golden Path

```text
PROJECT
  ↓
DOCUMENT
  ↓
PDF VIEWER
  ↓
SCALE CONFIRMATION
  ↓
MANUAL / AI-PROPOSED GEOMETRY
  ↓
CANONICAL SI RECOMPUTE
  ↓
MEASUREMENT RULE
  ↓
VALIDATION
  ↓
HUMAN REVIEW
  ↓
ACCEPTED MEASUREMENT
  ↓
BOQ IMPORT
  ↓
MANUAL MAPPING
  ↓
BOQ COMPARE
  ↓
REVIEW QUEUE
  ↓
ASSISTANT EXPLANATION
  ↓
AUDITABLE XLSX EXPORT
  ↓
SOURCE TRACEBACK
```

Ha ez a lánc stabilan, auditálhatóan és regresszió nélkül működik, a MérnökSzem MVP fejlesztési célja teljesült.

---

# 62. Végső státusz

**Canonical plan status:** FINAL
**MVP architecture:** APPROVED BASELINE
**Product scope:** LOCKED
**Human-in-the-loop policy:** MANDATORY
**OpenTakeoff strategy:** ADAPT
**ERP/ÉPOS full implementation:** OUT OF SCOPE
**External Takeoff vendor dependency:** OPTIONAL / NON-BLOCKING
**Primary release objective:** auditable PDF → measurement → review → BOQ → export workflow
**Next planning artifact:** 21-Day MVP Execution Plan

---

**END OF DOCUMENT**
