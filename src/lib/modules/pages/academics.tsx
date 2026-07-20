"use client";

import { ModuleShell } from "@/components/workspace/module-shell";
import type { InnerRailGroup } from "@/components/workspace/inner-rail";
import type { ModuleFlow } from "@/components/workspace/module-shell";
import {
  LayoutDashboard,
  Layers,
  BookOpen,
  Grid3x3,
  Split,
  Trophy,
  CalendarDays,
  ClipboardList,
  Timer,
  Percent,
  ScrollText,
  Repeat,
  Tag,
  Landmark,
} from "lucide-react";

const rail: InnerRailGroup[] = [
  {
    label: "Operate",
    items: [
      { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
      { id: "classes", label: "Classes & Sections", icon: <Layers className="h-3.5 w-3.5" /> },
      { id: "subjects", label: "Subjects", icon: <BookOpen className="h-3.5 w-3.5" /> },
      { id: "mapping", label: "Class × Subject", icon: <Grid3x3 className="h-3.5 w-3.5" /> },
      { id: "streams", label: "Streams & Electives", icon: <Split className="h-3.5 w-3.5" /> },
      { id: "houses", label: "House System", icon: <Trophy className="h-3.5 w-3.5" /> },
      { id: "calendar", label: "Academic Calendar", icon: <CalendarDays className="h-3.5 w-3.5" /> },
    ],
  },
  {
    label: "Reports",
    items: [
      { id: "roster", label: "Section Roster", icon: <ClipboardList className="h-3.5 w-3.5" /> },
      { id: "load", label: "Teaching Load", icon: <Timer className="h-3.5 w-3.5" /> },
      { id: "coverage", label: "Curriculum Coverage", icon: <Percent className="h-3.5 w-3.5" /> },
    ],
  },
  {
    label: "Configure",
    items: [
      { id: "grading", label: "Grading Scheme", icon: <ScrollText className="h-3.5 w-3.5" /> },
      { id: "session", label: "Session / Rollover", icon: <Repeat className="h-3.5 w-3.5" /> },
      { id: "naming", label: "Naming Templates", icon: <Tag className="h-3.5 w-3.5" /> },
      { id: "board", label: "Curriculum Board", icon: <Landmark className="h-3.5 w-3.5" /> },
    ],
  },
];

const grades = ["Nursery", "LKG", "UKG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

const flows: Record<string, ModuleFlow> = {
  overview: {
    title: "Academic structure overview",
    subtitle: "AY 2025–2026 · CBSE · Delhi Public School · North Campus",
    ai: "Class VIII-B is 4 students over the standard 40-strength cap. Consider splitting into a new section or rebalancing with VIII-C (currently 34). Curriculum coverage across IX–X is trending 6% below plan for Term 2.",
    stats: [
      { label: "Classes", value: "15", delta: "Nursery → XII" },
      { label: "Sections", value: "42" },
      { label: "Subjects", value: "34", delta: "22 core · 12 elective" },
      { label: "Total strength", value: "1,684" },
    ],
    columns: ["Grade", "Sections", "Strength", "Class Teachers", "Stream", "Board"],
    rows: [
      ["VI", "A · B · C", 118, "3 assigned", "—", "CBSE"],
      ["VII", "A · B · C", 122, "3 assigned", "—", "CBSE"],
      ["VIII", "A · B · C", 120, "3 assigned", "—", "CBSE"],
      ["IX", "A · B", 88, "2 assigned", "—", "CBSE"],
      ["X", "A · B", 84, "2 assigned", "—", "CBSE"],
      ["XI", "Sci · Com · Arts", 92, "3 assigned", "Streamed", "CBSE"],
      ["XII", "Sci · Com · Arts", 88, "3 assigned", "Streamed", "CBSE"],
    ],
    primaryAction: "Add class",
  },
  classes: {
    title: "Classes & sections",
    subtitle: "Inline manage strength, class teacher, and room assignment",
    columns: ["Class", "Section", "Strength", "Class Teacher", "Home Room", "Status"],
    rows: grades.slice(3, 12).flatMap((g) =>
      ["A", "B", "C"].slice(0, g === "IX" || g === "X" ? 2 : 3).map((s) => [
        g,
        s,
        Math.floor(30 + Math.random() * 12),
        ["N. Menon", "R. Iyer", "S. Kapoor", "A. Rao", "P. Sharma"][Math.floor(Math.random() * 5)],
        `Room ${100 + Math.floor(Math.random() * 40)}`,
        "Active",
      ]),
    ),
    primaryAction: "Add section",
  },
  subjects: {
    title: "Subject master",
    subtitle: "Core, elective, and co-scholastic subjects across grades",
    columns: ["Code", "Subject", "Type", "Applicable Grades", "Credit", "Status"],
    rows: [
      ["ENG101", "English", "Core", "I – XII", 4, "Active"],
      ["HIN102", "Hindi", "Core", "I – X", 4, "Active"],
      ["MAT103", "Mathematics", "Core", "I – XII", 5, "Active"],
      ["SCI104", "Science", "Core", "I – X", 5, "Active"],
      ["SST105", "Social Science", "Core", "VI – X", 4, "Active"],
      ["PHY201", "Physics", "Core", "XI – XII", 5, "Active"],
      ["CHE202", "Chemistry", "Core", "XI – XII", 5, "Active"],
      ["BIO203", "Biology", "Elective", "XI – XII", 5, "Active"],
      ["CSC204", "Computer Science", "Elective", "IX – XII", 4, "Active"],
      ["BST205", "Business Studies", "Core", "XI – XII (Com)", 5, "Active"],
      ["PED301", "Physical Education", "Co-scholastic", "I – XII", 2, "Active"],
      ["ART302", "Visual Arts", "Co-scholastic", "I – VIII", 2, "Active"],
      ["MUS303", "Music", "Co-scholastic", "I – VIII", 2, "Active"],
    ],
    primaryAction: "Add subject",
  },
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
  grading: {
    title: "Grading scheme",
    subtitle: "Grade bands used across marksheets and report cards",
    columns: ["Grade", "Min %", "Max %", "GPA", "Remark"],
    rows: [
      ["A+", 91, 100, 10, "Outstanding"],
      ["A", 81, 90, 9, "Excellent"],
      ["B+", 71, 80, 8, "Very Good"],
      ["B", 61, 70, 7, "Good"],
      ["C+", 51, 60, 6, "Above Average"],
      ["C", 41, 50, 5, "Average"],
      ["D", 33, 40, 4, "Pass"],
      ["E", 0, 32, 0, "Needs Improvement"],
    ],
    primaryAction: "Edit slabs",
  },
  session: {
    title: "Session & rollover",
    subtitle: "Active academic year and next-session promotion wizard",
    stats: [
      { label: "Active session", value: "2025–26" },
      { label: "Days elapsed", value: "289 / 240" },
      { label: "Next session", value: "2026–27", delta: "Rollover in 74 days" },
      { label: "Promotion rule", value: "≥ 33% overall" },
    ],
    columns: ["Step", "Description", "Status", "Owner", "Due"],
    rows: [
      [1, "Finalise Term 2 exam results", "Pending", "Exam Cell", "05 Mar 2026"],
      [2, "Auto-promote eligible students", "Draft", "Principal", "15 Mar 2026"],
      [3, "Mark detain / repeat cases", "Draft", "Class Teachers", "18 Mar 2026"],
      [4, "Allocate 2026-27 sections", "Draft", "Academic Head", "22 Mar 2026"],
      [5, "Publish 2026-27 timetable", "Draft", "Coordinator", "28 Mar 2026"],
      [6, "Roll new fee structure forward", "Draft", "Accounts", "01 Apr 2026"],
    ],
    primaryAction: "Start rollover",
  },
  naming: {
    title: "Class naming templates",
    subtitle: "How classes appear across UI, receipts, ID cards and reports",
    columns: ["Context", "Template", "Example"],
    rows: [
      ["Sidebar & lists", "{grade}-{section}", "X-A"],
      ["Report card", "Grade {grade} · {section}", "Grade 10 · A"],
      ["Fee receipt", "Class {grade} {section}", "Class 10 A"],
      ["ID card", "{grade}{section}", "10A"],
      ["Parent App", "Grade {grade} · Section {section}", "Grade 10 · Section A"],
    ],
    primaryAction: "New template",
  },
  board: {
    title: "Curriculum board",
    subtitle: "Governing board — affects subject defaults, marksheet format, grading",
    stats: [
      { label: "Active board", value: "CBSE" },
      { label: "Marksheet format", value: "CBSE-9" },
      { label: "Assessment", value: "Term-based" },
      { label: "Grading", value: "9-point CGPA" },
    ],
    columns: ["Board", "Description", "Marksheet", "Grading", "Status"],
    rows: [
      ["CBSE", "Central Board of Secondary Education", "CBSE-9", "9-point CGPA", "Active"],
      ["ICSE", "Council for Indian School Certificate", "ICSE-Std", "% based", "Enabled"],
      ["State (Delhi)", "Directorate of Education, GNCTD", "State-1", "% based", "Enabled"],
      ["IB", "International Baccalaureate", "IB-MYP", "1–7 scale", "Trial"],
    ],
  },
};

export default function AcademicsPage() {
  return (
    <ModuleShell
      title="Academics"
      subtitle="Classes, sections, subjects, streams and academic session setup"
      rail={rail}
      flows={flows}
      defaultFlow="overview"
    />
  );
}
