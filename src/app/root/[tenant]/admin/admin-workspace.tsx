"use client";

import { ModuleShell, type ModuleFlow } from "@/components/workspace/module-shell";
import type { InnerRailGroup } from "@/components/workspace/inner-rail";
import { TenantUserManagement } from "../users/tenant-user-management";
import { Home, Users, ShieldCheck, KeyRound, UserCog, Repeat2, LogIn, AlertTriangle, ListChecks, Scale, ScrollText } from "lucide-react";

type UserRole =
  | "superadmin"
  | "admin"
  | "teacher"
  | "student"
  | "parent"
  | "hr"
  | "staff"
  | "accountant"
  | "librarian";

type TenantMemberRecord = {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  joinedAt: string;
  isVerified: boolean;
};

type Props = {
  initialMembers: TenantMemberRecord[];
  roleOptions: readonly UserRole[];
};

const rail: InnerRailGroup[] = [
  {
    label: "Users",
    items: [
      { id: "dash", label: "Dashboard", icon: <Home className="h-3.5 w-3.5" /> },
      { id: "users", label: "Platform Users", icon: <Users className="h-3.5 w-3.5" /> },
      { id: "add", label: "Add User", icon: <UserCog className="h-3.5 w-3.5" /> },
      { id: "reset", label: "Reset Password", icon: <KeyRound className="h-3.5 w-3.5" /> },
      { id: "switch", label: "Switch User", icon: <Repeat2 className="h-3.5 w-3.5" /> },
      { id: "master", label: "User Master", icon: <ListChecks className="h-3.5 w-3.5" /> },
    ],
  },
  {
    label: "Roles & Access",
    items: [
      { id: "roles", label: "Roles", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
      { id: "perm", label: "Permissions Matrix", icon: <Scale className="h-3.5 w-3.5" /> },
      { id: "assign", label: "Assign Roles", icon: <UserCog className="h-3.5 w-3.5" /> },
      { id: "scope", label: "Privilege Scope", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
      { id: "role-master", label: "Role Master", icon: <ListChecks className="h-3.5 w-3.5" /> },
    ],
  },
  {
    label: "Audit",
    items: [
      { id: "logins", label: "Last 100 Logins", icon: <LogIn className="h-3.5 w-3.5" /> },
      { id: "failures", label: "Last 100 Failures", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
      { id: "audit", label: "Audit Log", icon: <ScrollText className="h-3.5 w-3.5" /> },
    ],
  },
];

function buildFlows(members: TenantMemberRecord[], roleOptions: readonly UserRole[]) {
  const memberRows = members.map((m) => [m.name, m.email, m.role, m.isActive ? "Active" : "Inactive", m.joinedAt.slice(0, 10)]);

  const mk = (title: string, subtitle: string, extra?: Partial<ModuleFlow>): ModuleFlow => ({
    title,
    subtitle,
    columns: ["Name", "Email", "Role", "Status", "Joined"],
    rows: memberRows,
    ...extra,
  });

  return {
    dash: {
      title: "Admin Dashboard",
      subtitle: "Platform users and access posture",
      ai: `${members.filter((m) => !m.isActive).length} inactive members. ${members.filter((m) => m.role === "admin").length} admin accounts.`,
      stats: [
        { label: "Members", value: String(members.length) },
        { label: "Active", value: String(members.filter((m) => m.isActive).length) },
        { label: "Admins", value: String(members.filter((m) => m.role === "admin").length) },
        { label: "Teachers", value: String(members.filter((m) => m.role === "teacher").length) },
      ],
      columns: ["Role", "Count", "Active", "Verified", "Status"],
      rows: roleOptions.map((role) => [
        role,
        String(members.filter((m) => m.role === role).length),
        String(members.filter((m) => m.role === role && m.isActive).length),
        String(members.filter((m) => m.role === role && m.isVerified).length),
        "OK",
      ]),
    },
    users: {
      ...mk("Platform Users", "Live tenant membership directory"),
      content: <TenantUserManagement initialMembers={members} roleOptions={roleOptions} />,
    },
    add: {
      title: "Add User",
      subtitle: "Invite a new platform user",
      content: <TenantUserManagement initialMembers={members} roleOptions={roleOptions} />,
    },
    reset: mk("Reset Password", "Password reset workflow"),
    switch: mk("Switch User", "Impersonation / switch context"),
    master: mk("User Master", "Canonical user directory"),
    roles: mk("Roles", "Role definitions"),
    perm: mk("Permissions Matrix", "Module × permission grid"),
    assign: mk("Assign Roles", "Bulk role assignment"),
    scope: mk("Privilege Scope", "Data scope by role"),
    "role-master": mk("Role Master", "Role catalogue"),
    logins: mk("Last 100 Logins", "Recent successful logins"),
    failures: mk("Last 100 Failures", "Failed login attempts"),
    audit: mk("Audit Log", "Platform audit trail"),
  } satisfies Record<string, ModuleFlow>;
}

export function AdminWorkspace({ initialMembers, roleOptions }: Props) {
  const flows = buildFlows(initialMembers, roleOptions);
  return (
    <ModuleShell
      title="App Admin (RBAC)"
      subtitle={`${initialMembers.length} platform users · roles & audit`}
      rail={rail}
      flows={flows}
      defaultFlow="dash"
    />
  );
}
