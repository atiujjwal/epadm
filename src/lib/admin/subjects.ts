import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { subjects } from "@/lib/db";
import { withTenant } from "@/lib/rls";

export const SUBJECT_READ_PERMISSION = "academics.read" as const;
export const SUBJECT_WRITE_PERMISSION = "academics.write" as const;

export type SubjectRecord = {
  id: string;
  name: string;
  code: string;
  status: string;
  createdAt: Date;
};

export type CreateSubjectInput = {
  tenantId: string;
  name: string;
  code: string;
  status?: string;
};

function clean(value?: string | null) {
  const next = value?.trim();
  return next ? next : null;
}

function normalizeCode(value: string) {
  return value.trim().toUpperCase();
}

export async function listSubjects(tenantId: string, search?: string) {
  const rows = await withTenant(tenantId, (tx) =>
    tx
      .select({
        id: subjects.id,
        name: subjects.name,
        code: subjects.code,
        status: subjects.status,
        createdAt: subjects.createdAt,
      })
      .from(subjects)
      .where(
        search
          ? and(
              eq(subjects.tenantId, tenantId),
              or(
                ilike(subjects.name, `%${search}%`),
                ilike(subjects.code, `%${search}%`),
              ),
            )
          : eq(subjects.tenantId, tenantId),
      )
      .orderBy(desc(subjects.createdAt), asc(subjects.name)),
  );

  return rows satisfies SubjectRecord[];
}

export async function createSubject(input: CreateSubjectInput) {
  const code = normalizeCode(input.code);

  return withTenant(input.tenantId, async (tx) => {
    const existing = await tx.query.subjects.findFirst({
      where: and(eq(subjects.tenantId, input.tenantId), eq(subjects.code, code)),
    });

    if (existing) {
      throw new Error("A subject with this code already exists.");
    }

    const [subject] = await tx
      .insert(subjects)
      .values({
        tenantId: input.tenantId,
        name: input.name.trim(),
        code,
        status: clean(input.status) ?? "active",
      })
      .returning();

    return subject;
  });
}
