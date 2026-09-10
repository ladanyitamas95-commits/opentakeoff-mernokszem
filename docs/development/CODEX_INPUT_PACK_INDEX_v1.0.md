# CODEX_INPUT_PACK_INDEX_v1.0

**Projekt:** MérnökSzem MVP  
**Cél:** Codex fejlesztési inputcsomag indexe  
**Dátum:** 2026-09-10  
**Státusz:** v1.0 munkaverzió  

## 1. Dokumentum célja

Ez a fájl megmondja, hogy Codex melyik fejlesztési feladathoz melyik forrásdokumentumot használja.

Kemény szabály: Codexnek nem szabad minden munkamenetben az összes MérnökSzem dokumentumot újraértelmeznie. Egy 5 órás Codex futásban maximum a szükséges 2-5 forrásfájlt kell megnyitni.

## 2. Használati szabály Codex számára

Minden Codex session elején:

1. Olvasd el ezt az indexet.
2. Olvasd el az aktuális sessionhöz tartozó build plan részt.
3. Olvasd el a scope lockot.
4. Csak akkor nyiss meg további dokumentumot, ha az adott session acceptance criteria-ja megköveteli.
5. Ha hiányzó döntést találsz, ne találd ki. Írd be `BLOCKED_DECISIONS.md` vagy `BACKLOG_NOTES.md` fájlba.

## 3. Kötelező alapcsomag minden fejlesztési sessionhöz

| Fájl | Szerep | Mikor kell? |
| --- | --- | --- |
| `CODEX_INPUT_PACK_INDEX_v1.0.md` | Navigációs index | Minden session |
| `CODEX_BUILD_PLAN_MS_MVP_v1.0.md` | 5 órás sessionökre bontott fejlesztési terv | Minden session |
| `MS_MVP_FINAL_SCOPE_LOCK_v1.0.md` | Scope-fék és tiltólista | Minden session |

## 4. Meglévő, azonosított forrásfájlok

Az alábbi fájlok jelenleg rendelkezésre álló forrásként azonosítottak. Ha valamelyikből több verzió létezik, Codex mindig a legfrissebb, validált verziót használja, és jelezze, ha nem tudja eldönteni, melyik az.

| Fájl | Típus | Elsődleges felhasználás | Mikor kell Codexnek? |
| --- | --- | --- | --- |
| `MS_MernokSzem_MVP_integracios_terv_v1.0.md` | Markdown | Fő architektúra, adatmodell, API, 5 órás fejlesztési logika | Backend/API/adatmodell/session planning |
| `MS_MVP_SCOPE_FREEZE_v1.0.1.docx` | DOCX | MVP határok, P0/P1/P2/P3 scope | Minden scope-döntésnél |
| `MS_MVP_BENCHMARK_AND_GROUND_TRUTH_PACK_v1.0.1.docx` | DOCX | Pontosság, tesztelés, ground truth, benchmark | Regression, QA, takeoff minőség |
| `MernokSzem_MVP_Muszaki_Specifikacio_v1.1_brandcsalad.pdf` | PDF | Korábbi MVP műszaki specifikáció | Product/API/UI validálás |
| `MS_MASTER_KNOWLEDGE_INVENTORY_v1.4.1.docx` | DOCX | Tudásvagyon és projektlogika inventory | RAG, ontology, későbbi tudásbázis |
| `MernokSzem_BrandBook_v1.0_brandcsalad(2).docx` | DOCX | Arculat, színek, vizuális irány | UI, landing, report formázás |
| `MernokSzem-standalone-preview.html` | HTML | Korábbi UI/prototípus referencia | Frontend vizuális irány |
| `MernokSzem_Epitoipari_Audit_Asszisztens_AI_Spec_v1.0.docx` | DOCX | Audit-asszisztens AI működési logika | Chat/AI viselkedés |
| `MS_PRJ003_MVP_TAKEOFF_AI_RAW_KNOWLEDGE_HARVEST_v1.0.docx` | DOCX | Takeoff AI tudásanyag | Takeoff, AI proposal, mérési workflow |
| `MS_PRJ005_P01_P04_MOSONI_TELEPEK_RAW_KNOWLEDGE_HARVEST_v1.0.docx` | DOCX | Valós projektalapú tender/BOQ/takeoff tudás | Ground truth, BOQ compare, ÉPOS később |
| `MS_Atmos_ERP_versenyelemzes_MernokSzem_v1.0.md` | Markdown | Versenytárs- és scope-tanulságok | Scope stoplista, ERP-funkciók kizárása |

## 5. Újonnan létrehozott operatív fájlok

| Fájl | Mire való? |
| --- | --- |
| `CODEX_BUILD_PLAN_MS_MVP_v1.0.md` | Konkrét Codex munkacsomagok 5 órás limitekkel |
| `MS_MVP_FINAL_SCOPE_LOCK_v1.0.md` | Végleges MVP scope és tiltólista |
| `MS_MVP_REGRESSION_CORPUS_MANIFEST_v1.0.md` | Mintadokumentumok, ground truth és regressziós tesztstruktúra |
| `MS_MVP_SCREEN_SPEC_v1.0.md` | MVP képernyők, UI állapotok és acceptance criteria |

