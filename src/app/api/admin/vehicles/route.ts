import { withApiObservability } from "@/lib/observability/api-handler";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import {
  createVehicle,
  listVehicles,
  VEHICLE_READ_PERMISSION,
  VEHICLE_WRITE_PERMISSION,
} from "@/lib/admin/vehicles";
import { badRequest, ok, serverError } from "@/lib/http/responses";

const vehicleSchema = z.object({
  code: z.string().trim().min(1).max(40),
  numberPlate: z.string().trim().min(1).max(40),
  driverName: z.string().trim().max(255).optional().or(z.literal("")),
  routeName: z.string().trim().max(120).optional().or(z.literal("")),
  studentCount: z.number().int().min(0).optional(),
  status: z.string().trim().max(20).optional().or(z.literal("")),
});

async function GETHandler(req: Request) {
  try {
    const ctx = await requirePermission(VEHICLE_READ_PERMISSION);
    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.trim() || undefined;
    const vehicles = await listVehicles(ctx.tenantId, search);
    return ok({ vehicles });
  } catch (error) {
    console.error("[admin/vehicles][GET] Unexpected error:", error);
    return serverError();
  }
}

async function POSTHandler(req: Request) {
  try {
    const ctx = await requirePermission(VEHICLE_WRITE_PERMISSION);
    const input = vehicleSchema.parse(await req.json());

    const vehicle = await createVehicle({
      tenantId: ctx.tenantId,
      ...input,
    });

    return ok({ success: true, vehicle }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest("Invalid payload", error.flatten());
    }

    if (error instanceof Error && error.message.includes("already exists")) {
      return badRequest(error.message);
    }

    console.error("[admin/vehicles][POST] Unexpected error:", error);
    return serverError();
  }
}

export const GET = withApiObservability(GETHandler);
export const POST = withApiObservability(POSTHandler);
