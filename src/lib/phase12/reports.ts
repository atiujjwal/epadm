import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  attendance,
  libraryIssues,
  payrollRuns,
  reportRuns,
  reportSchedules,
  studentInvoices,
  students,
  studentTransportAllocations,
} from "@/lib/db";
import type { Permission } from "@/lib/db";
import { type TenantTransaction, withTenant } from "@/lib/rls";
import { Phase12Error } from "./analytics";

export type ReportRow = Record<string, string | number | boolean | null>;

export type ReportDefinition = {
  key: string;
  label: string;
  description: string;
  category: "academics" | "finance" | "hr" | "library" | "transport";
  requiredPermission: Permission;
  columns: Array<{ key: string; label: string }>;
  query: (tenantId: string, tx: TenantTransaction, parameters: Record<string, unknown>) => Promise<ReportRow[]>;
};

function value(value: unknown): string | number | boolean | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  if (["string", "number", "boolean"].includes(typeof value)) return value as string | number | boolean;
  return String(value);
}

export const REPORT_DEFINITIONS: ReportDefinition[] = [
  {
    key: "student_directory",
    label: "Student Directory",
    description: "Active student directory with admission and guardian contact details.",
    category: "academics",
    requiredPermission: "analytics.academic.read",
    columns: [
      { key: "admissionNumber", label: "Admission No." },
      { key: "name", label: "Student" },
      { key: "classLabel", label: "Class" },
      { key: "sectionLabel", label: "Section" },
      { key: "guardianName", label: "Guardian" },
      { key: "guardianPhone", label: "Phone" },
    ],
    async query(tenantId, tx) {
      const rows = await tx
        .select({
          admissionNumber: students.admissionNumber,
          firstName: students.firstName,
          lastName: students.lastName,
          classLabel: students.classLabel,
          sectionLabel: students.sectionLabel,
          guardianName: students.guardianName,
          guardianPhone: students.guardianPhone,
        })
        .from(students)
        .where(and(eq(students.tenantId, tenantId), eq(students.status, "active")))
        .limit(1000);
      return rows.map((row) => ({ ...row, name: `${row.firstName} ${row.lastName ?? ""}`.trim() }));
    },
  },
  {
    key: "attendance_register",
    label: "Attendance Register",
    description: "Recent student attendance entries for operational review.",
    category: "academics",
    requiredPermission: "analytics.academic.read",
    columns: [
      { key: "date", label: "Date" },
      { key: "studentId", label: "Student ID" },
      { key: "status", label: "Status" },
      { key: "notes", label: "Notes" },
    ],
    async query(tenantId, tx) {
      const rows = await tx.select({ date: attendance.date, studentId: attendance.studentId, status: attendance.status, notes: attendance.notes }).from(attendance).where(eq(attendance.tenantId, tenantId)).orderBy(desc(attendance.date)).limit(1000);
      return rows.map((row) => ({ date: value(row.date), studentId: row.studentId, status: row.status, notes: row.notes }));
    },
  },
  {
    key: "fee_defaulters",
    label: "Fee Defaulters",
    description: "Invoices with overdue or pending balances.",
    category: "finance",
    requiredPermission: "finance.analytics.read",
    columns: [
      { key: "invoiceNumber", label: "Invoice No." },
      { key: "studentId", label: "Student ID" },
      { key: "title", label: "Title" },
      { key: "dueDate", label: "Due" },
      { key: "balancePaise", label: "Balance Paise" },
      { key: "status", label: "Status" },
    ],
    async query(tenantId, tx) {
      const rows = await tx
        .select({ invoiceNumber: studentInvoices.invoiceNumber, studentId: studentInvoices.studentId, title: studentInvoices.title, dueDate: studentInvoices.dueDate, balancePaise: studentInvoices.balancePaise, amount: studentInvoices.amount, paidPaise: studentInvoices.paidPaise, status: studentInvoices.status })
        .from(studentInvoices)
        .where(and(eq(studentInvoices.tenantId, tenantId), sql`${studentInvoices.status} in ('pending','partial','overdue')`))
        .orderBy(desc(studentInvoices.dueDate))
        .limit(1000);
      return rows.map((row) => ({ invoiceNumber: row.invoiceNumber, studentId: row.studentId, title: row.title, dueDate: value(row.dueDate), balancePaise: row.balancePaise ?? Math.max(row.amount * 100 - row.paidPaise, 0), status: row.status }));
    },
  },
  {
    key: "payroll_register",
    label: "Payroll Register",
    description: "Payroll run totals and status.",
    category: "hr",
    requiredPermission: "hr.analytics.read",
    columns: [
      { key: "runLabel", label: "Run" },
      { key: "staffCount", label: "Staff" },
      { key: "totalGrossPaise", label: "Gross Paise" },
      { key: "totalNetPaise", label: "Net Paise" },
      { key: "status", label: "Status" },
    ],
    async query(tenantId, tx) {
      const rows = await tx.select({ runLabel: payrollRuns.runLabel, staffCount: payrollRuns.staffCount, totalGrossPaise: payrollRuns.totalGrossPaise, totalNetPaise: payrollRuns.totalNetPaise, status: payrollRuns.status }).from(payrollRuns).where(eq(payrollRuns.tenantId, tenantId)).orderBy(desc(payrollRuns.createdAt)).limit(1000);
      return rows;
    },
  },
  {
    key: "library_overdue_report",
    label: "Library Overdue",
    description: "Library issues currently marked issued or overdue.",
    category: "library",
    requiredPermission: "reports.run",
    columns: [
      { key: "copyId", label: "Copy ID" },
      { key: "memberId", label: "Member ID" },
      { key: "dueDate", label: "Due Date" },
      { key: "status", label: "Status" },
      { key: "finePaise", label: "Fine Paise" },
    ],
    async query(tenantId, tx) {
      const rows = await tx.select({ copyId: libraryIssues.copyId, memberId: libraryIssues.memberId, dueDate: libraryIssues.dueDate, status: libraryIssues.status, finePaise: libraryIssues.finePaise }).from(libraryIssues).where(and(eq(libraryIssues.tenantId, tenantId), sql`${libraryIssues.status} in ('issued','overdue')`)).orderBy(desc(libraryIssues.dueDate)).limit(1000);
      return rows.map((row) => ({ ...row, dueDate: value(row.dueDate) }));
    },
  },
  {
    key: "transport_allocation_report",
    label: "Transport Allocations",
    description: "Active student transport allocations and monthly fee.",
    category: "transport",
    requiredPermission: "reports.run",
    columns: [
      { key: "studentId", label: "Student ID" },
      { key: "routeId", label: "Route ID" },
      { key: "startDate", label: "Start" },
      { key: "monthlyFeePaise", label: "Monthly Fee Paise" },
      { key: "status", label: "Status" },
    ],
    async query(tenantId, tx) {
      const rows = await tx.select({ studentId: studentTransportAllocations.studentId, routeId: studentTransportAllocations.routeId, startDate: studentTransportAllocations.startDate, monthlyFeePaise: studentTransportAllocations.monthlyFeePaise, status: studentTransportAllocations.status }).from(studentTransportAllocations).where(eq(studentTransportAllocations.tenantId, tenantId)).limit(1000);
      return rows.map((row) => ({ ...row, startDate: value(row.startDate) }));
    },
  },
];

