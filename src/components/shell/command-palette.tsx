"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Send, Sparkles } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { getRouteIcon } from "@/components/shell/route-icons";
import type { ClientRouteDefinition } from "@/lib/navigation/route-registry";

const quickActions = [
  { label: "Add new student", icon: Plus, href: "/students?tab=add" },
  { label: "Send a fee reminder", icon: Send, href: "/finance/fees?tab=reminder" },
  { label: "Ask Copilot about at-risk students", icon: Sparkles, href: "/ai-studio" },
];

export function CommandPalette({
  open,
  onOpenChange,
  authorizedRoutes,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  authorizedRoutes: ClientRouteDefinition[];
}) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange, open]);

  const navigationRoutes = authorizedRoutes.flatMap((route) => [
    route,
    ...(route.children ?? []),
  ]).filter((route) => route.showInCommandPalette && !route.comingSoon);

  const navigate = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search pages or run a command…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {navigationRoutes.map((route) => {
            const Icon = getRouteIcon(route.iconKey);
            return (
              <CommandItem key={route.key} onSelect={() => navigate(route.path)}>
                {Icon ? <Icon className="mr-2 h-3.5 w-3.5" /> : null}
                {route.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick actions">
          {quickActions.map((action) => (
            <CommandItem key={action.label} onSelect={() => navigate(action.href)}>
              <action.icon className="mr-2 h-3.5 w-3.5" />
              {action.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
