import { getStaffSummary, listStaff } from "@/lib/admin/registries";
import { getCtx } from "@/lib/context";
import { StaffRegistry } from "./staff-registry";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

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

      <section className="grid gap-4 md:grid-cols-3">
        <Card variant="elevated" padding="md">
          <div className="text-xs uppercase tracking-[0.14em] text-muted">Total staff</div>
          <div className="mt-2 text-3xl font-semibold text-primary">{summary.total}</div>
        </Card>
        <Card variant="elevated" padding="md">
          <div className="text-xs uppercase tracking-[0.14em] text-muted">Active</div>
          <div className="mt-2 text-3xl font-semibold text-accent">{summary.active}</div>
        </Card>
        <Card variant="elevated" padding="md">
          <div className="text-xs uppercase tracking-[0.14em] text-muted">Non-active</div>
          <div className="mt-2 text-3xl font-semibold text-secondary">{summary.inactive}</div>
        </Card>
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
