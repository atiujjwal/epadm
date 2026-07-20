export type Student = {
  id: string;
  name: string;
  grade: string;
  section: string;
  guardian: string;
  attendance: number;
  feesStatus: "Paid" | "Partial" | "Overdue";
  gpa: number;
  risk: "low" | "medium" | "high";
  dob: string; // ISO
};

const first = ["Aarav", "Vivaan", "Aditya", "Ishaan", "Kabir", "Anaya", "Diya", "Myra", "Sara", "Zara", "Rohan", "Aryan", "Ira", "Kiara", "Reyansh", "Vihaan", "Meera", "Naina", "Advait", "Rhea"];
const last = ["Sharma", "Verma", "Patel", "Iyer", "Nair", "Khan", "Kapoor", "Menon", "Rao", "Gupta", "Singh", "Joshi", "Malhotra", "Bose", "Reddy"];
const grades = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
const sections = ["A", "B", "C"];

let seed = 42;
const rand = () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};
const pick = <T>(a: T[]) => a[Math.floor(rand() * a.length)];

export const students: Student[] = Array.from({ length: 48 }).map((_, i) => {
  const att = Math.round(70 + rand() * 30);
  const fees = pick(["Paid", "Paid", "Paid", "Partial", "Overdue"] as const);
  const gpa = +(2.5 + rand() * 1.5).toFixed(2);
  const risk = att < 78 || fees === "Overdue" ? (att < 74 ? "high" : "medium") : "low";
  const month = 1 + Math.floor(rand() * 12);
  const day = 1 + Math.floor(rand() * 27);
  const year = 2010 + Math.floor(rand() * 6);
  return {
    id: `STU-${(1024 + i).toString()}`,
    name: `${pick(first)} ${pick(last)}`,
    grade: pick(grades),
    section: pick(sections),
    guardian: `${pick(first)} ${pick(last)}`,
    attendance: att,
    feesStatus: fees,
    gpa,
    risk,
    dob: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
  };
});

export const gradesList = grades;
export const sectionsList = sections;

export const kpis = [
  { label: "Total Enrollment", value: "2,847", delta: "+3.2%", trend: "up" as const, hint: "vs last term" },
  { label: "Attendance Today", value: "94.2%", delta: "+0.8%", trend: "up" as const, hint: "2,682 of 2,847" },
  { label: "Fees Collected (MTD)", value: "₹1.42 Cr", delta: "+12.4%", trend: "up" as const, hint: "of ₹1.68 Cr billed" },
  { label: "Outstanding Dues", value: "₹26.1 L", delta: "-4.1%", trend: "down" as const, hint: "142 accounts" },
  { label: "Staff Present", value: "186 / 194", delta: "96%", trend: "flat" as const, hint: "8 on leave" },
  { label: "Open Incidents", value: "7", delta: "+2", trend: "up" as const, hint: "3 high priority" },
];

export const attendanceSeries = [
  { d: "Mon", present: 94.1, absent: 5.9 },
  { d: "Tue", present: 93.4, absent: 6.6 },
  { d: "Wed", present: 95.2, absent: 4.8 },
  { d: "Thu", present: 92.8, absent: 7.2 },
  { d: "Fri", present: 94.6, absent: 5.4 },
  { d: "Sat", present: 91.3, absent: 8.7 },
];

export const feesSeries = Array.from({ length: 12 }).map((_, i) => ({
  m: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"][i],
  collected: 80 + Math.round(rand() * 60),
  billed: 120 + Math.round(rand() * 40),
}));

// --- Wave 1 additions ---

// Last 15 days fees collection (₹ Lakhs)
export const feesLast15Days = Array.from({ length: 15 }).map((_, i) => {
  const d = new Date(2026, 6, i + 1);
  return {
    d: d.toISOString().slice(0, 10),
    label: `${d.getDate()} Jul`,
    collected: +(4 + rand() * 8).toFixed(2),
    receipts: 20 + Math.floor(rand() * 60),
  };
});

export const todaysFeeCollection = {
  total: 8_42_500,
  receipts: 47,
  cash: 1_82_000,
  online: 5_18_500,
  cheque: 1_42_000,
  topClass: "Grade 10",
  hourly: Array.from({ length: 9 }).map((_, i) => ({
    h: `${8 + i}:00`,
    v: Math.round(15000 + rand() * 90000),
  })),
};

