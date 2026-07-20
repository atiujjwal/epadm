import { asc, desc, eq } from "drizzle-orm";
import { staffPayroll, staffProfiles } from "@/lib/db";
import { withTenant } from "@/lib/rls";

export const PAYROLL_READ_PERMISSION = "staff.read" as const;

export type PayrollRecord = {
  id: string;
  staffProfileId: string;
  employeeCode: string;
  staffName: string;
  department: string | null;
  basicSalary: number;
  allowances: number;
  deductions: number;
  paymentStatus: string;
  payPeriod: string;
  paidAt: Date | null;
  createdAt: Date;
};

export async function listPayroll(tenantId: string) {
  const rows = await withTenant(tenantId, (tx) =>
    tx
      .select({
        id: staffPayroll.id,
        staffProfileId: staffPayroll.staffProfileId,
        employeeCode: staffProfiles.employeeCode,
        staffName: staffProfiles.fullName,
        department: staffProfiles.department,
        basicSalary: staffPayroll.basicSalary,
        allowances: staffPayroll.allowances,
        deductions: staffPayroll.deductions,
        paymentStatus: staffPayroll.paymentStatus,
        payPeriod: staffPayroll.payPeriod,
        paidAt: staffPayroll.paidAt,
        createdAt: staffPayroll.createdAt,
      })
      .from(staffPayroll)
      .innerJoin(staffProfiles, eq(staffPayroll.staffProfileId, staffProfiles.id))
      .where(eq(staffPayroll.tenantId, tenantId))
      .orderBy(desc(staffPayroll.payPeriod), asc(staffProfiles.fullName)),
  );

  return rows satisfies PayrollRecord[];
}
