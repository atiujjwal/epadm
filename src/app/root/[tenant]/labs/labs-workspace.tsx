"use client";

import { ModuleShell, type ModuleFlow } from "@/components/workspace/module-shell";
import type { LabBookingRecord } from "@/lib/admin/labs";
import LabsModulePage from "@/lib/modules/pages/labs";

type Props = {
  initialBookings: LabBookingRecord[];
};

function formatWhen(value: Date | string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LabsWorkspace({ initialBookings }: Props) {
  if (initialBookings.length === 0) {
    return <LabsModulePage />;
  }

  const liveRows = initialBookings.slice(0, 12).map((b) => [
    formatWhen(b.scheduledAt),
    b.session,
    b.labName,
    b.classLabel ?? "—",
    b.inCharge ?? "—",
    b.status,
  ]);

  const liveFlows: Record<string, ModuleFlow> = {
    dashboard: {
      title: "Labs · Live status",
      subtitle: `${initialBookings.length} bookings on record`,
      ai: "Live bookings from your tenant database. Inventory tabs remain design mocks until Wave 3 inventory APIs land.",
      stats: [
        { label: "Bookings", value: String(initialBookings.length) },
        {
          label: "Scheduled",
          value: String(initialBookings.filter((b) => b.status === "scheduled").length),
        },
        {
          label: "Completed",
          value: String(initialBookings.filter((b) => b.status === "completed").length),
        },
        {
          label: "Labs",
          value: String(new Set(initialBookings.map((b) => b.labName)).size),
        },
      ],
      columns: ["When", "Slot", "Lab", "Class", "Teacher", "Status"],
      rows: liveRows,
      primaryAction: "Book a lab",
    },
    booking: {
      title: "Lab Booking",
      columns: ["When", "Slot", "Lab", "Class", "Teacher", "Status"],
      rows: liveRows,
      primaryAction: "New booking",
    },
  };

  // Fall back to the full design module for non-live tabs by composing shell + overrides.
  return (
    <ModuleShell
      title="Labs"
      subtitle="Booking, sessions, equipment, chemicals and safety — one operational view."
      rail={[
        {
          label: "Operate",
          items: [
            { id: "dashboard", label: "Dashboard" },
            { id: "booking", label: "Lab Booking", count: initialBookings.length },
            { id: "sessions", label: "Session Log" },
            { id: "incidents", label: "Incidents" },
            { id: "safety", label: "Safety Checklists" },
          ],
        },
        {
          label: "Inventory",
          items: [
            { id: "equipment", label: "Equipment" },
            { id: "consumables", label: "Consumables" },
            { id: "chemicals", label: "Chemicals" },
            { id: "vendors", label: "Vendors" },
            { id: "po", label: "Purchase Orders" },
          ],
        },
        {
          label: "Configure",
          items: [
            { id: "cfg-labs", label: "Lab Master" },
            { id: "cfg-experiments", label: "Experiment Catalog" },
          ],
        },
      ]}
      flows={{
        sessions: {
          title: "Session Log",
          columns: ["When", "Lab", "Class", "Experiment", "Attendance", "Notes"],
          rows: liveRows.map((r) => [r[0], r[2], r[3], "—", "—", "—"]),
        },
        incidents: {
          title: "Incidents",
          columns: ["Date", "Lab", "Severity", "Summary", "Status"],
          rows: [["—", "—", "Info", "No incidents logged", "OK"]],
        },
        safety: {
          title: "Safety Checklists",
          columns: ["Lab", "Checklist", "Frequency", "Last done", "Status"],
          rows: [["Chemistry", "Fume hood inspection", "Weekly", "—", "Pending"]],
        },
        equipment: {
          title: "Equipment",
          columns: ["Asset", "Lab", "Serial", "Status", "AMC", "Next service"],
          rows: [["Digital Balance × 6", "Chemistry", "DB-2024-01", "Active", "Contec", "—"]],
          primaryAction: "Add asset",
        },
        consumables: {
          title: "Consumables",
          columns: ["Item", "Lab", "On hand", "Reorder at", "Unit", "Status"],
          rows: [["Filter paper", "Chemistry", "120", "150", "sheets", "Warning"]],
        },
        chemicals: {
          title: "Chemicals",
          columns: ["Chemical", "Grade", "Qty", "Reorder", "Hazard", "Status"],
          rows: [["Sodium Hydroxide", "AR", "180 g", "500 g", "Corrosive", "Overdue"]],
        },
        vendors: {
          title: "Vendors",
          columns: ["Vendor", "Category", "Rating", "Lead time", "Active POs"],
          rows: [["SciChem Traders", "Chemicals", "4.6", "6d", "2"]],
        },
        po: {
          title: "Purchase Orders",
          columns: ["PO #", "Vendor", "Value", "Placed", "ETA", "Status"],
          rows: [["LAB-PO-2026-08", "SciChem", "₹18,420", "—", "—", "Approved"]],
        },
        "cfg-labs": {
          title: "Lab Master",
          columns: ["Lab", "Room", "Capacity", "In-charge", "Sessions / wk"],
          rows: Array.from(new Set(initialBookings.map((b) => b.labName))).map((name) => [
            name,
            "—",
            "—",
            initialBookings.find((b) => b.labName === name)?.inCharge ?? "—",
            "—",
          ]),
          primaryAction: "Add lab",
        },
        "cfg-experiments": {
          title: "Experiment Catalog",
          columns: ["Code", "Experiment", "Class", "Lab", "Duration"],
          rows: [["PH-11-04", "Simple pendulum", "XI", "Physics", "60m"]],
        },
        ...liveFlows,
      }}
      defaultFlow="dashboard"
    />
  );
}
