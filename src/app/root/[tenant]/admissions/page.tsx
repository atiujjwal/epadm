import { listAdmissions } from "@/lib/admin/admissions";
import { getCtx } from "@/lib/context";
import { AdmissionsWorkspace } from "./admissions-workspace";

export default async function AdmissionsPage() {
  const ctx = await getCtx();
  const admissions = await listAdmissions(ctx.tenantId);

  return <AdmissionsWorkspace initialAdmissions={admissions} />;
}
