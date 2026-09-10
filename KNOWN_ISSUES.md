# Known Issues

Ez a fájl a Phase 00 repository baseline során ténylegesen megfigyelt ismert problémákat rögzíti. Nem backlog-prioritási lista, hanem audit-alapú állapotfelvétel.

## P0 / P1 jellegű termékkockázatok

| ID | Súly | Terület | Megfigyelés | Érintett fájlok/területek |
| --- | --- | --- | --- | --- |
| KI-001 | P0/P1 | Mérési authority | A jelenlegi mérési motor frontend/lib oldali, belső számításai imperial alapúak; a MérnökSzem authoritative SI/Decimal production measurement engine még nincs külön backend/domain szerződésként megvalósítva. | `web/src/lib/shapeMetrics.js`, `web/src/lib/units.ts`, `web/src/lib/geometry.js` |
| KI-002 | P0/P1 | Backend persistence | Nincs megfigyelt production backend adatmodell projekt/dokumentum/mérés/BOQ/audit entitásokra; a jelenlegi tárolás főként böngészős IndexedDB/localStorage és opcionális Drive/M365/File System Access alapú. | `web/src/lib/store.js`, `web/src/main.jsx`, `server/app.py` |
| KI-003 | P1 | Teszt baseline | A web tesztcsomag 49 hibával futott, főként azért, mert korábbi magyarítás után a tesztek/golden elvárások még angol/OpenTakeoff szövegeket várnak. | `web/test/*`, `web/src/lib/totals.js`, `web/src/lib/rfi.js`, `web/src/lib/shapesExport.js` |
| KI-004 | P1 | UI konfliktusgóc | A fő tervmérő felület nagyon nagy, sok felelősséget tartalmazó komponensben található; párhuzamos fejlesztésnél single-owner kontroll szükséges. | `web/src/pages/TakeoffCanvas.jsx` |
| KI-005 | P1 | API/contract freeze | A Project, Document, ScaleCalibration, Measurement, ValidationFinding, ReviewItem, BOQ és AuditEvent szerződések még nem fagyasztott, authoritative formában vannak jelen a kódban. | `docs/architecture/adr/ADR-000-baseline.md` |

## Biztonsági és production readiness problémák

| ID | Súly | Terület | Megfigyelés | Érintett fájlok/területek |
| --- | --- | --- | --- | --- |
| KI-006 | P1 | AI kulcskezelés | A böngészős AI helper támogat localStorage/API-key és build-time `VITE_AI_KEY` alapú beállítást; ez production környezetben nem tekinthető biztonságos secret-kezelésnek. | `web/src/lib/ai.js`, `web/.env.example` |
| KI-007 | P1 | Google audience check | A Netlify schedule parser figyelmeztetéssel engedi, ha `GOOGLE_CLIENT_ID` nincs beállítva, így az audience ellenőrzés nem aktív. | `web/netlify/functions/parse-schedule.mjs` |
| KI-008 | P2 | Lokális adatvédelem | A PDF-ek és annotációk lokálisan IndexedDB-ben tárolódnak; ez local/demo módban hasznos, de production adatvédelmi modellnek nem elég. | `web/src/lib/store.js` |
| KI-009 | P2 | Sandbox CORS | A FastAPI sandbox széles CORS beállítással fut; az `/ai/*` útvonalak API-kulcsosak, de production publikálás előtt szűkítés szükséges. | `server/app.py` |

## Technikai adósság

| ID | Súly | Terület | Megfigyelés | Javasolt kezelés |
| --- | --- | --- | --- | --- |
| KI-010 | P1 | Monolit frontend állapot | A `TakeoffCanvas.jsx` nagy mennyiségű UI, canvas, proposal, scale, export, RFI és állapotlogikát tartalmaz. | WAVE 1 előtt file ownership és refactor freeze |
| KI-011 | P1 | BOQ | Canonical magyar BOQ import/compare pipeline nem látszik implementált production contractként. | BOQ szerződés és minimális vertical slice |
| KI-012 | P2 | Dependency reprodukálhatóság | A baseline worktree-ben nincs telepített dependency; offline install a helyi cache-ből nem sikerült. | Node/npm stratégia és CI-vel egyező install útvonal |
| KI-013 | P2 | Export lokalizáció drift | A magyarított export fejlécek és régi angol tesztelvárások eltérnek. | Golden testek explicit frissítése vagy dual-locale stratégia |
| KI-014 | P2 | Auth split | Google/Microsoft/local/File System Access belépési/tárolási utak párhuzamosan vannak jelen, production auth modell még nincs egységesítve. | Auth és tenant szerződés fagyasztása |
| KI-015 | P3 | Legacy branding drift | A repo több ponton még OpenTakeoff/legacy fogalmakat tartalmazhat, részben technikai azonosítóként. | Látható szöveg és belső azonosító szétválasztása |
