# Parallel Workstream Map

Ez a térkép a Phase 00 repository audit alapján rögzíti, mely területek fejleszthetők párhuzamosan és hol kell single-owner kontroll. A dokumentum nem indít implementációt.

## Szerepek

| Szerep | Megengedett Phase 00/WAVE előkészítő szerep |
| --- | --- |
| CODEX | Repository baseline, szerződésfagyasztás, architektúra, regressziós/test stratégia, kritikus shared module kontroll |
| COPILOT | Komponens- vagy helper-szintű implementáció csak lefagyasztott contract után |
| LOVABLE_REFERENCE_ONLY | Vizuális referencia/prototípus, nem authoritative source és nem automatikus kódforrás |
| SINGLE_OWNER_REQUIRED | Olyan fájlok/területek, ahol párhuzamos szerkesztés nagy regressziós kockázat |

## Workstream térkép

| Workstream | Javasolt tulajdonos | Párhuzamosítható? | Függőség / megjegyzés |
| --- | --- | --- | --- |
| Authoritative contract freeze | CODEX | Nem | WAVE 1 előtt szükséges |
| Project/document backend contract | CODEX | Korlátozottan | Auth, persistence, audit, document identity függ tőle |
| Frontend shell és routing | SINGLE_OWNER_REQUIRED | Nem ajánlott | `web/src/main.jsx`, route/gate logika |
| PDF viewer és upload flow | CODEX + komponens owner | Részben | `TakeoffCanvas.jsx` miatt koordináltan |
| Scale calibration UX | SINGLE_OWNER_REQUIRED | Nem ajánlott | Measurement és validation contract előtt kockázatos |
| Geometry/measurement engine | CODEX | Nem, amíg contract nincs fagyasztva | SI/Decimal és regression corpus szükséges |
| BOQ import/compare | CODEX | Contract után igen | Measurement és BOQ schema függőség |
| Export schema | CODEX | Korlátozottan | CSV/JSON/XLSX/PDF golden tesztekhez kötött |
| AI assistant UI | Single owner + reference reviewer | Részben | Human-in-the-loop policy és secret handling függőség |
| AI proposal review | CODEX | Contract után részben | ReviewItem, ValidationFinding és AuditEvent szükséges |
| Brand/design token | UI owner | Igen, ha csak token/theme | Ne keveredjen canvas logic módosítással |
| Regression tests | CODEX | Igen | Failing localized tests rendezése külön kör |
| Docs/generated audit | CODEX | Igen | Nem authoritative, amíg nincs validálva |

## Parallelization matrix

| Workstream | Modules/files | Dependencies | Safe parallel? | Conflict risk | Recommended owner | Required prerequisite |
| --- | --- | --- | --- | --- | --- | --- |
| Project core | `web/src/main.jsx`, project gate/store integration | Project, tenant/auth, storage contract | No | HIGH | CODEX | Project/Document contract freeze |
| Auth/backend | `server/app.py`, auth/provider modules, future backend files | auth, tenant, API, storage | No | CRITICAL | CODEX | Auth and API boundary decision |
| PDF viewer | `web/src/pages/TakeoffCanvas.jsx`, PDF helpers | document/page identity, canvas state | Limited | HIGH | SINGLE_OWNER_REQUIRED | DocumentPage contract |
| Document upload | `web/src/main.jsx`, `web/src/lib/store.js`, upload UI | persistence contract, provider decision | Limited | HIGH | SINGLE_OWNER_REQUIRED | Document storage contract |
| Scale calibration | `TakeoffCanvas.jsx`, `web/src/lib/sheets.ts`, scale state | CoordinateSystem, ScaleCalibration | No | CRITICAL | SINGLE_OWNER_REQUIRED | Scale contract freeze |
| Geometry engine | `web/src/lib/geometry.js`, `shapeMetrics.js`, `units.ts` | SI/Decimal policy, regression corpus | No | CRITICAL | CODEX | MeasurementGeometry contract |
| TakeoffCanvas | `web/src/pages/TakeoffCanvas.jsx` | nearly all frontend takeoff state | No | CRITICAL | SINGLE_OWNER_REQUIRED | File owner and change plan |
| Measurement review | proposal/review/RFI code paths | ReviewItem, ValidationFinding, AuditEvent | Limited | HIGH | CODEX | Review contract freeze |
| Validation | geometry guards, tests, future validation modules | measurement and scale contracts | Yes after contracts | MEDIUM | CODEX | Regression corpus |
| BOQ | export/report modules and future BOQ modules | BOQ/BOQItem schema, measurement totals | Yes after contracts | HIGH | CODEX | BOQ contract freeze |
| Export | `totals.js`, `shapesExport.js`, `rfi.js`, `xlsx.js` | locale/schema policy, golden tests | Limited | HIGH | CODEX | Export schema freeze |
| AI assistant | `web/src/lib/ai.js`, AI UI in canvas | secret policy, provider routing, review policy | Limited | HIGH | SINGLE_OWNER_REQUIRED | AI security decision |
| AI proposal | proposal modules/state | ReviewItem, AuditEvent, confidence policy | Limited | HIGH | CODEX | Human review contract |
| Tests | `web/test/*`, server/mcp tests | expected locale/schema decisions | Yes | MEDIUM | CODEX | Decide golden output language |
| UI shell | styles/theme/components outside canvas | brand tokens and routing boundaries | Yes | MEDIUM | COPILOT | Brand token scope |

