"use client";

import { useRouter } from "next/navigation";
import { fetchWithCsrf } from "@/lib/http/fetch-with-csrf";

export interface AppTopbarProps {
  /** Workspace (tenant / operator org) name shown on the left. */
  workspaceName: string;
  /** Current user's role, shown as a compact badge next to the profile. */
  userRole?: string;
  /** Opens the mobile navigation drawer. Shown only below the md breakpoint. */
  onOpenNav?: () => void;
  /** Controls the hamburger's aria-expanded / aria-controls wiring. */
  navOpen?: boolean;
  /** Override the default POST /api/auth/logout → /login sign-out flow. */
  onSignOut?: () => void;
}

/**
 * AppTopbar
 *
 * Persistent application header that spans the content pane of the authenticated
 * shell. It carries workspace identity on the left and the signed-in user's
 * identity + sign-out on the right, and hosts the mobile navigation trigger so
 * the app has a single header rather than a separate marketing-style bar.
 *
 * Deliberately does not include search or notifications: those require real
 * backing data and would otherwise be non-functional placeholders.
 */
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
    router.push("/login");
    router.refresh();
  }

  const signOut = onSignOut ?? handleDefaultSignOut;
  const initials = deriveInitials(workspaceName);

  return (
    <header className="app-topbar">
      <div className="app-topbar__left">
        <button
          type="button"
          className="app-topbar__hamburger"
          onClick={onOpenNav}
          aria-label="Open navigation menu"
          aria-controls="tenant-sidebar"
          aria-expanded={navOpen}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="app-topbar__workspace">
          <span className="app-topbar__workspace-avatar" aria-hidden="true">
            {initials}
          </span>
          <span className="app-topbar__workspace-name">{workspaceName}</span>
        </div>
      </div>

      <div className="app-topbar__right">
        {userRole && (
          <span className="app-topbar__role" title="Your role in this workspace">
            {userRole}
          </span>
        )}
        <button type="button" className="app-topbar__signout" onClick={signOut}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7M13 16v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign out</span>
        </button>
      </div>
    </header>
  );
}

/** First letters of the first two words, uppercased — e.g. "Springfield High" → "SH". */
function deriveInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "•";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default AppTopbar;
