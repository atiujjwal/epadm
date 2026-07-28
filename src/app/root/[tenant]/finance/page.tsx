import { requirePermission } from "@/lib/auth/guards";
import { redirect } from "next/navigation";

export default async function FinanceRedirectPage() {
  await requirePermission("finance.fees.read");
  redirect("/finance/fees");
}
