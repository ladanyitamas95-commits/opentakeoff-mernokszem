# MérnökSzem TakeOff
## AI-Assisted Falhossz- és Területmérés – Funkcionális, Mérési és Fejlesztési Specifikáció

**Dokumentumverzió:** v0.2  
**Státusz:** auditált fejlesztési specifikáció  
**Cél:** Codex-ready implementációs alap  
**Elsődleges use case:** építészeti tervből falhossz- és területmérési javaslatok előállítása  
**Működési modell:** AI-assisted, human-in-the-loop  
**Alapelv:** AI értelmez és geometriát javasol; determinisztikus geometriai motor számol; ember validál.

---

# 1. Dokumentum célja

A jelen dokumentum a MérnökSzem TakeOff első AI-assisted mérési rendszerének funkcionális, mérési, geometriai, QA- és adatkezelési szabályait definiálja.

A specifikáció célja, hogy fejlesztési alapot biztosítson:

- frontend fejlesztéshez;
- backend fejlesztéshez;
- OpenTakeoff-integrációhoz;
- AI-agent működéshez;
- mérési policy engine kialakításához;
- ground-truth adatgyűjtéshez;
- regression testinghez;
- későbbi computer vision fejlesztéshez.

A dokumentum első két támogatott mérési capability-je:

```text
CAP-01 – WALL LENGTH
CAP-02 – AREA
```

---

# 2. A rendszer alapfilozófiája

A rendszer nem használhat AI-modellt közvetlen numerikus mérőeszközként.

Az AI feladata:

```text
értelmezés
+
objektumfelismerés
+
geometriai javaslat
+
klasszifikáció
+
bizonytalanság felismerése
```

A geometriai motor feladata:

```text
hossz számítása
terület számítása
topológiai ellenőrzés
geometriai validáció
```

A Measurement Policy Engine feladata:

```text
annak meghatározása,
hogy a felismert fizikai geometriából
milyen mennyiséget és milyen szabály szerint kell számítani
```

A felhasználó feladata:

```text
Accept
Edit
Reject
```

---

# 3. Kanonikus mérési architektúra

A rendszer kötelező feldolgozási sorrendje:

```text
DRAWING
   │
   ▼
GEOMETRY EXTRACTION
   │
   ▼
SEMANTIC CLASSIFICATION
   │
   ▼
TOPOLOGY ENGINE
   │
   ▼
MEASUREMENT POLICY ENGINE
   │
   ▼
DETERMINISTIC GEOMETRY ENGINE
   │
   ▼
QA GATES
   │
   ▼
AI MEASUREMENT PROPOSAL
   │
   ▼
HUMAN REVIEW
   │
   ├── ACCEPT
   ├── EDIT
   └── REJECT
   │
   ▼
GROUND TRUTH / REVIEW DATA
```

A fenti rétegek logikailag elkülönítendők.

---

# 4. Kritikus rendszerelv: fizikai geometria ≠ mérési geometria

A rendszer minden esetben külön kezelje:

```text
PHYSICAL_GEOMETRY
```

és:

```text
MEASUREMENT_GEOMETRY
```

Példa:

egy fal fizikai geometriája lehet egy faltest vagy két falsík által meghatározott terület.

A hozzá tartozó mérési geometria azonban lehet:

```text
CENTERLINE
INNER_FACE
OUTER_FACE
SIDE_A_FACE
SIDE_B_FACE
CUSTOM_LINE
```

A kettő nem mosható össze.

---

# 5. Kritikus rendszerelv: nincs univerzális mérési default

A rendszer nem feltételezheti automatikusan, hogy:

```text
minden fal → CENTERLINE
```

vagy:

```text
minden terület → GROSS_AREA
```

A mérési referencia és a számítási szabály minden esetben az adott:

```text
MEASUREMENT_PURPOSE
+
QUANTITY_TYPE
+
MEASUREMENT_POLICY
```

függvénye.

Ha a szükséges measurement policy nem határozható meg:

```text
MEASUREMENT_RULE_REQUIRED
```

státuszt kell alkalmazni.

---

# 6. MVP capability-k

Az első implementáció két capability-t tartalmaz.

## CAP-01 – Falhossz

A rendszer képes legyen építészeti terven falszakaszokat vagy faljelölteket azonosítani és megfelelő mérési geometriát javasolni.

## CAP-02 – Terület

A rendszer képes legyen építészeti terven zárt vagy rekonstruálható területhatárokat felismerni és területmérési geometriát javasolni.

---

# 7. MVP automatizálási szintek

## V0.1 – Region-assisted

```text
felhasználó kijelöl egy tervrégiót
→ AI értelmezi
→ AI mérési geometriát javasol
→ felhasználó validál
```

## V0.2 – Object-assisted

```text
felhasználó kijelöl egy helyiséget vagy falat
→ AI automatikusan körberajzolja / felépíti a mérési geometriát
```

## V0.3 – Multi-object detection

