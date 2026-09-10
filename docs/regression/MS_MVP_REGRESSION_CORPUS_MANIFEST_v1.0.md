# MS_MVP_REGRESSION_CORPUS_MANIFEST_v1.0

**Projekt:** MérnökSzem MVP  
**Cél:** regression corpus, ground truth és release teszt manifest  
**Dátum:** 2026-09-10  
**Státusz:** v1.0 munkaverzió, mintafájlok kijelölése szükséges  

## 1. Dokumentum célja

Ez a manifest meghatározza, milyen mintadokumentumokon kell a MérnökSzem MVP-t tesztelni.

Fontos: ez a fájl nem tartalmazhat kitalált mennyiségeket. Ha egy expected value nincs validált forrásból, akkor `TBD_VALIDATION_REQUIRED` státuszú.

## 2. Regression cél

A regression teszt célja nem az, hogy az AI "jónak tűnjön".

A cél:

- mérhető legyen, hogy a rendszer nem romlik verzióról verzióra;
- a mért mennyiségek visszavezethetők legyenek tervlapra és geometriára;
- a BOQ összevetés reprodukálható legyen;
- a validációs gate-ek ne legyenek megkerülhetők;
- az export csak elfogadott és forrásolt mennyiségeket tartalmazzon.

## 3. Kötelező corpus szerkezet

Javasolt mappastruktúra:

```text
docs/regression/
  corpus_manifest.md
  sample_projects/
    MS_SAMPLE_PROJECT_001/
      drawings/
      boq/
      specs/
      expected/
      screenshots/
      notes.md
    MS_SAMPLE_PROJECT_002/
      drawings/
      boq/
      specs/
      expected/
      screenshots/
      notes.md
    MS_SAMPLE_PROJECT_003/
      drawings/
      boq/
      specs/
      expected/
      screenshots/
      notes.md
```

## 4. Kötelező sample típusok

| Sample típus | Minimum darab | Miért kell? | Státusz |
| --- | --- | --- | --- |
| Egyszerű alaprajz PDF | 1 | PDF viewer, scale, polygon/polyline mérés | Kijelölendő |
| Többoldalas terv PDF | 1 | oldalválasztás, dokumentum feldolgozás | Kijelölendő |
| Valós magyar BOQ XLSX | 1 | BOQ import és oszlopmapping | Kijelölendő |
| Terv + BOQ pár | 1 | BOQ compare regression | Kijelölendő |
| Hibás/hiányos BOQ | 1 | validation és import hibatűrés | Kijelölendő |
| Scale-problémás PDF | 1 | missing/uncertain scale gate | Kijelölendő |

## 5. Már ismert lehetséges forrásanyagok

Az alábbi fájlok korábbi munkákból azonosítottak, de regression corpusba csak akkor kerülhetnek, ha a felhasználó kijelöli őket és a használat jogilag/szakmailag vállalható.

| Lehetséges forrás | Típus | Felhasználható mire? | Státusz |
| --- | --- | --- | --- |
| `MS_MVP_BENCHMARK_AND_GROUND_TRUTH_PACK_v1.0.1.docx` | DOCX | benchmark módszertan, ground truth irány | Megvan, tartalmát sessionben külön ellenőrizni kell |
| `MS_PRJ005_P01_P04_MOSONI_TELEPEK_RAW_KNOWLEDGE_HARVEST_v1.0.docx` | DOCX | valós projekt knowledge harvest | Megvan, sample kijelölés szükséges |
| `P02_Mosonszolnok_ajanlati_osszehasonlitas_mester_v1.xlsx` | XLSX | BOQ/ártükör/import minta | Lehetséges, validálás szükséges |
| `P02_Mosonszolnok_artukor_javitott_III_kor_megtakaritassal.xlsx` | XLSX | táblázatos tender/BOQ minta | Lehetséges, validálás szükséges |
| `Architectural_QTO.xlsx` | XLSX | assembly/QTO referencia | Külföldi/módszertani minta, magyar szabályként tilos |
| `Civil_Quantity_Take_off.xlsx` | XLSX | civil QTO referencia | Külföldi/módszertani minta, magyar szabályként tilos |

## 6. Sample project manifest template

Minden sample projekthez ezt kell kitölteni:

```yaml
sample_project_id: MS_SAMPLE_PROJECT_001
name: TBD
source_project: TBD
permission_status: TBD
document_set:
  drawings:
    - file_name: TBD
      document_type: drawing_pdf
      page_count: TBD
      scale_known: TBD
      scale_source: TBD
  boq:
    - file_name: TBD
      document_type: boq_xlsx
      sheet_names: TBD
      columns_available: TBD
  specs:
    - file_name: TBD
      document_type: spec_pdf_or_docx
      optional: true
expected_measurements:
  status: TBD_VALIDATION_REQUIRED
  reviewed_by: TBD
  reviewed_at: TBD
```

