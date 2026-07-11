# EPADM — Forensic Repository Audit

**Date:** 2026-07-11 · **Branch:** dev-2 · **Method:** evidence-based inspection of every route, service, migration, and integration. Claims cite `file:line`. Where something could not be verified it is marked **UNKNOWN**.

---

## 1. Repository Overview

- **Stack:** Next.js 16.1.1 (App Router, React 19), TypeScript, Drizzle ORM 0.45 on Postgres, Zod 4, `jose` (JWT), Argon2 + bcryptjs, `@google/genai` (Gemini), `ioredis`, `otplib`, Recharts, TanStack Table, Tailwind 4.
- **Scale:** 144 app/lib source files, 11 SQL migrations (0000–0010), 3 architecture docs + a roadmap, 4 utility scripts.
- **Shape:** Two control planes in one app — a **platform/CMS plane** (`ops.` host, `/admin/**`, `platform.*` DB schema, operator auth + TOTP) and a **tenant plane** (`/_root/[tenant]/**`, shared-schema multi-tenancy with `tenant_id` + Postgres RLS).
- **Maturity signal:** rapid AI-assisted iteration. Stray artifacts present: `TODOs.ts`, `ERRORS_FIXED.md`, `test-db.ts`, an untracked broken migration (`0010`), duplicate re-export routes, and hardcoded mock data in one dashboard.

## 2. Architecture Overview

- **Tenancy:** middleware (`src/proxy.ts`) verifies the `auth_token` JWT, injects `x-tenant-id/x-user-id/x-user-role/x-plan-tier` headers, and rewrites `/x` → `/_root/{tenantId}/x`. `getCtx()` (`src/lib/context.ts`) rebuilds a `ServiceCtx` from those headers and checks tenant-active + active-modules (Redis-cached).
- **Isolation:** intended to be DB-enforced via RLS. `withTenant()` (`src/lib/rls.ts:15`) opens a transaction and runs `set_config('app.current_tenant', tenantId, true)`; policies use `USING (tenant_id = current_setting('app.current_tenant')::uuid)`.
- **Auth:** tenant sessions = HS256 JWT (`src/lib/auth/token.ts`), 7-day expiry, `auth_token` cookie. Platform operators = separate token + TOTP MFA (`src/lib/platform/auth/*`) on an isolated `opsDb` pool (`src/lib/db/ops.ts`).
- **Authorization:** static role→permission map (`src/lib/auth/catalog.ts`), enforced by `requireRole`/`requirePermission` (`src/lib/auth/guards.ts`). No per-tenant custom roles — RBAC is code-defined, not data-defined.
- **Layering:** route handler → Zod schema → service (`src/lib/admin/*`, `src/lib/platform/*`) → Drizzle. Consistent for the built modules.

## 3. Current Product Maturity

**Genuinely working, real-data end to end:** platform overview + tenant registry/detail/FinOps, tenant admin dashboard, users, students, staff, academics (classes/sections/enrollments), finance (fees/invoices/payroll/ledger), teacher workspace (attendance + assignment + AI exam), GPS & biometric webhooks, MFA, metering aggregation.

**This is an early-but-real scaffold: roughly Phase 1 complete, Phase 2 partial, Phases 3–4 largely unbuilt.** Against the 40+ modules in the product vision, ~8 are shipped, ~6 partial, and ~25 are absent. Production infrastructure (tests, CI, containerization, scheduling, observability, comms) is essentially absent.

## 4. Complete Feature Inventory

Legend: ✅ full · 🟡 partial · 🔴 missing · ⚫ disconnected · 🔵 placeholder · 🟠 broken

