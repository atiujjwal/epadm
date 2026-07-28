# Enterprise School ERP — Transformation Blueprint

**Product:** EPADM  
**Phase:** 1 — Product and architecture analysis  
**Prepared:** 2026-07-28  
**Evidence base:** repository state on 2026-07-28 plus the authoritative product sources linked in Section 2  
**Scope rule:** this document specifies the transformation; it does not implement it.

## Executive Summary

EPADM has a credible SaaS foundation but not yet a coherent enterprise product architecture. Its strongest assets are the subdomain-aware tenant/operations split, shared-schema tenant isolation model, platform operator console, tenant onboarding, a broad UI primitive library, and several real data-backed registries. Its central product problem is that navigation labels, URL structure, permissions, persisted capabilities, and mock workspaces do not agree with one another.

The tenant application currently exposes 18 primary sidebar modules under eight groups. Most module depth is encoded as `?tab=` state on a single URL. This creates dozens of pseudo-pages that cannot be deep-linked predictably, protected independently, tested as route boundaries, or assigned cleanly to module permissions. Some domains have two or three parallel implementations: a module registry, generic mock module pages, and newer data-backed workspaces. Concrete routes usually shadow the generic catch-all, leaving duplicate configuration in the repository. Several visible actions are demonstrators rather than functioning operations.

The target architecture therefore adopts five rules:

1. **One bounded domain, one canonical module home.** Student records, admissions, academics, attendance, finance, HR, and campus operations each own their data and routes. Cross-domain views reference those records instead of duplicating them.
2. **Three navigation levels maximum.** Sidebar group → module → route-backed feature. Tabs are reserved for facets of one record, not unrelated workflows.
3. **Subdomain tenancy stays invisible in URLs.** School users continue to see `/students`, not `/root/{tenantId}/students`; `src/proxy.ts` remains the internal rewrite boundary. Platform operations remain on the ops hostname under `/admin`.
4. **Authorization is capability- and scope-based.** Navigation visibility follows permission grants, but every page, action, API, export, and field is enforced independently. Static role defaults become templates, not the only authorization model.
5. **Prototype truth is explicit.** Persisted, partial, mock, broken, redirect-only, and disabled capabilities are distinguished throughout the migration. No present-day behavior is silently treated as production-ready.

The recommended delivery sequence first stabilizes the route shell, tenant isolation, permission catalog, and shared list/detail/form patterns. It then consolidates core identity and academic records before completing daily operations, finance, people operations, campus services, portals, analytics, and finally enterprise/platform expansion. This avoids building new modules on the current ambiguous navigation and authorization model.

### Current-state verdict

| Dimension | Finding |
|---|---|
| SaaS architecture | Sound direction: separate tenant and ops planes, proxy-injected context, RLS-oriented schema |
| Information architecture | Fragmented: module groups mix domains, channels, products, and technical capabilities |
| Route architecture | Shallow and tab-driven; few detail routes; aliases and shadowed routes exist |
| Feature maturity | Mixed: real registries and control-plane operations coexist with convincing static mock screens |
| RBAC | Eight tenant roles and 16 coarse permissions; UI filtering uses only four hard-coded module rules |
| Data model | 37 tables across tenant/core and platform schemas; broad gaps remain for guardians, results, library circulation, full transport, hostel, assets, and communications delivery |
| Design system | Large Radix/shadcn-style primitive set and tokens exist; application patterns and button APIs are duplicated |
| Build health | `npm run typecheck` fails on 2026-07-28, including missing Labs modules, a missing platform AI panel, type mismatches, and button/sidebar typing errors |
| Enterprise readiness | Foundation-stage; consolidation and security gates must precede breadth expansion |

## 1. Current State Audit

### 1.1 Route Inventory

#### 1.1.1 Routing model and route notation

`src/proxy.ts` is the routing boundary. On a school hostname, authenticated browser requests are internally rewritten from the visible route `/x` to `/root/{tenantId}/x`; the browser never displays `root` or the tenant UUID. On the operations hostname, `/admin/**` is the platform console and `/cms/**` is internally rewritten to `/admin/**`. `/admin` on a school hostname is deliberately the tenant RBAC workspace, while `/admin/*` is redirected to the ops hostname. This exact-path exception is fragile and must be preserved until the route migration is complete.

Status terms used below:

- **Live:** reads and/or mutates persisted tenant data through an implemented service.
- **Partial:** some primary behavior is persisted, while significant visible flows are mock or inert.
- **Prototype:** renders static/sample data or controls without a complete application service.
- **Alias:** redirects or re-exports another route.
- **Broken:** cannot typecheck or resolve a referenced module.
- **Shadowed:** an App Router page exists but proxy behavior prevents the intended audience reaching it.

#### 1.1.2 Public and pre-authentication pages

| Visible route | Status | What it renders / actions | Logical home |
|---|---|---|---|
| `/` | Live | Marketing landing page when signed out; authenticated users are rewritten to tenant root and role-redirected | Public website / tenant entry |
| `/about` | Live | Company/product narrative | Public website |
| `/contact` | Live | Contact form posting to `/api/contact` | Public website |
| `/demo` | Live | Demo request form posting to `/api/demo-request` | Public website |
| `/platform` | Live | Platform architecture/capabilities marketing page | Public website |
| `/security` | Live | Security and compliance marketing page | Public website |
| `/legal/privacy` | Live | Privacy policy | Legal |
| `/legal/terms` | Live | Terms of service | Legal |
| `/legal/cookies` | Live | Cookie policy | Legal |
| `/legal/accessibility` | Live | Accessibility statement; linked from neither `footerNav` nor main navigation | Legal |
| `/login` | Alias | Re-exports the registration/login landing experience; proxy sends authenticated users to `/` | Identity |
| `/register` | Alias | Re-exports the same registration/login landing experience | Identity |
| `/onboarding` in `(marketing)` | Shadowed | A marketing onboarding client exists, but `/onboarding` is not public in `PUBLIC_PATHS`; signed-out users are redirected to `/#login`, signed-in users are rewritten to tenant onboarding | Remove or rename; conflicts with tenant setup |
| `/robots.txt` | Live | Generated robots metadata | Public infrastructure |
| `/sitemap.xml` | Live | Generated sitemap | Public infrastructure |

The public source of truth includes `PUBLIC_PATHS` in `src/proxy.ts`, `mainNav`/`ctaNav`/`footerNav` in `src/config/site.ts`, and the marketing layout. These sources are not fully aligned: Accessibility is public but absent from footer navigation; forgot-password and documentation URLs exist in configuration but have no corresponding pages.

#### 1.1.3 Platform operations pages (ops hostname)

| Visible route | Status | What it renders / actions | Logical home |
|---|---|---|---|
| `/admin/login` | Live | Operator email/password, MFA challenge, and platform session establishment | Platform identity |
| `/admin` | Live | Tenant counts, active/inactive schools, 30-day compute/AI consumption, 14-day token chart, and link to tenant registry | Platform overview |
| `/admin/tenants` | Live | Searchable tenant registry, status/tier/service summary, tenant provisioning dialog, row navigation | Tenant operations |
| `/admin/tenants/[tenantId]` | Live | Tenant identity, active/suspended status control, service toggles, performance metrics, and FinOps metrics | Tenant operations |
| `/admin/ai` | Broken | Intended platform AI panel; imports missing `../cms-panels` | Platform AI operations |
| `/cms`, `/cms/*` | Alias | Ops-host rewrite to `/admin`, `/admin/*` | Deprecate compatibility alias |

The platform sidebar also displays disabled placeholders for Plans & Modules, Billing & Invoices, SMS/WhatsApp, AI Services, Platform Users, Audit Log, and Infrastructure. They are navigation promises, not routes or implemented features.

#### 1.1.4 Tenant pages (school hostname)

| Visible route | Status | What it renders / actions | Logical module |
|---|---|---|---|
| `/` | Alias | Role redirect: admin → `/admin-dashboard`, accountant → `/fees`, all others including teacher/student → `/dashboard` | Workspace entry |
| `/dashboard` | Partial | Live totals for students, staff, open invoices/outstanding value; remaining charts, activities, trends, and shortcuts are sample-oriented | Overview |
| `/admin-dashboard` | Alias | Re-exports `/dashboard`; used only as the admin home target | Overview |
| `/onboarding` | Live | Four-step superadmin wizard: school profile, academic structure, staff, and operations; draft sync and completion | School setup |
| `/setup-pending` | Live | Blocking message for non-superadmin users until setup completes | School setup |
| `/academics` | Partial/live | Persisted academic years, classes, sections, enrollments, subjects; local-only streams, houses, terms, subject mappings, load and coverage views; create/update/delete UI is uneven | Academics |
| `/attendance` | Prototype | Daily feed, monthly feed, absentee SMS, leave, class/annual/perfect-attendance reports, holiday tab; sample rows and inert actions | Attendance |
| `/timetable` | Partial | Reads persisted timetable entries into one class grid; falls back to mock grid; Print/Edit controls are not wired | Scheduling |
| `/exams` | Partial | Reads saved exam records; exam lists, marks entry, exam attendance, remarks, hall tickets, marksheets, results and configuration are mostly mock/inert | Assessment |
| `/students` | Partial/live | Persisted student list and create; dashboard and numerous bulk/report/document/promotion tabs are prototypes; no canonical detail route | Student management |
| `/admissions` | Partial/live | Persisted applicant create/list in inquiry→enrolled Kanban; no stage transition/edit/detail workflow | Admissions |
| `/staff` | Partial/live | Persisted staff CRUD and department CRUD; dashboard/list are live; notes and ID cards are prototype surfaces | HR & staff |
| `/payroll` | Partial | Reads payroll records; run, slips, deductions, loans, reimbursements, approvals, bank export and statutory views are mostly presentational | Payroll |
| `/fees` | Partial/live | Reads fee structures, invoices and transactions; dashboard and derived reports use live aggregates, while collection, receipt, reminders, cancellation, configuration, and many actions are not wired | Fees & billing |
| `/finance` | Alias | Proxy and page redirect to `/fees` | Remove alias; future accounting owns `/finance` |
| `/vehicles` | Partial/live | Persisted vehicle create/list; routes, drivers, subscriptions, maintenance, fees and reports are mock/inert | Transport |
| `/communications` | Partial/live | Persisted campaign create/list; notices, templates, service channels, logs and usage are prototype data | Communications |
| `/library` | Partial/live | Persisted book create/list; issue, return, reservations, fines, members, acquisitions and reports are prototype data | Library |
| `/labs` | Broken | Page references missing `@/lib/admin/labs` and `./labs-workspace`; a separate static `src/lib/modules/pages/labs.tsx` exists but is not wired | Laboratory |
| `/ai-studio` | Prototype | Static generator/copilot/knowledge/governance workspaces with an inert “new generation” pattern | AI Studio |
| `/intelligence` | Prototype | Static cross-domain signals for attendance, fees, academics, and operations | Analytics |
| `/mobile` | Prototype | Static adoption, device, content visibility, notifications, branding, version, and support views | Digital experience administration |
| `/admin` | Partial/live | Persisted tenant member list/create; reset, switch-user, custom role, permission, login/failure, and audit views are prototypes | Identity & access |
| `/users` | Alias | Proxy and page redirect to `/admin` | Remove alias |
| `/settings` | Prototype | Static school profile, role, academic year, integration, Copilot and compliance screen | School administration |
| `/teacher/home` | Partial/live | Teacher profile/class resolution, roster, attendance entry, assignment creation, saved exams and AI exam creator; role-guarded | Teacher workspace |
| `/student/home` | Partial/live | Live enrollment and assignments; hard-coded announcements, grades/GPA and some summary content; role-guarded | Student portal |
| `/[...module]` internal catch-all | Redundant | Generic `ModuleWorkspace` fallback supports 13 module names, but concrete routes exist for them; nested paths fail the exact supported-name test | Delete after route migration |

Two role-routing defects are material: teacher and student root entry currently sends them to `/dashboard`, not their dedicated `/teacher/home` or `/student/home`; and the tenant layout removes the admin shell for teacher/student on every route, even when they directly access an admin-oriented page. Parent, staff, and librarian have no dedicated landing route.

#### 1.1.5 API and integration route inventory

