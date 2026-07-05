import { getCtx } from "@/lib/context";
import { getTenantMemberSummary, listTenantMembers } from "@/lib/admin/tenant-users";

const roleTone: Record<string, string> = {
  admin: "bg-emerald-50 text-emerald-700",
  teacher: "bg-sky-50 text-sky-700",
  student: "bg-fuchsia-50 text-fuchsia-700",
  parent: "bg-amber-50 text-amber-700",
  staff: "bg-zinc-100 text-zinc-700",
  accountant: "bg-teal-50 text-teal-700",
  librarian: "bg-indigo-50 text-indigo-700",
};

export default async function DashboardPage() {
  const ctx = await getCtx();
  const summary = await getTenantMemberSummary(ctx.tenantId);
  const members = await listTenantMembers(ctx.tenantId);
  const recentMembers = members.slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-[linear-gradient(135deg,#062b1f_0%,#0d5a43_55%,#73c8aa_100%)] px-6 py-8 text-white shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-emerald-100">
          Phase 1 admin foundation
        </p>
        <h1 className="mt-3 text-3xl font-semibold">
          {summary?.tenantName ?? "SchoolOS"} control room
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50">
          This dashboard is now wired to real tenant data, role-aware membership
          management, and the first operational metrics for the school workspace.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
            <div className="text-xs uppercase tracking-[0.16em] text-emerald-100">
              Active members
            </div>
            <div className="mt-2 text-3xl font-semibold">
              {summary?.activeMemberCount ?? 0}
            </div>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
            <div className="text-xs uppercase tracking-[0.16em] text-emerald-100">
              Total memberships
            </div>
            <div className="mt-2 text-3xl font-semibold">
              {summary?.memberCount ?? 0}
            </div>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
            <div className="text-xs uppercase tracking-[0.16em] text-emerald-100">
              Tenant slug
            </div>
            <div className="mt-2 text-lg font-semibold">{summary?.tenantSlug ?? "-"}</div>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
            <div className="text-xs uppercase tracking-[0.16em] text-emerald-100">
              Plan tier
            </div>
            <div className="mt-2 text-lg font-semibold">{ctx.planTier}</div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-950">Recent tenant members</h2>
              <p className="mt-1 text-sm text-zinc-600">
                Fresh memberships across the current school workspace.
              </p>
            </div>
            <a
              href="/users"
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-emerald-300 hover:text-emerald-700"
            >
              Manage users
            </a>
          </div>

          <div className="space-y-3">
            {recentMembers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-sm text-zinc-600">
                No tenant members yet. Add the first school operator from the users view.
              </div>
            ) : (
              recentMembers.map((member) => (
                <div
                  key={member.membershipId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-4"
                >
                  <div>
                    <div className="font-medium text-zinc-900">{member.name}</div>
                    <div className="mt-1 text-sm text-zinc-600">{member.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        roleTone[member.role] ?? "bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      {member.role}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        member.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {member.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">Role distribution</h2>
            <div className="mt-4 space-y-3">
              {summary?.roleBreakdown.length ? (
                summary.roleBreakdown.map((item) => (
                  <div key={item.role} className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600">{item.role}</span>
                    <span className="text-sm font-semibold text-zinc-950">
                      {item.count}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-600">
                  Role metrics will appear once memberships are added.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">Current context</h2>
            <div className="mt-4 grid gap-3 text-sm text-zinc-700">
              <div className="rounded-xl bg-zinc-50 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                  Tenant ID
                </div>
                <div className="mt-1 break-all font-medium text-zinc-900">
                  {ctx.tenantId}
                </div>
              </div>
              <div className="rounded-xl bg-zinc-50 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                  User ID
                </div>
                <div className="mt-1 break-all font-medium text-zinc-900">
                  {ctx.userId}
                </div>
              </div>
              <div className="rounded-xl bg-zinc-50 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                  Role
                </div>
                <div className="mt-1 font-medium text-zinc-900">{ctx.role}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

