"use client";

import { ModuleShell, type ModuleFlow } from "@/components/workspace/module-shell";
import type { MobileFlagRecord } from "@/lib/admin/mobile";
import MobileModulePage from "@/lib/modules/pages/mobile";

type Props = {
  initialFlags: MobileFlagRecord[];
};

export function MobileWorkspace({ initialFlags }: Props) {
  if (initialFlags.length === 0) {
    return <MobileModulePage />;
  }

  const flagRows = initialFlags.map((f) => [
    f.label,
    f.key,
    f.enabled ? "On" : "Off",
    f.enabled ? "Enabled" : "Draft",
  ]);

  const flagsFlow: ModuleFlow = {
    title: "Feature Flags",
    subtitle: "Live tenant feature flags from the database",
    columns: ["Feature", "Key", "State", "Status"],
    rows: flagRows,
    primaryAction: "Add flag",
    stats: [
      { label: "Flags", value: String(initialFlags.length) },
      {
        label: "Enabled",
        value: String(initialFlags.filter((f) => f.enabled).length),
      },
      {
        label: "Disabled",
        value: String(initialFlags.filter((f) => !f.enabled).length),
      },
    ],
  };

  return (
    <ModuleShell
      title="Mobile Apps"
      subtitle="Parent · Student · Teacher apps · single control plane."
      rail={[
        {
          label: "Insights",
          items: [
            { id: "dashboard", label: "Adoption" },
            { id: "engagement", label: "Engagement" },
          ],
        },
        {
          label: "Users",
          items: [
            { id: "parents", label: "Parents & Students" },
            { id: "teachers", label: "Teachers" },
            { id: "devices", label: "Devices" },
          ],
        },
        {
          label: "Content",
          items: [
            { id: "homework", label: "Homework Publisher" },
            { id: "visibility", label: "Exam Visibility" },
            { id: "push", label: "Notification Center" },
            { id: "fees-visibility", label: "Fees Visibility" },
            { id: "announcements", label: "Announcements" },
          ],
        },
        {
          label: "App",
          items: [
            { id: "flags", label: "Feature Flags", count: initialFlags.length },
            { id: "branding", label: "App Branding" },
            { id: "version", label: "App Version" },
            { id: "support", label: "Support Tickets", count: 6 },
          ],
        },
      ]}
      flows={{
        dashboard: {
          title: "Mobile Adoption",
          subtitle: "Parent · Student · Teacher apps · single control plane.",
          stats: [
            { label: "Feature flags", value: String(initialFlags.length) },
            {
              label: "Enabled",
              value: String(initialFlags.filter((f) => f.enabled).length),
            },
          ],
          columns: ["Feature", "Key", "State", "Status"],
          rows: flagRows,
          primaryAction: "Send install nudge",
        },
        engagement: {
          title: "Engagement",
          columns: ["Surface", "Opens 7d", "Avg dwell", "CTA click %"],
          rows: [
            ["Homework", "8,204", "1m 42s", "62%"],
            ["Results", "3,142", "48s", "78%"],
          ],
        },
        parents: {
          title: "Parents & Students",
          columns: ["Parent", "Children", "Phone", "Linked", "Last active", "Status"],
          rows: [["—", "—", "—", "—", "—", "Mock"]],
        },
        teachers: {
          title: "Teachers",
          columns: ["Emp ID", "Name", "Classes", "Subjects", "Last active", "Status"],
          rows: [["—", "—", "—", "—", "—", "Mock"]],
        },
        devices: {
          title: "Devices",
          columns: ["Device", "OS", "User", "Last seen", "Status"],
          rows: [["—", "—", "—", "—", "Mock"]],
        },
        homework: {
          title: "Homework Publisher",
          columns: ["Title", "Class", "Due", "Status"],
          rows: [["—", "—", "—", "Mock"]],
        },
        visibility: {
          title: "Exam Visibility",
          columns: ["Exam", "Class", "Marks", "Rank", "Comments", "Status"],
          rows: [["—", "—", "—", "—", "—", "Mock"]],
        },
        push: {
          title: "Notification Center",
          columns: ["Campaign", "Audience", "Sent", "Delivered", "Opened"],
          rows: [["—", "—", "—", "—", "—"]],
        },
        "fees-visibility": {
          title: "Fees Visibility",
          columns: ["Fee head", "Show breakdown", "Show due date", "Pay in app", "Status"],
          rows: [["Tuition", "Yes", "Yes", "Yes", "Active"]],
        },
        announcements: {
          title: "Announcements",
          columns: ["Title", "Audience", "Scheduled", "Status"],
          rows: [["—", "—", "—", "Draft"]],
        },
        flags: flagsFlow,
        branding: {
          title: "App Branding",
          columns: ["Asset", "Preview", "Updated", "Status"],
          rows: [["Icon", "circle · blue", "—", "Approved"]],
        },
        version: {
          title: "App Version",
          columns: ["Platform", "Current", "Rollout %", "Force update", "Status"],
          rows: [["Android · Parent", "2.14.1", "100%", "No", "Live"]],
        },
        support: {
          title: "Support Tickets",
          columns: ["Ticket", "User", "Type", "Age", "Status"],
          rows: [["#T-4021", "—", "Login OTP", "—", "Pending"]],
        },
      }}
      defaultFlow="flags"
    />
  );
}
