"use client";

import { ModuleShell, type ModuleFlow } from "@/components/workspace/module-shell";

const rail = [
  { label: "Overview", items: [
    { id: "overview", label: "Overview" },
    { id: "monitors", label: "Monitors" },
  ]},
  { label: "Content", items: [
    { id: "notice", label: "Notice Composer" },
    { id: "circular", label: "Circular & Newsletter" },
    { id: "certificate", label: "Certificate" },
  ]},
  { label: "Academics", items: [
    { id: "syllabus", label: "Syllabus Drafter" },
    { id: "lesson", label: "Lesson Plan" },
    { id: "exam-creator", label: "Exam / Test Creator" },
    { id: "question-bank", label: "Question Bank" },
    { id: "worksheet", label: "Worksheet & Homework" },
    { id: "comments", label: "Report Card Comments" },
  ]},
  { label: "Copilots", items: [
    { id: "teacher-copilot", label: "Teacher" },
    { id: "principal-copilot", label: "Principal" },
    { id: "parent-copilot", label: "Parent" },
    { id: "interview", label: "Admissions Interview" },
    { id: "timetable-ai", label: "Timetable Suggester" },
  ]},
  { label: "Governance", items: [
    { id: "kb", label: "Knowledge Base" },
    { id: "prompts", label: "Prompts & Templates" },
    { id: "governance", label: "Usage & Guardrails" },
  ]},
];

