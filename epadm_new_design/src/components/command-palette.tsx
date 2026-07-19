import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
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

const nav = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Students", to: "/students", icon: Users },
  { label: "Admissions", to: "/admissions", icon: GraduationCap },
  { label: "Attendance", to: "/attendance", icon: ClipboardCheck },
  { label: "Timetable", to: "/timetable", icon: CalendarDays },
  { label: "Fees", to: "/fees", icon: Wallet },
  { label: "Exams", to: "/exams", icon: BookOpenCheck },
  { label: "Communications", to: "/communications", icon: MessageSquare },
  { label: "Staff", to: "/staff", icon: UserCog },
  { label: "AI Insights", to: "/intelligence", icon: Sparkles },
  { label: "Settings", to: "/settings", icon: Settings },
] as const;

export function CommandPalette({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const navigate = useNavigate();

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

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search or run a command…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {nav.map((n) => (
            <CommandItem
              key={n.to}
              onSelect={() => {
                setOpen(false);
                navigate({ to: n.to });
              }}
            >
              <n.icon className="mr-2 h-3.5 w-3.5" />
              {n.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick actions">
          <CommandItem>
            <Plus className="mr-2 h-3.5 w-3.5" /> Add new student
          </CommandItem>
          <CommandItem>
            <Send className="mr-2 h-3.5 w-3.5" /> Send fee reminder to overdue accounts
          </CommandItem>
          <CommandItem>
            <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" /> Ask Copilot: "Who's at risk this week?"
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