| Route | Methods | Current responsibility | Target domain |
|---|---|---|---|
| `/api/auth/login` | POST | Tenant login/session cookie | Identity |
| `/api/auth/logout` | POST, GET | Session termination; GET mutation should be removed | Identity |
| `/api/auth/register` | POST | Tenant/user registration | Identity / provisioning |
| `/api/identity/tenant` | GET | Tenant identity/slug lookup | Identity |
| `/api/onboarding/defaults` | GET | Onboarding defaults | School setup |
| `/api/onboarding/sync` | POST | Save onboarding draft step | School setup |
| `/api/onboarding/complete` | POST | Complete setup/provision defaults | School setup |
| `/api/admin/users` | GET, POST | Tenant membership list/create | Identity & access |
| `/api/admin/students` | GET, POST | Student list/create | Students |
| `/api/admin/staff` | GET, POST, PATCH, DELETE | Staff CRUD | HR & staff |
| `/api/admin/staff/departments` | GET, POST, PATCH, DELETE | Department CRUD | HR & staff |
| `/api/departments/[id]` | DELETE | Legacy department delete | Merge into HR API |
| `/api/admin/academics/academic-years` | GET, POST | Academic-year list/create | Academics |
| `/api/admin/academics/classes` | GET, POST, PATCH | Class list/create/update | Academics |
| `/api/admin/academics/sections` | GET, POST | Section list/create | Academics |
| `/api/admin/academics/enrollments` | GET, POST | Enrollment list/create | Student enrollment |
| `/api/admin/subjects` | GET, POST | Subject list/create | Curriculum |
| `/api/admin/admissions` | GET, POST | Applicant list/create | Admissions |
| `/api/admin/vehicles` | GET, POST | Vehicle list/create | Transport |
| `/api/admin/communications` | GET, POST | Campaign list/create | Communications |
| `/api/admin/library` | GET, POST | Book list/create | Library |
| `/api/admin/ai-exam-gen` | POST-style handler | Hard-coded/stub admin exam generation path | Remove; consolidate into AI gateway |
| `/api/ai/exam-gen` | POST-style handler | Gemini exam generation | AI / assessment |
| `/api/admin/cron/invoices` | POST | Tenant invoice generation job exposed as HTTP | Billing job; machine-authenticated worker |
| `/api/webhooks/biometrics` | POST | Integration-key-authenticated attendance ingestion | Attendance integrations |
| `/api/webhooks/gps` | POST | Integration-key-authenticated vehicle telemetry ingestion | Transport integrations |
| `/api/platform/auth/login` | POST | Operator login | Platform identity |
| `/api/platform/auth/mfa` | POST | Operator MFA verification | Platform identity |
| `/api/platform/auth/logout` | POST | Operator logout | Platform identity |
| `/api/platform/overview` | GET | Platform aggregates | Platform analytics |
| `/api/platform/tenants` | GET, POST | Tenant list/provision | Platform tenant operations |
| `/api/platform/tenants/[id]` | GET | Tenant detail | Platform tenant operations |
| `/api/platform/tenants/[id]/status` | PATCH | Activate/suspend tenant | Platform tenant operations |
| `/api/platform/tenants/[id]/services` | PUT | Toggle tenant service | Platform entitlements |
| `/api/contact` | POST, GET | Public lead capture/list behavior; delivery is not a production CRM workflow | Marketing CRM |
| `/api/demo-request` | POST, GET | Public demo lead capture/list behavior | Marketing CRM |
| `/api/scratch` | GET | Diagnostic/scratch endpoint | Delete before production |

### 1.2 Navigation Audit

#### 1.2.1 Public navigation

The desktop and mobile marketing navigation share `src/config/site.ts`. Primary items are Features (`/#features`), Pricing (`/#pricing`), and Compliance (`/security`). CTAs are Request Demo and School Login; Platform Admin is feature-flagged off. The footer adds Platform Overview, Security, About, Contact, Demo, Privacy, Terms, and Cookies. Accessibility is omitted. Active state is path-prefix based, which cannot highlight same-page hash sections independently.

#### 1.2.2 Platform navigation

The platform shell has a persistent left sidebar, sticky topbar, global search input, disabled Region filter, and always-available New Tenant dialog. Only Overview and School Tenants are enabled. Tenant detail uses internal tabs for control, performance, and FinOps. There is no breadcrumb trail, and topbar search state is shell-global but only useful where a page consumes it.

#### 1.2.3 Tenant navigation

The tenant sidebar is driven by `NAV` in `src/lib/navigation/module-registry.tsx`:

```text
Overview
  Dashboard
Academics
  Academics Setup
  Attendance
  Timetable
  Exams
People
  Students
  Admissions
  Staff
  Payroll
Operations
  Fees
  Vehicles
  Communications
Facilities
  Library
  Labs
AI Studio
  AI Studio
  Legacy Insights
Mobile
  App Management
Admin
  App Admin (RBAC)
  Settings
```

The registry declares subflows, but `AppSidebar` intentionally renders only primary modules. Subflows appear as a horizontal “inner rail” within module pages and modify `?tab=`. Therefore the actual Level 3 navigation is distributed across `module-registry.tsx`, each custom workspace's rail configuration, and legacy generic module page files. Labels disagree between those sources; for example Exams may be “Dashboard,” “Exam Dashboard,” or “Structure & Dashboard,” and Students uses both “All Students” and “Student List.”

Topbar navigation comprises tenant dropdown (display-only), academic-year badge calculated from the current calendar year rather than tenant configuration, global command palette, Copilot drawer, and a notification icon with no destination. The command palette uses the same module registry. Breadcrumbs are simulated inside `ModuleShell`, not derived from route metadata.

Role visibility is not permission-driven. `AppSidebar` has only four hard-coded restrictions: Payroll and Fees allow admin/accountant; Admin and Settings allow admin. All other modules are shown to every non-teacher/student shell role. Teacher and student receive no sidebar at all. Superadmin is not included in the hard-coded admin allow-list, despite having all catalog permissions. Module entitlements (`activeModules`) are not applied to navigation.

#### 1.2.4 In-page navigation surfaces

| Surface | Current pattern | Issue |
|---|---|---|
| Module secondary navigation | Horizontal grouped buttons using `?tab=` | Treats independent tasks and reports as tabs; URLs are not semantic |
| Teacher portal | Query-string tabs and class selection | No shared role-shell or route-backed sections |
| Tenant control panel | Local tabs | Acceptable for facets of one tenant record |
| Marketing | Header links, mobile drawer, footer | Separate visual language from product shell is appropriate |
| Command palette | Module jump list | Does not search persisted students/invoices despite placeholder copy |
| Breadcrumbs | Hand-built title/group/flow labels | Not universal and can drift from routes |
| Detail navigation | Almost absent | No student/staff/class/application canonical detail pages |

### 1.3 Feature Inventory

#### 1.3.1 Persisted capability inventory

| Domain | Persisted capabilities | Visible but incomplete/prototype capabilities |
|---|---|---|
| Platform | Operator auth/MFA, tenant provision/list/detail/status, service toggles, subscription/metric reads, platform audit writes | Plan catalog, billing, comms ops, AI ops, platform users, audit viewer, infrastructure |
| Onboarding | Four-step draft, defaults, completion gate | Post-setup settings parity and resumable validation diagnostics |
| Identity | Login/register/logout, tenant memberships, static default permission catalog, member create/list | Edit/deactivate users, invitations, reset password, impersonation, custom roles, scoped grants, login/failure/audit viewers |
| Students | Create/list and summary | Detail/edit/archive, guardians, health, documents, bulk import/edit, promotion, certificates, ID cards, sibling graph, alumni |
| Staff | Create/list/update/delete staff, department CRUD and summaries | Contracts, recruitment, qualifications, leave, performance, documents, ID cards, separation |
| Academics | Academic years, classes, sections, enrollment, subjects; class teacher history exists | Curriculum plans, class-subject mapping persistence, streams, electives, houses, terms/calendar, rollover, grading schemes, load and coverage persistence |
| Attendance | Teacher manual attendance, biometric ingestion, student attendance table, leave/holiday tables | Admin operations, corrections/approval, staff attendance, period attendance, parent/student view, alerts, analytics |
| Timetable | Timetable-entry reads and schema | Builder, conflict engine, rooms/resources, teacher view, publish/version workflow |
| Teaching | Assignment create and student assignment read | Submissions, grading, attachments, lesson plans, gradebook, LMS content |
| Exams | Exam record list, teacher AI-generated exam save | Exam schedules, assessment components, marks, remarks, attendance, grade calculation, report cards, result publication |
| Admissions | Applicant create/list and pipeline stage field | Workflow transitions, documents, assessments, interview/offer, conversion to student/enrollment, fees |
| Fees | Fee structures, invoices, financial transactions and derived dashboard | Receipts/payment allocation, payment gateway, concessions, refunds, reconciliation, robust billing jobs, accounting integration |
| Payroll | Payroll records and list | Structures/components, payroll calculation, approvals, slips, loans, claims, bank/statutory exports |
| Transport | Vehicles create/list, raw GPS telemetry ingestion | Drivers, stops, routes, allocations, attendance, maintenance, incidents, live tracking, transport billing |
| Communications | Campaign create/list | Audience resolver, templates, channel adapters, scheduling, delivery logs, consent/preferences, replies |
| Library | Book create/list | Copies/accessions, members, circulation, reservations, fines, acquisitions, stock verification |
| Labs | `lab_bookings` schema only | Current page is broken; inventory, chemical safety, incidents, vendors and POs are prototypes elsewhere |
| Mobile | Feature-flag table | Actual app, sessions/devices, pushes, app configuration lifecycle, support system |
| AI | Gemini exam generation, token metering utilities | Central gateway, prompt/version store, knowledge base/RAG, policy, evaluation, approval, quotas, other generators |
| Analytics | Platform metrics and limited live dashboard aggregates | Cross-domain warehouse/semantic layer, report catalog, scheduled reports, custom reports, governed exports |

#### 1.3.2 Current component, layout, and interaction inventory

The codebase contains a broad primitive library: accordion, alert/dialog, avatar, badge, breadcrumb, button, calendar, card, chart, checkbox, collapsible, command, context/dropdown menus, dialog/drawer/sheet, form controls, hover card, input/OTP, menubar/navigation menu, pagination, popover, progress, radio, resizable panels, scroll area, select, separator, sidebar, skeleton, slider, Sonner toast, switch, table, tabs, textarea, toggles, tooltip, empty state, metrics, activity rows, role charts, and topology grids.

Application-level patterns include `AppShell`, `AppSidebar`, `Topbar`, command palette, Copilot drawer, `PageHeader`, `ModuleShell`, inner rail, export menu, and page toolbar. Platform operations use a separate admin shell/sidebar/topbar. Marketing uses a third header/footer system. Teacher/student portals use bare layouts. `TenantSidebar` is a legacy alternative to `AppSidebar` and is not the current tenant shell.

Design tokens in `src/styles/globals.css` use Tailwind v4 mappings over semantic CSS variables for background/foreground, surface, muted, primary, secondary, accent, border, success, warning, danger, info, five chart colors, and sidebar colors, with light/dark themes. However, many module pages bypass tokens with literal hex colors. Two button layers (`button.tsx` adapter and `button-base.tsx`) expose incompatible variants/sizes and currently contribute type errors.

Typical live CRUD forms use local state, inline validation messages, `fetchWithCsrf`, and optimistic insertion into the current list. There is no uniform mutation contract, dirty-form guard, confirmation policy, or error boundary convention. `ModuleShell` supplies search, Filters, Export, View, and Edit controls generically, but most are visual-only. Loading exists only for the dashboard. Empty states range from the shared primitive to bespoke dashed panels. Sonner is installed, but success/error feedback is not consistently toast-driven.

#### 1.3.3 Data model awareness

The schema contains the following entities:

| Domain | Existing entities and principal relationships |
|---|---|
| Global identity | `users`; many-to-many tenant membership through `tenant_users` |
| Tenant/platform | `tenants`; platform-schema `platform_operators`, `tenant_services`, `tenant_subscriptions`, `tenant_daily_metrics`, `platform_audit_logs` |
| Authorization/audit | `permissions`, `role_permissions`, `audit_logs`; role assignment is stored on `tenant_users` |
| Student/HR | `students` → optional `tenant_users`; `staff_profiles` → optional `tenant_users`; `staff_departments` → optional head staff |
| Academics | `academic_years` → `academic_classes` → `class_sections`; `class_teacher_history`; `subjects`; `student_enrollments` joins student/class/section |
| Daily learning | `attendance` joins student/class/section and marker user; `assignments` joins class/section and creator |
| Finance | `fee_structures` → class; `student_invoices` → student/enrollment; `staff_payroll` → staff; `financial_transactions` may reference invoice or payroll |
| Assessment | `exams` → class and creator; content is JSON, but there are no exam-component/mark/result entities |
| Extensions | `vehicle_telemetry`, `leave_applications`, `holidays`, `admission_applications`, `timetable_entries`, `vehicles`, `message_campaigns`, `library_books`, `lab_bookings`, `mobile_feature_flags` |

The main missing aggregates are guardians/relationships, student documents and health, applications workflow events, curriculum and subject offerings, rooms/resources, attendance sessions and correction audit, assignment submissions, marks/results/report cards, payment/receipt allocations, full general ledger/budgets, HR contracts/leave/payroll configuration, library copies/circulation, transport routes/allocations/drivers, hostel, inventory/assets/procurement, communications templates/delivery/preferences, events/activities, consent/retention, and report definitions.

### 1.4 Redundancy & Gap Analysis

#### 1.4.1 Redundancies, overlaps, and orphaned surfaces

| Finding | Evidence | Decision |
|---|---|---|
| Dashboard alias | `/admin-dashboard` re-exports `/dashboard` | Keep temporary redirect, then use `/dashboard` for all role homes with role-specific content |
| Finance alias | Proxy and `/finance` page both redirect to `/fees` | Remove double redirect; reserve `/finance` for accounting and keep fees under `/finance/fees` |
| Users alias | Proxy and `/users` page redirect to `/admin` | Replace with canonical `/administration/users`; remove alias after telemetry window |
| Generic and custom module duplication | `src/components/workspace/module-workspace.tsx`, `src/lib/modules/pages/*`, and route-local workspaces model the same domains | Select route-local live workspace behavior as migration source; delete mock duplicates after parity |
| Navigation duplication | `module-registry.tsx` subflows and page-local rail arrays disagree | Generate all navigation from one typed route/permission registry |
| AI exam endpoints | `/api/ai/exam-gen` and stub `/api/admin/ai-exam-gen` | Consolidate behind versioned AI application service |
| Labs duality | Broken live route and unwired static module page | Treat schema/booking intent as partial; rebuild canonical Labs module |
| Platform “AI Services” | Disabled sidebar item plus broken `/admin/ai` | Rebuild only after AI gateway/usage policy exists |
| Tenant Admin terminology | “App Admin (RBAC),” “Platform Users,” and `/admin` imply platform scope on tenant host | Rename to Administration; use Users & Access submodule |
| Legacy Insights | Same cross-domain purpose as dashboards/reports/AI monitors | Merge into Analytics & Reports; remove “Legacy” product language |
| Mobile as tenant module | Channel administration is mixed with homework, exams, fees, and announcements owned elsewhere | Move delivery/channel settings to Digital Experience; keep content ownership in source modules |
| Reports embedded as pseudo-tabs | Students, fees, exams, transport, payroll and library repeat “Reports” tabs | Keep domain reports under each module and register them in a cross-domain report catalog |
| Academic setup overreach | Houses, grading, rollover, curriculum, roster, load, coverage all share one `/academics?tab=` | Split into structure, curriculum, calendar, teaching allocation, and progression routes |
| Marketing onboarding collision | Two `/onboarding` pages with incompatible audiences | Rename any public flow to `/get-started`; tenant setup retains `/setup` |
| Scratch API | `/api/scratch` | Delete before any production release |

