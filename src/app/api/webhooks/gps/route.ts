export async function POST() {
  return Response.json({ error: "This legacy endpoint has been removed. Use /api/v1/transport/tracking/webhook." }, { status: 410 });
}