```text
felhasználó kijelöl egy tervrégiót
→ AI több falat vagy területet felismer
```

## V1.0 – Drawing-level detection

```text
teljes tervlap
→ automatikus measurement candidate detection
```

Az MVP implementáció elsődleges célja:

```text
V0.1 → V0.2
```

---

# 8. Human-in-the-loop működés

Minden AI által létrehozott mérési javaslat alapállapota:

```text
AI_PROPOSED
```

A felhasználó három műveletet hajthat végre.

## ACCEPT

A javasolt geometria és mennyiség jóváhagyása.

## EDIT

A javasolt geometria vagy mérési attribútum módosítása.

Lehetséges szerkesztések:

- pont áthelyezése;
- végpont módosítása;
- szakasz hozzáadása;
- szakasz törlése;
- polygon vertex módosítása;
- új deduction hozzáadása;
- deduction törlése;
- mérési reference módosítása;
- mérési policy kiválasztása.

## REJECT

A measurement candidate elutasítása.

Az eredeti AI-javaslat minden esetben megőrzendő.

---

# 9. Measurement státuszmodell

Támogatandó státuszok:

```text
AI_PROPOSED
REVIEW_REQUIRED
MEASUREMENT_RULE_REQUIRED
SCALE_REVIEW_REQUIRED
INVALID_GEOMETRY
ACCEPTED
EDITED
REJECTED
```

A státusz és a confidence/quality score egymástól független adat.

---

# 10. Fal objektum definíció

A fizikai fal objektum reprezentálhat:

- faltestet;
- falsíkokat;
- falszakaszt;
- összefüggő wall chain-t.

Javasolt alapstruktúra:

```json
{
  "element_id": "WALL-0001",
  "element_type": "WALL",
  "drawing_id": "A-101",
  "physical_geometry": {},
  "wall_thickness_mm": null,
  "semantic_classification": null,
  "topology": {},
  "status": "AI_PROPOSED"
}
```

---

# 11. Falvastagság kezelése

Ha a falvastagság megbízhatóan meghatározható:

```text
wall_thickness_mm = numeric value
```

Ha nem:

```text
wall_thickness_mm = null
```

vagy:

```text
UNKNOWN
```

A rendszer nem rögzíthet becsült falvastagságot biztos tényként.

A falvastagság bizonytalanságát külön quality flagként kell tárolni.

---

# 12. Fal felismerésének lehetséges inputjai

A felismerési logika használhat:

- vector PDF objektumokat;
- raszteres renderelt tervképet;
- line segmentation eredményeket;
- párhuzamos vonalakat;
- vonalvastagságot;
- vonaltípust;
- szöveges faljelöléseket;
- méretláncokat;
- réteg- vagy színinformációt;
- szomszédos objektumokat;
- ajtó- és ablakgeometriát;
- korábbi validált measurement adatokat.

---

# 13. Kritikus fal-felismerési szabály

Két párhuzamos vonal önmagában nem bizonyítja, hogy fal.

Lehetséges alternatívák:

- méretvonal;
- korlát;
- gépészeti vezeték;
- bútor;
- rajzkeret;
- burkolati osztás;
- technológiai elem.

Falklasszifikációhoz lehetőség szerint kombinálni kell:

```text
GEOMETRIC_EVIDENCE
+
SEMANTIC_EVIDENCE
+
CONTEXT_EVIDENCE
```

---

# 14. WALL MEASUREMENT POLICY rendszer

A fal mért hosszát a Measurement Policy Engine definiálja.

Támogatott reference típusok:

```text
CENTERLINE
INNER_FACE
OUTER_FACE
SIDE_A_FACE
SIDE_B_FACE
BOUNDARY
CUSTOM_LINE
```

A `CENTERLINE` nem univerzális default.

---

# 15. WALL_LENGTH_POLICY – kötelező szabályok

## WL-001 – Physical és measurement geometry elkülönítése

Minden falhoz külön tárolandó:

```text
physical_geometry
measurement_geometry
```

---

## WL-002 – Measurement reference meghatározása

A reference-et a quantity type / measurement policy határozza meg.

Ha nem ismert:

```text
MEASUREMENT_RULE_REQUIRED
```

---

## WL-003 – Determinisztikus számítás

A hossz értékét kizárólag geometriai számítás adhatja:

```text
length = geometry_engine(measurement_geometry)
```

LLM vagy vision modell által becsült hossz nem használható végleges értékként.

---

## WL-004 – Falfolytonosság

A rendszernek meg kell őriznie a fizikai és logikai wall continuity információt.

Egy csatlakozás önmagában nem jelent új falat.

---

## WL-005 – Csatlakozástípusok

Minimum támogatandó topológiai kapcsolatok:

```text
END
L_JUNCTION
T_JUNCTION
X_JUNCTION
CONTINUATION
UNKNOWN
```

---

## WL-006 – L-csatlakozás

