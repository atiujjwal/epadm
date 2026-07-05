import { getCtx } from "@/lib/context";
import {
  academicClasses,
  students,
  staffProfiles,
  feeStructures,
  studentInvoices,
  staffPayroll,
  financialTransactions,
  studentEnrollments,
} from "@/lib/db";
import { withTenant } from "@/lib/rls";
import { and, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { writePlatformAuditLog } from "@/lib/platform/audit";

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const ctx = await getCtx();
  if (ctx.role !== "admin" && ctx.role !== "accountant") {
    redirect("/login");
  }

  const params = await searchParams;
  const currentTab = params.tab || "ledger";

  // Execute queries inside the transaction RLS context
  const data = await withTenant(ctx.tenantId, async (tx) => {
    // 1. Fetch Academic Classes
    const classes = await tx
      .select()
      .from(academicClasses)
      .orderBy(academicClasses.name);

    // 2. Fetch Fee Structures
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

    // 3. Fetch Invoices
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

    // 4. Fetch Payroll
    const pays = await tx
      .select({
        id: staffPayroll.id,
        basicSalary: staffPayroll.basicSalary,
        allowances: staffPayroll.allowances,
        deductions: staffPayroll.deductions,
        paymentStatus: staffPayroll.paymentStatus,
        payPeriod: staffPayroll.payPeriod,
        paidAt: staffPayroll.paidAt,
        staffName: staffProfiles.fullName,
      })
      .from(staffPayroll)
      .innerJoin(staffProfiles, eq(staffPayroll.staffProfileId, staffProfiles.id))
      .orderBy(staffPayroll.payPeriod);

    // 5. Fetch Ledger Entries
    const txs = await tx
      .select()
      .from(financialTransactions)
      .orderBy(financialTransactions.date);

    return { classes, fees, invoices: invs, payrolls: pays, transactions: txs };
  });

  // Calculate stats
  const totalCollections = data.transactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = data.transactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalCollections - totalExpenses;

  // Actions
  async function markInvoicePaid(formData: FormData) {
    "use server";
    const ctx = await getCtx();
    const invoiceId = formData.get("invoiceId") as string;
    if (!invoiceId) return;

    await withTenant(ctx.tenantId, async (tx) => {
      const inv = await tx
        .select()
        .from(studentInvoices)
        .where(eq(studentInvoices.id, invoiceId))
        .limit(1);

      if (inv[0] && inv[0].status !== "paid") {
        await tx
          .update(studentInvoices)
          .set({ status: "paid", updatedAt: new Date() })
          .where(eq(studentInvoices.id, invoiceId));

        await tx.insert(financialTransactions).values({
          tenantId: ctx.tenantId,
          type: "credit",
          amount: inv[0].amount,
          date: new Date().toISOString().split("T")[0],
          description: `Fee Receipt: Collected payment for "${inv[0].title}"`,
          invoiceId: inv[0].id,
          category: "fees",
        });

        await writePlatformAuditLog({
          operatorId: null,
          action: "finance.invoice_paid",
          entityType: "student_invoice",
          entityId: invoiceId,
          metadata: {
            tenantId: ctx.tenantId,
            collectorUserId: ctx.userId,
            amount: inv[0].amount,
            title: inv[0].title,
          },
        });
      }
    });

    revalidatePath(`/finance`);
  }

  async function disbursePayroll(formData: FormData) {
    "use server";
    const ctx = await getCtx();
    const payrollId = formData.get("payrollId") as string;
    if (!payrollId) return;

    await withTenant(ctx.tenantId, async (tx) => {
      const pay = await tx
        .select({
          payroll: staffPayroll,
          staff: staffProfiles,
        })
        .from(staffPayroll)
        .innerJoin(staffProfiles, eq(staffPayroll.staffProfileId, staffProfiles.id))
        .where(eq(staffPayroll.id, payrollId))
        .limit(1);

      if (pay[0] && pay[0].payroll.paymentStatus !== "paid") {
        const netPay =
          pay[0].payroll.basicSalary +
          pay[0].payroll.allowances -
          pay[0].payroll.deductions;

        await tx
          .update(staffPayroll)
          .set({
            paymentStatus: "paid",
            paidAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(staffPayroll.id, payrollId));

        await tx.insert(financialTransactions).values({
          tenantId: ctx.tenantId,
          type: "debit",
          amount: netPay,
          date: new Date().toISOString().split("T")[0],
          description: `Disbursed salary to ${pay[0].staff.fullName} for period ${pay[0].payroll.payPeriod}`,
          payrollId: pay[0].payroll.id,
          category: "payroll",
        });

        await writePlatformAuditLog({
          operatorId: null,
          action: "finance.payroll_disbursed",
          entityType: "staff_payroll",
          entityId: payrollId,
          metadata: {
            tenantId: ctx.tenantId,
            staffUserId: ctx.userId,
            netPay,
            staffName: pay[0].staff.fullName,
            payPeriod: pay[0].payroll.payPeriod,
          },
        });
      }
    });

    revalidatePath(`/finance`);
  }

  async function createFeePlan(formData: FormData) {
    "use server";
    const ctx = await getCtx();
    const classId = formData.get("classId") as string;
    const name = formData.get("name") as string;
    const amountStr = formData.get("amount") as string;
    const frequency = formData.get("frequency") as string;
    const academicYear = formData.get("academicYear") as string;

    if (!classId || !name || !amountStr || !frequency || !academicYear) return;

    const amount = parseInt(amountStr, 10);

    await withTenant(ctx.tenantId, async (tx) => {
      await tx.insert(feeStructures).values({
        tenantId: ctx.tenantId,
        classId,
        name,
        amount,
        frequency,
        academicYear,
      });
    });

    revalidatePath(`/finance`);
  }

  async function triggerBillingJob() {
    "use server";
    const ctx = await getCtx();

    const dateObj = new Date();
    const monthName = dateObj.toLocaleString("default", { month: "long" });
    const yearStr = dateObj.getFullYear();
    const dueDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), 15);
    const dueDateStr = dueDay.toISOString().split("T")[0];

    await withTenant(ctx.tenantId, async (tx) => {
      const enrollments = await tx
        .select({
          enrollmentId: studentEnrollments.id,
          studentId: studentEnrollments.studentId,
          classId: studentEnrollments.classId,
          academicYear: studentEnrollments.academicYear,
        })
        .from(studentEnrollments)
        .where(
          and(
            eq(studentEnrollments.status, "active"),
            eq(studentEnrollments.tenantId, ctx.tenantId),
          ),
        );

      for (const e of enrollments) {
        const classFees = await tx
          .select()
          .from(feeStructures)
          .where(
            and(
              eq(feeStructures.classId, e.classId),
              eq(feeStructures.frequency, "monthly"),
              eq(feeStructures.tenantId, ctx.tenantId),
            ),
          );

        for (const f of classFees) {
          const invoiceTitle = `${f.name} - ${monthName} ${yearStr}`;

          const existing = await tx
            .select()
            .from(studentInvoices)
            .where(
              and(
                eq(studentInvoices.studentId, e.studentId),
                eq(studentInvoices.title, invoiceTitle),
                eq(studentInvoices.tenantId, ctx.tenantId),
              ),
            )
            .limit(1);

          if (existing.length === 0) {
            await tx.insert(studentInvoices).values({
              tenantId: ctx.tenantId,
              studentId: e.studentId,
              enrollmentId: e.enrollmentId,
              title: invoiceTitle,
              amount: f.amount,
              dueDate: dueDateStr,
              status: "pending",
            });
          }
        }
      }
    });

    revalidatePath(`/finance`);
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">
            Financial Management
          </h1>
          <p className="text-sm text-zinc-600 font-medium">
            Monitor invoices, disburse payroll, and audit double-entry transactions.
          </p>
        </div>

        <form action={triggerBillingJob}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            ⚡ Generate Invoices (Cron Mock)
          </button>
        </form>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200">
        {[
          { id: "ledger", label: "Financial Ledger" },
          { id: "invoices", label: "Student Invoices" },
          { id: "payroll", label: "Staff Payroll" },
          { id: "fees", label: "Fee Plans" },
        ].map((tab) => (
          <a
            key={tab.id}
            href={`?tab=${tab.id}`}
            className={`border-b-2 px-6 py-3 text-sm font-medium transition ${
              currentTab === tab.id
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-zinc-600 hover:text-zinc-900"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* Tab Contents */}
      {currentTab === "ledger" && (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="text-xs uppercase tracking-[0.14em] text-zinc-500 font-semibold">Total Collections</div>
              <div className="mt-2 text-3xl font-bold text-zinc-900">₹{totalCollections.toLocaleString()}</div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="text-xs uppercase tracking-[0.14em] text-zinc-500 font-semibold">Total Expenditures</div>
              <div className="mt-2 text-3xl font-bold text-zinc-900">₹{totalExpenses.toLocaleString()}</div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="text-xs uppercase tracking-[0.14em] text-zinc-500 font-semibold">Net Reserves</div>
              <div className={`mt-2 text-3xl font-bold ${netBalance >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                ₹{netBalance.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-zinc-950">Double-Entry Ledger Log</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-xs font-semibold text-zinc-500 uppercase">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Description</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {data.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-zinc-500">
                        No transactions registered in the ledger.
                      </td>
                    </tr>
                  ) : (
                    data.transactions.map((tx) => (
                      <tr key={tx.id} className="text-zinc-800">
                        <td className="py-3.5">{String(tx.date)}</td>
                        <td className="py-3.5">
                          <span className="capitalize px-2 py-0.5 rounded-full bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 font-medium">
                            {tx.category}
                          </span>
                        </td>
                        <td className="py-3.5 max-w-sm truncate">{tx.description}</td>
                        <td className="py-3.5">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              tx.type === "credit"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-red-50 text-red-800 border border-red-200"
                            }`}
                          >
                            {tx.type === "credit" ? "Credit (IN)" : "Debit (OUT)"}
                          </span>
                        </td>
                        <td className={`py-3.5 text-right font-semibold ${tx.type === "credit" ? "text-emerald-700" : "text-red-700"}`}>
                          {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {currentTab === "invoices" && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-zinc-950">Student Invoices</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs font-semibold text-zinc-500 uppercase">
                  <th className="pb-3">Student</th>
                  <th className="pb-3">Invoice Title</th>
                  <th className="pb-3">Due Date</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-zinc-500">
                      No student invoices found. Click "Generate Invoices" to create bills.
                    </td>
                  </tr>
                ) : (
                  data.invoices.map((inv) => (
                    <tr key={inv.id} className="text-zinc-800">
                      <td className="py-3.5 font-medium">{String(inv.studentName)}</td>
                      <td className="py-3.5">{inv.title}</td>
                      <td className="py-3.5">{String(inv.dueDate)}</td>
                      <td className="py-3.5 font-semibold">₹{inv.amount.toLocaleString()}</td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                            inv.status === "paid"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        {inv.status === "pending" && (
                          <form action={markInvoicePaid}>
                            <input type="hidden" name="invoiceId" value={inv.id} />
                            <button
                              type="submit"
                              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1 text-xs font-medium text-white transition"
                            >
                              Receive Payment
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {currentTab === "payroll" && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-zinc-950">Staff Payroll Logs</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs font-semibold text-zinc-500 uppercase">
                  <th className="pb-3">Employee</th>
                  <th className="pb-3">Period</th>
                  <th className="pb-3">Basic Salary</th>
                  <th className="pb-3">Allowances</th>
                  <th className="pb-3">Deductions</th>
                  <th className="pb-3">Net Pay</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.payrolls.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-zinc-500">
                      No payroll records generated yet.
                    </td>
                  </tr>
                ) : (
                  data.payrolls.map((pay) => {
                    const netPay = pay.basicSalary + pay.allowances - pay.deductions;
                    return (
                      <tr key={pay.id} className="text-zinc-800">
                        <td className="py-3.5 font-medium">{pay.staffName}</td>
                        <td className="py-3.5">{pay.payPeriod}</td>
                        <td className="py-3.5">₹{pay.basicSalary.toLocaleString()}</td>
                        <td className="py-3.5">₹{pay.allowances.toLocaleString()}</td>
                        <td className="py-3.5">₹{pay.deductions.toLocaleString()}</td>
                        <td className="py-3.5 font-semibold">₹{netPay.toLocaleString()}</td>
                        <td className="py-3.5">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                              pay.paymentStatus === "paid"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-red-50 text-red-800 border border-red-200"
                            }`}
                          >
                            {pay.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          {pay.paymentStatus === "unpaid" && (
                            <form action={disbursePayroll}>
                              <input type="hidden" name="payrollId" value={pay.id} />
                              <button
                                type="submit"
                                className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1 text-xs font-medium text-white transition"
                              >
                                Disburse Salary
                              </button>
                            </form>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {currentTab === "fees" && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Create Form */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4 h-fit">
            <h2 className="text-lg font-semibold text-zinc-950">Add Fee Plan</h2>
            <form action={createFeePlan} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Academic Class</label>
                <select
                  name="classId"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
                  required
                >
                  {data.classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Fee Description Name</label>
                <input
                  name="name"
                  placeholder="e.g. Monthly Tuition Fee"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  placeholder="e.g. 5000"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Frequency</label>
                <select
                  name="frequency"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
                  required
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Academic Year</label>
                <input
                  name="academicYear"
                  defaultValue="2026-2027"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition mt-2"
              >
                Create Fee Plan
              </button>
            </form>
          </section>

          {/* List of Plans */}
          <section className="md:col-span-2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-zinc-950">Active Fee Structures</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-xs font-semibold text-zinc-500 uppercase">
                    <th className="pb-3">Class</th>
                    <th className="pb-3">Fee Name</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Frequency</th>
                    <th className="pb-3">Academic Year</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {data.fees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-zinc-500">
                        No base fee structures configured. Add one on the left.
                      </td>
                    </tr>
                  ) : (
                    data.fees.map((fee) => (
                      <tr key={fee.id} className="text-zinc-800">
                        <td className="py-3.5 font-medium">{fee.className}</td>
                        <td className="py-3.5">{fee.name}</td>
                        <td className="py-3.5 font-semibold">₹{fee.amount.toLocaleString()}</td>
                        <td className="py-3.5 capitalize">{fee.frequency}</td>
                        <td className="py-3.5">{fee.academicYear}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
