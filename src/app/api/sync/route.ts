import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import {
  processPullSync,
  processPushSync,
} from "@/domains/mobile-sync/services";

export async function GET(req: NextRequest) {
  const client = await pool.connect();
  try {
    // Extract Context
    const tenantId = req.headers.get("x-tenant-id");
    const userId = req.headers.get("x-user-id");
    const deviceId = req.headers.get("x-device-id") || undefined;

    if (!tenantId || !userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const lastPulledAt = parseInt(
      searchParams.get("last_pulled_at") || "0",
      10
    );

    // RLS Context (Read-Only)
    await client.query(`SET app.current_tenant = '${tenantId}'`);

    // Execute Pull
    const result = await processPullSync(
      client,
      tenantId,
      userId,
      lastPulledAt,
      deviceId
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Sync Pull Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function POST(req: NextRequest) {
  const client = await pool.connect();
  try {
    // Extract Context
    const tenantId = req.headers.get("x-tenant-id");
    const userId = req.headers.get("x-user-id");
    const deviceId = req.headers.get("x-device-id") || undefined;

    if (!tenantId || !userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // Transaction Scope (Critical for Push Integrity)
    await client.query("BEGIN");
    await client.query(`SET app.current_tenant = '${tenantId}'`);

    await processPushSync(client, tenantId, userId, body, deviceId);

    await client.query("COMMIT");
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Sync Push Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