| Feature | State | Location | Gap / action |
|---|---|---|---|
| Platform CMS overview | ✅ | `admin/page.tsx`, `platform/overview` | — |
| Tenant provisioning/lifecycle | ✅ | `admin/tenants/**`, `platform/tenants/*` | — |
| Modular service toggles | ✅ | `tenant-control-panel.tsx`, `tenants/[id]/services` | — |
| Subscriptions (module billing) | 🟡 | `tenant_subscriptions`, seed | No self-serve/upgrade UI, no gateway |
| Tenant admin dashboard | ✅ | `_root/[tenant]/dashboard/page.tsx` | stale "Phase 1" label |
| Users / memberships | ✅ | `users/**`, `admin/users` | create-only (no edit/delete UI) |
| Students registry | ✅ | `students/**`, `admin/students` | create-only; no edit/delete/detail |
| Staff registry | ✅ | `staff/**`, `admin/staff` | create-only |
| Academics (class/section/enroll) | ✅ | `academics/**`, `admin/academics/*` | — |
| Attendance | 🟡 | teacher `saveAttendance` action, biometric webhook | no admin view, no reports, no student/parent view |
| Assignments/Homework | 🟡 | teacher home + student read | no submission, grading, files |
| Exams / Question papers | 🟡 | AI creator + saved list | no scheduling, grading, report cards |
| Finance / Fees / Payroll | ✅ | `finance/page.tsx`, cron/invoices | invoice job unauth+manual; no gateway |
| AI exam generation | 🟡 | `ai/exam-gen`, `lib/ai/client.ts` | no rate limit/cache/quota/retry |
| Audit logging | 🟡⚫ | `lib/audit`, `lib/platform/audit` | written but **no viewer UI** |
| Metering / cost tracking | 🟡 | `lib/platform/metering.ts`, worker | logs but never bills/enforces; dead gpt-4 branch |
| Transport/GPS | 🟡 | `webhooks/gps`, `vehicle_telemetry` | no vehicle/route/driver model, no UI/map |
| Parent portal | 🔴 | — | role exists, no `(parent)` group, redirect loop |
| Student portal | 🟡🔵 | `(student)/student/home` | GPA/grades/news are hardcoded mock |
| Reports | 🔴 | — | none |
| Notifications | 🔴 | — | permission exists, no table/pipeline/UI |
| Settings (tenant/platform) | 🔴 | — | none |
| Role/Permission admin | 🔴 | static map only | no UI, no custom roles |
| Timetable | 🔴 | `timetable_ga` key only | no table/engine/UI |
| Library / Hostel / Inventory / Assets | 🔴 | — | none (librarian role orphaned) |
| Admissions | 🔴 | — | none |
| Announcements / Events / News | 🔴 | perm exists | no table (student news is mock) |
| Mobile | 🔴 | — | none |
| AI evaluation / notice / letter / quiz | 🔴 | — | none |

## 5. Missing Pages
Parent portal; reports; tenant analytics; settings (tenant + platform); role/permission management; notifications; audit-log viewer; attendance admin/reports; exam scheduling & grading; report cards; timetable; transport (routes/vehicles/drivers/map); library; hostel; inventory; assets; admissions; announcements/events; billing self-serve/upgrade; student profile detail; per-record detail/edit pages for students/staff/users. Also missing per-route `loading.tsx` / `error.tsx` files (only a global `not-found.tsx`).

## 6. Missing Buttons/Actions
Edit & delete on students/staff/users/academics (create-only today); export (CSV/PDF) on every table incl. finance ledger/payroll; pagination controls; column sort (the `sortable` prop on `TableHead` is never wired); search/filter on tenant-side registries (only platform tenants table has search); "upgrade plan" / manage-subscription; view audit log; bulk import; assignment submit/grade; confirmation dialogs on `markInvoicePaid` / `disbursePayroll` / `triggerBillingJob` (currently fire with no confirm and no success toast).

## 7. Missing Tabs
No Tabs primitive exists — tabs are hand-rolled (`?tab=` links / `useState`) in finance, teacher home, tenant control panel. Missing tab surfaces: student detail (profile/attendance/fees/results), staff detail (profile/payroll/classes), tenant settings (school profile/branding/channels/security), reports categories.

