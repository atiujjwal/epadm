import { NextResponse } from "next/server";
import { z } from "zod";
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { db, tenants, users, tenantUsers } from "@/lib/db";
import { opsDb, tenantServices, SERVICE_KEYS } from "@/lib/db/ops";
import { badRequest, serverError } from "@/lib/http/responses";

const registerSchema = z.object({
  name: z.string().trim().min(2, "School name must be at least 2 characters"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .transform((val) => val.toLowerCase()),
  adminName: z.string().trim().min(2, "Admin name must be at least 2 characters"),
  adminEmail: z.string().trim().email("Invalid email address").transform((val) => val.toLowerCase()),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = registerSchema.safeParse(json);

    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten());
    }

    const { name, slug, adminName, adminEmail, password } = parsed.data;

    // 1. Check if tenant slug already exists
    const existingTenant = await db.query.tenants.findFirst({
      where: eq(tenants.slug, slug),
    });

    if (existingTenant) {
      return badRequest("School subdomain slug is already registered");
    }

    // 2. Perform provision in a transaction
    const result = await db.transaction(async (tx) => {
      // Create the school tenant record
      const [newTenant] = await tx
        .insert(tenants)
        .values({
          name,
          slug,
          subscriptionTier: "pro",
          isActive: true,
        })
        .returning();

      // Check if user already exists in global users table
      let user = await tx.query.users.findFirst({
        where: eq(users.email, adminEmail),
      });

      if (!user) {
        const passwordHash = await argon2.hash(password);
        [user] = await tx
          .insert(users)
          .values({
            name: adminName,
            email: adminEmail,
            passwordHash,
            isVerified: true,
            isActive: true,
          })
          .returning();
      }

      // Associate user with the new tenant as admin
      await tx.insert(tenantUsers).values({
        tenantId: newTenant.id,
        userId: user.id,
        role: "admin",
        isActive: true,
      });

      // Enable default service keys for this tenant
      for (const serviceKey of SERVICE_KEYS) {
        await opsDb
          .insert(tenantServices)
          .values({
            tenantId: newTenant.id,
            serviceKey,
            isEnabled: true,
          })
          .onConflictDoNothing();
      }

      return {
        tenantId: newTenant.id,
        slug: newTenant.slug,
        adminEmail: user.email,
      };
    });

    return NextResponse.json({
      success: true,
      message: "School registered successfully",
      data: result,
    });
  } catch (error) {
    console.error("[register/route] Unexpected error:", error);
    return serverError();
  }
}
