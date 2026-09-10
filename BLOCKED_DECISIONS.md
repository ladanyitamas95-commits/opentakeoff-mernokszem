# Blocked Decisions

Ez a fájl owner inputot vagy validálást igénylő döntéseket rögzít.

## BD-001 — P0 mérési kategóriák pilot-sorrendje

Status: CLOSED  
Source: `docs/product/MS_MVP_FINAL_SCOPE_LOCK_v1.0.md`, `docs/architecture/MS_MernokSzem_MVP_integracios_terv_v1.0.md`
Closed: 2026-09-11  
Decision source: product owner instruction in W00.5 decision closure

Megfigyelés:

- A scope lock P0 kötelezőként sorolja a padló-/burkolati nettó területet, fal-/válaszfal-nyomvonal hosszát, falfelületet és darabszámot.
- Az integrációs terv az első fizető pilotban az 1–2 kategóriát kötelezőnek, a 3–4 kategóriát feature flag mögötti P1-nek írja.

Contract freeze döntés:

- A domain contract támogatja mind a négy quantity típust és státuszt.
- A P0 measurement categories lezárva:
  - `area`;
  - `wall length`;
  - `count`;
  - `wall surface`.
- Implementation priority:
  1. `area`;
  2. `wall length`;
  3. `count`;
  4. `wall surface`.
- `wall surface` P0 marad, de a Q2 / height / measurement-policy függősége miatt az első három után implementálható.

Blokkol:

- nincs további blokk a P0 measurement category sorrendre;
- a wall surface implementáció továbbra is függ a Q2 / height / measurement-policy contract gyakorlati implementációjától.

## BD-002 — BOQ compare első validált eltérési küszöbe

Status: CLOSED  
Source: `docs/product/MS_MVP_FINAL_SCOPE_LOCK_v1.0.md`, `docs/regression/MS_MVP_REGRESSION_CORPUS_MANIFEST_v1.0.md`
Closed: 2026-09-11  
Decision source: product owner instruction in W00.5 decision closure

Megfigyelés:

- A BOQ compare P0 kötelező, de az első validált eltérési küszöb még döntési kérdésként szerepel.
- A regression manifest tolerance és deviation küszöb értékei `TBD` státuszúak.

Contract freeze döntés:

- A `BOQItem` contract tartalmazza az abszolút és százalékos eltérést, valamint a comparison státuszt.
- Initial BOQ compare deviation policy:
  - deviation `<= 5%`: non-blocking / normal comparison result;
  - deviation `> 5%`: `REVIEW_REQUIRED`;
  - threshold feletti eltérés nem jelenti automatikusan, hogy a measurement vagy BOQ item műszakilag hibás.
- A küszöb configurable domain policy legyen, ne szétszórt frontend hardcoding.

Blokkol:

- nincs további blokk az initial BOQ compare thresholdre;
- regression corpus alapján később validálható és verziózott policyként módosítható.

## BD-003 — MVP jogosultsági mélység

Status: CLOSED  
Source: `docs/product/MS_MVP_FINAL_SCOPE_LOCK_v1.0.md`, `docs/architecture/MS_MernokSzem_MVP_integracios_terv_v1.0.md`
Closed: 2026-09-11  
Decision source: product owner instruction in W00.5 decision closure

Megfigyelés:

- A scope lock kérdésként kezeli, hogy többfelhasználós jogosultság kell-e MVP-ben, vagy single-user pilot elég.
- Az integrációs terv production célarchitektúrája tenant/user/project és auditált jogosultság irányt jelöl.

Contract freeze döntés:

- A contractok tartalmazzák a `tenant_id`, `project_id`, actor és audit mezőket.
- MVP P0 authorization depth:
  - single-user pilot;
  - multi-user role/RBAC UI out of P0 scope;
  - architecture may remain future-role-ready.
- A contractokban a future-role-ready mezők megtarthatók, de P0-ban nem kell többfelhasználós RBAC UI-t építeni.

Blokkol:

- nincs további blokk a P0 jogosultsági mélységre;
- future RBAC/role UI külön későbbi phase döntés.
