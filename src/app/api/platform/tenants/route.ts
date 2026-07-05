import { headers } from "next/headers";
import { z } from "zod";
import { requirePlatformOperator } from "@/lib/platform/context";
import {
  listTenants,
  provisionTenant,
} from "@/lib/platform/tenants";
import { badRequest, ok, serverError } from "@/lib/http/responses";

const provisionSchema = z.object({
  name: z.string().min(3).max(255),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .transform((value) => value.toLowerCase()),
  adminEmail: z.string().email(),
  subscriptionTier: z.enum(["basic", "pro", "enterprise"]),
});

export async function GET(req: Request) {
  try {
    await requirePlatformOperator();
    const url = new URL(req.url);
    const search = url.searchParams.get("search") ?? undefined;
    const page = Number(url.searchParams.get("page") ?? "1");
    const pageSize = Number(url.searchParams.get("pageSize") ?? "25");

    const result = await listTenants({ search, page, pageSize });
    return ok(result);
  } catch (error) {
    console.error("[platform/tenants][GET]", error);
    return serverError();
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await requirePlatformOperator();
    const requestHeaders = await headers();
    const body = provisionSchema.parse(await req.json());

    const result = await provisionTenant({
      ...body,
      operatorId: ctx.operatorId,
      ipAddress:
        requestHeaders.get("x-forwarded-for") ??
        requestHeaders.get("x-real-ip"),
      userAgent: requestHeaders.get("user-agent"),
    });

    return ok({ success: true, ...result }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest("Invalid payload", error.flatten());
    }

    if (error instanceof Error && error.message.includes("already exists")) {
      return badRequest(error.message);
    }

    console.error("[platform/tenants][POST]", error);
    return serverError();
  }
}
