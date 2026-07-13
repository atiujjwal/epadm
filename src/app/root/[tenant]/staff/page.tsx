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

      <section className="grid gap-4 sm:grid-cols-3">
        <Card variant="elevated" padding="md" className="stat-card">
          <div className="stat-card__icon stat-card__icon--indigo" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <div className="stat-card__label">Total staff</div>
          <div className="stat-card__value">{summary.total}</div>
        </Card>
        <Card variant="elevated" padding="md" className="stat-card">
          <div className="stat-card__icon stat-card__icon--emerald" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <div className="stat-card__label">Active</div>
          <div className="stat-card__value">{summary.active}</div>
        </Card>
        <Card variant="elevated" padding="md" className="stat-card">
          <div className="stat-card__icon stat-card__icon--slate" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div className="stat-card__label">Non-active</div>
          <div className="stat-card__value">{summary.inactive}</div>
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
