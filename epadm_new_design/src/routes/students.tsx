import { createFileRoute } from "@tanstack/react-router";
import { ModuleShell } from "@/components/module-shell";
import type { InnerRailGroup } from "@/components/inner-rail";
import type { ModuleFlow } from "@/components/module-shell";
import { students } from "@/data/mock";
import { Home, UserPlus, Upload, Users2, StickyNote, Search, ArrowUpDown, RefreshCcw, Trash2, FileBarChart2, IdCard, Cake, FolderOpen, ClipboardList, BookOpen, Home as House, School } from "lucide-react";

export const Route = createFileRoute("/students")({
  head: () => ({ meta: [{ title: "Students · EPADM" }, { name: "description", content: "Complete student lifecycle: enrol, promote, report, and manage." }] }),
  component: StudentsPage,
});

const rail: InnerRailGroup[] = [
  { label: "Operate", items: [
    { id: "dash", label: "Dashboard", icon: <Home className="h-3.5 w-3.5" /> },
    { id: "list", label: "Student List", count: students.length, icon: <Users2 className="h-3.5 w-3.5" /> },
    { id: "add", label: "Add Student", icon: <UserPlus className="h-3.5 w-3.5" /> },
    { id: "import", label: "Import", icon: <Upload className="h-3.5 w-3.5" /> },
    { id: "bulk-edit", label: "Bulk Edit", icon: <Users2 className="h-3.5 w-3.5" /> },
    { id: "attach", label: "Bulk Attachments", icon: <FolderOpen className="h-3.5 w-3.5" /> },
    { id: "promote", label: "Promote / Detain", icon: <ArrowUpDown className="h-3.5 w-3.5" /> },
    { id: "rolls", label: "Change Roll Numbers", icon: <RefreshCcw className="h-3.5 w-3.5" /> },
    { id: "delete", label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" /> },
    { id: "search", label: "Search", icon: <Search className="h-3.5 w-3.5" /> },
    { id: "notes", label: "Notes", icon: <StickyNote className="h-3.5 w-3.5" /> },
  ]},
  { label: "Reports", items: [
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
  ]},
  { label: "Master", items: [
    { id: "m-class", label: "Class", icon: <School className="h-3.5 w-3.5" /> },
    { id: "m-house", label: "House", icon: <House className="h-3.5 w-3.5" /> },
  ]},
];

const studentRows = students.slice(0, 20).map(s => [s.id, s.name, `${s.grade}-${s.section}`, s.guardian, `${s.attendance}%`, s.feesStatus]);

const mk = (title: string, subtitle: string, extra?: Partial<ModuleFlow>): ModuleFlow => ({ title, subtitle, columns: ["ID","Name","Class","Guardian","Attendance","Fees"], rows: studentRows, ...extra });

const flows: Record<string, ModuleFlow> = {
  dash: { title: "Students Dashboard", subtitle: "Session 2026–27 overview",
    ai: "12 students at risk of dropping below 75% attendance. 3 duplicate records detected — merge or remove.",
    stats: [{label:"Strength",value:"2,847"},{label:"Joined (session)",value:"142"},{label:"Left",value:"18"},{label:"Detained",value:"7"}],
    columns: ["Class","Strength","Male","Female","Attendance %"],
    rows: ["Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"].map((g,i)=>[g,`${380+i*20}`,`${200+i*10}`,`${180+i*10}`,`${88+(i%4)}%`]) },
  list: mk("Student List", "Full directory — sortable, filterable, exportable", { primaryAction: "Add Student" }),
  add: { title: "Add Student", subtitle: "Enrol a new student", primaryAction: "Save",
    emptyHint: "Complete the enrolment form: personal details, guardian, class allocation, documents." },
  import: { title: "Import Students", subtitle: "Bulk upload via Excel/CSV", primaryAction: "Upload File",
    columns: ["Batch","Uploaded","Rows","Errors","Status"],
    rows: [["BATCH-124","2 days ago","142","0","Success"],["BATCH-123","1 week ago","98","2","Warning"]] },
  "bulk-edit": mk("Bulk Edit", "Update fields across many students at once", { primaryAction: "Apply" }),
  attach: { title: "Bulk Attachments", subtitle: "Upload documents mapped by admission number", primaryAction: "Upload",
    columns: ["File","Mapped to","Type","Size","Status"], rows: Array.from({length:5}).map((_,i)=>[`STU-${1024+i}_aadhar.pdf`, students[i].name, "Aadhaar", "412 KB", "Success"]) },
  promote: { title: "Promote / Detain", subtitle: "Bulk class transition at year-end",
    stats: [{label:"Eligible",value:"2,689"},{label:"Detained",value:"7"},{label:"Passed out",value:"151"},{label:"Pending",value:"0"}],
    columns: ["From","To","Students","Action","Status"],
    rows: ["Grade 6→7","Grade 7→8","Grade 8→9","Grade 9→10","Grade 10→11","Grade 11→12","Grade 12→Alumni"].map(g=>[g.split("→")[0],g.split("→")[1],"380","Promote","Pending"]) },
  rolls: mk("Change Roll Numbers", "Reassign roll numbers within a class"),
  delete: mk("Delete Students", "Soft-delete with reason and audit"),
  search: mk("Search Students", "Advanced multi-field search"),
  notes: { title: "Notes", subtitle: "Private notes on students", columns: ["Date","Student","Author","Note","Tag"],
    rows: [["2026-07-14","Kabir Sharma","Class Teacher","Improved participation in Math","Positive"],["2026-07-12","Ira Rao","Counsellor","Family situation — monitor","Sensitive"]] },
  register: mk("Register Report", "Official admission register", { columns: ["Adm No.","Name","Class","DOB","Guardian"], rows: students.slice(0,15).map(s=>[s.id,s.name,`${s.grade}-${s.section}`,s.dob,s.guardian]) }),
  strength: { title: "Strength Report", subtitle: "Class-wise and section-wise headcount",
    columns: ["Class","A","B","C","Total"], rows: ["Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"].map((g,i)=>[g,`${120+i*3}`,`${118+i*3}`,`${122+i*3}`,`${360+i*9}`]) },
  joined: mk("Joined Report", "Students admitted this session"),
  left: mk("Left Report", "Withdrawn / transferred students"),
  duplicates: { title: "Duplicates", subtitle: "Detected duplicate records", ai: "3 likely duplicates — same DOB and guardian phone.", columns: ["Set","Names","Match on","Score","Status"], rows: [["DUP-1","Aarav Sharma × 2","DOB + Phone","98%","Review"],["DUP-2","Ira Rao × 2","Name + DOB","94%","Review"]] },
  detained: mk("Detained Report", "Non-promoted students"),
  cert: mk("Certificate", "Generate TC, character, bonafide certificates", { primaryAction: "Generate" }),
  bdays: { title: "Birthdays & Anniversaries", subtitle: "Upcoming celebrations", columns: ["Student","Class","Date","Days","Send wish"], rows: students.slice(0,10).map((s,i)=>[s.name,`${s.grade}-${s.section}`,s.dob.slice(5),`${i}`, "SMS + Email"]) },
  download: mk("Download List", "Custom column export"),
  siblings: { title: "Siblings", subtitle: "Linked sibling records", columns: ["Family","Students","Classes","Guardian","Discount"], rows: [["Sharma","Aarav, Anaya","Grade 10, Grade 7","Ramesh Sharma","10%"],["Rao","Ira, Vivaan","Grade 8, Grade 6","Meera Rao","10%"]] },
  gr: mk("General Register", "Statutory general register format", { columns: ["GR No.","Name","Class","DOB","Admission Date"], rows: students.slice(0,15).map((s,i)=>[`GR-${5000+i}`, s.name, `${s.grade}-${s.section}`, s.dob, "2024-04-15"]) }),
  idcard: mk("ID Card", "Bulk ID card generation", { primaryAction: "Generate PDF" }),
  docs: { title: "Documents", subtitle: "Per-student document repository", columns: ["Student","Aadhaar","Birth Cert","Transfer Cert","Photo"], rows: students.slice(0,10).map(s=>[s.name,"Uploaded","Uploaded","-","Uploaded"]) },
  parents: { title: "Parents Register", subtitle: "Guardian directory", columns: ["Guardian","Students","Phone","Email","Occupation"], rows: students.slice(0,10).map(s=>[s.guardian, s.name, "+91 98••••••••","parent@example.com","Business"]) },
  "m-class": { title: "Class Master", subtitle: "Class and section configuration", primaryAction: "Add Class", columns: ["Class","Sections","Strength","Class Teacher","Status"], rows: ["Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"].map(g=>[g,"A, B, C","380","Assigned","Active"]) },
  "m-house": { title: "House Master", subtitle: "School houses for sports and events", primaryAction: "Add House", columns: ["House","Colour","Captain","Points","Status"], rows: [["Aravali","Red","Aarav Sharma","1240","Active"],["Nilgiri","Blue","Anaya Verma","1180","Active"],["Shivalik","Green","Kabir Rao","1310","Active"],["Vindhya","Yellow","Ira Menon","1090","Active"]] },
};

function StudentsPage() {
  return <ModuleShell title="Students" subtitle={`${students.length} enrolled · Grades 6–12`} rail={rail} flows={flows} defaultFlow="dash" />;
}
