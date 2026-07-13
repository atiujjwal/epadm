import { getCtx } from "@/lib/context";
import { getTenantMemberSummary, listTenantMembers } from "@/lib/admin/tenant-users";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default async function DashboardPage() {
  const ctx = await getCtx();
  const summary = await getTenantMemberSummary(ctx.tenantId);
  const members = await listTenantMembers(ctx.tenantId);
  const recentMembers = members.slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${summary?.tenantName ?? "School"} overview`}
        description="Live operational metrics and recent activity for the school workspace."
      />

      {/* Stat cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card variant="elevated" padding="md" className="stat-card">
          <div className="stat-card__icon stat-card__icon--indigo" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="stat-card__label">Active members</div>
          <div className="stat-card__value">{summary?.activeMemberCount ?? 0}</div>
        </Card>

        <Card variant="elevated" padding="md" className="stat-card">
          <div className="stat-card__icon stat-card__icon--emerald" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <div className="stat-card__label">Total memberships</div>
          <div className="stat-card__value">{summary?.memberCount ?? 0}</div>
        </Card>

        <Card variant="elevated" padding="md" className="stat-card">
          <div className="stat-card__icon stat-card__icon--slate" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div className="stat-card__label">Tenant slug</div>
          <div className="stat-card__value stat-card__value--mono">{summary?.tenantSlug ?? "-"}</div>
        </Card>

        <Card variant="elevated" padding="md" className="stat-card">
          <div className="stat-card__icon stat-card__icon--amber" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="stat-card__label">Plan tier</div>
          <div className="stat-card__value stat-card__value--capitalize">{ctx.planTier}</div>
        </Card>
      </section>

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
              <EmptyState
                icon={
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                }
                title="No tenant members yet"
                description="Add the first school operator from the users view to start tracking membership."
                action={
                  <Button href="/users" variant="primary">
                    Add members
                  </Button>
                }
              />
            ) : (
              recentMembers.map((member) => (
                <div
                  key={member.membershipId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3"
                  style={{ backgroundColor: "var(--bg-surface-2)", borderColor: "var(--border-default)" }}
                >
                  <div>
                    <div className="font-medium text-primary">{member.name}</div>
                    <div className="mt-0.5 text-sm text-secondary">{member.email}</div>
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
                    <span className="text-sm text-secondary capitalize">{item.role}</span>
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
                <div className="mt-1 font-medium text-primary capitalize">{ctx.role}</div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
