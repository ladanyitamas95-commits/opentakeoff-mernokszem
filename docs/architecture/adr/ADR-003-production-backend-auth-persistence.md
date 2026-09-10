# ADR-003 — Production backend, auth and persistence target

Status: Draft target architecture  
Date: 2026-09-10  
Scope: documentation-only production architecture decision

## Context

Phase 00 found that the existing repository has:

- a React/Vite frontend;
- browser-first IndexedDB/localStorage persistence;
- optional Google/Microsoft/File System Access flows;
- an optional FastAPI AI sandbox;
- no observed production persistence backend for Project, Document, Measurement, BOQ or AuditEvent.

The validated integration plan requires server-authoritative canonical measurements, audit trail, file hashing, object storage, tenant/auth separation and server-side AI credential handling.

## Decision

The production target architecture is a modular monolith with clear logical module boundaries:

| Layer | Target responsibility |
| --- | --- |
| Frontend | React/TypeScript workbench, canvas adapter, review/export UI |
| API/backend | tenant, project, document, scale, measurement, review, BOQ, export and audit endpoints |
| Database | transactional metadata, rules, measurements, reviews, BOQ and audit events |
| File storage | immutable original PDFs, derived thumbnails/crops, export artifacts |
| Auth | authenticated users with tenant/project roles |
| Authorization | every read/write scoped by tenant/project and role |
| Audit trail | append-only mutating event log |
| AI credential handling | server-side provider adapters only; no production browser secrets |

This ADR does not implement Supabase or any other backend. It freezes the target boundaries required before backend work starts.

## Backend authority

The backend is authoritative for:

- project identity and lifecycle;
- document metadata, content hash and version;
- document page processing metadata;
- confirmed scale calibration;
- deterministic SI quantity calculation;
- validation finding generation;
- review queue state;
- BOQ import/projection/compare state;
- export snapshot and manifest;
- audit events.

The frontend is authoritative only for immediate UI interaction state until persisted through the API.

## Auth and authorization baseline

Minimum future contract:

- every user belongs to one or more tenants/projects;
- every mutating request includes authenticated actor and project context;
- creator/reviewer/admin-like roles are distinguishable;
- cross-tenant read/write must be denied;
- service actors are explicit, not hidden as users;
- review acceptance requires a human actor.

## Persistence baseline

Minimum persistent stores:

- transactional database for domain metadata and audit;
- object/file store for original PDF/XLSX uploads and generated exports;
- job queue for PDF processing, AI proposal generation and export jobs.

IndexedDB/localStorage remain allowed for local cache, drafts and preferences, but not as production source of truth.

## AI credential baseline

AI provider credentials must:

- be stored server-side;
- never be committed;
- never be embedded through public build variables;
- be redacted from logs and audit payloads;
- be tied to budget/cost/idempotency/correlation controls;
- produce structured proposal output, not direct final measurement writes.

## API boundary baseline

Minimum future endpoint families:

- projects;
- documents and document pages;
- scale suggestions and calibrations;
- measurements;
- proposal runs and review decisions;
- validation and review queue;
- BOQ import/compare/projection;
- exports;
- audit trail.

## Consequences

- Existing `server/app.py` remains a sandbox/reference, not the production backend.
- Browser local stores remain useful for development/local mode only.
- WAVE 1 parallel backend work requires database/API schema freeze before implementation.
