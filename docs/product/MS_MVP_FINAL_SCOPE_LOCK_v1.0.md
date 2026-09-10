# MS_MVP_FINAL_SCOPE_LOCK_v1.0

**Projekt:** MérnökSzem MVP  
**Cél:** végleges MVP scope-zár és fejlesztési tiltólista  
**Dátum:** 2026-09-10  
**Státusz:** v1.0 munkaverzió, üzleti validáció szükséges  

## 1. Dokumentum célja

Ez a fájl megakadályozza a scope-csúszást. Codex, fejlesztő vagy terméktulajdonos nem adhat hozzá új MVP funkciót, ha az ebben a dokumentumban out-of-scope vagy későbbi fázisba sorolt.

Ha üzleti döntéssel mégis változik a scope, ezt a fájlt kell először módosítani.

## 2. MVP egyetlen mondatban

A MérnökSzem MVP egy magyar építőipari AI-assisted takeoff és BOQ validation workbench, amely PDF tervből és/vagy BOQ Excelből kiindulva mérést, ellenőrzést, eltérésjelzést, review queue-t és auditálható Excel exportot ad.

## 3. MVP fő termékígéret

Az MVP nem azt ígéri, hogy az AI minden építőipari mennyiséget automatikusan és hibátlanul felismer.

Az MVP azt ígéri:

- a felhasználó gyorsabban tud tervből mennyiséget előállítani;
- a mennyiség forráshoz, geometriához és léptékhez kötött;
- a rendszer jelzi a BOQ-eltéréseket;
- AI-javaslat csak emberi jóváhagyással válhat végleges mennyiséggé;
- az export auditálható.

## 4. P0 kötelező scope

| Funkció | P0 státusz | Megjegyzés |
| --- | --- | --- |
| Projekt létrehozás | Kötelező | Minimális projektadatokkal |
| PDF feltöltés | Kötelező | Legalább terv PDF |
| XLSX BOQ feltöltés | Kötelező | Legalább alap oszlopmappinggel |
| PDF viewer | Kötelező | Oldalválasztás, zoom, pan |
| Lépték rögzítés | Kötelező | Manuális + opcionális text suggestion |
| Scale confirmation | Kötelező | Dimenzionális méréshez blokkoló gate |
| Manual polygon mérés | Kötelező | Padló/felület m² |
| Manual polyline mérés | Kötelező | Falhossz m |
| Count marker | Kötelező, egyszerű | Pontjelölés vagy szimbólumcsalád kézi validálással |
| Szerveroldali SI számítás | Kötelező | A kliens értéke nem authoritative |
| Rule engine minimum | Kötelező | Padlóterület, falhossz, falfelület |
| Q1/Q2 mennyiség elkülönítés | Kötelező | Geometric vs technical quantity |
| Measurement review | Kötelező | Accept/edit/reject |
| Validation engine | Kötelező | PASS/WARNING/ERROR/REVIEW |
| Review queue | Kötelező | Emberi döntésre váró elemek |
| BOQ import | Kötelező | XLSX |
| BOQ compare | Kötelező | Manual mapping, eltérés |
| XLSX export | Kötelező | Auditálható táblák |
| Audit trail | Kötelező | Minden mutáló műveletre |
| Chat support MVP | Kötelező | Export blokk, eltérés, használati segítség |

## 5. P1 opcionális, csak P0 után

| Funkció | Feltétel |
| --- | --- |
| AI proposal adapter | P0 manual takeoff és review queue stabil |
| Heuristic vagy LLM alapú geometry suggestion | Csak proposal státuszban |
| BOQ automatikus oszlopfelismerés | Manual mapping már működik |
| Egyszerű termék/anyag kinyerés | Csak validált measurement után |
| Export template finomítás | P0 export már működik |
| Dense mode táblázatokhoz | P0 képernyők stabilak |

## 6. Nem MVP, tilos beépíteni

