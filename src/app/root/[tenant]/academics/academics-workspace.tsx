"use client";

import { ModuleShell, type ModuleFlow } from "@/components/workspace/module-shell";
import type { InnerRailGroup } from "@/components/workspace/inner-rail";
import type { SubjectRecord } from "@/lib/admin/subjects";
import { AcademicStructureWorkspace } from "./academic-structure-workspace";
import { SubjectsCatalog } from "./subjects-catalog";
import { School, Layers, BookOpen, Link2, GitBranch, Home, Calendar, FileBarChart2 } from "lucide-react";

type Props = {
  classes: Parameters<typeof AcademicStructureWorkspace>[0]["initialClasses"];
  sections: Parameters<typeof AcademicStructureWorkspace>[0]["initialSections"];
  enrollments: Parameters<typeof AcademicStructureWorkspace>[0]["initialEnrollments"];
  staffOptions: Parameters<typeof AcademicStructureWorkspace>[0]["staff"];
  studentOptions: Parameters<typeof AcademicStructureWorkspace>[0]["students"];
  subjects: SubjectRecord[];
  summary: { classCount: number; sectionCount: number; enrollmentCount: number; subjectCount: number };
};

const rail: InnerRailGroup[] = [
  {
    label: "Operate",
    items: [
      { id: "overview", label: "Overview", icon: <School className="h-3.5 w-3.5" /> },
      { id: "classes", label: "Classes & Sections", icon: <Layers className="h-3.5 w-3.5" /> },
      { id: "subjects", label: "Subjects", icon: <BookOpen className="h-3.5 w-3.5" /> },
      { id: "mapping", label: "Class × Subject", icon: <Link2 className="h-3.5 w-3.5" /> },
      { id: "streams", label: "Streams & Electives", icon: <GitBranch className="h-3.5 w-3.5" /> },
      { id: "houses", label: "House System", icon: <Home className="h-3.5 w-3.5" /> },
      { id: "calendar", label: "Academic Calendar", icon: <Calendar className="h-3.5 w-3.5" /> },
    ],
  },
  {
    label: "Reports",
    items: [
      { id: "roster", label: "Section Roster", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
      { id: "load", label: "Teaching Load", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
      { id: "coverage", label: "Curriculum Coverage", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
    ],
  },
];

/** Design-parity mock flows for tabs without live backends yet */
const mockFlows: Record<string, ModuleFlow> = {
  mapping: {
    title: "Class × Subject matrix",
    subtitle: "Assign subjects and teachers to each class-section",
    ai: "Chemistry is unassigned to XII-Com. Two sections lack a permanent Mathematics teacher — consider reassigning R. Iyer or engaging a substitute.",
    columns: ["Class", "English", "Math", "Science / Phy", "SST / Chem", "Elective", "Coverage %"],
    rows: [
      ["VI-A", "N. Menon", "R. Iyer", "S. Kapoor", "A. Rao", "Comp Sci", "94%"],
      ["VI-B", "P. Sharma", "R. Iyer", "S. Kapoor", "A. Rao", "Comp Sci", "91%"],
      ["IX-A", "N. Menon", "R. Iyer", "K. Singh", "M. Verma", "Comp Sci", "87%"],
      ["X-A", "P. Sharma", "V. Nair", "K. Singh", "M. Verma", "Comp Sci", "82%"],
      ["XI-Sci", "N. Menon", "V. Nair", "K. Singh (Phy)", "T. Ghosh (Chem)", "Biology", "78%"],
      ["XII-Com", "P. Sharma", "V. Nair", "—", "Unassigned", "Business", "62%"],
    ],
  },
  streams: {
    title: "Streams & elective baskets",
    subtitle: "IX–XII specialisation tracks with elective capacity",
    columns: ["Stream", "Grade", "Subjects", "Capacity", "Enrolled", "Fill %"],
    rows: [
      ["Science (PCM)", "XI–XII", "Phy · Chem · Math · Eng · Elective", 60, 54, "90%"],
      ["Science (PCB)", "XI–XII", "Phy · Chem · Bio · Eng · Elective", 40, 32, "80%"],
      ["Commerce", "XI–XII", "Acc · BST · Eco · Eng · Elective", 60, 46, "77%"],
      ["Humanities", "XI–XII", "Hist · Pol Sci · Psych · Eng · Elective", 40, 22, "55%"],
    ],
    primaryAction: "Add stream",
  },
  houses: {
    title: "House system",
    subtitle: "Four inter-house teams · cumulative points AY 2025–26",
    stats: [
      { label: "Ganga (Blue)", value: "1,240", delta: "1st" },
      { label: "Yamuna (Red)", value: "1,180", delta: "2nd" },
      { label: "Kaveri (Green)", value: "1,095", delta: "3rd" },
      { label: "Narmada (Yellow)", value: "980", delta: "4th" },
    ],
    columns: ["House", "Captain", "Vice-Captain", "Members", "Sports Pts", "Academic Pts", "Cultural Pts"],
    rows: [
      ["Ganga", "Aarav S. (XII)", "Ishita K. (XI)", 421, 420, 480, 340],
      ["Yamuna", "Rohan M. (XII)", "Meera R. (XI)", 418, 380, 460, 340],
      ["Kaveri", "Sneha B. (XII)", "Kabir P. (XI)", 415, 360, 395, 340],
      ["Narmada", "Devansh J. (XII)", "Anaya G. (XI)", 410, 320, 340, 320],
    ],
  },
  calendar: {
    title: "Academic calendar",
    subtitle: "Terms, working days, planned instructional hours",
    columns: ["Term", "Start", "End", "Working Days", "Holidays", "Planned Hours", "Actual"],
    rows: [
      ["Term 1", "01 Apr 2025", "30 Sep 2025", 118, 14, 590, "578 (98%)"],
      ["Term 2", "01 Oct 2025", "31 Mar 2026", 122, 22, 610, "412 (68% · ongoing)"],
    ],
    primaryAction: "Add term",
  },
  roster: {
    title: "Section roster",
    subtitle: "Class teacher and subject teachers per section",
    columns: ["Section", "Class Teacher", "Strength", "Subject Teachers", "Room"],
    rows: [
      ["VI-A", "N. Menon", 40, "R. Iyer · S. Kapoor · A. Rao · +3", "Room 112"],
      ["VI-B", "P. Sharma", 39, "R. Iyer · S. Kapoor · A. Rao · +3", "Room 114"],
      ["IX-A", "K. Singh", 44, "N. Menon · R. Iyer · M. Verma · +4", "Room 205"],
      ["XI-Sci", "T. Ghosh", 36, "V. Nair · K. Singh · N. Menon · +3", "Lab-A / 301"],
    ],
  },
  load: {
    title: "Teaching load report",
    subtitle: "Weekly period allocation per teacher · min 28 · max 36",
    ai: "V. Nair is at 38 periods/week — 2 over the ceiling. Redistribute a XII-Com Math slot to R. Iyer (currently 26).",
    columns: ["Teacher", "Department", "Classes", "Weekly Periods", "Utilisation", "Status"],
    rows: [
      ["N. Menon", "English", "VI, IX, XI-Sci", 32, "94%", "OK"],
      ["R. Iyer", "Mathematics", "VI, VII, VIII", 26, "76%", "Trial"],
      ["V. Nair", "Mathematics", "X, XI-Sci, XII-Com", 38, "112%", "Warning"],
      ["K. Singh", "Physics", "IX, X, XI-Sci", 30, "88%", "OK"],
      ["T. Ghosh", "Chemistry", "XI-Sci, XII-Sci", 24, "70%", "Trial"],
    ],
  },
  coverage: {
    title: "Curriculum coverage",
    subtitle: "% syllabus completed vs planned — syncs from AI Studio Syllabus module",
    columns: ["Class", "Subject", "Planned Units", "Completed", "% Complete", "Variance", "Status"],
    rows: [
      ["VI-A", "Math", 12, 11, "92%", "+2%", "OK"],
      ["IX-A", "Science", 14, 10, "71%", "-8%", "Warning"],
      ["X-A", "Math", 13, 8, "62%", "-15%", "Warning"],
      ["XI-Sci", "Physics", 10, 5, "50%", "-20%", "Overdue"],
      ["XII-Com", "Business Studies", 11, 4, "36%", "-30%", "Critical"],
    ],
  },
};

function buildFlows(props: Props) {
  const liveStructure = (
    <AcademicStructureWorkspace
      initialClasses={props.classes}
      initialSections={props.sections}
      initialEnrollments={props.enrollments}
      staff={props.staffOptions}
      students={props.studentOptions}
    />
  );

  const subjectRows = props.subjects.map((s) => [s.code, s.name, s.status]);

  return {
    overview: {
      title: "Academic Overview",
      subtitle: "Configured structure for the current session",
      stats: [
        { label: "Classes", value: String(props.summary.classCount) },
        { label: "Sections", value: String(props.summary.sectionCount) },
        { label: "Enrollments", value: String(props.summary.enrollmentCount) },
        { label: "Subjects", value: String(props.summary.subjectCount) },
      ],
      columns: ["Item", "Value", "Status"],
      rows: [
        ["Classes", String(props.summary.classCount), "Active"],
        ["Sections", String(props.summary.sectionCount), "Active"],
        ["Enrollments", String(props.summary.enrollmentCount), "Active"],
        ["Subjects", String(props.summary.subjectCount), "Active"],
      ],
    },
    classes: { title: "Classes & Sections", subtitle: "Live academic structure", content: liveStructure },
    subjects: {
      title: "Subject master",
      subtitle:
        props.subjects.length > 0
          ? `${props.subjects.length} subject${props.subjects.length === 1 ? "" : "s"} in catalogue`
          : "Core, elective, and co-scholastic subjects across grades",
      columns: ["Code", "Subject", "Status"],
      rows: subjectRows,
      content: <SubjectsCatalog initialSubjects={props.subjects} />,
      primaryAction: "Add subject",
      emptyHint: props.subjects.length === 0 ? "No subjects yet — use the form to add your first." : undefined,
    },
    ...mockFlows,
  } satisfies Record<string, ModuleFlow>;
}

export function AcademicsWorkspace(props: Props) {
  return (
    <ModuleShell
      title="Academics Setup"
      subtitle={`${props.summary.classCount} classes · ${props.summary.sectionCount} sections · ${props.summary.subjectCount} subjects`}
      rail={rail}
      flows={buildFlows(props)}
      defaultFlow="overview"
    />
  );
}