## 8. Missing Dashboards
Parent, Finance-specific analytics, HR, Transport, Library, Hostel dashboards absent. Existing dashboards: platform overview (real), tenant admin (real), teacher (real), student (**mixed — mock GPA/grades/news at `(student)/student/home/page.tsx:69,94`**). `admin-dashboard/page.tsx` is a dead 3-line re-export of `dashboard/page.tsx`.

## 9. Missing Forms
Edit forms for every registry; school-profile/settings form; role-permission editor; notification composer; announcement/event forms; fee-plan assignment; timetable builder; transport route/vehicle forms; library catalog forms; admissions application; bulk-import (CSV) forms; payment/checkout form; assignment submission form; report-card entry.

## 10. Missing / Problem APIs

| Route | Auth | Perm | Tenant-scoped | Zod | Note |
|---|---|---|---|---|---|
| `admin/students`, `admin/staff`, `admin/users`, `admin/academics/*` | ✅ header ctx | ✅ `requirePermission` | 🟡 **manual `eq(tenantId)` on plain `db` pool — RLS NOT active** | ✅ | see §15 F-1 |
| `ai/exam-gen` | ✅ `requireModule` | 🔴 none | ✅ ctx | 🔴 manual field check | no rate limit/quota |
| `admin/ai-exam-gen` | module `"AI Suite"` | 🔴 | — | 🔴 | 🔵 hardcoded `2+2=4` stub; module-key mismatch vs `ai_exam_gen` |
| `admin/cron/invoices` | 🔴 **any tenant session** | 🔴 | ✅ `withTenant` | 🔴 | mislabeled cron, no machine auth, N+1 loop |
| `platform/*` | ✅ `requirePlatformOperator` | operator | opsDb | ✅ | OK |
| `webhooks/gps`, `webhooks/biometrics` | ✅ `x-integration-key` vs `tenant.settings` | n/a | ✅ `withTenant` | 🟡 | keys stored plaintext in `settings` jsonb |
| `contact`, `demo-request` | public | n/a | n/a | ✅ | email send is TODO/console.log |

**Missing endpoints** for every unbuilt module (attendance CRUD/reports, exams grading, report cards, notifications, timetable, transport entities, library, hostel, inventory, settings, roles, subscriptions self-serve, exports, health check).

## 11. Missing Database Tables
guardians/parents (only free-text `students.guardian_name`); notifications + channels + delivery; announcements/events/news; report_cards / grades / marks; timetable / periods; transport routes / vehicles / drivers (only raw `vehicle_telemetry`); admissions; library books/issues; hostel rooms/allocations; inventory/assets; payments/receipts (gateway); assignment_submissions; documents/files; consent & retention (DPDP, per roadmap §Compliance). No `deleted_at` anywhere (no soft delete). No custom-roles table.

## 12. Missing Integrations
Email 🔴 (Resend/SendGrid stub commented in `contact`/`demo-request`), SMS 🔴, push/FCM 🔴, object storage/uploads 🔴 (`avatar_url`/`file_path` columns unused), payment gateway 🔴, maps 🔴 (despite GPS). Working: Redis 🟡 (optional, errors swallowed), GPS webhook 🟢, biometric webhook 🟢, Gemini 🟢, TOTP 🟢. `pgvector` image is used but **no vector columns exist** (RAG unbuilt).

## 13. Missing Background Jobs
No scheduler/queue exists. `scripts/metering-worker.ts` = manual `npm run platform:meter`, exits after one drain. `admin/cron/invoices` = HTTP endpoint requiring a **logged-in tenant session** (no `CRON_SECRET`), never auto-runs (no `vercel.json`/cron). Missing: notification fanout, attendance→parent alerts, invoice generation scheduler, overdue-invoice sweep, metering daemon, retention/erasure jobs, AI async queue.

## 14. Missing AI Features
Present: exam/question-paper gen only (Gemini 2.5-flash, JSON mode, SDK→fetch fallback). Missing: evaluation/auto-grading, notice gen, letter gen, quiz gen, RAG/syllabus grounding. Weaknesses: no streaming, **no rate limit**, no quota enforcement (metering logs but never blocks/bills), no caching, no real retry/backoff, no prompt versioning; `client.ts:61` fabricates token counts when `usageMetadata` missing; cost model dead-branches on `gpt-4` while only Gemini is ever sent.

