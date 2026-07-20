import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { admissionApplications } from "@/lib/db";
import { withTenant } from "@/lib/rls";

export const ADMISSION_READ_PERMISSION = "students.read" as const;
export const ADMISSION_WRITE_PERMISSION = "students.write" as const;

export type AdmissionRecord = {
  id: string;
  applicantName: string;
  grade: string;
  stage: string;
  fitScore: number | null;
  owner: string | null;
  status: string;
  createdAt: Date;
};

export type CreateAdmissionInput = {
  tenantId: string;
  applicantName: string;
  grade: string;
  stage?: string;
  fitScore?: number;
  owner?: string;
  status?: string;
};

function clean(value?: string | null) {
  const next = value?.trim();
  return next ? next : null;
}

export async function listAdmissions(tenantId: string, search?: string) {
  const rows = await withTenant(tenantId, (tx) =>
    tx
      .select({
        id: admissionApplications.id,
        applicantName: admissionApplications.applicantName,
        grade: admissionApplications.grade,
        stage: admissionApplications.stage,
        fitScore: admissionApplications.fitScore,
        owner: admissionApplications.owner,
        status: admissionApplications.status,
        createdAt: admissionApplications.createdAt,
      })
      .from(admissionApplications)
      .where(
        search
          ? and(
              eq(admissionApplications.tenantId, tenantId),
              or(
                ilike(admissionApplications.applicantName, `%${search}%`),
                ilike(admissionApplications.grade, `%${search}%`),
                ilike(admissionApplications.stage, `%${search}%`),
                ilike(admissionApplications.owner, `%${search}%`),
              ),
            )
          : eq(admissionApplications.tenantId, tenantId),
      )
      .orderBy(desc(admissionApplications.createdAt), asc(admissionApplications.applicantName)),
  );

  return rows satisfies AdmissionRecord[];
}

export async function createAdmission(input: CreateAdmissionInput) {
  return withTenant(input.tenantId, async (tx) => {
    const [application] = await tx
      .insert(admissionApplications)
      .values({
        tenantId: input.tenantId,
        applicantName: input.applicantName.trim(),
        grade: input.grade.trim(),
        stage: clean(input.stage) ?? "inquiry",
        fitScore: input.fitScore ?? null,
        owner: clean(input.owner),
        status: clean(input.status) ?? "open",
      })
      .returning();

    return application;
  });
}