Az összecsatlakozó falak mérési végpontjai az adott measurement policy alapján képzendők.

Nem keverhető implicit módon több reference rendszer.

---

## WL-007 – T-csatlakozás

A folyamatos fal nem törhető meg automatikusan kizárólag a T-csatlakozás miatt.

A becsatlakozó fal külön physical wall object vagy segment lehet.

---

## WL-008 – X-csatlakozás

Két metsző wall geometry nem jelent automatikusan négy független falszakaszt.

A continuity megőrzendő.

---

## WL-009 – Duplikált mérés tiltása

Ugyanaz a fizikai vagy measurement geometry azonos policy alatt nem számolható kétszer.

Kötelező:

```text
duplicate_detection
```

---

## WL-010 – Nyílászárók külön objektumok

Ajtó és ablak:

```text
OPENING
```

objektumként kezelendő.

A fal fizikai geometriáját nem kell automatikusan megszakítani miattuk.

---

## WL-011 – Nyílások measurement hatása

A policy definiálja:

```text
NO_EFFECT
DEDUCT_LENGTH
DEDUCT_AREA
PARTIAL_DEDUCTION
CUSTOM
```

Például fal tengelyhossz esetén lehet `NO_EFFECT`, míg szegélyhossznál az ajtó `DEDUCT_LENGTH` hatású lehet.

---

## WL-012 – Falvastagság-változás

Falvastagság változás esetén:

- új segment képezhető;
- külön quantity classification alkalmazható;
- continuity ettől még megőrizhető.

---

## WL-013 – Bizonytalan falvég

Ha a wall endpoint nem azonosítható megfelelő minőségben:

```text
REVIEW_REQUIRED
```

---

## WL-014 – Ismeretlen objektumtípus

Ha nem bizonyítható megfelelően, hogy a jelölt geometria fal:

```text
SEMANTIC_REVIEW_REQUIRED
```

vagy általánosan:

```text
REVIEW_REQUIRED
```

---

# 16. Measurement wall object

Javasolt séma:

```json
{
  "measurement_id": "MEAS-W-0001",
  "source_element_id": "WALL-0001",
  "measurement_type": "LENGTH",
  "measurement_purpose": "",
  "measurement_policy_version": "",
  "measurement_reference": "",
  "measurement_geometry": {
    "type": "POLYLINE",
    "points": []
  },
  "raw_length_mm": 0,
  "display_length_m": 0,
  "quality_score": 0,
  "quality_flags": [],
  "status": "AI_PROPOSED",
  "review_status": "PENDING"
}
```

---

# 17. Terület objektum definíció

A fizikai területobjektum lehet:

- helyiség;
- padló;
- mennyezet;
- homlokzati felület;
- burkolandó felület;
- szerkezeti footprint;
- szigetelendő felület.

Az MVP elsődleges területi use case:

```text
FLOOR_AREA
```

---

# 18. Kritikus területelv

A fizikai területhatár és a számított quantity terület nem feltétlen azonos.

Például:

```text
physical room boundary
```

és:

```text
net floor finish area
```

külön objektumok/logikák.

---

# 19. AREA MEASUREMENT POLICY típusok

Támogatandó measurement módok:

```text
GROSS
NET
USABLE
FINISH
STRUCTURAL
CUSTOM
```

Nincs globális `GROSS` default.

Ha nincs megfelelő policy:

```text
MEASUREMENT_RULE_REQUIRED
```

---

# 20. Terület geometriai reprezentáció

Támogatandó:

```text
POLYGON
MULTIPOLYGON
```

A polygon támogassa:

```text
outer_ring
holes[]
```

---

# 21. AREA_MEASUREMENT_POLICY – kötelező szabályok

## AR-001 – Valid polygon szükséges

Végleges automatikus terület csak érvényes polygonból számolható.

---

## AR-002 – Minimum geometriai követelmények

Egy valid polygon:

- zárt;
- legalább 3 egyedi pontot tartalmaz;
- nem önmetsző;
- nincs zero-length edge;
- megfelelő topológiájú.

---

## AR-003 – Nem teljesen zárt kontúr

Ha a boundary nem teljesen zárt:

```text
REVIEW_REQUIRED
```

Az AI javasolhat closure-t, de azt nem kezelheti automatikusan validált geometriaként.

---

## AR-004 – Self-intersection

Önmetsző polygon:

```text
INVALID_GEOMETRY
```

amíg javítás nem történik.

---

## AR-005 – Hole kezelés

A belső kivágások külön `hole` vagy deduction objektumként kezelendők.

---

## AR-006 – Deduction külön objektum

Minden levonásnak rendelkeznie kell:

```text
deduction_id
geometry
classification
deduction_policy
raw_area
quality_score
status
```

---

## AR-007 – Nem minden belső objektum levonás

Például:

- pillér;
- akna;
- bútor;
- gép;
- berendezés;
- rajzi jelölés

külön semantic classification-t igényel.

