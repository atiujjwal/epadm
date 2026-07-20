import { and, desc, eq, sql } from "drizzle-orm";
import {
  academicClasses,
  attendance,
  classSections,
  students,
} from "@/lib/db";
import { withTenant } from "@/lib/rls";

export const ATTENDANCE_READ_PERMISSION = "attendance.read" as const;

export type AttendanceRecord = {
  id: string;
  date: string;
  status: string;
  notes: string | null;
  studentName: string;
  admissionNumber: string;
  className: string;
  sectionName: string;
  createdAt: Date;
};

export type AttendanceSummary = {
  present: number;
  absent: number;
  late: number;
  total: number;
};

export async function listAttendance(tenantId: string, date?: string) {
  const day = date ?? new Date().toISOString().slice(0, 10);

  const rows = await withTenant(tenantId, (tx) =>
    tx
      .select({
        id: attendance.id,
        date: attendance.date,
        status: attendance.status,
        notes: attendance.notes,
        studentName: sql<string>`trim(concat(${students.firstName}, ' ', coalesce(${students.lastName}, '')))`,
        admissionNumber: students.admissionNumber,
        className: academicClasses.name,
        sectionName: classSections.name,
        createdAt: attendance.createdAt,
      })
      .from(attendance)
      .innerJoin(students, eq(attendance.studentId, students.id))
      .innerJoin(academicClasses, eq(attendance.classId, academicClasses.id))
      .innerJoin(classSections, eq(attendance.sectionId, classSections.id))
      .where(and(eq(attendance.tenantId, tenantId), eq(attendance.date, day)))
      .orderBy(desc(attendance.createdAt)),
  );

  return rows.map((row) => ({
    ...row,
    date: String(row.date),
  })) satisfies AttendanceRecord[];
}

export async function getAttendanceSummary(tenantId: string, date?: string) {
  const records = await listAttendance(tenantId, date);
  const summary: AttendanceSummary = {
    present: records.filter((r) => r.status === "present").length,
    absent: records.filter((r) => r.status === "absent").length,
    late: records.filter((r) => r.status === "late").length,
    total: records.length,
  };
  return { records, summary };
}
