import type { LucideIcon } from "lucide-react";
import type { Permission, UserRole } from "@/lib/db";
import {
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  Bus,
  Calculator,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  Clock,
  CreditCard,
  FileText,
  FlaskConical,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  Library,
  ListTodo,
  MessageSquare,
  Package,
  Settings,
  Smartphone,
  Sparkles,
  TrendingUp,
  Trophy,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";

export type NavGroup =
  | "workspace"
  | "student-lifecycle"
  | "academics"
  | "people"
  | "finance"
  | "campus-operations"
  | "campus-life"
  | "engagement"
  | "intelligence"
  | "administration";

export type RouteStatus = "live" | "partial" | "prototype" | "broken" | "planned";

export interface RouteDefinition {
  key: string;
  path: string;
  label: string;
  description: string;
  group: NavGroup;
  groupLabel: string;
  module: string;
  moduleLabel: string;
  icon?: LucideIcon;
  requiredPermission?: Permission;
  requiredEntitlement?: string;
  showInSidebar: boolean;
  showInCommandPalette: boolean;
  isModuleRoot?: boolean;
  comingSoon?: boolean;
  breadcrumb: string;
  status: RouteStatus;
  children?: RouteDefinition[];
  /** Browser-visible compatibility routes retained until Task 6 redirects them. */
  legacyPaths?: string[];
}

type ChildRoute = Pick<
  RouteDefinition,
  "key" | "path" | "label" | "breadcrumb" | "status"
> &
  Partial<
    Pick<
      RouteDefinition,
      | "description"
      | "icon"
      | "requiredPermission"
      | "requiredEntitlement"
      | "showInSidebar"
      | "showInCommandPalette"
      | "comingSoon"
      | "legacyPaths"
    >
  >;

function child(parent: RouteDefinition, route: ChildRoute): RouteDefinition {
  return {
    description: "",
    group: parent.group,
    groupLabel: parent.groupLabel,
    module: parent.module,
    moduleLabel: parent.moduleLabel,
    showInSidebar: true,
    showInCommandPalette: true,
    ...route,
  };
}

const dashboard: RouteDefinition = {
  key: "workspace.home",
  path: "/dashboard",
  legacyPaths: ["/admin-dashboard"],
  label: "Home",
  description: "Your dashboard, tasks, approvals, and calendar",
  group: "workspace",
  groupLabel: "Workspace",
  module: "dashboard",
  moduleLabel: "Home",
  icon: LayoutDashboard,
  showInSidebar: true,
  showInCommandPalette: true,
  isModuleRoot: true,
  breadcrumb: "Dashboard",
  status: "partial",
};
dashboard.children = [
  child(dashboard, { key: "workspace.tasks", path: "/tasks", label: "My Tasks", breadcrumb: "Tasks", status: "planned", icon: ListTodo }),
  child(dashboard, { key: "workspace.approvals", path: "/approvals", label: "Approvals", breadcrumb: "Approvals", status: "planned", icon: CheckSquare }),
  child(dashboard, { key: "workspace.calendar", path: "/calendar", label: "Calendar", breadcrumb: "Calendar", status: "planned", icon: CalendarDays }),
  child(dashboard, { key: "workspace.notifications", path: "/notifications", label: "Notifications", breadcrumb: "Notifications", status: "planned", icon: Bell, showInSidebar: false }),
];

const students: RouteDefinition = {
  key: "students.root", path: "/students", label: "Students",
  description: "Student directory, profiles, guardians, and documents",
  group: "student-lifecycle", groupLabel: "Student Lifecycle", module: "students", moduleLabel: "Students",
  icon: Users, requiredPermission: "students.read", requiredEntitlement: "module.students",
  showInSidebar: true, showInCommandPalette: true, isModuleRoot: true,
  breadcrumb: "Students", status: "partial",
};
students.children = [
  child(students, { key: "students.directory", path: "/students", label: "Directory", description: "All enrolled students", breadcrumb: "Directory", status: "partial" }),
  child(students, { key: "students.guardians", path: "/students/guardians", label: "Guardians", breadcrumb: "Guardians", status: "planned", requiredPermission: "students.read" }),
  child(students, { key: "students.progression", path: "/students/progression", label: "Enrollment & Progression", breadcrumb: "Progression", status: "planned" }),
  child(students, { key: "students.alumni", path: "/students/alumni", label: "Alumni", breadcrumb: "Alumni", status: "planned" }),
];

const admissions: RouteDefinition = {
  key: "admissions.root", path: "/admissions", label: "Admissions",
  description: "Enquiries, applications, assessments, offers, and enrollment",
  group: "student-lifecycle", groupLabel: "Student Lifecycle", module: "admissions", moduleLabel: "Admissions",
  icon: ClipboardList, requiredPermission: "admissions.read",
  showInSidebar: true, showInCommandPalette: true, isModuleRoot: true,
  breadcrumb: "Admissions", status: "partial",
};
admissions.children = [
  child(admissions, { key: "admissions.enquiries", path: "/admissions/enquiries", label: "Enquiries", breadcrumb: "Enquiries", status: "partial" }),
  child(admissions, { key: "admissions.applications", path: "/admissions/applications", label: "Applications", breadcrumb: "Applications", status: "partial" }),
  child(admissions, { key: "admissions.enrollment", path: "/admissions/enrollment", label: "Enrollment", breadcrumb: "Enrollment", status: "planned" }),
];

const academics: RouteDefinition = {
  key: "academics.root", path: "/academics", label: "Academic Structure",
  description: "Years, terms, classes, sections, rooms, and houses",
  group: "academics", groupLabel: "Academics", module: "academics", moduleLabel: "Academic Structure",
  icon: GraduationCap, requiredPermission: "academics.read",
  showInSidebar: true, showInCommandPalette: true, isModuleRoot: true,
  breadcrumb: "Academic Structure", status: "partial",
};
academics.children = [
  child(academics, { key: "academics.years", path: "/academics/years", label: "Years & Terms", breadcrumb: "Years & Terms", status: "partial" }),
  child(academics, { key: "academics.classes", path: "/academics/classes", label: "Classes & Sections", breadcrumb: "Classes & Sections", status: "partial" }),
  child(academics, { key: "academics.houses", path: "/academics/houses", label: "Houses", breadcrumb: "Houses", status: "planned" }),
];

function rootRoute(route: RouteDefinition): RouteDefinition {
  return { ...route, isModuleRoot: true };
}

export const routeRegistry: RouteDefinition[] = [
  dashboard,
  students,
  admissions,
  academics,
  rootRoute({ key: "curriculum.root", path: "/curriculum", label: "Curriculum", description: "Subjects, frameworks, offerings, and teacher allocation", group: "academics", groupLabel: "Academics", module: "curriculum", moduleLabel: "Curriculum", icon: BookOpen, requiredPermission: "curriculum.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Curriculum", status: "planned", comingSoon: true }),
  rootRoute({ key: "timetables.root", path: "/timetables", legacyPaths: ["/timetable"], label: "Timetables", description: "Master schedule, teacher and room schedules, conflict detection", group: "academics", groupLabel: "Academics", module: "timetables", moduleLabel: "Timetables", icon: Clock, requiredPermission: "timetables.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Timetables", status: "partial" }),
  rootRoute({ key: "attendance.root", path: "/attendance", label: "Attendance", description: "Student and staff attendance, leave, and devices", group: "academics", groupLabel: "Academics", module: "attendance", moduleLabel: "Attendance", icon: CheckSquare, requiredPermission: "attendance.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Attendance", status: "prototype" }),
  rootRoute({ key: "learning.root", path: "/learning", label: "Teaching & Learning", description: "Assignments, gradebook, lesson plans, and resources", group: "academics", groupLabel: "Academics", module: "learning", moduleLabel: "Teaching & Learning", icon: FileText, requiredPermission: "learning.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Teaching & Learning", status: "prototype" }),
  rootRoute({ key: "assessments.root", path: "/assessments", legacyPaths: ["/exams"], label: "Assessments & Results", description: "Exam plans, marks, results, and report cards", group: "academics", groupLabel: "Academics", module: "assessments", moduleLabel: "Assessments & Results", icon: TrendingUp, requiredPermission: "assessments.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Assessments & Results", status: "partial" }),
  rootRoute({ key: "hr.root", path: "/hr", legacyPaths: ["/staff"], label: "Human Resources", description: "Staff directory, recruitment, contracts, leave, and performance", group: "people", groupLabel: "People", module: "hr", moduleLabel: "Human Resources", icon: UserCog, requiredPermission: "hr.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Human Resources", status: "partial", children: [] }),
  rootRoute({ key: "payroll.root", path: "/payroll", label: "Payroll", description: "Payroll runs, payslips, loans, and statutory reports", group: "people", groupLabel: "People", module: "payroll", moduleLabel: "Payroll", icon: CreditCard, requiredPermission: "payroll.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Payroll", status: "partial" }),
  rootRoute({ key: "finance.fees", path: "/finance/fees", legacyPaths: ["/fees", "/finance"], label: "Fees & Billing", description: "Fee plans, invoices, collections, and reconciliation", group: "finance", groupLabel: "Finance", module: "finance-fees", moduleLabel: "Fees & Billing", icon: CreditCard, requiredPermission: "finance.fees.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Fees & Billing", status: "partial" }),
  rootRoute({ key: "finance.accounting", path: "/finance/accounting", label: "Accounting", description: "Chart of accounts, journals, budgets, and banking", group: "finance", groupLabel: "Finance", module: "finance-accounting", moduleLabel: "Accounting", icon: Calculator, requiredPermission: "finance.accounting.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Accounting", status: "planned", comingSoon: true }),
  rootRoute({ key: "transport.root", path: "/transport", legacyPaths: ["/vehicles"], label: "Transport", description: "Fleet, routes, allocations, tracking, and maintenance", group: "campus-operations", groupLabel: "Campus Operations", module: "transport", moduleLabel: "Transport", icon: Bus, requiredPermission: "transport.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Transport", status: "partial" }),
  rootRoute({ key: "library.root", path: "/library", label: "Library", description: "Catalog, circulation, members, and acquisitions", group: "campus-operations", groupLabel: "Campus Operations", module: "library", moduleLabel: "Library", icon: Library, requiredPermission: "library.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Library", status: "partial" }),
  rootRoute({ key: "laboratories.root", path: "/laboratories", legacyPaths: ["/labs"], label: "Laboratories", description: "Lab bookings, equipment, chemicals, and safety", group: "campus-operations", groupLabel: "Campus Operations", module: "laboratories", moduleLabel: "Laboratories", icon: FlaskConical, requiredPermission: "laboratories.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Laboratories", status: "prototype" }),
  rootRoute({ key: "hostel.root", path: "/hostel", label: "Hostel", description: "Buildings, rooms, allocations, and mess management", group: "campus-operations", groupLabel: "Campus Operations", module: "hostel", moduleLabel: "Hostel", icon: Building2, requiredPermission: "hostel.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Hostel", status: "planned", comingSoon: true }),
  rootRoute({ key: "inventory.root", path: "/inventory", label: "Inventory & Assets", description: "Stock, requisitions, procurement, vendors, and assets", group: "campus-operations", groupLabel: "Campus Operations", module: "inventory", moduleLabel: "Inventory & Assets", icon: Package, requiredPermission: "inventory.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Inventory & Assets", status: "planned", comingSoon: true }),
  rootRoute({ key: "facilities.root", path: "/facilities", label: "Facilities & Safety", description: "Spaces, work orders, visitors, health, and safeguarding", group: "campus-operations", groupLabel: "Campus Operations", module: "facilities", moduleLabel: "Facilities & Safety", icon: Wrench, requiredPermission: "facilities.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Facilities & Safety", status: "planned", comingSoon: true }),
  rootRoute({ key: "activities.root", path: "/activities", label: "Activities", description: "Sports, clubs, events, participation, and achievements", group: "campus-life", groupLabel: "Campus Life", module: "activities", moduleLabel: "Activities", icon: Trophy, requiredPermission: "activities.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Activities", status: "planned", comingSoon: true }),
  rootRoute({ key: "communications.root", path: "/communications", label: "Communications", description: "Announcements, campaigns, templates, and delivery", group: "engagement", groupLabel: "Engagement", module: "communications", moduleLabel: "Communications", icon: MessageSquare, requiredPermission: "communications.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Communications", status: "partial" }),
  rootRoute({ key: "documents.root", path: "/documents", label: "Documents", description: "Templates, certificates, letters, and signatures", group: "engagement", groupLabel: "Engagement", module: "documents", moduleLabel: "Documents", icon: FolderOpen, requiredPermission: "documents.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Documents", status: "planned", comingSoon: true }),
  rootRoute({ key: "digital-experience.root", path: "/digital-experience", legacyPaths: ["/mobile"], label: "Portals & Mobile", description: "Portal policy, devices, notifications, and branding", group: "engagement", groupLabel: "Engagement", module: "digital-experience", moduleLabel: "Portals & Mobile", icon: Smartphone, requiredPermission: "digital-experience.configure", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Portals & Mobile", status: "prototype" }),
  rootRoute({ key: "analytics.root", path: "/analytics", legacyPaths: ["/intelligence"], label: "Analytics & Reports", description: "Role dashboards, report catalog, and data quality", group: "intelligence", groupLabel: "Intelligence", module: "analytics", moduleLabel: "Analytics & Reports", icon: BarChart3, requiredPermission: "analytics.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Analytics & Reports", status: "prototype" }),
  rootRoute({ key: "ai-studio.root", path: "/ai-studio", label: "AI Studio", description: "Generators, copilots, knowledge, and governance", group: "intelligence", groupLabel: "Intelligence", module: "ai-studio", moduleLabel: "AI Studio", icon: Sparkles, requiredPermission: "ai-studio.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "AI Studio", status: "prototype" }),
  rootRoute({ key: "administration.root", path: "/administration", legacyPaths: ["/admin", "/users", "/settings"], label: "Administration", description: "School settings, users, roles, integrations, and audit", group: "administration", groupLabel: "Administration", module: "administration", moduleLabel: "Administration", icon: Settings, requiredPermission: "administration.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Administration", status: "partial", children: [] }),
];

const hr = routeRegistry.find((route) => route.key === "hr.root");
if (hr) {
  hr.children = [
    child(hr, { key: "hr.staff", path: "/hr/staff", legacyPaths: ["/staff"], label: "Staff Directory", breadcrumb: "Staff", status: "partial" }),
    child(hr, { key: "hr.departments", path: "/hr/departments", label: "Departments", breadcrumb: "Departments", status: "partial" }),
  ];
}

const administration = routeRegistry.find((route) => route.key === "administration.root");
if (administration) {
  administration.children = [
    child(administration, { key: "administration.school", path: "/administration/school", legacyPaths: ["/settings"], label: "School & Campuses", breadcrumb: "School", status: "partial" }),
    child(administration, { key: "administration.users", path: "/administration/users", legacyPaths: ["/users", "/admin"], label: "Users & Roles", breadcrumb: "Users", status: "partial", requiredPermission: "administration.users.read" }),
    child(administration, { key: "administration.audit", path: "/administration/audit", label: "Audit Log", breadcrumb: "Audit", status: "planned", requiredPermission: "administration.audit.read" }),
  ];
}

export function getModuleRoutes(): RouteDefinition[] {
  return routeRegistry.filter((route) => route.isModuleRoot);
}

export function getRoleHomePath(role: UserRole): string {
  const roleHomes: Record<UserRole, string> = {
    superadmin: "/dashboard",
    admin: "/dashboard",
    teacher: "/teacher",
    student: "/student",
    parent: "/parent",
    accountant: "/finance/fees",
    librarian: "/library",
    staff: "/me/profile",
  };
  return roleHomes[role];
}

export function getAllRoutes(): RouteDefinition[] {
  return routeRegistry.flatMap((route) => [route, ...(route.children ?? [])]);
}

export function getAuthorizedNavigation(
  userPermissions: readonly string[],
  tenantEntitlements: readonly string[],
): RouteDefinition[] {
  return routeRegistry
    .filter((route) => {
      if (!route.isModuleRoot || !route.showInSidebar) return false;
      const permissionAllowed =
        !route.requiredPermission || userPermissions.includes(route.requiredPermission);
      const entitlementAllowed =
        !route.requiredEntitlement || tenantEntitlements.includes(route.requiredEntitlement);
      return permissionAllowed && entitlementAllowed;
    })
    .map((route) => ({
      ...route,
      children: route.children?.filter((routeChild) => {
        const permissionAllowed =
          !routeChild.requiredPermission ||
          userPermissions.includes(routeChild.requiredPermission);
        const entitlementAllowed =
          !routeChild.requiredEntitlement ||
          tenantEntitlements.includes(routeChild.requiredEntitlement);
        return permissionAllowed && entitlementAllowed && routeChild.showInSidebar;
      }),
    }));
}

function routeMatchesPath(route: RouteDefinition, pathname: string): boolean {
  const candidates = [route.path, ...(route.legacyPaths ?? [])];
  return candidates.some(
    (candidate) => pathname === candidate || pathname.startsWith(`${candidate}/`),
  );
}

export function findRouteForPath(pathname: string): RouteDefinition | undefined {
  return getAllRoutes()
    .filter((route) => routeMatchesPath(route, pathname))
    .sort((left, right) => right.path.length - left.path.length)[0];
}

export function getBreadcrumbsForPath(
  pathname: string,
): { label: string; href: string }[] {
  const match = findRouteForPath(pathname);
  if (!match) return [];

  const breadcrumbs: { label: string; href: string }[] = [];
  if (match.group !== "workspace") {
    breadcrumbs.push({ label: match.groupLabel, href: "#" });
  }
  if (match.moduleLabel !== match.label) {
    const moduleRoute = routeRegistry.find(
      (route) => route.module === match.module && route.isModuleRoot,
    );
    if (moduleRoute) {
      breadcrumbs.push({ label: moduleRoute.moduleLabel, href: moduleRoute.path });
    }
  }
  breadcrumbs.push({ label: match.breadcrumb, href: match.path });
  return breadcrumbs;
}

export function findRouteByKey(key: string): RouteDefinition | undefined {
  return getAllRoutes().find((route) => route.key === key);
}
