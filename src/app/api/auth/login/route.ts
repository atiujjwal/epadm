import { withApiObservability } from "@/lib/observability/api-handler";
import { NextResponse } from "next/server";
import { z } from "zod";
import argon2 from "argon2";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { opsDb, tenants, tenantUsers, users } from "@/lib/db/ops";
import { createSessionToken } from "@/lib/auth/token";
import { setTenantActiveCache } from "@/lib/platform/tenant-cache";
import { badRequest, serverError, unauthorized } from "@/lib/http/responses";
import type { UserRole } from "@/lib/db";

const loginSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(6),
  tenantSlug: z
    .string()
    .trim()
    .min(1)
    .transform((value) => value.toLowerCase()),
});

async function POSTHandler(req: Request) {
  try {
    const json = await req.json();
    const { email, password, tenantSlug } = loginSchema.parse(json);

    const [tenant] = await opsDb
      .select()
      .from(tenants)
      .where(and(eq(tenants.slug, tenantSlug), eq(tenants.isActive, true)))
      .limit(1);

    if (!tenant) {
      return badRequest("Invalid school identifier");
    }

    await setTenantActiveCache(tenant.id, tenant.isActive);

    const [row] = await opsDb
      .select({
        userId: users.id,
        passwordHash: users.passwordHash,
        role: tenantUsers.role,
      })
      .from(users)
      .innerJoin(
        tenantUsers,
        and(
          eq(tenantUsers.userId, users.id),
          eq(tenantUsers.tenantId, tenant.id),
          eq(tenantUsers.isActive, true),
        ),
      )
      .where(and(eq(users.email, email), eq(users.isActive, true)))
      .limit(1);

    if (!row) {
      return unauthorized("Invalid email or password");
    }

    const valid = await argon2.verify(row.passwordHash, password);
    if (!valid) {
      return unauthorized("Invalid email or password");
    }

    await opsDb
      .update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, row.userId));

    const token = await createSessionToken({
      tenantId: tenant.id,
      userId: row.userId,
      role: row.role as UserRole,
      planTier: tenant.subscriptionTier as "basic" | "pro" | "enterprise",
    });

    const res = NextResponse.json({ success: true });

    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest("Invalid payload", error.flatten());
    }

    console.error("[auth/login] Unexpected error:", error);
    return serverError();
  }
}

export const POST = withApiObservability(POSTHandler);
