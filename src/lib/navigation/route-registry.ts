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

export type RouteIconKey =
  | "BarChart3"
  | "Bell"
  | "BookOpen"
  | "Building2"
  | "Bus"
  | "Calculator"
  | "CalendarDays"
  | "CheckSquare"
  | "ClipboardList"
  | "Clock"
  | "CreditCard"
  | "FileText"
  | "FlaskConical"
  | "FolderOpen"
  | "GraduationCap"
  | "LayoutDashboard"
  | "Library"
  | "ListTodo"
  | "MessageSquare"
  | "Package"
  | "Settings"
  | "Smartphone"
  | "Sparkles"
  | "TrendingUp"
  | "Trophy"
  | "UserCog"
  | "Users"
  | "Wrench";

export interface ClientRouteDefinition
  extends Omit<RouteDefinition, "children" | "icon"> {
  iconKey?: RouteIconKey;
  children?: ClientRouteDefinition[];
}

const routeIconKeys = new Map<LucideIcon, RouteIconKey>([
  [BarChart3, "BarChart3"],
  [Bell, "Bell"],
  [BookOpen, "BookOpen"],
  [Building2, "Building2"],
  [Bus, "Bus"],
  [Calculator, "Calculator"],
  [CalendarDays, "CalendarDays"],
  [CheckSquare, "CheckSquare"],
  [ClipboardList, "ClipboardList"],
  [Clock, "Clock"],
  [CreditCard, "CreditCard"],
  [FileText, "FileText"],
  [FlaskConical, "FlaskConical"],
  [FolderOpen, "FolderOpen"],
  [GraduationCap, "GraduationCap"],
  [LayoutDashboard, "LayoutDashboard"],
  [Library, "Library"],
  [ListTodo, "ListTodo"],
  [MessageSquare, "MessageSquare"],
  [Package, "Package"],
  [Settings, "Settings"],
  [Smartphone, "Smartphone"],
  [Sparkles, "Sparkles"],
  [TrendingUp, "TrendingUp"],
  [Trophy, "Trophy"],
  [UserCog, "UserCog"],
  [Users, "Users"],
  [Wrench, "Wrench"],
]);

export function toClientRoute(route: RouteDefinition): ClientRouteDefinition {
  const { icon, children, ...serializableRoute } = route;

  return {
    ...serializableRoute,
    iconKey: icon ? routeIconKeys.get(icon) : undefined,
    children: children?.map(toClientRoute),
  };
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
  child(dashboard, { key: "workspace.tasks", path: "/tasks", label: "My Tasks", breadcrumb: "Tasks", status: "planned", comingSoon: true, icon: ListTodo, showInSidebar: false }),
  child(dashboard, { key: "workspace.approvals", path: "/approvals", label: "Approvals", breadcrumb: "Approvals", status: "live", icon: CheckSquare, requiredPermission: "approvals.read" }),
  child(dashboard, { key: "workspace.calendar", path: "/calendar", label: "Calendar", breadcrumb: "Calendar", status: "planned", comingSoon: true, icon: CalendarDays, showInSidebar: false }),
  child(dashboard, { key: "workspace.notifications", path: "/notifications", label: "Notifications", breadcrumb: "Notifications", status: "planned", comingSoon: true, icon: Bell, showInSidebar: false }),
];

const students: RouteDefinition = {
  key: "students.root", path: "/students", label: "Students",
  description: "Student directory, profiles, guardians, and documents",
  group: "student-lifecycle", groupLabel: "Student Lifecycle", module: "students", moduleLabel: "Students",
  icon: Users, requiredPermission: "students.read", requiredEntitlement: "module.students",
  showInSidebar: true, showInCommandPalette: true, isModuleRoot: true,
  breadcrumb: "Students", status: "live",
};
students.children = [
  child(students, { key: "students.directory", path: "/students", label: "Directory", description: "All enrolled students", breadcrumb: "Directory", status: "live" }),
  child(students, { key: "students.guardians", path: "/students/guardians", label: "Guardians", breadcrumb: "Guardians", status: "live", requiredPermission: "students.guardians.read" }),
  child(students, { key: "students.imports", path: "/students/imports", label: "Import", breadcrumb: "Import", status: "live", requiredPermission: "students.import" }),
  child(students, { key: "students.progression", path: "/students/progression", label: "Enrollment & Progression", breadcrumb: "Progression", status: "planned", comingSoon: true }),
  child(students, { key: "students.alumni", path: "/students/alumni", label: "Alumni", breadcrumb: "Alumni", status: "planned", comingSoon: true }),
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
  child(admissions, { key: "admissions.enrollment", path: "/admissions/enrollment", label: "Enrollment", breadcrumb: "Enrollment", status: "planned", comingSoon: true }),
];

