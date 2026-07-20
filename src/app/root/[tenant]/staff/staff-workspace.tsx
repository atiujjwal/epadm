"use client";

import { ModuleShell, type ModuleFlow } from "@/components/workspace/module-shell";
import type { InnerRailGroup } from "@/components/workspace/inner-rail";
import { StaffRegistry } from "./staff-registry";
import { Home, UserPlus, Users2, FileBarChart2, IdCard, Cake, Building2 } from "lucide-react";

type StaffRecord = {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  jobTitle: string | null;
  employmentType: string;
  status: string;
  notes: string | null;
  joinedOn: string | null;
  createdAt: Date | string;
};

type Props = {
  initialStaff: StaffRecord[];
  total: number;
  active: number;
};

const rail: InnerRailGroup[] = [
  {
    label: "Operate",
    items: [
      { id: "dashboard", label: "Dashboard", icon: <Home className="h-3.5 w-3.5" /> },
      { id: "list", label: "All Staff", icon: <Users2 className="h-3.5 w-3.5" /> },
      { id: "departments", label: "Departments", icon: <Building2 className="h-3.5 w-3.5" /> },
      { id: "add", label: "Add Staff", icon: <UserPlus className="h-3.5 w-3.5" /> },
      { id: "notes", label: "Notes", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
      { id: "id-card", label: "ID Cards", icon: <IdCard className="h-3.5 w-3.5" /> },
      { id: "birthdays", label: "Birthdays", icon: <Cake className="h-3.5 w-3.5" /> },
    ],
  },
  {
    label: "Reports",
    items: [
      { id: "register", label: "Register", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
      { id: "download", label: "Download", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
      { id: "verify", label: "Verify", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
    ],
  },
];

function buildFlows(staff: StaffRecord[], total: number, active: number) {
  const rows = staff.slice(0, 20).map((s) => [
    s.employeeCode,
    s.fullName,
    s.department ?? "—",
    s.jobTitle ?? "—",
    s.status,
  ]);

  const mk = (title: string, subtitle: string, extra?: Partial<ModuleFlow>): ModuleFlow => ({
    title,
    subtitle,
    columns: ["Emp ID", "Name", "Department", "Designation", "Status"],
    rows,
    ...extra,
  });

  return {
    dashboard: {
      title: "Staff Dashboard",
      subtitle: "Workforce overview",
      stats: [
        { label: "Total", value: String(total) },
        { label: "Active", value: String(active) },
        { label: "Departments", value: "—" },
        { label: "On leave", value: "—" },
      ],
      columns: ["Department", "Headcount", "Active", "Vacancies", "Status"],
      rows: [["Administration", "24", "22", "2", "Active"]],
    },
    list: {
      ...mk("All Staff", "Live staff directory"),
      content: <StaffRegistry initialStaff={staff} />,
    },
    departments: mk("Departments", "Department master"),
    add: {
      title: "Add Staff",
      subtitle: "Create a new staff record",
      content: <StaffRegistry initialStaff={staff} />,
    },
    notes: mk("Notes", "Staff notes"),
    "id-card": mk("ID Cards", "Generate staff ID cards", { primaryAction: "Generate PDF" }),
    birthdays: mk("Birthdays", "Upcoming birthdays"),
    register: mk("Register", "Staff register export"),
    download: mk("Download", "Export staff list"),
    verify: mk("Verify", "Document verification queue"),
  } satisfies Record<string, ModuleFlow>;
}

export function StaffWorkspace({ initialStaff, total, active }: Props) {
  return (
    <ModuleShell
      title="Staff"
      subtitle={`${total.toLocaleString()} staff records · live registry`}
      rail={rail}
      flows={buildFlows(initialStaff, total, active)}
      defaultFlow="dashboard"
    />
  );
}
