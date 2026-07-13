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
    // parent / staff / librarian have no dedicated portal yet — land them on the
    // generic tenant dashboard. This MUST be a terminal page with no role guard:
    // redirecting to "/login" here loops (the proxy bounces an authenticated
    // "/login" back to "/", which re-enters this page).
    redirect("/dashboard");
  }
}
