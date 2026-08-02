import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { tenantIntegrations, tenantUsers } from "@/lib/db";
import { opsDb } from "@/lib/db/ops";
import { and, eq } from "drizzle-orm";
import { phase7ApiError, recordPayment } from "@/lib/phase7/finance";

const schema = z.object({ tenantId: z.string().uuid(), invoiceId: z.string().uuid(), amountPaise: z.coerce.number().int().positive(), referenceNumber: z.string(), gateway: z.string().default("online"), paymentDate: z.string().optional() }).passthrough();

function safeEqual(a: string, b: string) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    const body = schema.parse(JSON.parse(raw));
    const signature = request.headers.get("x-gateway-signature") ?? "";
    const integration = await opsDb.query.tenantIntegrations.findFirst({ where: eq(tenantIntegrations.tenantId, body.tenantId) });
    const config = integration?.config as { webhookSecret?: string } | null;
    if (config?.webhookSecret) {
      const expected = createHmac("sha256", config.webhookSecret).update(raw).digest("hex");
      if (!safeEqual(signature, expected)) return Response.json({ error: "Invalid signature" }, { status: 401 });
    }
    const collector = await opsDb.query.tenantUsers.findFirst({ where: and(eq(tenantUsers.tenantId, body.tenantId), eq(tenantUsers.membershipStatus, "active"), eq(tenantUsers.isActive, true)) });
    if (!collector) return Response.json({ ok: true, skipped: true, reason: "No active collector user" });
    const result = await recordPayment(body.tenantId, collector.userId, { invoiceId: body.invoiceId, amountPaise: body.amountPaise, paymentMethod: "online", paymentDate: body.paymentDate ?? new Date().toISOString().slice(0, 10), referenceNumber: body.referenceNumber, gatewayPayload: body });
    return Response.json({ ok: true, result });
  } catch (error) {
    if (error instanceof SyntaxError) return Response.json({ ok: true, skipped: true });
    return phase7ApiError(error);
  }
}
