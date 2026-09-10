# Domain Contract Registry

Status: frozen baseline for W00.5  
Date: 2026-09-10  
Scope: MérnökSzem MVP domain contracts before feature development

This registry is documentation only. It defines the minimum shared domain vocabulary for later frontend, backend, test and agent work.

Authority labels:

- `CLIENT_ONLY`: UI-only draft/view state.
- `SERVER_AUTHORITATIVE`: production source of truth.
- `SHARED`: identical schema/enum across frontend/backend/tests.
- `DERIVED`: reproducible projection from authoritative records.
- `REFERENCE_ONLY`: source/reference material, not production rule.

Global rules:

- canonical dimensional quantities are server-authoritative target state;
- geometry input is preserved;
- AI proposal is not final measurement;
- human acceptance is a separate state transition;
- confirmed scale blocks dimensional quantities until present;
- Q2 is authoritative only with explicit published measurement policy;
- timestamps are UTC instants;
- IDs are immutable;
- mutations create audit events;
- edits create new revisions, not in-place overwrite.

## Shared enums

### MeasurementStatus

Authority: `SHARED`

| Value | Meaning | Lifecycle note |
| --- | --- | --- |
| `DRAFT` | manual/user draft before authoritative calculation or submission | may be client-local until saved |
| `AI_PROPOSED` | AI/detector created a candidate | never exportable as approved |
| `REVIEW_REQUIRED` | human review required before acceptance | review queue item required |
| `MEASUREMENT_RULE_REQUIRED` | measurement policy/reference missing | blocks Q2 and accepted BOQ projection |
| `SCALE_REVIEW_REQUIRED` | dimensional measurement lacks confirmed scale | blocks quantity/export |
| `INVALID_GEOMETRY` | geometry failed deterministic validation | blocks quantity/export |
| `ACCEPTED` | human accepted current revision | eligible for BOQ only if validation is not `ERROR` |
| `EDITED` | human edited geometry/parameters/classification | creates new revision and requires recalculation |
| `REJECTED` | human rejected candidate/revision | preserved for audit, excluded from BOQ |

### ValidationResult

Authority: `SHARED`

| Value | Meaning |
| --- | --- |
| `PASS` | no blocking finding; still may require human confirmation for AI proposals |
| `REVIEW` | non-blocking issue or uncertainty requires human decision |
| `ERROR` | hard gate blocks quantity, BOQ projection or export |

### ValidationSeverity

Authority: `SHARED`

`info`, `warning`, `error`

### QuantityType

Authority: `SHARED`

`length`, `area`, `volume`, `count`

### CanonicalUnit

Authority: `SHARED`

`m`, `m²`, `m³`, `db`

### GeometryType

Authority: `SHARED`

`point`, `multipoint`, `polyline`, `polygon`, `multipolygon`

### MeasurementReferenceType

Authority: `SHARED`

`CENTERLINE`, `INNER_FACE`, `OUTER_FACE`, `SIDE_A_FACE`, `SIDE_B_FACE`, `BOUNDARY`, `CUSTOM_LINE`

If the policy/reference is unknown, use `MEASUREMENT_RULE_REQUIRED`.

### SourceKind

Authority: `SHARED`

`manual`, `ai_proposal`, `derived`, `import`, `rule`, `system`

## Project

Authority: `SERVER_AUTHORITATIVE`

Identifier strategy: `project_id` as UUIDv7. Project belongs to a tenant.

Lifecycle:

```text
created -> active -> archived
```

| Field | Required | Type | Notes |
| --- | --- | --- | --- |
| `project_id` | yes | UUIDv7 | immutable |
| `tenant_id` | yes | UUIDv7 | authorization scope |
| `name` | yes | string | non-empty |
| `client_name` | optional | string | customer/project metadata |
| `status` | yes | enum: `active`, `archived` | no delete in MVP contract |
| `created_by` | yes | actor id | user/service actor |
| `created_at` | yes | UTC timestamp | immutable |
| `updated_at` | yes | UTC timestamp | changes on metadata/status mutation |

Mutation rules:

- create requires authenticated actor;
- archive does not delete child records;
- every mutation emits `AuditEvent`.

Provenance/source reference: actor and audit event required.

## Document

Authority: `SERVER_AUTHORITATIVE`

