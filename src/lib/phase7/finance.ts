import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { and, asc, count, desc, eq, gte, isNull, lte, sql } from "drizzle-orm";
import {
  academicClasses,
  academicYears,
  auditLogs,
  classSections,
  feeCategories,
  feePlanInstallments,
  feePlans,
  feeStructureItems,
  feeStructures,
  financialAccounts,
  financialTransactions,
  invoiceSequences,
  paymentReceipts,
  paymentTransactions,
  receiptSequences,
  studentEnrollments,
  studentFeeAssignments,
  studentInvoices,
  students,
  tenants,
  users,
} from "@/lib/db";
import { type TenantTransaction, withTenant } from "@/lib/rls";

export class Phase7Error extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

function errorText(error: unknown): string {
  if (!error || typeof error !== "object") return String(error);
  const maybe = error as { message?: unknown; code?: unknown; constraint?: unknown; detail?: unknown; cause?: unknown };
  return [
    typeof maybe.message === "string" ? maybe.message : "",
    typeof maybe.code === "string" ? maybe.code : "",
    typeof maybe.constraint === "string" ? maybe.constraint : "",
    typeof maybe.detail === "string" ? maybe.detail : "",
    maybe.cause ? errorText(maybe.cause) : "",
  ].filter(Boolean).join(" ");
}

export function phase7ApiError(error: unknown) {
  if (error instanceof Phase7Error) return Response.json({ error: error.message }, { status: error.status });
  if (/23505|duplicate key|unique constraint/i.test(errorText(error))) {
    return Response.json({ error: "A conflicting finance record already exists." }, { status: 409 });
  }
  return Response.json({ error: "Finance request failed" }, { status: 500 });
}

export function toMinorUnit(amount: number) {
  return Math.round(amount * 100);
}

export function fromMinorUnit(amountPaise: number) {
  return amountPaise / 100;
}

export function formatCurrency(amountPaise: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(fromMinorUnit(amountPaise));
}

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function belowThousand(value: number): string {
  const hundred = Math.floor(value / 100);
  const rest = value % 100;
  const parts: string[] = [];
  if (hundred) parts.push(`${ONES[hundred]} Hundred`);
  if (rest) {
    if (rest < 20) parts.push(ONES[rest]);
    else parts.push(`${TENS[Math.floor(rest / 10)]}${rest % 10 ? ` ${ONES[rest % 10]}` : ""}`);
  }
  return parts.join(" ");
}

export function amountToWords(amountPaise: number, currency = "INR") {
  const rupees = Math.floor(amountPaise / 100);
  const paise = amountPaise % 100;
  if (rupees === 0 && paise === 0) return currency === "INR" ? "Zero Rupees Only" : "Zero Only";
  const parts: string[] = [];
  const crore = Math.floor(rupees / 10000000);
  const lakh = Math.floor((rupees % 10000000) / 100000);
  const thousand = Math.floor((rupees % 100000) / 1000);
  const rest = rupees % 1000;
  if (crore) parts.push(`${belowThousand(crore)} Crore`);
  if (lakh) parts.push(`${belowThousand(lakh)} Lakh`);
  if (thousand) parts.push(`${belowThousand(thousand)} Thousand`);
  if (rest) parts.push(belowThousand(rest));
  const currencyWord = currency === "INR" ? "Rupees" : currency;
  const paiseText = paise ? ` ${belowThousand(paise)} Paise` : "";
  return `${parts.join(" ") || "Zero"} ${currencyWord}${paiseText} Only`;
}

const DEFAULT_CATEGORIES = [
  ["Tuition", "Core tuition fee"],
  ["Development", "Development and infrastructure fee"],
  ["Library", "Library fee"],
  ["Examination", "Examination fee"],
  ["Transport", "Transport fee"],
  ["Other", "Other school fee"],
] as const;

const DEFAULT_ACCOUNTS = [
  { code: "4000", name: "Fee Income", type: "income", children: [
    { code: "4001", name: "Tuition Fee", type: "income" },
    { code: "4002", name: "Development Fee", type: "income" },
    { code: "4003", name: "Examination Fee", type: "income" },
    { code: "4004", name: "Transport Fee", type: "income" },
    { code: "4099", name: "Other Fee Income", type: "income" },
  ] },
  { code: "5000", name: "Operating Expenses", type: "expense", children: [
    { code: "5001", name: "Salaries & Wages", type: "expense" },
    { code: "5002", name: "Utilities", type: "expense" },
    { code: "5003", name: "Maintenance", type: "expense" },
    { code: "5004", name: "Supplies & Materials", type: "expense" },
    { code: "5005", name: "Travel & Conveyance", type: "expense" },
    { code: "5099", name: "Miscellaneous Expenses", type: "expense" },
  ] },
] as const;

function today() {
  return new Date().toISOString().slice(0, 10);
}

function academicYearPrefix(yearName?: string | null) {
  return yearName?.match(/\d{4}/)?.[0] ?? String(new Date().getFullYear());
}

function invoiceStatus(totalPaise: number, paidPaise: number, dueDate: string, voidedAt?: Date | null) {
  if (voidedAt) return "voided";
  const balance = Math.max(totalPaise - paidPaise, 0);
  if (balance === 0) return "paid";
  if (paidPaise > 0) return "partial";
  if (dueDate < today()) return "overdue";
  return "pending";
}

async function writeAuditLog(tx: TenantTransaction, input: { tenantId: string; actorUserId?: string | null; action: string; entityType: string; entityId: string; metadata?: Record<string, unknown> }) {
  await tx.insert(auditLogs).values({
    tenantId: input.tenantId,
    actorUserId: input.actorUserId ?? null,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    metadata: input.metadata ?? {},
  });
}

