import { withApiObservability } from "@/lib/observability/api-handler";
import { NextResponse } from "next/server";

async function POSTHandler() {
  return NextResponse.json(
    { error: "Tenant provisioning is available only from the platform admin CMS." },
    { status: 404 },
  );
}

export const POST = withApiObservability(POSTHandler);