Nem vonható le automatikusan kizárólag azért, mert egy polygonon belül található.

---

## AR-008 – Deduction bizonytalanság

Ha az objektum levonási státusza nem egyértelmű:

```text
DEDUCTION_REVIEW_REQUIRED
```

---

## AR-009 – Átfedő deduction

A levonások unióját kell számítani.

Helyes:

```text
NET_AREA =
OUTER_AREA
-
AREA(UNION(DEDUCTIONS))
```

Nem helyes:

```text
OUTER_AREA
-
D1
-
D2
```

ha `D1` és `D2` átfed.

---

## AR-010 – Multipolygon

Több elkülönülő, de ugyanabba a quantity-be tartozó terület:

```text
MULTIPOLYGON
```

formában kezelhető.

---

## AR-011 – Determinisztikus területszámítás

A numerikus terület:

```text
area = geometry_engine(validated_polygon)
```

LLM/vision becslésből nem származhat.

---

# 22. Area measurement object

```json
{
  "measurement_id": "MEAS-A-0001",
  "element_type": "AREA",
  "measurement_type": "AREA",
  "measurement_purpose": "FLOOR_AREA",
  "measurement_policy_version": "",
  "physical_geometry": {},
  "measurement_geometry": {
    "type": "POLYGON",
    "outer_ring": [],
    "holes": []
  },
  "deductions": [],
  "raw_gross_area_mm2": 0,
  "raw_net_area_mm2": 0,
  "display_gross_area_m2": 0,
  "display_net_area_m2": 0,
  "quality_score": 0,
  "quality_flags": [],
  "status": "AI_PROPOSED"
}
```

---

# 23. Scale management

A scale kezelés globálisan kritikus rendszerfunkció.

Hibás scale esetén minden hossz- és területi eredmény hibás lehet.

A scale külön objektumként kezelendő.

---

# 24. Scale source típusok

Támogatandó:

```text
USER_CALIBRATION
DIMENSION_CALIBRATION
VECTOR_GEOMETRY_REFERENCE
DRAWING_SCALE_TEXT
EXISTING_VALIDATED_SCALE
```

---

# 25. Scale source megbízhatóság

A rendszer nem kezelheti automatikusan a terven található:

```text
M 1:50
```

feliratot bizonyított fizikai skálaként.

A PDF export vagy nyomtatási beállítás miatt az oldal átméretezhető.

A scale text:

```text
scale evidence
```

de nem feltétlen:

```text
validated scale
```

---

# 26. User calibration

A felhasználó kijelöl két pontot és megadja a valós távolságot.

Példa:

```text
P1 → P2
Known distance = 5000 mm
```

A rendszer ebből számolja:

```text
units_per_document_unit
```

---

# 27. Dimension calibration

Ha megbízható méretvonal olvasható:

```text
5000
```

a rendszer ezt calibration reference-ként használhatja.

A dimension line:

- végpontjai;
- numerikus értéke;
- mértékegysége;
- kapcsolatuk

együtt validálandók.

---

# 28. Több scale egy oldalon

Egyetlen PDF-lap nem feltétlenül használ egyetlen skálát.

Lehetnek:

- alaprajzok;
- részletrajzok;
- metszetek;
- kinagyított csomópontok

egyazon oldalon.

Ezért a scale-nek regionális scope-ja lehet.

---

# 29. Scale context adatmodell

```json
{
  "scale_context_id": "SC-001",
  "drawing_id": "A-101",
  "page_id": "PAGE-01",
  "region": {},
  "source": "DIMENSION_CALIBRATION",
  "known_distance_mm": 5000,
  "document_distance": 0,
  "units_per_document_unit": 0,
  "quality_score": 0,
  "status": "VALIDATED"
}
```

---

# 30. Scale sanity check

Lehetőség szerint a kalibráció után második ismert mérettel ellenőrzés szükséges.

Példa:

```text
Calibration reference: 5000 mm
Validation reference: 7200 mm
Calculated: 7194 mm
Error: 0.083%
```

Ezt regression és QA adatként tárolni kell.

---

# 31. Scale QA gate

Ha nincs validált scale:

```text
SCALE_REVIEW_REQUIRED
```

A rendszer dokumentum-koordinátát tárolhat, de végleges fizikai:

```text
m
m²
```

értéket nem kommunikálhat validált mennyiségként.

---

# 32. Canonical unit rendszer

Belső számítási egységek:

```text
length = millimeter
area = square millimeter
```

A frontend display egységek:

```text
m
m²
```

A conversion egy központi unit layeren keresztül történjen.

---

# 33. Precision szabály

A számítás előtt geometriai érték nem kerekíthető.

Példa:

```text
raw_length_mm = 8437.628
```

A számítás ezt használja.

A UI megjelenítheti:

```text
8.44 m
```

A display rounding és computation precision külön réteg.

---

# 34. Quality rendszer

A korábbi általános `confidence` helyett a rendszer használjon:

