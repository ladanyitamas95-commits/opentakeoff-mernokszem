# Blocked Decisions

Ez a fájl owner inputot vagy validálást igénylő döntéseket rögzít.

## BD-001 — P0 mérési kategóriák pilot-sorrendje

Status: OPEN_PRODUCT_DECISION  
Source: `docs/product/MS_MVP_FINAL_SCOPE_LOCK_v1.0.md`, `docs/architecture/MS_MernokSzem_MVP_integracios_terv_v1.0.md`

Megfigyelés:

- A scope lock P0 kötelezőként sorolja a padló-/burkolati nettó területet, fal-/válaszfal-nyomvonal hosszát, falfelületet és darabszámot.
- Az integrációs terv az első fizető pilotban az 1–2 kategóriát kötelezőnek, a 3–4 kategóriát feature flag mögötti P1-nek írja.

Contract freeze döntés:

- A domain contract támogatja mind a négy quantity típust és státuszt.
- A WAVE 1 implementációs sorrendhez product owner döntse el, hogy a falfelület és darabszám P0-ban kötelező-e, vagy P1 flag mögött marad.

Blokkol:

- teljes P0 release acceptance véglegesítését;
- nem blokkolja a közös Project/Document/Scale/Measurement contractok használatát.

## BD-002 — BOQ compare első validált eltérési küszöbe

Status: OPEN_PRODUCT_DECISION  
Source: `docs/product/MS_MVP_FINAL_SCOPE_LOCK_v1.0.md`, `docs/regression/MS_MVP_REGRESSION_CORPUS_MANIFEST_v1.0.md`

Megfigyelés:

- A BOQ compare P0 kötelező, de az első validált eltérési küszöb még döntési kérdésként szerepel.
- A regression manifest tolerance és deviation küszöb értékei `TBD` státuszúak.

Contract freeze döntés:

- A `BOQItem` contract tartalmazza az abszolút és százalékos eltérést, valamint a comparison státuszt.
- Konkrét warning/error küszöböt nem rögzítünk validált corpus nélkül.

Blokkol:

- BOQ compare threshold implementációját;
- nem blokkolja a BOQ/BOQItem alap schema előkészítését.

## BD-003 — MVP jogosultsági mélység

Status: OPEN_PRODUCT_DECISION  
Source: `docs/product/MS_MVP_FINAL_SCOPE_LOCK_v1.0.md`, `docs/architecture/MS_MernokSzem_MVP_integracios_terv_v1.0.md`

Megfigyelés:

- A scope lock kérdésként kezeli, hogy többfelhasználós jogosultság kell-e MVP-ben, vagy single-user pilot elég.
- Az integrációs terv production célarchitektúrája tenant/user/project és auditált jogosultság irányt jelöl.

Contract freeze döntés:

- A contractok tartalmazzák a `tenant_id`, `project_id`, actor és audit mezőket.
- A pontos szerepkörkészlet későbbi auth/backend döntés.

Blokkol:

- production auth/RLS implementációt;
- nem blokkolja a tenant/project mezők contractban tartását.