Identifier strategy: `document_id` UUIDv7, `document_version_id` UUIDv7, immutable content hash.

Lifecycle:

```text
uploaded -> processing -> processed | failed | superseded
```

| Field | Required | Type | Notes |
| --- | --- | --- | --- |
| `document_id` | yes | UUIDv7 | logical document |
| `document_version_id` | yes | UUIDv7 | immutable uploaded version |
| `project_id` | yes | UUIDv7 | parent |
| `document_type` | yes | enum: `drawing`, `boq`, `spec`, `other` | from screen spec |
| `file_name` | yes | string | original name |
| `mime_type` | yes | string | validated server-side |
| `byte_size` | yes | integer | upload limit applies |
| `sha256` | yes | hex string | content identity |
| `storage_object_key` | yes | string | object store pointer |
| `processing_status` | yes | enum: `uploaded`, `processing`, `processed`, `failed`, `superseded` | page extraction status |
| `created_by` | yes | actor id | uploader |
| `created_at` | yes | UTC timestamp | upload time |

Mutation rules:

- file bytes are immutable after upload;
- replacing a file creates a new version;
- unsupported MIME/size is rejected;
- duplicate hash may be linked/flagged, not silently discarded.

Provenance/source reference: original file name, content hash, uploader, audit event.

## DocumentPage

Authority: `SERVER_AUTHORITATIVE`

Identifier strategy: `document_page_id` UUIDv7, stable within a document version.

Lifecycle:

```text
pending -> processed | failed
```

| Field | Required | Type | Notes |
| --- | --- | --- | --- |
| `document_page_id` | yes | UUIDv7 | immutable |
| `document_version_id` | yes | UUIDv7 | source version |
| `page_index` | yes | integer | zero-based canonical index |
| `page_number_display` | yes | integer/string | user-facing page number |
| `sheet_label` | optional | string | extracted/user label |
| `width_pt` | yes | decimal string | PDF points |
| `height_pt` | yes | decimal string | PDF points |
| `rotation_deg` | yes | integer | 0/90/180/270 |
| `text_layer_available` | yes | boolean | extraction capability |
| `vector_layer_available` | yes | boolean | extraction capability |
| `thumbnail_object_key` | optional | string | derived asset |
| `processing_status` | yes | enum | page processing status |
| `created_at` | yes | UTC timestamp | processing record time |

Mutation rules:

- derived metadata can be regenerated for the same document version;
- source document version does not change;
- failures are recorded, not hidden.

Provenance/source reference: `document_version_id`, extraction worker/run id when available.

## CoordinateSystem

Authority: `SHARED`

Identifier strategy: referenced by `coordinate_system_id` or schema version when persisted.

Lifecycle: versioned schema, not user-mutated.

| Field | Required | Type | Notes |
| --- | --- | --- | --- |
| `coordinate_system_id` | yes | string | e.g. `normalized_page_v1` |
| `space` | yes | enum: `normalized_page` | MVP baseline |
| `origin` | yes | enum: `top_left` | screen/PDF page mapping must be explicit |
| `x_range` | yes | tuple | `[0, 1]` |
| `y_range` | yes | tuple | `[0, 1]` |
| `page_rotation_applied` | yes | boolean | declares whether coordinates are post-rotation |
| `version` | yes | semver/string | schema version |

Mutation rules:

- changing coordinate interpretation requires new version;
- old measurements keep their coordinate system snapshot.

Provenance/source reference: schema/version only.

## ScaleCalibration

Authority: `SERVER_AUTHORITATIVE`

Identifier strategy: `scale_calibration_id` UUIDv7; each confirm/reject/edit creates a versioned record.

Lifecycle:

```text
suggested | draft -> confirmed | rejected | superseded
```

| Field | Required | Type | Notes |
| --- | --- | --- | --- |
| `scale_calibration_id` | yes | UUIDv7 | immutable calibration version |
| `document_page_id` | yes | UUIDv7 | page/sheet scope |
| `status` | yes | enum | `suggested`, `draft`, `confirmed`, `rejected`, `superseded` |
| `method` | yes | enum: `manual_known_distance`, `title_block_text`, `ai_suggestion`, `imported` | source method |
| `ratio` | yes if confirmed | decimal string | physical unit per normalized/page unit or declared transform |
| `unit` | yes if confirmed | enum: `m` | canonical length unit |
| `evidence_geometry` | required for manual | object | two points/line reference |
| `source_text` | optional | string | title block text if used |
| `confidence` | optional | decimal string 0..1 | suggestion confidence, not authority |
| `confirmed_by` | required when confirmed | actor id | human actor |
| `confirmed_at` | required when confirmed | UTC timestamp | human decision time |
| `created_at` | yes | UTC timestamp | candidate creation |

