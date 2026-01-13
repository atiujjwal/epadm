import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { z } from "zod";
import {
  getUserByEmail,
  getTenantMembership,
  getTenantBySlug,
} from "@/domains/identity-tenancy/services";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken } from "@/lib/auth/token";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  tenantSlug: z.string(),
});

export async function POST(req: NextRequest) {
  const client = await pool.connect();
  try {
    const body = await req.json();
    const { email, password, tenantSlug } = loginSchema.parse(body);

    // Resolve Tenant
    const tenant = await getTenantBySlug(client, tenantSlug);
    if (!tenant || !tenant.isActive) {
      return NextResponse.json({ error: "Invalid Tenant" }, { status: 404 });
    }

    // Validate User
    const user = await getUserByEmail(client, email);
    if (!user || !user.passwordHash) {
      // Dummy check to prevent timing attacks
      await verifyPassword("dummy", "dummy");
      return NextResponse.json(
        { error: "Invalid Credentials" },
        { status: 401 }
      );
    }

    // Verify Password
    const isValid = await verifyPassword(user.passwordHash, password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid Credentials" },
        { status: 401 }
      );
    }

    // Check Tenant Membership (RBAC)
    const membership = await getTenantMembership(client, user.id, tenant.id);
    if (!membership) {
      return NextResponse.json(
        { error: "Access Denied to this School" },
        { status: 403 }
      );
    }

    // Generate Token
    const token = await createSessionToken({
      userId: user.id,
      tenantId: tenant.id,
      role: membership.roleName,
    });

    const response = NextResponse.json({
      success: true,
      role: membership.roleName,
    });

    // Set HTTP-Only Cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
