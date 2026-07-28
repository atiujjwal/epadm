"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, Command, Menu, Search, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchWithCsrf } from "@/lib/http/fetch-with-csrf";

export type ShellSession = {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  planTier: string;
  primaryRole: string;
  userId: string;
  userName: string;
  logoUrl?: string | null;
};

function initials(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "EP";
}

export function Topbar({
  session,
  activeAcademicYear,
  academicYears,
  onOpenCommand,
  onOpenMobileNav,
}: {
  session: ShellSession;
  activeAcademicYear: string;
  academicYears: string[];
  onOpenCommand: () => void;
  onOpenMobileNav: () => void;
}) {
  const router = useRouter();

  async function signOut() {
    await fetchWithCsrf("/api/auth/logout", { method: "POST" });
    router.push("/#login");
    router.refresh();
  }

  return (
    <header className="z-topbar flex h-14 shrink-0 items-center gap-2 border-b bg-surface px-3">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </Button>

      <div className="flex min-w-0 items-center gap-2">
        <Avatar className="h-7 w-7 rounded-md">
          {session.logoUrl ? <AvatarImage src={session.logoUrl} alt="" /> : null}
          <AvatarFallback className="rounded-md bg-primary text-[10px] font-semibold text-primary-foreground">
            {initials(session.tenantName)}
          </AvatarFallback>
        </Avatar>
        <div className="hidden min-w-0 sm:block">
          <p className="max-w-44 truncate text-xs font-semibold">{session.tenantName}</p>
          <p className="text-[10px] text-muted-foreground">{session.planTier} plan</p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="mx-auto hidden md:inline-flex">
            AY {activeAcademicYear}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-52">
          <DropdownMenuLabel>Academic year context</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {academicYears.length > 0 ? academicYears.map((year) => (
            <DropdownMenuItem key={year}>{year}</DropdownMenuItem>
          )) : (
            <DropdownMenuItem disabled>Not configured</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        type="button"
        onClick={onOpenCommand}
        className="ml-auto hidden h-8 w-full max-w-sm items-center gap-2 rounded-md border bg-background px-2.5 text-muted-foreground transition-colors hover:bg-muted sm:flex"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="truncate text-xs">Search pages and actions…</span>
        <kbd className="ml-auto inline-flex items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="px-3 py-8 text-center text-xs text-muted-foreground">
            You’re all caught up.
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open profile menu">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-[10px] font-semibold">
                {initials(session.userName)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <span className="block truncate">{session.userName}</span>
            <span className="block text-[10px] font-normal capitalize text-muted-foreground">
              {session.primaryRole}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/me/profile"><User className="mr-2 h-4 w-4" />My Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