const academics: RouteDefinition = {
  key: "academics.root", path: "/academics", label: "Academic Structure",
  description: "Years, terms, classes, sections, rooms, and houses",
  group: "academics", groupLabel: "Academics", module: "academics", moduleLabel: "Academic Structure",
  icon: GraduationCap, requiredPermission: "academics.read",
  showInSidebar: true, showInCommandPalette: true, isModuleRoot: true,
  breadcrumb: "Academic Structure", status: "live",
};
academics.children = [
  child(academics, { key: "academics.years", path: "/academics/years", label: "Years & Terms", breadcrumb: "Years & Terms", status: "live" }),
  child(academics, { key: "academics.classes", path: "/academics/classes", label: "Classes & Sections", breadcrumb: "Classes & Sections", status: "live" }),
  child(academics, { key: "academics.campuses", path: "/academics/campuses", label: "Campuses & Rooms", breadcrumb: "Campuses & Rooms", status: "live" }),
  child(academics, { key: "academics.houses", path: "/academics/houses", label: "Houses", breadcrumb: "Houses", status: "live" }),
  child(academics, { key: "academics.progression", path: "/academics/progression", label: "Progression", breadcrumb: "Progression", status: "partial", requiredPermission: "academics.progression.read" }),
  child(academics, { key: "academics.settings", path: "/academics/settings", label: "Settings", breadcrumb: "Settings", status: "live" }),
];

const curriculum: RouteDefinition = rootRoute({
  key: "curriculum.root", path: "/curriculum", label: "Curriculum",
  description: "Subjects, frameworks, offerings, and teacher allocation",
  group: "academics", groupLabel: "Academics", module: "curriculum", moduleLabel: "Curriculum",
  icon: BookOpen, requiredPermission: "curriculum.read",
  showInSidebar: true, showInCommandPalette: true,
  breadcrumb: "Curriculum", status: "live",
});
curriculum.children = [
  child(curriculum, { key: "curriculum.subjects", path: "/curriculum/subjects", label: "Subjects", breadcrumb: "Subjects", status: "live", requiredPermission: "curriculum.read" }),
  child(curriculum, { key: "curriculum.frameworks", path: "/curriculum/frameworks", label: "Frameworks", breadcrumb: "Frameworks", status: "live", requiredPermission: "curriculum.read" }),
  child(curriculum, { key: "curriculum.offerings", path: "/curriculum/offerings", label: "Offerings", breadcrumb: "Offerings", status: "live", requiredPermission: "curriculum.read" }),
  child(curriculum, { key: "curriculum.teacher-allocation", path: "/curriculum/teacher-allocation", label: "Teacher Allocation", breadcrumb: "Teacher Allocation", status: "live", requiredPermission: "curriculum.read" }),
  child(curriculum, { key: "curriculum.coverage", path: "/curriculum/coverage", label: "Coverage", breadcrumb: "Coverage", status: "planned", comingSoon: true, requiredPermission: "curriculum.read" }),
];

const timetables: RouteDefinition = rootRoute({
  key: "timetables.root", path: "/timetables", legacyPaths: ["/timetable"], label: "Timetables",
  description: "Master schedule, teacher and room schedules, conflict detection",
  group: "academics", groupLabel: "Academics", module: "timetables", moduleLabel: "Timetables",
  icon: Clock, requiredPermission: "timetables.read",
  showInSidebar: true, showInCommandPalette: true,
  breadcrumb: "Timetables", status: "live",
});
timetables.children = [
  child(timetables, { key: "timetables.master", path: "/timetables", label: "Versions", breadcrumb: "Versions", status: "live", requiredPermission: "timetables.read" }),
  child(timetables, { key: "timetables.settings", path: "/timetables/settings", label: "Period Settings", breadcrumb: "Period Settings", status: "live", requiredPermission: "timetables.settings.update" }),
  child(timetables, { key: "timetables.conflicts", path: "/timetables/conflicts", label: "Conflict Report", breadcrumb: "Conflict Report", status: "live", requiredPermission: "timetables.read" }),
];

