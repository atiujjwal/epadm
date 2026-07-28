"use client";

import { ModuleShell } from "@/components/workspace/module-shell";
import type { InnerRailGroup } from "@/components/workspace/inner-rail";
import type { ModuleFlow } from "@/components/workspace/module-shell";
import { students } from "@/data/mock";
import { Home, ClipboardList, PenSquare, MessageSquare, FileText, Award, Trophy, Table2, Download, AlertTriangle, Ticket, CalendarClock, Settings2, Layers, Percent, Gauge } from "lucide-react";

const rail: InnerRailGroup[] = [
  { label: "Operate", items: [
    { id: "list", label: "Exam List", count: 24, icon: <ClipboardList className="h-3.5 w-3.5" /> },
    { id: "dash", label: "Exam Dashboard", icon: <Home className="h-3.5 w-3.5" /> },
    { id: "feed-marks", label: "Feed Marks", icon: <PenSquare className="h-3.5 w-3.5" /> },
    { id: "marks-dash", label: "Marks Entry Dashboard", icon: <Gauge className="h-3.5 w-3.5" /> },
    { id: "feed-att", label: "Feed Exam Attendance", icon: <ClipboardList className="h-3.5 w-3.5" /> },
    { id: "remarks", label: "Feed Remarks", icon: <MessageSquare className="h-3.5 w-3.5" /> },
    { id: "hall", label: "Hall Ticket", icon: <Ticket className="h-3.5 w-3.5" /> },
  ]},
  { label: "Reports", items: [
    { id: "class-sheet", label: "Class Marksheet", icon: <FileText className="h-3.5 w-3.5" /> },
    { id: "student-sheet", label: "Student Marksheet", icon: <FileText className="h-3.5 w-3.5" /> },
    { id: "toppers", label: "Toppers", icon: <Trophy className="h-3.5 w-3.5" /> },
    { id: "tab", label: "Tabulation Sheet", icon: <Table2 className="h-3.5 w-3.5" /> },
    { id: "report-card", label: "Report Card / Mark Slip", icon: <Download className="h-3.5 w-3.5" /> },
    { id: "not-entered", label: "Marks Not Entered", count: 8, icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  ]},
  { label: "Configure", items: [
    { id: "cfg-session", label: "Exam by Session", icon: <CalendarClock className="h-3.5 w-3.5" /> },
    { id: "cfg-structure", label: "Structure & Dashboard", icon: <Layers className="h-3.5 w-3.5" /> },
    { id: "cfg-att", label: "Attendance Settings", icon: <Settings2 className="h-3.5 w-3.5" /> },
    { id: "cfg-grades", label: "Grade Slabs", icon: <Award className="h-3.5 w-3.5" /> },
    { id: "cfg-publish", label: "Result Publish Dates", icon: <CalendarClock className="h-3.5 w-3.5" /> },
    { id: "cfg-hold", label: "Hold Report Cards", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
    { id: "cfg-max", label: "Max / Min Marks", icon: <Percent className="h-3.5 w-3.5" /> },
    { id: "cfg-hall", label: "Hall Ticket Template", icon: <Ticket className="h-3.5 w-3.5" /> },
  ]},
];

const subjects = ["Math","Science","English","Hindi","Social","Computer"];
const examList = [
  ["EXM-2401","Formative I","Jul 2026","Grade 6-10","Published","Active"],
  ["EXM-2402","Weekly · Math","Jul 2026","Grade 9","Published","Active"],
  ["EXM-2403","Monthly · July","Jul 2026","All","Draft","Pending"],
  ["EXM-2404","Half-Yearly","Sep 2026","All","Scheduled","Active"],
  ["EXM-2405","Quarterly","Aug 2026","Grade 6-12","Scheduled","Active"],
  ["EXM-2406","Annual","Mar 2027","All","Scheduled","Active"],
];

const flows: Record<string, ModuleFlow> = {
  list: { title: "Exam List", subtitle: "Session → Month → Exam type", primaryAction: "Create Exam",
    columns: ["ID","Name","Month","Applicable","Publish","Status"], rows: examList },
  dash: { title: "Exam Dashboard", subtitle: "Topper trends, subject averages, entry status",
    ai: "8 subjects have marks not entered for Formative I. Grade 10 English average dropped 6% vs last exam.",
    stats: [{label:"Active exams",value:"6"},{label:"Marks entered",value:"92%"},{label:"On hold",value:"2"},{label:"Avg score",value:"78.4"}],
    columns: ["Subject","Class","Avg","Highest","Lowest"],
    rows: subjects.map((s,i)=>[s,"Grade 10",`${72+i*2}`,`${94-i}`,`${42+i*3}`]) },
  "feed-marks": { title: "Feed Marks", subtitle: "Enter marks per subject × class", primaryAction: "Save Marks",
    columns: ["Student","Q1","Q2","Q3","Total"], rows: students.slice(0,12).map((s,i)=>[s.name, `${16-i%5}`, `${18-i%4}`, `${14-i%3}`, `${48+(i%12)}`]) },
  "marks-dash": { title: "Marks Entry Dashboard", subtitle: "Per subject × per teacher progress",
    columns: ["Subject","Teacher","Class","Progress","Status"], rows: subjects.map((s,i)=>[s,`Teacher ${i+1}`,"Grade 10",`${70+i*5}%`, i<4?"Active":"Pending"]) },
  "feed-att": { title: "Feed Exam Attendance", subtitle: "Mark presence per exam sitting", primaryAction: "Save",
    columns: ["Student","Exam","Date","Status","Reason"], rows: students.slice(0,10).map(s=>[s.name,"Formative I","2026-07-14","Present","-"]) },
  remarks: { title: "Feed Remarks", subtitle: "Teacher remarks per student for report card", primaryAction: "Save",
    columns: ["Student","Class","Subject","Remark","Status"], rows: students.slice(0,8).map(s=>[s.name,`${s.grade}-${s.section}`,"English","Consistent improvement","Active"]) },
  hall: { title: "Hall Ticket", subtitle: "Schedule and download hall tickets", primaryAction: "Generate PDF",
    columns: ["Exam","Class","Students","Generated","Status"], rows: examList.slice(0,4).map(e=>[e[1], "Grade 10", "384", "2026-07-01", "Active"]) },
  "class-sheet": { title: "Class Marksheet", subtitle: "Full class × subject grid", columns: ["Roll","Student","Math","Science","English","Total"], rows: students.slice(0,12).map((s,i)=>[`${i+1}`,s.name,`${72+i%20}`,`${68+i%22}`,`${75+i%18}`,`${215+i%50}`]) },
  "student-sheet": { title: "Student Marksheet", subtitle: "Individual scorecard", columns: ["Subject","Max","Obtained","Grade","Remark"], rows: subjects.map((s,i)=>[s,"100",`${72+i*3}`,i<3?"A":"B+","Good"]) },
  toppers: { title: "Toppers", subtitle: "Class × subject × overall rankings", columns: ["Rank","Student","Class","%","Trend"], rows: students.slice(0,10).map((s,i)=>[`${i+1}`,s.name,`${s.grade}-${s.section}`,`${96-i}%`, i<3?"↑":"→"]) },
  tab: { title: "Tabulation Sheet", subtitle: "Consolidated tabulation for records", columns: ["Roll","Student","Total","Percentage","Result"], rows: students.slice(0,12).map((s,i)=>[`${i+1}`,s.name,`${420+i*5}`,`${84-i}%`, "Pass"]) },
  "report-card": { title: "Report Card / Mark Slip", subtitle: "Generate and download report cards", primaryAction: "Generate PDF", columns: ["Class","Students","Generated","Published","Status"], rows: ["Grade 6","Grade 7","Grade 8","Grade 9","Grade 10"].map(g=>[g,"380","380","Yes","Published"]) },
  "not-entered": { title: "Marks Not Entered", subtitle: "Missing marks by class × subject × teacher", ai: "8 subjects pending. Send teacher reminders?", primaryAction: "Notify Teachers", columns: ["Subject","Class","Teacher","Missing","Deadline"], rows: [["Math","Grade 10-B","R. Iyer","12","2026-07-16"],["English","Grade 8-A","A. Bose","8","2026-07-16"],["Science","Grade 9-C","P. Menon","5","2026-07-17"]] },
  "cfg-session": { title: "Exam by Session", subtitle: "Session-level exam planning", primaryAction: "Create Session Plan", columns: ["Session","Exams","Publish","Weightage","Status"], rows: [["2026-27","6","Rolling","Formative 40% / Summative 60%","Active"]] },
  "cfg-structure": { title: "Exam Structure & Dashboard", subtitle: "Marks distribution and pattern", columns: ["Exam","Subjects","Max","Pass %","Status"], rows: examList.slice(0,4).map(e=>[e[1],"6","500","33","Active"]) },
  "cfg-att": { title: "Attendance Settings", subtitle: "Rules for exam attendance and eligibility", columns: ["Rule","Min %","Applies to","Status"], rows: [["Board exam eligibility","75%","Grade 10, 12","Active"],["Detention","50%","All","Active"]] },
  "cfg-grades": { title: "Grade Slabs", subtitle: "Percentage → grade mapping", primaryAction: "Add Slab", columns: ["Grade","Min %","Max %","Point","Status"], rows: [["A+","91","100","10","Active"],["A","81","90","9","Active"],["B+","71","80","8","Active"],["B","61","70","7","Active"],["C","41","60","6","Active"]] },
  "cfg-publish": { title: "Result Publish Dates", subtitle: "When results become visible to parents", columns: ["Exam","Publish date","Portal","SMS","Status"], rows: examList.slice(0,4).map(e=>[e[1],"2026-07-20","Yes","Yes","Scheduled"]) },
  "cfg-hold": { title: "Hold Report Cards", subtitle: "Withhold report card for pending dues or discipline", columns: ["Student","Class","Reason","Held by","Status"], rows: [["Kabir Sharma","Grade 10-B","Fees pending ₹42,000","Accounts","Active"],["Ira Rao","Grade 8-A","Documents incomplete","Registrar","Active"]] },
  "cfg-max": { title: "Max / Min Marks", subtitle: "Per subject max and passing marks", columns: ["Subject","Max","Passing","Class","Status"], rows: subjects.map(s=>[s,"100","33","Grade 10","Active"]) },
  "cfg-hall": { title: "Hall Ticket Template", subtitle: "Design and preview hall ticket", primaryAction: "Save Template", emptyHint: "Configure logo, header text, columns and preview a sample hall ticket." },
};

export default function ExamsPage() {
  return <ModuleShell title="Exams" subtitle="Session 2026–27 · 24 exams · 6 active" rail={rail} flows={flows} defaultFlow="list" />;
}