## 15. Missing / Weak Security Features

Ranked findings (all verified):

- **F-1 (High) — RLS not actually enforced on the primary read/write path.** `registries.ts` (`listStudents:92`, `createStudent:208`, staff equivalents) use the plain `db` pool, **not** `withTenant`, so `app.current_tenant` is never set and policies don't bind. Isolation there rests solely on a hand-written `eq(tenantId)` filter — one forgotten `.where` = cross-tenant leak. Finance/cron/webhooks *do* use `withTenant`. **The isolation model is inconsistent across the codebase.**
- **F-2 (High) — RLS likely bypassed even where `withTenant` is used.** No migration issues `FORCE ROW LEVEL SECURITY`, and the only provisioned role (`docker-compose.yml`, `postgres` superuser) bypasses RLS. In the default setup policies silently do nothing.
- **F-3 (High) — Unauthenticated privileged job.** `admin/cron/invoices` mutates financial data with only a tenant session, no permission gate, no machine secret.
- **F-4 (Med) — `platform.*` tenant-scoped tables have no RLS** (`tenant_services`, `tenant_subscriptions`, `tenant_daily_metrics`); protected only by discipline of using `opsDb`.
- **F-5 (Med) — Broken/untracked migration `0010_enable_rls_remaining.sql`:** premised on a nonexistent gap (RLS already added in 0006–0009), will throw `42710 policy already exists`, and is absent from `_journal.json` so it never runs. Delete it.
- **F-6 (Med) — Integration keys stored plaintext** in `tenants.settings` jsonb (`webhooks/*`).
- **F-7 (Med) — AI endpoints have no rate limit/quota** → unbounded spend.
- **F-8 (Low) — Rate limiter is in-memory `Map`** (`rate-limit.ts:12`) → resets on cold start, not shared across instances; only guards `/api/auth/*` + `/api/platform/auth/*`.
- **F-9 (Low) — Dev JWT fallback secret** (`token.ts:25`) — fails fast in prod (good), but the shared module-level secret means all tenants sign with one key (expected for HS256 here).
- **Good:** CSRF enforced on mutations (`csrf.ts`), webhooks correctly exempt; strong security headers (`next.config.ts`: CSP/HSTS/X-Frame DENY); Argon2 hashing; TOTP MFA; httpOnly session cookie; Zod on most routes; operator plane isolated.

## 16. Missing Validation
`ai/exam-gen` and `admin/cron/invoices` lack Zod. No output/response validation anywhere. No file-upload validation (no uploads exist). Webhook payloads validated loosely. Mass-assignment risk is low (services whitelist fields), but registry inserts spread `...input`.

## 17. Missing Testing
**Zero tests.** No `*.test.*`/`*.spec.*`, no vitest/jest/playwright config, no `test` script. Coverage = 0%. Highest-value gaps: cross-tenant RLS probes, auth/permission guards, CSRF, webhook auth, invoice math, metering aggregation.

## 18. Missing Documentation
Good: `docs/01/02/03` + roadmap. Missing: `.env.example` (none — onboarding blocker), API reference, RLS/tenancy runbook, deployment guide, ADRs, runbooks (DR/backup/restore), module ownership. `TODOs.ts` and `ERRORS_FIXED.md` are informal artifacts, not docs.

## 19. UI/UX Issues
No modal/dialog, toast, pagination, tabs, checkbox/switch, dropdown, tooltip, breadcrumb, avatar, alert, or skeleton **components** (some exist only as CSS). No per-route loading/error states. Registries lack empty states, search, sort, pagination, edit/delete. Destructive finance actions lack confirmation + success feedback. Student dashboard ships convincing **fake** data. Nav is thin (no attendance/exams/reports/settings entries) and sidebar `icon`/`badge` props are never passed. Duplicate re-export routes (`admin-dashboard`, `(student)/home`, `(teacher)/home`).

