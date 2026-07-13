# EPADM — App-Shell & Dashboard UI Remediation
### Cursor Agent Implementation Prompt

**Context for the agent:** EPADM is a Next.js + Tailwind CSS multi-tenant school admin platform. The marketing site (Features/Pricing/Compliance) and the authenticated tenant dashboard currently share the same layout, header, and footer. This document fixes that, repairs a broken stat-card section, and brings the internal dashboard up to SaaS-industry UI standards (reference bar: Linear, Vercel Dashboard, Stripe Dashboard, Retool).

Do not skip phases. Do not "improve" scope beyond what's listed — flag anything else as a suggestion at the end instead of doing it inline.

---

## Diagnosis (from screenshots, for agent context)

1. **Shared layout bug** — `/dashboard` renders the full marketing `<Navbar />` (Features / Pricing / Compliance / School Login / Get Started) and the full marketing `<Footer />` (Product / Company / Legal columns + copyright bar). This is almost certainly because the root `app/layout.tsx` hard-codes these components instead of using route groups to scope them to marketing routes only.
2. **Broken stat cards** — On the Overview page, "Active members," "Total memberships," "Tenant slug," "Plan tier" render as faint, near-background-color text with no card container, no icon, and no value — leaving ~400px of dead whitespace before "Recent tenant members." This is a rendering bug (stuck skeleton state, bad color token, or silently-failed fetch), not a content issue.
3. **Marketing-scale typography in the app** — H1/H2 headings ("ips4 control room," "Recent tenant members," "Role distribution") are set at hero/display sizes (~60–80px, font-black). Appropriate for a landing page hero, wrong for an internal dashboard.
4. **No authenticated app chrome** — no dedicated app top bar (logo/tenant switcher, breadcrumb, search, notifications, avatar/account menu). The existing left sidebar (Overview / People > Users, Students, Staff / Academics > Structure / Finance > Fees & payroll) is structurally fine and should be kept, just needs to sit inside a proper app shell.
5. **A second, broken legacy header is fighting the sidebar for space** — in the admin dashboard screenshot, below the "ACTIVE WORKSPACE" card there's an unstyled, overlapping fragment: a hamburger icon (☰), the text "IPips4," and "admin Sign out" all rendering on top of each other with no layout container. This looks like leftover markup from an earlier mobile-header attempt now rendering (badly) on desktop too. This is dead/broken markup to be removed, not a feature to preserve — the real top app bar built in Phase 1 replaces it entirely.
6. **This is not an Overview-only bug** — the ghost stat-card issue and oversized typography are very likely present on every tenant route (Users, Students, Staff, Structure, Fees & payroll), not just Overview, since these pages almost certainly share the same page-header and stat-card components. Treat Phase 2 and Phase 3 as a per-route audit across the whole `(app)` route group, not a one-page fix.

---

## Phase 0 — Route Architecture Split (do this first, everything else depends on it)

**Goal:** Marketing pages and the authenticated app must never share a layout again.

**Product framing (important, keep this in mind through every phase):** The marketing site (`/`, `/features`, `/pricing`, `/compliance`) exists for exactly two purposes — brand presentation to prospective schools, and the "School Login" entry point. Once a tenant authenticates, they should never see that marketing Navbar or Footer again, on any route, at any scroll position, on any device. The dashboard must feel like a distinct product (a school management app), not a page nested inside the marketing website. If any `(app)` route is rendering `Features / Pricing / Compliance / Get Started` in a header or a multi-column `Product / Company / Legal` footer, that is a Phase 0 regression and blocks all later phases.

- Create two route groups:
  - `app/(marketing)/layout.tsx` → wraps `/`, `/features`, `/pricing`, `/compliance`, and any other public pages. Contains the existing marketing `<Navbar />` and full multi-column `<Footer />`.
  - `app/(app)/layout.tsx` → wraps everything currently under `/dashboard`, `/tenant-users`, `/students`, `/staff`, `/academics`, `/finance`, `/login` (post-auth) etc. Contains the **new** `<AppShell />` from Phase 1.
