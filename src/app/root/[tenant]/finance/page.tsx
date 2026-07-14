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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/ui/metric-card";

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const ctx = await getCtx();
  if (ctx.role !== "admin" && ctx.role !== "accountant") {
    // Wrong role, but still authenticated — route back through "/" so they land
    // on their own role's home, not the login page.
    redirect("/");
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
      <PageHeader
        title="Financial Management"
        description="Monitor invoices, disburse payroll, and audit double-entry transactions."
        action={
          <form action={triggerBillingJob}>
            <Button type="submit" variant="primary">
              Generate Invoices (Cron Mock)
            </Button>
          </form>
        }
      />

      {/* Tabs */}
      <div className="tab-nav">
        {[
          { id: "ledger", label: "Financial Ledger" },
          { id: "invoices", label: "Student Invoices" },
          { id: "payroll", label: "Staff Payroll" },
          { id: "fees", label: "Fee Plans" },
        ].map((tab) => (
          <a
            key={tab.id}
            href={`?tab=${tab.id}`}
            className={`tab-nav__button ${
              currentTab === tab.id ? "tab-nav__button--active" : ""
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* Tab Contents */}
      {currentTab === "ledger" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              }
              label="Total Collections"
              value={`₹${totalCollections.toLocaleString()}`}
              colorScheme="emerald"
            />
            <MetricCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                  <polyline points="17 18 23 18 23 12" />
                </svg>
              }
              label="Total Expenditures"
              value={`₹${totalExpenses.toLocaleString()}`}
              colorScheme="amber"
            />
            <MetricCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              }
              label="Net Reserves"
              value={`₹${netBalance.toLocaleString()}`}
              colorScheme="indigo"
              valueClassName={netBalance >= 0 ? 'stat-card__value--positive' : 'stat-card__value--negative'}
            />
          </div>

          <Card variant="elevated" padding="lg">
            <h2 className="text-lg font-semibold text-primary">Double-Entry Ledger Log</h2>
            <div className="overflow-x-auto mt-4">
              <Table variant="spacious" striped>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted py-6">
                        No transactions registered in the ledger.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{String(tx.date)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{tx.category}</Badge>
                        </TableCell>
                        <TableCell className="max-w-sm truncate">{tx.description}</TableCell>
                        <TableCell>
                          <Badge variant={tx.type === "credit" ? "success" : "error"}>
                            {tx.type === "credit" ? "Credit (IN)" : "Debit (OUT)"}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${tx.type === "credit" ? "text-emerald-700" : "text-red-700"}`}>
                          {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {currentTab === "invoices" && (
        <Card variant="elevated" padding="lg">
          <h2 className="text-lg font-semibold text-primary">Student Invoices</h2>
          <div className="overflow-x-auto mt-4">
            <Table variant="spacious" striped>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Invoice Title</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted py-6">
                      No student invoices found. Click &quot;Generate Invoices&quot; to create bills.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium text-primary">{String(inv.studentName)}</TableCell>
                      <TableCell className="text-secondary">{inv.title}</TableCell>
                      <TableCell className="text-secondary">{String(inv.dueDate)}</TableCell>
                      <TableCell className="font-semibold text-primary">₹{inv.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={inv.status === "paid" ? "success" : "default"}>
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {inv.status === "pending" && (
                          <form action={markInvoicePaid}>
                            <input type="hidden" name="invoiceId" value={inv.id} />
                            <Button type="submit" variant="primary" size="sm">
                              Receive Payment
                            </Button>
                          </form>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {currentTab === "payroll" && (
        <Card variant="elevated" padding="lg">
          <h2 className="text-lg font-semibold text-primary">Staff Payroll Logs</h2>
          <div className="overflow-x-auto mt-4">
            <Table variant="spacious" striped>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Allowances</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.payrolls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted py-6">
                      No payroll records generated yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.payrolls.map((pay) => {
                    const netPay = pay.basicSalary + pay.allowances - pay.deductions;
                    return (
                      <TableRow key={pay.id}>
                        <TableCell className="font-medium text-primary">{pay.staffName}</TableCell>
                        <TableCell className="text-secondary">{pay.payPeriod}</TableCell>
                        <TableCell className="text-secondary">₹{pay.basicSalary.toLocaleString()}</TableCell>
                        <TableCell className="text-secondary">₹{pay.allowances.toLocaleString()}</TableCell>
                        <TableCell className="text-secondary">₹{pay.deductions.toLocaleString()}</TableCell>
                        <TableCell className="font-semibold text-primary">₹{netPay.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={pay.paymentStatus === "paid" ? "success" : "error"}>
                            {pay.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {pay.paymentStatus === "unpaid" && (
                            <form action={disbursePayroll}>
                              <input type="hidden" name="payrollId" value={pay.id} />
                              <Button type="submit" variant="primary" size="sm">
                                Disburse Salary
                              </Button>
                            </form>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {currentTab === "fees" && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card variant="elevated" padding="lg">
            <h2 className="text-lg font-semibold text-primary">Add Fee Plan</h2>
            <form action={createFeePlan} className="space-y-3 mt-4">
              <div>
                <Label htmlFor="classId">Academic Class</Label>
                <Select
                  id="classId"
                  name="classId"
                  className="w-full"
                  required
                >
                  {data.classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="name">Fee Description Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Monthly Tuition Fee"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  name="amount"
                  placeholder="e.g. 5000"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  id="frequency"
                  name="frequency"
                  className="w-full"
                  required
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="academicYear">Academic Year</Label>
                <Input
                  id="academicYear"
                  name="academicYear"
                  defaultValue="2026-2027"
                  className="w-full"
                  required
                />
              </div>

              <Button type="submit" variant="primary" className="w-full mt-2">
                Create Fee Plan
              </Button>
            </form>
          </Card>

          <Card variant="elevated" padding="lg" className="md:col-span-2">
            <h2 className="text-lg font-semibold text-primary">Active Fee Structures</h2>
            <div className="overflow-x-auto mt-4">
              <Table variant="spacious" striped>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Fee Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Academic Year</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.fees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted py-6">
                        No base fee structures configured. Add one on the left.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.fees.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell className="font-medium text-primary">{fee.className}</TableCell>
                        <TableCell className="text-secondary">{fee.name}</TableCell>
                        <TableCell className="font-semibold text-primary">₹{fee.amount.toLocaleString()}</TableCell>
                        <TableCell className="capitalize text-secondary">{fee.frequency}</TableCell>
                        <TableCell className="text-secondary">{fee.academicYear}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