Mutation rules:

- scale suggestion is never automatically confirmed;
- dimensional measurements require confirmed scale snapshot;
- changing scale creates new calibration and new measurement revisions for recalculated data;
- rejected scale cannot be used as active scale.

Provenance/source reference: evidence geometry/source text/actor/audit event.

## MeasurementGeometry

Authority: `SHARED`

Identifier strategy: embedded immutable geometry version referenced by `geometry_hash`.

Lifecycle:

```text
captured -> validated | invalid -> superseded by edit
```

| Field | Required | Type | Notes |
| --- | --- | --- | --- |
| `geometry_id` | optional | UUIDv7 | if stored separately |
| `geometry_type` | yes | `GeometryType` | point/polyline/polygon/etc. |
| `coordinate_system` | yes | `CoordinateSystem` snapshot/ref | must be explicit |
| `points` | required by type | array | normalized coordinates |
| `rings` | required for polygon | array | outer ring and holes |
| `measurement_reference` | conditional | `MeasurementReferenceType` | required where policy depends on reference |
| `physical_geometry_ref` | optional | id/ref | source wall/room/object if modeled |
| `geometry_hash` | yes | SHA-256 | canonicalized geometry payload hash |
| `source_kind` | yes | `SourceKind` | manual/ai/import/etc. |
| `source_run_id` | optional | UUIDv7 | AI/import/rule run |

Mutation rules:

- edits create new geometry payload/hash;
- original AI geometry is preserved;
- invalid geometry cannot produce accepted dimensional quantity.

Provenance/source reference: source kind, run, page, evidence region.

## Measurement

Authority: `SERVER_AUTHORITATIVE`

Identifier strategy: stable `measurement_id` UUIDv7 plus immutable `measurement_revision_id` UUIDv7 and monotonic `revision_no`.

Lifecycle:

```text
DRAFT/AI_PROPOSED -> REVIEW_REQUIRED | SCALE_REVIEW_REQUIRED | MEASUREMENT_RULE_REQUIRED | INVALID_GEOMETRY -> ACCEPTED | EDITED | REJECTED
```

| Field | Required | Type | Notes |
| --- | --- | --- | --- |
| `measurement_id` | yes | UUIDv7 | stable business id |
| `measurement_revision_id` | yes | UUIDv7 | immutable revision id |
| `revision_no` | yes | integer | monotonic |
| `project_id` | yes | UUIDv7 | parent scope |
| `document_page_id` | yes | UUIDv7 | source page |
| `document_version_id` | yes | UUIDv7 | exact source file version |
| `status` | yes | `MeasurementStatus` | workflow state |
| `quantity_type` | yes | `QuantityType` | length/area/volume/count |
| `unit` | yes | `CanonicalUnit` | m/m²/m³/db |
| `measurement_geometry` | yes | `MeasurementGeometry` | original/current geometry snapshot |
| `scale_calibration_id` | required for dimensional | UUIDv7 | not required for count |
| `q1_quantity` | conditional | decimal string | direct geometric quantity |
| `q2_quantity` | optional | decimal string | policy-derived quantity |
| `measurement_rule_id` | required for Q2 | string | published rule id |
| `rule_version` | required for Q2 | semver/string | rule snapshot |
| `rule_run_id` | conditional | UUIDv7 | deterministic calculation run |
| `validation_status` | yes | `ValidationResult` | PASS/REVIEW/ERROR |
| `validation_run_id` | yes | UUIDv7 | findings run |
| `source_kind` | yes | `SourceKind` | manual/ai/derived/import/rule |
| `source_run_id` | optional | UUIDv7 | AI/import/rule run |
| `confidence_components` | required for AI | array | score/reason/evidence |
| `final_confidence` | required for AI | decimal string 0..1 | prioritizer, not correctness proof |
| `created_by` | yes | actor id | human or service |
| `created_at` | yes | UTC timestamp | revision creation |
| `reviewed_by` | conditional | actor id | accept/reject/edit |
| `reviewed_at` | conditional | UTC timestamp | accept/reject/edit |
| `superseded_at` | optional | UTC timestamp | when newer revision replaces it |