export async function ensureFinanceDefaults(tenantId: string) {
  return withTenant(tenantId, async (tx) => {
    for (let index = 0; index < DEFAULT_CATEGORIES.length; index += 1) {
      const [name, description] = DEFAULT_CATEGORIES[index];
      await tx.insert(feeCategories).values({ tenantId, name, description, displayOrder: index + 1 }).onConflictDoNothing({
        target: [feeCategories.tenantId, feeCategories.name],
      });
    }

    const parents = new Map<string, string>();
    for (const account of DEFAULT_ACCOUNTS) {
      const [parent] = await tx.insert(financialAccounts).values({
        tenantId,
        code: account.code,
        name: account.name,
        type: account.type,
        isSystem: true,
      }).onConflictDoUpdate({
        target: [financialAccounts.tenantId, financialAccounts.code],
        set: { name: account.name, type: account.type, isSystem: true, isActive: true, updatedAt: new Date() },
      }).returning();
      parents.set(account.code, parent.id);
      for (const child of account.children) {
        await tx.insert(financialAccounts).values({
          tenantId,
          code: child.code,
          name: child.name,
          type: child.type,
          parentId: parent.id,
          isSystem: true,
        }).onConflictDoUpdate({
          target: [financialAccounts.tenantId, financialAccounts.code],
          set: { name: child.name, type: child.type, parentId: parent.id, isSystem: true, isActive: true, updatedAt: new Date() },
        });
      }
    }
    return { seeded: true, parents: parents.size };
  });
}

export async function listFinanceModel(tenantId: string) {
  await ensureFinanceDefaults(tenantId);
  return withTenant(tenantId, async (tx) => {
    const [categories, structures, items, plans, installments, assignments, invoices, payments, receipts, accounts, years, classes, sections] = await Promise.all([
      tx.select().from(feeCategories).where(eq(feeCategories.tenantId, tenantId)).orderBy(asc(feeCategories.displayOrder), asc(feeCategories.name)),
      tx.select({ id: feeStructures.id, tenantId: feeStructures.tenantId, academicYearId: feeStructures.academicYearId, classId: feeStructures.classId, name: feeStructures.name, amount: feeStructures.amount, amountPaise: feeStructures.amountPaise, totalAmountPaise: feeStructures.totalAmountPaise, frequency: feeStructures.frequency, academicYear: feeStructures.academicYear, isActive: feeStructures.isActive, className: academicClasses.name }).from(feeStructures).innerJoin(academicClasses, eq(academicClasses.id, feeStructures.classId)).where(eq(feeStructures.tenantId, tenantId)).orderBy(desc(feeStructures.createdAt)),
      tx.select().from(feeStructureItems).where(eq(feeStructureItems.tenantId, tenantId)).orderBy(asc(feeStructureItems.displayOrder)),
      tx.select().from(feePlans).where(eq(feePlans.tenantId, tenantId)).orderBy(desc(feePlans.createdAt)),
      tx.select().from(feePlanInstallments).where(eq(feePlanInstallments.tenantId, tenantId)).orderBy(asc(feePlanInstallments.dueDate)),
      tx.select({ id: studentFeeAssignments.id, studentId: studentFeeAssignments.studentId, academicYearId: studentFeeAssignments.academicYearId, structureId: studentFeeAssignments.structureId, planId: studentFeeAssignments.planId, concessionAmountPaise: studentFeeAssignments.concessionAmountPaise, netAmountPaise: studentFeeAssignments.netAmountPaise, createdAt: studentFeeAssignments.createdAt, studentName: sql<string>`concat(${students.firstName}, ' ', coalesce(${students.lastName}, ''))`, admissionNumber: students.admissionNumber }).from(studentFeeAssignments).innerJoin(students, eq(students.id, studentFeeAssignments.studentId)).where(eq(studentFeeAssignments.tenantId, tenantId)).orderBy(desc(studentFeeAssignments.createdAt)),
      tx.select({ id: studentInvoices.id, studentId: studentInvoices.studentId, enrollmentId: studentInvoices.enrollmentId, assignmentId: studentInvoices.assignmentId, installmentId: studentInvoices.installmentId, invoiceNumber: studentInvoices.invoiceNumber, title: studentInvoices.title, periodLabel: studentInvoices.periodLabel, amount: studentInvoices.amount, subtotalPaise: studentInvoices.subtotalPaise, concessionPaise: studentInvoices.concessionPaise, lateFeePaise: studentInvoices.lateFeePaise, totalPaise: studentInvoices.totalPaise, paidPaise: studentInvoices.paidPaise, balancePaise: studentInvoices.balancePaise, dueDate: studentInvoices.dueDate, status: studentInvoices.status, voidedAt: studentInvoices.voidedAt, studentName: sql<string>`concat(${students.firstName}, ' ', coalesce(${students.lastName}, ''))`, admissionNumber: students.admissionNumber }).from(studentInvoices).innerJoin(students, eq(students.id, studentInvoices.studentId)).where(eq(studentInvoices.tenantId, tenantId)).orderBy(desc(studentInvoices.dueDate)),
      tx.select({ id: paymentTransactions.id, invoiceId: paymentTransactions.invoiceId, studentId: paymentTransactions.studentId, amountPaise: paymentTransactions.amountPaise, paymentMethod: paymentTransactions.paymentMethod, paymentDate: paymentTransactions.paymentDate, referenceNumber: paymentTransactions.referenceNumber, status: paymentTransactions.status, createdAt: paymentTransactions.createdAt, studentName: sql<string>`concat(${students.firstName}, ' ', coalesce(${students.lastName}, ''))` }).from(paymentTransactions).innerJoin(students, eq(students.id, paymentTransactions.studentId)).where(eq(paymentTransactions.tenantId, tenantId)).orderBy(desc(paymentTransactions.createdAt)),
      tx.select().from(paymentReceipts).where(eq(paymentReceipts.tenantId, tenantId)).orderBy(desc(paymentReceipts.createdAt)),
      tx.select().from(financialAccounts).where(eq(financialAccounts.tenantId, tenantId)).orderBy(asc(financialAccounts.code)),
      tx.select().from(academicYears).where(eq(academicYears.tenantId, tenantId)).orderBy(desc(academicYears.startDate)),
      tx.select().from(academicClasses).where(eq(academicClasses.tenantId, tenantId)).orderBy(asc(academicClasses.displayOrder)),
      tx.select().from(classSections).where(eq(classSections.tenantId, tenantId)).orderBy(asc(classSections.name)),
    ]);
    return { categories, structures, items, plans, installments, assignments, invoices, payments, receipts, accounts, years, classes, sections };
  });
}

