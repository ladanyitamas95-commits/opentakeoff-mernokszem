# 01_SOURCE_AUTHORITY_REGISTRY.md

**Projekt:** MérnökSzem – Product & Development OS
**Dokumentumtípus:** Project Control File / Source Authority Registry
**Verzió:** 1.0
**Dátum:** 2026-09-14
**Státusz:** ACTIVE CONTROL FILE
**Cél:** megakadályozni, hogy régi, referencia-, generated vagy elavult dokumentum production authorityként újra megjelenjen.

---

## 1. Alapszabály

> **A fájl jelenléte nem jelent authority-t.**

Minden forrást explicit státusszal kell kezelni.

Az aktuális scope elsődleges forrása a `MS_MVP_SCOPE_FREEZE_v2.0_FINAL.md`, amely scope-konfliktus esetén felülírja a korábbi scope-dokumentumokat és a korábbi canonical plan scope-részeit.

---

## 2. Authority státuszok

| Státusz | Jelentés |
|---|---|
| `AUTHORITATIVE` | kötelező elsődleges forrás a saját tárgykörében |
| `AUTHORITATIVE_WHERE_NON_CONFLICTING` | használható, de magasabb prioritású döntéssel nem ütközhet |
| `GOVERNANCE_SOURCE` | fejlesztési folyamatot szabályoz, scope-ot nem írhat felül |
| `DOMAIN_AUTHORITY` | domain szerződés/invariáns forrása |
| `VISUAL_AUTHORITY` | brand/UI vizuális döntés forrása |
| `GTM_SOURCE` | marketing/GTM részletes source, scope freeze korlátai alatt |
| `BENCHMARK_SOURCE` | teszt/benchmark source, nem product scope authority |
| `KNOWLEDGE_SOURCE` | tudásforrás, nem automatikus production rule |
| `REFERENCE_ONLY` | inspiráció/referencia; nem kötelező szabály |
| `GENERATED_UNVALIDATED` | AI/generated output, Product Owner validáció nélkül |
| `HISTORICAL` | történeti döntési előzmény |
| `SUPERSEDED` | újabb dokumentum felülírta |
| `REJECTED` | nem használható |
| `EXPECTED_REPO_SOURCE` | korábbi repo-riport szerint létezik, de a jelen Project source packban még újraellenőrizendő |

---

## 3. Globális prioritási sorrend

Konfliktus esetén:

1. **Product Owner legfrissebb explicit validált döntése**, amelyet a `02_DECISION_REGISTER.md` rögzít.
2. **`MS_MVP_SCOPE_FREEZE_v2.0_FINAL.md`** – scope, P0/P1/OOS, release framing.
3. **Jóváhagyott Change Request**, ha van.
4. **Domain/architecture canonical dokumentumok** a saját tárgykörükben, ha nem ütköznek 1–3-mal.
5. **`MS_MVP_CANONICAL_DEVELOPMENT_PLAN_v1.0.md`**, ahol nem ütközik a v2.0 Scope Freeze-zel.
6. **Aktuális repository + tesztek** az implementáció tényleges állapotára.
7. **Aktuális audit/implementation reportok** bizonyítékként.
8. **Reference / knowledge / benchmark források**.
9. **Legacy chat history**.
10. Modell következtetése.

### Fontos megkülönböztetés

```text
CODE = CURRENT IMPLEMENTATION TRUTH
SPEC = TARGET BEHAVIOR TRUTH
```

Ezek eltérése nem oldható fel csendben.

---

## 4. Core authority registry

