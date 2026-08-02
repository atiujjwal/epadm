import { withApiObservability } from "@/lib/observability/api-handler";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import {
  createLibraryBook,
  LIBRARY_READ_PERMISSION,
  LIBRARY_WRITE_PERMISSION,
  listLibraryBooks,
} from "@/lib/admin/library";
import { badRequest, ok, serverError } from "@/lib/http/responses";

const libraryBookSchema = z.object({
  accession: z.string().trim().min(1).max(60),
  title: z.string().trim().min(2).max(255),
  author: z.string().trim().max(255).optional().or(z.literal("")),
  status: z.string().trim().max(20).optional().or(z.literal("")),
});

async function GETHandler(req: Request) {
  try {
    const ctx = await requirePermission(LIBRARY_READ_PERMISSION);
    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.trim() || undefined;
    const books = await listLibraryBooks(ctx.tenantId, search);
    return ok({ books });
  } catch (error) {
    console.error("[admin/library][GET] Unexpected error:", error);
    return serverError();
  }
}

async function POSTHandler(req: Request) {
  try {
    const ctx = await requirePermission(LIBRARY_WRITE_PERMISSION);
    const input = libraryBookSchema.parse(await req.json());

    const book = await createLibraryBook({
      tenantId: ctx.tenantId,
      ...input,
    });

    return ok({ success: true, book }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest("Invalid payload", error.flatten());
    }

    if (error instanceof Error && error.message.includes("already exists")) {
      return badRequest(error.message);
    }

    console.error("[admin/library][POST] Unexpected error:", error);
    return serverError();
  }
}

export const GET = withApiObservability(GETHandler);
export const POST = withApiObservability(POSTHandler);
