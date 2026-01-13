import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import {
  createTenant,
  getTenantBySlug,
} from "@/domains/identity-tenancy/services";

export async function POST(req: NextRequest) {
  //TODO: Only Super Admin should hit this (System level auth required)
  const client = await pool.connect();
  try {
    const body = await req.json();
    const result = await createTenant(client, body);
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function GET(req: NextRequest) {
  const client = await pool.connect();
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug)
      return NextResponse.json({ error: "Slug required" }, { status: 400 });

    const result = await getTenantBySlug(client, slug);
    if (!result)
      return NextResponse.json({ error: "Not Found" }, { status: 404 });

    return NextResponse.json({ data: result });
  } finally {
    client.release();
  }
}