| Forrás | Authority státusz | Tárgykör | Megjegyzés |
|---|---|---|---|
| `MS_MVP_SCOPE_FREEZE_v2.0_FINAL.md` | **AUTHORITATIVE** | aktuális P0/P1/OOS, release, gates | elsődleges scope document |
| `02_DECISION_REGISTER.md` | **AUTHORITATIVE** | legfrissebb explicit Product Owner döntések | nem írhat át technikai tényt bizonyíték nélkül |
| `MS_MVP_CANONICAL_DEVELOPMENT_PLAN_v1.0.md` | **AUTHORITATIVE_WHERE_NON_CONFLICTING** | rendszerarchitektúra, golden path, domain keret | saját régi scope hierarchy részei a v2.0 által felülírhatók |
| `DOMAIN_CONTRACT_REGISTRY.md` | **DOMAIN_AUTHORITY / EXPECTED_REPO_SOURCE** | Project, Document, Scale, Measurement, BOQ, AuditEvent stb. | korábbi W00.5 riport szerint frozen; Projectbe feltöltött aktuális példányt ellenőrizni kell |
| `ADR-002-unit-and-quantity-authority.md` | **DOMAIN_AUTHORITY / EXPECTED_REPO_SOURCE** | SI, precision, authority | korábbi W00.5 riport szerint frozen |
| `ADR-003-production-backend-auth-persistence.md` | **AUTHORITATIVE_WHERE_NON_CONFLICTING / EXPECTED_REPO_SOURCE** | cél-backend/auth/persistence architecture | implementációt nem bizonyít |
| `AGENT_FILE_OWNERSHIP.md` | **GOVERNANCE_SOURCE / EXPECTED_REPO_SOURCE** | kritikus fájl ownership | aktuális repo példány felülvizsgálandó Day 0-ban |
| `MS_AI_Development_Orchestration_Plan_v1.0` | **GOVERNANCE_SOURCE** | agent workflow, QA, session protocol | tool routing részei későbbi döntésekkel felülírhatók |
| `MS_MVP_SCREEN_SPEC_v1.0.md` | **AUTHORITATIVE_WHERE_NON_CONFLICTING** | screen inventory, states, UX acceptance | vizuális authority nem ez |
| `MernokSzem_BrandBook_v1.0_brandcsalad.docx` | **VISUAL_AUTHORITY** | brand, színek, tipográfia, vizuális elvek | csak aktuális validált Brand Book példány |
| `MS_MVP_REGRESSION_CORPUS_MANIFEST_v1.0.md` | **BENCHMARK_SOURCE** | regression corpus szerkezet | expected value csak validált ground truthból |
| `CODEX_PROMPT_MS_MVP_DAY00_START_GATE_v1.0.md` | **GOVERNANCE_SOURCE** | Day 0 start-gate végrehajtási instrukció | prompt, nem product spec |

---

## 5. AI / Report Engine források

| Forrás | Státusz | Használat |
|---|---|---|
| `MERNOKSZEM_PROJECT_PREPARATION_AI_FUNCTIONAL_SPEC_v1.0` | `AUTHORITATIVE_WHERE_NON_CONFLICTING` | Report Engine v1 célviselkedés; nem teljes P0 követelmény |
| `MS_AI_ASSISTANT_EXTERNAL_SOURCE_PACK_v1.0` | `KNOWLEDGE_SOURCE` | külső architecture/pattern input |
| `MS_KNOWLEDGE_SOURCE_REGISTER_v1.1` | `KNOWLEDGE_SOURCE` | tudásforrás inventory; nem jelenti, hogy minden elem validált |
| `MS_REPORT_ENGINE_V1_QUALITY_BENCHMARK_KALD_SZITAMAJOR_v1.0` | `REQUIRED_FUTURE_BENCHMARK` | v1.0 release előtt kötelező; amíg nincs kész, nem tekinthető létező benchmarknak |
| Káldi/Szitamajori referencia-riport | `BENCHMARK_BASELINE` | v1.0 minőségi összevetés; külön validált baseline szükséges |

---

## 6. GTM források

