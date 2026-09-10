# MS_MVP_SCREEN_SPEC_v1.0

**Projekt:** MérnökSzem MVP  
**Cél:** MVP képernyőspecifikáció Codex/frontend fejlesztéshez  
**Dátum:** 2026-09-10  
**Státusz:** v1.0 munkaverzió  

## 1. Dokumentum célja

Ez a dokumentum meghatározza a MérnökSzem MVP kötelező képernyőit, állapotait és acceptance criteria-ját.

Ez nem végleges UI design és nem brandbook. A vizuális stílust a validált brandbookból kell átvenni. Ha a brandbook verziója nem egyértelmű, Codex nem találhat ki új arculatot.

## 2. UI alapelv

A fő felhasználói élmény:

- projektalapú munkafelület;
- PDF tervnéző és mérő canvas;
- BOQ import és összevetés;
- review queue;
- jobb oldali vagy alsó chat asszisztens;
- export.

Az MVP nem marketing landing page. A nyitóképernyő használható munkafelület legyen.

## 3. Globális layout

Javasolt desktop layout:

```text
Left sidebar: Project / Documents / Takeoff / BOQ / Review / Export
Top bar: Project selector, search, status, user
Main area: active workspace
Right panel: Chat / Findings / Context
```

Mobil/tablet teljes optimalizáció P0-ban nem kötelező, de a felület ne törjön szét 1366px szélességen.

## 4. Globális komponensek

| Komponens | Kötelező? | Megjegyzés |
| --- | --- | --- |
| Project selector | Igen | Aktív projekt váltása |
| Sidebar navigation | Igen | Stabil modulnavigáció |
| Status badge | Igen | uploaded, processed, review, accepted, error |
| Confidence badge | Igen | ahol AI/proposal szerepel |
| Validation badge | Igen | PASS/WARNING/ERROR/REVIEW |
| Toast / alert | Igen | mentés, hiba, blokkolás |
| Loading state | Igen | upload, process, export |
| Empty state | Igen | nincs projekt/dokumentum/measurement |
| Error state | Igen | feldolgozási és API hibák |
| Audit hint | Opcionális | később részletes napló |

## 5. Screen 01 – Project Home

### Cél

A felhasználó lássa a projektjeit, és tudjon új projektet létrehozni.

### Kötelező UI elemek

- projektlista;
- `Új projekt` gomb;
- projekt név;
- státusz;
- létrehozás dátuma;
- utolsó módosítás dátuma;
- üres állapot;
- hibaállapot.

### Kötelező műveletek

- projekt létrehozás;
- projekt megnyitás;
- projektlista frissítés.

### Acceptance criteria

- üres projektlista esetén egyértelmű CTA jelenik meg;
- új projekt létrehozás után a workspace megnyílik;
- üres projektnevet nem enged;
- API hiba látható.

## 6. Screen 02 – Project Workspace

### Cél

Egy projekt központi irányítópultja.

### Kötelező panelek

- dokumentumok;
- takeoff státusz;
- BOQ státusz;
- review queue rövid lista;
- export státusz;
- chat panel.

### Gyorsműveletek

- `Terv feltöltése`;
- `BOQ import`;
- `Mérés indítása`;
- `Review queue megnyitása`;
- `Export`.

### Acceptance criteria

- a felhasználó 1 kattintással eléri a feltöltést;
- látszik, ha export blokkolva van;
- látszik, ha nincs confirmed scale;
- chatből kérdezhető a projekt állapota.

## 7. Screen 03 – Document Upload

### Cél

PDF és XLSX dokumentum feltöltése.

### Kötelező UI elemek

- drag-and-drop upload;
- fájl kiválasztás;
- dokumentumtípus: drawing, BOQ, spec, other;
- upload progress;
- feldolgozási státusz;
- hibaüzenetek.

### Acceptance criteria

- PDF feltölthető drawingként;
- XLSX feltölthető BOQ-ként;
- nem támogatott fájltípus elutasítva;
- duplikált fájl hash jelölhető;
- upload után dokumentumlista frissül.

## 8. Screen 04 – Drawing Viewer

### Cél

PDF tervlap megtekintése.

### Kötelező UI elemek

- PDF canvas;
- oldalválasztó;
- zoom in/out;
- pan;
- fit to width;
- current page indicator;
- scale status badge;
- measurement toolbar.

### Acceptance criteria

- többoldalas PDF-nél oldal váltható;
- zoom és pan működik;
- a scale státusz mindig látható;
- hiba esetén nem üres fehér canvas marad, hanem error state.

## 9. Screen 05 – Scale Review

### Cél

Lépték rögzítése és jóváhagyása.

### Kötelező UI elemek

- aktuális page;
- scale source;
- manual scale input;
- known dimension calibration input;
- confidence, ha van suggestion;
- `Confirm scale`;
- `Reject suggestion`;
- warning, ha több lehetséges scale van.

### Acceptance criteria

- scale nélkül dimenzionális mérés nem exportálható;
- confirmed scale státusz egyértelműen látszik;
- user döntés auditálódik;
- rejected scale nem használható aktív méréshez.

## 10. Screen 06 – Takeoff Canvas

### Cél

Mérések rajzolása és szerkesztése.

### Kötelező eszközök

- select/move;
- polygon area;
- polyline length;
- count marker;
- delete;
- undo legalább session szinten, ha technikailag belefér;
- measurement label.

### Kötelező oldalsáv/panel

