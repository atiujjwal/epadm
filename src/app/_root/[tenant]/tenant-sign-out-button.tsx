"use client";

import { useRouter } from "next/navigation";
import { fetchWithCsrf } from "@/lib/http/fetch-with-csrf";

export function TenantSignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await fetchWithCsrf("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="mt-4 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-red-50 hover:text-red-700"
    >
      Sign out
    </button>
  );
}
