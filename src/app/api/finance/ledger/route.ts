import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { recordTransaction, getTransactions } from "@/domains/finance/services"; // Note: mapped getTransactions to getLedger service
import {
  CreateTransactionInput,
  TransactionFilters,
} from "@/domains/finance/types";

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

    const body: CreateTransactionInput = await req.json();

    // Transaction & RLS Scope
    // Transactions are crucial here to ensure the ledger entry and any potential
    // future side-effects (like updating budget balances) happen atomically.
    await client.query("BEGIN");
    await client.query(`SET app.current_tenant = '${tenantId}'`);

    // Service Execution
    const result = await recordTransaction(client, tenantId, userId, body);

    await client.query("COMMIT");
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("[Finance Ledger POST] Error:", error);

    // Distinguish known domain errors (e.g. "Invalid Category") from system errors
    const status = error.message === "Invalid Finance Category" ? 400 : 500;

    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: status }
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

    // Parse Query Parameters
    const { searchParams } = new URL(req.url);
    const filters: TransactionFilters = {
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      type: (searchParams.get("type") as "CREDIT" | "DEBIT") || undefined,
      entityUserId: searchParams.get("entityUserId") || undefined,
    };

    // Set RLS
    await client.query(`SET app.current_tenant = '${tenantId}'`);

    // Service Execution
    // Note: Ensure `getTransactions` is exported from services.ts (aliased as getLedger in previous steps if needed)
    const result = await getTransactions(client, tenantId, userId, filters);

    return NextResponse.json({ data: result });
  } catch (error: any) {
    console.error("[Finance Ledger GET] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
