import { and, asc, eq } from "drizzle-orm";
import { timetableEntries } from "@/lib/db";
import { withTenant } from "@/lib/rls";

export const TIMETABLE_READ_PERMISSION = "academics.read" as const;

export type TimetableEntryRecord = {
  id: string;
  dayOfWeek: number;
  period: number;
  classLabel: string;
  subject: string;
  room: string | null;
  teacherName: string | null;
  createdAt: Date;
};

export async function listTimetableEntries(tenantId: string, classLabel?: string) {
  const rows = await withTenant(tenantId, (tx) =>
    tx
      .select({
        id: timetableEntries.id,
        dayOfWeek: timetableEntries.dayOfWeek,
        period: timetableEntries.period,
        classLabel: timetableEntries.classLabel,
        subject: timetableEntries.subject,
        room: timetableEntries.room,
        teacherName: timetableEntries.teacherName,
        createdAt: timetableEntries.createdAt,
      })
      .from(timetableEntries)
      .where(
        classLabel
          ? and(eq(timetableEntries.tenantId, tenantId), eq(timetableEntries.classLabel, classLabel))
          : eq(timetableEntries.tenantId, tenantId),
      )
      .orderBy(asc(timetableEntries.dayOfWeek), asc(timetableEntries.period)),
  );

  return rows satisfies TimetableEntryRecord[];
}