// Today's attendance by grade for Session 2026-27
export const todaysAttendanceByGrade = grades.map((g) => {
  const total = 380 + Math.floor(rand() * 80);
  const present = Math.round(total * (0.88 + rand() * 0.1));
  return {
    grade: g,
    total,
    present,
    absent: total - present,
    late: Math.floor(rand() * 12),
    pct: +((present / total) * 100).toFixed(1),
  };
});

// Attendance entry status for last 15 days (class × day)
export const attendanceEntryStatus = Array.from({ length: 15 }).map((_, i) => {
  const d = new Date(2026, 6, i + 1);
  return {
    d: d.toISOString().slice(0, 10),
    label: `${d.getDate()}`,
    classes: grades.flatMap((g) =>
      sections.map((s) => ({
        cls: `${g.replace("Grade ", "")}-${s}`,
        status: rand() > 0.12 ? "entered" : rand() > 0.5 ? "partial" : "missing",
      })),
    ),
  };
});

// Birthdays
function daysUntil(iso: string, ref = new Date(2026, 6, 15)) {
  const [, m, d] = iso.split("-").map(Number);
  const next = new Date(ref.getFullYear(), m - 1, d);
  if (next < ref) next.setFullYear(ref.getFullYear() + 1);
  return Math.floor((+next - +ref) / 86_400_000);
}

export const birthdaysToday = students
  .filter((s) => s.dob.slice(5) === "07-15")
  .concat(students.slice(0, 3).map((s) => ({ ...s, dob: "2012-07-15" })))
  .slice(0, 4);

export const birthdaysThisMonth = students
  .filter((s) => s.dob.slice(5, 7) === "07")
  .map((s) => ({ ...s, days: daysUntil(s.dob) }))
  .sort((a, b) => a.days - b.days)
  .slice(0, 18);

// Holidays
export const holidays = [
  { date: "2026-08-15", name: "Independence Day", reason: "National Holiday", type: "National" },
  { date: "2026-09-05", name: "Teachers' Day", reason: "Observance", type: "School" },
  { date: "2026-10-02", name: "Gandhi Jayanti", reason: "National Holiday", type: "National" },
  { date: "2026-10-20", name: "Diwali Break", reason: "Festival", type: "Festival" },
  { date: "2026-10-21", name: "Diwali Break", reason: "Festival", type: "Festival" },
  { date: "2026-12-25", name: "Christmas", reason: "Festival", type: "Festival" },
  { date: "2027-01-26", name: "Republic Day", reason: "National Holiday", type: "National" },
  { date: "2027-03-06", name: "Holi", reason: "Festival", type: "Festival" },
];

export const holidayReasons = ["National Holiday", "Festival", "Observance", "School Event", "Weather", "Government Order"];

export const sessionConfig = {
  current: "2026 – 2027",
  start: "2026-04-01",
  end: "2027-03-31",
  workingDays: 220,
  saturdaysOff: false,
};

// Leave applications
export const leaveApplications = [
  { id: "LV-2411", student: "Kabir Sharma", grade: "Grade 10", section: "B", from: "2026-07-16", to: "2026-07-18", reason: "Family function", status: "Pending" as const, applied: "2026-07-14" },
  { id: "LV-2412", student: "Ira Rao", grade: "Grade 8", section: "A", from: "2026-07-15", to: "2026-07-15", reason: "Medical appointment", status: "Pending" as const, applied: "2026-07-14" },
  { id: "LV-2413", student: "Sara Menon", grade: "Grade 10", section: "B", from: "2026-07-17", to: "2026-07-22", reason: "Wedding travel", status: "Approved" as const, applied: "2026-07-10" },
  { id: "LV-2414", student: "Advait Ghosh", grade: "Grade 9", section: "C", from: "2026-07-15", to: "2026-07-16", reason: "Viral fever", status: "Approved" as const, applied: "2026-07-13" },
  { id: "LV-2415", student: "Rhea Singh", grade: "Grade 11", section: "A", from: "2026-07-20", to: "2026-07-21", reason: "Sports competition", status: "Pending" as const, applied: "2026-07-14" },
  { id: "LV-2416", student: "Vivaan Rao", grade: "Grade 7", section: "B", from: "2026-07-12", to: "2026-07-13", reason: "Dental surgery", status: "Rejected" as const, applied: "2026-07-11" },
];

