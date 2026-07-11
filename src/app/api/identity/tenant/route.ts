import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { opsDb, tenants } from "@/lib/db/ops";
import { badRequest, notFound, serverError } from "@/lib/http/responses";

const querySchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .transform((value) => value.toLowerCase()),
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams);
    const { slug } = querySchema.parse({ slug: params.slug });

    const [tenant] = await opsDb
      .select({
        id: tenants.id,
        name: tenants.name,
        slug: tenants.slug,
        subscriptionTier: tenants.subscriptionTier,
        isActive: tenants.isActive,
      })
      .from(tenants)
      .where(and(eq(tenants.slug, slug), eq(tenants.isActive, true)))
      .limit(1);

    if (!tenant) {
      return notFound("Tenant not found");
    }

    return NextResponse.json(tenant);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest("Invalid query", error.flatten());
    }

    console.error("[identity/tenant] Unexpected error:", error);
    return serverError();
  }
}

