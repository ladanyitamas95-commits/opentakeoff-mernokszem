# Agent File Ownership

Status: DRAFT

Ez a dokumentum a Phase 00 baseline alapján rögzíti a párhuzamos agent munka fájl-szintű ütközésvédelmét. Nem jogosít fel automatikus feature implementációra.

## Alapszabályok

- Egy agent egyszerre csak a saját kijelölt fájlterületén dolgozzon.
- Shared contract, schema, measurement és export fájlok módosítása előtt explicit tulajdonost kell kijelölni.
- `TakeoffCanvas.jsx` módosítása alatt más agent ne módosítsa ugyanazt a fájlt.
- Dependency, lockfile, CI és routing változás csak külön, előre validált körben történjen.
- Reference vagy generated dokumentum nem írhatja felül az authoritative product/architecture/takeoff döntést.

## Single-owner fájlok

| Fájl / terület | Tulajdonosi szabály | Indok |
| --- | --- | --- |
| `web/src/pages/TakeoffCanvas.jsx` | SINGLE_OWNER_REQUIRED | monolit tervmérő UI és sok állapotlogika |
| `web/src/main.jsx` | SINGLE_OWNER_REQUIRED | routing, project gate, provider választás |
| `web/src/lib/store.js` | SINGLE_OWNER_REQUIRED | IndexedDB/localStorage schema és migráció |
| `web/src/lib/geometry.js` | SINGLE_OWNER_REQUIRED | alap geometria |
| `web/src/lib/shapeMetrics.js` | SINGLE_OWNER_REQUIRED | mennyiségi számítás |
| `web/src/lib/units.ts` | SINGLE_OWNER_REQUIRED | unit policy határ |
| `web/src/lib/totals.js` | SINGLE_OWNER_REQUIRED | report/export mennyiség aggregáció |
| `web/src/lib/shapesExport.js` | SINGLE_OWNER_REQUIRED | export schema |
| `web/src/lib/rfi.js` | SINGLE_OWNER_REQUIRED | RFI schema és státusz/export |
| `web/package.json`, lockfile | SINGLE_OWNER_REQUIRED | dependency és CI stabilitás |
| `package.json`, `package-lock.json` | SINGLE_OWNER_REQUIRED | dependency és root workflow stabilitás, ha létrejön vagy módosul |
| `mcp/package.json`, `mcp/src/*` | SINGLE_OWNER_REQUIRED | MCP tool contract |
| `.github/workflows/ci.yml` | SINGLE_OWNER_REQUIRED | CI baseline |
| `docs/development/DOMAIN_CONTRACT_REGISTRY.md` | CODEX owned / SINGLE_OWNER_REQUIRED | shared contract source of truth |
| `docs/architecture/adr/ADR-001-domain-contract-freeze.md` | CODEX owned | domain contract ADR |
| `docs/architecture/adr/ADR-002-unit-and-quantity-authority.md` | CODEX owned | unit/quantity authority ADR |
| `docs/architecture/adr/ADR-003-production-backend-auth-persistence.md` | CODEX owned | backend/auth/persistence boundary |
| DB migrations, ha létrejönnek | SINGLE_OWNER_REQUIRED | production adatvesztési és contract-kockázat |
| API schema / shared types, ha létrejönnek | SINGLE_OWNER_REQUIRED | frontend/backend kompatibilitás |
| export schema fájlok, ha létrejönnek | SINGLE_OWNER_REQUIRED | auditálható XLSX/CSV/JSON kompatibilitás |

## Draft ownership kategóriák

| Kategória | Fájlok/területek | Megjegyzés |
| --- | --- | --- |
| CODEX owned | architecture ADR, contract docs, regression policy, `docs/development/*`, critical domain docs | Authoritative döntés és baseline kontroll |
| COPILOT owned | izolált komponensek/helper módosítások lefagyasztott contract után | Csak pontos file scope-pal |
| LOVABLE_REFERENCE_ONLY | design referencia, vizuális koncepció, képernyőötlet | Nem írhat közvetlen production source contractot |
| SINGLE_OWNER_REQUIRED | `TakeoffCanvas.jsx`, geometry, units, store, export schema, package/CI | Egyidejű módosítás tilos |
| Shared/conflict-sensitive | route, persistence, measurement model, tests/golden fixtures | Előzetes diff és ownership egyeztetés kell |

## Contract freeze utáni kötelező ownership szabályok

| Terület | Ownership |
| --- | --- |
| Shared contracts | CODEX, single owner |
| Measurement status enum | CODEX, single owner |
| Unit policy | CODEX, single owner |
| Coordinate/geometry schema | CODEX, single owner |
| Backend/API schema | CODEX, single owner amíg nincs implementációs phase |
| DB migrations | SINGLE_OWNER_REQUIRED |
| Export schema | SINGLE_OWNER_REQUIRED |
| Routing | SINGLE_OWNER_REQUIRED |
| CI | SINGLE_OWNER_REQUIRED |
| Lovable vizuális munka | LOVABLE_REFERENCE_ONLY, contractot nem módosíthat |

## Párhuzamosan jobban kezelhető területek

| Terület | Feltétel |
| --- | --- |
| `docs/generated/audits/` | Szabadon bővíthető, de nem authoritative |
| `docs/references/` | Csak forrásmegőrzés vagy referencia; production rule nem vezethető le belőle automatikusan |
| `docs/product/legacy/` | Legacy anyag archiválása |
| `docs/regression/qa-runs/` | QA futások dokumentálása |
| Izolált UI copy módosítás | Csak ha nincs logikai/schema változás és tesztelt build |
| Izolált test fixture frissítés | Csak ha a célzott contract/locale döntés ismert |

## Módosítás előtti kötelező ellenőrzés

```bash
git status --short
git branch --show-current
git log -1 --oneline
```

Ha a munkaterület nem tiszta vagy más agent által érintett fájl látszik, a módosítást meg kell állítani és egyeztetni kell.

## Javasolt WAVE 1 ownership felosztás

| WAVE 1 terület | Javasolt ownership |
| --- | --- |
| Contract docs és ADR-ek | CODEX |
| Teszt/golden lokalizáció rendezése | CODEX |
| Brand token audit | UI owner |
| Project/document contract előkészítés | CODEX |
| Geometry regression corpus előkészítés | CODEX |
| Lovable/Figma referencia | LOVABLE_REFERENCE_ONLY vagy design reference owner |

## Tiltott párhuzamos kombinációk

- `TakeoffCanvas.jsx` + `store.js` egyidejű, külön agent által végzett módosítása.
- `shapeMetrics.js` + `totals.js` + export tesztek ownership nélküli párhuzamos szerkesztése.
- `package.json`/lockfile + CI workflow párhuzamos dependency változtatás.
- Backend auth/persistence és frontend route/provider változás contract nélkül.
