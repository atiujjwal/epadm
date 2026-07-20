"use client";

import { ModuleShell, type ModuleFlow } from "@/components/workspace/module-shell";

const rail = [
  { label: "Operate", items: [
    { id: "dashboard", label: "Dashboard" },
    { id: "issue", label: "Issue Book" },
    { id: "return", label: "Return Book" },
    { id: "reserve", label: "Reservations" },
    { id: "fines", label: "Fines" },
    { id: "lost", label: "Lost / Damaged" },
  ]},
  { label: "Catalog", items: [
    { id: "catalog", label: "Books & Media" },
    { id: "members", label: "Members" },
    { id: "acquisitions", label: "Acquisitions" },
  ]},
  { label: "Reports", items: [
    { id: "overdue", label: "Overdue", count: 18 },
    { id: "reports", label: "Circulation" },
    { id: "popular", label: "Most Popular" },
    { id: "dormant", label: "Dormant Members" },
  ]},
  { label: "Configure", items: [
    { id: "cfg-rules", label: "Membership Rules" },
    { id: "cfg-fines", label: "Fine Slabs" },
    { id: "cfg-classification", label: "Classification (DDC)" },
  ]},
];

const flows: Record<string, ModuleFlow> = {
  dashboard: {
    title: "Library at a glance",
    subtitle: "8,412 titles · 12,904 copies · 1,246 active members",
    ai: "Copilot: 32 titles are checked out >60% of the time. Reordering 2 additional copies each would cut waitlist by ~40%.",
    stats: [
      { label: "Circulating today", value: "184" },
      { label: "Overdue", value: "18", delta: "₹1,240 fines" },
      { label: "Reservations", value: "27" },
      { label: "Available", value: "11,708" },
    ],
    columns: ["Book", "Author", "Category", "Copies", "Available", "Waitlist"],
    rows: [
      ["The Discovery of India", "Nehru", "History", "8", "0", "6"],
      ["Wings of Fire", "Kalam", "Biography", "12", "3", "0"],
      ["Physics NCERT XI", "NCERT", "Textbook", "80", "12", "0"],
      ["Harry Potter I", "Rowling", "Fiction", "10", "1", "4"],
    ],
    primaryAction: "Issue book",
  },
  issue: {
    title: "Issue Book",
    subtitle: "Scan member ID + book barcode. Auto-checks limits and dues.",
    columns: ["Timestamp", "Member", "Class", "Book", "Due", "Status"],
    rows: [
      ["10:12", "STU-1042 · Aarav Kumar", "IX-B", "Wings of Fire", "01 Aug", "Active"],
      ["10:18", "STU-0991 · Diya Patel", "X-A", "Harry Potter I", "01 Aug", "Active"],
      ["10:24", "STU-1120 · Ishaan Roy", "VIII-C", "Physics NCERT", "22 Aug", "Active"],
    ],
    primaryAction: "New issue",
  },
  return: {
    title: "Return Book",
    columns: ["Member", "Book", "Issued", "Due", "Returned", "Fine"],
    rows: [
      ["STU-0871 · Kabir Shah", "The Alchemist", "01 Jul", "15 Jul", "15 Jul", "—"],
      ["STU-1204 · Meera Nair", "Malgudi Days", "28 Jun", "12 Jul", "15 Jul", "₹15 · Pending"],
    ],
    primaryAction: "Process return",
  },
  reserve: {
    title: "Reservations",
    columns: ["Book", "Requested by", "Requested", "Position", "Status"],
    rows: [
      ["The Discovery of India", "STU-1042", "12 Jul", "1", "Active"],
      ["Harry Potter I", "STU-0991", "13 Jul", "2", "Active"],
      ["Wings of Fire", "STU-1120", "14 Jul", "1", "Pending"],
    ],
  },
  fines: {
    title: "Fines",
    subtitle: "Auto-calculated from fine slabs · settled via fee account.",
    columns: ["Member", "Book", "Days late", "Amount", "Status"],
    rows: [
      ["Meera Nair", "Malgudi Days", "3", "₹15", "Pending"],
      ["Aarav Kumar", "Physics NCERT", "5", "₹25", "Pending"],
    ],
    primaryAction: "Collect fine",
  },
  lost: {
    title: "Lost / Damaged",
    columns: ["Member", "Book", "Reported", "Replacement", "Status"],
    rows: [
      ["STU-0761 · Yash V.", "Chemistry NCERT XI", "10 Jul", "₹480", "Pending"],
    ],
  },
  catalog: {
    title: "Catalog",
    columns: ["Accession", "Title", "Author", "DDC", "Copies", "Location"],
    rows: [
      ["ACC-00021", "Wings of Fire", "APJ Kalam", "920.KAL", "12", "R2 · S3"],
      ["ACC-00088", "Physics NCERT XI", "NCERT", "530.NCE", "80", "R4 · S1"],
      ["ACC-00142", "Malgudi Days", "R K Narayan", "823.NAR", "6", "R2 · S1"],
    ],
    primaryAction: "Add title",
  },
  members: {
    title: "Members",
    columns: ["Card #", "Name", "Type", "Limit", "Issued", "Fines"],
    rows: [
      ["LIB-1042", "Aarav Kumar", "Student · IX-B", "3", "1", "—"],
      ["LIB-EMP-031", "Anita Rao", "Staff · Maths", "6", "2", "—"],
      ["LIB-0991", "Diya Patel", "Student · X-A", "3", "2", "—"],
    ],
    primaryAction: "New member",
  },
  acquisitions: {
    title: "Acquisitions",
    columns: ["PO #", "Vendor", "Titles", "Copies", "Value", "Status"],
    rows: [
      ["PO-2026-14", "Rupa Books", "12", "84", "₹42,600", "Pending"],
      ["PO-2026-13", "OUP", "6", "48", "₹28,200", "Delivered"],
    ],
    primaryAction: "New PO",
  },
  overdue: {
    title: "Overdue (18)",
    ai: "12 of the 18 overdue books belong to 4 members with recurring returns. Consider a short suspension for 2 of them.",
    columns: ["Member", "Book", "Due", "Days late", "Fine"],
    rows: [
      ["Meera Nair", "Malgudi Days", "12 Jul", "3", "₹15"],
      ["Aarav Kumar", "Physics NCERT", "10 Jul", "5", "₹25"],
      ["Yash V.", "Chemistry NCERT", "05 Jul", "10", "₹50"],
    ],
  },
  reports: {
    title: "Circulation Report",
    columns: ["Week", "Issues", "Returns", "Reservations", "New members"],
    rows: [
      ["Wk 28", "924", "886", "42", "18"],
      ["Wk 27", "812", "802", "38", "12"],
      ["Wk 26", "780", "770", "31", "9"],
    ],
  },
  popular: {
    title: "Most popular titles",
    columns: ["Title", "Issues (90d)", "Avg. wait", "Copies"],
    rows: [
      ["Harry Potter I", "72", "4d", "10"],
      ["Wings of Fire", "68", "3d", "12"],
      ["Discovery of India", "42", "9d", "8"],
    ],
  },
  dormant: {
    title: "Dormant members",
    columns: ["Member", "Class", "Last issue", "Days idle"],
    rows: [
      ["Priya S.", "XI-A", "12 Feb", "154"],
      ["Rehan K.", "VII-B", "28 Mar", "109"],
    ],
  },
  "cfg-rules": {
    title: "Membership rules",
    columns: ["Type", "Max books", "Loan (days)", "Renewals", "Reservation cap"],
    rows: [
      ["Student · Primary", "2", "10", "1", "1"],
      ["Student · Secondary", "3", "14", "2", "2"],
      ["Staff · Teacher", "6", "30", "2", "3"],
      ["Staff · Admin", "3", "21", "1", "1"],
    ],
    primaryAction: "Edit rule",
  },
  "cfg-fines": {
    title: "Fine slabs",
    columns: ["Days late", "Per day", "Cap"],
    rows: [
      ["1 – 7", "₹5", "₹35"],
      ["8 – 21", "₹10", "₹140"],
      ["22+", "₹20", "Book price"],
    ],
  },
  "cfg-classification": {
    title: "DDC Classification",
    columns: ["Class", "Range", "Titles"],
    rows: [
      ["000 · General", "000–099", "142"],
      ["500 · Science", "500–599", "1,204"],
      ["800 · Literature", "800–899", "982"],
      ["900 · History", "900–999", "384"],
    ],
  },
};

export default function LibraryPage() {
  return (
    <ModuleShell
      title="Library"
      subtitle="Catalog · circulation · reservations · fines and acquisitions."
      rail={rail}
      flows={flows}
      defaultFlow="dashboard"
    />
  );
}
