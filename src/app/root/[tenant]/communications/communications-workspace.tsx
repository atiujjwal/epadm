"use client";

import { useMemo, useState, useTransition } from "react";
import { ModuleShell, type ModuleFlow } from "@/components/workspace/module-shell";
import type { InnerRailGroup } from "@/components/workspace/inner-rail";
import type { CampaignRecord } from "@/lib/admin/communications";
import { fetchWithCsrf } from "@/lib/http/fetch-with-csrf";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FormSuccess } from "@/components/ui/form";
import { FormErrorSummary } from "@/components/ui/form-error-summary";
import {
  Home,
  Send,
  Bell,
  Layers,
  Mail,
  MessageSquare,
  Smartphone,
  FileText,
  Sparkles,
  ListChecks,
  Globe,
} from "lucide-react";

type Props = {
  initialCampaigns: CampaignRecord[];
};

const audiences = [
  "Class",
  "Section",
  "Whole school",
  "Teachers",
  "Drivers",
  "Cleaning staff",
  "All staff",
  "Custom list",
];

function campaignRows(campaigns: CampaignRecord[]): string[][] {
  return campaigns.map((c) => {
    const reach =
      c.sentCount > 0
        ? `${Math.round((c.deliveredCount / c.sentCount) * 100)}%`
        : "—";
    return [c.name, "1", c.audience, reach, c.status];
  });
}

