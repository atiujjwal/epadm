"use client";

import { ModuleShell } from "@/components/workspace/module-shell";
import type { InnerRailGroup } from "@/components/workspace/inner-rail";
import type { ModuleFlow } from "@/components/workspace/module-shell";
import { staff } from "@/data/mock";
import { Home, UserPlus, Upload, Users2, StickyNote, Search, FileBarChart2, IdCard, Cake, FolderOpen, Building2, MapPin, Briefcase, Tag, ClipboardList } from "lucide-react";

const rail: InnerRailGroup[] = [
  { label: "Operate", items: [
    { id: "dash", label: "Dashboard", icon: <Home className="h-3.5 w-3.5" /> },
    { id: "list", label: "Staff List", count: staff.length, icon: <Users2 className="h-3.5 w-3.5" /> },
    { id: "add", label: "Add Staff", icon: <UserPlus className="h-3.5 w-3.5" /> },
    { id: "upload", label: "Upload", icon: <Upload className="h-3.5 w-3.5" /> },
    { id: "edit", label: "Edit Multiple", icon: <Users2 className="h-3.5 w-3.5" /> },
    { id: "notes", label: "Notes", icon: <StickyNote className="h-3.5 w-3.5" /> },
    { id: "search-notes", label: "Search Notes", icon: <Search className="h-3.5 w-3.5" /> },
  ]},
  { label: "Reports", items: [
    { id: "register", label: "Register", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
    { id: "download", label: "Download List", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
    { id: "verify", label: "Data Verification Form", icon: <ClipboardList className="h-3.5 w-3.5" /> },
    { id: "idcard", label: "ID Card", icon: <IdCard className="h-3.5 w-3.5" /> },
    { id: "bdays", label: "Birthdays", icon: <Cake className="h-3.5 w-3.5" /> },
    { id: "docs", label: "Documents", icon: <FolderOpen className="h-3.5 w-3.5" /> },
  ]},
  { label: "Master", items: [
    { id: "m-dept", label: "Department", count: 6, icon: <Building2 className="h-3.5 w-3.5" /> },
    { id: "m-loc", label: "Location", icon: <MapPin className="h-3.5 w-3.5" /> },
    { id: "m-type", label: "Employee Type", icon: <Briefcase className="h-3.5 w-3.5" /> },
    { id: "m-cat", label: "Employee Category", icon: <Tag className="h-3.5 w-3.5" /> },
  ]},
];

const rows = staff.map(s => [s.id, s.name, s.role, s.dept, s.status]);

const flows: Record<string, ModuleFlow> = {
  dash: { title: "Staff Dashboard", subtitle: "Departments, presence and payroll",
    ai: "Mathematics dept is over-loaded (3 teachers > 32 periods/wk). Payroll shortfall of ₹1.8 L projected for August.",
    stats: [{label:"Total Staff",value:"194"},{label:"Present today",value:"186"},{label:"On leave",value:"8"},{label:"Payroll pending",value:"12"}],
    columns: ["Department","Headcount","Male","Female","On Leave"],
    rows: ["Mathematics","Sciences","Humanities","Languages","Sports","Administration"].map((d,i)=>[d,`${18+i*2}`,`${10+i}`,`${8+i}`,`${i%3}`]) },
  list: { title: "Staff List", subtitle: "Full directory", primaryAction: "Add Staff", columns: ["ID","Name","Role","Department","Status"], rows },
  add: { title: "Add Staff", subtitle: "Staff cannot be created without a department (multi-dept supported).", primaryAction: "Save", emptyHint: "Fill personal, employment, department (multi-select) and document sections." },
  upload: { title: "Upload Staff", subtitle: "Bulk staff import", primaryAction: "Upload", columns: ["Batch","Uploaded","Rows","Errors","Status"], rows: [["BATCH-014","3 days ago","24","0","Success"]] },
  edit: { title: "Edit Multiple", subtitle: "Bulk-update selected fields", primaryAction: "Apply", columns: ["ID","Name","Role","Department","Status"], rows },
  notes: { title: "Notes", subtitle: "Private notes on staff", columns: ["Date","Staff","Author","Note","Tag"], rows: [["2026-07-13","Priya Menon","Principal","Excellent parent-teacher session","Positive"]] },
  "search-notes": { title: "Search Notes", subtitle: "Find notes across all staff", emptyHint: "Enter keywords, author or date range to search staff notes." },
  register: { title: "Staff Register", subtitle: "Statutory register", columns: ["Emp No.","Name","Role","Joined","Status"], rows: staff.map((s,i)=>[s.id,s.name,s.role,`2022-0${1+(i%9)}-15`,s.status]) },
  download: { title: "Download List", subtitle: "Custom column export", columns: ["ID","Name","Role","Department","Status"], rows },
  verify: { title: "Data Verification Form", subtitle: "Send verification form to staff", primaryAction: "Send", columns: ["Staff","Sent","Responded","Verified","Status"], rows: staff.slice(0,8).map(s=>[s.name,"2026-07-01","2026-07-05","Yes","Approved"]) },
  idcard: { title: "ID Card", subtitle: "Bulk ID generation", primaryAction: "Generate PDF", columns: ["ID","Name","Role","Department","Status"], rows },
  bdays: { title: "Birthdays", subtitle: "Staff birthdays this month", columns: ["Staff","Role","Date","Days","Send"], rows: staff.slice(0,6).map((s,i)=>[s.name,s.role,`2026-07-${18+i}`,`${3+i}`,"SMS + Email"]) },
  docs: { title: "Documents", subtitle: "Staff document repository", columns: ["Staff","PAN","Aadhaar","Qualifications","Photo"], rows: staff.slice(0,10).map(s=>[s.name,"Uploaded","Uploaded","Uploaded","Uploaded"]) },
  "m-dept": { title: "Department Master", subtitle: "Departments — required for staff creation", primaryAction: "Add Department", columns: ["Department","Head","Staff","Budget","Status"], rows: [["Mathematics","Rakesh Iyer","22","₹18 L","Active"],["Sciences","Priya Menon","28","₹24 L","Active"],["Humanities","Nikhil Rao","18","₹14 L","Active"],["Languages","Anita Bose","20","₹15 L","Active"],["Sports","Vikram Singh","12","₹9 L","Active"],["Administration","Meera Kapoor","24","₹22 L","Active"]] },
  "m-loc": { title: "Location Master", subtitle: "Campus locations", primaryAction: "Add Location", columns: ["Location","Type","Rooms","Staff","Status"], rows: [["Main Block","Academic","42","120","Active"],["Science Block","Academic","18","32","Active"],["Sports Complex","Facility","6","12","Active"],["Admin Wing","Office","14","30","Active"]] },
  "m-type": { title: "Employee Type Master", subtitle: "Full-time / part-time / contract", primaryAction: "Add Type", columns: ["Type","Count","Benefits","Notice","Status"], rows: [["Full-time","162","Full","60 days","Active"],["Part-time","18","Partial","15 days","Active"],["Contract","14","None","30 days","Active"]] },
  "m-cat": { title: "Employee Category Master", subtitle: "Teaching / Non-teaching / Support", primaryAction: "Add Category", columns: ["Category","Count","Grade","Status"], rows: [["Teaching","132","T1-T5","Active"],["Non-teaching","38","N1-N3","Active"],["Support","24","S1-S2","Active"]] },
};

export default function StaffPage() {
  return <ModuleShell title="Staff" subtitle="194 employees across 6 departments" rail={rail} flows={flows} defaultFlow="dash" />;
}
