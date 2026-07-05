import { headers } from "next/headers";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import {
  createStaffProfile,
  listStaff,
  STAFF_READ_PERMISSION,
  STAFF_WRITE_PERMISSION,
} from "@/lib/admin/registries";
import { badRequest, ok, serverError } from "@/lib/http/responses";

const staffSchema = z.object({
  employeeCode: z.string().trim().min(2).max(40),
  fullName: z.string().trim().min(2).max(255),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  department: z.string().trim().max(120).optional().or(z.literal("")),
  jobTitle: z.string().trim().max(120).optional().or(z.literal("")),
  employmentType: z.string().trim().max(40).optional().or(z.literal("")),
  joinedOn: z.string().trim().optional().or(z.literal("")),
  status: z.string().trim().max(20).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export async function GET(req: Request) {
  try {
    const ctx = await requirePermission(STAFF_READ_PERMISSION);
    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.trim() || undefined;
    const staff = await listStaff(ctx.tenantId, search);
    return ok({ staff });
  } catch (error) {
    console.error("[admin/staff][GET] Unexpected error:", error);
    return serverError();
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await requirePermission(STAFF_WRITE_PERMISSION);
    const requestHeaders = await headers();
    const input = staffSchema.parse(await req.json());

    const staff = await createStaffProfile({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      ...input,
      ipAddress:
        requestHeaders.get("x-forwarded-for") ??
        requestHeaders.get("x-real-ip") ??
        null,
      userAgent: requestHeaders.get("user-agent"),
    });

    return ok({ success: true, staff }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest("Invalid payload", error.flatten());
    }

    if (error instanceof Error && error.message.includes("already exists")) {
      return badRequest(error.message);
    }

    console.error("[admin/staff][POST] Unexpected error:", error);
    return serverError();
  }
}
