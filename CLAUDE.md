# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

EPADM is a multi-tenant, AI-powered School ERP SaaS built on **Next.js 16.1.1 (App Router, React 19)**, **Drizzle ORM 0.45 + Postgres (pgvector)**, and **Tailwind v4**. Tenancy is shared-schema with a `tenant_id` column plus Postgres Row-Level Security. There are two logical planes: a **tenant plane** (schools) and an **ops/control plane** (platform operators), separated by hostname.

## Commands

```bash
npm run dev              # start dev server (Next.js)
npm run dev:boot         # db:boot (create DB + migrate) then dev
npm run build            # production build
npm run lint             # eslint (flat config, eslint-config-next)
npm run typecheck        # tsc --noEmit  — run this after any type-level change

# Database (Drizzle Kit; reads DATABASE_URL from .env.local, then .env)
npm run db:boot          # create database if missing + run all migrations (tsx scripts/db-bootstrap.ts)
npm run db:generate      # generate a migration from schema.ts changes
npm run db:migrate       # apply migrations
npm run db:push          # push schema without a migration (dev only)
npm run db:studio        # Drizzle Studio
npm run db:seed          # seed demo data (tsx src/lib/db/seed.ts)

# Tests
npm run test             # vitest run (whole suite)
npm run test:watch       # vitest watch
npx vitest run path/to/file.test.ts          # single file
npx vitest run -t "name of test"             # single test by name
npm run test:e2e         # playwright

# Platform workers/utilities
npm run platform:meter   # metering drain worker
npm run platform:mfa     # reset operator MFA
```

Path alias: `@/*` → `src/*`.

## Request routing — the most important thing to understand

**Middleware lives in `src/proxy.ts`** (Next.js 16 renamed `middleware.ts` → `proxy.ts`; the exported function is `proxy`, config `matcher` at the bottom). Do **not** create a `middleware.ts` — it won't be picked up alongside this. All request handling flows through `proxy.ts`:

1. Rate-limits `/api/auth/*` and `/api/platform/auth/*`; validates CSRF on mutations (`src/lib/security/`).
2. **Ops plane** (hostname is `ops.*` or matches `OPS_HOST`): verifies the `PLATFORM_COOKIE` platform token, injects `x-platform-operator-*` headers, gates everything except `/admin/login` and `/api/platform/auth/*`. `/admin` on a non-ops host is **redirected** to the ops host.
3. **Tenant plane**: verifies the `auth_token` session cookie, then **rewrites** the URL from `/whatever` to `/root/{tenantId}/whatever` and injects `x-tenant-id`, `x-user-id`, `x-user-role`, `x-plan-tier` headers. Unauthenticated non-public requests redirect to `/login`.

Consequences:
- `src/app/root/[tenant]/` holds all tenant-facing routes. `root` is a **literal path segment used only as the proxy's rewrite target** — `NextResponse.rewrite` keeps the visible browser URL clean (`/dashboard`), so users never see `/root/...`. It must **not** be named `_root`: a leading-underscore folder is a Next.js *private folder* excluded from routing, which makes every rewrite 404. It must also not be a bare `[tenant]` at the app root, which would swallow marketing routes like `/about`.
- `PUBLIC_PATHS` and `OPS_PUBLIC_PATHS` sets in `proxy.ts` are the source of truth for which routes skip auth. Add new public marketing/legal pages there.
- A 404 on `/` or `/login` usually means the app dir or `proxy.ts` is misconfigured, not the page itself.

## Tenant isolation — never bypass this

Two DB connections, and choosing the right one is a correctness/security decision:

- **`db`** (`src/lib/db/index.ts`) — the app pool, RLS-bound. All tenant data access **must** go through **`withTenant(tenantId, tx => ...)`** (`src/lib/rls.ts`), which opens a transaction and runs `set_config('app.current_tenant', tenantId, true)` so RLS policies scope every query. Keep explicit `eq(table.tenantId, ...)` filters too, as belt-and-suspenders.
- **`opsDb`** (`src/lib/db/ops.ts`) — the control-plane pool (`OPS_DATABASE_URL`, an `ops_worker` role with `BYPASSRLS`). Use **only** for legitimate cross-tenant work: provisioning, login/slug resolution, platform metrics, webhooks.

