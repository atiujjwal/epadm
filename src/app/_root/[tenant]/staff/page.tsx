import { getStaffSummary, listStaff } from "@/lib/admin/registries";
import { getCtx } from "@/lib/context";
import { StaffRegistry } from "./staff-registry";

export default async function StaffPage() {
  const ctx = await getCtx();
  const [summary, staff] = await Promise.all([
    getStaffSummary(ctx.tenantId),
    listStaff(ctx.tenantId),
  ]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">Total staff</div>
          <div className="mt-2 text-3xl font-semibold text-zinc-950">{summary.total}</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">Active</div>
          <div className="mt-2 text-3xl font-semibold text-emerald-700">{summary.active}</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">Non-active</div>
          <div className="mt-2 text-3xl font-semibold text-zinc-700">{summary.inactive}</div>
        </div>
      </section>

      <div>
        <h1 className="text-2xl font-semibold text-zinc-950">Staff</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Maintain employee codes, departments, and staffing records in one place.
        </p>
      </div>

      <StaffRegistry
        initialStaff={staff.map((member) => ({
          ...member,
          createdAt: member.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
