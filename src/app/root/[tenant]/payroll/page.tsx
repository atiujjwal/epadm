import { listPayroll } from "@/lib/admin/payroll";
import { getCtx } from "@/lib/context";
import { PayrollWorkspace } from "./payroll-workspace";

export default async function PayrollPage() {
  const ctx = await getCtx();
  const payroll = await listPayroll(ctx.tenantId);

  return <PayrollWorkspace initialPayroll={payroll} />;
}
