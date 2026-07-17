import { getCtx } from "@/lib/context";
import { getTenantMemberSummary, listTenantMembers } from "@/lib/admin/tenant-users";
import { getStudentSummary, getStaffSummary } from "@/lib/admin/registries";
import { getAcademicStructureSummary } from "@/lib/admin/academic-structure";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { ActivityRow } from "@/components/ui/activity-row";
import { RoleChart } from "@/components/ui/role-chart";
import { CopyableId } from "@/components/ui/copyable-id";

export default async function DashboardPage() {
  const ctx = await getCtx();

  const [summary, members, studentSummary, staffSummary, academicSummary] =
    await Promise.all([
      getTenantMemberSummary(ctx.tenantId),
      listTenantMembers(ctx.tenantId),
      getStudentSummary(ctx.tenantId),
      getStaffSummary(ctx.tenantId),
      getAcademicStructureSummary(ctx.tenantId),
    ]);

  const recentMembers = members.slice(0, 5);

  return (
    <div className="flex flex-col gap-8 pb-8">
      <PageHeader
        title={`${summary?.tenantName ?? "School"} overview`}
        description="Live operational metrics and recent activity for the school workspace."
        badge={<Badge variant="accent">{ctx.planTier}</Badge>}
        action={
          <Button href="/users" variant="secondary">
            Manage users
          </Button>
        }
      />

      {/* KPI Metrics */}
      <section className="dashboard-metrics">
        <MetricCard
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          label="Active members"
          value={summary?.activeMemberCount ?? 0}
          colorScheme="indigo"
        />
        <MetricCard
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          }
          label="Total memberships"
          value={summary?.memberCount ?? 0}
          colorScheme="emerald"
        />
        <MetricCard
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5" />
            </svg>
          }
          label="Students"
          value={studentSummary.total}
          subtitle={`${studentSummary.active} active`}
          colorScheme="blue"
        />
        <MetricCard
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
          }
          label="Staff"
          value={staffSummary.total}
          subtitle={`${staffSummary.active} active`}
          colorScheme="violet"
        />
        <MetricCard
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          }
          label="Classes"
          value={academicSummary.classCount}
          subtitle={`${academicSummary.sectionCount} sections`}
          colorScheme="amber"
        />
      </section>

      {/* Content grid */}
      <section className="dashboard-content">
        {/* Recent members */}
        <Card variant="elevated" padding="lg">
          <div className="mb-6 flex flex-col space-y-1.5">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Recent members</h2>
            <p className="text-sm text-muted-foreground">
              Latest memberships and activity across the workspace.
            </p>
          </div>

          <div className="space-y-3">
            {recentMembers.length === 0 ? (
              <div className="py-8">
                <EmptyState
                  icon={
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  }
                  title="No members yet"
                  description="Add the first school member from the users view."
                  action={
                    <Button href="/users" variant="primary">
                      Add members
                    </Button>
                  }
                />
              </div>
            ) : (
              recentMembers.map((member) => (
                <ActivityRow
                  key={member.membershipId}
                  name={member.name}
                  email={member.email}
                  role={member.role}
                  isActive={member.isActive}
                  joinedAt={member.joinedAt}
                />
              ))
            )}
          </div>
        </Card>

        {/* Right sidebar */}
        <div className="dashboard-sidebar">
          <Card variant="elevated" padding="lg">
            <h2 className="text-lg font-semibold tracking-tight text-foreground mb-4">Role distribution</h2>
            <RoleChart
              data={summary?.roleBreakdown ?? []}
              total={summary?.memberCount ?? 0}
            />
          </Card>

          <Card variant="elevated" padding="lg">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Workspace context</h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/40">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
            </div>

            <div className="flex flex-col gap-5">
              {/* Technical Details Well */}
              <div className="rounded-xl bg-secondary/30 p-4 border border-border/40 shadow-inner space-y-3">
                <CopyableId label="Tenant ID" value={ctx.tenantId} />
                <CopyableId label="User ID" value={ctx.userId} />
                <CopyableId label="Slug" value={summary?.tenantSlug ?? "-"} truncate={false} />
              </div>
              
              {/* Role & Plan Badges */}
              <div className="grid grid-cols-2 gap-3 mt-1">
                {/* Role Status Card */}
                <div className="flex flex-col justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 shadow-sm">
                  <span className="text-[10px] font-bold text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-wider mb-1.5">
                    Account Role
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300 capitalize text-sm">
                      {ctx.role}
                    </span>
                  </div>
                </div>

                {/* Subscription Card */}
                <div className="flex flex-col justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 p-3.5 shadow-sm">
                  <span className="text-[10px] font-bold text-blue-600/80 dark:text-blue-400/80 uppercase tracking-wider mb-1.5">
                    Subscription
                  </span>
                  <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="font-bold text-blue-700 dark:text-blue-300 capitalize text-sm">
                      {ctx.planTier}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}