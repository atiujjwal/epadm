import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";
import { dataImportJobs, dataImportRows, staffProfiles, students } from "@/lib/db";
import { withTenant } from "@/lib/rls";

export type ImportEntity = "students" | "staff";
type CsvRow = Record<string, string>;
type RowError = { field: string; message: string };

function parseCsvLine(line: string) {
  const cells: string[] = []; let value = ""; let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && quoted && line[i + 1] === '"') { value += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { cells.push(value.trim()); value = ""; }
    else value += char;
  }
  cells.push(value.trim()); return cells;
}

export function parseCsv(text: string): CsvRow[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]).map((header) => header.trim().toLowerCase().replace(/[\s-]+/g, "_"));
  return lines.slice(1).map((line) => Object.fromEntries(headers.map((header, index) => [header, parseCsvLine(line)[index]?.trim() ?? ""])));
}

function validate(entity: ImportEntity, row: CsvRow): RowError[] {
  const errors: RowError[] = [];
  const required = entity === "students" ? ["admission_number", "first_name"] : ["employee_number", "full_name", "email"];
  for (const field of required) if (!row[field]) errors.push({ field, message: "Required field is missing" });
  if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) errors.push({ field: "email", message: "Invalid email address" });
  if (row.date_of_birth && !/^\d{4}-\d{2}-\d{2}$/.test(row.date_of_birth)) errors.push({ field: "date_of_birth", message: "Use YYYY-MM-DD" });
  if (row.gender && !["male", "female", "other", "prefer_not_to_say"].includes(row.gender)) errors.push({ field: "gender", message: "Unsupported gender value" });
  return errors;
}

export async function createImportJob(tenantId: string, userId: string, entity: ImportEntity, fileName: string, csv: string) {
  const parsed = parseCsv(csv);
  if (!parsed.length) throw new Error("CSV must include a header and at least one data row");
  return withTenant(tenantId, async (tx) => {
    const [job] = await tx.insert(dataImportJobs).values({ tenantId, entityType: entity, status: "validating", fileName, fileUrl: `inline://${encodeURIComponent(fileName)}`, startedBy: userId, totalRows: parsed.length }).returning();
    const rows = parsed.map((rawData, index) => { const errors = validate(entity, rawData); return { tenantId, jobId: job.id, rowNumber: index + 2, status: errors.length ? "invalid" as const : "valid" as const, rawData, errors }; });
    await tx.insert(dataImportRows).values(rows);
    const validRows = rows.filter((row) => row.status === "valid").length; const invalidRows = rows.length - validRows;
    const [updated] = await tx.update(dataImportJobs).set({ status: invalidRows ? "invalid" : "valid", validRows, invalidRows, importedRows: 0 }).where(and(eq(dataImportJobs.tenantId, tenantId), eq(dataImportJobs.id, job.id))).returning();
    return updated;
  });
}

export async function listImportJobs(tenantId: string, entity?: ImportEntity) { return withTenant(tenantId, (tx) => tx.select().from(dataImportJobs).where(and(eq(dataImportJobs.tenantId, tenantId), entity ? eq(dataImportJobs.entityType, entity) : undefined)).orderBy(desc(dataImportJobs.createdAt)).limit(50)); }
export async function getImportJob(tenantId: string, jobId: string) { return withTenant(tenantId, (tx) => tx.query.dataImportJobs.findFirst({ where: and(eq(dataImportJobs.tenantId, tenantId), eq(dataImportJobs.id, jobId)) })); }
export async function listImportRows(tenantId: string, jobId: string) { return withTenant(tenantId, (tx) => tx.select().from(dataImportRows).where(and(eq(dataImportRows.tenantId, tenantId), eq(dataImportRows.jobId, jobId))).orderBy(asc(dataImportRows.rowNumber))); }

