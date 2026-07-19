## Goals

1. Clean up sidebar: remove sub-flow accordions, keep only top-level modules + collapse button.
2. Move sub-flow navigation into an in-page horizontal tab header (redesigned, premium, grouped).
3. Fix Dashboard "Attendance entry status" tile layout to fill the card width.
4. Add a new **Academics** module for managing classes, sections, subjects, and academic setup.

---

## Wave 1 — Sidebar simplification

**`src/lib/module-registry.tsx`**
- Keep `flows` data (used by in-page tabs & command palette) but add optional `group` field per flow (`"Operate" | "Reports" | "Configure"`) so the in-page header can section them.

**`src/components/app-sidebar.tsx`**
- Strip the expand/collapse chevrons, sub-menus, and localStorage for expanded state.
- Render only top-level modules grouped by `NAV` group labels.
- Retain: search "Jump to…", collapse-to-icon behavior, sidebar footer, active-state highlighting.
- Keep the `SidebarTrigger` in `Topbar` (already there) for collapse.

---

## Wave 2 — In-page navigation header (redesigned)

Create **`src/components/module-tabs.tsx`**:
- Sticky sub-header directly under `PageHeader`.
- Renders flows as horizontal pill/underline tabs with subtle group dividers ("Operate • Reports • Configure").
- Overflow behavior: horizontal scroll with fade edges on narrow viewports; a "More ▾" popover when >12 items.
- Each tab shows label + optional count badge (e.g. Leave · 3).
- Uses `?tab=<id>` URL search param (already the current convention).
- Active tab: filled background + weight change, inactive: muted text with hover.
- Keyboard: ← → arrow navigation, `/` focuses filter.

**`src/components/module-shell.tsx`**
- Replace current tab strip with `<ModuleTabs flows={...} />`.
- Remove any leftover `InnerRail` remnants.

Visual reference direction: Linear's project tabs / Stripe's dashboard sub-nav — small type (12px), tight spacing, group separator dots, count chips in mono font.

---

## Wave 3 — Dashboard "Attendance entry status" fix

**`src/routes/dashboard.tsx`** (or wherever the panel lives — verify during build)
- Change the grid inside that card from a fixed narrow column count to a responsive `grid-cols-[repeat(auto-fill,minmax(28px,1fr))]` heatmap so tiles fill the full card width.
- Ensure tile aspect stays square via `aspect-square`.
- Add legend row at bottom (Marked / Partial / Missing / Holiday).

---

## Wave 4 — Academics module (new)

**Route:** `src/routes/academics.tsx`
**Registry entry:** new group "Academics Setup" above current "Academics" (Attendance/Timetable/Exams), or slot under existing "Academics" group as first item.

**Flows (in-page tabs):**

Operate
- **Classes & Sections** — grid of classes (Nursery → XII), inline add/edit/delete, section count, class teacher assignment, strength.
- **Subjects** — master list; subject type (Core / Elective / Co-scholastic), credit weight, code, applicable grades.
- **Class–Subject Mapping** — matrix view (class × subject) with checkbox assignments and per-cell teacher assignment.
- **Streams & Electives** — for IX–XII: Science/Commerce/Arts streams, elective baskets with capacity + student pick lists.
- **House System** — 4 houses (color, captain, points), inter-house standings.
- **Academic Calendar** — terms, working days, planned instructional days per subject.

Reports
- **Section Roster** — per-section student roster with class teacher, subject teachers.
- **Teaching Load** — teacher × subject × class hours, over/underload flags.
- **Curriculum Coverage** — % syllabus covered per subject/class (feeds from AI Studio syllabus module).

Configure
- **Grading Scheme** — link to Exams grade slabs (reference).
- **Session / Academic Year** — active session, promotion rules, next-session rollover wizard.
- **Class Naming Templates** — e.g. "X-A" vs "Grade 10 · Alpha".
- **Curriculum Board** — CBSE / ICSE / State / IB selector; affects subject master defaults.

**Data:** extend `src/data/mock.ts` with:
- `classes`: `{ id, name, sections: [{id, name, strength, classTeacherId}], grade, stream? }`
- `subjects`: `{ id, code, name, type, grades[] }`
- `classSubjectMap`: `{ classId, subjectId, teacherId }`
- `houses`, `streams`, `academicSession`

**Sidebar icon:** `GraduationCap` or `School` from lucide-react (Admissions currently uses GraduationCap — pick `School` for Academics).

---

## Wave 5 — Sanity sweep

- Verify every module route uses `ModuleShell` + new `ModuleTabs` uniformly.
- Ensure sidebar has no leftover chevron/expand code paths.
- Command palette (⌘K) continues to expose flows as searchable entries (unchanged data source).

---

## Technical notes

- URL contract stays `?tab=<flowId>` — no breaking changes to deep links.
- `ModuleTabs` is purely presentational; state comes from URL via `useRouterState`.
- All colors stay on semantic tokens (`--accent`, `--muted-foreground`, `--border`).
- No backend changes; Academics is mock-data driven, matching the rest of the app.

## Deliverable order

1. Registry `group` field + `ModuleTabs` component.
2. Rewrite `AppSidebar` (flat modules only).
3. Wire `ModuleShell` to use `ModuleTabs`.
4. Fix Dashboard heatmap grid.
5. Ship Academics module (route + registry + mock data).