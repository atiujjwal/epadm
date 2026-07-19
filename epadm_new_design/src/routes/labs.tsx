import { createFileRoute } from "@tanstack/react-router";
import { ModuleShell, type ModuleFlow } from "@/components/module-shell";

export const Route = createFileRoute("/labs")({
  head: () => ({ meta: [{ title: "Labs · EPADM" }] }),
  component: LabsPage,
});

const rail = [
  { label: "Operate", items: [
    { id: "dashboard", label: "Dashboard" },
    { id: "booking", label: "Lab Booking" },
    { id: "sessions", label: "Session Log" },
    { id: "incidents", label: "Incidents" },
    { id: "safety", label: "Safety Checklists" },
  ]},
  { label: "Inventory", items: [
    { id: "equipment", label: "Equipment" },
    { id: "consumables", label: "Consumables" },
    { id: "chemicals", label: "Chemicals" },
    { id: "vendors", label: "Vendors" },
    { id: "po", label: "Purchase Orders" },
  ]},
  { label: "Configure", items: [
    { id: "cfg-labs", label: "Lab Master" },
    { id: "cfg-experiments", label: "Experiment Catalog" },
  ]},
];

const flows: Record<string, ModuleFlow> = {
  dashboard: {
    title: "Labs · Live status",
    subtitle: "4 labs · 1,842 items in inventory · 6 scheduled sessions today",
    ai: "Copilot: Sodium hydroxide is 18% below reorder level; last PO cycle averaged 9 days. Raise PO today to avoid stock-out.",
    stats: [
      { label: "Sessions today", value: "6" },
      { label: "Utilisation", value: "72%" },
      { label: "Low stock", value: "8" },
      { label: "Incidents (30d)", value: "1" },
    ],
    columns: ["Lab", "In-charge", "Next session", "Class", "Experiment", "Status"],
    rows: [
      ["Physics", "Suresh Iyer", "11:20", "XI-A", "Simple pendulum", "Active"],
      ["Chemistry", "Anita Rao", "12:10", "X-B", "Acid-base titration", "Active"],
      ["Biology", "Farah Sheikh", "13:00", "IX-C", "Onion cell mount", "Draft"],
      ["Computer", "Vikram Bose", "14:00", "XII-A", "SQL joins lab", "Active"],
    ],
    primaryAction: "Book a lab",
  },
  booking: {
    title: "Lab Booking",
    columns: ["Date", "Slot", "Lab", "Class", "Teacher", "Status"],
    rows: [
      ["15 Jul", "P4 · 11:20", "Physics", "XI-A", "S. Iyer", "Approved"],
      ["15 Jul", "P5 · 12:10", "Chemistry", "X-B", "A. Rao", "Approved"],
      ["16 Jul", "P3 · 10:30", "Biology", "IX-C", "F. Sheikh", "Pending"],
    ],
    primaryAction: "New booking",
  },
  sessions: {
    title: "Session Log",
    columns: ["When", "Lab", "Class", "Experiment", "Attendance", "Notes"],
    rows: [
      ["14 Jul · P4", "Physics", "XI-A", "Resonance in air columns", "38 / 40", "Sensor #3 replaced"],
      ["14 Jul · P5", "Chemistry", "X-B", "Salt analysis", "36 / 38", "—"],
    ],
  },
  incidents: {
    title: "Incidents",
    ai: "0 major incidents in 90 days. Chemistry lab safety drill is due (last on 12 Apr).",
    columns: ["Date", "Lab", "Severity", "Summary", "Status"],
    rows: [
      ["22 Jun", "Chemistry", "Warning", "Minor spill · HCl 0.1M", "Approved"],
    ],
    primaryAction: "Log incident",
  },
  safety: {
    title: "Safety Checklists",
    columns: ["Lab", "Checklist", "Frequency", "Last done", "Status"],
    rows: [
      ["Chemistry", "Fume hood inspection", "Weekly", "10 Jul", "Approved"],
      ["Physics", "Electrical safety", "Monthly", "01 Jul", "Approved"],
      ["Biology", "Autoclave calibration", "Quarterly", "12 Apr", "Pending"],
    ],
  },
  equipment: {
    title: "Equipment",
    columns: ["Asset", "Lab", "Serial", "Status", "AMC", "Next service"],
    rows: [
      ["Digital Balance × 6", "Chemistry", "DB-2024-01", "Active", "Contec", "18 Aug"],
      ["Compound Microscope × 24", "Biology", "MS-2023-04", "Active", "Kruss", "02 Sep"],
      ["Oscilloscope × 4", "Physics", "OSC-2022-11", "Warning", "Tektronix", "Overdue"],
    ],
    primaryAction: "Add asset",
  },
  consumables: {
    title: "Consumables",
    columns: ["Item", "Lab", "On hand", "Reorder at", "Unit", "Status"],
    rows: [
      ["Filter paper (Whatman #1)", "Chemistry", "120", "150", "sheets", "Warning"],
      ["Glass slides", "Biology", "480", "300", "pcs", "Active"],
      ["Litmus paper", "Chemistry", "8", "20", "packs", "Overdue"],
    ],
    primaryAction: "New indent",
  },
  chemicals: {
    title: "Chemicals",
    ai: "3 chemicals cross the schedule-level reorder threshold. Auto-generated PO draft is ready.",
    columns: ["Chemical", "Grade", "Qty", "Reorder", "Hazard", "Status"],
    rows: [
      ["Sodium Hydroxide", "AR", "180 g", "500 g", "Corrosive", "Overdue"],
      ["Copper Sulphate", "LR", "600 g", "400 g", "Irritant", "Active"],
      ["Sulphuric Acid", "AR", "1.2 L", "2 L", "Corrosive", "Warning"],
    ],
    primaryAction: "Draft PO",
  },
  vendors: {
    title: "Vendors",
    columns: ["Vendor", "Category", "Rating", "Lead time", "Active POs"],
    rows: [
      ["SciChem Traders", "Chemicals", "4.6", "6d", "2"],
      ["Optech Labs", "Optics", "4.8", "12d", "1"],
      ["Contec Instruments", "Equipment", "4.4", "18d", "0"],
    ],
    primaryAction: "Add vendor",
  },
  po: {
    title: "Purchase Orders",
    columns: ["PO #", "Vendor", "Value", "Placed", "ETA", "Status"],
    rows: [
      ["LAB-PO-2026-08", "SciChem", "₹18,420", "12 Jul", "22 Jul", "Approved"],
      ["LAB-PO-2026-09", "Optech", "₹42,800", "13 Jul", "28 Jul", "Pending"],
    ],
    primaryAction: "New PO",
  },
  "cfg-labs": {
    title: "Lab Master",
    columns: ["Lab", "Room", "Capacity", "In-charge", "Sessions / wk"],
    rows: [
      ["Physics", "B-201", "40", "Suresh Iyer", "18"],
      ["Chemistry", "B-203", "36", "Anita Rao", "20"],
      ["Biology", "B-205", "36", "Farah Sheikh", "16"],
      ["Computer", "C-101", "30", "Vikram Bose", "24"],
    ],
    primaryAction: "Add lab",
  },
  "cfg-experiments": {
    title: "Experiment Catalog",
    columns: ["Code", "Experiment", "Class", "Lab", "Duration"],
    rows: [
      ["PH-11-04", "Simple pendulum", "XI", "Physics", "60m"],
      ["CH-10-07", "Acid-base titration", "X", "Chemistry", "80m"],
      ["BI-09-02", "Onion cell mount", "IX", "Biology", "45m"],
      ["CS-12-05", "SQL joins lab", "XII", "Computer", "60m"],
    ],
  },
};

function LabsPage() {
  return (
    <ModuleShell
      title="Labs"
      subtitle="Booking, sessions, equipment, chemicals and safety — one operational view."
      rail={rail}
      flows={flows}
      defaultFlow="dashboard"
    />
  );
}
