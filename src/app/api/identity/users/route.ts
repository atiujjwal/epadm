import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { z } from "zod";
import { registerUserForTenant } from "@/domains/identity-tenancy/services";
import { hashPassword } from "@/lib/auth/password";

const addUserSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  roleName: z.enum(["Admin", "Principal", "Teacher", "Parent",]),
});

export async function POST(req: NextRequest) {
  const client = await pool.connect();
  try {
    // Middleware Context
    const tenantId = req.headers.get("x-tenant-id");
    const userId = req.headers.get("x-user-id");
    if (!tenantId || !userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const data = addUserSchema.parse(body);

    // Transaction (User Create + Role Assign)
    await client.query("BEGIN");

    // TODO: In prod, trigger an email invite flow. Here we set a default pwd.
    const defaultHash = await hashPassword("School@123");

    const newUser = await registerUserForTenant(client, userId, tenantId, {
      ...data,
      passwordHash: defaultHash,
    });

    await client.query("COMMIT");

    return NextResponse.json({ data: newUser }, { status: 201 });
  } catch (error: any) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
