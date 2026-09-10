# ADR-001 — Domain contract freeze

Status: Accepted contract baseline  
Date: 2026-09-10  
Scope: documentation-only W00.5 contract freeze

## Context

Phase 00 established that the current OpenTakeoff-derived implementation has useful frontend/canvas/domain helpers, but does not yet provide the server-authoritative MérnökSzem MVP data model.

The authoritative sources require:

- human-in-the-loop measurement review;
- AI proposals never becoming final measurements without human decision;
- confirmed scale before dimensional quantities become authoritative/exportable;
- deterministic geometry and quantity calculation;
- Q1/Q2 separation;
- validation findings and review queue;
- accepted measurement lineage into canonical BOQ and auditálható XLSX export.

## Decision

The following MVP domain contracts are frozen as the minimum shared vocabulary before feature development:

1. `Project`
2. `Document`
3. `DocumentPage`
4. `CoordinateSystem`
5. `ScaleCalibration`
6. `Measurement`
7. `MeasurementGeometry`
8. `MeasurementStatus`
9. `ValidationFinding`
10. `ReviewItem`
11. `BOQ`
12. `BOQItem`
13. `AuditEvent`

The detailed registry is maintained in `docs/development/DOMAIN_CONTRACT_REGISTRY.md`.

## Authority model

| Contract | Authority | Rule |
| --- | --- | --- |
| Project | SERVER_AUTHORITATIVE | created and mutated through API/backend in target architecture |
| Document | SERVER_AUTHORITATIVE | original file metadata and hash are canonical |
| DocumentPage | SERVER_AUTHORITATIVE | page identity and processing metadata are canonical |
| CoordinateSystem | SHARED | contract shared by frontend canvas and backend geometry engine |
| ScaleCalibration | SERVER_AUTHORITATIVE | confirmed calibration is versioned and audited |
| Measurement | SERVER_AUTHORITATIVE | final quantity and status are backend-calculated/audited |
| MeasurementGeometry | SHARED | user/AI geometry input is preserved; backend validates and calculates |
| MeasurementStatus | SHARED | enum must be identical across UI/API/backend/tests |
| ValidationFinding | SERVER_AUTHORITATIVE | backend emits deterministic findings |
| ReviewItem | SERVER_AUTHORITATIVE | queue is derived from measurement/proposal/finding state |
| BOQ | SERVER_AUTHORITATIVE | imported BOQ and accepted projection are backend data |
| BOQItem | SERVER_AUTHORITATIVE | imported/mapped line data must keep source row lineage |
| AuditEvent | SERVER_AUTHORITATIVE | append-only event log |

Allowed labels:

- `CLIENT_ONLY`: UI-only draft/view state, not canonical.
- `SERVER_AUTHORITATIVE`: persisted production source of truth.
- `SHARED`: schema/enum/geometry contract shared between frontend and backend.
- `DERIVED`: reproducible projection from authoritative data.
- `REFERENCE_ONLY`: external/source material, not production rule.

## Global invariants

- Canonical dimensional quantities target state is server-authoritative.
- Geometry input must be preserved even after edit/reject.
- AI proposal is not a final measurement.
- Human acceptance is a separate state transition.
- Confirmed scale is a blocking prerequisite for `length`, `area` and `volume`.
- `count` can be scale-free, but still requires source reference and human review.
- Q2/technical quantity is authoritative only with explicit published measurement policy/rule version.
- Numeric authority must never be a locale-formatted string.
- Timestamps are UTC instants.
- Mutating actions create `AuditEvent`.
- Edits create new revisions; old revisions are not overwritten.

## Lifecycle summary

```text
Document upload
  -> Document + DocumentPage processing
  -> ScaleCalibration suggestion/draft
  -> confirmed ScaleCalibration
  -> MeasurementGeometry draft/proposal
  -> server validation + deterministic quantity
  -> ReviewItem if human action needed
  -> ACCEPTED / EDITED / REJECTED Measurement revision
  -> accepted-only BOQ projection
  -> export snapshot + AuditEvent
```

## Measurement status freeze

The frozen status enum is:

- `DRAFT`
- `AI_PROPOSED`
- `REVIEW_REQUIRED`
- `MEASUREMENT_RULE_REQUIRED`
- `SCALE_REVIEW_REQUIRED`
- `INVALID_GEOMETRY`
- `ACCEPTED`
- `EDITED`
- `REJECTED`

`DRAFT` is included as the pre-review manual/local editing state required by Project/Canvas workflows. The other states are required by the TakeOff functional specification and source prompt.

## Validation result and finding severity

Validation result:

- `PASS`
- `REVIEW`
- `ERROR`

Finding severity:

- `info`
- `warning`
- `error`

The UI may show warnings, but the workflow gate is determined by validation result plus measurement status.

## Physical vs measurement geometry

`PHYSICAL_GEOMETRY != MEASUREMENT_GEOMETRY`.

Measurement reference types are frozen as:

- `CENTERLINE`
- `INNER_FACE`
- `OUTER_FACE`
- `SIDE_A_FACE`
- `SIDE_B_FACE`
- `BOUNDARY`
- `CUSTOM_LINE`

If measurement reference or policy cannot be determined, status must be `MEASUREMENT_RULE_REQUIRED`.

## Mutation rules

| Action | Required result |
| --- | --- |
| Create project | new `Project`, audit event |
| Upload document | immutable `Document`/version, hash, audit event |
| Process page | `DocumentPage` metadata, processing status |
| Suggest scale | non-confirmed `ScaleCalibration` candidate |
| Confirm/reject scale | new scale state/version, audit event |
| Draw manual geometry | `MeasurementGeometry` preserved, server recompute required |
| AI proposes geometry | `AI_PROPOSED`, never accepted automatically |
| Accept | new accepted measurement revision and audit event |
| Edit | new edited measurement revision, original preserved |
| Reject | rejected revision/proposal preserved, excluded from BOQ |
| BOQ import | source row lineage preserved |
| BOQ projection/export | derived from accepted, non-error snapshot only |

## Versioning

Minimum versioned objects:

- document version / content hash;
- scale calibration version;
- measurement revision;
- measurement policy/rule version;
- validation run;
- BOQ import version;
- export manifest version.

## Open decisions

No field-level contract conflict remains for WAVE 1 schema work.

Product-scope decisions still requiring owner validation are listed in `BLOCKED_DECISIONS.md`; these do not change the frozen minimum contract names or field categories.

## Consequences

- Parallel write work must use this registry before creating code schemas.
- Runtime implementation is intentionally not included in this ADR.
- Any later contract change requires a new ADR or explicit update to this ADR and the registry.
