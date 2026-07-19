import { createFileRoute } from "@tanstack/react-router";
import { ModuleShell, type ModuleFlow } from "@/components/module-shell";

export const Route = createFileRoute("/mobile")({
  head: () => ({ meta: [{ title: "Mobile App Management · EPADM" }] }),
  component: MobilePage,
});

const rail = [
  { label: "Insights", items: [
    { id: "dashboard", label: "Adoption" },
    { id: "engagement", label: "Engagement" },
  ]},
  { label: "Users", items: [
    { id: "parents", label: "Parents & Students" },
    { id: "teachers", label: "Teachers" },
    { id: "devices", label: "Devices" },
  ]},
  { label: "Content", items: [
    { id: "homework", label: "Homework Publisher" },
    { id: "visibility", label: "Exam Visibility" },
    { id: "push", label: "Notification Center" },
    { id: "fees-visibility", label: "Fees Visibility" },
    { id: "announcements", label: "Announcements" },
  ]},
  { label: "App", items: [
    { id: "flags", label: "Feature Flags" },
    { id: "branding", label: "App Branding" },
    { id: "version", label: "App Version" },
    { id: "support", label: "Support Tickets", count: 6 },
  ]},
];

const flows: Record<string, ModuleFlow> = {
  dashboard: {
    title: "Mobile Adoption",
    subtitle: "Parent · Student · Teacher apps · single control plane.",
    ai: "Copilot: 214 parents haven't logged in for 30+ days. Draft a WhatsApp nudge with a magic sign-in link.",
    stats: [
      { label: "Installed · Parents", value: "1,842 / 2,104", delta: "88%" },
      { label: "Installed · Teachers", value: "126 / 128" },
      { label: "DAU · Parents", value: "1,214" },
      { label: "DAU · Teachers", value: "118" },
    ],
    columns: ["Cohort", "Users", "Installed", "Active 7d", "Active 30d"],
    rows: [
      ["Parents · Primary", "812", "742", "612", "738"],
      ["Parents · Secondary", "692", "620", "482", "612"],
      ["Parents · Senior", "600", "480", "382", "462"],
      ["Teachers", "128", "126", "118", "126"],
    ],
    primaryAction: "Send install nudge",
  },
  engagement: {
    title: "Engagement",
    columns: ["Surface", "Opens 7d", "Avg dwell", "CTA click %"],
    rows: [
      ["Homework", "8,204", "1m 42s", "62%"],
      ["Results", "3,142", "48s", "78%"],
      ["Fees", "2,842", "34s", "22%"],
      ["Attendance", "6,204", "22s", "18%"],
    ],
  },
  parents: {
    title: "Parents & Students",
    subtitle: "One parent account can be linked to multiple children.",
    columns: ["Parent", "Children", "Phone", "Linked", "Last active", "Status"],
    rows: [
      ["Rajesh Kumar", "Aarav · IX-B, Ishani · V-A", "+91 98…12", "Yes", "2h", "Active"],
      ["Priya Patel", "Diya · X-A", "+91 98…44", "Yes", "1d", "Active"],
      ["Vikas Roy", "Ishaan · VIII-C", "+91 98…19", "Pending", "—", "Pending"],
    ],
    primaryAction: "Invite parent",
  },
  teachers: {
    title: "Teachers",
    columns: ["Emp ID", "Name", "Classes", "Subjects", "Last active", "Status"],
    rows: [
      ["EMP-0031", "Anita Rao", "IX-B, X-A", "Math", "10m", "Active"],
      ["EMP-0044", "Suresh Iyer", "XI-A, XII-A", "Physics", "1h", "Active"],
      ["EMP-0059", "Farah Sheikh", "IX-C", "Biology", "3h", "Active"],
    ],
    primaryAction: "Grant access",
  },
  devices: {
    title: "Devices",
    columns: ["User", "Device", "OS", "App version", "Last seen", "Status"],
    rows: [
      ["Rajesh Kumar", "Pixel 7", "Android 15", "2.14.1", "2h", "Active"],
      ["Priya Patel", "iPhone 14", "iOS 18.2", "2.14.1", "1d", "Active"],
      ["Anita Rao (Teacher)", "OnePlus 11", "Android 15", "2.14.0", "10m", "Active"],
    ],
  },
  homework: {
    title: "Homework Publisher",
    columns: ["Class", "Subject", "Assigned", "Due", "Delivered", "Submitted"],
    rows: [
      ["IX-B", "Math", "14 Jul", "16 Jul", "42 / 42", "38"],
      ["X-A", "Science", "14 Jul", "17 Jul", "44 / 44", "40"],
    ],
    primaryAction: "New homework",
  },
  visibility: {
    title: "Exam Visibility",
    subtitle: "Control what parents and students see in the mobile app.",
    columns: ["Exam", "Class", "Marks", "Rank", "Comments", "Status"],
    rows: [
      ["Unit Test 2 · Math", "IX", "Visible", "Hidden", "Visible", "Active"],
      ["Mid-term", "X", "Visible", "Visible", "Visible", "Active"],
      ["Weekly · Chemistry", "XI", "Hidden", "Hidden", "Hidden", "Draft"],
    ],
  },
  push: {
    title: "Notification Center",
    columns: ["Campaign", "Audience", "Sent", "Delivered", "Opened"],
    rows: [
      ["Fee reminder · July", "Parents · dues > 0", "412", "408", "312"],
      ["Sports day", "All parents", "2,104", "2,082", "1,684"],
      ["Board prep · Class X", "Class X parents", "220", "220", "204"],
    ],
    primaryAction: "New push",
  },
  "fees-visibility": {
    title: "Fees Visibility",
    columns: ["Fee head", "Show breakdown", "Show due date", "Pay in app", "Status"],
    rows: [
      ["Tuition", "Yes", "Yes", "Yes", "Active"],
      ["Transport", "Yes", "Yes", "Yes", "Active"],
      ["Misc · Excursion", "Yes", "Yes", "Yes", "Active"],
    ],
  },
  announcements: {
    title: "Announcements",
    columns: ["Title", "Audience", "Scheduled", "Status"],
    rows: [
      ["PTM · Sat 10am", "Grade IX parents", "Fri 6pm", "Draft"],
      ["Independence Day", "All", "14 Aug 8am", "Approved"],
    ],
    primaryAction: "New announcement",
  },
  flags: {
    title: "Feature Flags",
    columns: ["Feature", "Parents", "Students", "Teachers", "Status"],
    rows: [
      ["In-app fee payment", "On", "—", "—", "Enabled"],
      ["Live bus tracking", "On", "—", "—", "Enabled"],
      ["Peer chat (moderated)", "Off", "Off", "Off", "Draft"],
      ["AI parent copilot", "On", "—", "—", "Enabled"],
    ],
  },
  branding: {
    title: "App Branding",
    columns: ["Asset", "Preview", "Updated", "Status"],
    rows: [
      ["Icon", "circle · blue", "12 Jul", "Approved"],
      ["Splash", "logo · light", "12 Jul", "Approved"],
      ["Primary colour", "#3B4C7E", "12 Jul", "Approved"],
    ],
  },
  version: {
    title: "App Version",
    columns: ["Platform", "Current", "Rollout %", "Force update", "Status"],
    rows: [
      ["Android · Parent", "2.14.1", "100%", "No", "Live"],
      ["iOS · Parent", "2.14.1", "100%", "No", "Live"],
      ["Android · Teacher", "2.14.0", "100%", "No", "Live"],
      ["iOS · Teacher", "2.14.0", "100%", "No", "Live"],
    ],
    primaryAction: "Publish build",
  },
  support: {
    title: "Support Tickets (6)",
    columns: ["Ticket", "User", "Type", "Age", "Status"],
    rows: [
      ["#T-4021", "Rajesh Kumar", "Login OTP", "2h", "Pending"],
      ["#T-4020", "Priya Patel", "Fee payment failed", "5h", "Pending"],
      ["#T-4019", "Anita Rao", "Homework upload", "1d", "Approved"],
    ],
  },
};

function MobilePage() {
  return (
    <ModuleShell
      title="Mobile App Management"
      subtitle="Users, content visibility, notifications, feature flags and branding for the Parent / Student / Teacher apps."
      rail={rail}
      flows={flows}
      defaultFlow="dashboard"
    />
  );
}
