# ADR-002 — Unit and quantity authority

Status: Accepted contract baseline  
Date: 2026-09-10  
Scope: documentation-only unit policy freeze

## Context

The OpenTakeoff-derived codebase contains useful geometry and export logic, but the Phase 00 audit found legacy imperial assumptions in current frontend metric helpers. The MérnökSzem MVP sources require server-side SI calculation and auditability.

## Decision

Canonical MérnökSzem MVP units are:

| Quantity kind | Canonical unit | Display label |
| --- | --- | --- |
| length | `m` | m |
| area | `m²` | m² |
| volume | `m³` | m³ |
| count | `db` | db |

Canonical numeric values are stored as decimal values, serialized as strings at API/schema boundaries when precision matters.

Locale-formatted display strings are never authoritative values.

## Authority rules

| Layer | Authority |
| --- | --- |
| Backend/domain measurement engine | SERVER_AUTHORITATIVE for dimensional quantity |
| Frontend canvas | CLIENT_ONLY geometry input/editing surface |
| Shared geometry schema | SHARED |
| Export formatting | DERIVED |
| QTO/reference workbooks | REFERENCE_ONLY |

## Precision policy

Decimal/fixed precision handling is required at these boundaries:

- scale ratio storage and application;
- normalized coordinate to physical unit transformation;
- polygon area;
- polyline length;
- wall surface calculation;
- deduction/subtraction;
- BOQ quantity comparison;
- XLSX/CSV export values;
- audit trace input/output snapshots.

Implementation recommendation for future code:

- use Decimal/fixed precision in the server/domain layer;
- serialize canonical numbers as decimal strings with explicit unit;
- define rounding only at display/export boundaries;
- keep calculation trace values unrounded or explicitly mark every rounding step.

## Q1 / Q2 quantity policy

`q1_quantity` is the direct geometric quantity after scale and geometry validation.

`q2_quantity` is the technical or policy-transformed quantity. It is authoritative only when all are present:

- `measurement_rule_id`;
- `rule_version`;
- `rule_run_id`;
- required parameters and source references;
- calculation trace;
- validation status not `ERROR`;
- human acceptance where required.

If the explicit measurement policy is missing, the measurement status must be `MEASUREMENT_RULE_REQUIRED`.

## Scale gate

Dimensional quantities require a confirmed scale:

- `length`;
- `area`;
- `volume`.

Scale-free `count` does not require dimensional scale, but still requires source reference, validation and review.

## Prohibited authority patterns

- implicit imperial canonical values;
- numeric authority in localized text like `12,34 m²`;
- AI-estimated length/area as final quantity;
- frontend-calculated quantity as final production value;
- Q2 quantity without rule version;
- export-only calculation as source of truth.

## Consequences

- Existing OpenTakeoff unit helpers may be adapted, but cannot remain the production source of truth for SI quantities.
- Future tests must include known fixtures for `m`, `m²`, `m³` and `db`.
- Export modules must consume canonical values and apply formatting later.
