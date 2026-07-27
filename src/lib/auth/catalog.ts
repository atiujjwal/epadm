import { PERMISSIONS, USER_ROLES, type Permission, type UserRole } from "@/lib/db";

export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  "tenant.manage": "Manage school profile, configuration, and operational access.",
  "users.read": "View tenant users and role assignments.",
  "users.write": "Create and manage tenant memberships.",
  "academics.read": "View classes, sections, and enrollment structure.",
  "academics.write": "Create and manage classes, sections, and enrollments.",
  "staff.read": "View staff directory and staffing records.",
  "staff.write": "Create and manage staff registry records.",
  "students.read": "View student records.",
  "students.write": "Create and update student records.",
  "attendance.read": "View attendance data and summaries.",
  "attendance.write": "Record and adjust attendance entries.",
  "fees.read": "View fee plans, invoices, and payment states.",
  "fees.write": "Manage fee plans, invoices, and receipts.",
  "announcements.read": "View notices and communication timelines.",
  "announcements.write": "Create and publish notices or announcements.",
  "reports.read": "View generated reports and academic summaries.",
};

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  superadmin: [...PERMISSIONS],
  admin: [...PERMISSIONS],
  teacher: [
    "academics.read",
    "staff.read",
    "students.read",
    "attendance.read",
    "attendance.write",
    "announcements.read",
    "reports.read",
  ],
  student: ["announcements.read"],
  parent: ["attendance.read", "fees.read", "announcements.read", "reports.read"],
  staff: ["academics.read", "staff.read", "students.read", "attendance.read", "announcements.read"],
  accountant: ["academics.read", "staff.read", "students.read", "fees.read", "fees.write", "reports.read"],
  librarian: ["students.read", "announcements.read"],
};

export { PERMISSIONS, USER_ROLES };