Mutation rules:

- server recomputes quantity; client quantity is not authoritative;
- accepted state requires explicit human action;
- edit creates new revision;
- reject preserves original proposal/revision;
- pending/rejected/error records are excluded from accepted BOQ projection.

Provenance/source reference: document version, page, geometry hash, scale snapshot, rule run, actor, audit event.

## ValidationFinding

Authority: `SERVER_AUTHORITATIVE`

Identifier strategy: `validation_finding_id` UUIDv7 tied to `validation_run_id`.

Lifecycle:

```text
open -> resolved | superseded
```

| Field | Required | Type | Notes |
| --- | --- | --- | --- |
| `validation_finding_id` | yes | UUIDv7 | immutable |
| `validation_run_id` | yes | UUIDv7 | validation batch/run |
| `project_id` | yes | UUIDv7 | scope |
| `entity_type` | yes | enum | measurement, scale, document, boq_item, export |
| `entity_id` | yes | UUID/string | target |
| `code` | yes | string enum/code | e.g. `MISSING_SCALE`, `UNIT_MISMATCH` |
| `severity` | yes | `ValidationSeverity` | info/warning/error |
| `result_effect` | yes | `ValidationResult` | pass/review/error effect |
| `message` | yes | string | user/developer-readable |
| `evidence_refs` | optional | array | geometry/page/source refs |
| `suggested_action` | optional | string/code | review/action hint |
| `status` | yes | enum: `open`, `resolved`, `superseded` | finding lifecycle |
| `created_at` | yes | UTC timestamp | run time |

Mutation rules:

- findings are not edited in place except lifecycle status;
- new validation run supersedes previous findings when inputs change;
- blocking `ERROR` disables approved export.

Provenance/source reference: rule/validation run, entity ref, evidence refs.

## ReviewItem

Authority: `SERVER_AUTHORITATIVE` or `DERIVED` from measurement/finding/proposal state.

Identifier strategy: `review_item_id` UUIDv7 or deterministic projection key.

Lifecycle:

```text
open -> accepted | edited | rejected | resolved | superseded
```

| Field | Required | Type | Notes |
| --- | --- | --- | --- |
| `review_item_id` | yes | UUIDv7/string | queue id |
| `project_id` | yes | UUIDv7 | scope |
| `target_type` | yes | enum | measurement, scale_calibration, boq_item, export, ai_proposal |
| `target_id` | yes | UUID/string | entity requiring action |
| `reason_code` | yes | string | missing scale, AI proposal, unit mismatch, etc. |
| `priority` | yes | enum: `error`, `review`, `warning`, `info` | sort/group |
| `status` | yes | enum | open/resolved/etc. |
| `assigned_to` | optional | actor id | if used |
| `created_at` | yes | UTC timestamp | queue creation |
| `resolved_by` | conditional | actor id | on decision |
| `resolved_at` | conditional | UTC timestamp | on decision |

Mutation rules:

- decision action emits audit event;
- resolved item must point to the resulting measurement/scale/BOQ state;
- open blocking item prevents approved export where applicable.

Provenance/source reference: target entity, reason code, finding/proposal refs.

## BOQ

Authority: `SERVER_AUTHORITATIVE`

Identifier strategy: `boq_id` UUIDv7 plus `boq_version_id` UUIDv7 for imports/projections.

Lifecycle:

```text
imported -> mapped -> compared -> superseded | archived
```

| Field | Required | Type | Notes |
| --- | --- | --- | --- |
| `boq_id` | yes | UUIDv7 | logical BOQ |
| `boq_version_id` | yes | UUIDv7 | immutable import/projection version |
| `project_id` | yes | UUIDv7 | parent |
| `source_document_id` | optional | UUIDv7 | uploaded XLSX/document |
| `source_document_version_id` | optional | UUIDv7 | exact source file |
| `status` | yes | enum | imported/mapped/compared/superseded/archived |
| `mapping_status` | yes | enum: `unmapped`, `partial`, `complete` | manual mapping baseline |
| `created_by` | yes | actor id | importer/projector |
| `created_at` | yes | UTC timestamp | version creation |

