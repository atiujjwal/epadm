import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Pool } from "pg";

vi.mock("server-only", () => ({}));

import {
  assignFeePlanToClass,
  createFeePlan,
  createFeeStructure,
  createFinancialAccount,
  deleteFinancialAccount,
  ensureFinanceDefaults,
  generateInvoices,
  getAccountingSummary,
  listFinanceModel,
  recordExpense,
  recordPayment,
  voidInvoice,
} from "@/lib/phase7/finance";

const TABLES = [
  "fee_categories",
  "fee_structure_items",
  "fee_plans",
  "fee_plan_installments",
  "student_fee_assignments",
  "invoice_sequences",
  "receipt_sequences",
  "payment_transactions",
  "payment_receipts",
  "financial_accounts",
] as const;

const opsUrl = process.env.OPS_DATABASE_URL;
let ops: Pool;
const stamp = `${Date.now()}-${randomUUID().slice(0, 8)}`;
const tenantId = randomUUID();
const userId = randomUUID();
let academicYearId = "";
let classId = "";
let sectionId = "";
let studentA = "";
let studentB = "";

describe("Phase 7 finance foundation", () => {
  beforeAll(async () => {
    if (!opsUrl) throw new Error("OPS_DATABASE_URL is required");
    ops = new Pool({ connectionString: opsUrl, max: 1 });
    await ops.query("insert into tenants (id,name,slug,subscription_tier,is_active) values ($1,$2,$3,'basic',true)", [tenantId, "Phase 7 Tenant", `phase7-${stamp}`]);
    await ops.query("insert into users (id,name,email,password_hash,is_active) values ($1,'Phase 7 User',$2,'hash',true)", [userId, `phase7-${stamp}@example.test`]);
    await ops.query("insert into tenant_users (tenant_id,user_id,role,membership_status,is_active) values ($1,$2,'admin','active',true)", [tenantId, userId]);
    const staffId = (await ops.query("insert into staff_profiles (tenant_id,employee_code,full_name,status) values ($1,$2,'Phase 7 Teacher','active') returning id", [tenantId, `P7T-${stamp}`])).rows[0].id;
    academicYearId = (await ops.query("insert into academic_years (tenant_id,name,start_date,end_date,is_current,status) values ($1,'2026-27','2026-04-01','2027-03-31',true,'active') returning id", [tenantId])).rows[0].id;
    classId = (await ops.query("insert into academic_classes (tenant_id,code,name,academic_year,academic_year_id,class_teacher_id,display_order) values ($1,'P7','Phase 7','2026-27',$2,$3,7) returning id", [tenantId, academicYearId, staffId])).rows[0].id;
    sectionId = (await ops.query("insert into class_sections (tenant_id,class_id,name,capacity) values ($1,$2,'A',40) returning id", [tenantId, classId])).rows[0].id;
    const ids: string[] = [];
    for (const name of ["Nila", "Ojas"]) {
      const studentId = (await ops.query("insert into students (tenant_id,admission_number,first_name,status) values ($1,$2,$3,'active') returning id", [tenantId, `${name}-${stamp}`, name])).rows[0].id;
      ids.push(studentId);
      await ops.query("insert into student_enrollments (tenant_id,student_id,class_id,section_id,academic_year,academic_year_id,enrollment_status,status) values ($1,$2,$3,$4,'2026-27',$5,'active','active')", [tenantId, studentId, classId, sectionId, academicYearId]);
    }
    [studentA, studentB] = ids;
  });

  afterAll(async () => {
    if (ops) {
      await ops.query("delete from tenants where id = $1", [tenantId]).catch(() => undefined);
      await ops.query("delete from users where id = $1", [userId]).catch(() => undefined);
      await ops.end();
    }
    await rm(`generated-files/${tenantId}`, { recursive: true, force: true });
  });

  it("enables and forces tenant RLS on every new table and backfill columns exist", async () => {
    const rls = await ops.query(
      "select c.relname, c.relrowsecurity, c.relforcerowsecurity, count(p.policyname)::int as policies from pg_class c join pg_namespace n on n.oid = c.relnamespace left join pg_policies p on p.schemaname = n.nspname and p.tablename = c.relname where n.nspname = 'public' and c.relname = any($1::text[]) group by c.relname, c.relrowsecurity, c.relforcerowsecurity",
      [TABLES],
    );
    expect(rls.rows).toHaveLength(TABLES.length);
    for (const row of rls.rows) {
      expect(row.relrowsecurity).toBe(true);
      expect(row.relforcerowsecurity).toBe(true);
      expect(row.policies).toBeGreaterThan(0);
    }
    const columns = await ops.query("select column_name from information_schema.columns where table_name = 'student_invoices' and column_name = any($1::text[])", [["invoice_number", "total_paise", "paid_paise", "balance_paise"]]);
    expect(columns.rows).toHaveLength(4);
  });

  it("runs fee lifecycle, payments, receipts, voiding, late fee, and accounting", async () => {
    await ensureFinanceDefaults(tenantId);
    await ensureFinanceDefaults(tenantId);
    const model = await listFinanceModel(tenantId);
    expect(model.categories.length).toBeGreaterThanOrEqual(6);
    expect(model.accounts.some((account) => account.code === "4000")).toBe(true);
    const tuition = model.categories.find((category) => category.name === "Tuition");
    expect(tuition).toBeTruthy();

    const structure = await createFeeStructure(tenantId, userId, {
      academicYearId,
      classId,
      name: "Annual Phase 7 Fee",
      frequency: "annual",
      items: [{ categoryId: tuition!.id, label: "Tuition", amountPaise: 100000 }],
    });
    expect(structure.totalAmountPaise).toBe(100000);

    await expect(createFeePlan(tenantId, {
      structureId: structure.id,
      name: "Bad Split",
      installments: [{ label: "Term 1", dueDate: "2026-07-01", amountPaise: 90000 }],
    })).rejects.toThrow(/sum/);

    const plan = await createFeePlan(tenantId, {
      structureId: structure.id,
      name: "Annual Lump Sum",
      planType: "lump_sum",
      lateFeePerDayPaise: 5000,
      gracePeriodDays: 2,
      isDefault: true,
      installments: [{ label: "Annual", dueDate: "2026-07-01", amountPaise: 100000 }],
    });

    await expect(assignFeePlanToClass(tenantId, userId, {
      academicYearId,
      classId,
      structureId: structure.id,
      planId: plan.id,
      concessionAmountPaise: 200000,
    })).rejects.toThrow(/Concession/);

    const assigned = await assignFeePlanToClass(tenantId, userId, { academicYearId, classId, structureId: structure.id, planId: plan.id });
    expect(assigned).toEqual({ created: 2, skipped: 0 });
    const assignedAgain = await assignFeePlanToClass(tenantId, userId, { academicYearId, classId, structureId: structure.id, planId: plan.id });
    expect(assignedAgain).toEqual({ created: 0, skipped: 2 });

    const generated = await generateInvoices(tenantId, userId, { academicYearId });
    expect(generated.created).toBe(2);
    expect(generated.invoiceNumbers).toEqual(["INV-2026-00001", "INV-2026-00002"]);
    const generatedAgain = await generateInvoices(tenantId, userId, { academicYearId });
    expect(generatedAgain.created).toBe(0);
    expect(generatedAgain.skipped).toBe(2);

    const invoices = (await ops.query("select id, student_id, balance_paise from student_invoices where tenant_id = $1 order by invoice_number", [tenantId])).rows;
    const invoiceA = invoices.find((invoice) => invoice.student_id === studentA);
    const invoiceB = invoices.find((invoice) => invoice.student_id === studentB);
    expect(invoiceA.balance_paise).toBe("100000");

    await expect(recordPayment(tenantId, userId, { invoiceId: invoiceA.id, amountPaise: 100001, paymentMethod: "cash", paymentDate: "2026-07-11" })).rejects.toThrow(/exceeds balance/);
    const payment = await recordPayment(tenantId, userId, { invoiceId: invoiceA.id, amountPaise: 100000, paymentMethod: "upi", paymentDate: "2026-07-11", referenceNumber: `UPI-${stamp}` });
    expect("receipt" in payment).toBe(true);
    expect(payment.newBalance).toBe(40000);
    expect(payment.receipt?.pdfUrl).toMatch(/^\/generated-files\/.+\.pdf$/);

    const invoiceAfterPayment = (await ops.query("select paid_paise, balance_paise, late_fee_paise, status from student_invoices where id = $1", [invoiceA.id])).rows[0];
    expect(invoiceAfterPayment.paid_paise).toBe("100000");
    expect(invoiceAfterPayment.balance_paise).toBe("40000");
    expect(invoiceAfterPayment.late_fee_paise).toBe("40000");
    expect(invoiceAfterPayment.status).toBe("partial");

    await expect(voidInvoice(tenantId, userId, invoiceA.id, "Has money")).rejects.toThrow(/recorded payments/);
    await expect(voidInvoice(tenantId, userId, invoiceB.id, "Duplicate")).resolves.toMatchObject({ status: "voided" });

    const expenseAccount = await createFinancialAccount(tenantId, { code: `59${stamp.slice(-2)}`, name: "Test Expenses", type: "expense" });
    await recordExpense(tenantId, userId, { accountId: expenseAccount.id, amountPaise: 10000, date: "2026-07-11", description: "Printer paper" });
    const summary = await getAccountingSummary(tenantId, { type: "all", from: "2026-07-01", to: "2026-07-31" });
    expect(summary.incomePaise).toBe(100000);
    expect(summary.expensePaise).toBe(10000);
    expect(summary.netPaise).toBe(90000);
    await expect(deleteFinancialAccount(tenantId, expenseAccount.id)).rejects.toThrow(/transactions/);
  });
});