const assessments: RouteDefinition = rootRoute({
  key: "assessments.root", path: "/assessments", legacyPaths: ["/exams"], label: "Assessments & Results",
  description: "Exam plans, marks, results, and report cards",
  group: "academics", groupLabel: "Academics", module: "assessments", moduleLabel: "Assessments & Results",
  icon: TrendingUp, requiredPermission: "assessments.read",
  showInSidebar: true, showInCommandPalette: true,
  breadcrumb: "Assessments & Results", status: "live",
});
assessments.children = [
  child(assessments, { key: "assessments.plans", path: "/assessments/plans", label: "Assessment Plans", breadcrumb: "Assessment Plans", status: "live", requiredPermission: "assessments.plans.read" }),
  child(assessments, { key: "assessments.schedule", path: "/assessments/schedule", label: "Exam Schedule", breadcrumb: "Exam Schedule", status: "live", requiredPermission: "assessments.schedule.read" }),
  child(assessments, { key: "assessments.marks", path: "/assessments/marks", label: "Marks Entry", breadcrumb: "Marks Entry", status: "live", requiredPermission: "assessments.marks.read" }),
  child(assessments, { key: "assessments.results", path: "/assessments/results", label: "Results", breadcrumb: "Results", status: "live", requiredPermission: "assessments.results.read" }),
  child(assessments, { key: "assessments.report-cards", path: "/assessments/report-cards", label: "Report Cards", breadcrumb: "Report Cards", status: "live", requiredPermission: "assessments.report-cards.read" }),
  child(assessments, { key: "assessments.settings", path: "/assessments/settings", label: "Settings", breadcrumb: "Settings", status: "live", requiredPermission: "assessments.plans.read" }),
];

const financeFees: RouteDefinition = rootRoute({
  key: "finance.fees", path: "/finance/fees", legacyPaths: ["/fees"], label: "Fees & Billing",
  description: "Fee plans, invoices, collections, and reconciliation",
  group: "finance", groupLabel: "Finance", module: "finance-fees", moduleLabel: "Fees & Billing",
  icon: CreditCard, requiredPermission: "finance.fees.read",
  showInSidebar: true, showInCommandPalette: true,
  breadcrumb: "Fees & Billing", status: "live",
});
financeFees.children = [
  child(financeFees, { key: "finance.fees.structures", path: "/finance/fees/structures", label: "Structures", breadcrumb: "Structures", status: "live", requiredPermission: "finance.fees.read" }),
  child(financeFees, { key: "finance.fees.plans", path: "/finance/fees/plans", label: "Payment Plans", breadcrumb: "Payment Plans", status: "live", requiredPermission: "finance.fees.read" }),
  child(financeFees, { key: "finance.fees.assignments", path: "/finance/fees/assignments", label: "Assignments", breadcrumb: "Assignments", status: "live", requiredPermission: "finance.fees.assign" }),
  child(financeFees, { key: "finance.fees.invoices", path: "/finance/fees/invoices", label: "Invoices", breadcrumb: "Invoices", status: "live", requiredPermission: "finance.fees.read" }),
  child(financeFees, { key: "finance.fees.payments", path: "/finance/fees/payments/new", label: "Payments", breadcrumb: "Payments", status: "live", requiredPermission: "finance.fees.payments.record" }),
  child(financeFees, { key: "finance.fees.collections", path: "/finance/fees/collections", label: "Collections", breadcrumb: "Collections", status: "live", requiredPermission: "finance.fees.read" }),
  child(financeFees, { key: "finance.fees.overdue", path: "/finance/fees/overdue", label: "Overdue", breadcrumb: "Overdue", status: "live", requiredPermission: "finance.fees.read" }),
];

const financeAccounting: RouteDefinition = rootRoute({
  key: "finance.accounting", path: "/finance/accounting", label: "Accounting",
  description: "Chart of accounts, expenses, and financial reports",
  group: "finance", groupLabel: "Finance", module: "finance-accounting", moduleLabel: "Accounting",
  icon: Calculator, requiredPermission: "finance.accounting.read",
  showInSidebar: true, showInCommandPalette: true,
  breadcrumb: "Accounting", status: "live",
});
financeAccounting.children = [
  child(financeAccounting, { key: "finance.accounting.accounts", path: "/finance/accounting/accounts", label: "Accounts", breadcrumb: "Accounts", status: "live", requiredPermission: "finance.accounting.read" }),
  child(financeAccounting, { key: "finance.accounting.expenses", path: "/finance/accounting/expenses", label: "Expenses", breadcrumb: "Expenses", status: "live", requiredPermission: "finance.accounting.expenses.record" }),
  child(financeAccounting, { key: "finance.accounting.reports", path: "/finance/accounting/reports", label: "Reports", breadcrumb: "Reports", status: "live", requiredPermission: "finance.accounting.read" }),
  child(financeAccounting, { key: "finance.accounting.budgets", path: "/finance/accounting/budgets", label: "Budgets", breadcrumb: "Budgets", status: "planned", comingSoon: true, requiredPermission: "finance.accounting.read" }),
];

