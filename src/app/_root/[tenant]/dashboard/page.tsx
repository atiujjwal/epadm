import { getCtx } from "@/lib/context";
import { getTenantMemberSummary, listTenantMembers } from "@/lib/admin/tenant-users";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
      <Card className="dashboard-hero" padding="lg">
        <p className="text-sm font-medium uppercase tracking-[0.16em]" style={{ color: "var(--color-success-100)" }}>
          Phase 1 admin foundation
        </p>
        <h1 className="mt-3 text-3xl font-semibold">
          {summary?.tenantName ?? "SchoolOS"} control room
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6" style={{ color: "var(--color-indigo-100)" }}>
          This dashboard is now wired to real tenant data, role-aware membership
          management, and the first operational metrics for the school workspace.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card variant="outlined" padding="md" style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.15)" }}>
            <div className="text-xs uppercase tracking-[0.16em]" style={{ color: "var(--color-success-100)" }}>
              Active members
            </div>
            <div className="mt-2 text-3xl font-semibold">
              {summary?.activeMemberCount ?? 0}
            </div>
          </Card>
          <Card variant="outlined" padding="md" style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.15)" }}>
            <div className="text-xs uppercase tracking-[0.16em]" style={{ color: "var(--color-success-100)" }}>
              Total memberships
            </div>
            <div className="mt-2 text-3xl font-semibold">
              {summary?.memberCount ?? 0}
            </div>
          </Card>
          <Card variant="outlined" padding="md" style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.15)" }}>
            <div className="text-xs uppercase tracking-[0.16em]" style={{ color: "var(--color-success-100)" }}>
              Tenant slug
            </div>
            <div className="mt-2 text-lg font-semibold">{summary?.tenantSlug ?? "-"}</div>
          </Card>
          <Card variant="outlined" padding="md" style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.15)" }}>
            <div className="text-xs uppercase tracking-[0.16em]" style={{ color: "var(--color-success-100)" }}>
              Plan tier
            </div>
            <div className="mt-2 text-lg font-semibold">{ctx.planTier}</div>
          </Card>
        </div>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card variant="elevated" padding="lg">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-primary">Recent tenant members</h2>
              <p className="mt-1 text-sm text-secondary">
                Fresh memberships across the current school workspace.
              </p>
            </div>
            <Button href="/users" variant="secondary">
              Manage users
            </Button>
          </div>

          <div className="space-y-3">
            {recentMembers.length === 0 ? (
              <div className="empty-state text-sm">
                No tenant members yet. Add the first school operator from the users view.
              </div>
            ) : (
              recentMembers.map((member) => (
                <div
                  key={member.membershipId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-4"
                  style={{ backgroundColor: "var(--bg-surface-2)", borderColor: "var(--border-default)" }}
                >
                  <div>
                    <div className="font-medium text-primary">{member.name}</div>
                    <div className="mt-1 text-sm text-secondary">{member.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">{member.role}</Badge>
                    <Badge variant={member.isActive ? "success" : "default"}>
                      {member.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card variant="elevated" padding="lg">
            <h2 className="text-lg font-semibold text-primary">Role distribution</h2>
            <div className="mt-4 space-y-3">
              {summary?.roleBreakdown.length ? (
                summary.roleBreakdown.map((item) => (
                  <div key={item.role} className="flex items-center justify-between">
                    <span className="text-sm text-secondary">{item.role}</span>
                    <span className="text-sm font-semibold text-primary">
                      {item.count}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-secondary">
                  Role metrics will appear once memberships are added.
                </p>
              )}
            </div>
          </Card>

          <Card variant="elevated" padding="lg">
            <h2 className="text-lg font-semibold text-primary">Current context</h2>
            <div className="mt-4 grid gap-3 text-sm text-secondary">
              <div className="rounded-xl px-4 py-3" style={{ backgroundColor: "var(--bg-surface-2)" }}>
                <div className="text-xs uppercase tracking-[0.14em] text-muted">
                  Tenant ID
                </div>
                <div className="mt-1 break-all font-medium text-primary">
                  {ctx.tenantId}
                </div>
              </div>
              <div className="rounded-xl px-4 py-3" style={{ backgroundColor: "var(--bg-surface-2)" }}>
                <div className="text-xs uppercase tracking-[0.14em] text-muted">
                  User ID
                </div>
                <div className="mt-1 break-all font-medium text-primary">
                  {ctx.userId}
                </div>
              </div>
              <div className="rounded-xl px-4 py-3" style={{ backgroundColor: "var(--bg-surface-2)" }}>
                <div className="text-xs uppercase tracking-[0.14em] text-muted">
                  Role
                </div>
                <div className="mt-1 font-medium text-primary">{ctx.role}</div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