## 20. Accessibility Issues
`SkipLink` exists (good). Hand-rolled tabs use `<a>`/buttons without `role="tablist"`/`aria-selected`. No focus management for the (absent) modals. Forms rely on `Label` but keyboard/aria coverage is **UNKNOWN** without a manual pass. No automated a11y testing.

## 21. Performance Issues
Missing `tenant_id`-leading indexes on `assignments`, `student_invoices`, `financial_transactions`, `exams`, `vehicle_telemetry` (schema blocks define zero indexes) → seq scans; `vehicle_telemetry` is append-heavy and unusable at scale unindexed. `cron/invoices` N+1 (per-enrollment × per-fee SELECTs). Tables render full result sets (no pagination). `getCtx` issues an extra tenant SELECT on many paths.

## 22. Production Risks
No CI, no app Dockerfile, no scheduler, no health endpoint, no observability/APM/tracing, no backups/DR, in-memory rate limit, RLS bypass in default config, `console.log`-based logging partly stripped in prod (`logger.info` dropped by `next.config.ts`), hardcoded seed passwords (`password123`), `.env`/`.env.local` present on disk. Cascade-delete-everything FKs + no soft delete = irreversible data loss, conflicting with stated DPDP/erasure requirements.

## 23. Technical Debt
Inconsistent tenancy (plain `db` + manual filter vs `withTenant`); duplicate AI endpoints with mismatched module keys; dead `gpt-4` cost branch + fabricated token counts; stale dashboard labels; untracked broken migration; drizzle snapshots stale after 0002 (later migrations hand-written); dual postcss configs; stray `test-db.ts`/`TODOs.ts`/`ERRORS_FIXED.md`.

## 24. Refactoring Opportunities
Centralize all tenant data access behind `withTenant` + a repository layer (kill the plain-`db` path); single AI gateway (rate limit + cache + quota + retry + metering in one place); shared table toolkit (pagination/sort/search/empty/export); UI primitives (modal/toast/tabs); typed error taxonomy already partly present (`http/responses.ts`) — extend it.

## 25. Duplicate Code
`admin-dashboard/page.tsx` ≡ `dashboard/page.tsx`; `(student)/home` and `(teacher)/home` re-export their `*/home`; two AI exam endpoints; repeated inline tenant-scope filters; `0010` duplicates `0006–0009` RLS.

## 26. Dead Code
`0010` migration (never journaled); `admin/ai-exam-gen` stub; dead `gpt-4` metering branch; `TODOs.ts`; `test-db.ts`; sidebar `icon`/`badge`/`TableHead.sortable` props (never used).

## 27. Unused Components / Assets
`pgvector` image (no vector cols); `librarian`/`parent` roles (no portals); `announcements.*` permissions (no table); `avatar_url`/`file_path` columns (no upload); default Next.js SVGs in `public/`.

## 28. Broken Navigation
No dead links in current sidebars (all targets resolve). Broken flow: **parent/librarian login → `_root/[tenant]/page.tsx:16` `else → redirect("/login")` loop** (roles have no landing page). Nav omits many built/unbuilt surfaces.

## 29. Broken Feature Matrix
🟠 broken: `0010` migration; `admin/ai-exam-gen` (stub + module mismatch). 🔵 placeholder: student dashboard GPA/grades/news. ⚫ disconnected: audit logs (written, no viewer); `vehicle_telemetry` (ingested, no consumer). 🟡 RLS-inconsistent: registry read/write path.

## 30. Dependency Graph (build order)
`proxy → token → getCtx → guards/permissions → withTenant/RLS → services → routes/pages`. Everything depends on **tenancy+RLS correctness** (F-1/F-2) → then registries → academics → attendance/fees → exams/report-cards → notifications (unlocks comms) → AI gateway → transport/library/etc. → analytics/reports → mobile → compliance.

