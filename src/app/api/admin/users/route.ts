import { headers } from "next/headers";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { USER_ROLES, type UserRole } from "@/lib/db";
import { badRequest, ok, serverError } from "@/lib/http/responses";
import {
  ADMIN_MEMBER_READ_PERMISSION,
  ADMIN_MEMBER_WRITE_PERMISSION,
  createTenantMember,
  listTenantMembers,
} from "@/lib/admin/tenant-users";

const createTenantUserSchema = z.object({
  name: z.string().trim().min(2).max(255),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  role: z.enum(USER_ROLES),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
});

export async function GET() {
  try {
    const ctx = await requirePermission(ADMIN_MEMBER_READ_PERMISSION);
    const members = await listTenantMembers(ctx.tenantId);
    return ok({ members });
  } catch (error) {
    console.error("[admin/users][GET] Unexpected error:", error);
    return serverError();
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await requirePermission(ADMIN_MEMBER_WRITE_PERMISSION);
    const requestHeaders = await headers();
    const body = await req.json();
    const input = createTenantUserSchema.parse(body);

    const createdMember = await createTenantMember({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      actorRole: ctx.role,
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role as UserRole,
      phone: input.phone || undefined,
      ipAddress:
        requestHeaders.get("x-forwarded-for") ??
        requestHeaders.get("x-real-ip") ??
        null,
      userAgent: requestHeaders.get("user-agent"),
    });

    return ok({ success: true, member: createdMember }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest("Invalid payload", error.flatten());
    }

    if (error instanceof Error && error.message.includes("already exists")) {
      return badRequest(error.message);
    }

    console.error("[admin/users][POST] Unexpected error:", error);
    return serverError();
  }
}
