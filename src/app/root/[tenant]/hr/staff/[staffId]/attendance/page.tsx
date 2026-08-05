import { requirePermission } from "@/lib/auth/guards";

export default async function StaffAttendancePage() {
  await requirePermission("hr.read");
  return (
    <div className="rounded-lg border bg-surface p-6 text-sm text-muted-foreground">
      Staff attendance devices and biometric summaries are tracked through HR leave/payroll workflows. A dedicated daily staff attendance grid is documented as a deferred operational enhancement.
    </div>
  );
}
