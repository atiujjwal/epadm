import { listMobileFlags } from "@/lib/admin/mobile";
import { getCtx } from "@/lib/context";
import { MobileWorkspace } from "./mobile-workspace";

export default async function MobilePage() {
  const ctx = await getCtx();
  const flags = await listMobileFlags(ctx.tenantId);
  return <MobileWorkspace initialFlags={flags} />;
}