```text
MEASUREMENT_QUALITY_SCORE
```

röviden:

```text
MQS
```

értéket.

Tartomány:

```text
0–100
```

---

# 35. MQS komponensek

Lehetséges összetevők:

```text
scale_quality
geometry_quality
semantic_quality
topology_quality
policy_certainty
source_quality
```

A végleges score kalkuláció verziózott legyen.

---

# 36. Hard QA gate elsőbbség

Az MQS nem írhat felül hard fail státuszt.

Példa:

```text
scale_quality = 100
geometry_quality = 98
semantic_quality = 95
topology_quality = 97
policy_certainty = 0
```

A rendszer nem képezhet egyszerű átlagot és nem mondhatja, hogy a mérés megfelelő.

Státusz:

```text
MEASUREMENT_RULE_REQUIRED
```

---

# 37. Quality flag-ek

Minimum:

```text
LOW_SCALE_QUALITY
LOW_GEOMETRY_QUALITY
LOW_SEMANTIC_QUALITY
LOW_TOPOLOGY_QUALITY
MEASUREMENT_POLICY_UNCERTAIN
OPEN_GEOMETRY
SELF_INTERSECTION
POSSIBLE_DUPLICATE
POSSIBLE_OPENING
UNRESOLVED_JUNCTION
LOW_SOURCE_QUALITY
```

---

# 38. QA Gate rendszer

## QG-01 – Scale valid

Valid scale nélkül nincs validált fizikai mennyiség.

## QG-02 – Geometry valid

Érvénytelen geometry esetén nincs final measurement.

## QG-03 – Measurement policy resolved

Ismeretlen quantity rule esetén:

```text
MEASUREMENT_RULE_REQUIRED
```

## QG-04 – Duplicate check

Duplikált objektum vagy segment esetén review.

## QG-05 – Topology check

Falat érintő hibás vagy bizonytalan csatlakozás review-t igényel.

## QG-06 – Semantic check

Bizonytalan objektumklasszifikáció esetén nincs automatikus elfogadás.

## QG-07 – Calculation reproducibility

Azonos:

```text
geometry
+
scale
+
policy
+
engine version
```

mellett azonos numerikus output kötelező.

---

# 39. Geometriai validity check-ek

Minimum ellenőrzések:

```text
SELF_INTERSECTION
DUPLICATE_SEGMENT
ZERO_LENGTH_SEGMENT
DANGLING_ENDPOINT
OVERLAPPING_POLYGON
INVALID_RING
DISCONNECTED_CHAIN
INVALID_COORDINATE
```

---

# 40. AI output szabály

Az AI nem kommunikálhat:

- nem validált geometriát validként;
- becsült mértéket pontos geometriai eredményként;
- ismeretlen measurement policyt feltételezett policyként;
- ismeretlen scale-t bizonyított scale-ként.

Bizonytalanság esetén:

```text
REVIEW_REQUIRED
```

vagy specifikus hard fail státusz szükséges.

---

# 41. Vizuális overlay – kötelező követelmény

AI measurement nem jelenhet meg kizárólag numerikus outputként.

A felhasználónak látnia kell a geometriai alapot.

---

# 42. Fal overlay

Megjelenítendő:

- measurement line;
- vertex/endpoints;
- segment ID;
- measurement reference;
- hossz;
- MQS;
- status;
- warning flag.

---

# 43. Terület overlay

Megjelenítendő:

- külső kontúr;
- belső hole-ok;
- deductions;
- gross/net quantity;
- MQS;
- status;
- warning flag.

---

# 44. Accessibility szabály

Státusz nem kommunikálható kizárólag színnel.

Használni kell:

```text
color
+
icon
+
text/status
```

kombinációt.

---

# 45. Wall measurement workflow

```text
1. Drawing betöltése
2. Relevant scale context azonosítása
3. Scale QA
4. Region/object selection
5. Geometry extraction
6. Wall candidate detection
7. Semantic classification
8. Physical wall geometry létrehozása
9. Topology analysis
10. Measurement purpose meghatározása
11. Measurement policy kiválasztása
12. Measurement geometry generálása
13. Geometry validity check
14. Duplicate detection
15. Determinisztikus hosszszámítás
16. MQS számítás
17. QA gates
18. Overlay
19. Human review
20. Ground-truth/review record
```

---

# 46. Area measurement workflow

```text
1. Drawing betöltése
2. Relevant scale context azonosítása
3. Scale QA
4. Region/object selection
5. Boundary detection
6. Semantic classification
7. Physical area geometry
8. Polygon closure validation
9. Topological validation
10. Measurement purpose
11. Measurement policy
12. Deduction candidate detection
13. Deduction semantic classification
14. Deduction policy
15. Polygon/union calculation
16. Determinisztikus area calculation
17. MQS
18. QA gates
19. Overlay
20. Human review
21. Ground-truth/review record
```

---