export async function createFeeStructure(tenantId: string, actorUserId: string, input: {
  academicYearId?: string | null;
  classId: string;
  name: string;
  frequency?: string;
  academicYear?: string;
  items: Array<{ categoryId: string; label: string; amountPaise: number; isOptional?: boolean; displayOrder?: number }>;
}) {
  await ensureFinanceDefaults(tenantId);
  return withTenant(tenantId, async (tx) => {
    if (input.items.length === 0) throw new Phase7Error("At least one fee line item is required.", 422);
    const totalAmountPaise = input.items.reduce((sum, item) => sum + item.amountPaise, 0);
    if (totalAmountPaise <= 0) throw new Phase7Error("Fee structure total must be greater than zero.", 422);
    const [year] = input.academicYearId ? await tx.select().from(academicYears).where(and(eq(academicYears.tenantId, tenantId), eq(academicYears.id, input.academicYearId))).limit(1) : [];
    const [structure] = await tx.insert(feeStructures).values({
      tenantId,
      academicYearId: input.academicYearId ?? null,
      classId: input.classId,
      name: input.name.trim(),
      amount: Math.round(totalAmountPaise / 100),
      amountPaise: totalAmountPaise,
      totalAmountPaise,
      frequency: input.frequency ?? "annual",
      academicYear: input.academicYear ?? year?.name ?? academicYearPrefix(),
    }).returning();
    await tx.insert(feeStructureItems).values(input.items.map((item, index) => ({
      tenantId,
      structureId: structure.id,
      categoryId: item.categoryId,
      label: item.label.trim(),
      amountPaise: item.amountPaise,
      isOptional: item.isOptional ?? false,
      displayOrder: item.displayOrder ?? index + 1,
    })));
    await writeAuditLog(tx, { tenantId, actorUserId, action: "finance.fee_structure.created", entityType: "fee_structure", entityId: structure.id, metadata: { totalAmountPaise } });
    return structure;
  });
}

export async function duplicateFeeStructure(tenantId: string, actorUserId: string, structureId: string, input: { academicYearId?: string | null; academicYear?: string; name?: string }) {
  return withTenant(tenantId, async (tx) => {
    const [source] = await tx.select().from(feeStructures).where(and(eq(feeStructures.tenantId, tenantId), eq(feeStructures.id, structureId))).limit(1);
    if (!source) throw new Phase7Error("Fee structure not found.", 404);
    const sourceItems = await tx.select().from(feeStructureItems).where(and(eq(feeStructureItems.tenantId, tenantId), eq(feeStructureItems.structureId, structureId)));
    const [year] = input.academicYearId ? await tx.select().from(academicYears).where(and(eq(academicYears.tenantId, tenantId), eq(academicYears.id, input.academicYearId))).limit(1) : [];
    const [copy] = await tx.insert(feeStructures).values({
      tenantId,
      academicYearId: input.academicYearId ?? null,
      classId: source.classId,
      name: input.name?.trim() || `${source.name} Copy`,
      amount: source.amount,
      amountPaise: source.amountPaise,
      totalAmountPaise: source.totalAmountPaise,
      frequency: source.frequency,
      academicYear: input.academicYear ?? year?.name ?? source.academicYear,
    }).returning();
    if (sourceItems.length) {
      await tx.insert(feeStructureItems).values(sourceItems.map((item) => ({
        tenantId,
        structureId: copy.id,
        categoryId: item.categoryId,
        label: item.label,
        amountPaise: item.amountPaise,
        isOptional: item.isOptional,
        displayOrder: item.displayOrder,
      })));
    }
    await writeAuditLog(tx, { tenantId, actorUserId, action: "finance.fee_structure.duplicated", entityType: "fee_structure", entityId: copy.id, metadata: { sourceId: structureId } });
    return copy;
  });
}

export async function createFeePlan(tenantId: string, input: {
  structureId: string;
  name: string;
  planType?: string;
  lateFeePerDayPaise?: number;
  gracePeriodDays?: number;
  isDefault?: boolean;
  installments: Array<{ label: string; dueDate: string; amountPaise: number; displayOrder?: number }>;
}) {
  return withTenant(tenantId, async (tx) => {
    const [structure] = await tx.select().from(feeStructures).where(and(eq(feeStructures.tenantId, tenantId), eq(feeStructures.id, input.structureId))).limit(1);
    if (!structure) throw new Phase7Error("Fee structure not found.", 404);
    const total = input.installments.reduce((sum, row) => sum + row.amountPaise, 0);
    if (total !== structure.totalAmountPaise) throw new Phase7Error("Fee plan installments must sum to the fee structure total.", 422);
    if (input.isDefault) await tx.update(feePlans).set({ isDefault: false }).where(and(eq(feePlans.tenantId, tenantId), eq(feePlans.structureId, input.structureId)));
    const [plan] = await tx.insert(feePlans).values({
      tenantId,
      structureId: input.structureId,
      name: input.name.trim(),
      planType: input.planType ?? "custom",
      lateFeePerDayPaise: input.lateFeePerDayPaise ?? 0,
      gracePeriodDays: input.gracePeriodDays ?? 0,
      isDefault: input.isDefault ?? false,
    }).returning();
    await tx.insert(feePlanInstallments).values(input.installments.map((installment, index) => ({
      tenantId,
      planId: plan.id,
      label: installment.label.trim(),
      dueDate: installment.dueDate,
      amountPaise: installment.amountPaise,
      displayOrder: installment.displayOrder ?? index + 1,
    })));
    return plan;
  });
}

