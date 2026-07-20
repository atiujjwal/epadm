import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { labBookings } from "@/lib/db";
import { withTenant } from "@/lib/rls";

export const LAB_READ_PERMISSION = "academics.read" as const;
export const LAB_WRITE_PERMISSION = "academics.write" as const;

export type LabBookingRecord = {
  id: string;
  labName: string;
  session: string;
  classLabel: string | null;
  inCharge: string | null;
  scheduledAt: Date;
  status: string;
  createdAt: Date;
};

export type CreateLabBookingInput = {
  tenantId: string;
  labName: string;
  session: string;
  classLabel?: string;
  inCharge?: string;
  scheduledAt: string | Date;
  status?: string;
};

function clean(value?: string | null) {
  const next = value?.trim();
  return next ? next : null;
}

export async function listLabBookings(tenantId: string, search?: string) {
  const rows = await withTenant(tenantId, (tx) =>
    tx
      .select({
        id: labBookings.id,
        labName: labBookings.labName,
        session: labBookings.session,
        classLabel: labBookings.classLabel,
        inCharge: labBookings.inCharge,
        scheduledAt: labBookings.scheduledAt,
        status: labBookings.status,
        createdAt: labBookings.createdAt,
      })
      .from(labBookings)
      .where(
        search
          ? and(
              eq(labBookings.tenantId, tenantId),
              or(
                ilike(labBookings.labName, `%${search}%`),
                ilike(labBookings.session, `%${search}%`),
                ilike(labBookings.classLabel, `%${search}%`),
                ilike(labBookings.inCharge, `%${search}%`),
              ),
            )
          : eq(labBookings.tenantId, tenantId),
      )
      .orderBy(desc(labBookings.scheduledAt), asc(labBookings.labName)),
  );

  return rows satisfies LabBookingRecord[];
}

export async function createLabBooking(input: CreateLabBookingInput) {
  return withTenant(input.tenantId, async (tx) => {
    const [booking] = await tx
      .insert(labBookings)
      .values({
        tenantId: input.tenantId,
        labName: input.labName.trim(),
        session: input.session.trim(),
        classLabel: clean(input.classLabel),
        inCharge: clean(input.inCharge),
        scheduledAt: new Date(input.scheduledAt),
        status: clean(input.status) ?? "scheduled",
      })
      .returning();

    return booking;
  });
}
