"use client";

import { ModuleShell } from "@/components/workspace/module-shell";
import type { InnerRailGroup } from "@/components/workspace/inner-rail";
import type { ModuleFlow } from "@/components/workspace/module-shell";
import { Home, Send, Bell, Layers, Mail, MessageSquare, Smartphone, FileText, Sparkles, ListChecks, Globe } from "lucide-react";

const rail: InnerRailGroup[] = [
  { label: "Operate", items: [
    { id: "dash", label: "Dashboard", icon: <Home className="h-3.5 w-3.5" /> },
    { id: "compose", label: "Compose", icon: <Send className="h-3.5 w-3.5" /> },
    { id: "notices", label: "Notices", count: 12, icon: <Bell className="h-3.5 w-3.5" /> },
    { id: "campaigns", label: "Campaigns", count: 4, icon: <Sparkles className="h-3.5 w-3.5" /> },
    { id: "templates", label: "Templates", icon: <FileText className="h-3.5 w-3.5" /> },
  ]},
  { label: "Services", items: [
    { id: "sms", label: "SMS", icon: <MessageSquare className="h-3.5 w-3.5" /> },
    { id: "whatsapp", label: "WhatsApp", icon: <Smartphone className="h-3.5 w-3.5" /> },
    { id: "email", label: "Email", icon: <Mail className="h-3.5 w-3.5" /> },
    { id: "inapp", label: "In-App", icon: <Globe className="h-3.5 w-3.5" /> },
  ]},
  { label: "Reports", items: [
    { id: "log", label: "Delivery Log", icon: <ListChecks className="h-3.5 w-3.5" /> },
    { id: "usage", label: "Usage", icon: <Layers className="h-3.5 w-3.5" /> },
  ]},
];

const audiences = ["Class", "Section", "Whole school", "Teachers", "Drivers", "Cleaning staff", "All staff", "Custom list"];

const flows: Record<string, ModuleFlow> = {
  dash: { title: "Communications Dashboard", subtitle: "Message volume, delivery and inventory",
    ai: "SMS delivery dropped to 92% yesterday (usual 98%). 3 templates are pending DLT approval.",
    stats: [{label:"Sent today",value:"1,842"},{label:"Delivered",value:"96.4%"},{label:"SMS credits",value:"48,210"},{label:"Templates",value:"24"}],
    columns: ["Channel","Sent","Delivered","Failed","Cost"],
    rows: [["SMS","1,204","1,162","42","₹602"],["WhatsApp","512","508","4","₹256"],["Email","1,842","1,801","41","₹0"],["In-App","2,847","2,847","0","₹0"]] },
  compose: { title: "Compose Message", subtitle: "Send to any audience", primaryAction: "Send",
    stats: [{label:"Audience presets", value: `${audiences.length}`},{label:"Templates",value:"24"},{label:"Scheduled",value:"6"},{label:"Drafts",value:"3"}],
    columns: ["Audience","Recipients","Channel","Template","Status"],
    rows: audiences.map((a,i)=>[a, `${100+i*180}`, i%2?"SMS + Email":"WhatsApp", i%3?"Fee Reminder":"Custom", "Draft"]) },
  notices: { title: "Notices", subtitle: "School-wide announcements", primaryAction: "New Notice",
    columns: ["Title","Audience","Published","Channel","Status"],
    rows: [["Diwali Break","Whole school","2026-10-15","SMS + App","Published"],["PTM Schedule","Grade 6-10 parents","2026-07-18","Email + App","Scheduled"],["Exam Fee Reminder","Grade 10 parents","2026-07-14","SMS","Sent"]] },
  campaigns: { title: "Campaigns", subtitle: "Multi-step communication flows", primaryAction: "New Campaign",
    columns: ["Campaign","Steps","Audience","Reach","Status"],
    rows: [["Fee Recovery Q2","3","142 parents","94%","Active"],["Admission 2027","5","2,410 leads","78%","Active"],["Alumni Reunion","4","480 alumni","62%","Draft"]] },
  templates: { title: "Templates", subtitle: "Approved SMS / WhatsApp / Email templates", primaryAction: "Add Template",
    columns: ["Name","Channel","Category","DLT ID","Status"],
    rows: [["Fee Reminder","SMS","Transactional","118920000••••","Approved"],["Attendance Absent","SMS","Transactional","118920000••••","Approved"],["Birthday Wish","WhatsApp","Utility","-","Approved"],["Result Published","Email","Notification","-","Approved"],["PTM Invite","SMS","Promotional","-","Pending"]] },
  sms: { title: "SMS Service", subtitle: "Credits, sender IDs, DLT status", stats: [{label:"Balance",value:"48,210"},{label:"Sender ID",value:"EPADM"},{label:"DLT status",value:"Approved"},{label:"Delivery",value:"96.4%"}], columns: ["Date","Batch","Recipients","Delivered","Cost"], rows: Array.from({length:6}).map((_,i)=>[`2026-07-${15-i}`,`Batch-${840-i}`,`${200+i*40}`,`${94+i%5}%`,`₹${100+i*20}`]) },
  whatsapp: { title: "WhatsApp Service", subtitle: "Business API status and templates", stats: [{label:"Messages MTD",value:"12,410"},{label:"Templates",value:"8"},{label:"Session cost",value:"₹0.32"},{label:"Delivery",value:"99.2%"}], columns: ["Template","Category","Sent","Delivered","Status"], rows: [["Fee Reminder","Utility","842","98.4%","Active"],["Birthday","Marketing","124","100%","Active"]] },
  email: { title: "Email Service", subtitle: "SMTP / SendGrid configuration", stats: [{label:"Sent MTD",value:"42,180"},{label:"Bounces",value:"0.4%"},{label:"Opens",value:"38%"},{label:"Clicks",value:"12%"}], columns: ["Campaign","Sent","Opened","Clicked","Status"], rows: [["Newsletter Jul","2,847","42%","14%","Sent"],["PTM Invite","1,204","61%","28%","Sent"]] },
  inapp: { title: "In-App Notifications", subtitle: "Push notifications on parent / teacher app", stats: [{label:"Active devices",value:"4,120"},{label:"Sent today",value:"842"},{label:"Delivered",value:"100%"},{label:"CTR",value:"22%"}], columns: ["Title","Audience","Sent","Opened","Status"], rows: [["Attendance marked","Parents","2,682","1,842","Delivered"],["Fee due tomorrow","Parents","142","98","Delivered"]] },
  log: { title: "Delivery Log", subtitle: "Every message with delivery status", columns: ["Time","Channel","To","Template","Status"], rows: Array.from({length:10}).map((_,i)=>[`10:${20-i}`, i%3?"SMS":"WhatsApp", "+91 98••••••••", i%2?"Fee Reminder":"Attendance Absent", i%7===0?"Failed":"Delivered"]) },
  usage: { title: "Usage & Inventory", subtitle: "Service consumption and top-up", primaryAction: "Buy Credits",
    stats: [{label:"SMS credits",value:"48,210"},{label:"WhatsApp balance",value:"₹4,120"},{label:"Email quota",value:"92%"},{label:"In-app",value:"Unlimited"}],
    columns: ["Service","Used (MTD)","Balance","Rate","Status"], rows: [["SMS","12,842","48,210","₹0.14","Active"],["WhatsApp","2,148","₹4,120","₹0.32","Active"],["Email","42,180","∞","-","Active"],["In-App","98,412","∞","-","Active"]] },
};

export default function CommunicationsPage() {
  return <ModuleShell title="Communications" subtitle="Unified messaging across SMS, WhatsApp, email and in-app" rail={rail} flows={flows} defaultFlow="dash" />;
}
