import { getStaffSummary, listStaff } from "@/lib/admin/registries";
import { getCtx } from "@/lib/context";
import { StaffRegistry } from "./staff-registry";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/ui/metric-card";

export default async function StaffPage() {
  const ctx = await getCtx();
  const [summary, staff] = await Promise.all([
    getStaffSummary(ctx.tenantId),
    listStaff(ctx.tenantId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff"
        description="Maintain employee codes, departments, and staffing records in one place."
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          }
          label="Total staff"
          value={summary.total}
          colorScheme="indigo"
        />
        <MetricCard
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          }
          label="Active"
          value={summary.active}
          colorScheme="emerald"
        />
        <MetricCard
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          }
          label="Non-active"
          value={summary.inactive}
          colorScheme="rose"
        />
      </section>

      <StaffRegistry
        initialStaff={staff.map((member) => ({
          ...member,
          createdAt: member.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
