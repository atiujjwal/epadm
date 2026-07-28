import { requirePermission } from "@/lib/auth/guards";
import { redirect } from "next/navigation";

export default async function HumanResourcesPage() {
  await requirePermission("hr.read");
  redirect("/hr/staff");
}