| Forrás | Státusz | Megjegyzés |
|---|---|---|
| `MS_PUBLIC_GTM_SCREEN_SPEC_v1.0.md` | `GTM_SOURCE` | Landing/Trial/Login/Lead; scope freeze szűkítései elsőbbséget élveznek |
| `MS_PUBLIC_GTM_CONTENT_BLUEPRINT_v1.0.md` | `GTM_SOURCE` | marketing copy/content blueprint; copy később központilag cserélhető |
| Lovable UI reference / build map | `REFERENCE_ONLY` | vizuális/interakciós referencia, nem production code authority |

---

## 7. TakeOff / QTO / measurement források

| Forrás | Státusz | Megjegyzés |
|---|---|---|
| `MérnökSzem TakeOff – AI-Assisted ... v0.2` | `AUTHORITATIVE_WHERE_NON_CONFLICTING` | mérési domain/UX constraint, de P0 scope v2 elsőbbséggel |
| `MS_MernokSzem_MVP_integracios_terv_v1.0` | `REFERENCE / ARCHITECTURE_SOURCE` | reuse/adapt és vendor elemzés |
| HU QTO XLSX sablonok | `REFERENCE_ONLY` | taxonomy, parser fixture, import/export UX; **nem magyar mérnöki szabvány** |
| OpenTakeoff upstream repo | `IMPLEMENTATION_SOURCE` | meglévő reuse/adapt képességek; rögzített upstream SHA szükséges |

---

## 8. Régi / felülírt források

| Forrás | Státusz | Következmény |
|---|---|---|
| `MS_MVP_SCOPE_FREEZE_v1.0` | **SUPERSEDED** | scope döntésre nem használható |
| `MS_MVP_SCOPE_FREEZE_v1.0.1` | **SUPERSEDED_FOR_SCOPE** | historical source only |
| `MS_MVP_FINAL_SCOPE_LOCK_v1.0` | **SUPERSEDED_FOR_SCOPE** | v2.0 elsőbbséget élvez |
| régi Codex master promptok, ha régi scope-ot rögzítenek | `HISTORICAL / PROCESS_REFERENCE` | csak nem ütköző technikai pattern használható |
| régi Lovable/Codex/Claude chat outputok | `HISTORICAL` | újra validálás nélkül nem authority |
| fejlesztési chat-exportok | `HISTORICAL` | döntési előzmény, nem production spec |

---

## 9. Generated dokumentum szabály

AI által generált új dokumentum induló státusza:

```text
GENERATED_UNVALIDATED
```

Csak akkor léphet magasabb authority szintre, ha:

- Product Owner explicit validálta; és/vagy
- kijelölt szakmai/technikai reviewer validálta;
- verzió és supersession státusz rögzítve van.

---

## 10. Source conflict protokoll

Ha két forrás ellentmond:

```text
CONFLICT ID
SOURCE A
AUTHORITY A
SOURCE B
AUTHORITY B
CONFLICT
IMPACT
CAN RESOLVE BY REGISTRY? YES/NO
OWNER
STATUS
```

Ha a registry nem oldja fel:

```text
BLOCKED_DECISION
```

A fejlesztő AI **nem improvizálhat**.

---

## 11. Legacy migration szabály

Régi chat vagy régi dokumentum csak akkor kerülhet az aktív Project source packba, ha:

1. van még egyedi, nem duplikált értéke;
2. az authority státusza explicit;
3. nincs magasabb authority dokumentumban már felülírva;
4. a bekerülés várható haszna nagyobb a kontextuszajnál.

Alapértelmezett döntés legacy chatre:

```text
DO NOT IMPORT CHAT
HARVEST VALID ARTIFACT INSTEAD
```

---

## 12. Frissítési protokoll

Ezt a registry-t módosítani kell, ha:

- új canonical source készül;
- source verziót vált;
- dokumentum superseded lesz;
- Product Owner megváltoztatja a source hierarchy-t;
- új benchmark vagy domain authority kerül be.

Minden módosításnál:

```text
date
change
reason
decision source
```

---

**END OF FILE**
