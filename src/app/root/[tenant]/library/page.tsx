import { listLibraryBooks } from "@/lib/admin/library";
import { getCtx } from "@/lib/context";
import { LibraryWorkspace } from "./library-workspace";

export default async function LibraryPage() {
  const ctx = await getCtx();
  const books = await listLibraryBooks(ctx.tenantId);

  return <LibraryWorkspace initialBooks={books} />;
}
