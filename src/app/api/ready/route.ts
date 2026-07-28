import { withApiObservability } from "@/lib/observability/api-handler";
async function GETHandler() {
  return Response.json({ status: "ready" });
}

export const GET = withApiObservability(GETHandler);