# 47. Ground Truth rendszer

Minden reviewed measurementhez review record készül.

Nem minden reviewed adat tekintendő automatikusan ground truth-nak.

---

# 48. Ground Truth státuszok

```text
UNREVIEWED
USER_ACCEPTED
EXPERT_VALIDATED
BENCHMARK
```

Training vagy komoly regression benchmark célra elsődlegesen:

```text
EXPERT_VALIDATED
BENCHMARK
```

használható.

---

# 49. Ground Truth adatmodell

```json
{
  "project_id": "",
  "drawing_id": "",
  "measurement_id": "",
  "element_type": "",
  "measurement_type": "",
  "measurement_purpose": "",
  "ai_physical_geometry": {},
  "ai_measurement_geometry": {},
  "ai_value_raw": 0,
  "ai_mqs": 0,
  "review_action": "",
  "reviewed_measurement_geometry": {},
  "ground_truth_value_raw": 0,
  "ground_truth_status": "",
  "absolute_error": 0,
  "relative_error_percent": 0,
  "geometry_error_metrics": {},
  "timestamp": "",
  "ai_model_version": "",
  "detection_engine_version": "",
  "geometry_engine_version": "",
  "measurement_policy_version": "",
  "quality_model_version": ""
}
```

---

# 50. Falhossz hibamérés

```text
absolute_error_mm =
|AI_length_mm - GT_length_mm|
```

```text
relative_error_percent =
absolute_error_mm / GT_length_mm × 100
```

---

# 51. Terület hibamérés

```text
absolute_error_mm2 =
|AI_area_mm2 - GT_area_mm2|
```

```text
relative_error_percent =
absolute_error_mm2 / GT_area_mm2 × 100
```

---

# 52. Geometriai accuracy metrikák

Fal esetén később támogatandó:

```text
endpoint deviation
centerline deviation
Hausdorff distance
segment coverage
```

Terület esetén:

```text
Intersection over Union
boundary deviation
over-detection area
under-detection area
```

---

# 53. Audit trail

Minden measurementhez tárolandó:

```text
created_by
created_at
source_type
ai_model_version
detection_engine_version
geometry_engine_version
measurement_policy_version
quality_model_version
original_geometry
current_geometry
review_action
reviewed_by
reviewed_at
```

Az eredeti AI output nem írható felül visszakövethetetlenül.

---

# 54. Verziózás

Külön verziózandó:

```text
AI_MODEL_VERSION
DETECTION_ENGINE_VERSION
TOPOLOGY_ENGINE_VERSION
GEOMETRY_ENGINE_VERSION
MEASUREMENT_POLICY_VERSION
QUALITY_MODEL_VERSION
UNIT_ENGINE_VERSION
```

---

# 55. Regression test minimum kategóriák

## RT-001
Egyszerű téglalap alakú helyiség.

## RT-002
L alakú helyiség.

## RT-003
Helyiség pillérrel.

## RT-004
Helyiség aknával.

## RT-005
Egyszerű egyenes fal.

## RT-006
L alakú fal.

## RT-007
T falcsatlakozás.

## RT-008
X falcsatlakozás.

## RT-009
Fal ajtónyílással.

## RT-010
Fal ablaknyílással.

## RT-011
Eltérő falvastagság.

## RT-012
Vector PDF.

## RT-013
Raster PDF.

## RT-014
Alacsony felbontású raster PDF.

## RT-015
Hiányzó scale.

## RT-016
Hibás scale text.

## RT-017
Több scale egy oldalon.

## RT-018
Duplikált vonal.

## RT-019
Nyitott polygon.

## RT-020
Self-intersecting polygon.

## RT-021
Átfedő deductions.

## RT-022
Méretvonal fal közelében.

## RT-023
Bútor fal közelében.

## RT-024
Korlát vagy párhuzamos grafikai vonal.

## RT-025
Nem fal jellegű kettős vonal.

---

# 56. Failure mode katalógus

```text
FM-001 WRONG_SCALE
FM-002 MISSING_SCALE
FM-003 WRONG_SCALE_REGION
FM-004 FALSE_WALL_DETECTION
FM-005 MISSED_WALL
FM-006 DOUBLE_COUNTED_WALL
FM-007 WRONG_WALL_CONNECTION
FM-008 WRONG_MEASUREMENT_REFERENCE
FM-009 WRONG_POLICY
FM-010 OPEN_POLYGON
FM-011 SELF_INTERSECTION
FM-012 WRONG_AREA_BOUNDARY
FM-013 WRONG_DEDUCTION
FM-014 DUPLICATE_DEDUCTION
FM-015 OVERLAPPING_DEDUCTION_ERROR
FM-016 VECTOR_EXTRACTION_FAILURE
FM-017 RASTER_INTERPRETATION_FAILURE
FM-018 LOW_SEMANTIC_CERTAINTY
FM-019 GEOMETRY_CALCULATION_FAILURE
FM-020 UNIT_CONVERSION_ERROR
FM-021 ROUNDING_ERROR
FM-022 UNSUPPORTED_DRAWING
FM-023 DUPLICATE_SEGMENT
FM-024 TOPOLOGY_FAILURE
FM-025 UNRESOLVED_MEASUREMENT_POLICY
```

