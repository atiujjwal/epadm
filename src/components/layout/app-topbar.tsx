"use client";

import { useRouter } from "next/navigation";
import { fetchWithCsrf } from "@/lib/http/fetch-with-csrf";

export interface AppTopbarProps {
  workspaceName: string;
  userRole?: string;
  onOpenNav?: () => void;
  navOpen?: boolean;
  onSignOut?: () => void;
}

export function AppTopbar({
  workspaceName,
  userRole,
  onOpenNav,
  navOpen = false,
  onSignOut,
}: AppTopbarProps) {
  const router = useRouter();

  async function handleDefaultSignOut() {
    await fetchWithCsrf("/api/auth/logout", { method: "POST" });
    router.push("/#login");
    router.refresh();
  }

  const signOut = onSignOut ?? handleDefaultSignOut;
  const initials = deriveInitials(workspaceName);

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 active:bg-slate-100 lg:hidden focus:outline-none transition-colors duration-150"
          onClick={onOpenNav}
          aria-label="Open navigation menu"
          aria-controls="tenant-sidebar"
          aria-expanded={navOpen}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-slate-100 text-[11px] font-bold text-slate-700" aria-hidden="true">
            {initials}
          </span>
          <span className="text-sm font-bold text-slate-800">{workspaceName}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {userRole && (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200/50 capitalize" title="Your role in this workspace">
            {userRole}
          </span>
        )}
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 focus:outline-none transition-colors duration-150"
          onClick={signOut}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" className="text-slate-500">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7M13 16v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign out</span>
        </button>
      </div>
    </header>
  );
}

function deriveInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "•";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default AppTopbar;
