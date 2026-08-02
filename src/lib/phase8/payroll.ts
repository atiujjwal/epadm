import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { and, asc, desc, eq, gte, isNull, lte, or } from "drizzle-orm";
import {
  auditLogs,
  financialAccounts,
  financialTransactions,
  payrollComponentAssignments,
  payrollComponents,
  payrollRunEntries,
  payrollRunEntryLines,
  payrollRuns,
  payrollSettings,
  payslips,
  staffLoans,
  staffProfiles,
  tenants,
} from "@/lib/db";
import { amountToWords, formatCurrency, toMinorUnit, ensureFinanceDefaults } from "@/lib/phase7/finance";
import { type TenantTransaction, withTenant } from "@/lib/rls";

export class Phase8Error extends Error {
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

export function phase8ApiError(error: unknown) {
  if (error instanceof Phase8Error) return Response.json({ error: error.message }, { status: error.status });
  if (/23505|duplicate key|unique constraint/i.test(errorText(error))) {
    return Response.json({ error: "A conflicting Phase 8 record already exists." }, { status: 409 });
  }
  return Response.json({ error: "Phase 8 request failed" }, { status: 500 });
}

export { amountToWords, formatCurrency, toMinorUnit };

type PayrollComponentSeed = {
  name: string;
  code: string;
  componentType: string;
  calcType: string;
  defaultValue?: string;
  isPfApplicable?: boolean;
  isTaxable?: boolean;
  displayOrder: number;
};

export const DEFAULT_PAYROLL_COMPONENTS: PayrollComponentSeed[] = [
  { name: "Basic Salary", code: "BASIC", componentType: "earning", calcType: "fixed", isPfApplicable: true, isTaxable: true, displayOrder: 1 },
  { name: "House Rent Allowance", code: "HRA", componentType: "earning", calcType: "percent_of_basic", defaultValue: "40.0000", isTaxable: true, displayOrder: 2 },
  { name: "Dearness Allowance", code: "DA", componentType: "earning", calcType: "percent_of_basic", defaultValue: "20.0000", isPfApplicable: true, isTaxable: true, displayOrder: 3 },
  { name: "Transport Allowance", code: "TA", componentType: "earning", calcType: "fixed", defaultValue: "1600.0000", displayOrder: 4 },
  { name: "Special Allowance", code: "SPECIAL", componentType: "earning", calcType: "fixed", isTaxable: true, displayOrder: 5 },
  { name: "Medical Allowance", code: "MEDICAL", componentType: "earning", calcType: "fixed", displayOrder: 6 },
  { name: "PF Employee", code: "PF_EMP", componentType: "statutory_deduction", calcType: "percent_of_basic", defaultValue: "12.0000", displayOrder: 10 },
  { name: "ESI Employee", code: "ESI_EMP", componentType: "statutory_deduction", calcType: "percent_of_gross", defaultValue: "0.7500", displayOrder: 11 },
  { name: "Professional Tax", code: "PT", componentType: "statutory_deduction", calcType: "fixed", displayOrder: 12 },
  { name: "TDS", code: "TDS", componentType: "statutory_deduction", calcType: "fixed", displayOrder: 13 },
  { name: "PF Employer", code: "PF_EMP_ER", componentType: "employer_contribution", calcType: "percent_of_basic", defaultValue: "12.0000", displayOrder: 20 },
  { name: "ESI Employer", code: "ESI_EMP_ER", componentType: "employer_contribution", calcType: "percent_of_gross", defaultValue: "3.2500", displayOrder: 21 },
];

function toNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function rateBps(rate: unknown) {
  return Math.round(toNumber(rate) * 100);
}

function applyPercent(amountPaise: number, rate: unknown) {
  return Math.round((amountPaise * rateBps(rate)) / 10000);
}

function fixedValueToPaise(value: unknown) {
  return toMinorUnit(toNumber(value));
}

function runPeriod(runYear: number, runMonth: number) {
  const from = `${runYear}-${String(runMonth).padStart(2, "0")}-01`;
  const last = new Date(Date.UTC(runYear, runMonth, 0)).getUTCDate();
  const to = `${runYear}-${String(runMonth).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
  return { from, to };
}

function runLabel(runYear: number, runMonth: number) {
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(runYear, runMonth - 1, 1))) + " Payroll";
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

export async function ensurePayrollDefaults(tenantId: string) {
  return withTenant(tenantId, async (tx) => {
    for (const component of DEFAULT_PAYROLL_COMPONENTS) {
      await tx.insert(payrollComponents).values({ tenantId, ...component }).onConflictDoUpdate({
        target: [payrollComponents.tenantId, payrollComponents.code],
        set: {
          name: component.name,
          componentType: component.componentType,
          calcType: component.calcType,
          defaultValue: component.defaultValue ?? null,
          isPfApplicable: component.isPfApplicable ?? false,
          isTaxable: component.isTaxable ?? false,
          displayOrder: component.displayOrder,
          isActive: true,
          updatedAt: new Date(),
        },
      });
    }
    await tx.insert(payrollSettings).values({ tenantId }).onConflictDoNothing({ target: payrollSettings.tenantId });
    return { seeded: true };
  });
}

export async function listPayrollModel(tenantId: string) {
  await ensurePayrollDefaults(tenantId);
  return withTenant(tenantId, async (tx) => {
    const [settings] = await tx.select().from(payrollSettings).where(eq(payrollSettings.tenantId, tenantId)).limit(1);
    const [runs, components, assignments, entries, lines, loans, slipRows, staff] = await Promise.all([
      tx.select().from(payrollRuns).where(eq(payrollRuns.tenantId, tenantId)).orderBy(desc(payrollRuns.runYear), desc(payrollRuns.runMonth)),
      tx.select().from(payrollComponents).where(eq(payrollComponents.tenantId, tenantId)).orderBy(asc(payrollComponents.displayOrder)),
      tx.select({ id: payrollComponentAssignments.id, staffId: payrollComponentAssignments.staffId, componentId: payrollComponentAssignments.componentId, overrideValue: payrollComponentAssignments.overrideValue, effectiveFrom: payrollComponentAssignments.effectiveFrom, effectiveTo: payrollComponentAssignments.effectiveTo, isActive: payrollComponentAssignments.isActive, staffName: staffProfiles.fullName, employeeCode: staffProfiles.employeeCode }).from(payrollComponentAssignments).innerJoin(staffProfiles, eq(staffProfiles.id, payrollComponentAssignments.staffId)).where(eq(payrollComponentAssignments.tenantId, tenantId)).orderBy(desc(payrollComponentAssignments.effectiveFrom)),
      tx.select({ id: payrollRunEntries.id, runId: payrollRunEntries.runId, staffId: payrollRunEntries.staffId, grossPaise: payrollRunEntries.grossPaise, totalDeductionsPaise: payrollRunEntries.totalDeductionsPaise, netPaise: payrollRunEntries.netPaise, daysAbsent: payrollRunEntries.daysAbsent, staffName: staffProfiles.fullName, employeeCode: staffProfiles.employeeCode }).from(payrollRunEntries).innerJoin(staffProfiles, eq(staffProfiles.id, payrollRunEntries.staffId)).where(eq(payrollRunEntries.tenantId, tenantId)).orderBy(desc(payrollRunEntries.createdAt)),
      tx.select().from(payrollRunEntryLines).where(eq(payrollRunEntryLines.tenantId, tenantId)),
      tx.select({ id: staffLoans.id, staffId: staffLoans.staffId, loanType: staffLoans.loanType, principalPaise: staffLoans.principalPaise, outstandingPaise: staffLoans.outstandingPaise, emiPaise: staffLoans.emiPaise, status: staffLoans.status, startDate: staffLoans.startDate, staffName: staffProfiles.fullName, employeeCode: staffProfiles.employeeCode }).from(staffLoans).innerJoin(staffProfiles, eq(staffProfiles.id, staffLoans.staffId)).where(eq(staffLoans.tenantId, tenantId)).orderBy(desc(staffLoans.createdAt)),
      tx.select().from(payslips).where(eq(payslips.tenantId, tenantId)).orderBy(desc(payslips.createdAt)),
      tx.select().from(staffProfiles).where(eq(staffProfiles.tenantId, tenantId)).orderBy(asc(staffProfiles.fullName)),
    ]);
    return { settings, runs, components, assignments, entries, lines, loans, payslips: slipRows, staff };
  });
}

export async function savePayrollSettings(tenantId: string, input: Partial<typeof payrollSettings.$inferInsert>) {
  await ensurePayrollDefaults(tenantId);
  return withTenant(tenantId, async (tx) => {
    const safe = { ...input, tenantId, updatedAt: new Date() };
    const [settings] = await tx.insert(payrollSettings).values(safe).onConflictDoUpdate({
      target: payrollSettings.tenantId,
      set: safe,
    }).returning();
    return settings;
  });
}

export async function saveSalaryAssignments(tenantId: string, staffId: string, input: { effectiveFrom: string; components: Array<{ code: string; overrideValue?: string | number | null }> }) {
  await ensurePayrollDefaults(tenantId);
  return withTenant(tenantId, async (tx) => {
    const staff = await tx.query.staffProfiles.findFirst({ where: and(eq(staffProfiles.tenantId, tenantId), eq(staffProfiles.id, staffId)) });
    if (!staff) throw new Phase8Error("Staff member not found.", 404);
    const components = await tx.select().from(payrollComponents).where(eq(payrollComponents.tenantId, tenantId));
    const byCode = new Map(components.map((component) => [component.code, component]));
    const rows = [];
    for (const item of input.components) {
      const component = byCode.get(item.code);
      if (!component) throw new Phase8Error(`Payroll component ${item.code} not found.`, 404);
      const [row] = await tx.insert(payrollComponentAssignments).values({
        tenantId,
        staffId,
        componentId: component.id,
        overrideValue: item.overrideValue == null || item.overrideValue === "" ? null : String(item.overrideValue),
        effectiveFrom: input.effectiveFrom,
      }).onConflictDoUpdate({
        target: [payrollComponentAssignments.staffId, payrollComponentAssignments.componentId, payrollComponentAssignments.effectiveFrom],
        set: { overrideValue: item.overrideValue == null || item.overrideValue === "" ? null : String(item.overrideValue), isActive: true, updatedAt: new Date() },
      }).returning();
      rows.push(row);
    }
    return rows;
  });
}

export type ComputedPayrollLine = {
  componentCode: string;
  componentName: string;
  componentType: string;
  calcType: string;
  baseValuePaise: number | null;
  rate: string | null;
  amountPaise: number;
  componentId?: string | null;
};

export function computePayrollAmounts(input: {
  settings: {
    pfEnabled?: boolean;
    pfEmployeeRate?: string | number;
    pfEmployerRate?: string | number;
    esiEnabled?: boolean;
    esiEmployeeRate?: string | number;
    esiEmployerRate?: string | number;
    esiGrossCeilingPaise?: number;
    ptEnabled?: boolean;
    ptMonthlyPaise?: number;
    ptThresholdPaise?: number;
    standardWorkingDays?: number;
  };
  components: Array<{ id?: string; code: string; name: string; componentType: string; calcType: string; defaultValue?: string | null; isPfApplicable?: boolean; displayOrder?: number }>;
  assignments: Array<{ componentId: string; overrideValue?: string | null }>;
  loans?: Array<{ emiPaise: number; outstandingPaise: number }>;
  daysAbsent?: number;
  workingDays?: number;
}) {
  const assignmentByComponent = new Map(input.assignments.map((row) => [row.componentId, row]));
  const components = [...input.components].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  const lines: ComputedPayrollLine[] = [];
  const workingDays = Math.max(input.workingDays ?? input.settings.standardWorkingDays ?? 26, 1);
  const daysAbsent = Math.max(input.daysAbsent ?? 0, 0);
  let grossPaise = 0;
  let basicPaise = 0;
  let basicBasePaise = 0;
  let pfBasePaise = 0;
  let tdsPaise = 0;

  for (const component of components.filter((row) => row.componentType === "earning")) {
    const assignment = component.id ? assignmentByComponent.get(component.id) : undefined;
    if (!assignment && component.code === "BASIC") continue;
    const value = assignment?.overrideValue ?? component.defaultValue ?? "0";
    let amountPaise = 0;
    let baseValuePaise: number | null = null;
    if (component.calcType === "fixed") {
      amountPaise = fixedValueToPaise(value);
      if (component.code === "BASIC") basicBasePaise = amountPaise;
    }
    if (component.calcType === "percent_of_basic") {
      baseValuePaise = basicBasePaise;
      amountPaise = applyPercent(basicBasePaise, value);
    }
    if (component.calcType === "percent_of_gross") {
      baseValuePaise = grossPaise;
      amountPaise = applyPercent(grossPaise, value);
    }
    if (daysAbsent > 0) amountPaise = Math.max(amountPaise - Math.round((amountPaise * daysAbsent) / workingDays), 0);
    if (component.code === "BASIC") basicPaise = amountPaise;
    if (component.isPfApplicable) pfBasePaise += amountPaise;
    grossPaise += amountPaise;
    lines.push({ componentId: component.id ?? null, componentCode: component.code, componentName: component.name, componentType: component.componentType, calcType: component.calcType, baseValuePaise, rate: component.calcType === "fixed" ? null : String(value), amountPaise });
  }

  const tdsComponent = components.find((row) => row.code === "TDS");
  const tdsAssignment = tdsComponent?.id ? assignmentByComponent.get(tdsComponent.id) : undefined;
  if (tdsAssignment?.overrideValue) tdsPaise = fixedValueToPaise(tdsAssignment.overrideValue);

  const pfEmployeePaise = input.settings.pfEnabled === false ? 0 : applyPercent(pfBasePaise || basicPaise, input.settings.pfEmployeeRate ?? 12);
  const pfEmployerPaise = input.settings.pfEnabled === false ? 0 : applyPercent(pfBasePaise || basicPaise, input.settings.pfEmployerRate ?? 12);
  const esiApplies = input.settings.esiEnabled !== false && grossPaise <= (input.settings.esiGrossCeilingPaise ?? 2100000);
  const esiEmployeePaise = esiApplies ? applyPercent(grossPaise, input.settings.esiEmployeeRate ?? 0.75) : 0;
  const esiEmployerPaise = esiApplies ? applyPercent(grossPaise, input.settings.esiEmployerRate ?? 3.25) : 0;
  const professionalTaxPaise = input.settings.ptEnabled === false || grossPaise < (input.settings.ptThresholdPaise ?? 1000000) ? 0 : input.settings.ptMonthlyPaise ?? 20000;
  const loanEmiPaise = (input.loans ?? []).reduce((sum, loan) => sum + Math.min(loan.emiPaise, loan.outstandingPaise), 0);
  const totalDeductionsPaise = pfEmployeePaise + esiEmployeePaise + professionalTaxPaise + tdsPaise + loanEmiPaise;
  const netPaise = grossPaise - totalDeductionsPaise;

  const statutory = [
    ["PF_EMP", "PF Employee", "statutory_deduction", "percent_of_basic", pfBasePaise || basicPaise, input.settings.pfEmployeeRate ?? 12, pfEmployeePaise],
    ["ESI_EMP", "ESI Employee", "statutory_deduction", "percent_of_gross", grossPaise, input.settings.esiEmployeeRate ?? 0.75, esiEmployeePaise],
    ["PT", "Professional Tax", "statutory_deduction", "fixed", grossPaise, null, professionalTaxPaise],
    ["TDS", "TDS", "statutory_deduction", "fixed", grossPaise, null, tdsPaise],
    ["LOAN_EMI", "Loan EMI", "deduction", "fixed", null, null, loanEmiPaise],
    ["PF_EMP_ER", "PF Employer", "employer_contribution", "percent_of_basic", pfBasePaise || basicPaise, input.settings.pfEmployerRate ?? 12, pfEmployerPaise],
    ["ESI_EMP_ER", "ESI Employer", "employer_contribution", "percent_of_gross", grossPaise, input.settings.esiEmployerRate ?? 3.25, esiEmployerPaise],
  ] as const;
  for (const [componentCode, componentName, componentType, calcType, baseValuePaise, rate, amountPaise] of statutory) {
    lines.push({ componentCode, componentName, componentType, calcType, baseValuePaise, rate: rate == null ? null : String(rate), amountPaise });
  }

  return { grossPaise, basicPaise, pfEmployeePaise, esiEmployeePaise, professionalTaxPaise, tdsPaise, loanEmiPaise, otherDeductionsPaise: 0, totalDeductionsPaise, netPaise, pfEmployerPaise, esiEmployerPaise, workingDays, daysAbsent, lines };
}

export async function createPayrollRun(tenantId: string, actorUserId: string, input: { runMonth: number; runYear: number; academicYearId?: string | null; runLabel?: string }) {
  await ensurePayrollDefaults(tenantId);
  return withTenant(tenantId, async (tx) => {
    if (input.runMonth < 1 || input.runMonth > 12) throw new Phase8Error("Run month must be between 1 and 12.", 422);
    const [run] = await tx.insert(payrollRuns).values({
      tenantId,
      academicYearId: input.academicYearId ?? null,
      runMonth: input.runMonth,
      runYear: input.runYear,
      runLabel: input.runLabel?.trim() || runLabel(input.runYear, input.runMonth),
      initiatedBy: actorUserId,
    }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "payroll.run.created", entityType: "payroll_run", entityId: run.id, metadata: { runMonth: input.runMonth, runYear: input.runYear } });
    return run;
  });
}

export async function computePayrollRun(tenantId: string, actorUserId: string, runId: string, options?: { staffId?: string; daysAbsentByStaff?: Record<string, number> }) {
  await ensurePayrollDefaults(tenantId);
  return withTenant(tenantId, async (tx) => {
    const [run] = await tx.select().from(payrollRuns).where(and(eq(payrollRuns.tenantId, tenantId), eq(payrollRuns.id, runId))).limit(1);
    if (!run) throw new Phase8Error("Payroll run not found.", 404);
    if (run.status === "locked") throw new Phase8Error("Locked payroll runs cannot be recomputed.", 409);
    const { from, to } = runPeriod(run.runYear, run.runMonth);
    const [settings] = await tx.select().from(payrollSettings).where(eq(payrollSettings.tenantId, tenantId)).limit(1);
    const allComponents = await tx.select().from(payrollComponents).where(and(eq(payrollComponents.tenantId, tenantId), eq(payrollComponents.isActive, true))).orderBy(asc(payrollComponents.displayOrder));
    const staffRows = await tx.select().from(staffProfiles).where(and(eq(staffProfiles.tenantId, tenantId), options?.staffId ? eq(staffProfiles.id, options.staffId) : undefined, or(eq(staffProfiles.status, "active"), isNull(staffProfiles.archivedAt))));
    let totals = { gross: 0, deductions: 0, net: 0, staff: 0 };
    for (const staff of staffRows) {
      const assignments = await tx.select().from(payrollComponentAssignments).where(and(
        eq(payrollComponentAssignments.tenantId, tenantId),
        eq(payrollComponentAssignments.staffId, staff.id),
        eq(payrollComponentAssignments.isActive, true),
        lte(payrollComponentAssignments.effectiveFrom, to),
        or(isNull(payrollComponentAssignments.effectiveTo), gte(payrollComponentAssignments.effectiveTo, from)),
      ));
      const activeLoans = await tx.select().from(staffLoans).where(and(eq(staffLoans.tenantId, tenantId), eq(staffLoans.staffId, staff.id), eq(staffLoans.status, "active")));
      const computed = computePayrollAmounts({ settings: settings ?? {}, components: allComponents, assignments, loans: activeLoans, daysAbsent: options?.daysAbsentByStaff?.[staff.id] ?? 0, workingDays: settings?.standardWorkingDays ?? 26 });
      const [entry] = await tx.insert(payrollRunEntries).values({
        tenantId,
        runId,
        staffId: staff.id,
        workingDays: computed.workingDays,
        daysPresent: computed.workingDays - computed.daysAbsent,
        daysAbsent: computed.daysAbsent,
        grossPaise: computed.grossPaise,
        basicPaise: computed.basicPaise,
        pfEmployeePaise: computed.pfEmployeePaise,
        esiEmployeePaise: computed.esiEmployeePaise,
        professionalTaxPaise: computed.professionalTaxPaise,
        tdsPaise: computed.tdsPaise,
        loanEmiPaise: computed.loanEmiPaise,
        otherDeductionsPaise: computed.otherDeductionsPaise,
        totalDeductionsPaise: computed.totalDeductionsPaise,
        netPaise: computed.netPaise,
        pfEmployerPaise: computed.pfEmployerPaise,
        esiEmployerPaise: computed.esiEmployerPaise,
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: [payrollRunEntries.runId, payrollRunEntries.staffId],
        set: {
          workingDays: computed.workingDays,
          daysPresent: computed.workingDays - computed.daysAbsent,
          daysAbsent: computed.daysAbsent,
          grossPaise: computed.grossPaise,
          basicPaise: computed.basicPaise,
          pfEmployeePaise: computed.pfEmployeePaise,
          esiEmployeePaise: computed.esiEmployeePaise,
          professionalTaxPaise: computed.professionalTaxPaise,
          tdsPaise: computed.tdsPaise,
          loanEmiPaise: computed.loanEmiPaise,
          otherDeductionsPaise: computed.otherDeductionsPaise,
          totalDeductionsPaise: computed.totalDeductionsPaise,
          netPaise: computed.netPaise,
          pfEmployerPaise: computed.pfEmployerPaise,
          esiEmployerPaise: computed.esiEmployerPaise,
          updatedAt: new Date(),
        },
      }).returning();
      await tx.delete(payrollRunEntryLines).where(and(eq(payrollRunEntryLines.tenantId, tenantId), eq(payrollRunEntryLines.entryId, entry.id)));
      await tx.insert(payrollRunEntryLines).values(computed.lines.map((line) => ({ tenantId, entryId: entry.id, ...line })));
      totals = { gross: totals.gross + computed.grossPaise, deductions: totals.deductions + computed.totalDeductionsPaise, net: totals.net + computed.netPaise, staff: totals.staff + 1 };
    }
    const [updated] = await tx.update(payrollRuns).set({ status: "computed", totalGrossPaise: totals.gross, totalDeductionsPaise: totals.deductions, totalNetPaise: totals.net, staffCount: totals.staff, updatedAt: new Date() }).where(and(eq(payrollRuns.tenantId, tenantId), eq(payrollRuns.id, runId))).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "payroll.run.computed", entityType: "payroll_run", entityId: runId, metadata: totals });
    return updated;
  });
}

export async function reviewPayrollRun(tenantId: string, actorUserId: string, runId: string) {
  return withTenant(tenantId, async (tx) => {
    const [run] = await tx.update(payrollRuns).set({ status: "reviewed", reviewedBy: actorUserId, reviewedAt: new Date(), updatedAt: new Date() }).where(and(eq(payrollRuns.tenantId, tenantId), eq(payrollRuns.id, runId), eq(payrollRuns.status, "computed"))).returning();
    if (!run) throw new Phase8Error("Only computed payroll runs can be reviewed.", 422);
    await writeAuditLog(tx, { tenantId, actorUserId, action: "payroll.run.reviewed", entityType: "payroll_run", entityId: runId });
    return run;
  });
}

async function salaryExpenseAccount(tx: TenantTransaction, tenantId: string) {
  const [account] = await tx.select({ id: financialAccounts.id }).from(financialAccounts).where(and(eq(financialAccounts.tenantId, tenantId), eq(financialAccounts.code, "5001"))).limit(1);
  if (!account) throw new Phase8Error("Salary expense account is not configured.", 500);
  return account.id;
}

export async function lockPayrollRun(tenantId: string, actorUserId: string, runId: string) {
  await ensureFinanceDefaults(tenantId);
  return withTenant(tenantId, async (tx) => {
    const [run] = await tx.select().from(payrollRuns).where(and(eq(payrollRuns.tenantId, tenantId), eq(payrollRuns.id, runId))).limit(1);
    if (!run) throw new Phase8Error("Payroll run not found.", 404);
    if (run.status === "locked") return run;
    if (!["computed", "reviewed"].includes(run.status)) throw new Phase8Error("Compute payroll before locking.", 422);
    const entries = await tx.select({ id: payrollRunEntries.id, staffId: payrollRunEntries.staffId, netPaise: payrollRunEntries.netPaise, loanEmiPaise: payrollRunEntries.loanEmiPaise, staffName: staffProfiles.fullName }).from(payrollRunEntries).innerJoin(staffProfiles, eq(staffProfiles.id, payrollRunEntries.staffId)).where(and(eq(payrollRunEntries.tenantId, tenantId), eq(payrollRunEntries.runId, runId)));
    const negative = entries.find((entry) => entry.netPaise < 0);
    if (negative) throw new Phase8Error(`Negative net pay blocks lock for ${negative.staffName}.`, 422);
    const accountId = await salaryExpenseAccount(tx, tenantId);
    const transactionDate = `${run.runYear}-${String(run.runMonth).padStart(2, "0")}-01`;
    for (const entry of entries) {
      await tx.insert(financialTransactions).values({
        tenantId,
        type: "debit",
        amount: Math.round(entry.netPaise / 100),
        date: transactionDate,
        accountId,
        transactionType: "expense",
        amountPaise: entry.netPaise,
        transactionDate,
        description: `Salary — ${entry.staffName} — ${run.runLabel}`,
        reference: run.runLabel,
        category: "payroll",
        source: "payroll_run_entry",
        sourceId: entry.id,
        createdBy: actorUserId,
      }).onConflictDoNothing();
      if (entry.loanEmiPaise > 0) {
        const loans = await tx.select().from(staffLoans).where(and(eq(staffLoans.tenantId, tenantId), eq(staffLoans.staffId, entry.staffId), eq(staffLoans.status, "active"))).orderBy(asc(staffLoans.startDate));
        let remaining = entry.loanEmiPaise;
        for (const loan of loans) {
          if (remaining <= 0) break;
          const applied = Math.min(remaining, loan.outstandingPaise);
          const outstanding = loan.outstandingPaise - applied;
          await tx.update(staffLoans).set({ outstandingPaise: outstanding, installmentsPaid: loan.installmentsPaid + 1, status: outstanding <= 0 ? "closed" : "active", endDate: outstanding <= 0 ? transactionDate : loan.endDate, updatedAt: new Date() }).where(and(eq(staffLoans.tenantId, tenantId), eq(staffLoans.id, loan.id)));
          remaining -= applied;
        }
      }
    }
    const [locked] = await tx.update(payrollRuns).set({ status: "locked", lockedBy: actorUserId, lockedAt: new Date(), updatedAt: new Date() }).where(and(eq(payrollRuns.tenantId, tenantId), eq(payrollRuns.id, runId))).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "payroll.run.locked", entityType: "payroll_run", entityId: runId, metadata: { staffCount: entries.length } });
    return locked;
  });
}

function pdfBytesFromText(text: string) {
  const lines = text.split("\n").slice(0, 48);
  const escaped = lines.map((line) => line.replace(/[\\()]/g, "\\$&"));
  const content = `BT /F1 11 Tf 48 790 Td ${escaped.map((line, index) => `${index ? "0 -16 Td " : ""}(${line}) Tj`).join(" ")} ET`;
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
  const body = `${objects.join("\n")}\n`;
  const trailer = `xref\n0 ${objects.length + 1}\n${xref.join("\n")}\ntrailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF`;
  return Buffer.from(`%PDF-1.4\n${body}${trailer}`, "utf8");
}

async function writePayslipPdf(tenantId: string, fileName: string, text: string) {
  const dir = path.join(process.cwd(), "generated-files", tenantId, "payslips");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), pdfBytesFromText(text));
  return `/generated-files/${tenantId}/payslips/${fileName}`;
}

export async function generatePayslip(tenantId: string, actorUserId: string, runId: string, staffId: string) {
  return withTenant(tenantId, async (tx) => {
    const [row] = await tx.select({
      entryId: payrollRunEntries.id,
      staffId: payrollRunEntries.staffId,
      grossPaise: payrollRunEntries.grossPaise,
      totalDeductionsPaise: payrollRunEntries.totalDeductionsPaise,
      netPaise: payrollRunEntries.netPaise,
      workingDays: payrollRunEntries.workingDays,
      daysAbsent: payrollRunEntries.daysAbsent,
      pfEmployerPaise: payrollRunEntries.pfEmployerPaise,
      esiEmployerPaise: payrollRunEntries.esiEmployerPaise,
      runLabel: payrollRuns.runLabel,
      status: payrollRuns.status,
      staffName: staffProfiles.fullName,
      employeeCode: staffProfiles.employeeCode,
      tenantName: tenants.name,
    }).from(payrollRunEntries)
      .innerJoin(payrollRuns, eq(payrollRuns.id, payrollRunEntries.runId))
      .innerJoin(staffProfiles, eq(staffProfiles.id, payrollRunEntries.staffId))
      .innerJoin(tenants, eq(tenants.id, payrollRunEntries.tenantId))
      .where(and(eq(payrollRunEntries.tenantId, tenantId), eq(payrollRunEntries.runId, runId), eq(payrollRunEntries.staffId, staffId))).limit(1);
    if (!row) throw new Phase8Error("Payroll entry not found.", 404);
    if (row.status !== "locked") throw new Phase8Error("Payslips can only be generated for locked runs.", 422);
    const lines = await tx.select().from(payrollRunEntryLines).where(and(eq(payrollRunEntryLines.tenantId, tenantId), eq(payrollRunEntryLines.entryId, row.entryId))).orderBy(asc(payrollRunEntryLines.componentType), asc(payrollRunEntryLines.componentName));
    const earnings = lines.filter((line) => line.componentType === "earning").map((line) => `${line.componentName}: ${formatCurrency(line.amountPaise)}`);
    const deductions = lines.filter((line) => ["deduction", "statutory_deduction"].includes(line.componentType) && line.amountPaise > 0).map((line) => `${line.componentName}: ${formatCurrency(line.amountPaise)}`);
    const text = [
      row.tenantName,
      "PAYSLIP",
      `Period: ${row.runLabel}`,
      `Employee: ${row.staffName} (${row.employeeCode})`,
      `Attendance: ${row.workingDays - row.daysAbsent}/${row.workingDays} present, ${row.daysAbsent} absent`,
      "",
      "EARNINGS",
      ...(earnings.length ? earnings : ["No earnings configured"]),
      `Gross: ${formatCurrency(row.grossPaise)}`,
      "",
      "DEDUCTIONS",
      ...(deductions.length ? deductions : ["No deductions"]),
      `Total deductions: ${formatCurrency(row.totalDeductionsPaise)}`,
      "",
      `Employer PF: ${formatCurrency(row.pfEmployerPaise)}`,
      `Employer ESI: ${formatCurrency(row.esiEmployerPaise)}`,
      `Net pay: ${formatCurrency(row.netPaise)}`,
      `Amount in words: ${amountToWords(row.netPaise)}`,
      "",
      "This is a computer-generated payslip.",
      "HR Signature: ____________________",
    ].join("\n");
    const pdfUrl = await writePayslipPdf(tenantId, `${runId}-${staffId}.pdf`, text);
    const [slip] = await tx.insert(payslips).values({ tenantId, entryId: row.entryId, staffId, pdfUrl, status: "generated", generatedAt: new Date() }).onConflictDoUpdate({
      target: payslips.entryId,
      set: { pdfUrl, status: "generated", generatedAt: new Date(), updatedAt: new Date() },
    }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "payroll.payslip.generated", entityType: "payslip", entityId: slip.id, metadata: { runId, staffId } });
    return slip;
  });
}

export async function generateRunPayslips(tenantId: string, actorUserId: string, runId: string) {
  const entries = await withTenant(tenantId, (tx) => tx.select({ staffId: payrollRunEntries.staffId }).from(payrollRunEntries).where(and(eq(payrollRunEntries.tenantId, tenantId), eq(payrollRunEntries.runId, runId))));
  const generated = [];
  for (const entry of entries) generated.push(await generatePayslip(tenantId, actorUserId, runId, entry.staffId));
  return { generated };
}

export async function getPayslipForStaff(tenantId: string, runId: string, staffId: string) {
  return withTenant(tenantId, async (tx) => {
    const [slip] = await tx.select().from(payslips)
      .innerJoin(payrollRunEntries, eq(payrollRunEntries.id, payslips.entryId))
      .where(and(eq(payslips.tenantId, tenantId), eq(payslips.staffId, staffId), eq(payrollRunEntries.runId, runId)))
      .limit(1);
    return slip?.payslips ?? null;
  });
}

export async function createStaffLoan(tenantId: string, input: { staffId: string; loanType?: string; principalPaise: number; emiPaise: number; startDate: string; notes?: string | null }) {
  return withTenant(tenantId, async (tx) => {
    if (input.principalPaise <= 0 || input.emiPaise <= 0) throw new Phase8Error("Loan principal and EMI must be greater than zero.", 422);
    const [loan] = await tx.insert(staffLoans).values({
      tenantId,
      staffId: input.staffId,
      loanType: input.loanType ?? "salary_advance",
      principalPaise: input.principalPaise,
      outstandingPaise: input.principalPaise,
      emiPaise: input.emiPaise,
      startDate: input.startDate,
      notes: input.notes ?? null,
    }).returning();
    return loan;
  });
}