#### 1.4.2 Enterprise gap matrix

| Enterprise domain | Current coverage | Principal missing capabilities |
|---|---|---|
| Academic management | Partial | Persisted curriculum, offerings, rooms, calendars/terms, lesson plans, academic policies, rollover/versioning |
| Student management | Partial | Guardians, 360° profile, documents, health, behavior, transfer/withdrawal, alumni, bulk lifecycle operations |
| Staff & HR | Partial | Recruitment, contracts, qualifications, staff attendance, leave, appraisal, training, offboarding |
| Finance & accounting | Fees partial | Chart of accounts, journals, payables/receivables, expenses, budgets, bank reconciliation, tax, close, financial statements |
| Attendance | Partial teacher capture | Admin session management, staff/period attendance, corrections, alerts, analytics, portals |
| Examinations & results | Early partial | Schedules, components, marks, moderation, grades, result calculation/publication, report cards, transcripts |
| Library | Catalog only | Copies, circulation, reservations, fines, acquisitions, inventory/audit |
| Laboratory | Broken/booking schema | Labs, assets, stock, chemicals, experiments, booking workflow, safety/incidents |
| Sports & extracurricular | Absent except mock house points | Activities, teams, coaches, fixtures, participation, achievements, consent |
| Transport | Vehicle/telemetry partial | Routes/stops/drivers/attendants, allocations, attendance, tracking UI, maintenance, incidents, billing |
| Hostel | Absent | Buildings, rooms/beds, allocations, wardens, attendance/leave, mess, fees, incidents |
| Inventory & assets | Absent | Items, stores, stock, requisitions, procurement, vendors, assets, maintenance/depreciation |
| Communication | Campaign shell partial | Templates, audiences, channels, preferences/consent, schedules, delivery, inbox, escalation |
| Reports & analytics | Minimal | Governed catalog, role dashboards, semantic definitions, exports, scheduled delivery, custom builder |
| Parent/student portals | Student partial; parent absent | Parent-child linking, self-service, payments, results, attendance, requests, consent, messaging |
| System administration | Partial | School/campus settings, custom roles, scoped grants, integrations, audit viewer, retention/privacy, data operations |
| Health, welfare & safeguarding | Absent | Medical records, visits, medication, allergies, incidents, counseling/safeguarding with strict field security |
| Food service | Absent | Menus, meal plans, POS/accounts, dietary controls, stock integration |
| Documents & certificates | Mostly prototype | Templates, generation, signatures, verification, expiry, student/staff records |

#### 1.4.3 Verified build-health gaps

`npm run typecheck` was executed during this analysis and failed. The failures are specifications inputs, not changes made by this phase:

- Missing `src/app/admin/cms-panels` dependency for `/admin/ai`.
- Missing Labs service and workspace referenced by `/labs`.
- Tenant member and student workspace types disagree over `Date | string` versus `string`.
- The legacy button adapter passes unsupported variant/size unions to the base button.
- Sidebar trigger composition has incompatible anchor/button event types.

These issues make “foundation and shell stabilization” a mandatory first implementation gate.

## 2. Industry Research Summary

The research below uses vendor documentation and product pages, not inferred category conventions.

### 2.1 Product patterns

