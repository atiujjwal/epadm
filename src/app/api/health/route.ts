import { withApiObservability } from "@/lib/observability/api-handler";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export async function createHealthResponse(checkDatabase: () => Promise<unknown>) {
  try {
    await checkDatabase();
    return Response.json({
      status: "ok",
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? "dev",
      timestamp: new Date().toISOString(),
      db: "connected",
    });
  } catch {
    return Response.json(
      { status: "error", db: "disconnected" },
      { status: 503 },
    );
  }
}

async function GETHandler() {
  return createHealthResponse(() => db.execute(sql`select 1`));
}

export const GET = withApiObservability(GETHandler);