## 7. Measurement ground truth schema

Minden validált measurement ilyen struktúrában kerüljön be:

```yaml
measurement_id: GT-001
sample_project_id: MS_SAMPLE_PROJECT_001
drawing_file: TBD
page_number: TBD
element_type: floor_area|wall_length|wall_area|count
measurement_type: area|length|surface_area|count
expected_value: TBD_VALIDATION_REQUIRED
unit: m2|m|db
tolerance_absolute: TBD
tolerance_percent: TBD
source_method: manual_verified|calculated_from_plan|boq_reference|expert_review
reviewed_by: TBD
review_date: TBD
notes: TBD
```

## 8. P0 regression test cases

| Test ID | Teszt | Input | Expected | Státusz |
| --- | --- | --- | --- | --- |
| REG-PDF-001 | PDF feltöltés | Egyszerű alaprajz PDF | dokumentum státusz `uploaded/processed` | Sample hiányzik |
| REG-PDF-002 | Többoldalas PDF oldallista | Többoldalas terv | helyes page count | Sample hiányzik |
| REG-SCALE-001 | Manuális scale confirmation | PDF + user scale | confirmed scale rekord | Implementáció után |
| REG-SCALE-002 | Scale nélküli export blokk | dimenzionális mérés scale nélkül | blocking ERROR | Implementáció után |
| REG-GEO-001 | Polygon area | ismert négyszög | expected m² | Expected érték kitöltendő |
| REG-GEO-002 | Polyline length | ismert vonallánc | expected m | Expected érték kitöltendő |
| REG-GEO-003 | Count marker | ismert pontszám | expected db | Expected érték kitöltendő |
| REG-RULE-001 | Floor area rule | Q1 area | Q2 area | Rule validálás szükséges |
| REG-RULE-002 | Wall length rule | Q1 length | Q2 length | Rule validálás szükséges |
| REG-RULE-003 | Wall area rule | length × height | expected m² | Rule validálás szükséges |
| REG-BOQ-001 | BOQ XLSX import | kijelölt BOQ | sorok száma, oszlopok | Sample hiányzik |
| REG-BOQ-002 | Unit mismatch | measurement + BOQ eltérő unit | ERROR | Implementáció után |
| REG-BOQ-003 | Deviation calculation | measurement vs BOQ | abs + % eltérés | Expected érték kitöltendő |
| REG-EXPORT-001 | XLSX export | accepted measurements | megnyitható Excel | Implementáció után |
| REG-EXPORT-002 | Blocking finding export tiltás | ERROR finding | export blocked | Implementáció után |
| REG-CHAT-001 | Chat export blokk magyarázat | blocked project | magyarázó válasz | Implementáció után |

## 9. Release minimum corpus

MVP pilot előtt legalább:

- 3 sample project;
- 3 PDF terv;
- 2 BOQ XLSX;
- 20 validált measurement;
- 5 validált BOQ compare eset;
- 5 negatív teszt;
- 1 export expected file;
- 1 manuális QA jegyzőkönyv.

## 10. Elfogadható tolerance mezők

Konkrét tolerance értékek még nincsenek validálva, ezért itt nem adok kitalált számokat.

Kitöltendő:

| Kategória | Absolute tolerance | Percent tolerance | Döntéshozó |
| --- | --- | --- | --- |
| Padlóterület | TBD | TBD | TBD |
| Falhossz | TBD | TBD | TBD |
| Falfelület | TBD | TBD | TBD |
| Darabszám | TBD | TBD | TBD |
| BOQ eltérés warning küszöb | TBD | TBD | TBD |

## 11. QA futtatási jegyzőkönyv template

```markdown
# QA_RUN_[date]_[version]

Repo commit: TBD
Build version: TBD
Tester: TBD
Date: TBD

## Corpus
- MS_SAMPLE_PROJECT_001: PASS/FAIL
- MS_SAMPLE_PROJECT_002: PASS/FAIL
- MS_SAMPLE_PROJECT_003: PASS/FAIL

## Test summary
- Total tests:
- Passed:
- Failed:
- Blocked:

## Critical failures
- TBD

## Release decision
- GO / NO-GO
```

## 12. Kérdéslista

1. Melyik három valós projekt legyen a regression corpus alapja?
2. Melyik PDF-ek használhatók jogszerűen fejlesztési és tesztelési célra?
3. Melyik BOQ XLSX legyen az első import baseline?
4. Ki validálja a 20 első ground truth measurementet?
5. Milyen pontossági tolerancia legyen padlóterületre?
6. Milyen pontossági tolerancia legyen falhosszra?
7. Milyen pontossági tolerancia legyen falfelületre?
8. A darabszám P0 vagy P1 legyen?
9. Melyik exportformátum legyen az első elvárt végoutput?
10. Kell-e anonimizálni a valós projektadatokat?
