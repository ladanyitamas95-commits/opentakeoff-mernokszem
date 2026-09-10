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
