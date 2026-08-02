import { redirect } from "next/navigation";

export default function TenantAdminLegacy() {
  redirect("/administration/users");
}
