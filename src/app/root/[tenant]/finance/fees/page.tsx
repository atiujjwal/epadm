import { requirePermission } from "@/lib/auth/guards";
import {
  academicClasses,
  feeStructures,
  financialTransactions,
  studentInvoices,
  students,
} from "@/lib/db";
import { withTenant } from "@/lib/rls";
import { eq, sql } from "drizzle-orm";
import { FeesWorkspace, type FeeInvoiceRow, type FeeStructureRow, type FeesStats } from "../../fees/fees-workspace";

export default async function FeesPage() {
  const ctx = await requirePermission("finance.fees.read");

  const today = new Date().toISOString().split("T")[0];

  const data = await withTenant(ctx.tenantId, async (tx) => {
    const fees = await tx
      .select({
        id: feeStructures.id,
        name: feeStructures.name,
        amount: feeStructures.amount,
        frequency: feeStructures.frequency,
        academicYear: feeStructures.academicYear,
        className: academicClasses.name,
      })
      .from(feeStructures)
      .innerJoin(academicClasses, eq(feeStructures.classId, academicClasses.id))
      .orderBy(academicClasses.name);

    const invs = await tx
      .select({
        id: studentInvoices.id,
        title: studentInvoices.title,
        amount: studentInvoices.amount,
        dueDate: studentInvoices.dueDate,
        status: studentInvoices.status,
        studentName: sql<string>`${students.firstName} || ' ' || ${students.lastName}`,
      })
      .from(studentInvoices)
      .innerJoin(students, eq(studentInvoices.studentId, students.id))
      .orderBy(studentInvoices.dueDate);

    const txs = await tx
      .select({
        type: financialTransactions.type,
        amount: financialTransactions.amount,
        date: financialTransactions.date,
        category: financialTransactions.category,
      })
      .from(financialTransactions);

    return { fees, invoices: invs, transactions: txs };
  });

  const invoices: FeeInvoiceRow[] = data.invoices.map((inv) => ({
    id: inv.id,
    title: inv.title,
    amount: inv.amount,
    dueDate: String(inv.dueDate),
    status: inv.status,
    studentName: String(inv.studentName ?? "—"),
  }));

  const feeStructureRows: FeeStructureRow[] = data.fees.map((f) => ({
    id: f.id,
    name: f.name,
    amount: f.amount,
    frequency: f.frequency,
    academicYear: f.academicYear,
    className: f.className,
  }));

  const paid = invoices.filter((i) => i.status === "paid");
  const pending = invoices.filter((i) => i.status === "pending");
  const overdue = invoices.filter((i) => i.status === "overdue");

  const billed = invoices.reduce((sum, i) => sum + i.amount, 0);
  const collected = paid.reduce((sum, i) => sum + i.amount, 0);
  const outstanding = [...pending, ...overdue].reduce((sum, i) => sum + i.amount, 0);

  const feeCreditsToday = data.transactions.filter(
    (t) => t.type === "credit" && t.category === "fees" && String(t.date) === today,
  );
  const collectedToday = feeCreditsToday.reduce((sum, t) => sum + t.amount, 0);

  const stats: FeesStats = {
    collected,
    billed,
    outstanding,
    paidCount: paid.length,
    pendingCount: pending.length,
    overdueCount: overdue.length,
    feePlanCount: feeStructureRows.length,
    receiptCountToday: feeCreditsToday.length,
    collectedToday,
  };

  return (
    <FeesWorkspace stats={stats} invoices={invoices} feeStructures={feeStructureRows} />
  );
}