export const admissionsFunnel = [
  { stage: "Enquiry", count: 412 },
  { stage: "Applied", count: 268 },
  { stage: "Assessed", count: 194 },
  { stage: "Offered", count: 142 },
  { stage: "Enrolled", count: 118 },
];

export const activity = [
  { t: "2m", who: "Priya Menon", what: "marked attendance for Grade 10-B", tag: "Attendance" },
  { t: "14m", who: "Copilot", what: "flagged 3 chronic absentees in Grade 8", tag: "AI" },
  { t: "37m", who: "Rahul Iyer", what: "issued fee reminder to 42 guardians", tag: "Fees" },
  { t: "1h", who: "Admissions", what: "moved 6 applicants to Assessed", tag: "Admissions" },
  { t: "2h", who: "Copilot", what: "detected timetable conflict in Physics-11A", tag: "AI" },
  { t: "3h", who: "Neha Kapoor", what: "published Term 2 exam schedule", tag: "Exams" },
];

export const heatmap = grades.map((g) => ({
  grade: g,
  cells: sections.map((s) => ({ s, v: Math.round(82 + rand() * 16) })),
}));

export type Invoice = {
  id: string;
  student: string;
  amount: number;
  due: string;
  status: "Paid" | "Partial" | "Overdue" | "Pending";
  aging: number;
};
export const invoices: Invoice[] = students.slice(0, 24).map((s, i) => ({
  id: `INV-${2400 + i}`,
  student: s.name,
  amount: 12000 + Math.round(rand() * 38000),
  due: `2026-0${1 + (i % 6)}-${10 + (i % 18)}`,
  status: pick(["Paid", "Paid", "Partial", "Overdue", "Pending"] as const),
  aging: Math.round(rand() * 90),
}));

export const admissions = [
  { stage: "Enquiry", items: ["Kabir Sethi", "Ira Bhatt", "Vivaan Rao", "Anaya Shah", "Rohan Das"] },
  { stage: "Applied", items: ["Myra Kohli", "Ishaan Puri", "Sara Chawla"] },
  { stage: "Assessed", items: ["Zara Ali", "Advait Ghosh"] },
  { stage: "Offered", items: ["Rhea Singh", "Aarav Menon"] },
  { stage: "Enrolled", items: ["Diya Kapoor"] },
];

export const staff = Array.from({ length: 16 }).map((_, i) => ({
  id: `EMP-${400 + i}`,
  name: `${pick(first)} ${pick(last)}`,
  role: pick(["Teacher", "Head of Dept", "Coordinator", "Counsellor", "Admin"]),
  dept: pick(["Mathematics", "Sciences", "Humanities", "Languages", "Sports", "Administration"]),
  status: pick(["Active", "Active", "Active", "On Leave"] as const),
}));

export const periods = ["08:00", "08:50", "09:40", "10:40", "11:30", "12:20", "13:20", "14:10"];
export const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const subjects = ["Math", "Physics", "English", "History", "CS", "Biology", "Chem", "PE", "Art", "—"];
export const timetable = days.map((d) => ({
  d,
  slots: periods.map((p, i) => ({ p, subj: subjects[(i + d.length) % subjects.length], room: `R${100 + i}` })),
}));

export const insights = [
  { title: "12 students at risk of dropping below 75% attendance", severity: "high", meta: "Grade 8 · Grade 10", action: "Notify class teachers" },
  { title: "Fee default risk: 8 accounts likely to miss next cycle", severity: "medium", meta: "Predicted ₹3.4 L exposure", action: "Send reminders" },
  { title: "Timetable conflict detected in Physics-11A", severity: "medium", meta: "Wed · Period 4", action: "Suggest fix" },
  { title: "Staff workload imbalance in Mathematics dept", severity: "low", meta: "3 teachers > 32 periods/wk", action: "Rebalance" },
];
