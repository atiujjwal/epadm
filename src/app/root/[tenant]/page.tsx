import { getCtx } from "@/lib/context";
import { getRoleHomePath } from "@/lib/navigation/route-registry";
import { redirect } from "next/navigation";

export default async function TenantRootPage() {
  const ctx = await getCtx();
  redirect(getRoleHomePath(ctx.role));
}
