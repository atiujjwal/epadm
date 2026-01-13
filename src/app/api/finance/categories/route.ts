import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import {
  createFinanceCategory,
  getFinanceCategories,
} from "@/domains/finance/services";
import { CreateCategoryInput } from "@/domains/finance/types";

export async function POST(req: NextRequest) {
  const client = await pool.connect();
  try {
    // Context Extraction
    const tenantId = req.headers.get("x-tenant-id");
    const userId = req.headers.get("x-user-id");

    if (!tenantId || !userId) {
      return NextResponse.json(
        { error: "Unauthorized: Missing context" },
        { status: 401 }
      );
    }

    const body: CreateCategoryInput = await req.json();

    // Transaction & RLS Scope
    await client.query("BEGIN");
    await client.query(`SET app.current_tenant = '${tenantId}'`);

    // Service Execution
    const result = await createFinanceCategory(client, tenantId, userId, body);

    await client.query("COMMIT");
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("[Finance Category POST] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function GET(req: NextRequest) {
  const client = await pool.connect();
  try {
    const tenantId = req.headers.get("x-tenant-id");
    const userId = req.headers.get("x-user-id");

    if (!tenantId || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as "CREDIT" | "DEBIT" | undefined;

    await client.query(`SET app.current_tenant = '${tenantId}'`);

    const result = await getFinanceCategories(client, tenantId, userId, type);

    return NextResponse.json({ data: result });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