export function getReportDefinition(reportKey: string) {
  const definition = REPORT_DEFINITIONS.find((report) => report.key === reportKey);
  if (!definition) throw new Phase12Error("Unknown report.", 404);
  return definition;
}

 export function listReportCatalog() {
  return REPORT_DEFINITIONS.map((definition) => ({
    key: definition.key,
    label: definition.label,
    description: definition.description,
    category: definition.category,
    requiredPermission: definition.requiredPermission,
    columns: definition.columns,
  }));
}

function escapeCsv(value: unknown) {
  const text = value == null ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(columns: ReportDefinition["columns"], rows: ReportRow[]) {
  return [
    columns.map((column) => escapeCsv(column.label)).join(","),
    ...rows.map((row) => columns.map((column) => escapeCsv(row[column.key])).join(",")),
  ].join("\n");
}

function pdfBytesFromText(text: string) {
  const lines = text.split("\n").slice(0, 42);
  const escaped = lines.map((line) => line.replace(/[\\()]/g, "\\$&"));
  const content = `BT /F1 10 Tf 40 790 Td ${escaped.map((line, index) => `${index ? "0 -15 Td " : ""}(${line}) Tj`).join(" ")} ET`;
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

function reportsDir(tenantId: string) {
  return path.join(process.cwd(), "generated-files", tenantId, "reports");
}

function reportFile(tenantId: string, runId: string, ext: "csv" | "pdf") {
  return path.join(reportsDir(tenantId), `${runId}.${ext}`);
}

export async function runCuratedReport(tenantId: string, userId: string, reportKey: string, parameters: Record<string, unknown> = {}) {
  const definition = getReportDefinition(reportKey);
  return withTenant(tenantId, async (tx) => {
    const [run] = await tx.insert(reportRuns).values({ tenantId, reportKey, reportLabel: definition.label, parameters, runBy: userId, status: "running" }).returning();
    try {
      const rows = await definition.query(tenantId, tx, parameters);
      const csv = toCsv(definition.columns, rows);
      await mkdir(reportsDir(tenantId), { recursive: true });
      await writeFile(reportFile(tenantId, run.id, "csv"), csv, "utf8");
      await writeFile(reportFile(tenantId, run.id, "pdf"), pdfBytesFromText([definition.label, definition.description, "", csv].join("\n")));
      const exportUrl = `/api/v1/analytics/reports/run/${run.id}/csv`;
      const [updated] = await tx.update(reportRuns).set({ status: "complete", rowCount: rows.length, exportUrl, completedAt: new Date() }).where(eq(reportRuns.id, run.id)).returning();
      return { run: updated, rows, columns: definition.columns };
    } catch (error) {
      await tx.update(reportRuns).set({ status: "failed", errorMessage: error instanceof Error ? error.message : String(error), completedAt: new Date() }).where(eq(reportRuns.id, run.id));
      throw error;
    }
  });
}

export async function listReportRuns(tenantId: string) {
  return withTenant(tenantId, (tx) => tx.select().from(reportRuns).where(eq(reportRuns.tenantId, tenantId)).orderBy(desc(reportRuns.createdAt)).limit(50));
}

export async function getReportRun(tenantId: string, runId: string) {
  return withTenant(tenantId, async (tx) => {
    const [run] = await tx.select().from(reportRuns).where(and(eq(reportRuns.tenantId, tenantId), eq(reportRuns.id, runId))).limit(1);
    if (!run) throw new Phase12Error("Report run not found.", 404);
    return run;
  });
}

export async function readReportExport(tenantId: string, runId: string, ext: "csv" | "pdf") {
  await getReportRun(tenantId, runId);
  try {
    return readFile(reportFile(tenantId, runId, ext));
  } catch {
    throw new Phase12Error("Report export file has not been generated yet.", 404);
  }
}

export async function listReportSchedules(tenantId: string) {
  return withTenant(tenantId, (tx) => tx.select().from(reportSchedules).where(eq(reportSchedules.tenantId, tenantId)).orderBy(desc(reportSchedules.createdAt)).limit(50));
}

function nextRunDate(frequency: string, runTime = "07:00") {
  const now = new Date();
  const [hours, minutes] = runTime.split(":").map((part) => Number(part));
  const next = new Date(now);
  next.setHours(Number.isFinite(hours) ? hours : 7, Number.isFinite(minutes) ? minutes : 0, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  if (frequency === "weekly") next.setDate(next.getDate() + 7);
  if (frequency === "monthly") next.setMonth(next.getMonth() + 1);
  return next;
}

export async function createReportSchedule(tenantId: string, userId: string, input: { reportKey: string; frequency: "daily" | "weekly" | "monthly"; recipients?: string[]; parameters?: Record<string, unknown>; runTime?: string; dayOfWeek?: number | null; dayOfMonth?: number | null }) {
  const definition = getReportDefinition(input.reportKey);
  const runTime = input.runTime ?? "07:00";
  return withTenant(tenantId, async (tx) => {
    const [schedule] = await tx.insert(reportSchedules).values({
      tenantId,
      reportKey: definition.key,
      reportLabel: definition.label,
      parameters: input.parameters ?? {},
      frequency: input.frequency,
      dayOfWeek: input.dayOfWeek ?? null,
      dayOfMonth: input.dayOfMonth ?? null,
      runTime,
      recipients: input.recipients ?? [],
      nextRunAt: nextRunDate(input.frequency, runTime),
      createdBy: userId,
    }).returning();
    return schedule;
  });
}
