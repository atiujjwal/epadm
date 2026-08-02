import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { vehicles } from "@/lib/db";
import { withTenant } from "@/lib/rls";

export const VEHICLE_READ_PERMISSION = "transport.read" as const;
export const VEHICLE_WRITE_PERMISSION = "transport.fleet.write" as const;

export type VehicleRecord = {
  id: string;
  code: string;
  numberPlate: string;
  driverName: string | null;
  routeName: string | null;
  studentCount: number;
  status: string;
  createdAt: Date;
};

export type CreateVehicleInput = {
  tenantId: string;
  code: string;
  numberPlate: string;
  driverName?: string;
  routeName?: string;
  studentCount?: number;
  status?: string;
};

function clean(value?: string | null) {
  const next = value?.trim();
  return next ? next : null;
}

function normalizeCode(value: string) {
  return value.trim().toUpperCase();
}

export async function listVehicles(tenantId: string, search?: string) {
  const rows = await withTenant(tenantId, (tx) =>
    tx
      .select({
        id: vehicles.id,
        code: vehicles.code,
        numberPlate: vehicles.numberPlate,
        driverName: vehicles.driverName,
        routeName: vehicles.routeName,
        studentCount: vehicles.studentCount,
        status: vehicles.status,
        createdAt: vehicles.createdAt,
      })
      .from(vehicles)
      .where(
        search
          ? and(
              eq(vehicles.tenantId, tenantId),
              or(
                ilike(vehicles.code, `%${search}%`),
                ilike(vehicles.numberPlate, `%${search}%`),
                ilike(vehicles.driverName, `%${search}%`),
                ilike(vehicles.routeName, `%${search}%`),
              ),
            )
          : eq(vehicles.tenantId, tenantId),
      )
      .orderBy(desc(vehicles.createdAt), asc(vehicles.code)),
  );

  return rows satisfies VehicleRecord[];
}

export async function createVehicle(input: CreateVehicleInput) {
  const code = normalizeCode(input.code);

  return withTenant(input.tenantId, async (tx) => {
    const existing = await tx.query.vehicles.findFirst({
      where: and(eq(vehicles.tenantId, input.tenantId), eq(vehicles.code, code)),
    });

    if (existing) {
      throw new Error("A vehicle with this code already exists.");
    }

    const [vehicle] = await tx
      .insert(vehicles)
      .values({
        tenantId: input.tenantId,
        code,
        numberPlate: input.numberPlate.trim().toUpperCase(),
        driverName: clean(input.driverName),
        routeName: clean(input.routeName),
        studentCount: input.studentCount ?? 0,
        status: clean(input.status) ?? "active",
      })
      .returning();

    return vehicle;
  });
}