export async function assignFeePlanToClass(tenantId: string, actorUserId: string, input: {
  academicYearId: string;
  classId: string;
  sectionId?: string | null;
  structureId: string;
  planId: string;
  concessionType?: string | null;
  concessionAmountPaise?: number;
  concessionNote?: string | null;
}) {
  return withTenant(tenantId, async (tx) => {
    const [structure] = await tx.select().from(feeStructures).where(and(eq(feeStructures.tenantId, tenantId), eq(feeStructures.id, input.structureId))).limit(1);
    if (!structure) throw new Phase7Error("Fee structure not found.", 404);
    const concession = input.concessionAmountPaise ?? 0;
    if (concession > structure.totalAmountPaise) throw new Phase7Error("Concession cannot exceed structure total.", 422);
    const enrollments = await tx.select({ studentId: studentEnrollments.studentId }).from(studentEnrollments).where(and(
      eq(studentEnrollments.tenantId, tenantId),
      eq(studentEnrollments.academicYearId, input.academicYearId),
      eq(studentEnrollments.classId, input.classId),
      input.sectionId ? eq(studentEnrollments.sectionId, input.sectionId) : undefined,
      eq(studentEnrollments.enrollmentStatus, "active"),
    ));
    let created = 0;
    for (const enrollment of enrollments) {
      const rows = await tx.insert(studentFeeAssignments).values({
        tenantId,
        studentId: enrollment.studentId,
        academicYearId: input.academicYearId,
        structureId: input.structureId,
        planId: input.planId,
        concessionType: input.concessionType ?? null,
        concessionAmountPaise: concession,
        concessionNote: input.concessionNote ?? null,
        netAmountPaise: structure.totalAmountPaise - concession,
        assignedBy: actorUserId,
      }).onConflictDoNothing({
        target: [studentFeeAssignments.studentId, studentFeeAssignments.academicYearId],
      }).returning();
      created += rows.length;
    }
    await writeAuditLog(tx, { tenantId, actorUserId, action: "finance.fee_assignments.bulk_created", entityType: "fee_plan", entityId: input.planId, metadata: { created, skipped: enrollments.length - created } });
    return { created, skipped: enrollments.length - created };
  });
}

async function nextInvoiceNumber(tx: TenantTransaction, tenantId: string, yearName?: string | null) {
  await tx.insert(invoiceSequences).values({ tenantId, lastNumber: 0 }).onConflictDoNothing();
  const [row] = await tx.update(invoiceSequences)
    .set({ lastNumber: sql<number>`${invoiceSequences.lastNumber} + 1` })
    .where(eq(invoiceSequences.tenantId, tenantId))
    .returning({ lastNumber: invoiceSequences.lastNumber });
  return `INV-${academicYearPrefix(yearName)}-${String(row.lastNumber).padStart(5, "0")}`;
}

async function nextReceiptNumber(tx: TenantTransaction, tenantId: string, date: string) {
  await tx.insert(receiptSequences).values({ tenantId, lastNumber: 0 }).onConflictDoNothing();
  const [row] = await tx.update(receiptSequences)
    .set({ lastNumber: sql<number>`${receiptSequences.lastNumber} + 1` })
    .where(eq(receiptSequences.tenantId, tenantId))
    .returning({ lastNumber: receiptSequences.lastNumber });
  return `RCT-${date.slice(0, 4)}-${String(row.lastNumber).padStart(5, "0")}`;
}

export async function generateInvoices(tenantId: string, actorUserId: string | null, input: { academicYearId: string; assignmentId?: string | null }) {
  return withTenant(tenantId, async (tx) => {
    const [year] = await tx.select().from(academicYears).where(and(eq(academicYears.tenantId, tenantId), eq(academicYears.id, input.academicYearId))).limit(1);
    const assignments = await tx.select({
      id: studentFeeAssignments.id,
      studentId: studentFeeAssignments.studentId,
      academicYearId: studentFeeAssignments.academicYearId,
      structureId: studentFeeAssignments.structureId,
      planId: studentFeeAssignments.planId,
      concessionAmountPaise: studentFeeAssignments.concessionAmountPaise,
      netAmountPaise: studentFeeAssignments.netAmountPaise,
      structureTotal: feeStructures.totalAmountPaise,
      structureName: feeStructures.name,
    }).from(studentFeeAssignments)
      .innerJoin(feeStructures, eq(feeStructures.id, studentFeeAssignments.structureId))
      .where(and(
        eq(studentFeeAssignments.tenantId, tenantId),
        eq(studentFeeAssignments.academicYearId, input.academicYearId),
        input.assignmentId ? eq(studentFeeAssignments.id, input.assignmentId) : undefined,
      ));
    let created = 0;
    let skipped = 0;
    const invoiceNumbers: string[] = [];
    for (const assignment of assignments) {
      const enrollment = await tx.select().from(studentEnrollments).where(and(
        eq(studentEnrollments.tenantId, tenantId),
        eq(studentEnrollments.studentId, assignment.studentId),
        eq(studentEnrollments.academicYearId, assignment.academicYearId),
        eq(studentEnrollments.enrollmentStatus, "active"),
      )).limit(1);
      if (!enrollment[0]) {
        skipped += 1;
        continue;
      }
      const installments = await tx.select().from(feePlanInstallments).where(and(eq(feePlanInstallments.tenantId, tenantId), eq(feePlanInstallments.planId, assignment.planId))).orderBy(asc(feePlanInstallments.displayOrder));
      for (const installment of installments) {
        const existing = await tx.select({ id: studentInvoices.id }).from(studentInvoices).where(and(eq(studentInvoices.tenantId, tenantId), eq(studentInvoices.assignmentId, assignment.id), eq(studentInvoices.installmentId, installment.id), isNull(studentInvoices.voidedAt))).limit(1);
        if (existing[0]) {
          skipped += 1;
          continue;
        }
        const concessionShare = assignment.structureTotal > 0 ? Math.round((installment.amountPaise / assignment.structureTotal) * assignment.concessionAmountPaise) : 0;
        const totalPaise = Math.max(installment.amountPaise - concessionShare, 0);
        const invoiceNumber = await nextInvoiceNumber(tx, tenantId, year?.name);
        await tx.insert(studentInvoices).values({
          tenantId,
          studentId: assignment.studentId,
          enrollmentId: enrollment[0].id,
          assignmentId: assignment.id,
          installmentId: installment.id,
          invoiceNumber,
          title: `${assignment.structureName} - ${installment.label}`,
          periodLabel: installment.label,
          amount: Math.round(totalPaise / 100),
          subtotalPaise: installment.amountPaise,
          concessionPaise: concessionShare,
          lateFeePaise: 0,
          totalPaise,
          paidPaise: 0,
          balancePaise: totalPaise,
          dueDate: installment.dueDate,
          status: invoiceStatus(totalPaise, 0, String(installment.dueDate)),
        });
        invoiceNumbers.push(invoiceNumber);
        created += 1;
      }
    }
    if (actorUserId) await writeAuditLog(tx, { tenantId, actorUserId, action: "finance.invoices.generated", entityType: "academic_year", entityId: input.academicYearId, metadata: { created, skipped, invoiceNumbers } });
    return { created, skipped, invoiceNumbers };
  });
}

