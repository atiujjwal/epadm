# EPADM Full Implementation Roadmap

This document turns the architecture research and the current repository state into the execution plan for building EPADM as a production-grade multi-tenant school platform.

## 1. Architectural Invariants

These decisions are locked unless a formal ADR replaces them:

- `Platform shape`: multi-tenant SaaS for schools using a shared-schema PostgreSQL database.
- `Isolation model`: every tenant-owned table includes `tenant_id`; database RLS policies are mandatory before shipping each module.
- `Web stack`: Next.js App Router, TypeScript, Drizzle ORM, Zod, server-first data access.
- `Async workloads`: background jobs and long-running integrations run outside request-response handlers.
- `Identity model`: global `users`, tenant membership in `tenant_users`, permissions-based authorization.
- `Mobile strategy`: offline-first React Native client with delta sync and conflict-aware mutation replay.
- `Compliance`: auditability, parental consent, retention, and erasure are product requirements, not later hardening work.

## 2. Implementation Phases

### Phase 0: Constitution and Foundations

Ship:

- tenant routing and request context
- production-safe auth secrets and token handling
- permissions model and authorization guards
- standardized API response and error contracts
- audit log table and cross-cutting service conventions
- CI baseline, linting, type safety, migration workflow

Acceptance:

- all authenticated requests carry tenant, user, role, and plan context
- protected routes redirect or reject correctly
- secret misconfiguration fails fast in production
- every new tenant-aware module has an RLS plan before coding starts

### Phase 1: Core Administration Platform

Ship:

- tenant onboarding
- school profile and settings
- role and permission administration
- user, staff, student, and guardian registries
- audit log browsing
- notification channel setup
- admin shell, navigation, and shared UI system

Dependencies:

- Phase 0 foundation
- schema migrations for core identities
- reusable form and table primitives

Acceptance:

- admin can create and manage school users and memberships
- critical actions are auditable
- permission enforcement exists on APIs and server-rendered pages

### Phase 2: Operations MVP

Ship:

- classes, sections, academic years, enrollment
- attendance workflows
- fee plans, invoices, receipts
- announcements and document sharing
- report cards and baseline dashboards
- parent/staff web journeys
- mobile MVP for attendance, fees, notices, and profile

Dependencies:

- stable registries from Phase 1
- sync metadata on mobile-facing tables
- notification event pipeline

Acceptance:

- schools can run daily operations end to end without spreadsheet fallbacks
- parent and staff users see actor-specific views only
- offline-safe reads and queued writes work for mobile MVP cases

### Phase 3: Automation and Intelligence

Ship:

- biometric device registration and ingestion service
- attendance event fanout and parent notifications
- exam generation with RAG
- timetable generation engine
- search, exports, and analytics
- AI usage metering and caching

Dependencies:

- background job platform
- object storage and document processing
- vector indexing and content ingestion flows

Acceptance:

- biometric attendance reaches the tenant timeline reliably
- AI features stay within defined cost and latency budgets
- generated academic content is traceable to syllabus sources

### Phase 4: Enterprise Hardening and Expansion

Ship:

- consent management and DPDP workflows
- data retention and erasure tooling
- multi-campus support
- billing and subscription operations
- partner APIs and SSO
- DR drills, performance tuning, runbooks

Acceptance:

- privacy workflows are operationally usable by school admins
- recovery procedures are documented and tested
- external integrations have clear auth, rate-limit, and support boundaries

## 3. Backend Architecture

Use layered domain modules:

1. `route handlers`
2. `request/response schemas`
3. `application services`
4. `domain policies`
5. `repositories`
6. `database and integrations`

Core backend domains:

- identity and sessions
- tenancy and subscriptions
- authorization
- student and guardian registry
- staff registry
- academics
- attendance
- fees
- announcements and notifications
- documents
- compliance
- analytics
- integrations

Cross-cutting requirements:

- shared validation with Zod
- typed error taxonomy
- structured logs with request and audit IDs
- background jobs for non-interactive work
- idempotency for imports, sync, and webhook-like integrations

## 4. Frontend Architecture

Web app route groups:

- `/(public)` marketing, admissions, status, help
- `/(auth)` login, reset, invitation flows
- `/_root/[tenant]/(admin)`
- `/_root/[tenant]/(staff)`
- `/_root/[tenant]/(parent)`

Frontend patterns:

- server-first page composition
- actor-specific shells and navigation
- schema-driven forms
- reusable data table, filters, details, timeline, and modal primitives
- permission-aware rendering at the server boundary
- optimistic updates only for reversible low-risk actions

Mobile architecture:

- local database for primary reads
- sync checkpoint per collection
- dirty-write queue with replay
- background sync service
- minimal top-level navigation depth for parents

## 5. Feature Execution Order

Build in this order:

1. tenancy, auth, permissions, auditing
2. onboarding, settings, user management
3. student, guardian, staff master data
4. classes, sections, calendars, enrollments
5. attendance manual flows
6. notifications
7. fees and finance basics
8. announcements and documents
9. report cards and assessment foundations
10. mobile sync contracts and app MVP
11. biometric integration
12. AI modules
13. compliance tooling and enterprise ops

## 6. Quality Gates

Each feature is complete only when it includes:

- schema and migration
- RLS policy definition
- service and API implementation
- authorization checks
- test coverage at the right layer
- logging and metrics hooks
- UI states for loading, empty, error, and success
- accessibility pass
- rollout and rollback notes

## 7. Risks and Mitigations

- `Tenant data leakage`
  Mitigation: RLS, service guards, and integration tests that deliberately cross-tenant probe.
- `Offline sync conflicts`
  Mitigation: version fields, idempotent mutations, conflict rules per aggregate.
- `Biometric vendor inconsistency`
  Mitigation: adapter layer, command queue, replay-safe ingestion, synthetic device tests.
- `AI cost drift`
  Mitigation: quotas, semantic caching, model tiering, asynchronous generation.
- `Operational sprawl`
  Mitigation: one deployment standard, one queue standard, one observability standard, runbooks from the first service split onward.

## 8. Current Repo Progress

Implemented or now formalized in the repo:

- tenant-scoped routing middleware
- session token verification
- initial tenancy and identity schema
- permissions and audit-log schema foundations
- standardized server response helpers
- authorization guard helpers

Next recommended build slice:

- user and tenant administration pages and APIs
- migration files for the new schema additions
- seeded role-permission catalog
- first audit log writer integration