| Tiltott scope | Indok |
| --- | --- |
| Teljes ERP | Atmos benchmark alapján túl széles és nem differenciál |
| NAV számlaszinkron | Integrációs, jogi és support teher |
| Automatikus számlázás | Nem takeoff/BOQ mag |
| TIG workflow | Későbbi ERP/EPOS modul |
| Szerződésvarázsló | Nem MVP core |
| Digitális aláírás | Későbbi workflow |
| HR/szabadság | ERP scope creep |
| Flotta | ERP scope creep |
| Partnerportál | Későbbi ÉPOS/RFQ scope |
| Közös partnerértékelő hálózat | Jogi és bizalmi kockázat |
| Teljes supplier/RFQ rendszer | P2/P3 |
| Teljes ártükör rendszer | P1/P2; MVP-ben csak BOQ compare |
| ÉNGY production automapping | Validált adatbázis nélkül veszélyes |
| IFC/DWG production processing | Későbbi technológiai scope |
| Autonóm all-structure recognition | MVP-ben irreális és kockázatos |
| AI által ember nélkül elfogadott mennyiség | Bizalmi és szakmai kockázat |
| Magyar szabványként kezelt külföldi ratio | Tilos validáció nélkül |

## 7. MVP mérési kategóriák

### P0 mérési kategóriák

| Kategória | Mértékegység | Módszer | Megjegyzés |
| --- | --- | --- | --- |
| Padló-/burkolati nettó terület | m² | Polygon + deduct | Felhasználói review kötelező |
| Fal-/válaszfal-nyomvonal hossza | m | Polyline | Confirmed scale kötelező |
| Falfelület | m² | Falhossz × magasság - nyílás | Magasság felhasználói input |
| Darabszám | db | Count marker | AI csak javasolhat |

### Nem P0 mérési kategóriák

- teljes gépészeti mennyiségfelmérés;
- vasalás automatikus felismerése;
- betonacél tételes kigyűjtés;
- tető rétegrend automatikus felismerése;
- minden szakági elem automatikus classification;
- automatikus nyílászáró-konszignáció;
- komplex BIM takeoff.

## 8. Release gate

Az MVP csak akkor tekinthető demózhatónak, ha:

| Gate | Minimum |
| --- | --- |
| Új projekt létrehozható | Igen |
| PDF terv feltölthető és megnyitható | Igen |
| XLSX BOQ importálható | Igen |
| Lépték jóváhagyás működik | Igen |
| Scale nélkül export blokkol | Igen |
| Polygon/polyline/count mérés menthető | Igen |
| Szerveroldali SI számítás működik | Igen |
| Legalább 3 P0 rule működik | Igen |
| Review queue működik | Igen |
| BOQ compare működik | Igen |
| XLSX export megnyitható | Igen |
| Audit trail rögzül | Igen |
| Chat meg tudja mondani, mi blokkol | Igen |

## 9. Minőségi kapuk

| Kapu | Elvárt működés |
| --- | --- |
| Nincs confirmed scale | Hossz/terület export blokkol |
| AI-created measurement | Csak review státusz |
| Human verified false | Nem exportálható approvedként |
| Unit mismatch | ERROR |
| q1_value <= 0 | ERROR |
| Hiányzó geometry | ERROR |
| Hiányzó source reference | ERROR |
| BOQ eltérés küszöb felett | WARNING vagy REVIEW |

## 10. Döntési kérdések

1. A P0 darabszám funkció kötelező maradjon, vagy P1-be toljuk?
2. A falfelület P0-ban legyen, vagy csak falhossz + magasság kalkulátor?
3. Mi legyen az első validált eltérési küszöb BOQ compare esetén?
4. Ki jogosult measurementet véglegesen elfogadni?
5. Kell-e többfelhasználós jogosultság MVP-ben, vagy single-user pilot elég?
6. A chat MVP-ben használjon valódi LLM-et, vagy első körben szabályalapú support válasz is elfogadható?
