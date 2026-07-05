"use client";

import { useRouter } from "next/navigation";
import { fetchWithCsrf } from "@/lib/http/fetch-with-csrf";

export function PlatformSignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await fetchWithCsrf("/api/platform/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="text-xs font-medium text-amber-400 hover:text-amber-300"
    >
      Sign out
    </button>
  );
}