export async function getInvoiceDetail(tenantId: string, invoiceId: string) {
  return withTenant(tenantId, async (tx) => {
    const [invoice] = await tx.select({
      id: studentInvoices.id,
      studentId: studentInvoices.studentId,
      assignmentId: studentInvoices.assignmentId,
      invoiceNumber: studentInvoices.invoiceNumber,
      title: studentInvoices.title,
      periodLabel: studentInvoices.periodLabel,
      subtotalPaise: studentInvoices.subtotalPaise,
      concessionPaise: studentInvoices.concessionPaise,
      lateFeePaise: studentInvoices.lateFeePaise,
      totalPaise: studentInvoices.totalPaise,
      paidPaise: studentInvoices.paidPaise,
      balancePaise: studentInvoices.balancePaise,
      dueDate: studentInvoices.dueDate,
      status: studentInvoices.status,
      voidedAt: studentInvoices.voidedAt,
      studentName: sql<string>`concat(${students.firstName}, ' ', coalesce(${students.lastName}, ''))`,
      admissionNumber: students.admissionNumber,
    }).from(studentInvoices).innerJoin(students, eq(students.id, studentInvoices.studentId)).where(and(eq(studentInvoices.tenantId, tenantId), eq(studentInvoices.id, invoiceId))).limit(1);
    if (!invoice) return null;
    const assignment = invoice.assignmentId ? await tx.select({ structureId: studentFeeAssignments.structureId, planId: studentFeeAssignments.planId }).from(studentFeeAssignments).where(and(eq(studentFeeAssignments.tenantId, tenantId), eq(studentFeeAssignments.id, invoice.assignmentId))).limit(1) : [];
    const lineItems = assignment[0] ? await tx.select({ label: feeStructureItems.label, amountPaise: feeStructureItems.amountPaise, isOptional: feeStructureItems.isOptional, category: feeCategories.name }).from(feeStructureItems).innerJoin(feeCategories, eq(feeCategories.id, feeStructureItems.categoryId)).where(and(eq(feeStructureItems.tenantId, tenantId), eq(feeStructureItems.structureId, assignment[0].structureId))).orderBy(asc(feeStructureItems.displayOrder)) : [];
    const payments = await tx.select({ id: paymentTransactions.id, amountPaise: paymentTransactions.amountPaise, paymentDate: paymentTransactions.paymentDate, paymentMethod: paymentTransactions.paymentMethod, referenceNumber: paymentTransactions.referenceNumber, status: paymentTransactions.status, receiptNumber: paymentReceipts.receiptNumber, pdfUrl: paymentReceipts.pdfUrl }).from(paymentTransactions).leftJoin(paymentReceipts, eq(paymentReceipts.transactionId, paymentTransactions.id)).where(and(eq(paymentTransactions.tenantId, tenantId), eq(paymentTransactions.invoiceId, invoiceId))).orderBy(desc(paymentTransactions.createdAt));
    return { invoice, lineItems, payments };
  });
}

export async function voidInvoice(tenantId: string, actorUserId: string, invoiceId: string, reason: string) {
  return withTenant(tenantId, async (tx) => {
    const [completed] = await tx.select({ value: count() }).from(paymentTransactions).where(and(eq(paymentTransactions.tenantId, tenantId), eq(paymentTransactions.invoiceId, invoiceId), eq(paymentTransactions.status, "completed")));
    if ((completed?.value ?? 0) > 0) throw new Phase7Error("Cannot void invoice with recorded payments.", 409);
    const [invoice] = await tx.update(studentInvoices).set({ status: "voided", voidedAt: new Date(), voidBy: actorUserId, voidReason: reason.trim(), balancePaise: 0, updatedAt: new Date() }).where(and(eq(studentInvoices.tenantId, tenantId), eq(studentInvoices.id, invoiceId))).returning();
    if (!invoice) throw new Phase7Error("Invoice not found.", 404);
    await writeAuditLog(tx, { tenantId, actorUserId, action: "finance.invoice.voided", entityType: "student_invoice", entityId: invoiceId, metadata: { reason } });
    return invoice;
  });
}