const flows: Record<string, ModuleFlow> = {
  overview: {
    title: "EPADM AI Studio",
    subtitle: "Purpose-built generators, agents and monitors tuned for K-12 operations.",
    ai: "Copilot: This week your school ran 214 generations. Highest ROI: Report Card Comments saved teachers ~38 hours.",
    stats: [
      { label: "Generations · 7d", value: "214", delta: "+18% wow" },
      { label: "Time saved", value: "62 h" },
      { label: "Credits left", value: "8.4 K" },
      { label: "Active copilots", value: "12" },
    ],
    columns: ["Studio", "Used this week", "Avg quality", "Owner"],
    rows: [
      ["Notice Composer", "38", "4.7 / 5", "Admin"],
      ["Syllabus Drafter", "22", "4.6 / 5", "Academics"],
      ["Exam Creator", "44", "4.5 / 5", "Exams"],
      ["Worksheet Builder", "51", "4.8 / 5", "Teachers"],
      ["Report Card Comments", "59", "4.9 / 5", "Class Teachers"],
    ],
    primaryAction: "New generation",
  },
  monitors: {
    title: "AI Monitors",
    subtitle: "Continuous agents watching your school data.",
    columns: ["Monitor", "Trigger", "Last fired", "Action", "Status"],
    rows: [
      ["Fee default predictor", "Payment overdue > 7d", "2h ago", "Flag + WhatsApp draft", "Active"],
      ["Attendance drift", "Class avg < 90% for 3d", "1d ago", "Notify class teacher", "Active"],
      ["Marks anomaly", "z-score < -2 vs history", "3d ago", "Escalate to HOD", "Active"],
      ["Vehicle route lag", "GPS delay > 10m", "—", "Alert parent app", "Draft"],
    ],
    primaryAction: "New monitor",
  },
  notice: {
    title: "Notice Composer",
    subtitle: "Tone, audience, channel and language — generate a school notice in seconds.",
    ai: "Try: 'PTM reminder for Grade IX parents, Saturday 10am, warm tone, English + Hindi'.",
    columns: ["Draft", "Audience", "Channel", "Language", "Status"],
    rows: [
      ["PTM · Grade IX", "Parents", "SMS + App", "EN · HI", "Draft"],
      ["Fee due · July", "Parents", "WhatsApp", "EN", "Sent"],
      ["Sports day rehearsal", "All students", "App", "EN", "Approved"],
    ],
    primaryAction: "Generate notice",
  },
  circular: {
    title: "Circular & Newsletter",
    columns: ["Title", "Type", "Sections", "Last edited", "Status"],
    rows: [
      ["Monthly · June '26", "Newsletter", "8", "12 Jul", "Draft"],
      ["Independence Day circular", "Circular", "3", "10 Jul", "Approved"],
    ],
    primaryAction: "Draft new",
  },
  certificate: {
    title: "Certificate Generator",
    columns: ["Template", "Recipients", "Language", "Status"],
    rows: [
      ["Merit · Mid-term", "Top 5 per class", "EN", "Draft"],
      ["Sports · House Cup", "House captains", "EN", "Approved"],
    ],
    primaryAction: "New certificate",
  },
  syllabus: {
    title: "Syllabus Drafter",
    subtitle: "Board-aligned syllabi (CBSE / ICSE / State) generated from bare topic list.",
    ai: "Copilot: Generated syllabi map to NCF-2023 competencies. Review learning outcomes before publishing to teachers.",
    columns: ["Subject", "Class", "Board", "Chapters", "Status"],
    rows: [
      ["Mathematics", "IX", "CBSE", "15", "Draft"],
      ["Science", "X", "CBSE", "16", "Approved"],
      ["Social Studies", "VIII", "ICSE", "24", "Draft"],
    ],
    primaryAction: "Draft syllabus",
  },
  lesson: {
    title: "Lesson Plan",
    columns: ["Class", "Subject", "Topic", "Duration", "Status"],
    rows: [
      ["IX-B", "Math", "Coordinate Geometry · Intro", "40m", "Draft"],
      ["X-A", "Physics", "Light · Reflection", "40m", "Approved"],
    ],
    primaryAction: "Generate plan",
  },
  "exam-creator": {
    title: "Exam / Test Creator",
    subtitle: "Blueprint → sections → difficulty mix → auto-generate question paper + answer key.",
    ai: "Blueprint balancer: Your Class X Science mock has 62% recall. Copilot suggests raising Application to 30% for board alignment.",
    columns: ["Paper", "Class", "Subject", "Marks", "Sections", "Status"],
    rows: [
      ["Mock · Board Prep", "X", "Science", "80", "5", "Draft"],
      ["Unit Test 2", "IX", "Math", "40", "3", "Approved"],
      ["Weekly · Chemistry", "XI", "Chemistry", "20", "2", "Sent"],
    ],
    primaryAction: "New exam",
  },
  "question-bank": {
    title: "Question Bank",
    columns: ["Subject", "Class", "Topic", "Questions", "Difficulty mix"],
    rows: [
      ["Math", "IX", "Polynomials", "184", "E:60 · M:80 · H:44"],
      ["Physics", "X", "Light", "142", "E:50 · M:62 · H:30"],
      ["English", "VIII", "Grammar", "220", "E:120 · M:70 · H:30"],
    ],
    primaryAction: "Add questions",
  },
  worksheet: {
    title: "Worksheet & Homework",
    columns: ["Class", "Subject", "Topic", "Length", "Assigned to", "Status"],
    rows: [
      ["IX-B", "Math", "Polynomials · practice", "10 Q", "IX-B", "Delivered"],
      ["VI-A", "EVS", "Water cycle", "6 Q", "VI-A", "Draft"],
    ],
    primaryAction: "New worksheet",
  },
  comments: {
    title: "Report Card Comments",
    subtitle: "Per-student narrative, tone-controlled, aligned to marks + attendance + behaviour.",
    ai: "Class teachers saved 38 h last week using this. Comments include growth areas and one concrete action for parents.",
    columns: ["Class", "Students", "Draft", "Approved", "Status"],
    rows: [
      ["IX-B", "42", "42", "40", "Pending"],
      ["X-A", "44", "44", "44", "Approved"],
      ["VIII-C", "38", "36", "30", "Draft"],
    ],
    primaryAction: "Generate for class",
  },
  "teacher-copilot": {
    title: "Teacher Copilot",
    subtitle: "In-context help embedded in class, homework, marks and communication screens.",
    columns: ["Capability", "Trigger", "Coverage", "Status"],
    rows: [
      ["Reword parent message", "Communications compose", "All teachers", "Active"],
      ["Suggest remediation", "Below-average marks", "Class + subject teachers", "Active"],
      ["Explain misconception", "Homework grading", "Class teacher", "Active"],
    ],
  },
  "principal-copilot": {
    title: "Principal Copilot",
    columns: ["Capability", "Trigger", "Signals", "Status"],
    rows: [
      ["Morning brief", "Every 8:00 AM", "Attendance, dues, incidents", "Active"],
      ["Board pack", "Weekly · Mondays", "KPIs, exceptions, actions", "Active"],
      ["What-if enrolment", "On demand", "Fees + capacity + staff", "Draft"],
    ],
  },
  "parent-copilot": {
    title: "Parent Copilot",
    subtitle: "Answers on the parent app · academic progress, fees, transport, homework.",
    columns: ["Query type", "Volume · 7d", "Auto-resolved", "Escalated"],
    rows: [
      ["Fees & dues", "412", "94%", "24"],
      ["Homework & tests", "268", "88%", "32"],
      ["Transport & routes", "112", "91%", "10"],
      ["Results & marks", "204", "96%", "8"],
    ],
  },
  interview: {
    title: "Admissions Interview Assistant",
    columns: ["Applicant", "Grade sought", "Suggested Qs", "Rubric", "Status"],
    rows: [
      ["Reyansh M.", "III", "12", "K-3 · Curiosity", "Draft"],
      ["Anaya S.", "VI", "14", "Middle · Analytical", "Approved"],
    ],
  },
  "timetable-ai": {
    title: "Timetable Suggester",
    ai: "3 teacher clashes detected in current draft. Copilot proposes swapping IX-B Math P3 ↔ P5 to resolve.",
    columns: ["Draft", "Conflicts", "Teacher load σ", "Room utilisation"],
    rows: [
      ["Term 2 · v3", "3", "0.62", "78%"],
      ["Term 2 · v2", "8", "0.71", "74%"],
    ],
    primaryAction: "Generate v4",
  },
  kb: {
    title: "Knowledge Base",
    subtitle: "Grounded on your own policies, circulars, syllabi, marksheets and staff docs.",
    columns: ["Source", "Chunks", "Last synced", "Status"],
    rows: [
      ["School policies", "184", "12 Jul", "Active"],
      ["Circulars · 2025-26", "342", "12 Jul", "Active"],
      ["CBSE syllabus set", "1,204", "01 Jul", "Active"],
      ["Staff handbook", "62", "18 Jun", "Active"],
    ],
    primaryAction: "Add source",
  },
  prompts: {
    title: "Prompts & Templates",
    columns: ["Name", "Studio", "Owner", "Last used", "Status"],
    rows: [
      ["Fee reminder · warm", "Notice", "Admin", "1h", "Active"],
      ["PT mid-term comment · balanced", "Comments", "Academics", "2d", "Active"],
      ["Board prep blueprint · X", "Exam", "Exams HOD", "1d", "Draft"],
    ],
    primaryAction: "New template",
  },
  governance: {
    title: "Usage & Guardrails",
    subtitle: "Per-role quotas, PII redaction and audit trail for every generation.",
    stats: [
      { label: "Credits used", value: "1.6 K", delta: "This month" },
      { label: "Credits left", value: "8.4 K" },
      { label: "PII blocks", value: "12" },
      { label: "Flagged outputs", value: "3" },
    ],
    columns: ["Role", "Monthly quota", "Used", "Guardrails", "Status"],
    rows: [
      ["Principal", "Unlimited", "184", "Full", "Active"],
      ["Teacher", "500 / mo", "82", "PII + tone", "Active"],
      ["Admin", "2,000 / mo", "612", "PII", "Active"],
      ["Parent app", "100 / mo per parent", "48 avg", "Read-only + PII", "Active"],
    ],
  },
};

export default function AIStudioPage() {
  return (
    <ModuleShell
      title="AI Studio"
      subtitle="AI-first workspace for notices, syllabi, exams, worksheets, report cards and role-specific copilots."
      rail={rail}
      flows={flows}
      defaultFlow="overview"
    />
  );
}