Mutation rules:

- import creates immutable version;
- mapping changes create audit events;
- accepted projection is derived from accepted, non-error measurement revisions.

Provenance/source reference: source XLSX/document hash, import mapping, audit event.

## BOQItem

Authority: `SERVER_AUTHORITATIVE`

Identifier strategy: `boq_item_id` UUIDv7; preserve original row index from import.

Lifecycle:

```text
imported -> mapped | invalid -> compared -> superseded
```

| Field | Required | Type | Notes |
| --- | --- | --- | --- |
| `boq_item_id` | yes | UUIDv7 | immutable item id |
| `boq_version_id` | yes | UUIDv7 | parent BOQ version |
| `parent_boq_item_id` | optional | UUIDv7 | max 3-level MVP hierarchy |
| `source_row_index` | required for import | integer | original XLSX row |
| `code` | optional | string | BOQ code |
| `description` | yes | string | item text |
| `unit` | yes | `CanonicalUnit` or imported unit string before mapping | unit check required |
| `imported_quantity` | optional | decimal string | original BOQ quantity |
| `accepted_quantity` | optional | decimal string | derived from accepted measurements |
| `measurement_revision_ids` | optional | array UUIDv7 | lineage |
| `absolute_deviation` | optional | decimal string | compare result |
| `percentage_deviation` | optional | decimal string | compare result |
| `comparison_status` | yes | enum: `not_compared`, `match`, `warning`, `review`, `error` | no threshold invented here |
| `created_at` | yes | UTC timestamp | item creation |

Mutation rules:

- original import row is preserved;
- unit mismatch produces `ERROR`;
- deviation threshold remains product decision until validated;
- projection rebuild must be deterministic from same snapshot.

Provenance/source reference: XLSX row, mapped measurement revisions, compare run.

## AuditEvent

Authority: `SERVER_AUTHORITATIVE`

Identifier strategy: `audit_event_id` UUIDv7, append-only.

Lifecycle:

```text
created only; never updated or deleted by normal app flow
```

| Field | Required | Type | Notes |
| --- | --- | --- | --- |
| `audit_event_id` | yes | UUIDv7 | immutable |
| `tenant_id` | yes | UUIDv7 | authorization scope |
| `project_id` | optional | UUIDv7 | if project-scoped |
| `actor_id` | yes | actor id | user or service |
| `actor_type` | yes | enum: `user`, `service`, `system` | explicit |
| `action` | yes | string enum/code | create/update/accept/reject/export/etc. |
| `entity_type` | yes | string | target entity type |
| `entity_id` | yes | UUID/string | target entity id |
| `entity_revision_id` | optional | UUID/string | if revisioned |
| `before_hash` | optional | SHA-256 | previous payload hash |
| `after_hash` | optional | SHA-256 | new payload hash |
| `correlation_id` | yes | UUID/string | request/job trace |
| `idempotency_key` | optional | string | mutating API safety |
| `created_at` | yes | UTC timestamp | event time |

Mutation rules:

- append-only;
- secrets must not be stored in payload/hash source;
- every mutating production action creates an event.

Provenance/source reference: actor, correlation id, entity revision and before/after hashes.

## Export contract minimum

Authority: `DERIVED` from server-authoritative snapshot.

P0 export sheets:

1. `Project Summary`
2. `Measurements`
3. `BOQ Compare`
4. `Validation Findings`
5. `Audit Trail`
6. `Sources`

Minimum export manifest fields:

| Field | Required | Type |
| --- | --- | --- |
| `export_id` | yes | UUIDv7 |
| `project_id` | yes | UUIDv7 |
| `snapshot_at` | yes | UTC timestamp |
| `measurement_revision_ids` | yes | array UUIDv7 |
| `boq_version_id` | optional | UUIDv7 |
| `rule_versions` | yes | array |
| `document_version_ids` | yes | array UUIDv7 |
| `validation_run_ids` | yes | array UUIDv7 |
| `created_by` | yes | actor id |
| `created_at` | yes | UTC timestamp |

Export gate:

- blocking finding disables approved export;
- only human accepted measurement revisions can be exported as approved;
- each export row must contain enough source reference to trace back to document/page/geometry/scale/rule.
