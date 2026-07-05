import { getCtx } from "@/lib/context";
import { redirect } from "next/navigation";

export default async function TenantRootPage() {
  const ctx = await getCtx();

  if (ctx.role === "admin") {
    redirect("/admin-dashboard");
  } else if (ctx.role === "teacher") {
    redirect("/teacher/home");
  } else if (ctx.role === "student") {
    redirect("/student/home");
  } else if (ctx.role === "accountant") {
    redirect("/finance");
  } else {
    redirect("/login");
  }
}