RLS is enforced at the DB via migrations `0004_enable_rls.sql` (+ 0006–0009 per-table) which `ENABLE ROW LEVEL SECURITY`, and `0010_force_rls.sql` which `FORCE ROW LEVEL SECURITY`. `FORCE` is required because plain `ENABLE` does not apply to the table owner — so **the `DATABASE_URL` role must be a non-superuser without BYPASSRLS**, distinct from the ops role. See `docs/DATABASE_ROLES.md`. Policies match `tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid`.

## Per-request context, auth, and RBAC

- **`getCtx()`** (`src/lib/context.ts`, wrapped in React `cache`) builds the `ServiceCtx` from the proxy-injected headers, verifies the tenant is active (Redis-cached via `src/lib/platform/tenant-cache.ts`), and resolves `planTier` + `activeModules`. It **throws** if `x-tenant-id`/`x-user-id` are missing — so it only works inside proxy-rewritten tenant routes. This is the entry point for server components/actions needing tenant identity.
- **RBAC**: `requireRole([...])` / `requirePermission(perm)` (`src/lib/auth/guards.ts`) call `getCtx()` and throw on failure. The role→permission map is static in `src/lib/auth/catalog.ts` (`DEFAULT_ROLE_PERMISSIONS`); roles: `admin, teacher, student, parent, staff, accountant, librarian`. `admin` gets all permissions.
- **Module/subscription gating**: `requireModule(name)` HOF and `assertModule(name)` (`src/lib/security/guard.ts`) check `ctx.activeModules`; the HOF returns 403 for API requests (arg is a `Request`) and throws for server actions.
- **Tokens**: tenant sessions are JWTs in the `auth_token` cookie (`src/lib/auth/token.ts`); operator sessions use `PLATFORM_COOKIE` + `src/lib/platform/auth/token.ts` (`jose`). Passwords use `argon2`. MFA via `otplib`.

Role-based layout: `src/app/root/[tenant]/layout.tsx` renders a bare shell for `teacher`/`student` roles and the full admin `TenantClientLayout` otherwise. Route groups `(teacher)` and `(student)` hold those portals.

## Database schema

Single schema file: **`src/lib/db/schema.ts`** (~19 `pgTable`s: users, tenants, tenantUsers, permissions, rolePermissions, auditLogs, students, staffProfiles, academicClasses, classSections, studentEnrollments, attendance, assignments, feeStructures, studentInvoices, staffPayroll, financialTransactions, exams, vehicleTelemetry). Enums like `UserRole`, `PlanTier`, `Permission`, `ServiceKey` and the `SERVICE_KEYS`/`PERMISSIONS` const arrays are exported from here and re-exported via `@/lib/db`.

Migration workflow: edit `schema.ts` → `npm run db:generate` → review the SQL in `drizzle/` → `npm run db:migrate`. **When adding a tenant-scoped table, also add `ENABLE` + a `tenant_isolation_policy` + `FORCE ROW LEVEL SECURITY` for it** (follow the pattern in `0004`/`0010`), or it will silently leak across tenants.

## AI

Gemini via `@google/genai` in `src/lib/ai/client.ts` (SDK with a fetch fallback). Exam generation: `src/app/api/ai/exam-gen/` and `src/app/api/admin/ai-exam-gen/`; teacher UI in `root/[tenant]/(teacher)/`. `exams.content` is stored as jsonb (type it as `unknown`, not `any`).

## Integrations

Webhooks under `src/app/api/webhooks/`: `biometrics` (attendance devices) and `gps` (vehicle telemetry). Redis (`ioredis`) backs session, tenant-status, and metering caches, all with in-memory fallbacks when `REDIS_URL` is unset — do not assume Redis is present.

## Conventions

- **`server-only`** is imported in modules that must never reach the client (e.g. platform session/token). Respect it.
- The `Button` primitive (`src/components/ui/button.tsx`) supports variants **`primary | secondary | ghost | danger`** only.
- Env is loaded from `.env.local` first (override), then `.env`. `DATABASE_URL` default in local dev points at the Docker Postgres on port `5433` (see README). pgvector extension must be enabled in the DB.
- Security headers + CSP are set in `next.config.ts`. `removeConsole` strips `console.*` (except error/warn) in production builds.
