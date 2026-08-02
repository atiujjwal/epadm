import { requirePermission } from "@/lib/auth/guards";
import { lookupIsbn } from "@/lib/phase9/library";
import { phase9ApiError } from "@/lib/phase9/transport";

export async function GET(request: Request) {
  await requirePermission("library.read");
  try {
    const isbn = new URL(request.url).searchParams.get("isbn") ?? "";
    return Response.json(await lookupIsbn(isbn));
  } catch (error) {
    return phase9ApiError(error);
  }
}
