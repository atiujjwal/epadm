import { createFileRoute } from "@tanstack/react-router";
import { ModuleShell } from "@/components/module-shell";
import type { InnerRailGroup } from "@/components/inner-rail";
import type { ModuleFlow } from "@/components/module-shell";
import { Home, Users, ShieldCheck, KeyRound, UserCog, Repeat2, LogIn, AlertTriangle, ListChecks, Scale, ScrollText } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "App Admin · EPADM" }, { name: "description", content: "Platform users, roles, permissions and audit — separate from staff." }] }),
  component: AdminPage,
});

const rail: InnerRailGroup[] = [
  { label: "Users", items: [
    { id: "dash", label: "Dashboard", icon: <Home className="h-3.5 w-3.5" /> },
    { id: "users", label: "Platform Users", count: 42, icon: <Users className="h-3.5 w-3.5" /> },
    { id: "add", label: "Add User", icon: <UserCog className="h-3.5 w-3.5" /> },
    { id: "reset", label: "Reset Password", icon: <KeyRound className="h-3.5 w-3.5" /> },
    { id: "switch", label: "Switch User", icon: <Repeat2 className="h-3.5 w-3.5" /> },
    { id: "master", label: "User Master", icon: <ListChecks className="h-3.5 w-3.5" /> },
  ]},
  { label: "Roles & Access", items: [
    { id: "roles", label: "Roles", count: 8, icon: <ShieldCheck className="h-3.5 w-3.5" /> },
    { id: "perm", label: "Permissions Matrix", icon: <Scale className="h-3.5 w-3.5" /> },
    { id: "assign", label: "Assign Roles", icon: <UserCog className="h-3.5 w-3.5" /> },
    { id: "scope", label: "Privilege Scope", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
    { id: "role-master", label: "Role Master", icon: <ListChecks className="h-3.5 w-3.5" /> },
  ]},
  { label: "Audit", items: [
    { id: "logins", label: "Last 100 Logins", icon: <LogIn className="h-3.5 w-3.5" /> },
    { id: "failures", label: "Last 100 Failures", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
    { id: "audit", label: "Audit Log", icon: <ScrollText className="h-3.5 w-3.5" /> },
  ]},
];

const modules = ["Dashboard","Students","Staff","Attendance","Fees","Exams","Timetable","Communications","Vehicles","Admissions","Settings"];
const roles = ["Super Admin","Principal","Registrar","Accounts","Class Teacher","Subject Teacher","Front Desk","Read-Only"];

const flows: Record<string, ModuleFlow> = {
  dash: { title: "Admin Dashboard", subtitle: "Platform users and access posture",
    ai: "3 users haven't logged in for 60 days — consider revoking. 2 users hold Super Admin — recommend reducing to 1.",
    stats: [{label:"Platform users",value:"42"},{label:"Active roles",value:"8"},{label:"Logins today",value:"38"},{label:"Failed (24h)",value:"4"}],
    columns: ["Role","Users","Modules","Last active","Status"], rows: roles.map((r,i)=>[r,`${[1,2,3,4,18,12,3,2][i]}`,`${5+i}`,"Today","Active"]) },
  users: { title: "Platform Users", subtitle: "Users who log in to EPADM (not staff records)", primaryAction: "Add User",
    columns: ["ID","Name","Email","Role","Last login","Status"],
    rows: Array.from({length:12}).map((_,i)=>[`USR-${100+i}`,`Admin User ${i+1}`,`user${i+1}@school.edu`, roles[i%roles.length], `${i} h ago`, i%9===0?"Suspended":"Active"]) },
  add: { title: "Add User", subtitle: "Create a platform user and assign role", primaryAction: "Create", emptyHint: "Provide name, email, role and privilege scope (branch / class scope)." },
  reset: { title: "Reset Password", subtitle: "Force-reset a user password", primaryAction: "Send Reset Link", columns: ["User","Email","Last reset","Status","Action"], rows: Array.from({length:6}).map((_,i)=>[`Admin User ${i+1}`,`user${i+1}@school.edu`, `${10+i} d ago`, "Active","Reset"]) },
  switch: { title: "Switch User", subtitle: "Impersonate a user for support (audited)", primaryAction: "Switch", columns: ["User","Role","Reason","Started","Status"], rows: [["Priya Menon","Principal","Support ticket #4210","2 min ago","Active"]] },
  master: { title: "User Master", subtitle: "All users with full attributes", columns: ["ID","Name","Email","Role","Scope","Status"], rows: Array.from({length:10}).map((_,i)=>[`USR-${100+i}`,`Admin User ${i+1}`,`user${i+1}@school.edu`, roles[i%roles.length], "All branches", "Active"]) },
  roles: { title: "Roles", subtitle: "Role definitions", primaryAction: "Add Role", columns: ["Role","Users","Modules","Scope","Status"], rows: roles.map((r,i)=>[r,`${[1,2,3,4,18,12,3,2][i]}`, `${5+i}`, i<2?"All":"Branch", "Active"]) },
  perm: { title: "Permissions Matrix", subtitle: "Module × action (view / create / update / delete)",
    columns: ["Module", ...roles.slice(0,6)], rows: modules.map(m => [m, ...roles.slice(0,6).map((_,i)=> i===0?"Full":(i<3?"CRU":(i<5?"CR":"R")))]) },
  assign: { title: "Assign Roles", subtitle: "Bulk assign roles to users", primaryAction: "Assign", columns: ["User","Current Role","New Role","Scope","Status"], rows: Array.from({length:6}).map((_,i)=>[`Admin User ${i+1}`, roles[i%roles.length], roles[(i+1)%roles.length], "All", "Pending"]) },
  scope: { title: "Privilege Scope", subtitle: "Restrict user access to branches, classes or sections", primaryAction: "Add Scope", columns: ["User","Role","Branches","Classes","Status"], rows: Array.from({length:6}).map((_,i)=>[`Admin User ${i+1}`, roles[i%roles.length], "Main", "Grade 6-10", "Active"]) },
  "role-master": { title: "Role Master", subtitle: "Base role catalogue", columns: ["Role","Level","Default modules","Editable","Status"], rows: roles.map((r,i)=>[r, i+1, `${5+i}`, i<2?"No":"Yes", "Active"]) },
  logins: { title: "Last 100 Logins", subtitle: "Recent successful logins", columns: ["Time","User","Role","IP","Device"], rows: Array.from({length:12}).map((_,i)=>[`10:${(45-i).toString().padStart(2,"0")}`,`Admin User ${i+1}`, roles[i%roles.length], `10.0.${i}.${i*3}`, i%2?"Chrome / Mac":"Safari / iPhone"]) },
  failures: { title: "Last 100 Login Failures", subtitle: "Failed attempts (last 24h)", ai: "12 failures from a single IP — consider IP block.", columns: ["Time","User","Reason","IP","Attempts"], rows: Array.from({length:8}).map((_,i)=>[`09:${(58-i*3).toString().padStart(2,"0")}`,`user${i+1}@school.edu`,"Invalid password",`10.0.${i}.42`, `${1+i}`]) },
  audit: { title: "Audit Log", subtitle: "Every write action across the platform", columns: ["Time","User","Module","Action","Entity"], rows: Array.from({length:12}).map((_,i)=>[`10:${(50-i).toString().padStart(2,"0")}`,`Admin User ${i+1}`, modules[i%modules.length], i%3?"UPDATE":"CREATE", `Record #${1200+i}`]) },
};

function AdminPage() {
  return <ModuleShell title="App Admin" subtitle="Platform users, roles and audit" rail={rail} flows={flows} defaultFlow="dash" />;
}