**ERPNext / Frappe Education.** Frappe separates education-specific academic objects from general ERP capabilities. Its Education app groups students/instructors, admissions, programs/courses, attendance, scheduling, assessments, fees, and a student portal, while ERPNext supplies accounting and broader business operations. Academic Year and Academic Term are shared defaults that affect the entire education domain. This supports a clear separation between academic operations and enterprise finance/HR while sharing master data. Sources: [ERPNext Education module](https://docs.frappe.io/erpnext/education-module-in-erpnext), [Frappe Education introduction](https://docs.frappe.io/education/getting-started), [Education Settings](https://docs.frappe.io/education/education-settings).

**Classter.** Classter centers the information architecture on one student record spanning inquiry, admission, enrollment, academics, attendance, marks, billing, communications, and alumni. Its public module taxonomy distinguishes Core/SIS, Academic CRM, Academics & LMS, Admissions, Billing & Payments, Library, Transportation, HR, and Mobile. It explicitly offers separate student, parent, teacher, admin, and alumni portals so each role sees its own tools instead of the full administrative menu. Sources: [Classter Student Information System](https://www.classter.com/product/functionalities/student-information-system/), [Classter module catalog](https://www.classter.com/contact-us/).

**PowerSchool.** PowerSchool SIS treats scheduling, attendance, grading/gradebook, calendaring, reporting, and configurable student data as the core system of record. Teacher workflows are optimized around attendance, assignments, grades, and data entry, while parent/student portals expose real-time grades, schedules, attendance, bulletins, payments, and notifications. This favors task-oriented role workspaces over exposing administrative setup to classroom users. Source: [PowerSchool SIS](https://www1.powerschool.com/solutions/student-information/powerschool-sis/).

**Infinite Campus.** Infinite Campus positions the SIS as the central core and attaches online registration, payments, communications, food service, analytics, workflow, and learning as integrated products under one login. Parent/student mobile access consolidates grades, assignments, attendance, food service, announcements, fees, and activities. This supports an extensible modular monolith with strong shared identity and master data, not isolated mini-apps. Source: [Infinite Campus SIS](https://www.infinitecampus.com/products/student-information-system).

**Fedena.** Fedena distinguishes a stable core (student information, admissions, courses/batches, HR, attendance, timetable, examination/gradebook, finance, users, reporting) from installable Standard/Premium/Ultimate modules such as hostel, library, transport, inventory, assignments, audit, documents, alumni, integrations, and automatic timetabling. Login dashboards differ for teachers, non-teaching staff, students, parents, and management. The plugin structure demonstrates how entitlements can extend a stable taxonomy without reshaping it. Sources: [Fedena feature tour](https://fedena.com/feature-tour), [Fedena plans and module tiers](https://fedena.com/pricing-and-plans), [Fedena add-on modules](https://support.fedena.com/support/solutions/38690).

**SAP Fiori / Oracle Fusion patterns adapted to education.** SAP assigns spaces and pages by business role; pages contain relevant apps grouped into sections, while search/app finder provides access to the full authorized catalog. Oracle models job roles, abstract roles, duty roles, and aggregate privileges; its “work areas” combine landing metrics, filters, tables, actions, and drill-down pages for a business goal. Both separate navigation visibility from actual authorization and avoid placing every possible task on the home page. Sources: [SAP spaces and pages](https://help.sap.com/docs/SAP_S4HANA_CLOUD/4fc8d03390c342da8a60f8ee387bca1a/f78a65b96121447e8b276c6dec94d637.html), [SAP role assignment](https://help.sap.com/docs/PRODUCT_ID/a7b390faab1140c087b8926571e942b7/c9cdf5ac9617457a9be2a00a0cb5aacb.html?locale=en-US), [Oracle role types](https://docs.oracle.com/en/cloud/saas/applications-common/25d/faser/role-types.html), [Oracle work areas](https://docs.oracle.com/en/cloud/saas/applications-common/26a/oacpr/overview-of-work-areas.html).

### 2.2 Architecture conclusions for EPADM

| Industry pattern | EPADM specification |
|---|---|
| One student record across lifecycle | `student` is the canonical person-domain aggregate after admission conversion; attendance, results, billing, library, transport, hostel and activities reference it |
| Stable core plus optional modules | Core records/academics/identity always exist; campus services and advanced capabilities are entitlement-controlled without changing route taxonomy |
| Role-specific portals/work areas | Admin, teacher, student, parent and employee receive distinct home/work queues generated from the same capability registry |
| Operations separate from setup | Each domain has operational routes; infrequent configuration lives under its module Settings or global Administration |
| Reports near the work plus central catalog | Every domain owns its operational reports; Analytics indexes and schedules authorized reports across domains |
| Navigation visibility is not security | Server/API permissions and data scope are authoritative; nav is a projection of grants and entitlements |
| Landing page → list → object detail | Module home summarizes work; lists support filters/actions; object pages expose tabbed facets and related records |
| Nouns for modules, verbs for tasks | “Students,” “Attendance,” “Payroll”; actions use “Add student,” “Mark attendance,” “Run payroll” |

## 3. Target Information Architecture

### 3.1 Module Taxonomy

The visible school URL remains tenant-clean because tenancy is hostname/session derived. The internal physical path may remain `src/app/root/[tenant]/...` during migration, but route definitions and links use visible URLs only.

| Group | Module (slug) | Scope and submodules | Primary roles | Key entities |
|---|---|---|---|---|
| Workspace | Home (`dashboard`) | Role dashboard, work queue, approvals, favorites, calendar snapshot | All | tasks, approvals, alerts, saved views |
| Student Lifecycle | Students (`students`) | Directory, 360° profiles, guardians, documents, health summary, behavior, promotion/transfer, alumni | Admin, registrar, teacher read, student/parent self | student, guardian, relationship, enrollment, document, health profile |
| Student Lifecycle | Admissions (`admissions`) | Enquiries, applications, document review, assessment, interview, offer, enrollment conversion | Admin, admissions staff, applicant/parent limited | lead, application, checklist, assessment, interview, offer |
| Academics | Academic Structure (`academics`) | Years/terms, campuses, programs/grades, classes, sections, rooms, houses, progression | Admin, academic coordinator | academic year, term, campus, program, class, section, room, house |
| Academics | Curriculum (`curriculum`) | Subjects, curriculum boards, offerings, mappings, units, syllabus, coverage | Admin, academic lead, teacher | subject, curriculum, offering, unit, teacher allocation |
| Academics | Timetable (`timetables`) | Periods, constraints, master schedule, teacher/room schedules, versions, publish | Admin, scheduler, teacher/student/parent read | timetable, period, slot, room, constraint, publication |
| Academics | Attendance (`attendance`) | Student/staff/period attendance, leave, corrections, devices, alerts, reports | Admin, teacher, HR, student/parent read | attendance session/entry, leave, holiday, device event, correction |
| Academics | Teaching & Learning (`learning`) | Assignments, submissions, gradebook, lesson plans, learning resources | Teacher, student, parent read, academic lead | assignment, submission, rubric, gradebook item, lesson plan, resource |
| Academics | Assessments & Results (`assessments`) | Exam plans/schedules, components, marks, moderation, grades, report cards, transcripts | Admin, exam controller, teacher, student/parent read | assessment plan, exam, sitting, mark, grade scale, result, report card |
| People | Human Resources (`hr`) | Staff directory, departments, recruitment, contracts, qualifications, attendance/leave, performance, training, separation | Admin, HR manager, employee self | employee, department, position, contract, leave, appraisal, qualification |
| People | Payroll (`payroll`) | Structures, components, cycles, adjustments, approvals, slips, loans/claims, statutory and bank files | Admin, HR/payroll, accountant, employee self | salary structure, payroll run/item, payslip, deduction, loan, claim |
| Finance | Fees & Billing (`finance/fees`) | Fee plans, assignments, invoices, collections, receipts, concessions, refunds, reminders, reconciliation | Admin, accountant, parent/student self | fee plan/head, charge, invoice, payment, allocation, receipt, concession |
| Finance | Accounting (`finance/accounting`) | Chart of accounts, journals, receivables/payables, expenses, budgets, banking, close, statements | Admin, accountant, auditor read | account, journal, ledger entry, bill, expense, budget, bank transaction |
| Campus Operations | Transport (`transport`) | Fleet, drivers/attendants, routes/stops, allocations, attendance, tracking, maintenance, incidents, rates | Admin, transport manager, driver limited, parent/student read | vehicle, person assignment, route, stop, trip, allocation, telemetry, maintenance |
| Campus Operations | Library (`library`) | Catalog, copies, members, issue/return, reservations, fines, acquisitions, stocktake | Librarian, admin, teacher/student search | title, copy, member, loan, reservation, fine, acquisition |
| Campus Operations | Laboratories (`laboratories`) | Lab/experiment catalog, booking, equipment, consumables/chemicals, safety, incidents | Lab manager, teacher, admin, student read | lab, booking, experiment, equipment, stock lot, checklist, incident |
| Campus Operations | Hostel (`hostel`) | Buildings, rooms/beds, allocation, wardens, attendance/leave, mess, incidents, fees | Warden, admin, accountant, resident/parent read | hostel, room, bed, allocation, roll call, leave, meal plan, incident |
| Campus Operations | Inventory & Assets (`inventory`) | Items/stores, stock, requisitions, procurement, vendors, fixed assets, maintenance/depreciation | Store manager, procurement, accountant, admin | item, warehouse, movement, requisition, PO, vendor, asset, maintenance |
| Campus Operations | Facilities & Safety (`facilities`) | Spaces, work orders, maintenance, visitor/gate, health clinic, safeguarding controls | Facilities, security, nurse/counselor, admin | facility, work order, visitor, gate pass, clinic visit, restricted incident |
| Campus Life | Activities (`activities`) | Sports, clubs, teams, events, fixtures, participation, achievements, consent | Activity coordinator, coach/teacher, student/parent | activity, team, event, fixture, participant, achievement, consent |
| Engagement | Communications (`communications`) | Announcements, compose/campaigns, templates, audiences, channels, delivery, inbox/preferences | Admin, communications staff, teacher limited, all recipients | announcement, campaign, template, audience, message, delivery, preference |
| Engagement | Documents (`documents`) | Templates, certificates, letters, generated documents, signatures, verification | Admin, registrar, HR; self-service read | template, generated document, signature, verification token |
| Engagement | Portals & Mobile (`digital-experience`) | Portal feature policy, app branding/version, devices, pushes, support; not source content | Admin, IT/support | app config, device, push, feature flag, support ticket |
| Intelligence | Analytics & Reports (`analytics`) | Role dashboards, report catalog, scheduled/custom reports, exports, data quality | Admin, leaders, accountant, authorized staff | report definition/run, metric, dashboard, schedule, export |
| Intelligence | AI Studio (`ai-studio`) | Generators/copilots, knowledge sources, prompt templates, approvals, evaluation, usage/governance | Role-specific creators, admin governors | generation, prompt version, knowledge source, citation, review, usage policy |
| Administration | School Administration (`administration`) | Profile/campuses, users, roles/scopes, integrations, workflows, audit, privacy/retention, imports | Tenant superadmin, delegated admins/auditors | membership, role, permission grant, setting, integration, audit event, retention request |

Platform Operations is a separate plane, not another school module. Its modules are Platform Overview, Schools, Plans & Entitlements, Billing, Service Operations, AI Operations, Operators & Access, Audit & Compliance, and Infrastructure.

### 3.2 Full Navigation Hierarchy (3 levels)

Level 1 is a sidebar group, Level 2 is a primary module link, and Level 3 is a route-backed feature shown in the expanded module menu or module landing page. Object detail tabs do not add sidebar depth.

```text
Workspace
  Home
    Dashboard | My Tasks | Approvals | Calendar

Student Lifecycle
  Students
    Directory | Guardians | Enrollment & Progression | Documents | Alumni
  Admissions
    Enquiries | Applications | Assessments & Interviews | Offers | Enrollment

Academics
  Academic Structure
    Years & Terms | Classes & Sections | Campuses & Rooms | Houses | Progression
  Curriculum
    Subjects | Curricula | Class Offerings | Teacher Allocation | Coverage
  Timetables
    Master Timetable | Teacher Schedules | Room Schedules | Conflicts | Publish
  Attendance
    Daily Attendance | Staff Attendance | Leave & Corrections | Devices | Reports
  Teaching & Learning
    Assignments | Submissions | Gradebook | Lesson Plans | Resources
  Assessments & Results
    Exam Plans | Schedules | Marks Entry | Results | Report Cards

People
  Human Resources
    Staff Directory | Recruitment | Contracts | Leave | Performance
  Payroll
    Payroll Runs | Payslips | Adjustments | Loans & Claims | Statutory Reports

Finance
  Fees & Billing
    Fee Plans | Invoices | Collections | Concessions | Reconciliation
  Accounting
    General Ledger | Receivables | Payables & Expenses | Budgets | Banking

Campus Operations
  Transport
    Routes & Stops | Fleet & Crew | Allocations | Live Operations | Maintenance
  Library
    Catalog | Circulation | Members | Acquisitions | Reports
  Laboratories
    Labs & Bookings | Experiments | Inventory | Safety | Incidents
  Hostel
    Hostels & Rooms | Allocations | Attendance & Leave | Mess | Fees
  Inventory & Assets
    Stock | Requisitions | Procurement | Vendors | Assets
  Facilities & Safety
    Spaces | Work Orders | Visitors & Gate | Health | Safeguarding

Campus Life
  Activities
    Sports | Clubs | Events | Participation | Achievements

Engagement
  Communications
    Announcements | Campaigns | Templates | Delivery | Preferences
  Documents
    Templates | Certificates | Letters | Signatures | Verification
  Portals & Mobile
    Portal Policy | Devices | Notifications | Branding & Releases | Support

Intelligence
  Analytics & Reports
    Dashboards | Report Catalog | Custom Reports | Schedules | Data Quality
  AI Studio
    Generators | Copilots | Knowledge | Reviews | Usage & Governance

Administration
  School Administration
    School & Campuses | Users & Roles | Integrations | Audit | Privacy & Data
```

#### 3.2.1 Role projections

The registry holds the full taxonomy; role navigation is a permission-filtered projection:

- **Tenant Super Admin / School Admin:** full authorized operational catalog; Administration appears last. Superadmin additionally sees tenant ownership, privacy, subscription, and break-glass controls.
- **Teacher:** Home; My Classes (rosters/timetable/attendance); Teaching & Learning; Assessments (assigned subjects only); Communications; Library search; own HR/payroll; approved AI tools.
- **Student:** Home; My Learning; My Attendance; My Timetable; Results; Fees (own account); Library; Transport/Hostel if allocated; Activities; Announcements; Documents.
- **Parent:** Home; child switcher; each child's Attendance, Timetable, Learning, Results, Fees, Transport/Hostel, Communications, Documents, requests/consent. No schoolwide directory.
- **Staff:** Home; own profile/leave/payroll; assigned operational modules. “Staff” is a baseline employee persona, not a grant to all staff data.
- **Accountant:** Home; Fees & Billing; Accounting; Payroll finance steps; authorized procurement; finance reports; read-only student/staff identity fields needed for transactions.
- **Librarian:** Home; Library; restricted student/staff member lookup; library reports and fine handoff. No academic/finance records beyond membership eligibility and fine settlement status.
- **HR Manager:** Home; HR; Payroll people steps; staff attendance; documents; HR reports. Bank/tax values require separate payroll-sensitive permission.
- **Transport Manager / Hostel Warden / Lab Manager / Store Manager:** Home plus their operational module, relevant restricted people lookup, associated reports, and no unrelated modules.
- **Platform Operator:** never receives school sidebar navigation. Uses the ops-host platform console and cannot query tenant data except through explicitly audited support workflows.

#### 3.2.2 Navigation behavior rules

1. A module appears only when the user has at least one `*.read` permission for it and the tenant entitlement is enabled.
2. An unavailable entitled module may appear only to admins as a labeled setup/upgrade state; ordinary users never see dead links.
3. Counts represent server-sourced actionable work (approvals, overdue items), never hard-coded values.
4. Sidebar active state derives from route metadata and exact segment ancestry, not string prefixes alone.
5. Command search indexes the same authorized route catalog plus permitted business objects. Search results cannot reveal unauthorized labels or counts.
6. The academic year/campus context comes from tenant configuration and is a scoped context selector, not the current system date.
7. Breadcrumbs derive from route handles: Group → Module → Feature → Object. Query filters do not change breadcrumb identity.
8. Mobile collapses groups and modules but preserves the same three-level information architecture; role portals may use a smaller bottom-navigation projection.

### 3.3 Target Route Architecture

#### 3.3.1 Conventions

- Browser-visible tenant routes are tenant-neutral because the hostname/session resolves the tenant.
- Internal physical placement remains `/root/[tenant]/...` until a tested proxy alternative is adopted. Never rename `root` to `_root`.
- Slugs are lowercase kebab-case. Collection resources are plural. Canonical object detail is `/collection/[id]`.
- `new` is used only where a dedicated page is better than a modal. Mutating operations are actions/API calls, not page slugs such as `/delete`.
- Tabs are allowed within one object page (`overview`, `attendance`, `fees`) and encoded as nested routes when they require direct links or independent permissions.
- Reports owned by one module live under that module's `/reports`; the central analytics catalog links to those canonical reports.
- Configuration specific to a domain lives at `/{module}/settings`; cross-cutting configuration lives under `/administration`.

#### 3.3.2 Workspace and student lifecycle routes

```text
/dashboard
/tasks
/approvals
/calendar

/students
/students/new
/students/[studentId]
/students/[studentId]/enrollments
/students/[studentId]/attendance
/students/[studentId]/learning
/students/[studentId]/results
/students/[studentId]/fees
/students/[studentId]/documents
/students/[studentId]/health
/students/[studentId]/activities
/students/guardians
/students/guardians/[guardianId]
/students/progression
/students/transfers
/students/alumni
/students/imports
/students/reports

/admissions
/admissions/enquiries
/admissions/applications
/admissions/applications/new
/admissions/applications/[applicationId]
/admissions/applications/[applicationId]/documents
/admissions/applications/[applicationId]/assessment
/admissions/applications/[applicationId]/interviews
/admissions/applications/[applicationId]/offer
/admissions/enrollment
/admissions/settings
/admissions/reports
```

#### 3.3.3 Academic routes

```text
/academics
/academics/years
/academics/years/[academicYearId]
/academics/terms
/academics/classes
/academics/classes/[classId]
/academics/sections
/academics/sections/[sectionId]
/academics/campuses
/academics/rooms
/academics/houses
/academics/progression
/academics/settings

/curriculum
/curriculum/subjects
/curriculum/subjects/[subjectId]
/curriculum/frameworks
/curriculum/frameworks/[frameworkId]
/curriculum/offerings
/curriculum/offerings/[offeringId]
/curriculum/teacher-allocation
/curriculum/coverage
/curriculum/settings

/timetables
/timetables/master
/timetables/classes/[sectionId]
/timetables/teachers/[staffId]
/timetables/rooms/[roomId]
/timetables/conflicts
/timetables/versions/[versionId]
/timetables/settings

/attendance
/attendance/students/daily
/attendance/students/periods
/attendance/staff
/attendance/leave
/attendance/corrections
/attendance/devices
/attendance/reports
/attendance/settings

/learning
/learning/assignments
/learning/assignments/new
/learning/assignments/[assignmentId]
/learning/assignments/[assignmentId]/submissions
/learning/gradebook
/learning/lesson-plans
/learning/resources
/learning/reports

/assessments
/assessments/plans
/assessments/plans/[planId]
/assessments/schedules
/assessments/exams
/assessments/exams/[examId]
/assessments/marks-entry
/assessments/moderation
/assessments/results
/assessments/results/[resultId]
/assessments/report-cards
/assessments/transcripts
/assessments/settings
/assessments/reports
```

#### 3.3.4 People and finance routes

```text
/hr
/hr/staff
/hr/staff/new
/hr/staff/[staffId]
/hr/departments
/hr/positions
/hr/recruitment
/hr/recruitment/vacancies/[vacancyId]
/hr/contracts
/hr/leave
/hr/attendance
/hr/performance
/hr/training
/hr/separations
/hr/reports
/hr/settings

/payroll
/payroll/runs
/payroll/runs/[runId]
/payroll/payslips
/payroll/adjustments
/payroll/loans
/payroll/claims
/payroll/bank-files
/payroll/statutory
/payroll/settings
/payroll/reports

/finance
/finance/fees
/finance/fees/plans
/finance/fees/plans/[planId]
/finance/fees/invoices
/finance/fees/invoices/[invoiceId]
/finance/fees/collections
/finance/fees/receipts/[receiptId]
/finance/fees/concessions
/finance/fees/refunds
/finance/fees/reconciliation
/finance/fees/reports
/finance/fees/settings
/finance/accounting
/finance/accounting/chart-of-accounts
/finance/accounting/journals
/finance/accounting/receivables
/finance/accounting/payables
/finance/accounting/expenses
/finance/accounting/budgets
/finance/accounting/banking
/finance/accounting/period-close
/finance/accounting/reports
/finance/accounting/settings
```

#### 3.3.5 Campus, engagement, intelligence, and administration routes

```text
/transport
/transport/routes
/transport/routes/[routeId]
/transport/stops
/transport/vehicles
/transport/vehicles/[vehicleId]
/transport/crew
/transport/allocations
/transport/live
/transport/attendance
/transport/maintenance
/transport/incidents
/transport/reports
/transport/settings

/library
/library/catalog
/library/titles/[titleId]
/library/copies/[copyId]
/library/circulation
/library/loans/[loanId]
/library/reservations
/library/members
/library/fines
/library/acquisitions
/library/stocktake
/library/reports
/library/settings

/laboratories
/laboratories/labs
/laboratories/labs/[labId]
/laboratories/bookings
/laboratories/experiments
/laboratories/equipment
/laboratories/stock
/laboratories/safety
/laboratories/incidents
/laboratories/reports
/laboratories/settings

/hostel
/hostel/buildings
/hostel/rooms
/hostel/allocations
/hostel/attendance
/hostel/leave
/hostel/mess
/hostel/fees
/hostel/incidents
/hostel/reports
/hostel/settings

/inventory
/inventory/items
/inventory/stores
/inventory/stock
/inventory/requisitions
/inventory/purchase-orders
/inventory/vendors
/inventory/assets
/inventory/assets/[assetId]
/inventory/maintenance
/inventory/reports
/inventory/settings

/facilities
/facilities/spaces
/facilities/work-orders
/facilities/visitors
/facilities/gate-passes
/facilities/health
/facilities/safeguarding
/facilities/reports
/facilities/settings

/activities
/activities/sports
/activities/clubs
/activities/teams
/activities/events
/activities/participation
/activities/achievements
/activities/reports
/activities/settings

/communications
/communications/announcements
/communications/campaigns
/communications/campaigns/[campaignId]
/communications/templates
/communications/audiences
/communications/delivery
/communications/inbox
/communications/preferences
/communications/settings

/documents
/documents/templates
/documents/certificates
/documents/letters
/documents/signatures
/documents/verify/[token]
/documents/settings

/digital-experience
/digital-experience/portals
/digital-experience/devices
/digital-experience/notifications
/digital-experience/branding
/digital-experience/releases
/digital-experience/support

/analytics
/analytics/dashboards
/analytics/reports
/analytics/reports/[reportId]
/analytics/custom-reports
/analytics/schedules
/analytics/data-quality

/ai-studio
/ai-studio/generators
/ai-studio/generations/[generationId]
/ai-studio/copilots
/ai-studio/knowledge
/ai-studio/reviews
/ai-studio/prompts
/ai-studio/usage
/ai-studio/governance

/administration
/administration/school
/administration/campuses
/administration/users
/administration/users/[membershipId]
/administration/roles
/administration/roles/[roleId]
/administration/integrations
/administration/workflows
/administration/audit
/administration/privacy
/administration/imports
/administration/settings
```

#### 3.3.6 Role portal routes

Role home URLs are stable aliases into scoped experiences, not duplicate data modules:

```text
/teacher                 -> role-aware dashboard
/teacher/classes
/teacher/classes/[sectionId]
/teacher/attendance
/teacher/assignments
/teacher/gradebook
/teacher/assessments
/teacher/timetable

/student                 -> self dashboard
/student/learning
/student/timetable
/student/attendance
/student/results
/student/fees
/student/library
/student/requests

/parent                  -> family dashboard with child context
/parent/children/[studentId]
/parent/children/[studentId]/attendance
/parent/children/[studentId]/learning
/parent/children/[studentId]/results
/parent/children/[studentId]/fees
/parent/children/[studentId]/transport
/parent/requests
/parent/consents

/me/profile
/me/leave
/me/payslips
/me/documents
/me/preferences
```

These routes call the same domain services as administrative routes, with self/relationship scopes enforced server-side.

#### 3.3.7 Platform route architecture

```text
/admin
/admin/schools
/admin/schools/[tenantId]
/admin/plans
/admin/entitlements
/admin/billing
/admin/service-operations
/admin/communications
/admin/ai
/admin/operators
/admin/audit
/admin/compliance
/admin/infrastructure
/admin/settings
```

The `/cms` alias is deprecated. “Tenants” may remain an internal/API term, but user-facing platform navigation says “Schools.”

### 3.4 Role & Permission Matrix

#### 3.4.1 Permission model

Use `domain.resource.action` capabilities with an optional data scope. Standard actions are `read`, `create`, `update`, `delete`, `approve`, `publish`, `export`, and `configure`. Standard scopes are `tenant`, `campus`, `department`, `assigned`, `related`, and `self`. Example: `attendance.entries.update:assigned` or `finance.invoices.export:campus`.

Role defaults are templates. A membership may hold multiple roles; effective grants are additive except explicit field restrictions and separation-of-duties constraints. Navigation is computed from effective `read` grants plus entitlements. Destructive actions require both permission and policy checks; sensitive exports create audit events.

Matrix shorthand: **F** full CRUD/configure/approve/export; **M** manage operational records but not module security/configuration; **E** enter/update assigned work; **R** read/report; **S** self or related-child access; **X** role-specific specialist full access; **—** none by default.

#### 3.4.2 Tenant module matrix

| Module | Tenant Super Admin | School Admin | Teacher | Student | Parent | Staff | Accountant | Librarian | Specialist |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Home/tasks | F | F | S | S | S | S | S | S | S |
| Students | F | F | R assigned | S | S related | R limited | R identity-only | R member-only | Registrar X |
| Admissions | F | F | R if panelist | S applicant | S applicant | R assigned | R fee fields | — | Admissions X |
| Academic Structure | F | F | R | R | R | R | R lookup | — | Academic coordinator X |
| Curriculum | F | F | E assigned | R | R | R | — | — | Academic lead X |
| Timetables | F | F | R assigned | S | S related | R self | — | — | Scheduler X |
| Attendance | F | F | E assigned | S | S related | S | R reports | — | Attendance/HR X |
| Teaching & Learning | F | F | M assigned | S | S related | R assigned | — | — | Academic lead X |
| Assessments & Results | F | F | E assigned | S published | S related published | R assigned | — | — | Exam controller X |
| Human Resources | F | F | S + directory | — | — | S + directory | R payroll identity | — | HR manager X |
| Payroll | F | R; no self-approval | S | — | — | S | X | — | Payroll manager X |
| Fees & Billing | F | F | R status only | S | S related + pay | — | X | R fine settlement | Finance manager X |
| Accounting | F | R dashboards | — | — | — | S claims | X | — | Finance controller X |
| Transport | F | F | R assigned | S | S related | S if crew | R billing | — | Transport manager X |
| Library | F | F | M circulation-limited | S | S related | S | R fines | X | Library manager X |
| Laboratories | F | F | M assigned | R assigned | — | R assigned | R procurement | — | Lab manager X |
| Hostel | F | F | R assigned | S resident | S related | R assigned | R/X fees | — | Warden X |
| Inventory & Assets | F | F | R/request | — | — | R/request | X finance | — | Store/procurement X |
| Facilities & Safety | F | F | R/request | — | — | R/request | R costs | — | Facilities/security/health X |
| Activities | F | F | M assigned | S | S related | M assigned | R fees | — | Activity coordinator X |
| Communications | F | F | M assigned audience | R received | R received | R received | M finance audience | R received | Communications X |
| Documents | F | F | M assigned templates | S | S related | S | R finance docs | R library docs | Registrar/HR X |
| Portals & Mobile | F | F | S preferences | S | S | S | S | S | IT/support X |
| Analytics & Reports | F | F | R assigned | S | S related | R assigned | X finance | X library | Domain specialist X |
| AI Studio | F/configure | F | E approved tools | S approved | S approved | E approved | E finance tools | E library tools | AI governor X |
| Administration | F ownership | M delegated | S preferences | S preferences | S preferences | S preferences | R integrations | S preferences | Auditor R |

#### 3.4.3 Action and field restrictions

- **Delete:** hard delete is never a routine permission. Business records use archive/cancel/reverse. Hard delete is limited to unreferenced drafts with elevated permission and audit reason.
- **Students/guardians:** teachers see instructional/contact fields for assigned students, not financial aid, protected health notes, legal restrictions, or unrelated family records. Parents see only linked children after verified relationship.
- **Health/safeguarding:** nurse/counselor/safeguarding roles receive separately encrypted/restricted field grants. Admin status does not automatically reveal narrative clinical or safeguarding notes.
- **HR/payroll:** managers see employment data but salary, bank, tax and identity documents require payroll-sensitive grants. No user approves their own payroll adjustment or claim.
- **Finance:** teachers/librarians may see “clear/outstanding” or payable fine status but not household financial history. Accountants see payer/contact data necessary to transact, not academic or health records.
- **Assessments:** teachers edit only assigned subject/cohort marks before lock. Published results are immutable except controlled reopen/moderation. Students/parents see only published results.
- **Admissions:** panelists see assigned applications and assessment fields; finance sees application fees and payment state; sensitive diversity/health data is isolated.
- **Communications:** audience previews show counts and authorized recipient attributes; exports of contact data require separate permission. Consent and do-not-contact rules cannot be overridden by a campaign creator.
- **Exports:** every export declares purpose, scope, columns, row count and retention; sensitive exports require step-up authentication and are audit logged.
- **Platform operators:** no implicit tenant-table access. Support access is time-bound, reasoned, approved when required, tenant-visible, and logged.

#### 3.4.4 Platform operations matrix

| Platform module | Platform Owner | Support Operator | Billing Operator | Security/Auditor | School tenant admin |
|---|---:|---:|---:|---:|---:|
| Overview | F | R operational | R finance | R audit | — |
| Schools | F | R + limited support actions | R subscription | R | Own school only via tenant plane |
| Plans & Entitlements | F | R | M | R | View own entitlement |
| Billing | F | R status | X | R | View/pay own subscription |
| Service Operations | F | X | R | R | Own service status |
| AI Operations | F | R diagnostics | R usage/cost | R policy/audit | Own usage/policy |
| Operators & Access | F | S | S | R | — |
| Audit & Compliance | F | R scoped | R billing | X | Own-tenant audit subset |
| Infrastructure | F | R diagnostics | — | R | Status only |

### 3.5 Inter-Module Relationship Map

#### 3.5.1 Canonical ownership

| Shared concept | Owning module | Consumers |
|---|---|---|
| Tenant, campus, academic context | Administration / Academic Structure | Every module |
| Person identity and membership | Administration | Students, HR, portals, communications, audit |
| Student and guardian relationship | Students | Admissions conversion, attendance, fees, results, library, transport, hostel, activities |
| Employee/staff | HR | Academics, attendance, payroll, transport crew, labs, activities, users |
| Enrollment/cohort | Students + Academic Structure | Timetable, attendance, learning, exams, fees, reports |
| Subject/curriculum offering | Curriculum | Timetable, learning, assessment, teacher allocation |
| Invoice/payment | Fees & Billing | Admissions, transport, hostel, library fines, activities, accounting, parent portal |
| Vendor/item/asset | Inventory & Assets | Labs, library acquisitions, transport maintenance, facilities, accounting |
| Message/notification | Communications | All modules emit events; Communications owns delivery |
| Document | Documents | Students, admissions, HR, assessment, finance, compliance |
| Audit event | Administration | Every mutation and sensitive read/export |
| Metric/report | Analytics | Read models from every domain; never owns operational truth |
| AI generation | AI Studio | Assessment, learning, communications, timetable and reports with domain approval |

#### 3.5.2 Workflow dependencies

```text
Enquiry
  → Application
  → Document/eligibility review
  → Assessment/interview
  → Offer
  → Admission fee invoice/payment
  → Student + guardian creation
  → Enrollment in academic year/class/section
  → Optional fee plan, transport, hostel, library and portal provisioning

Academic setup
  Academic year/term → class/section → curriculum offering
  → teacher allocation → timetable publication
  → attendance sessions + assignments + assessment plan
  → marks/moderation → result/report card publication
  → progression/promotion → next enrollment

Fee lifecycle
  Fee plan → student charge → invoice → payment allocation/receipt
  → reconciliation → general-ledger posting → reminders/portal state

Employee lifecycle
  Vacancy → candidate → offer/contract → employee + user
  → department/teaching allocation → attendance/leave
  → payroll run/approval/payment → appraisal/training → separation

Procure-to-asset
  Requisition → approval → purchase order → receipt/stock
  → invoice/accounting → issue to lab/library/transport/facility
  → asset maintenance/depreciation → disposal
```

#### 3.5.3 Integration rules

1. Cross-module writes occur through application commands/events, never direct foreign-table updates from UI code.
2. Every module keeps explicit `tenant_id` and relevant scope keys; all tenant access uses `withTenant` plus explicit filters.
3. Shared lookup values (academic year, campus, department, class, section) use stable IDs; labels are denormalized only in immutable snapshots or report read models.
4. Transactional outbox events drive notifications, analytics projections, search indexing, and external integrations.
5. Finance receives subledger postings from fees, payroll, transport, hostel, library and procurement. Those modules retain operational detail; Accounting owns ledger truth.
6. Analytics and AI consume authorized projections. They cannot bypass domain field policies or become alternate systems of record.
7. Files use a central document service with ownership, classification, malware scanning, retention and signed access; modules reference document IDs.

## 4. Design System Specification

### 4.1 Component Inventory

Existing primitives should be consolidated, documented in Storybook or an equivalent catalog, and wrapped only when EPADM behavior differs from the base primitive.

| Family | Standard components | Required contract |
|---|---|---|
| App shell | `AppShell`, role sidebar, topbar, context switcher, command search, notification center, profile menu | One tenant shell implementation; role/permission projection; responsive collapse; skip link; no layout shift |
| Navigation | Sidebar group/module/item, breadcrumbs, object tabs, local section nav, mobile bottom nav, favorites/recent | Route-registry driven; keyboard complete; active state and breadcrumbs share metadata |
| Page framing | `PageHeader`, `PageToolbar`, content container, split panel, sticky action footer | Standard title, description, context, primary/secondary actions, help and status placement |
| Data display | Data table, cards, metric tiles, description list, status badge, avatar, timeline, activity feed, tree, calendar, schedule grid, chart | Semantic token colors; density modes; permission-aware actions; printable/exportable variants |
| Tables | Column definitions, sort, filter, pagination, selection, bulk actions, saved views, column chooser, row menu, inline status | Server pagination by default; URL-owned query state; row click never hides explicit actions |
| Forms | Text/number/email/tel, textarea, select/combobox, checkbox/radio/switch, date/time/range, currency, OTP, address, person/object picker, rich text, file upload | React Hook Form + Zod; accessible description/error; locale/timezone-aware; dirty state and autosave policy |
| Complex input | Academic selector, student/guardian picker, class/section picker, recurrence, grade scale editor, fee allocator, timetable slot editor, permission matrix | Shared domain components with typed IDs and server authorization |
| Feedback | Sonner toast, inline alert, field error, form summary, progress, skeleton, empty state, error state, offline/stale indicator | Consistent severity, recovery action and announcements for assistive tech |
| Overlays | Confirmation alert, form dialog, detail drawer, command palette, popover, sheet | Focus trap/return, Escape behavior, unsaved-change protection, destructive reason input where required |
| Actions | Primary/secondary/ghost/danger button, icon button, split button, bulk bar, export menu, overflow menu | One button API only; loading/disabled semantics; no clickable placeholder action |
| Files/documents | Uploader, attachment list, preview, version history, signature status, download control | Type/size validation, scan status, classification, retention and authorization |
| Reports | Report parameter panel, viewer, drill-down, chart/table switcher, schedule dialog, export job status | Authorized columns; async large exports; reproducibility metadata |
| AI | Prompt input, source selector, generation progress, citations, diff/review, approve/reject, safety notice, usage meter | Human review, model/prompt version, sources, audit and cost visible |

#### 4.1.1 Token and API consolidation

- Retain semantic CSS variables from `src/styles/globals.css`; add typography, spacing, elevation, motion, focus, data-density and z-index tokens.
- Eliminate literal module hex palettes unless a visualization requires a documented categorical scale.
- Keep one `Button` primitive with supported product variants `primary`, `secondary`, `ghost`, and `danger`; map visual outline/link needs through documented secondary/ghost treatments rather than maintaining two incompatible button APIs.
- Use `success`, `warning`, `danger`, `info`, and `neutral` for state. Color is never the only state indicator.
- Define compact/comfortable table density and minimum 44px touch targets for mobile portal controls.
- Use tabular numbers for identifiers/financial metrics only; use the main UI font for names and prose.

### 4.2 Layout Patterns

#### 4.2.1 List view

```text
Breadcrumbs
Page title + count                         Primary action
Saved view | Search | Filters | Sort       Export | Columns
Applied filter chips
Selectable data table / card list
Bulk action bar (when selected)
Pagination + result count
```

Rules: URL owns search/filter/sort/page state; initial data is server-rendered; tables provide loading, empty, no-results, error and permission-denied variants. Bulk actions disclose selection scope and require confirmation for irreversible effects. Export uses the same current filter unless the user explicitly chooses all authorized records.

#### 4.2.2 Detail view

```text
Breadcrumbs
Object identity + status + key facts       Contextual actions
Alert/validation banner when needed
Tabs: Overview | domain facets | Activity
Summary and related-record cards
Audit/activity timeline
```

The object ID is canonical. Tabs represent facets of that object and may be nested routes. Actions depend on state transitions and permission; the UI never shows an enabled action that the server will categorically reject. Archive/cancel replaces delete for referenced business records.

#### 4.2.3 Form view

- Single-page form for up to roughly 12 related fields; sectioned or stepper form for longer workflows.
- Persistent summary of validation errors after a failed submit, with links to fields.
- Create routes may use full pages; quick-add dialogs are allowed only when no downstream workflow is hidden.
- Save & continue, save draft, submit for approval, and publish are distinct state transitions.
- Server errors preserve input. Conflict responses show what changed and allow reload/reapply.
- Sensitive changes request a reason and may require step-up authentication.

#### 4.2.4 Dashboard and work-area view

- Role-specific priority queue first, then KPIs, exceptions, trends, and recent activity.
- Every metric names its time window, scope, data freshness and drill-down destination.
- Cards are not decorative shortcuts; each links to a filtered canonical list/report.
- Admin dashboards may be configurable; teacher/student/parent dashboards remain focused and bounded.

#### 4.2.5 Settings view

Use a local left navigation within the module: General, Policies, Numbering/Templates, Integrations, and Audit where applicable. Settings are form pages with explicit scope (school/campus/academic year), last-updated metadata, validation, and rollback/audit. Operational lists do not live inside Settings.

#### 4.2.6 Specialized layouts

- **Pipeline:** admissions columns are filters over application state; cards open application details; drag transitions require permission and validation.
- **Schedule:** timetable grid supports keyboard navigation, conflicts, version comparison, draft/publish state and print.
- **Ledger:** immutable ordered entries, running balance, source links, reversal rather than edit/delete.
- **Marks/gradebook:** frozen identity columns, autosave status, validation, lock/moderation state, keyboard entry and change audit.
- **Portal:** mobile-first summary, child/context switcher, no administrative sidebar, direct self-service tasks.

### 4.3 Interaction Patterns

#### Navigation and context

- Active sidebar item, page title and breadcrumb are generated from one route definition.
- Context changes (school/campus/year/child) are explicit and persist in session or URL as appropriate. A context change invalidates incompatible filters.
- Unsaved changes block navigation with an accessible confirmation.
- Command search opens with `Ctrl/Cmd+K`, lists only authorized routes/objects, and separates navigation from record results.

#### Forms and mutations

- Disable only the submitting action, show progress text, prevent duplicate submission, and return focus to the error summary on failure.
- Field validation occurs on blur and submit; server validation is authoritative. Never rely on toast alone for a form failure.
- Success toast lasts four seconds by default and includes View/Undo only when those actions are safe. Errors persist until dismissed or resolved.
- Optimistic updates are limited to reversible, low-risk actions. Finance, attendance corrections, marks publication, permissions and deletes wait for server confirmation.
- Destructive confirmation names the object and consequence; high-impact actions require typed confirmation or a reason.

#### Tables and long operations

- Skeleton rows preserve table geometry on first load; subsequent filter transitions retain headers and show an inline busy state.
- Empty state explains what the list represents and offers a permitted next action. No-results state offers “clear filters.” Error state offers retry and a support correlation ID.
- Large imports/exports and AI generations are background jobs with progress, notification on completion, downloadable error files, and retry semantics.
- Pagination is server-side. Cursor pagination is preferred for event/ledger feeds; page-number pagination is acceptable for stable registries.

#### Dialogs, drawers and notifications

- Use a dialog for short create/edit/confirm tasks, a drawer for read-heavy contextual details, and a page for multi-step or linkable work.
- Opening moves focus to the heading/first field; closing returns it to the trigger. Escape closes unless a destructive operation is in flight.
- Toasts are top-right on desktop and bottom-safe-area on mobile; severities are success, info, warning and error. Screen-reader announcements use appropriate live regions.
- The notification center is persistent, filterable, marks read state, and links to canonical records. A red dot without a destination is prohibited.

#### Accessibility and localization

- Meet WCAG 2.2 AA; all controls and grids are keyboard operable; focus rings use semantic tokens.
- Dates, currency, numbers, academic labels and names are locale-aware. Store timestamps in UTC and render in tenant timezone.
- Do not encode gender, rank, attendance, grade, or financial status by color alone.
- Reports and PDFs require tagged/structured output where supported and accessible HTML alternatives.

## 5. Migration Map (Current → Target)

Migration actions: **Keep** retains the visible URL and clarifies ownership; **Move** changes the canonical URL; **Merge** combines duplicates; **Split** replaces a tab-heavy page with route-backed features; **Deprecate** keeps a temporary redirect before removal; **Remove** deletes non-product/dead behavior; **Rebuild** preserves product intent but not the current implementation.

### 5.1 Public and platform page migration

| Current route | Current name | Action | Target route | Target module | Notes |
|---|---|---|---|---|---|
| `/` | Landing / tenant entry | Keep | `/` | Public / Workspace | Signed-in behavior remains role-aware through proxy |
| `/about` | About | Keep | `/about` | Public | No product migration |
| `/contact` | Contact | Keep | `/contact` | Public | Replace console/TODO lead handling with CRM adapter later |
| `/demo` | Request Demo | Keep | `/demo` | Public | Keep canonical lead CTA |
| `/platform` | Platform | Keep | `/platform` | Public | Keep marketing-only |
| `/security` | Compliance | Rename | `/trust` with `/security` redirect | Public Trust Center | Separate security, privacy, availability, compliance pages when content grows |
| `/legal/privacy` | Privacy Policy | Keep | same | Legal | Add effective/version metadata |
| `/legal/terms` | Terms | Keep | same | Legal | Add effective/version metadata |
| `/legal/cookies` | Cookies | Keep | same | Legal | Link from footer |
| `/legal/accessibility` | Accessibility | Keep + link | same | Legal | Add to footer |
| `/login` | Login alias | Merge | `/#login` initially; future `/auth/login` | Identity | Use one authentication entry, retain redirect |
| `/register` | Register alias | Merge | `/get-started` or invitation flow | Identity / Sales | Tenant self-registration policy must be decided |
| marketing `/onboarding` | Onboarding client | Remove/rename | `/get-started` if retained | Public acquisition | Currently shadowed by proxy and conflicts with tenant setup |
| `/admin/login` | Platform Login | Keep | same | Platform Identity | Ops hostname only |
| `/admin` on ops host | Overview | Keep | `/admin` | Platform Overview | Add role-specific operational queues |
| `/admin/tenants` | School Tenants | Rename | `/admin/schools` | Platform Schools | Keep `/admin/tenants` redirect for API/internal terminology transition |
| `/admin/tenants/[tenantId]` | Tenant Control Panel | Move | `/admin/schools/[tenantId]` | Platform Schools | Preserve status, services, performance and FinOps as object tabs |
| `/admin/ai` | AI | Rebuild | `/admin/ai` | Platform AI Operations | Current import is missing; implement only with real gateway/usage data |
| `/cms`, `/cms/*` | CMS alias | Deprecate | `/admin`, `/admin/*` | Platform | Measure use, redirect, remove rewrite |

### 5.2 Tenant page migration

| Current route | Current name | Action | Target route | Target module | Notes |
|---|---|---|---|---|---|
| `/` | Tenant root | Keep | role-aware `/dashboard` or portal root | Workspace | Fix teacher → `/teacher`, student → `/student`, parent → `/parent`; define all roles |
| `/dashboard` | Dashboard | Keep + specialize | `/dashboard` | Home | One URL, role-dependent widgets and queues |
| `/admin-dashboard` | Admin Dashboard | Deprecate | `/dashboard` | Home | Temporary redirect, remove re-export |
| `/onboarding` | Tenant Onboarding | Rename | `/setup` | Administration | First-login setup, distinct from public onboarding |
| `/setup-pending` | Setup Pending | Keep | `/setup/pending` | Administration | Non-admin gate |
| `/academics` | Academics Setup | Split | `/academics` | Academic Structure | Landing only; migrate tabs per 5.3 |
| `/attendance` | Attendance | Split/rebuild | `/attendance` | Attendance | Preserve intent; replace sample tabs with real routes/services |
| `/timetable` | Timetable | Rename/split | `/timetables` | Timetables | Preserve grid; add canonical class/teacher/room/version routes |
| `/exams` | Exams | Rename/split | `/assessments` | Assessments & Results | Saved AI exams become assessment/exam records; mock flows become backlog |
| `/students` | Students | Split | `/students` | Students | Live list/create migrate first; detail/bulk/report features get routes |
| `/admissions` | Admissions Pipeline | Split | `/admissions` | Admissions | Kanban becomes pipeline view over applications; add detail/state transitions |
| `/staff` | Staff | Move/split | `/hr/staff` | Human Resources | Preserve live CRUD; departments to `/hr/departments` |
| `/payroll` | Payroll | Split | `/payroll` | Payroll | Preserve live read; prototype operations require domain model |
| `/fees` | Fees | Move/split | `/finance/fees` | Fees & Billing | Redirect `/fees`; retain real aggregates and records |
| `/finance` | Fees alias | Repurpose | `/finance` | Finance | Becomes finance landing when Accounting exists; until then redirect to `/finance/fees` |
| `/vehicles` | Vehicles | Rename/split | `/transport` | Transport | Vehicle list to `/transport/vehicles`; other pseudo-tabs become routes/backlog |
| `/communications` | Communications | Split | `/communications` | Communications | Campaign list/create retained; build real channel/delivery model |
| `/library` | Library | Split | `/library` | Library | Book rows migrate to titles/copies model; circulation is new persisted work |
| `/labs` | Labs | Rebuild/rename | `/laboratories` | Laboratories | Current route broken; preserve `lab_bookings` data and static feature intent |
| `/ai-studio` | AI Studio | Split/rebuild | `/ai-studio` | AI Studio | Generator list landing; generations/prompts/knowledge/governance get routes |
| `/intelligence` | Legacy Insights | Merge | `/analytics` | Analytics & Reports | Remove “Legacy”; signals become governed exception dashboards |
| `/mobile` | App Management | Split/move | `/digital-experience` | Portals & Mobile | Homework/exam/fee/announcement ownership stays in source domains |
| `/admin` on school host | App Admin (RBAC) | Rename/split | `/administration` | School Administration | Users, roles, audit and settings become canonical routes |
| `/users` | Users alias | Deprecate | `/administration/users` | Administration | Redirect then remove duplicate page/proxy rule |
| `/settings` | Settings | Merge/split | `/administration/school` and module settings | Administration | Move domain-specific settings to domains |
| `/teacher/home` | Teacher Home | Move | `/teacher` | Teacher Workspace | Keep redirect; split attendance/assignments/exams into teacher routes |
| `/student/home` | Student Home | Move | `/student` | Student Portal | Replace mock grades/news before claiming data is live |
| Internal `/root/[tenant]/[...module]` | Catch-all workspace | Remove | Explicit routes | All | Delete after all concrete routes use canonical components |

### 5.3 Current pseudo-feature migration

This table accounts for the existing `?tab=`/inner-rail concepts. A “new build” target means the label is present today but has no complete persisted workflow to migrate.

| Current page / pseudo-features | Action | Canonical targets |
|---|---|---|
| `/academics`: overview, classes & sections, subjects, class×subject, streams/electives, houses, calendar, roster, teaching load, coverage, grading, session/rollover, naming, board | Split; merge overlapping curriculum/exam settings | `/academics`, `/academics/classes`, `/academics/sections`, `/curriculum/subjects`, `/curriculum/offerings`, `/academics/houses`, `/academics/years`, `/academics/sections/[id]`, `/curriculum/teacher-allocation`, `/curriculum/coverage`, `/assessments/settings`, `/academics/progression`, `/academics/settings`, `/curriculum/frameworks` |
| `/attendance`: feed, monthly feed, absentee SMS, leave, monthly class, annual %, perfect attendance, holidays | Split; communications owns delivery | `/attendance/students/daily`, `/attendance/students/periods`, `/communications/campaigns/new?source=attendance`, `/attendance/leave`, `/attendance/reports/*`, `/attendance/settings` |
| `/students`: dashboard/list/add/import/bulk edit/attachments/promote/rolls/delete/search/notes; register/strength/joined/left/duplicates/detained/certificates/birthdays/download/siblings/general register/ID cards/documents/parents; class/house masters | Split and remove delete-as-module | `/students`, `/students/new`, `/students/imports`, `/students/progression`, `/students/transfers`, `/students/reports/*`, `/students/[id]/documents`, `/students/guardians`, `/documents/certificates`, `/documents/templates`; class/house masters move to `/academics` |
| `/staff`: dashboard, staffs, departments, notes, ID cards | Split | `/hr`, `/hr/staff`, `/hr/departments`, `/hr/staff/[id]`, `/documents/templates` |
| `/admissions`: Enquiry, Applied, Assessed, Offered, Enrolled columns | Keep state taxonomy but route records | `/admissions/applications?stage=...`, `/admissions/applications/[id]`; conversion at `/admissions/enrollment` |
| `/exams`: list/dashboard/feed marks/marks progress/exam attendance/remarks/hall ticket; class/student marksheet, toppers, tabulation, report card, missing marks; session/structure/attendance rules/grades/publish/hold/max-min/hall template | Split; consolidate duplicate settings | `/assessments/exams`, `/assessments`, `/assessments/marks-entry`, `/assessments/moderation`, `/assessments/report-cards`, `/assessments/results`, `/assessments/reports/*`, `/assessments/settings`; hall templates in `/documents/templates` |
| `/fees`: dashboard, collect/view/search/cancel receipts, account, miscellaneous fee, reminder; fee card/collection/dues/register/rebate/status/rates/diagnosis; fee heads/fines/structures/due dates/rates | Split; cancel becomes reversal | `/finance/fees`, `/finance/fees/collections`, `/finance/fees/receipts/[id]`, `/finance/fees/invoices`, `/finance/fees/concessions`, `/finance/fees/reports/*`, `/finance/fees/settings`; messages via Communications |
| `/payroll`: dashboard/run/slips/bonus-deductions/advances-loans/reimbursements/approvals; register/TDS/PF-ESI-PT/bank file; structures/components/grades | Split | `/payroll`, `/payroll/runs`, `/payroll/payslips`, `/payroll/adjustments`, `/payroll/loans`, `/payroll/claims`, `/approvals`, `/payroll/reports`, `/payroll/statutory`, `/payroll/bank-files`, `/payroll/settings` |
| `/vehicles`: dashboard/vehicles/routes/drivers/subscription/bulk subscription/maintenance; monthly/annual subscriptions, attendance, revenue, dues, invalid subscriptions, rates; route/rate/pickup/vehicle masters | Rename and split | `/transport`, `/transport/vehicles`, `/transport/routes`, `/transport/crew`, `/transport/allocations`, `/transport/maintenance`, `/transport/attendance`, `/transport/reports`, `/transport/settings`; transport charges reference Fees |
| `/communications`: dashboard/compose/notices/campaigns/templates; SMS/WhatsApp/email/in-app; delivery log/usage | Split around one channel-neutral model | `/communications`, `/communications/campaigns`, `/communications/announcements`, `/communications/templates`, `/communications/delivery`, `/communications/settings`; usage also `/analytics/reports` |
| `/library`: dashboard/issue/return/reservations/fines/lost; books/media/members/acquisitions; overdue/circulation/popular/dormant; rules/fines/DDC | Split | `/library`, `/library/circulation`, `/library/reservations`, `/library/fines`, `/library/catalog`, `/library/members`, `/library/acquisitions`, `/library/stocktake`, `/library/reports`, `/library/settings` |
| `/labs`: dashboard/booking/sessions/incidents/safety; equipment/consumables/chemicals/vendors/PO; lab/experiment masters | Rebuild and split | `/laboratories`, `/laboratories/bookings`, `/laboratories/incidents`, `/laboratories/safety`, `/laboratories/equipment`, `/laboratories/stock`, `/inventory/vendors`, `/inventory/purchase-orders`, `/laboratories/labs`, `/laboratories/experiments` |
| `/ai-studio`: notice, syllabus, exam, question bank, worksheet/homework, comments, lesson plan, circular/newsletter, certificate, timetable suggestion, interview questions, role copilots, monitors, knowledge, prompts, governance | Organize by capability; domain retains final records | `/ai-studio/generators`, `/ai-studio/copilots`, `/ai-studio/knowledge`, `/ai-studio/prompts`, `/ai-studio/reviews`, `/ai-studio/governance`; approved output is saved into Communications/Curriculum/Assessments/Learning/Documents/Timetables/Admissions |
| `/mobile`: adoption/engagement/users/devices; homework/exam/fees/announcements; pushes/flags/branding/version/support | Split channel administration from source content | `/digital-experience/*`; homework → `/learning`, exams → `/assessments`, fees → `/finance/fees`, announcements → `/communications` |
| `/admin`: users/add/reset/switch/master; roles/permissions/assign/scope/master; logins/failures/audit | Rename and split; prohibit unaudited impersonation | `/administration/users`, `/administration/roles`, `/administration/audit`; reset/invite are user actions; support access is governed workflow |
| `/settings`: school profile, roles, academic year, integrations, Copilot, compliance | Split by owner | `/administration/school`, `/administration/roles`, `/academics/years`, `/administration/integrations`, `/ai-studio/governance`, `/administration/privacy` |

### 5.4 API migration

Existing endpoints remain behind compatibility adapters only until all first-party callers move. New APIs should be resource- or command-oriented under `/api/v1`, validated with Zod, permission-checked, tenant-scoped through `withTenant`, and documented.

| Current API | Action | Target API / service |
|---|---|---|
| `/api/auth/login`, `/logout`, `/register` | Keep/version; remove GET logout | `/api/v1/auth/session`, `/api/v1/registrations` |
| `/api/identity/tenant` | Keep internal | `/api/v1/identity/tenant-resolution` |
| `/api/onboarding/*` | Rename with setup | `/api/v1/setup`, `/api/v1/setup/complete` |
| `/api/admin/users` | Move | `/api/v1/administration/memberships` |
| `/api/admin/students` | Expand | `/api/v1/students`, `/api/v1/students/[id]` |
| `/api/admin/staff` | Move | `/api/v1/hr/staff`, `/api/v1/hr/staff/[id]` |
| `/api/admin/staff/departments` and `/api/departments/[id]` | Merge | `/api/v1/hr/departments`, `/api/v1/hr/departments/[id]` |
| `/api/admin/academics/academic-years` | Move | `/api/v1/academics/years` |
| `/api/admin/academics/classes` | Move/complete CRUD | `/api/v1/academics/classes`, `/api/v1/academics/classes/[id]` |
| `/api/admin/academics/sections` | Move/complete CRUD | `/api/v1/academics/sections`, `/api/v1/academics/sections/[id]` |
| `/api/admin/academics/enrollments` | Change owner | `/api/v1/students/enrollments` |
| `/api/admin/subjects` | Move | `/api/v1/curriculum/subjects` |
| `/api/admin/admissions` | Expand | `/api/v1/admissions/applications`, record commands for stage transitions |
| `/api/admin/vehicles` | Move | `/api/v1/transport/vehicles` |
| `/api/admin/communications` | Move | `/api/v1/communications/campaigns` |
| `/api/admin/library` | Normalize | `/api/v1/library/titles` and `/copies` |
| Both exam-generation APIs | Merge | `/api/v1/ai/generations` with `purpose=assessment`; async when needed |
| `/api/admin/cron/invoices` | Remove from user API | Internal scheduled billing command with machine identity, idempotency and queue |
| `/api/webhooks/biometrics` | Keep/version | `/api/v1/integrations/biometrics/events`; registered device credentials and replay protection |
| `/api/webhooks/gps` | Keep/version | `/api/v1/integrations/transport/telemetry`; device identity and idempotency |
| `/api/platform/*` | Rename tenant UI wording, preserve domain | `/api/v1/platform/schools/*`, entitlements, billing and ops resources |
| `/api/contact`, `/api/demo-request` | Keep public boundary | Server-side CRM/notification adapter; remove public GET listing behavior unless operator-authorized |
| `/api/scratch` | Remove | No replacement; use authenticated health/diagnostic endpoints |

### 5.5 Data migration principles

1. Add new canonical tables and dual-write/read adapters before moving URLs; never reinterpret JSON/mock rows as migrated records.
2. Preserve existing UUIDs for students, staff, classes, sections, enrollments, invoices, payroll records, exams, vehicles, campaigns, books and bookings.
3. Backfill `academic_year_id`, campus and status history where deterministically possible; record “unknown” rather than inventing values.
4. Convert `library_books` into title plus copy records only after defining whether each row represents a title or an accession. This is an open question.
5. Convert `exams.content` into a versioned source artifact; do not infer marks/results from generated exam JSON.
6. Treat current mock module data as fixtures to delete, not business data to seed into production.
7. All new tenant tables ship in one migration unit with indexes, `ENABLE ROW LEVEL SECURITY`, tenant policy, and `FORCE ROW LEVEL SECURITY`.
8. Route redirects have telemetry and a removal date. API compatibility adapters emit deprecation headers and are removed only after caller inventory reaches zero.

## 6. Phased Implementation Roadmap

Each phase closes with production-safe compatibility redirects/adapters, authorization tests, tenant-isolation tests, accessibility checks, and migration rollback notes. A route is not “shipped” merely because a static workspace renders.

### Phase 1 (Current) — Analysis & Blueprint [COMPLETE]

**Scope:** evidence-based route/navigation/feature/schema audit; competitive research; target taxonomy, routes, permissions, design system, migration map and roadmap.

**Acceptance criteria:**

- Every page and API route present on 2026-07-28 is represented in Sections 1 and 5.
- Every enterprise domain named in the brief has a target owner.
- Navigation does not exceed three levels.
- Existing/mock/broken states are explicitly distinguished.

**Risk flags:** repository changes after this date require a blueprint delta review.

### Phase 2 — Foundation, Security & Unified Shell

**Scope:**

- Fix current typecheck failures and establish green lint/typecheck/test/build gates.
- Preserve `src/proxy.ts` behavior while adding route-level tests for school/ops hosts, onboarding gates, aliases and roles.
- Enforce `withTenant` for every tenant query; verify non-superuser app role, RLS and `FORCE ROW LEVEL SECURITY` with cross-tenant probes.
- Introduce typed route/capability registry driving sidebar, command palette and breadcrumbs.
- Consolidate button, shell, page header, table, form, dialog, toast, empty/loading/error patterns.
- Add role-aware `/dashboard`, `/teacher`, `/student`, `/parent`, and `/me` shell entry routes; parent may initially show a safe empty state until relationships exist.
- Add observability basics: structured request/audit IDs, error boundaries, health/readiness, CI.

**Dependencies:** Phase 1 only.

**Acceptance criteria:**

- `npm run lint`, `npm run typecheck`, unit/integration suite, and production build pass.
- Cross-tenant reads/writes fail at the database boundary for every tenant table.
- Every current role lands on a valid, authorized home without redirect loops.
- Sidebar and command palette show only entitled, permitted modules; APIs independently reject unauthorized access.
- Current live routes still function; redirects cover existing bookmarks.

**Risk flags:** proxy exact-path handling for tenant `/admin` versus ops `/admin/*`; RLS role configuration; broad UI regression from button/shell consolidation.

### Phase 3 — Administration, Identity & Core Records

**Scope:**

- Canonical `/administration/school`, users, roles, audit, integrations and setup routes.
- Custom role/grant model with scope; invitations, activation/deactivation, password reset workflow, audited support access.
- Student 360° model: guardians/relationships, contacts, documents, health summary access boundary, status history.
- HR staff detail, departments, positions, contracts/documents baseline.
- Shared imports framework with validation preview, idempotency, error files and audit.
- Migrate current live user/student/staff CRUD; remove corresponding mock duplicates only after parity.

**Dependencies:** Phase 2 capability registry, UI patterns, RLS and audit foundation.

**Acceptance criteria:**

- Admin can create/edit/archive memberships, students, guardians and staff through canonical detail pages.
- Parent-child relationships are verified and tested against cross-family access.
- Role changes take effect in navigation and server enforcement; custom grants never exceed grantor authority.
- Sensitive student/HR fields pass field-level authorization tests.
- Existing `/students`, `/staff`, `/admin`, `/users` links redirect without data loss.

**Risk flags:** identity deduplication, guardian account linking, legacy role semantics, hard-delete replacement, privacy classification.

### Phase 4 — Academic Foundation & Scheduling

**Scope:**

- Academic years/terms, campuses, programs/classes/sections, rooms, houses and progression policies.
- Curriculum subjects/frameworks, offerings, class-subject mapping, teacher allocation and coverage.
- Timetable period/constraint/version model, class/teacher/room views, conflict detection and publish workflow.
- Migrate current academic year/class/section/enrollment/subject/timetable records and local-only workspace concepts where real data exists.
- Academic context selector sourced from configuration.

**Dependencies:** Phase 3 students/staff and scoped permissions.

**Acceptance criteria:**

- A school can configure an academic year, cohorts, curriculum offerings and teacher allocations with no local-only state.
- A draft timetable detects teacher/room/class conflicts and publishes an immutable version.
- Teacher/student/parent schedules are projections of the same publication.
- Rollover produces previewed next-year enrollments and is idempotent.

**Risk flags:** varied school terminology/boards, historical academic versions, timetable solver complexity. Begin with manual conflict-aware scheduling; optimization is later.

### Phase 5 — Attendance, Teaching & Learning

**Scope:**

- Student daily/period attendance, staff attendance, leave, correction/approval and holiday policy.
- Registered biometric devices, idempotent event ingestion and reconciliation UI.
- Assignments, attachments, submissions, rubrics, grading, lesson plans and learning resources.
- Teacher workspace routes for assigned classes, rosters, attendance, assignments and gradebook.
- Student/parent attendance and learning views; communication event hooks for absence/assignment alerts.

**Dependencies:** Phase 4 cohorts, timetable and offerings; Phase 3 relationships/documents; Phase 2 job/event baseline.

**Acceptance criteria:**

- Teachers mark only assigned cohorts; corrections are reasoned and audited.
- Biometric retries do not duplicate attendance and unmatched events enter a resolvable queue.
- Students submit assignments; teachers grade them; parents see only published/allowed outcomes.
- All current teacher-home live behavior has canonical route parity before redirecting it.

**Risk flags:** device clock/identity quality, offline capture, attendance freeze rules, attachment security, teacher allocation edge cases.

### Phase 6 — Assessments, Results & Documents

**Scope:**

- Assessment plans/components, exam scheduling and sittings, eligibility/attendance, marks entry, moderation, grade scales and result calculation.
- Report cards, marksheets, hall tickets, certificates and transcripts through the Documents service.
- Publish/withhold/reopen workflow with clear finance/discipline policy hooks rather than hidden coupling.
- Migrate existing `exams` and AI-generated content as source artifacts; remove mock marks/results.

**Dependencies:** Phase 4 curriculum/timetable; Phase 5 gradebook/attendance; Phase 3 documents and roles.

**Acceptance criteria:**

- Exam controller configures, schedules, locks, moderates and publishes a complete assessment cycle.
- Teachers edit only assigned marks before lock; every mark change is attributable.
- Student/parent sees only published results; generated PDFs match on-screen values.
- No hard-coded GPA, grade or report-card content remains in portals.

**Risk flags:** grading-board variability, rounding, historical result immutability, bulk marks performance, legally sensitive withholding rules.

### Phase 7 — Fees, Payments & Accounting Foundation

**Scope:**

- Fee heads/plans/assignments, invoice lifecycle, collection, payment allocation, receipts, concessions, refunds, reminders and reconciliation.
- Payment gateway abstraction, idempotent webhooks and parent self-service payment.
- Chart of accounts, journals, fee subledger posting, expenses, budgets, banking/reconciliation and essential financial statements.
- Replace the exposed invoice cron with an authenticated scheduled job and idempotency keys.
- Migrate current fee structures/invoices/transactions and live aggregates.

**Dependencies:** Phase 3 students/guardians; Phase 4 enrollments; Phase 2 jobs/audit/security.

**Acceptance criteria:**

- Invoice-to-payment-to-receipt-to-ledger reconciles exactly and reversals preserve history.
- Parent sees and pays only linked-child charges; duplicate gateway events have no duplicate financial effect.
- Accountant can close a period and produce trial balance, receivables and collection reports.
- Existing `/fees` data and links retain parity through `/finance/fees`.

**Risk flags:** currency/tax rules, accounting cutover, gateway disputes, reconciliation, segregation of duties, immutable audit requirements.

### Phase 8 — Human Resources & Payroll

**Scope:**

- Recruitment, offers/contracts, qualifications, staff attendance/leave, performance/training and separation.
- Salary structures/components, payroll inputs, calculation, approvals, payslips, deductions, loans/claims, bank and statutory exports.
- Employee self-service `/me` routes.
- Migrate current staff payroll records without inventing missing calculation detail.

**Dependencies:** Phase 3 HR core; Phase 5 staff attendance; Phase 7 accounting/banking patterns.

**Acceptance criteria:**

- Employee lifecycle and payroll cycle run end-to-end with maker/checker approval.
- No approver can approve their own adjustment/claim; salary/bank fields are separately protected.
- Payslip totals reconcile to payroll journal and bank file.
- Existing `/payroll` records remain readable after migration.

**Risk flags:** jurisdiction-specific payroll, retroactive changes, data sensitivity, historical records lacking component detail.

### Phase 9 — Campus Operations I: Transport, Library & Laboratories

**Scope:**

- Transport routes/stops, fleet/crew, allocations, attendance, telemetry/live map, maintenance/incidents and fee hooks.
- Library title/copy model, barcode circulation, reservations, fines, acquisitions and stocktake.
- Laboratories, experiments/bookings, equipment/stock/chemicals, safety checklists and incidents.
- Migrate vehicles/telemetry, library books and lab bookings with explicit ambiguity reports.

**Dependencies:** Phase 3 people records; Phase 4 timetable/rooms; Phase 7 finance hooks; Phase 2 integrations/jobs.

**Acceptance criteria:**

- Parent/student sees only their current transport allocation and authorized live status.
- Library enforces member/loan/fine policies transactionally and supports stock verification.
- Lab booking detects room/timetable conflicts and tracks safety/chemical controls.
- Broken `/labs` is replaced; current records are reconciled and no prototype rows appear as live data.

**Risk flags:** location privacy/retention, barcode/device integration, `library_books` semantic ambiguity, chemical compliance.

### Phase 10 — Campus Operations II: Hostel, Inventory, Facilities & Activities

**Scope:**

- Hostel rooms/beds, allocations, wardens, roll call/leave, mess, incidents and fees.
- Inventory/stores, stock movements, requisitions, procurement/vendors, assets, maintenance/depreciation.
- Facilities spaces/work orders, visitor/gate workflows, health clinic and restricted safeguarding records.
- Sports/clubs/teams/events/participation/achievements and consent.

**Dependencies:** Phase 3 people/relationships/documents; Phase 7 finance/accounting; Phase 9 reusable asset/stock and operational patterns.

**Acceptance criteria:**

- Each physical resource has an accountable owner, allocation and audit trail.
- Procurement receipts update stock/assets and accounting without duplicate entry.
- Health/safeguarding records are inaccessible to ordinary admins without explicit grants.
- Activity participation and consent are visible to linked students/parents.

**Risk flags:** safeguarding/medical legal obligations, stock valuation, depreciation policy, hostel/food regulations.

### Phase 11 — Communications, Portals & Digital Experience

**Scope:**

- Channel-neutral announcements/campaigns/templates/audiences, consent/preferences, schedules, delivery logs and inbox.
- Email/SMS/WhatsApp/push adapters with retries, provider webhooks, quotas and DLT/regional compliance where applicable.
- Complete parent/student portals and role-specific mobile/PWA experience; device management, branding/releases and support tickets.
- Replace all mock announcements and disconnected notification icons.

**Dependencies:** Domain events from Phases 3–10; guardian relationships; documents; jobs; finance for provider cost controls.

**Acceptance criteria:**

- A domain event can create a policy-compliant notification with traceable delivery status.
- Recipient preferences/consent and quiet hours are enforced across channels.
- Parent app consolidates authorized child data without duplicating domain records.
- Campaign creators cannot export or message audiences outside their scope.

**Risk flags:** provider reliability/cost, consent law, message fanout scale, mobile release lifecycle, cross-child privacy.

### Phase 12 — Analytics, Reports & AI Governance

**Scope:**

- Governed metric definitions, role dashboards, report catalog, domain and cross-domain reports, schedules, custom builder and data-quality queues.
- Central AI gateway with quotas, model routing, prompt versions, knowledge/RAG sources, citations, evaluation, human review and audit.
- Migrate useful Intelligence signals and AI Studio intents; delete static generation claims.
- Async exports and warehouse/read-model strategy where operational queries no longer suffice.

**Dependencies:** stable operational schemas and events from prior phases; Communications for scheduled delivery; Documents for generated artifacts.

**Acceptance criteria:**

- Every dashboard metric has owner, definition, scope, freshness and drill-down reconciliation.
- Reports honor field/row permissions and sensitive exports are audited.
- AI output records model, prompt, sources, reviewer, cost and final disposition; quotas prevent unbounded spend.
- Generated content is never published to students/parents without the owning domain's approval workflow.

**Risk flags:** metric disagreement, warehouse latency, AI hallucination/bias, source copyright/privacy, cost drift.

### Phase 13 — Platform Operations & Enterprise Hardening

**Scope:**

- Platform Schools, plans/entitlements, subscription billing, service operations, communications/AI ops, operators, audit/compliance and infrastructure.
- SSO/SCIM, partner APIs, multi-campus/district hierarchy, support access governance, data residency/retention/erasure, backups/restore and DR drills.
- Performance/load testing, observability/SLOs, security review, penetration test, runbooks and deprecation cleanup.
- Remove `/cms`, old page aliases, generic module workspaces and v0 API adapters after verified zero use.

**Dependencies:** all earlier domain and platform telemetry contracts.

**Acceptance criteria:**

- Entitlements affect navigation and server enforcement consistently without code deployment.
- Subscription/service changes are auditable and safely reversible.
- Tenant export/erasure/retention and support-access workflows are operational and tested.
- Recovery objectives are demonstrated in a restore/DR exercise; capacity tests meet agreed SLOs.
- No deprecated route or mock business data remains in production bundles.

**Risk flags:** billing correctness, tenant lifecycle irreversibility, enterprise identity integration, compliance jurisdiction, cutover of long-lived compatibility routes.

### 6.1 Cross-phase quality gate

Every module increment is complete only when it includes:

- schema plus reviewed migration, indexes, RLS policy and `FORCE RLS`;
- service/repository boundary using `withTenant`;
- Zod request and response contracts;
- permission and field-scope enforcement at server/API boundaries;
- unit, integration, cross-tenant and critical end-to-end tests;
- loading, empty, no-results, error, success and unauthorized UI states;
- keyboard/WCAG review and responsive verification;
- audit events, structured logs, metrics and alert/runbook entries;
- import/export, retention and data-classification decisions;
- rollout flag, compatibility behavior and rollback procedure.

## 7. Open Questions & Assumptions

### 7.1 Decisions required before Phase 2/3

1. **Product hierarchy:** Is one tenant always one school, or can a tenant represent a school group/district with multiple campuses and legally separate institutions? The blueprint assumes one contracted tenant may contain multiple campuses but has one security/financial boundary.
2. **Tenant superadmin:** Is `superadmin` a school owner role distinct from `admin`, and should it be the only role allowed to manage subscription, privacy and ownership? Current sidebar rules accidentally exclude it from admin-only modules.
3. **Registration model:** Is public tenant self-registration intended, sales-approved provisioning only, or both? `/register` and public/tenant onboarding currently overlap.
4. **Academic models:** Which boards and structures are launch requirements (CBSE/ICSE/state/IB/IGCSE), and must one school operate multiple boards or grading systems simultaneously?
5. **Multi-campus scope:** Which records are campus-scoped versus schoolwide: students, staff, fee books, academic years, library, inventory and chart of accounts?
6. **Guardianship:** What evidence and approval process links a parent account to a student, and how are custody/contact restrictions represented?
7. **Finance:** Is full double-entry accounting an EPADM responsibility or an integration to Tally/QuickBooks/ERPNext? The target includes an accounting foundation, but this decision changes Phase 7 depth.
8. **Payments:** Which countries/currencies/gateways and refund/chargeback rules are required first?
9. **Payroll:** Which jurisdiction is authoritative for statutory calculations? Current UI names Indian TDS/PF/ESI/PT; this blueprint assumes India-first but makes payroll rules configurable.
10. **Attendance:** Is the canonical model daily, period-based, course-schedule-based, or selectable by grade/program? How are late/half-day/remote states defined?
11. **Library migration:** Does one `library_books` row represent a bibliographic title or one physical accession/copy? A safe title/copy migration cannot proceed without this answer.
12. **Exam content:** Are saved `exams` generated question papers, scheduled exams, or both? The target separates content artifacts from exam events.
13. **Historical data:** Must existing invoice, payroll, attendance and academic records be legally immutable, and what is the required retention period?
14. **Communications:** Which providers/channels and consent/DLT rules are contracted? Can teachers message parents directly, or only through approved audiences/templates?
15. **Mobile strategy:** Native apps, PWA, or both? The current “Mobile” page is an administration mock, not an implemented client.
16. **AI policy:** Which data may leave the tenant boundary for model processing, which roles approve generated content, and are regional model endpoints required?
17. **Support access:** May platform operators impersonate school users? The blueprint assumes no silent impersonation and requires time-bound, reasoned, audited support access.
18. **Deletion/privacy:** What soft-delete, legal hold, correction and erasure rules apply under DPDP and school-record obligations?
19. **Accessibility/localization:** Which languages, scripts, right-to-left support and accessibility certifications are launch commitments?
20. **Reporting:** Which statutory/regulatory reports are must-have by jurisdiction, and which existing spreadsheets define acceptance truth?

### 7.2 Documented assumptions

- The repository is the authoritative current-application input requested by the attached brief.
- Browser-visible school URLs remain tenant-neutral; tenant UUIDs are not added to links.
- `src/proxy.ts` remains the Next.js 16 request boundary and `root/[tenant]` remains the internal rewrite target during migration.
- Existing live database records must be preserved; sample rows and local-only state are not production records.
- The current eight tenant roles remain supported; specialist roles are added as templates/scoped grants rather than hard-coded one-off checks.
- A modular monolith is the default. Background workers, analytics projections and external integration adapters may deploy separately when operationally justified.
- Postgres remains the operational system of record and RLS remains defense in depth, enforced with a non-bypass application role.
- Module entitlements affect availability, while permissions affect user authorization. Neither substitutes for the other.
- India-first terminology in current screens does not justify hard-coding jurisdiction rules into domain models.
- “Delete” means archive/cancel/reverse for referenced business records unless an explicit retention policy permits hard deletion.

### 7.3 Blueprint validation checklist

- [x] Every existing public, platform, tenant page and API route found in the repository is accounted for in the audit and migration map.
- [x] Every enterprise domain in the brief has exactly one target module owner.
- [x] The target navigation has no more than three levels.
- [x] Platform operator, tenant superadmin, school admin, teacher, student, parent, staff, accountant, librarian and specialist roles are represented.
- [x] The roadmap is sequential; no phase requires a capability scheduled only in a later phase.
- [x] Domain boundaries distinguish system-of-record ownership from cross-module projections.
- [x] Visible route slugs are consistently lowercase kebab-case and collections are plural.
- [x] Subdomain-based tenant separation and the literal `root` rewrite constraint are preserved.
- [x] Existing aliases, shadowed routes, prototypes, duplicate implementations and verified build failures are explicitly handled.
- [x] No implementation change is prescribed as already completed by this analysis phase.

---

**Master-specification rule:** when implementation uncovers a new route, entity, role, provider constraint or regulatory requirement, update this blueprint through a reviewed architecture decision rather than adding another isolated sidebar item or `?tab=` flow.
