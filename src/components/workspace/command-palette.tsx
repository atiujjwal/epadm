"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardCheck,
  CalendarDays,
  Wallet,
  BookOpenCheck,
  MessageSquare,
  UserCog,
  Sparkles,
  Settings,
  Plus,
  Send,
} from "lucide-react";
import { NAV } from "@/lib/navigation/module-registry";

const ROLE_RULES: Record<string, string[] | undefined> = {
  payroll: ["admin", "accountant"],
  fees: ["admin", "accountant"],
  admin: ["admin"],
  settings: ["admin"],
};

function canAccessModule(key: string, role: string) {
  const allowed = ROLE_RULES[key];
  return !allowed || allowed.includes(role);
}

const quickActions = [
  { label: "Add new student", icon: Plus, href: "/students?tab=add" },
  { label: "Send fee reminder to overdue accounts", icon: Send, href: "/fees?tab=reminder" },
  {
    label: 'Ask Copilot: "Who\'s at risk this week?"',
    icon: Sparkles,
    href: "/dashboard",
  },
] as const;

export function CommandPalette({
  open,
  setOpen,
  role,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  role: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  const navItems = NAV.flatMap((group) =>
    group.modules
      .filter((m) => canAccessModule(m.key, role))
      .map((m) => ({ label: m.title, to: m.url })),
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search or run a command…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {navItems.map((n) => (
            <CommandItem
              key={n.to}
              onSelect={() => {
                setOpen(false);
                router.push(n.to);
              }}
            >
              <LayoutDashboard className="mr-2 h-3.5 w-3.5" />
              {n.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick actions">
          {quickActions.map((action) => (
            <CommandItem
              key={action.label}
              onSelect={() => {
                setOpen(false);
                router.push(action.href);
              }}
            >
              <action.icon className="mr-2 h-3.5 w-3.5" />
              {action.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