## 31. Recommended Execution Order
1. **Fix tenant isolation** (F-1/F-2): route all tenant queries through `withTenant`, add `FORCE ROW LEVEL SECURITY`, provision a non-superuser app role, delete `0010`. Add cross-tenant RLS tests.
2. **Lock privileged jobs** (F-3): `CRON_SECRET` + permission gate on `cron/invoices`; add real scheduler.
3. **Test + CI baseline**: vitest + Playwright, GitHub Actions, `.env.example`.
4. **UI primitives**: modal, toast, tabs, pagination/search/sort, loading/error states; wire edit/delete.
5. **Replace mock data** in student dashboard with real queries (needs report-card + announcement tables).
6. **AI gateway**: rate limit + quota + cache + retry; remove stub + dead branch.
7. **Notifications** (table + pipeline + email/SMS/push) — unlocks parent value.
8. **Parent portal** + guardians table.
9. Then transport entities, library, hostel, inventory, timetable, admissions, reports/analytics, subscriptions self-serve, mobile, compliance/DPDP.

## 32. Risk Assessment
| Risk | Sev | Likelihood | Mitigation |
|---|---|---|---|
| Cross-tenant data leak (F-1/F-2) | Critical | High in default cfg | withTenant everywhere + FORCE RLS + non-superuser role + probe tests |
| Unauthenticated financial job (F-3) | High | Medium | secret + permission gate |
| Unbounded AI spend (F-7) | High | Medium | quota + rate limit |
| Irreversible deletes / no DR | High | Medium | soft delete + backups |
| Zero tests → regressions | High | High | test baseline |
| No scheduler → jobs never run | Med | High | queue/cron |

## 33. Repository Completion Percentage
**~28–32%** of the stated vision (breadth-weighted). Foundation (tenancy/auth/RBAC/UI-system) ~70%; production-readiness ~10%; business modules ~25%.

## 34. Module-wise Completion
Platform CMS 80% · Tenant admin/users/students/staff/academics 75–85% (create-only) · Finance 70% · Teacher 65% · Attendance 30% · Assignments 30% · Exams 25% · AI 20% · Student portal 40% (mock) · Audit 40% · Metering 45% · Transport 15% · Subscriptions 40% · Parent/Reports/Notifications/Settings/Roles-UI/Timetable/Library/Hostel/Inventory/Admissions/Mobile/Analytics 0–10%.

## 35. Enterprise Readiness Score
**2.5 / 10.** Good bones (multi-tenant model, RBAC, control plane, security headers, MFA) undercut by inconsistent isolation enforcement, no custom roles, no compliance tooling, no tests, no comms.

## 36. Production Readiness Score
**1.5 / 10.** No CI, containerization (app), scheduler, health checks, observability, backups; RLS bypass in default config; hardcoded secrets in seed.

## 37. Prioritized Implementation Checklist
- [ ] P0 Route all tenant DB access through `withTenant`; add `FORCE ROW LEVEL SECURITY`; provision non-superuser app role; delete `0010`; add cross-tenant probe tests.
- [ ] P0 Gate `cron/invoices` (secret + permission); real scheduler.
- [ ] P0 Add test + CI baseline; `.env.example`; remove seed default passwords for prod.
- [ ] P1 UI primitives (modal/toast/tabs/pagination/search/sort/loading/error) + edit/delete on registries.
- [ ] P1 AI gateway (rate limit/quota/cache/retry); delete stub + dead cost branch.
- [ ] P1 Replace student-dashboard mock data (add report_cards + announcements tables).
- [ ] P1 Add missing indexes (assignments, invoices, transactions, exams, vehicle_telemetry); fix N+1.
- [ ] P1 Soft-delete + backups.
- [ ] P2 Notifications (table+pipeline+email/SMS/push); parent portal + guardians; audit-log viewer; settings; role/permission UI.
- [ ] P3 Transport entities+map, library, hostel, inventory, timetable, admissions, reports/analytics, subscriptions self-serve, payment gateway, observability, mobile, DPDP/compliance.
