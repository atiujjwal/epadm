import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Tenant provisioning is available only from the platform admin CMS." },
    { status: 404 },
  );
}