- Move the existing dashboard routes into the `(app)` group without changing their URLs (route groups don't affect the URL).
- `app/layout.tsx` (root) should only contain `<html>`, `<body>`, global providers (theme, auth/session context, toast provider) — **no Navbar, no Footer**. Those belong to the two route-group layouts, not root.
- **[CURSOR: VALIDATE]** After this phase: visiting `/` shows marketing nav + marketing footer. Visiting `/dashboard` shows **neither** — confirm by temporarily rendering a placeholder `<AppShell>App Shell Placeholder</AppShell>` and checking no marketing chrome leaks through.

---

## Phase 1 — Build the Authenticated App Shell

**Goal:** The dashboard should read as a SaaS product, not a website with a sidebar bolted on.

Build `components/app-shell/AppShell.tsx` composed of:

1. **Top App Bar** (fixed, ~56–64px height, border-bottom, `bg-background`):
   - Left: compact EPADM mark (logo icon only, no wordmark needed at this size) + current tenant name as a dropdown/switcher (e.g. "ips4 ▾") — replaces the need to bury tenant slug in a sidebar card.
   - Center or left-adjacent: breadcrumb showing current section (e.g. `Tenant Operations / Overview`).
   - Right: search icon/input (can be non-functional placeholder for now), notification bell, and an avatar menu (initial "N" like the existing floating avatar in the screenshots — but move it into the top bar, not floating bottom-left) with dropdown for Role/Plan/Sign Out (this replaces the current "Active Context" card and the floating bottom-left avatar).
2. **Left Sidebar** — keep existing nav items (Overview, Tenant users, Students, Staff, Academics, Finance) and existing structure/active-state styling, just re-home it inside the shell (fixed width ~240px, full height below the top bar, scrollable independently from content).
3. **Content area** — scrollable independently, max-width container (e.g. `max-w-7xl mx-auto`), consistent padding (`px-6 py-8` desktop, `px-4 py-6` mobile).
4. **App footer** — replace the marketing footer entirely with a single-line utility footer: e.g. `© 2026 EPADM · v1.0 · All systems operational · Support`. No columns, no links to Pricing/Compliance/etc. This sits at the bottom of content, not fixed.

- **[CURSOR: ASK]** Confirm: should the sidebar collapse to icons-only on tablet widths, or hide behind a hamburger below `md`? (Recommend: icons-only collapse ≥768px, full hide + hamburger <768px — but confirm before building the collapse logic since it affects state management.)
- **Remove the broken legacy header fragment.** Find and delete the markup rendering the unstyled, overlapping `☰ / "IPips4" / "admin Sign out"` block that currently sits below the sidebar's "ACTIVE WORKSPACE" card. Search for a component that may be an old mobile-nav attempt (likely referencing tenant slug + role in raw text with no container/positioning). Its functionality (sign out, tenant/role display) is fully replaced by the new top app bar's avatar menu and tenant switcher — confirm no unique functionality is lost before deleting, then delete the component and its render call, not just hide it with CSS.
- **[CURSOR: VALIDATE]** Top bar and sidebar are both `position: sticky` or `fixed` and do not scroll with content; only the content area scrolls. Test at 1440px, 1024px, and 375px widths. Confirm the old overlapping header fragment no longer renders anywhere in the DOM (not just visually hidden).

---

## Phase 2 — Fix the Broken Stat Cards (audit every tenant route, not just Overview)

**Goal:** "Active members," "Total memberships," "Tenant slug," "Plan tier" must render as real, visible stat cards — this is a functional bug fix, not a style pass. Then repeat this same audit on **Users, Students, Staff, Structure, and Fees & payroll** — check each for the identical ghost-text/empty-stat pattern before assuming Overview was the only affected page.

- Locate the component rendering these four labels (likely `OverviewStats.tsx` or similar). Diagnose why values aren't rendering — check, in order:
  1. Is this data wrapped in a `<Suspense>` boundary with a fallback that never resolves (stuck skeleton)?
  2. Is the fetch/query for this data actually being awaited, or is it silently failing (check network tab / server logs for a swallowed error)?
  3. Is the text color a CSS variable (e.g. `text-muted-foreground` or a custom token) that's resolving to a color nearly identical to the card background — hence the "ghost text" look?
- Once the root cause is found, fix the data flow (or fix the fetch) so real values render. Do not just recolor the placeholder text — the underlying data binding is broken and needs the actual fix.
- Rebuild these four as a proper stat-card grid: `grid grid-cols-2 lg:grid-cols-4 gap-4`, each card with icon (lucide-react), label (small, muted, uppercase-tracking), value (large, bold), and optional delta/trend line. Use shadcn `<Card>` as the base.
- **[CURSOR: VALIDATE]** All four cards show real, non-empty values matching the tenant's actual data (cross-check against the "Current context" panel data: Tenant ID `e54b69f9-...`, User ID `8a77632e-...`, Role `admin`, Plan `enterprise`, Slug `ips4`). No visible gap/whitespace remains between the page title and "Recent tenant members." Then load Users, Students, Staff, Structure, and Fees & payroll individually and confirm none of them show the same ghost-text/empty-card pattern — if any do, apply the same root-cause fix, not a one-off patch per page.

---

## Phase 3 — Typography & Spacing System for the App (separate from marketing scale)

**Goal:** Stop reusing marketing hero classes inside the app.

- Define an app-specific type scale (Tailwind config or a `app-typography.css`/tokens file), distinct from marketing:
  - Page title (H1): ~24–28px, semibold (not black/900 weight)
  - Section heading (H2): ~18–20px, semibold
  - Card title (H3): ~14–16px, medium
  - Body/label: ~13–14px
- Audit every page under `(app)` (`Overview`, `Tenant users`, `Students`, `Staff`, `Academics`, `Finance`) and replace any `text-5xl/6xl/7xl font-black` (or equivalent hero classes) with the new app scale.
- Standardize card/section spacing: consistent `gap-4`/`gap-6` between cards, consistent `p-6` card padding, consistent `rounded-xl border` treatment across all cards so Overview, Recent tenant members, Role distribution, and Current context all look like one cohesive design system rather than separately-styled blocks.
- **[CURSOR: VALIDATE]** Screenshot every `(app)` page at 1440px — no heading should visually compete with or exceed the size of card content in a way that reads as a landing-page hero.

---

## Phase 4 — Polish Pass

- Add `<Skeleton>` loading states (shadcn) for the stat cards and Recent tenant members list for the brief period before data resolves — should never render as invisible ghost text again.
- Add empty states for lists (e.g., "No tenant members yet" with a CTA) — audit whether Students/Staff/Academics/Finance need this.
- Subtle Framer Motion: fade/slide-in on stat cards on mount (stagger ~40ms), no more than that — this is an internal tool, not a landing page, so keep motion minimal and fast (150–200ms).
- Responsive check: sidebar + top bar + content area at 375px (mobile) — sidebar should not be visible by default; top bar should show a hamburger trigger.
- **[CURSOR: VALIDATE]** Full pass at 375px, 768px, 1024px, 1440px. No horizontal scroll anywhere in `(app)` routes.

---

## Phase 5 — QA Checklist (final sign-off)

- [ ] `/` (marketing) still shows marketing nav + full marketing footer
- [ ] `/dashboard` and all other `(app)` routes show **zero** marketing nav/footer elements
- [ ] Top app bar present and sticky on all `(app)` routes with tenant switcher, breadcrumb, avatar menu
- [ ] Sidebar present, sticky, correct active-state highlighting preserved from current build
- [ ] All 4 Overview stat cards show real values with no ghost/invisible text
- [ ] No heading in `(app)` routes exceeds ~28px/semibold
- [ ] Utility footer only (single line) inside `(app)` — no Product/Company/Legal columns
- [ ] No horizontal scroll or layout break at 375px / 768px / 1024px / 1440px
- [ ] All existing data/features (tenant users list, role distribution, current context values) preserved — nothing removed, only re-homed and re-styled
- [ ] The broken overlapping legacy header fragment (☰ / "IPips4" / "admin Sign out") is fully removed from the DOM on every route, not just visually hidden
- [ ] Every tenant nav destination — Overview, Users, Students, Staff, Structure, Fees & payroll — individually checked for: (a) no marketing header/footer, (b) no ghost/empty stat cards, (c) app-scale typography, (d) consistent card/spacing system, (e) no horizontal scroll at any breakpoint

---

## Tools & Skills for the Agent to Use

- **shadcn/ui** — `Card`, `Badge`, `DropdownMenu`, `Avatar`, `Skeleton`, `Separator` for the app shell and stat cards (consistent with existing project conventions).
- **lucide-react** — icons for stat cards, top bar (search, bell, chevron), sidebar items.
- **Tailwind CSS + design tokens** — extend `tailwind.config` with the app-specific type scale from Phase 3 rather than hardcoding sizes per-page.
- **Next.js App Router route groups** `(marketing)` / `(app)` — the core Phase 0 fix; do not use middleware or conditional rendering as a substitute for this, route groups are the correct primitive here.
- **Framer Motion** — minimal mount transitions only, per Phase 4.
- **React Suspense + streaming** — for the stat-card data fetch fix in Phase 2, if the root cause is data-loading related.

---

## Reference Benchmarks

Linear (app.linear.app), Vercel Dashboard, Stripe Dashboard, Retool — all share: compact top bar with breadcrumb + account menu, persistent left nav, modest heading sizes (24–28px max for page titles), generous but not decorative whitespace, single-line or no footer inside the authenticated product.