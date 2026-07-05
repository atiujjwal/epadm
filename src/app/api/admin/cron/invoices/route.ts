import { NextResponse } from "next/server";
import { getCtx } from "@/lib/context";
import {
  studentEnrollments,
  feeStructures,
  studentInvoices,
} from "@/lib/db";
import { withTenant } from "@/lib/rls";
import { and, eq } from "drizzle-orm";

export async function POST() {
  try {
    const ctx = await getCtx();

    if (!ctx.tenantId) {
      return NextResponse.json(
        { error: "Tenant context not found" },
        { status: 400 },
      );
    }

    const dateObj = new Date();
    const monthName = dateObj.toLocaleString("default", { month: "long" });
    const yearStr = dateObj.getFullYear();
    const dueDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), 15);
    const dueDateStr = dueDay.toISOString().split("T")[0];

    const result = await withTenant(ctx.tenantId, async (tx) => {
      // 1. Fetch active enrollments
      const enrollments = await tx
        .select({
          enrollmentId: studentEnrollments.id,
          studentId: studentEnrollments.studentId,
          classId: studentEnrollments.classId,
          academicYear: studentEnrollments.academicYear,
        })
        .from(studentEnrollments)
        .where(
          and(
            eq(studentEnrollments.status, "active"),
            eq(studentEnrollments.tenantId, ctx.tenantId),
          ),
        );

      let createdCount = 0;
      let skippedCount = 0;

      for (const e of enrollments) {
        // 2. Find monthly fee structures for this class
        const classFees = await tx
          .select()
          .from(feeStructures)
          .where(
            and(
              eq(feeStructures.classId, e.classId),
              eq(feeStructures.frequency, "monthly"),
              eq(feeStructures.tenantId, ctx.tenantId),
            ),
          );

        for (const f of classFees) {
          const invoiceTitle = `${f.name} - ${monthName} ${yearStr}`;

          // Check if invoice already exists
          const existing = await tx
            .select()
            .from(studentInvoices)
            .where(
              and(
                eq(studentInvoices.studentId, e.studentId),
                eq(studentInvoices.title, invoiceTitle),
                eq(studentInvoices.tenantId, ctx.tenantId),
              ),
            )
            .limit(1);

          if (existing.length === 0) {
            await tx.insert(studentInvoices).values({
              tenantId: ctx.tenantId,
              studentId: e.studentId,
              enrollmentId: e.enrollmentId,
              title: invoiceTitle,
              amount: f.amount,
              dueDate: dueDateStr,
              status: "pending",
            });
            createdCount++;
          } else {
            skippedCount++;
          }
        }
      }

      return { createdCount, skippedCount };
    });

    return NextResponse.json({
      success: true,
      message: `Invoices processed. Created: ${result.createdCount}, Skipped: ${result.skippedCount}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
