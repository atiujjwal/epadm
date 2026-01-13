import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { z } from "zod";
import { bootstrapTenant } from "@/domains/identity-tenancy/services";
import { verifySuperAdmin } from "@/lib/auth/super-admin";

const bootstrapSchema = z.object({
  name: z.string().min(3),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  subscriptionTier: z.enum(["FOUNDATION", "GROWTH", "ENTERPRISE"]).optional(),
  adminEmail: z.string().email(),
  adminName: z.string().min(2),
});

export async function POST(req: NextRequest) {
  const client = await pool.connect();
  try {
    // Super Admin Guard
    verifySuperAdmin(req);

    // Validate
    const body = await req.json();
    const data = bootstrapSchema.parse(body);

    // Transactional Bootstrap
    await client.query("BEGIN");

    const result = await bootstrapTenant(client, data);

    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        data: {
          tenant: result.tenant,
          admin: { email: result.adminUser.email, id: result.adminUser.id },
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