export async function confirmImport(tenantId: string, jobId: string) {
  return withTenant(tenantId, async (tx) => {
    const job = await tx.query.dataImportJobs.findFirst({ where: and(eq(dataImportJobs.tenantId, tenantId), eq(dataImportJobs.id, jobId)) });
    if (!job) throw new Error("Import job not found");
    if (!["valid", "invalid"].includes(job.status)) throw new Error("Import job cannot be confirmed in its current state");
    await tx.update(dataImportJobs).set({ status: "importing" }).where(and(eq(dataImportJobs.tenantId, tenantId), eq(dataImportJobs.id, jobId)));
    const rows = await tx.select().from(dataImportRows).where(and(eq(dataImportRows.tenantId, tenantId), eq(dataImportRows.jobId, jobId), eq(dataImportRows.status, "valid"))).orderBy(asc(dataImportRows.rowNumber));
    let imported = 0;
    for (const row of rows) {
      const raw = row.rawData ?? {}; let entityId: string;
      if (job.entityType === "students") {
        const admissionNumber = raw.admission_number.trim().toUpperCase();
        const existing = await tx.query.students.findFirst({ where: and(eq(students.tenantId, tenantId), eq(students.admissionNumber, admissionNumber)) });
        if (existing) {
          const [updated] = await tx.update(students).set({ firstName: raw.first_name, lastName: raw.last_name || null, dateOfBirth: raw.date_of_birth || null, gender: raw.gender || null, classLabel: raw.class || null, sectionLabel: raw.section || null, guardianName: raw.guardian_name || null, guardianPhone: raw.guardian_phone || null, updatedAt: new Date() }).where(and(eq(students.tenantId, tenantId), eq(students.id, existing.id))).returning({ id: students.id }); entityId = updated.id;
        } else {
          const [created] = await tx.insert(students).values({ tenantId, admissionNumber, firstName: raw.first_name, lastName: raw.last_name || null, dateOfBirth: raw.date_of_birth || null, gender: raw.gender || null, classLabel: raw.class || null, sectionLabel: raw.section || null, guardianName: raw.guardian_name || null, guardianPhone: raw.guardian_phone || null }).returning({ id: students.id }); entityId = created.id;
        }
      } else {
        const employeeCode = raw.employee_number.trim().toUpperCase();
        const existing = await tx.query.staffProfiles.findFirst({ where: and(eq(staffProfiles.tenantId, tenantId), eq(staffProfiles.employeeCode, employeeCode)) });
        const values = { fullName: raw.full_name, email: raw.email.toLowerCase(), phone: raw.phone || null, phonePrimary: raw.phone || null, dateOfBirth: raw.date_of_birth || null, department: raw.department || null, jobTitle: raw.designation || null, staffType: raw.staff_type || "teaching", employmentType: raw.employment_type || "full_time", joinedOn: raw.joining_date || null, updatedAt: new Date() };
        if (existing) { const [updated] = await tx.update(staffProfiles).set(values).where(and(eq(staffProfiles.tenantId, tenantId), eq(staffProfiles.id, existing.id))).returning({ id: staffProfiles.id }); entityId = updated.id; }
        else { const [created] = await tx.insert(staffProfiles).values({ ...values, tenantId, employeeCode }).returning({ id: staffProfiles.id }); entityId = created.id; }
      }
      await tx.update(dataImportRows).set({ status: "imported", entityId }).where(and(eq(dataImportRows.tenantId, tenantId), eq(dataImportRows.id, row.id))); imported += 1;
    }
    const [updated] = await tx.update(dataImportJobs).set({ status: "complete", importedRows: imported, completedAt: new Date() }).where(and(eq(dataImportJobs.tenantId, tenantId), eq(dataImportJobs.id, jobId))).returning(); return updated;
  });
}

export async function cancelImport(tenantId: string, jobId: string) { return withTenant(tenantId, async (tx) => { const job = await tx.query.dataImportJobs.findFirst({ where: and(eq(dataImportJobs.tenantId, tenantId), eq(dataImportJobs.id, jobId)) }); if (!job) throw new Error("Import job not found"); if (["complete", "importing"].includes(job.status)) throw new Error("Import job can no longer be cancelled"); const [updated] = await tx.update(dataImportJobs).set({ status: "failed", completedAt: new Date() }).where(and(eq(dataImportJobs.tenantId, tenantId), eq(dataImportJobs.id, jobId))).returning(); return updated; }); }

export const STUDENT_TEMPLATE = "admission_number,first_name,last_name,date_of_birth,gender,class,section,guardian_name,guardian_phone\n";
export const STAFF_TEMPLATE = "employee_number,full_name,email,phone,date_of_birth,staff_type,employment_type,department,designation,joining_date\n";

function csvEscape(value: string) { return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value; }
export async function makeErrorCsv(tenantId: string, jobId: string) { const rows = (await listImportRows(tenantId, jobId)).filter((row) => row.status === "invalid"); const keys = [...new Set(rows.flatMap((row) => Object.keys(row.rawData ?? {})))]; return [keys.concat("errors").join(","), ...rows.map((row) => keys.map((key) => csvEscape(row.rawData?.[key] ?? "")).concat(csvEscape((row.errors ?? []).map((error) => `${error.field}: ${error.message}`).join("; "))).join(","))].join("\n"); }
