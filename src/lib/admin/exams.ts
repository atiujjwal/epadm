import { asc, desc, eq } from "drizzle-orm";
import { academicClasses, exams } from "@/lib/db";
import { withTenant } from "@/lib/rls";

export const EXAM_READ_PERMISSION = "academics.read" as const;

export type ExamRecord = {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  difficulty: string;
  format: string;
  classId: string;
  className: string | null;
  createdAt: Date;
};

export async function listExams(tenantId: string) {
  const rows = await withTenant(tenantId, (tx) =>
    tx
      .select({
        id: exams.id,
        title: exams.title,
        subject: exams.subject,
        gradeLevel: exams.gradeLevel,
        difficulty: exams.difficulty,
        format: exams.format,
        classId: exams.classId,
        className: academicClasses.name,
        createdAt: exams.createdAt,
      })
      .from(exams)
      .leftJoin(academicClasses, eq(exams.classId, academicClasses.id))
      .where(eq(exams.tenantId, tenantId))
      .orderBy(desc(exams.createdAt), asc(exams.title)),
  );

  return rows satisfies ExamRecord[];
}