## Konfliktus hotspotok

| Terület | Kockázat | Miért hotspot? | Szabály |
| --- | --- | --- | --- |
| `web/src/pages/TakeoffCanvas.jsx` | Kritikus | fő UI, canvas, sheet, scale, shape, RFI, AI/proposal állapot egy fájlban | Single owner |
| `web/src/lib/geometry.js` | Kritikus | alap geometriai számítások | Contract + regression nélkül ne módosuljon |
| `web/src/lib/shapeMetrics.js` | Kritikus | mennyiségi számítások és szerepek | SI/Decimal policy előtt ne legyen refactor |
| `web/src/lib/units.ts` | Magas | display/internal unit határ | Unit policy owner |
| `web/src/lib/store.js` | Magas | IndexedDB schema és persistence | Migrációs szabály nélkül ne változzon |
| `web/src/lib/totals.js` | Magas | riport és export schema | Golden teszt frissítéssel együtt |
| `web/src/lib/shapesExport.js` | Magas | shape CSV/JSON export | Schema freeze szükséges |
| `web/src/lib/rfi.js` | Magas | RFI státusz/export | Locale és schema szétválasztás |
| `web/package.json`, lockfile | Kritikus | minden workflow-t érint | Egy owner, dependency upgrade külön feladat |
| `mcp/package.json`, `mcp/src/*` | Magas | MCP tool contract | Tool schema freeze szükséges |
| `server/app.py` | Közepes/Magas | sandbox AI endpoint és security | Production backenddel ne keveredjen |
| `.github/workflows/ci.yml` | Magas | minden baseline ellenőrzés | Tesztállapot ismert kezelése nélkül ne módosuljon |

## Contract freeze checklist

WAVE 1 előtt legalább az alábbiakat kell lezárni:

1. Project identity és tenant/auth határ.
2. Document és DocumentPage azonosító.
3. CoordinateSystem és normalized geometry policy.
4. ScaleCalibration: forrás, megerősítés, érvényesség, audit.
5. Measurement: geometry, quantity, unit, status, source, confidence.
6. ValidationFinding és ReviewItem.
7. BOQ és BOQItem.
8. AuditEvent és immutable revision.
9. Export schema és locale policy.

## GO / NO-GO baseline

| Döntés | Állapot |
| --- | --- |
| WAVE 1 előkészítés | CONDITIONAL GO |
| Közvetlen feature implementáció contract nélkül | NO-GO |
| Párhuzamos canvas/geometry munka ownership nélkül | NO-GO |
| Tesztfrissítés külön körként | GO |
| Dokumentációs baseline folytatása | GO |