function CampaignCatalog({ initialCampaigns }: Props) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({
    name: "",
    channel: "SMS",
    audience: "Whole school",
    status: "draft",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return campaigns;
    return campaigns.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.channel.toLowerCase().includes(q) ||
        c.audience.toLowerCase().includes(q),
    );
  }, [query, campaigns]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const response = await fetchWithCsrf("/api/admin/communications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          setError(payload?.error ?? "Could not create campaign.");
          return;
        }

        const created = payload.campaign as CampaignRecord;
        setCampaigns((current) => [created, ...current]);
        setForm({ name: "", channel: "SMS", audience: "Whole school", status: "draft" });
        setSuccess("Campaign created.");
      } catch (submitError) {
        console.error("[communications-campaigns] submit failed:", submitError);
        setError("Could not create campaign.");
      }
    });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
      <section>
        <Card variant="elevated" padding="lg" className="xl:sticky xl:top-20">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-primary">New campaign</h2>
            <p className="mt-1 text-xs text-secondary">Create a multi-channel communication campaign.</p>
          </div>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="campaignName">Name</Label>
              <Input
                id="campaignName"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="channel">Channel</Label>
              <Select
                id="channel"
                value={form.channel}
                onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))}
              >
                <option value="SMS">SMS</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Email">Email</option>
                <option value="In-App">In-App</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="audience">Audience</Label>
              <Select
                id="audience"
                value={form.audience}
                onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))}
              >
                {audiences.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="campaignStatus">Status</Label>
              <Select
                id="campaignStatus"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
              </Select>
            </div>
            <FormErrorSummary errors={error ? [error] : []} />
            {success ? <FormSuccess>{success}</FormSuccess> : null}
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Saving…" : "Create campaign"}
            </Button>
          </form>
        </Card>
      </section>

      <section className="space-y-3">
        <Input
          placeholder="Search name, channel, audience…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Delivered</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {campaigns.length === 0
                      ? "No campaigns yet — create your first campaign."
                      : "No campaigns match your search."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>{campaign.name}</TableCell>
                    <TableCell>{campaign.channel}</TableCell>
                    <TableCell>{campaign.audience}</TableCell>
                    <TableCell>{campaign.sentCount}</TableCell>
                    <TableCell>{campaign.deliveredCount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {campaign.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

function buildRail(campaignCount: number): InnerRailGroup[] {
  return [
    {
      label: "Operate",
      items: [
        { id: "dash", label: "Dashboard", icon: <Home className="h-3.5 w-3.5" /> },
        { id: "compose", label: "Compose", icon: <Send className="h-3.5 w-3.5" /> },
        { id: "notices", label: "Notices", count: 12, icon: <Bell className="h-3.5 w-3.5" /> },
        {
          id: "campaigns",
          label: "Campaigns",
          count: campaignCount > 0 ? campaignCount : 4,
          icon: <Sparkles className="h-3.5 w-3.5" />,
        },
        { id: "templates", label: "Templates", icon: <FileText className="h-3.5 w-3.5" /> },
      ],
    },
    {
      label: "Services",
      items: [
        { id: "sms", label: "SMS", icon: <MessageSquare className="h-3.5 w-3.5" /> },
        { id: "whatsapp", label: "WhatsApp", icon: <Smartphone className="h-3.5 w-3.5" /> },
        { id: "email", label: "Email", icon: <Mail className="h-3.5 w-3.5" /> },
        { id: "inapp", label: "In-App", icon: <Globe className="h-3.5 w-3.5" /> },
      ],
    },
    {
      label: "Reports",
      items: [
        { id: "log", label: "Delivery Log", icon: <ListChecks className="h-3.5 w-3.5" /> },
        { id: "usage", label: "Usage", icon: <Layers className="h-3.5 w-3.5" /> },
      ],
    },
  ];
}

function buildFlows(campaigns: CampaignRecord[]): Record<string, ModuleFlow> {
  const liveRows = campaignRows(campaigns);
  const mockCampaignRows = [
    ["Fee Recovery Q2", "3", "142 parents", "94%", "Active"],
    ["Admission 2027", "5", "2,410 leads", "78%", "Active"],
    ["Alumni Reunion", "4", "480 alumni", "62%", "Draft"],
  ];
  const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
  const totalDelivered = campaigns.reduce((sum, c) => sum + c.deliveredCount, 0);
  const deliveryRate =
    totalSent > 0 ? `${((totalDelivered / totalSent) * 100).toFixed(1)}%` : "96.4%";

  return {
    dash: {
      title: "Communications Dashboard",
      subtitle:
        campaigns.length > 0
          ? `${campaigns.length} campaign${campaigns.length === 1 ? "" : "s"} · delivery overview`
          : "Message volume, delivery and inventory",
      ai: "SMS delivery dropped to 92% yesterday (usual 98%). 3 templates are pending DLT approval.",
      stats: [
        { label: "Sent today", value: totalSent > 0 ? String(totalSent) : "1,842" },
        { label: "Delivered", value: deliveryRate },
        { label: "SMS credits", value: "48,210" },
        { label: "Templates", value: "24" },
      ],
      columns: ["Channel", "Sent", "Delivered", "Failed", "Cost"],
      rows: [
        ["SMS", "1,204", "1,162", "42", "₹602"],
        ["WhatsApp", "512", "508", "4", "₹256"],
        ["Email", "1,842", "1,801", "41", "₹0"],
        ["In-App", "2,847", "2,847", "0", "₹0"],
      ],
    },
    compose: {
      title: "Compose Message",
      subtitle: "Send to any audience",
      primaryAction: "Send",
      stats: [
        { label: "Audience presets", value: `${audiences.length}` },
        { label: "Templates", value: "24" },
        { label: "Scheduled", value: "6" },
        { label: "Drafts", value: "3" },
      ],
      columns: ["Audience", "Recipients", "Channel", "Template", "Status"],
      rows: audiences.map((a, i) => [
        a,
        `${100 + i * 180}`,
        i % 2 ? "SMS + Email" : "WhatsApp",
        i % 3 ? "Fee Reminder" : "Custom",
        "Draft",
      ]),
    },
    notices: {
      title: "Notices",
      subtitle: "School-wide announcements",
      primaryAction: "New Notice",
      columns: ["Title", "Audience", "Published", "Channel", "Status"],
      rows: [
        ["Diwali Break", "Whole school", "2026-10-15", "SMS + App", "Published"],
        ["PTM Schedule", "Grade 6-10 parents", "2026-07-18", "Email + App", "Scheduled"],
        ["Exam Fee Reminder", "Grade 10 parents", "2026-07-14", "SMS", "Sent"],
      ],
    },
    campaigns: {
      title: "Campaigns",
      subtitle:
        campaigns.length > 0
          ? `${campaigns.length} campaign${campaigns.length === 1 ? "" : "s"} in catalogue`
          : "Multi-step communication flows",
      primaryAction: "New Campaign",
      columns: ["Campaign", "Steps", "Audience", "Reach", "Status"],
      rows: liveRows.length > 0 ? liveRows : mockCampaignRows,
      content: <CampaignCatalog initialCampaigns={campaigns} />,
      emptyHint:
        campaigns.length === 0 ? "No campaigns yet — use the form to create your first campaign." : undefined,
    },
    templates: {
      title: "Templates",
      subtitle: "Approved SMS / WhatsApp / Email templates",
      primaryAction: "Add Template",
      columns: ["Name", "Channel", "Category", "DLT ID", "Status"],
      rows: [
        ["Fee Reminder", "SMS", "Transactional", "118920000••••", "Approved"],
        ["Attendance Absent", "SMS", "Transactional", "118920000••••", "Approved"],
        ["Birthday Wish", "WhatsApp", "Utility", "-", "Approved"],
        ["Result Published", "Email", "Notification", "-", "Approved"],
        ["PTM Invite", "SMS", "Promotional", "-", "Pending"],
      ],
    },
    sms: {
      title: "SMS Service",
      subtitle: "Credits, sender IDs, DLT status",
      stats: [
        { label: "Balance", value: "48,210" },
        { label: "Sender ID", value: "EPADM" },
        { label: "DLT status", value: "Approved" },
        { label: "Delivery", value: deliveryRate },
      ],
      columns: ["Date", "Batch", "Recipients", "Delivered", "Cost"],
      rows: Array.from({ length: 6 }).map((_, i) => [
        `2026-07-${15 - i}`,
        `Batch-${840 - i}`,
        `${200 + i * 40}`,
        `${94 + (i % 5)}%`,
        `₹${100 + i * 20}`,
      ]),
    },
    whatsapp: {
      title: "WhatsApp Service",
      subtitle: "Business API status and templates",
      stats: [
        { label: "Messages MTD", value: "12,410" },
        { label: "Templates", value: "8" },
        { label: "Session cost", value: "₹0.32" },
        { label: "Delivery", value: "99.2%" },
      ],
      columns: ["Template", "Category", "Sent", "Delivered", "Status"],
      rows: [
        ["Fee Reminder", "Utility", "842", "98.4%", "Active"],
        ["Birthday", "Marketing", "124", "100%", "Active"],
      ],
    },
    email: {
      title: "Email Service",
      subtitle: "SMTP / SendGrid configuration",
      stats: [
        { label: "Sent MTD", value: "42,180" },
        { label: "Bounces", value: "0.4%" },
        { label: "Opens", value: "38%" },
        { label: "Clicks", value: "12%" },
      ],
      columns: ["Campaign", "Sent", "Opened", "Clicked", "Status"],
      rows: [
        ["Newsletter Jul", "2,847", "42%", "14%", "Sent"],
        ["PTM Invite", "1,204", "61%", "28%", "Sent"],
      ],
    },
    inapp: {
      title: "In-App Notifications",
      subtitle: "Push notifications on parent / teacher app",
      stats: [
        { label: "Active devices", value: "4,120" },
        { label: "Sent today", value: "842" },
        { label: "Delivered", value: "100%" },
        { label: "CTR", value: "22%" },
      ],
      columns: ["Title", "Audience", "Sent", "Opened", "Status"],
      rows: [
        ["Attendance marked", "Parents", "2,682", "1,842", "Delivered"],
        ["Fee due tomorrow", "Parents", "142", "98", "Delivered"],
      ],
    },
    log: {
      title: "Delivery Log",
      subtitle: "Every message with delivery status",
      columns: ["Time", "Channel", "To", "Template", "Status"],
      rows: Array.from({ length: 10 }).map((_, i) => [
        `10:${20 - i}`,
        i % 3 ? "SMS" : "WhatsApp",
        "+91 98••••••••",
        i % 2 ? "Fee Reminder" : "Attendance Absent",
        i % 7 === 0 ? "Failed" : "Delivered",
      ]),
    },
    usage: {
      title: "Usage & Inventory",
      subtitle: "Service consumption and top-up",
      primaryAction: "Buy Credits",
      stats: [
        { label: "SMS credits", value: "48,210" },
        { label: "WhatsApp balance", value: "₹4,120" },
        { label: "Email quota", value: "92%" },
        { label: "In-app", value: "Unlimited" },
      ],
      columns: ["Service", "Used (MTD)", "Balance", "Rate", "Status"],
      rows: [
        ["SMS", "12,842", "48,210", "₹0.14", "Active"],
        ["WhatsApp", "2,148", "₹4,120", "₹0.32", "Active"],
        ["Email", "42,180", "∞", "-", "Active"],
        ["In-App", "98,412", "∞", "-", "Active"],
      ],
    },
  };
}

export function CommunicationsWorkspace({ initialCampaigns }: Props) {
  const flows = buildFlows(initialCampaigns);
  const rail = buildRail(initialCampaigns.length);

  return (
    <ModuleShell
      title="Communications"
      subtitle={
        initialCampaigns.length > 0
          ? `${initialCampaigns.length} campaign${initialCampaigns.length === 1 ? "" : "s"} · unified messaging across channels`
          : "Unified messaging across SMS, WhatsApp, email and in-app"
      }
      rail={rail}
      flows={flows}
      defaultFlow="dash"
    />
  );
}
