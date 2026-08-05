export async function GET() {
  return Response.json({ error: "This legacy endpoint has been removed. Use /api/v1/transport/fleet." }, { status: 410 });
}

export async function POST() {
  return Response.json({ error: "This legacy endpoint has been removed. Use /api/v1/transport/fleet." }, { status: 410 });
}