---

# 57. API – AI detect endpoint

Javasolt:

```text
POST /api/measurements/ai-detect
```

Input:

```json
{
  "project_id": "",
  "drawing_id": "",
  "region": {},
  "measurement_type": "WALL_LENGTH",
  "measurement_purpose": "",
  "requested_policy": null
}
```

---

# 58. AI detect output

```json
{
  "measurement_job_id": "",
  "scale_context": {},
  "candidates": [],
  "warnings": []
}
```

---

# 59. Candidate objektum

```json
{
  "candidate_id": "",
  "element_type": "",
  "physical_geometry": {},
  "measurement_geometry": {},
  "measurement_policy": "",
  "raw_value": 0,
  "display_value": 0,
  "unit": "",
  "mqs": 0,
  "quality_flags": [],
  "status": "AI_PROPOSED"
}
```

---

# 60. Review endpoint

```text
POST /api/measurements/{measurement_id}/review
```

---

# 61. ACCEPT payload

```json
{
  "action": "ACCEPT"
}
```

---

# 62. EDIT payload

```json
{
  "action": "EDIT",
  "corrected_geometry": {},
  "corrected_policy": null
}
```

---

# 63. REJECT payload

```json
{
  "action": "REJECT",
  "reason_code": null
}
```

---

# 64. Ground Truth automatikus előállítás

Review után automatikusan számítandó:

```text
AI value
reviewed value
absolute delta
relative error
geometry delta
review type
```

Az adat nem feltétlen kap automatikusan `EXPERT_VALIDATED` ground-truth státuszt.

---

# 65. Batch review

Később támogatandó:

```text
Accept selected
Reject selected
Accept all eligible
```

Az `Accept all eligible` csak akkor használható, ha minden hard QA gate PASS.

MQS önmagában nem elegendő.

---

# 66. Kritikus szabály az automatikus elfogadáshoz

Automatikus vagy tömeges elfogadás feltétele:

```text
ALL_HARD_QA_GATES = PASS
```

és csak ezt követően vizsgálható minimum MQS threshold.

Példa:

```text
MQS >= configured_threshold
```

---

# 67. Mérési KPI-k

Elsődleges:

```text
manual_takeoff_time
vs
AI_assisted_takeoff_time
```

Számított KPI:

```text
time_saving_percent
```

Másodlagos:

```text
accepted_without_edit_percent
```

Harmadlagos:

```text
mean_relative_measurement_error
```

További KPI:

```text
false_positive_rate
false_negative_rate
edit_rate
reject_rate
hard_fail_rate
```

---

# 68. MVP üzleti célérték

Első cél:

```text
>= 50% mérési időmegtakarítás
```

Fejlesztési cél:

```text
>= 70% mérési időmegtakarítás
```

Az MVP sikerességéhez nem szükséges teljes autonóm takeoff.

---

# 69. MVP elsődleges UX flow

```text
1. Projekt megnyitása
2. Terv kiválasztása
3. AI Measure
4. Measurement type kiválasztása
5. Régió vagy objektum kijelölése
6. AI candidate generálás
7. Overlay megjelenítés
8. Warning / MQS megjelenítés
9. Accept / Edit / Reject
10. Mentés
```

---

# 70. Scope – első fejlesztési fázis

A scope szigorúan:

```text
WALL LENGTH
+
AREA
+
REGION/OBJECT ASSISTED DETECTION
+
MEASUREMENT POLICY
+
DETERMINISTIC GEOMETRY
+
QA GATES
+
HUMAN REVIEW
+
GROUND TRUTH
```

---

# 71. Nem része az első fejlesztési fázisnak

Nem szükséges:

- teljes BIM rekonstrukció;
- saját neurális háló nulláról történő tréningje;
- automatikus teljes épület QTO;
- MEP takeoff;
- minden szakág támogatása;
- teljes homlokzati automation;
- automatikus teljes tervlapfeldolgozás első verzióban;
- autonóm measurement acceptance;
- saját computer vision foundation model.

---

# 72. Fejlesztési sorrend

## PHASE 1 – Existing geometry audit

A meglévő OpenTakeoff manuális hossz- és területmérés működésének feltérképezése.

## PHASE 2 – Canonical geometry model

Physical geometry és measurement geometry elkülönítése.

## PHASE 3 – Unit és precision layer

Canonical internal unit rendszer implementálása.

## PHASE 4 – Scale context

Regionális scale modell és QA.

## PHASE 5 – Measurement Policy Engine

Falhossz- és terület-policy alapok.

## PHASE 6 – QA / topology layer

Geometry és topology validation.

## PHASE 7 – AI candidate model