- aktív mérés típusa;
- q1 quantity;
- q2 quantity, ha rule alkalmazva;
- unit;
- rule id;
- status;
- validation findings;
- accept/edit/reject.

### Acceptance criteria

- polygon rajzolható;
- polyline rajzolható;
- count marker elhelyezhető;
- szerkesztés után szerver újraszámol;
- accepted státusz csak explicit user action után jön létre.

## 11. Screen 07 – Measurement Review

### Cél

Mérések emberi ellenőrzése.

### Kötelező UI elemek

- measurement lista;
- tervlap preview vagy ugrás a tervlapra;
- q1/q2 érték;
- confidence breakdown, ha van;
- validation findings;
- source reference;
- accept/edit/reject gomb.

### Acceptance criteria

- AI proposal nem tűnik végleges mérésnek;
- rejected measurement nem exportálódik;
- edit után új audit event készül;
- source reference hiányát jelzi.

## 12. Screen 08 – BOQ Import

### Cél

Költségvetési XLSX import és oszlopmapping.

### Kötelező UI elemek

- XLSX file selector;
- sheet selector;
- preview table;
- column mapping: code, description, unit, quantity, unit_rate optional, total optional;
- import validation;
- hibás sorok listája.

### Acceptance criteria

- legalább egy sheet importálható;
- kötelező mezők hiánya blokkol;
- eredeti sorindex megmarad;
- hibás sorok nem vesznek el.

## 13. Screen 09 – BOQ Compare

### Cél

Elfogadott measurementek és BOQ sorok összevetése.

### Kötelező UI elemek

- BOQ item lista;
- measurement lista;
- manual mapping control;
- unit check;
- expected/actual/deviation;
- percentage deviation;
- warning badge;
- source jump.

### Acceptance criteria

- measurement BOQ sorhoz köthető;
- unit mismatch ERROR;
- eltérés abszolút és %-os;
- bizonytalan vagy hiányos mapping review queue-ba kerül.

## 14. Screen 10 – Review Queue

### Cél

Minden emberi döntésre váró tétel egy helyen.

### Kötelező item típusok

- missing scale;
- low confidence measurement;
- AI proposal;
- unit mismatch;
- BOQ deviation;
- missing source reference;
- export blocking error.

### Acceptance criteria

- severity szerint rendezhető;
- target elem megnyitható;
- decision action auditált;
- blocking item egyértelműen jelölt.

## 15. Screen 11 – Export

### Cél

Auditálható XLSX export indítása.

### Kötelező UI elemek

- export readiness checklist;
- blocking findings list;
- export button;
- export history;
- last export timestamp;
- download link.

### Export lapok

- Project Summary;
- Measurements;
- BOQ Compare;
- Validation Findings;
- Audit Trail;
- Sources.

### Acceptance criteria

- blocking finding esetén export gomb disabled;
- export fájl megnyitható;
- csak human verified accepted mérés kerül approvedként exportba;
- export előtt és után audit event készül.

## 16. Screen 12 – Chat Panel

### Cél

Projektkontextusú AI/support asszisztens.

### Kötelező képességek

- válaszol programhasználati kérdésre;
- megmondja, mi blokkolja az exportot;
- összefoglalja a measurement státuszt;
- elmagyarázza BOQ eltérést;
- suggested action-t ad.

### Tilos

- measurement automatikus elfogadása;
- magyar szabály kitalálása;
- confidence nélküli biztos állítás;
- jogi vagy pénzügyi döntés végleges tanácsként.

### Acceptance criteria

- structured response schema szerint válaszol;
- export blokk okát konkrétan megnevezi;
- kattintható/suggested action célokat ad;
- nem lépi át a scope lockot.

## 17. Brand és vizuális döntések

Jelenleg ismert brand információk korábbi munkákból:

- MérnökSzem név;
- zöld/szürke irány többször előfordult korábbi anyagokban;
- brandbook fájl létezik, de végleges verziót ki kell jelölni.

Nem szabad kitalálni:

- új logót;
- új színpalettát;
- új tipográfiát;
- új ikonrendszert;
- marketing copyt.

Szükséges külön fájl:

```text
MS_BRAND_TOKENS_v1.0.json
```

## 18. Reszponzivitás

P0 minimum:

- 1366 px desktop használható;
- 1920 px desktop használható;
- tablet ne törjön szét, de nem teljes optimalizáció;
- mobil nem P0, csak később.

## 19. Üres, loading és error állapotok

Minden képernyőn kötelező:

| Állapot | Kötelező viselkedés |
| --- | --- |
| Empty | Megmondja, mi a következő lépés |
| Loading | Nem ugrál a layout |
| Error | Konkrét hibaüzenet és retry, ha értelmes |
| Blocked | Megmondja, milyen feltétel hiányzik |
| Success | Rövid visszajelzés |

## 20. Kérdéslista

1. Melyik brandbook verzió a végleges?
2. Legyen-e jobb oldali fix chat panel, vagy alsó drawer?
3. P0-ban kell-e tablet optimalizáció iPadre?
4. A meglévő `MernokSzem-standalone-preview.html` vizuális irányát kötelező követni?
5. Melyik legyen az első demo képernyő: Project Home vagy konkrét Takeoff Workspace?
6. Kell-e dark mode MVP-ben? Javaslat: nem.
7. Kell-e role-based UI MVP-ben? Ha igen, melyik szerepek?
8. Mi legyen az elfogadott magyar UI terminológia: `mérés`, `mennyiségfelmérés`, `takeoff`, `kimérés`?