## 6. Sessionenként ajánlott dokumentumkombináció

| Session | Olvasandó minimum fájlok |
| --- | --- |
| Repo audit | `CODEX_BUILD_PLAN_MS_MVP_v1.0.md`, `MS_MVP_FINAL_SCOPE_LOCK_v1.0.md`, meglévő repo README |
| Project Core | `CODEX_BUILD_PLAN_MS_MVP_v1.0.md`, `MS_MVP_FINAL_SCOPE_LOCK_v1.0.md`, `MS_MernokSzem_MVP_integracios_terv_v1.0.md` |
| Document Upload | `CODEX_BUILD_PLAN_MS_MVP_v1.0.md`, `MS_MVP_SCREEN_SPEC_v1.0.md`, `MS_MernokSzem_MVP_integracios_terv_v1.0.md` |
| PDF Viewer / Takeoff | `CODEX_BUILD_PLAN_MS_MVP_v1.0.md`, `MS_MVP_SCREEN_SPEC_v1.0.md`, `MS_PRJ003_MVP_TAKEOFF_AI_RAW_KNOWLEDGE_HARVEST_v1.0.docx` |
| Rule Engine | `CODEX_BUILD_PLAN_MS_MVP_v1.0.md`, `MS_MernokSzem_MVP_integracios_terv_v1.0.md`, `MS_MVP_FINAL_SCOPE_LOCK_v1.0.md` |
| Regression | `MS_MVP_REGRESSION_CORPUS_MANIFEST_v1.0.md`, `MS_MVP_BENCHMARK_AND_GROUND_TRUTH_PACK_v1.0.1.docx` |
| UI styling | `MS_MVP_SCREEN_SPEC_v1.0.md`, `MernokSzem_BrandBook_v1.0_brandcsalad(2).docx`, `MernokSzem-standalone-preview.html` |
| Chat / AI assistant | `MernokSzem_Epitoipari_Audit_Asszisztens_AI_Spec_v1.0.docx`, `CODEX_BUILD_PLAN_MS_MVP_v1.0.md`, `MS_MVP_FINAL_SCOPE_LOCK_v1.0.md` |

## 7. Hiányzó vagy még nem véglegesített fájlok

| Hiányzó fájl | Miért fontos? | Jelenlegi státusz |
| --- | --- | --- |
| `MS_BRAND_TOKENS_v1.0.json` | Gépileg olvasható színek, betűméretek, spacing, komponens tokenek | Hiányzik |
| `MS_MVP_API_CONTRACT_v1.0.yaml` | Konkrét OpenAPI-szerű API contract | Hiányzik |
| `MS_MVP_DATABASE_SCHEMA_v1.0.sql` | Konkrét DB táblák és indexek | Hiányzik |
| `README_DEV.md` | Helyi indítás, tesztelés, környezeti változók | Repo hiányában nem ismert |
| `.env.example` | Lokális fejlesztési env minta | Repo hiányában nem ismert |
| `MS_UI_REFERENCE_SCREENSHOTS/` | UI referencia képernyők | Hiányzik vagy nincs kijelölve |
| `MS_SAMPLE_PROJECT_001/` | PDF + BOQ + expected output csomag | Hiányzik / nincs kijelölve |
| `BLOCKED_DECISIONS.md` | Fejlesztés közben felmerülő döntési blokkok | Létrehozandó repóban |
| `BACKLOG_NOTES.md` | Scope-on kívüli ötletek gyűjtése | Létrehozandó repóban |

## 8. Codexnek tilos

- régi és új dokumentumok konfliktusát önállóan eldönteni;
- hiányzó mérési szabályt magyar szabályként kitalálni;
- validált brandbook hiányában új arculatot kitalálni;
- minta PDF/BOQ hiányában pontossági állítást tenni;
- MVP scope-on kívüli ERP funkciót fejleszteni;
- AI-javaslatot automatikusan jóváhagyott mérésként kezelni.

## 9. Kérdéslista

1. Melyik a végleges, Codex által használandó brandbook: `brandcsalad`, `navy`, vagy másik verzió?
2. Melyik 3-5 valós PDF terv legyen az első regression corpus része?
3. Melyik BOQ XLSX legyen az első standard importteszt?
4. Van-e már GitHub repository, vagy Codexnek nulláról kell scaffoldolnia?
5. A frontend alapja a jelenlegi OpenTakeoff fork legyen, vagy tiszta Vite/React újraépítés?
6. A backend első körben FastAPI + PostgreSQL legyen-e végleges döntésként rögzítve?
7. Ki validálja szakmailag a magyar mérési szabályokat?
8. Milyen maximális eltérést fogadunk el kategóriánként az MVP-ben?
9. Melyik legyen az első pilot projekt?
10. A MérnökSzem név, logó és színrendszer véglegesnek tekinthető-e?