AI-assisted geometry proposal.

## PHASE 8 – Region-assisted Area

Első AI területmérési workflow.

## PHASE 9 – Region-assisted Wall

Első AI falhossz workflow.

## PHASE 10 – Review workflow

Accept / Edit / Reject.

## PHASE 11 – Ground Truth

Review adatok strukturált mentése.

## PHASE 12 – MQS

Quality score és flag-ek.

## PHASE 13 – Regression framework

Automatizált regression tesztek.

## PHASE 14 – Benchmark

Valós tervprojektes mérés.

---

# 73. Codex fejlesztési alapelv

A meglévő OpenTakeoff működő funkcióit indokolatlanul tilos újraírni.

Preferált stratégia:

```text
REUSE
EXTEND
WRAP
ISOLATE
TEST
```

Kerülendő:

```text
FULL REWRITE
UNNECESSARY REFACTOR
BREAKING CHANGE
```

---

# 74. OpenTakeoff integrációs követelmény

Az AI measurement layer lehetőség szerint a meglévő:

- drawing viewer;
- coordinate system;
- polyline tool;
- polygon tool;
- scale/calibration;
- measurement storage;
- overlay rendering

funkciókra épüljön.

Az AI új measurement candidate-et ugyanabba vagy kompatibilis geometriai struktúrába állítson elő, amit a manuális mérőeszköz is használ.

---

# 75. AI és OpenTakeoff felelősségi határ

## AI

```text
semantic interpretation
candidate detection
classification
policy suggestion
uncertainty detection
```

## OpenTakeoff / Geometry Engine

```text
coordinates
geometry
length
area
polygon operations
topology
drawing overlay
```

## Measurement Policy Engine

```text
what should be measured
which reference to use
what to deduct
how to aggregate
```

---

# 76. Biztonsági elv – szakmai bizonytalanság

Ha a rendszer nem tud egyértelműen választani két szakmailag eltérő measurement policy között, nem találhat ki választ.

Kimenet:

```text
MEASUREMENT_RULE_REQUIRED
```

A felhasználó válasszon.

---

# 77. Aggregációs szabály

A measurement engine külön tárolja az elemi méréseket és az aggregált quantity-t.

Példa:

```text
Wall-001 = 4.35 m
Wall-002 = 6.12 m
Wall-003 = 2.80 m
```

Aggregation:

```text
Partition wall 100 mm = 13.27 m
```

Az aggregált érték nem helyettesítheti az elemi geometriai traceability-t.

---

# 78. Source traceability

Minden measurementhez visszakereshető legyen:

```text
project
drawing
page
region
source element
scale context
geometry
policy
engine version
review history
```

---

# 79. Reproducibility követelmény

Bármely elfogadott mérésnek reprodukálhatónak kell lennie az alábbi adatokból:

```text
source drawing
source coordinates
scale context
measurement geometry
measurement policy
geometry engine version
unit engine version
```

Ha ezekből nem reprodukálható, a mérés nem megfelelően auditálható.

---

# 80. Definition of Done – MVP feature

Az első AI-assisted measurement feature akkor tekinthető késznek, ha:

1. meglévő manuális measurement funkció változatlanul használható;
2. vector PDF támogatott legalább egy benchmark esetben;
3. raster PDF támogatott legalább egy benchmark esetben;
4. region-assisted fal candidate létrehozható;
5. region-assisted area candidate létrehozható;
6. physical és measurement geometry külön tárolódik;
7. measurement policy explicit;
8. valid scale context kapcsolódik a méréshez;
9. hossz/terület determinisztikusan számolódik;
10. geometry validity check fut;
11. topology check fut fal esetén;
12. duplicate check fut;
13. MQS létrejön;
14. hard QA gate működik;
15. overlay megjelenik;
16. Accept működik;
17. Edit működik;
18. Reject működik;
19. eredeti AI geometry megőrződik;
20. reviewed geometry megőrződik;
21. audit trail létrejön;
22. review record létrejön;
23. regression teszt futtatható;
24. measurement reprodukálható;
25. meglévő manuális funkciók regression tesztje PASS.

---

# 81. Kanonikus rendszerelv összefoglalása

A MérnökSzem TakeOff mérési rendszerének alapelve:

```text
AI NEM MÉR.
AI ÉRTELMEZ ÉS GEOMETRIÁT JAVASOL.

A GEOMETRIAI MOTOR MÉR.

A MEASUREMENT POLICY MEGHATÁROZZA,
HOGY MIT ÉS HOGYAN KELL MÉRNI.

A QA GATE ELLENŐRIZ.

AZ EMBER VALIDÁL.

MINDEN MÓDOSÍTÁS AUDITÁLHATÓ ÉS
KÉSŐBB GROUND-TRUTH ADATTÁ ALAKÍTHATÓ.
```

Ez a szabály minden későbbi MérnökSzem TakeOff mérési modulra alkalmazandó.