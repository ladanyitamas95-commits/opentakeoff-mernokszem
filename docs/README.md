# MérnökSzem fejlesztési dokumentáció

Ez a könyvtár tartalmazza a MérnökSzem TakeOff fejlesztési dokumentáció munkastruktúráját.

## Könyvtárindex

- `product/` = authoritative product scope és screen requirements.
- `architecture/` = technikai architektúra és ADR.
- `takeoff/` = measurement/geometry domain.
- `development/` = fejlesztési workflow és agent orchestration.
- `brand/` = validált MérnökSzem arculat.
- `regression/` = ground truth, regression és QA.
- `references/` = nem-authoritative referenciaanyag.
- `generated/` = AI által generált, még nem validált munkadokumentum.

## Validációs szabályok

REFERENCE != AUTHORITATIVE

GENERATED != VALIDATED

A `references/` alatti anyag döntéstámogató referencia lehet, de nem határoz meg product rule-t, amíg nem kerül át authoritative dokumentumba.

A `generated/` alatti anyagot használat előtt ellenőrizni és validálni kell.

## Source Document Registry

| Dokumentum neve | Repository útvonal | Kategória | Státusz | Verzió | Rövid szerep |
| --- | --- | --- | --- | --- | --- |
| MS_MVP_FINAL_SCOPE_LOCK_v1.0.md | `docs/product/MS_MVP_FINAL_SCOPE_LOCK_v1.0.md` | AUTHORITATIVE | AUTHORITATIVE | v1.0 | MVP scope lock forrásdokumentum. |
| MS_MVP_SCREEN_SPEC_v1.0.md | `docs/product/MS_MVP_SCREEN_SPEC_v1.0.md` | AUTHORITATIVE | AUTHORITATIVE | v1.0 | MVP screen specification forrásdokumentum. |
| MS_MernokSzem_MVP_integracios_terv_v1.0.md | `docs/architecture/MS_MernokSzem_MVP_integracios_terv_v1.0.md` | AUTHORITATIVE | AUTHORITATIVE | v1.0 | MVP integrációs terv forrásdokumentum. |
| MS_AI_Development_Orchestration_Plan_v1.0.md | `docs/architecture/MS_AI_Development_Orchestration_Plan_v1.0.md` | UNKNOWN | MISSING_SOURCE | v1.0 | Kért orchestration plan, a forrásmappában nem található. |
| MérnökSzem TakeOff – AI-Assisted Falhossz- és Területmérés Funkcionális Specifikáció v0.2.md | `docs/takeoff/MernokSzem_TakeOff_AI_Assisted_Falhossz_Terulet_v0.2.md` | AUTHORITATIVE | AUTHORITATIVE | v0.2 | TakeOff falhossz- és területmérés funkcionális specifikáció. |
| CODEX_INPUT_PACK_INDEX_v1.0.md | `docs/development/CODEX_INPUT_PACK_INDEX_v1.0.md` | AUTHORITATIVE | AUTHORITATIVE | v1.0 | Codex input pack index. Forrásfájlnév: `CODEX_INPUT_PACK_INDEX_v1.0 (1).md`. |
| CODEX_BUILD_PLAN_MS_MVP_v1.0.md | `docs/development/CODEX_BUILD_PLAN_MS_MVP_v1.0.md` | AUTHORITATIVE | AUTHORITATIVE | v1.0 | MVP build plan forrásdokumentum. |
| MS_MVP_REGRESSION_CORPUS_MANIFEST_v1.0.md | `docs/regression/MS_MVP_REGRESSION_CORPUS_MANIFEST_v1.0.md` | AUTHORITATIVE | AUTHORITATIVE | v1.0 | Regression corpus manifest. |
| MernokSzem_BrandBook_v1.0_brandcsalad.docx | `docs/brand/source/MernokSzem_BrandBook_v1.0_brandcsalad.docx` | UNKNOWN | MISSING_SOURCE | v1.0 | Kért Brand Book DOCX, a forrásmappában nem található. |
| Architectural_QTO_HU.xlsx | `docs/references/qto/Architectural_QTO_HU.xlsx` | REFERENCE | REFERENCE | n/a | Architectural QTO workbook referencia. |
| Civil_Quantity_Take_off_HU.xlsx | `docs/references/qto/Civil_Quantity_Take_off_HU.xlsx` | REFERENCE | REFERENCE | n/a | Civil QTO workbook referencia. |
| HVAC_Quantity_Take_off_HU.xlsx | `docs/references/qto/HVAC_Quantity_Take_off_HU.xlsx` | REFERENCE | REFERENCE | n/a | HVAC QTO workbook referencia. |
| Electrical_Quantity_Take_off_HU.xlsx | `docs/references/qto/Electrical_Quantity_Take_off_HU.xlsx` | REFERENCE | REFERENCE | n/a | Electrical QTO workbook referencia. |
| Plumbing_Quantity_Take_off_HU.xlsx | `docs/references/qto/Plumbing_Quantity_Take_off_HU.xlsx` | REFERENCE | REFERENCE | n/a | Plumbing QTO workbook referencia. |
