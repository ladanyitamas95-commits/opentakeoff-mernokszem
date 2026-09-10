# MérnökSzem MVP fejlesztői baseline

Ez a dokumentum a Phase 00 repository-audit pillanatnyi állapotát rögzíti. Nem termékfunkció-specifikáció, hanem fejlesztői tájékozódási pont a jelenlegi OpenTakeoff-alapú kódbázishoz.

## Repository felépítés

| Terület | Útvonal | Megfigyelt tartalom |
| --- | --- | --- |
| Web frontend | `web/` | React + Vite böngészős alkalmazás, canvas-alapú tervmérési felület, lokális/Drive/M365/File System Access tárolási kapuk |
| Frontend source | `web/src/` | oldalak, komponensek, lib modulok, CSS, PDF/canvas/geometria/export/AI helper kód |
| Frontend tesztek | `web/test/` | Node test runner + `tsx` alapú TypeScript tesztek |
| MCP server | `mcp/` | TypeScript MCP server és eszközök, részben a `web/src/lib` domain modulokra építve |
| FastAPI sandbox | `server/` | opcionális AI sandbox endpointok, API-kulcsos védelemmel |
| Capture/eval/demo | `capture/`, `evals/`, `demo/` | kiegészítő benchmark, capture és demo anyagok |
| Dokumentáció | `docs/` | MérnökSzem product, architecture, takeoff, brand, regression, references és generated dokumentumok |
| CI | `.github/workflows/ci.yml` | web, MCP, docs, capture és server baseline jobok |

## Technológiai stack

| Réteg | Baseline |
| --- | --- |
| Frontend | React 18.3, Vite 6, React Router, JavaScript/TypeScript vegyes kód |
| PDF/canvas | `pdfjs-dist`, `pdf-lib`, canvas UI a `web/src/pages/TakeoffCanvas.jsx` fájlban |
| Geometria | saját JS helper modulok: `web/src/lib/geometry.js`, `web/src/lib/shapeMetrics.js`, `web/src/lib/units.ts`, `web/src/lib/sheets.ts` |
| Export | CSV/JSON/XLSX/PDF export helper modulok a `web/src/lib` alatt |
| Lokális tárolás | IndexedDB és localStorage a `web/src/lib/store.js` és kapcsolódó modulok alapján |
| AI | böngészős BYO AI helper, opcionális Netlify function, opcionális FastAPI sandbox |
| MCP | TypeScript MCP server a `mcp/` alatt |
| Python backend | FastAPI sandbox a `server/` alatt |

## Fejlesztői parancsok

Frontend:

```bash
cd web
npm install
npm run dev
npm run build
npm run typecheck
npm run lint
npm test
```

MCP:

```bash
cd mcp
npm install
npm run typecheck
npm test
npm run build
```

Server:

```bash
cd server
python -m pip install -r requirements-dev.txt
python -m pytest -q
```

## Környezeti megjegyzések

- A `web/package.json` `>=24` Node engine-t kér.
- A jelen auditkörnyezetben a default `PATH` alatt nem volt elérhető a megfelelő Node/npm telepítés.
- A bundled runtime Node használatával a frontend `build`, `typecheck` és `lint` futtatható volt, amikor egy meglévő testvér-worktree `web/node_modules` könyvtárát ideiglenes symlinkként használtuk.
- A baseline worktree saját `web/node_modules` és `mcp/node_modules` könyvtár nélkül indult.
- Offline dependency install a rendelkezésre álló pnpm cache-ből nem volt teljesíthető, mert több csomag metaadata hiányzott.

## Baseline build/test eredmény

| Terület | Parancs | Eredmény | Megjegyzés |
| --- | --- | --- | --- |
| Web | `vite build` | PASS | Vite build sikerült; nagy chunk figyelmeztetés maradt |
| Web | `tsc --noEmit` | PASS | Typecheck sikerült |
| Web | `eslint src netlify/functions` | PASS | Lint sikerült |
| Web | `node --import tsx --test test/*.test.ts` | FAIL | 1752 tesztből 1700 PASS, 49 FAIL; fő ok: korábbi magyarítás után a tesztek/golden elvárások még angol/OpenTakeoff szöveget várnak |
| MCP | typecheck/test/build | NOT AVAILABLE / FAIL | `node_modules` hiányzik; offline install nem tudta feloldani több csomagot, például `tsx` |
| Server | `python -m pytest -q` | NOT AVAILABLE / FAIL | `pytest` és több dev dependency nem volt telepítve |

## Fejlesztési alapelvek Phase 00 után

- A forrás-hierarchia dokumentált: authoritative dokumentumok előnyt élveznek a legacy/reference/generate dokumentumokkal szemben.
- A `docs/references/` nem authoritative termékszabály.
- A `docs/generated/` AI által generált munkaterület, önmagában nem validált döntés.
- A `TakeoffCanvas.jsx` jelenleg nagy, konfliktusveszélyes frontend gócpont.
- A jelenlegi OpenTakeoff mérési/export kód hasznos reuse candidate, de a MérnökSzem MVP authoritative SI/Decimal measurement policy és backend audit trail még külön szerződésfagyasztást igényel.
