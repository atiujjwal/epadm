"use server";

import { getCtx } from "@/lib/context";
import { db, exams } from "@/lib/db";
import { withTenant } from "@/lib/rls";
import { revalidatePath } from "next/cache";

export async function saveExamAction(
  classId: string,
  title: string,
  subject: string,
  gradeLevel: string,
  difficulty: string,
  format: string,
  content: any,
) {
  const ctx = await getCtx();
  if (ctx.role !== "teacher") {
    throw new Error("Unauthorized");
  }

  await withTenant(ctx.tenantId, async (tx) => {
    await tx.insert(exams).values({
      tenantId: ctx.tenantId,
      classId,
      title,
      subject,
      gradeLevel,
      difficulty,
      format,
      content,
      createdById: ctx.userId,
    });
  });

  revalidatePath("/teacher/home");
}