function calculateLateFee(invoice: { dueDate: string | Date; lateFeePaise: number; balancePaise: number | null }, plan: { lateFeePerDayPaise: number; gracePeriodDays: number } | undefined, paymentDate: string) {
  if (!plan || plan.lateFeePerDayPaise <= 0) return invoice.lateFeePaise;
  const due = new Date(String(invoice.dueDate));
  const paid = new Date(paymentDate);
  const days = Math.floor((paid.getTime() - due.getTime()) / 86400000);
  const chargeableDays = Math.max(days - plan.gracePeriodDays, 0);
  if (chargeableDays <= 0 || (invoice.balancePaise ?? 0) <= 0) return invoice.lateFeePaise;
  return chargeableDays * plan.lateFeePerDayPaise;
}

function pdfBytesFromText(text: string) {
  const lines = text.split("\n").slice(0, 42);
  const escaped = lines.map((line) => line.replace(/[\\()]/g, "\\$&"));
  const content = `BT /F1 12 Tf 48 780 Td ${escaped.map((line, index) => `${index ? "0 -18 Td " : ""}(${line}) Tj`).join(" ")} ET`;
  const stream = Buffer.from(content, "utf8");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${stream.length} >> stream\n${content}\nendstream endobj`,
  ];
  let offset = "%PDF-1.4\n".length;
  const xref = ["0000000000 65535 f "];
  for (const obj of objects) {
    xref.push(`${String(offset).padStart(10, "0")} 00000 n `);
    offset += Buffer.byteLength(`${obj}\n`);
  }
  const body = objects.join("\n") + "\n";
  const trailer = `xref\n0 ${objects.length + 1}\n${xref.join("\n")}\ntrailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF`;
  return Buffer.from(`%PDF-1.4\n${body}${trailer}`, "utf8");
}

async function writeReceiptPdf(tenantId: string, receiptNumber: string, text: string) {
  const dir = path.join(process.cwd(), "generated-files", tenantId, "receipts");
  await mkdir(dir, { recursive: true });
  const fileName = `${receiptNumber}.pdf`;
  await writeFile(path.join(dir, fileName), pdfBytesFromText(text));
  return `/generated-files/${tenantId}/receipts/${fileName}`;
}

async function getFeeIncomeAccountId(tx: TenantTransaction, tenantId: string) {
  const [account] = await tx.select().from(financialAccounts).where(and(eq(financialAccounts.tenantId, tenantId), eq(financialAccounts.code, "4000"))).limit(1);
  if (!account) throw new Phase7Error("Fee income account is not configured.", 500);
  return account.id;
}

export async function recordPayment(tenantId: string, actorUserId: string, input: {
  invoiceId: string;
  amountPaise: number;
  paymentMethod: string;
  paymentDate: string;
  referenceNumber?: string | null;
  bankName?: string | null;
  gatewayPayload?: unknown;
}) {
  await ensureFinanceDefaults(tenantId);
  return withTenant(tenantId, async (tx) => {
    if (input.referenceNumber) {
      const duplicate = await tx.select({ id: paymentTransactions.id }).from(paymentTransactions).where(and(eq(paymentTransactions.tenantId, tenantId), eq(paymentTransactions.referenceNumber, input.referenceNumber), eq(paymentTransactions.status, "completed"))).limit(1);
      if (duplicate[0]) return { duplicate: true, payment: duplicate[0] };
    }
    const [invoice] = await tx.select().from(studentInvoices).where(and(eq(studentInvoices.tenantId, tenantId), eq(studentInvoices.id, input.invoiceId), isNull(studentInvoices.voidedAt))).limit(1);
    if (!invoice) throw new Phase7Error("Invoice not found or voided.", 404);
    const balance = invoice.balancePaise ?? Math.max((invoice.totalPaise ?? invoice.amount * 100) - invoice.paidPaise, 0);
    if (input.amountPaise <= 0) throw new Phase7Error("Payment amount must be greater than zero.", 422);
    if (input.amountPaise > balance) {
      throw new Phase7Error(`Payment amount (${formatCurrency(input.amountPaise)}) exceeds balance (${formatCurrency(balance)}).`, 422);
    }
    const assignment = invoice.assignmentId ? await tx.select({ planId: studentFeeAssignments.planId }).from(studentFeeAssignments).where(and(eq(studentFeeAssignments.tenantId, tenantId), eq(studentFeeAssignments.id, invoice.assignmentId))).limit(1) : [];
    const plan = assignment[0] ? await tx.select({ lateFeePerDayPaise: feePlans.lateFeePerDayPaise, gracePeriodDays: feePlans.gracePeriodDays }).from(feePlans).where(and(eq(feePlans.tenantId, tenantId), eq(feePlans.id, assignment[0].planId))).limit(1) : [];
    const lateFeePaise = calculateLateFee(invoice, plan[0], input.paymentDate);
    const totalPaise = (invoice.subtotalPaise ?? invoice.totalPaise ?? invoice.amount * 100) - invoice.concessionPaise + lateFeePaise;
    const newPaid = invoice.paidPaise + input.amountPaise;
    const newBalance = Math.max(totalPaise - newPaid, 0);
    const [payment] = await tx.insert(paymentTransactions).values({
      tenantId,
      invoiceId: invoice.id,
      studentId: invoice.studentId,
      amountPaise: input.amountPaise,
      paymentMethod: input.paymentMethod,
      paymentDate: input.paymentDate,
      referenceNumber: input.referenceNumber ?? null,
      bankName: input.bankName ?? null,
      status: "completed",
      gatewayPayload: input.gatewayPayload ?? null,
      collectedBy: actorUserId,
    }).returning();
    const receiptNumber = await nextReceiptNumber(tx, tenantId, input.paymentDate);
    const [receipt] = await tx.insert(paymentReceipts).values({
      tenantId,
      transactionId: payment.id,
      receiptNumber,
      status: "pending",
    }).returning();
    await tx.update(studentInvoices).set({
      lateFeePaise,
      totalPaise,
      paidPaise: newPaid,
      balancePaise: newBalance,
      status: invoiceStatus(totalPaise, newPaid, String(invoice.dueDate)),
      updatedAt: new Date(),
    }).where(and(eq(studentInvoices.tenantId, tenantId), eq(studentInvoices.id, invoice.id)));
    const accountId = await getFeeIncomeAccountId(tx, tenantId);
    await tx.insert(financialTransactions).values({
      tenantId,
      type: "credit",
      amount: Math.round(input.amountPaise / 100),
      date: input.paymentDate,
      accountId,
      transactionType: "income",
      amountPaise: input.amountPaise,
      transactionDate: input.paymentDate,
      description: `Fee payment - ${invoice.invoiceNumber ?? invoice.title}`,
      reference: receiptNumber,
      invoiceId: invoice.id,
      paymentTransactionId: payment.id,
      category: "fees",
      source: "fee_payment",
      sourceId: payment.id,
      createdBy: actorUserId,
    });
    await writeAuditLog(tx, { tenantId, actorUserId, action: "finance.payment.recorded", entityType: "payment_transaction", entityId: payment.id, metadata: { invoiceId: invoice.id, amountPaise: input.amountPaise, receiptNumber } });
    const tenant = await tx.select({ name: tenants.name, address: tenants.address }).from(tenants).where(eq(tenants.id, tenantId)).limit(1);
    const student = await tx.select({ name: sql<string>`concat(${students.firstName}, ' ', coalesce(${students.lastName}, ''))`, admissionNumber: students.admissionNumber }).from(students).where(and(eq(students.tenantId, tenantId), eq(students.id, invoice.studentId))).limit(1);
    const pdfText = [
      tenant[0]?.name ?? "School",
      "FEE RECEIPT",
      `Receipt: ${receiptNumber}`,
      `Date: ${input.paymentDate}`,
      `Received from: ${student[0]?.name ?? invoice.studentId}`,
      `Admission no: ${student[0]?.admissionNumber ?? "-"}`,
      `Invoice: ${invoice.invoiceNumber ?? invoice.title}`,
      `Amount: ${formatCurrency(input.amountPaise)}`,
      `Amount in words: ${amountToWords(input.amountPaise)}`,
      `Payment method: ${input.paymentMethod}`,
      `Reference: ${input.referenceNumber ?? "-"}`,
      "",
      "Cashier / Accountant Signature",
      "This is a computer-generated receipt.",
    ].join("\n");
    const pdfUrl = await writeReceiptPdf(tenantId, receiptNumber, pdfText);
    const [updatedReceipt] = await tx.update(paymentReceipts).set({ pdfUrl, status: "generated", generatedAt: new Date(), updatedAt: new Date() }).where(and(eq(paymentReceipts.tenantId, tenantId), eq(paymentReceipts.id, receipt.id))).returning();
    return { payment, receipt: updatedReceipt, newBalance };
  });
}

export async function recordExpense(tenantId: string, actorUserId: string, input: { accountId: string; amountPaise: number; date: string; description: string; reference?: string | null; receiptPhotoUrl?: string | null }) {
  await ensureFinanceDefaults(tenantId);
  return withTenant(tenantId, async (tx) => {
    const [account] = await tx.select().from(financialAccounts).where(and(eq(financialAccounts.tenantId, tenantId), eq(financialAccounts.id, input.accountId), eq(financialAccounts.type, "expense"))).limit(1);
    if (!account) throw new Phase7Error("Expense account not found.", 404);
    const [transaction] = await tx.insert(financialTransactions).values({
      tenantId,
      type: "debit",
      amount: Math.round(input.amountPaise / 100),
      date: input.date,
      accountId: input.accountId,
      transactionType: "expense",
      amountPaise: input.amountPaise,
      transactionDate: input.date,
      description: input.description.trim(),
      reference: input.reference ?? null,
      category: account.name,
      source: "manual_expense",
      receiptPhotoUrl: input.receiptPhotoUrl ?? null,
      createdBy: actorUserId,
    }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "finance.expense.recorded", entityType: "financial_transaction", entityId: transaction.id, metadata: { amountPaise: input.amountPaise, accountId: input.accountId } });
    return transaction;
  });
}

export async function createFinancialAccount(tenantId: string, input: { code: string; name: string; type: string; parentId?: string | null }) {
  return withTenant(tenantId, async (tx) => {
    const [account] = await tx.insert(financialAccounts).values({ tenantId, code: input.code.trim(), name: input.name.trim(), type: input.type, parentId: input.parentId ?? null }).returning();
    return account;
  });
}

export async function deleteFinancialAccount(tenantId: string, accountId: string) {
  return withTenant(tenantId, async (tx) => {
    const [used] = await tx.select({ value: count() }).from(financialTransactions).where(and(eq(financialTransactions.tenantId, tenantId), eq(financialTransactions.accountId, accountId)));
    if ((used?.value ?? 0) > 0) throw new Phase7Error("Cannot delete an account with transactions.", 409);
    const [account] = await tx.delete(financialAccounts).where(and(eq(financialAccounts.tenantId, tenantId), eq(financialAccounts.id, accountId), eq(financialAccounts.isSystem, false))).returning();
    if (!account) throw new Phase7Error("Account not found or system account cannot be deleted.", 404);
    return account;
  });
}

export async function getAccountingSummary(tenantId: string, input: { from?: string; to?: string; type?: "income" | "expense" | "all" }) {
  await ensureFinanceDefaults(tenantId);
  return withTenant(tenantId, async (tx) => {
    const rows = await tx.select({
      accountId: financialAccounts.id,
      accountCode: financialAccounts.code,
      accountName: financialAccounts.name,
      type: financialAccounts.type,
      totalPaise: sql<number>`coalesce(sum(${financialTransactions.amountPaise}), 0)::int`,
    }).from(financialTransactions)
      .innerJoin(financialAccounts, eq(financialAccounts.id, financialTransactions.accountId))
      .where(and(
        eq(financialTransactions.tenantId, tenantId),
        input.type && input.type !== "all" ? eq(financialTransactions.transactionType, input.type) : undefined,
        input.from ? gte(financialTransactions.transactionDate, input.from) : undefined,
        input.to ? lte(financialTransactions.transactionDate, input.to) : undefined,
      ))
      .groupBy(financialAccounts.id)
      .orderBy(asc(financialAccounts.code));
    const incomePaise = rows.filter((row) => row.type === "income").reduce((sum, row) => sum + Number(row.totalPaise), 0);
    const expensePaise = rows.filter((row) => row.type === "expense").reduce((sum, row) => sum + Number(row.totalPaise), 0);
    return { accounts: rows, totalPaise: input.type === "expense" ? expensePaise : input.type === "income" ? incomePaise : incomePaise + expensePaise, incomePaise, expensePaise, netPaise: incomePaise - expensePaise };
  });
}

export async function getStudentFeesSummary(tenantId: string, studentId: string) {
  return withTenant(tenantId, async (tx) => {
    const assignments = await tx.select({ id: studentFeeAssignments.id, netAmountPaise: studentFeeAssignments.netAmountPaise, concessionAmountPaise: studentFeeAssignments.concessionAmountPaise, planName: feePlans.name, structureName: feeStructures.name, academicYear: academicYears.name }).from(studentFeeAssignments)
      .innerJoin(feePlans, eq(feePlans.id, studentFeeAssignments.planId))
      .innerJoin(feeStructures, eq(feeStructures.id, studentFeeAssignments.structureId))
      .innerJoin(academicYears, eq(academicYears.id, studentFeeAssignments.academicYearId))
      .where(and(eq(studentFeeAssignments.tenantId, tenantId), eq(studentFeeAssignments.studentId, studentId)))
      .orderBy(desc(studentFeeAssignments.createdAt));
    const invoices = await tx.select().from(studentInvoices).where(and(eq(studentInvoices.tenantId, tenantId), eq(studentInvoices.studentId, studentId))).orderBy(desc(studentInvoices.dueDate));
    const receipts = await tx.select({ id: paymentReceipts.id, receiptNumber: paymentReceipts.receiptNumber, pdfUrl: paymentReceipts.pdfUrl, status: paymentReceipts.status, generatedAt: paymentReceipts.generatedAt, amountPaise: paymentTransactions.amountPaise, paymentDate: paymentTransactions.paymentDate }).from(paymentReceipts)
      .innerJoin(paymentTransactions, eq(paymentTransactions.id, paymentReceipts.transactionId))
      .where(and(eq(paymentReceipts.tenantId, tenantId), eq(paymentTransactions.studentId, studentId)))
      .orderBy(desc(paymentReceipts.createdAt));
    const totalPaise = invoices.reduce((sum, invoice) => sum + (invoice.totalPaise ?? invoice.amount * 100), 0);
    const paidPaise = invoices.reduce((sum, invoice) => sum + invoice.paidPaise, 0);
    const outstandingPaise = invoices.reduce((sum, invoice) => sum + (invoice.balancePaise ?? Math.max((invoice.totalPaise ?? invoice.amount * 100) - invoice.paidPaise, 0)), 0);
    return { assignments, invoices, receipts, summary: { totalPaise, paidPaise, outstandingPaise } };
  });
}

export async function getCollectionsSummary(tenantId: string, input: { from?: string; to?: string }) {
  const from = input.from ?? today();
  const to = input.to ?? from;
  return withTenant(tenantId, async (tx) => {
    const rows = await tx.select({ id: paymentTransactions.id, amountPaise: paymentTransactions.amountPaise, paymentMethod: paymentTransactions.paymentMethod, paymentDate: paymentTransactions.paymentDate, referenceNumber: paymentTransactions.referenceNumber, receiptNumber: paymentReceipts.receiptNumber, studentName: sql<string>`concat(${students.firstName}, ' ', coalesce(${students.lastName}, ''))`, invoiceNumber: studentInvoices.invoiceNumber, collector: users.name }).from(paymentTransactions)
      .innerJoin(students, eq(students.id, paymentTransactions.studentId))
      .innerJoin(studentInvoices, eq(studentInvoices.id, paymentTransactions.invoiceId))
      .leftJoin(paymentReceipts, eq(paymentReceipts.transactionId, paymentTransactions.id))
      .leftJoin(users, eq(users.id, paymentTransactions.collectedBy))
      .where(and(eq(paymentTransactions.tenantId, tenantId), gte(paymentTransactions.paymentDate, from), lte(paymentTransactions.paymentDate, to), eq(paymentTransactions.status, "completed")))
      .orderBy(desc(paymentTransactions.createdAt));
    const totalPaise = rows.reduce((sum, row) => sum + row.amountPaise, 0);
    const byMethod = rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.paymentMethod] = (acc[row.paymentMethod] ?? 0) + row.amountPaise;
      return acc;
    }, {});
    return { from, to, totalPaise, byMethod, rows };
  });
}

export async function getOverdueInvoices(tenantId: string) {
  return withTenant(tenantId, async (tx) =>
    tx.select({ id: studentInvoices.id, invoiceNumber: studentInvoices.invoiceNumber, title: studentInvoices.title, dueDate: studentInvoices.dueDate, totalPaise: studentInvoices.totalPaise, paidPaise: studentInvoices.paidPaise, balancePaise: studentInvoices.balancePaise, lateFeePaise: studentInvoices.lateFeePaise, status: studentInvoices.status, daysOverdue: sql<number>`greatest((current_date - ${studentInvoices.dueDate}), 0)::int`, studentName: sql<string>`concat(${students.firstName}, ' ', coalesce(${students.lastName}, ''))`, admissionNumber: students.admissionNumber }).from(studentInvoices)
      .innerJoin(students, eq(students.id, studentInvoices.studentId))
      .where(and(eq(studentInvoices.tenantId, tenantId), lte(studentInvoices.dueDate, today()), sql`${studentInvoices.balancePaise} > 0`, isNull(studentInvoices.voidedAt)))
      .orderBy(asc(studentInvoices.dueDate)),
  );
}
