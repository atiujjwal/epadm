"use client";

import { ModuleShell, type ModuleFlow } from "@/components/workspace/module-shell";
import type { InnerRailGroup } from "@/components/workspace/inner-rail";
import { StudentRegistry } from "./student-registry";
import { students as mockStudents } from "@/data/mock";
import {
  Home,
  UserPlus,
  Upload,
  Users2,
  StickyNote,
  Search,
  ArrowUpDown,
  RefreshCcw,
  Trash2,
  FileBarChart2,
  IdCard,
  Cake,
  FolderOpen,
  ClipboardList,
  BookOpen,
  Home as House,
  School,
} from "lucide-react";

type StudentRecord = {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  classLabel: string | null;
  sectionLabel: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  status: string;
  notes: string | null;
  createdAt: Date | string;
};

type Props = {
  initialStudents: StudentRecord[];
  total: number;
  active: number;
};

const rail: InnerRailGroup[] = [
  {
    label: "Operate",
    items: [
      { id: "dash", label: "Dashboard", icon: <Home className="h-3.5 w-3.5" /> },
      { id: "list", label: "Student List", icon: <Users2 className="h-3.5 w-3.5" /> },
      { id: "add", label: "Add Student", icon: <UserPlus className="h-3.5 w-3.5" /> },
      { id: "import", label: "Import", icon: <Upload className="h-3.5 w-3.5" /> },
      { id: "bulk-edit", label: "Bulk Edit", icon: <Users2 className="h-3.5 w-3.5" /> },
      { id: "attach", label: "Bulk Attachments", icon: <FolderOpen className="h-3.5 w-3.5" /> },
      { id: "promote", label: "Promote / Detain", icon: <ArrowUpDown className="h-3.5 w-3.5" /> },
      { id: "rolls", label: "Change Roll Numbers", icon: <RefreshCcw className="h-3.5 w-3.5" /> },
      { id: "delete", label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" /> },
      { id: "search", label: "Search", icon: <Search className="h-3.5 w-3.5" /> },
      { id: "notes", label: "Notes", icon: <StickyNote className="h-3.5 w-3.5" /> },
    ],
  },
  {
    label: "Reports",
    items: [
      { id: "register", label: "Register", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
      { id: "strength", label: "Strength", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
      { id: "joined", label: "Joined", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
      { id: "left", label: "Left", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
      { id: "duplicates", label: "Duplicates", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
      { id: "detained", label: "Detained", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
      { id: "cert", label: "Certificate", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
      { id: "bdays", label: "Birthdays & Anniversaries", icon: <Cake className="h-3.5 w-3.5" /> },
      { id: "download", label: "Download List", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
      { id: "siblings", label: "Siblings", icon: <Users2 className="h-3.5 w-3.5" /> },
      { id: "gr", label: "General Register", icon: <BookOpen className="h-3.5 w-3.5" /> },
      { id: "idcard", label: "ID Card", icon: <IdCard className="h-3.5 w-3.5" /> },
      { id: "docs", label: "Documents", icon: <FolderOpen className="h-3.5 w-3.5" /> },
      { id: "parents", label: "Parents Register", icon: <ClipboardList className="h-3.5 w-3.5" /> },
    ],
  },
  {
    label: "Master",
    items: [
      { id: "m-class", label: "Class", icon: <School className="h-3.5 w-3.5" /> },
      { id: "m-house", label: "House", icon: <House className="h-3.5 w-3.5" /> },
    ],
  },
];

function buildFlows(initialStudents: StudentRecord[], total: number, active: number) {
  const studentRows = initialStudents.slice(0, 20).map((s) => [
    s.admissionNumber,
    `${s.firstName} ${s.lastName ?? ""}`.trim(),
    `${s.classLabel ?? "—"}${s.sectionLabel ? `-${s.sectionLabel}` : ""}`,
    s.guardianName ?? "—",
    "—",
    s.status,
  ]);

  const mk = (title: string, subtitle: string, extra?: Partial<ModuleFlow>): ModuleFlow => ({
    title,
    subtitle,
    columns: ["ID", "Name", "Class", "Guardian", "Attendance", "Status"],
    rows: studentRows,
    ...extra,
  });

  const mockRows = mockStudents.slice(0, 20).map((s) => [
    s.id,
    s.name,
    `${s.grade}-${s.section}`,
    s.guardian,
    `${s.attendance}%`,
    s.feesStatus,
  ]);

  const flows: Record<string, ModuleFlow> = {
    dash: {
      title: "Students Dashboard",
      subtitle: "Session overview",
      ai: `${Math.max(0, total - active)} inactive records. Review list for data quality.`,
      stats: [
        { label: "Strength", value: String(total) },
        { label: "Active", value: String(active) },
        { label: "Inactive", value: String(total - active) },
        { label: "Sections", value: "—" },
      ],
      columns: ["Class", "Strength", "Male", "Female", "Attendance %"],
      rows: mockRows.slice(0, 7).map((r) => [r[2], "—", "—", "—", r[4]]),
    },
    list: {
      ...mk("Student List", "Live directory from your tenant database", { primaryAction: "Add Student" }),
      content: <StudentRegistry initialStudents={initialStudents} />,
    },
    add: {
      title: "Add Student",
      subtitle: "Enrol a new student",
      primaryAction: "Save",
      content: <StudentRegistry initialStudents={initialStudents} />,
    },
    import: {
      title: "Import Students",
      subtitle: "Bulk upload via Excel/CSV",
      primaryAction: "Upload File",
      columns: ["Batch", "Uploaded", "Rows", "Errors", "Status"],
      rows: [
        ["BATCH-124", "2 days ago", "142", "0", "Success"],
        ["BATCH-123", "1 week ago", "98", "2", "Warning"],
      ],
    },
    "bulk-edit": mk("Bulk Edit", "Update fields across many students at once", { primaryAction: "Apply" }),
    attach: {
      title: "Bulk Attachments",
      subtitle: "Upload documents mapped by admission number",
      primaryAction: "Upload",
      columns: ["File", "Mapped to", "Type", "Size", "Status"],
      rows: mockStudents.slice(0, 5).map((s, i) => [
        `STU-${1024 + i}_aadhar.pdf`,
        s.name,
        "Aadhaar",
        "412 KB",
        "Success",
      ]),
    },
    promote: {
      title: "Promote / Detain",
      subtitle: "Bulk class transition at year-end",
      stats: [
        { label: "Eligible", value: String(active) },
        { label: "Detained", value: "7" },
        { label: "Passed out", value: "151" },
        { label: "Pending", value: "0" },
      ],
      columns: ["From", "To", "Students", "Action", "Status"],
      rows: ["Grade 6→7", "Grade 7→8", "Grade 8→9"].map((g) => [
        g.split("→")[0],
        g.split("→")[1],
        "380",
        "Promote",
        "Pending",
      ]),
    },
    rolls: mk("Change Roll Numbers", "Reassign roll numbers within a class"),
    delete: mk("Delete Students", "Soft-delete with reason and audit"),
    search: mk("Search Students", "Advanced multi-field search"),
    notes: {
      title: "Notes",
      subtitle: "Private notes on students",
      columns: ["Date", "Student", "Author", "Note", "Tag"],
      rows: [
        ["2026-07-14", "Kabir Sharma", "Class Teacher", "Improved participation in Math", "Positive"],
      ],
    },
    register: mk("Register Report", "Official admission register", {
      columns: ["Adm No.", "Name", "Class", "DOB", "Guardian"],
      rows: initialStudents.slice(0, 15).map((s) => [
        s.admissionNumber,
        `${s.firstName} ${s.lastName ?? ""}`.trim(),
        `${s.classLabel ?? "—"}-${s.sectionLabel ?? "—"}`,
        s.dateOfBirth ?? "—",
        s.guardianName ?? "—",
      ]),
    }),
    strength: {
      title: "Strength Report",
      subtitle: "Class-wise and section-wise headcount",
      columns: ["Class", "A", "B", "C", "Total"],
      rows: [["Grade 6", "120", "118", "122", "360"]],
    },
    joined: mk("Joined Report", "Students admitted this session"),
    left: mk("Left Report", "Students who left this session"),
    duplicates: mk("Duplicates", "Potential duplicate records"),
    detained: mk("Detained", "Students detained this session"),
    cert: mk("Certificate", "Generate leaving / bonafide certificates"),
    bdays: mk("Birthdays", "Upcoming birthdays and anniversaries"),
    download: mk("Download List", "Export student list"),
    siblings: mk("Siblings", "Sibling mapping report"),
    gr: mk("General Register", "Official general register"),
    idcard: mk("ID Card", "Bulk ID card generation", { primaryAction: "Generate PDF" }),
    docs: {
      title: "Documents",
      subtitle: "Per-student document repository",
      columns: ["Student", "Aadhaar", "Birth Cert", "Transfer Cert", "Photo"],
      rows: initialStudents.slice(0, 10).map((s) => [
        `${s.firstName} ${s.lastName ?? ""}`.trim(),
        "Uploaded",
        "Uploaded",
        "-",
        "Uploaded",
      ]),
    },
    parents: {
      title: "Parents Register",
      subtitle: "Guardian directory",
      columns: ["Guardian", "Students", "Phone", "Email", "Occupation"],
      rows: initialStudents.slice(0, 10).map((s) => [
        s.guardianName ?? "—",
        `${s.firstName} ${s.lastName ?? ""}`.trim(),
        s.guardianPhone ?? "—",
        "parent@example.com",
        "Business",
      ]),
    },
    "m-class": {
      title: "Class Master",
      subtitle: "Class and section configuration",
      primaryAction: "Add Class",
      columns: ["Class", "Sections", "Strength", "Class Teacher", "Status"],
      rows: [["Grade 6", "A, B, C", String(total), "Assigned", "Active"]],
    },
    "m-house": {
      title: "House Master",
      subtitle: "School houses for sports and events",
      primaryAction: "Add House",
      columns: ["House", "Colour", "Captain", "Points", "Status"],
      rows: [["Aravali", "Red", "Aarav Sharma", "1240", "Active"]],
    },
  };

  return flows;
}

export function StudentsWorkspace({ initialStudents, total, active }: Props) {
  const flows = buildFlows(initialStudents, total, active);
  return (
    <ModuleShell
      title="Students"
      subtitle={`${total.toLocaleString()} enrolled · live registry`}
      rail={rail}
      flows={flows}
      defaultFlow="dash"
    />
  );
}
