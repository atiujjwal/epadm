import { getCtx } from "@/lib/context";
import { redirect } from "next/navigation";

export default async function TenantRootPage() {
  const ctx = await getCtx();

  if (ctx.role === "teacher" || ctx.role === "student") {
    redirect("/dashboard");
  }

  if (ctx.role === "admin") {
    redirect("/admin-dashboard");
  } else if (ctx.role === "accountant") {
    redirect("/fees");
  } else {
    redirect("/dashboard");
  }
}