function rootRoute(route: RouteDefinition): RouteDefinition {
  return { ...route, isModuleRoot: true };
}

export const routeRegistry: RouteDefinition[] = [
  dashboard,
  students,
  admissions,
  academics,
  curriculum,
  timetables,
  rootRoute({ key: "attendance.root", path: "/attendance", label: "Attendance", description: "Student and staff attendance, leave, and devices", group: "academics", groupLabel: "Academics", module: "attendance", moduleLabel: "Attendance", icon: CheckSquare, requiredPermission: "attendance.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Attendance", status: "partial" }),
  rootRoute({ key: "learning.root", path: "/learning", label: "Teaching & Learning", description: "Assignments, gradebook, lesson plans, and resources", group: "academics", groupLabel: "Academics", module: "learning", moduleLabel: "Teaching & Learning", icon: FileText, requiredPermission: "learning.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Teaching & Learning", status: "partial" }),
  assessments,
  rootRoute({ key: "hr.root", path: "/hr", legacyPaths: ["/staff"], label: "Human Resources", description: "Staff directory, recruitment, contracts, leave, and performance", group: "people", groupLabel: "People", module: "hr", moduleLabel: "Human Resources", icon: UserCog, requiredPermission: "hr.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Human Resources", status: "live", children: [] }),
  rootRoute({ key: "payroll.root", path: "/payroll", label: "Payroll", description: "Payroll runs, payslips, loans, and statutory reports", group: "people", groupLabel: "People", module: "payroll", moduleLabel: "Payroll", icon: CreditCard, requiredPermission: "payroll.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Payroll", status: "live", children: [] }),
  financeFees,
  financeAccounting,
  rootRoute({ key: "transport.root", path: "/transport", legacyPaths: ["/vehicles"], label: "Transport", description: "Fleet, routes, allocations, tracking, and maintenance", group: "campus-operations", groupLabel: "Campus Operations", module: "transport", moduleLabel: "Transport", icon: Bus, requiredPermission: "transport.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Transport", status: "live", children: [] }),
  rootRoute({ key: "library.root", path: "/library", label: "Library", description: "Catalog, circulation, members, and acquisitions", group: "campus-operations", groupLabel: "Campus Operations", module: "library", moduleLabel: "Library", icon: Library, requiredPermission: "library.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Library", status: "live", children: [] }),
  rootRoute({ key: "laboratories.root", path: "/laboratories", legacyPaths: ["/labs"], label: "Laboratories", description: "Lab bookings, equipment, chemicals, and safety", group: "campus-operations", groupLabel: "Campus Operations", module: "laboratories", moduleLabel: "Laboratories", icon: FlaskConical, requiredPermission: "laboratories.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Laboratories", status: "live", children: [] }),
  rootRoute({ key: "hostel.root", path: "/hostel", label: "Hostel", description: "Buildings, rooms, allocations, and mess management", group: "campus-operations", groupLabel: "Campus Operations", module: "hostel", moduleLabel: "Hostel", icon: Building2, requiredPermission: "hostel.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Hostel", status: "live", children: [] }),
  rootRoute({ key: "inventory.root", path: "/inventory", label: "Inventory & Assets", description: "Stock, requisitions, procurement, vendors, and assets", group: "campus-operations", groupLabel: "Campus Operations", module: "inventory", moduleLabel: "Inventory & Assets", icon: Package, requiredPermission: "inventory.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Inventory & Assets", status: "live", children: [] }),
  rootRoute({ key: "facilities.root", path: "/facilities", label: "Facilities & Safety", description: "Spaces, work orders, visitors, health, and safeguarding", group: "campus-operations", groupLabel: "Campus Operations", module: "facilities", moduleLabel: "Facilities & Safety", icon: Wrench, requiredPermission: "facilities.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Facilities & Safety", status: "live", children: [] }),
  rootRoute({ key: "activities.root", path: "/activities", label: "Activities", description: "Sports, clubs, events, participation, and achievements", group: "campus-life", groupLabel: "Campus Life", module: "activities", moduleLabel: "Activities", icon: Trophy, requiredPermission: "activities.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Activities", status: "live", children: [] }),
  rootRoute({ key: "communications.root", path: "/communications", label: "Communications", description: "Announcements, campaigns, templates, and delivery", group: "engagement", groupLabel: "Engagement", module: "communications", moduleLabel: "Communications", icon: MessageSquare, requiredPermission: "communications.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Communications", status: "live", children: [] }),
  rootRoute({ key: "documents.root", path: "/documents", label: "Documents", description: "Templates, certificates, letters, and signatures", group: "engagement", groupLabel: "Engagement", module: "documents", moduleLabel: "Documents", icon: FolderOpen, requiredPermission: "documents.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Documents", status: "live", children: [] }),
  rootRoute({ key: "digital-experience.root", path: "/digital-experience", legacyPaths: ["/mobile"], label: "Portals & Mobile", description: "Portal policy, devices, notifications, and branding", group: "engagement", groupLabel: "Engagement", module: "digital-experience", moduleLabel: "Portals & Mobile", icon: Smartphone, requiredPermission: "digital-experience.configure", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Portals & Mobile", status: "live" }),
  rootRoute({ key: "analytics.root", path: "/analytics", legacyPaths: ["/intelligence"], label: "Analytics & Reports", description: "Role dashboards, report catalog, and data quality", group: "intelligence", groupLabel: "Intelligence", module: "analytics", moduleLabel: "Analytics & Reports", icon: BarChart3, requiredPermission: "analytics.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Analytics & Reports", status: "live", children: [] }),
  rootRoute({ key: "ai-studio.root", path: "/ai-studio", label: "AI Studio", description: "Generators, copilots, knowledge, and governance", group: "intelligence", groupLabel: "Intelligence", module: "ai-studio", moduleLabel: "AI Studio", icon: Sparkles, requiredPermission: "ai-studio.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "AI Studio", status: "live", children: [] }),
  rootRoute({ key: "administration.root", path: "/administration", legacyPaths: ["/admin", "/users", "/settings"], label: "Administration", description: "School settings, users, roles, integrations, and audit", group: "administration", groupLabel: "Administration", module: "administration", moduleLabel: "Administration", icon: Settings, requiredPermission: "administration.read", showInSidebar: true, showInCommandPalette: true, breadcrumb: "Administration", status: "live", children: [] }),
  rootRoute({ key: "setup.root", path: "/setup", legacyPaths: ["/onboarding"], label: "Setup", description: "Initial school configuration", group: "administration", groupLabel: "Administration", module: "setup", moduleLabel: "Setup", icon: Settings, requiredPermission: "administration.read", showInSidebar: false, showInCommandPalette: false, breadcrumb: "Setup", status: "live" }),
];

const hr = routeRegistry.find((route) => route.key === "hr.root");
if (hr) {
  hr.children = [
    child(hr, { key: "hr.staff", path: "/hr/staff", legacyPaths: ["/staff"], label: "Staff Directory", breadcrumb: "Staff", status: "live" }),
    child(hr, { key: "hr.departments", path: "/hr/departments", label: "Departments", breadcrumb: "Departments", status: "live", requiredPermission: "hr.departments.read" }),
    child(hr, { key: "hr.staff.imports", path: "/hr/staff/imports", label: "Import", breadcrumb: "Import", status: "live", requiredPermission: "hr.staff.import" }),
    child(hr, { key: "hr.contracts", path: "/hr/contracts", label: "Contracts", breadcrumb: "Contracts", status: "live", requiredPermission: "hr.contracts.read" }),
    child(hr, { key: "hr.recruitment", path: "/hr/recruitment", label: "Recruitment", breadcrumb: "Recruitment", status: "live", requiredPermission: "hr.recruitment.read" }),
    child(hr, { key: "hr.performance", path: "/hr/performance", label: "Performance", breadcrumb: "Performance", status: "live", requiredPermission: "hr.performance.read" }),
  ];
}

const payroll = routeRegistry.find((route) => route.key === "payroll.root");
if (payroll) {
  payroll.children = [
    child(payroll, { key: "payroll.runs", path: "/payroll/runs", label: "Runs", breadcrumb: "Runs", status: "live", requiredPermission: "payroll.runs.read" }),
    child(payroll, { key: "payroll.components", path: "/payroll/components", label: "Components", breadcrumb: "Components", status: "live", requiredPermission: "payroll.read" }),
    child(payroll, { key: "payroll.assignments", path: "/payroll/assignments", label: "Assignments", breadcrumb: "Assignments", status: "live", requiredPermission: "payroll.read" }),
    child(payroll, { key: "payroll.loans", path: "/payroll/loans", label: "Loans", breadcrumb: "Loans", status: "live", requiredPermission: "payroll.read" }),
    child(payroll, { key: "payroll.statutory", path: "/payroll/statutory", label: "Statutory", breadcrumb: "Statutory", status: "live", requiredPermission: "payroll.statutory.read" }),
    child(payroll, { key: "payroll.settings", path: "/payroll/settings", label: "Settings", breadcrumb: "Settings", status: "live", requiredPermission: "payroll.read" }),
  ];
}

const transport = routeRegistry.find((route) => route.key === "transport.root");
if (transport) {
  transport.children = [
    child(transport, { key: "transport.fleet", path: "/transport/fleet", label: "Fleet", breadcrumb: "Fleet", status: "live", requiredPermission: "transport.read" }),
    child(transport, { key: "transport.routes", path: "/transport/routes", label: "Routes", breadcrumb: "Routes", status: "live", requiredPermission: "transport.read" }),
    child(transport, { key: "transport.allocations", path: "/transport/allocations", label: "Allocations", breadcrumb: "Allocations", status: "live", requiredPermission: "transport.read" }),
    child(transport, { key: "transport.maintenance", path: "/transport/maintenance", label: "Maintenance", breadcrumb: "Maintenance", status: "live", requiredPermission: "transport.read" }),
    child(transport, { key: "transport.tracking", path: "/transport/tracking", label: "Tracking", breadcrumb: "Tracking", status: "live", requiredPermission: "transport.tracking.read" }),
  ];
}

const libraryRoute = routeRegistry.find((route) => route.key === "library.root");
if (libraryRoute) {
  libraryRoute.children = [
    child(libraryRoute, { key: "library.catalog", path: "/library/catalog", label: "Catalog", breadcrumb: "Catalog", status: "live", requiredPermission: "library.read" }),
    child(libraryRoute, { key: "library.members", path: "/library/members", label: "Members", breadcrumb: "Members", status: "live", requiredPermission: "library.read" }),
    child(libraryRoute, { key: "library.circulation", path: "/library/circulation", label: "Circulation", breadcrumb: "Circulation", status: "live", requiredPermission: "library.read" }),
    child(libraryRoute, { key: "library.overdue", path: "/library/overdue", label: "Overdue", breadcrumb: "Overdue", status: "live", requiredPermission: "library.read" }),
    child(libraryRoute, { key: "library.fines", path: "/library/fines", label: "Fines", breadcrumb: "Fines", status: "live", requiredPermission: "library.read" }),
    child(libraryRoute, { key: "library.acquisitions", path: "/library/acquisitions", label: "Acquisitions", breadcrumb: "Acquisitions", status: "live", requiredPermission: "library.read" }),
    child(libraryRoute, { key: "library.settings", path: "/library/settings", label: "Settings", breadcrumb: "Settings", status: "live", requiredPermission: "library.read" }),
  ];
}

const laboratoriesRoute = routeRegistry.find((route) => route.key === "laboratories.root");
if (laboratoriesRoute) {
  laboratoriesRoute.children = [
    child(laboratoriesRoute, { key: "laboratories.bookings", path: "/laboratories/bookings", label: "Bookings", breadcrumb: "Bookings", status: "live", requiredPermission: "laboratories.read" }),
    child(laboratoriesRoute, { key: "laboratories.equipment", path: "/laboratories/equipment", label: "Equipment", breadcrumb: "Equipment", status: "live", requiredPermission: "laboratories.read" }),
    child(laboratoriesRoute, { key: "laboratories.consumables", path: "/laboratories/consumables", label: "Consumables", breadcrumb: "Consumables", status: "live", requiredPermission: "laboratories.read" }),
    child(laboratoriesRoute, { key: "laboratories.safety", path: "/laboratories/safety", label: "Safety", breadcrumb: "Safety", status: "live", requiredPermission: "laboratories.read" }),
  ];
}

const hostelRoute = routeRegistry.find((route) => route.key === "hostel.root");
if (hostelRoute) {
  hostelRoute.children = [
    child(hostelRoute, { key: "hostel.rooms", path: "/hostel/rooms", label: "Rooms", breadcrumb: "Rooms", status: "live", requiredPermission: "hostel.read" }),
    child(hostelRoute, { key: "hostel.allocations", path: "/hostel/allocations", label: "Allocations", breadcrumb: "Allocations", status: "live", requiredPermission: "hostel.allocations.manage" }),
    child(hostelRoute, { key: "hostel.leave-passes", path: "/hostel/leave-passes", label: "Leave Passes", breadcrumb: "Leave Passes", status: "live", requiredPermission: "hostel.leave.manage" }),
  ];
}

const inventoryRoute = routeRegistry.find((route) => route.key === "inventory.root");
if (inventoryRoute) {
  inventoryRoute.children = [
    child(inventoryRoute, { key: "inventory.items", path: "/inventory/items", label: "Items", breadcrumb: "Items", status: "live", requiredPermission: "inventory.read" }),
    child(inventoryRoute, { key: "inventory.stock", path: "/inventory/stock", label: "Stock", breadcrumb: "Stock", status: "live", requiredPermission: "inventory.read" }),
    child(inventoryRoute, { key: "inventory.requisitions", path: "/inventory/requisitions", label: "Requisitions", breadcrumb: "Requisitions", status: "live", requiredPermission: "inventory.requisitions.read" }),
    child(inventoryRoute, { key: "inventory.assets", path: "/inventory/assets", label: "Assets", breadcrumb: "Assets", status: "live", requiredPermission: "inventory.assets.read" }),
    child(inventoryRoute, { key: "inventory.vendors", path: "/inventory/vendors", label: "Vendors", breadcrumb: "Vendors", status: "live", requiredPermission: "inventory.read" }),
  ];
}

const facilitiesRoute = routeRegistry.find((route) => route.key === "facilities.root");
if (facilitiesRoute) {
  facilitiesRoute.children = [
    child(facilitiesRoute, { key: "facilities.spaces", path: "/facilities/spaces", label: "Spaces", breadcrumb: "Spaces", status: "live", requiredPermission: "facilities.read" }),
    child(facilitiesRoute, { key: "facilities.bookings", path: "/facilities/bookings", label: "Bookings", breadcrumb: "Bookings", status: "live", requiredPermission: "facilities.read" }),
    child(facilitiesRoute, { key: "facilities.work-orders", path: "/facilities/work-orders", label: "Work Orders", breadcrumb: "Work Orders", status: "live", requiredPermission: "facilities.work-orders.read" }),
    child(facilitiesRoute, { key: "facilities.visitors", path: "/facilities/visitors", label: "Visitors", breadcrumb: "Visitors", status: "live", requiredPermission: "facilities.visitors.manage" }),
    child(facilitiesRoute, { key: "facilities.health", path: "/facilities/health", label: "Health Records", breadcrumb: "Health", status: "live", requiredPermission: "facilities.health.manage" }),
  ];
}

const activitiesRoute = routeRegistry.find((route) => route.key === "activities.root");
if (activitiesRoute) {
  activitiesRoute.children = [
    child(activitiesRoute, { key: "activities.catalog", path: "/activities/catalog", label: "Catalog", breadcrumb: "Catalog", status: "live", requiredPermission: "activities.read" }),
    child(activitiesRoute, { key: "activities.events", path: "/activities/events", label: "Events", breadcrumb: "Events", status: "live", requiredPermission: "activities.read" }),
    child(activitiesRoute, { key: "activities.achievements", path: "/activities/achievements", label: "Achievements", breadcrumb: "Achievements", status: "live", requiredPermission: "activities.read" }),
  ];
}

const communicationsRoute = routeRegistry.find((route) => route.key === "communications.root");
if (communicationsRoute) {
  communicationsRoute.children = [
    child(communicationsRoute, { key: "communications.announcements", path: "/communications/announcements", label: "Announcements", breadcrumb: "Announcements", status: "live", requiredPermission: "communications.read" }),
    child(communicationsRoute, { key: "communications.campaigns", path: "/communications/campaigns", label: "Campaigns", breadcrumb: "Campaigns", status: "live", requiredPermission: "communications.read" }),
    child(communicationsRoute, { key: "communications.templates", path: "/communications/templates", label: "Templates", breadcrumb: "Templates", status: "live", requiredPermission: "communications.read" }),
    child(communicationsRoute, { key: "communications.queue", path: "/communications/queue", label: "Queue", breadcrumb: "Queue", status: "live", requiredPermission: "communications.queue.manage" }),
    child(communicationsRoute, { key: "communications.messages", path: "/communications/messages", label: "Parent Messages", breadcrumb: "Messages", status: "live", requiredPermission: "communications.messages.manage" }),
  ];
}

const documentsRoute = routeRegistry.find((route) => route.key === "documents.root");
if (documentsRoute) {
  documentsRoute.children = [
    child(documentsRoute, { key: "documents.templates", path: "/documents/templates", label: "Templates", breadcrumb: "Templates", status: "live", requiredPermission: "documents.read" }),
    child(documentsRoute, { key: "documents.generate", path: "/documents/generate", label: "Generate", breadcrumb: "Generate", status: "live", requiredPermission: "documents.generate" }),
    child(documentsRoute, { key: "documents.history", path: "/documents/history", label: "History", breadcrumb: "History", status: "live", requiredPermission: "documents.read" }),
  ];
}

const analyticsRoute = routeRegistry.find((route) => route.key === "analytics.root");
if (analyticsRoute) {
  analyticsRoute.children = [
    child(analyticsRoute, { key: "analytics.academic", path: "/analytics/academic", label: "Academic", breadcrumb: "Academic", status: "live", requiredPermission: "analytics.academic.read" }),
    child(analyticsRoute, { key: "analytics.finance", path: "/analytics/finance", label: "Finance", breadcrumb: "Finance", status: "live", requiredPermission: "finance.analytics.read" }),
    child(analyticsRoute, { key: "analytics.hr", path: "/analytics/hr", label: "HR", breadcrumb: "HR", status: "live", requiredPermission: "hr.analytics.read" }),
    child(analyticsRoute, { key: "analytics.data-quality", path: "/analytics/data-quality", label: "Data Quality", breadcrumb: "Data Quality", status: "live", requiredPermission: "analytics.read" }),
    child(analyticsRoute, { key: "analytics.reports", path: "/analytics/reports", label: "Reports", breadcrumb: "Reports", status: "live", requiredPermission: "reports.run" }),
    child(analyticsRoute, { key: "analytics.report-schedules", path: "/analytics/reports/schedules", label: "Schedules", breadcrumb: "Schedules", status: "live", requiredPermission: "reports.schedule.manage" }),
  ];
}

const aiStudioRoute = routeRegistry.find((route) => route.key === "ai-studio.root");
if (aiStudioRoute) {
  aiStudioRoute.children = [
    child(aiStudioRoute, { key: "ai-studio.exam-generator", path: "/ai-studio/exam-generator", label: "Exam Generator", breadcrumb: "Exam Generator", status: "live", requiredPermission: "ai-studio.use" }),
    child(aiStudioRoute, { key: "ai-studio.lesson-planner", path: "/ai-studio/lesson-planner", label: "Lesson Planner", breadcrumb: "Lesson Planner", status: "live", requiredPermission: "ai-studio.use" }),
    child(aiStudioRoute, { key: "ai-studio.report-card-comments", path: "/ai-studio/report-card-comments", label: "Report Comments", breadcrumb: "Report Comments", status: "live", requiredPermission: "ai-studio.use" }),
    child(aiStudioRoute, { key: "ai-studio.communication-writer", path: "/ai-studio/communication-writer", label: "Communication Writer", breadcrumb: "Communication Writer", status: "live", requiredPermission: "ai-studio.use" }),
    child(aiStudioRoute, { key: "ai-studio.governance", path: "/ai-studio/governance", label: "Governance", breadcrumb: "Governance", status: "live", requiredPermission: "ai-studio.governance" }),
    child(aiStudioRoute, { key: "ai-studio.knowledge-base", path: "/ai-studio/knowledge-base", label: "Knowledge Base", breadcrumb: "Knowledge Base", status: "live", requiredPermission: "ai-studio.read" }),
    child(aiStudioRoute, { key: "ai-studio.settings", path: "/ai-studio/settings", label: "Settings", breadcrumb: "Settings", status: "live", requiredPermission: "ai-studio.settings" }),
  ];
}

const administration = routeRegistry.find((route) => route.key === "administration.root");
if (administration) {
  administration.children = [
    child(administration, { key: "administration.school", path: "/administration/school", legacyPaths: ["/settings"], label: "School & Campuses", breadcrumb: "School", status: "live", requiredPermission: "administration.school.read" }),
    child(administration, { key: "administration.users", path: "/administration/users", legacyPaths: ["/users", "/admin"], label: "Users & Memberships", breadcrumb: "Users", status: "live", requiredPermission: "administration.users.read" }),
    child(administration, { key: "administration.roles", path: "/administration/roles", label: "Roles", breadcrumb: "Roles", status: "live", requiredPermission: "administration.roles.read" }),
    child(administration, { key: "administration.audit", path: "/administration/audit", label: "Audit Log", breadcrumb: "Audit", status: "live", requiredPermission: "administration.audit.read" }),
    child(administration, { key: "administration.integrations", path: "/administration/integrations", label: "Integrations", breadcrumb: "Integrations", status: "live", requiredPermission: "administration.integrations.read" }),
    child(administration, { key: "administration.privacy", path: "/administration/privacy", label: "Privacy", breadcrumb: "Privacy", status: "live", requiredPermission: "administration.privacy.manage" }),
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
    hr: "/hr/staff",
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
