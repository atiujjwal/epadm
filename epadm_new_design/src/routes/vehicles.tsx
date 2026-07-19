import { createFileRoute } from "@tanstack/react-router";
import { ModuleShell } from "@/components/module-shell";
import type { InnerRailGroup } from "@/components/inner-rail";
import type { ModuleFlow } from "@/components/module-shell";
import { Home, Bus, Route as RouteIcon, Users, Wrench, Receipt, FileBarChart2, MapPin, DollarSign, ClipboardList, AlertTriangle, ListChecks } from "lucide-react";

export const Route = createFileRoute("/vehicles")({
  head: () => ({ meta: [{ title: "Vehicles · EPADM" }, { name: "description", content: "Transport module: fleet, routes, drivers, subscriptions, fees and maintenance." }] }),
  component: VehiclesPage,
});

const rail: InnerRailGroup[] = [
  { label: "Operate", items: [
    { id: "dash", label: "Dashboard", icon: <Home className="h-3.5 w-3.5" /> },
    { id: "fleet", label: "Vehicles", count: 24, icon: <Bus className="h-3.5 w-3.5" /> },
    { id: "routes", label: "Routes", count: 18, icon: <RouteIcon className="h-3.5 w-3.5" /> },
    { id: "drivers", label: "Drivers", count: 26, icon: <Users className="h-3.5 w-3.5" /> },
    { id: "subs", label: "Subscription", icon: <Receipt className="h-3.5 w-3.5" /> },
    { id: "bulk-subs", label: "Bulk Subscription", icon: <ClipboardList className="h-3.5 w-3.5" /> },
    { id: "maint", label: "Expenses & Maintenance", icon: <Wrench className="h-3.5 w-3.5" /> },
  ]},
  { label: "Reports", items: [
    { id: "r-monthly", label: "Monthly Subscription", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
    { id: "r-annual", label: "Annual Subscription", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
    { id: "r-att", label: "Vehicle Attendance", icon: <ListChecks className="h-3.5 w-3.5" /> },
    { id: "r-rev", label: "Annual Revenue", icon: <DollarSign className="h-3.5 w-3.5" /> },
    { id: "r-dues", label: "Fee Dues", count: 42, icon: <AlertTriangle className="h-3.5 w-3.5" /> },
    { id: "r-invalid", label: "Invalid Subscription", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
    { id: "r-rates", label: "View Rates", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
  ]},
  { label: "Configure", items: [
    { id: "c-route", label: "Route", icon: <RouteIcon className="h-3.5 w-3.5" /> },
    { id: "c-rates", label: "Fee Rates", icon: <DollarSign className="h-3.5 w-3.5" /> },
  ]},
  { label: "Master", items: [
    { id: "m-pickup", label: "Pickup Point", icon: <MapPin className="h-3.5 w-3.5" /> },
    { id: "m-vehicle", label: "Vehicle", icon: <Bus className="h-3.5 w-3.5" /> },
  ]},
];

const vehicles = Array.from({length:10}).map((_,i)=>[`VH-${1200+i}`, `Branch ${i%3+1}`, `MH-01-A${1200+i}`, `Driver ${i+1}`, `Route ${i+1}`, i%5===0?"Maintenance":"Active"]);
const routes = Array.from({length:8}).map((_,i)=>[`Route ${i+1}`, `Branch ${i%3+1}`, `${12+i} pickups`, `${i%2?"North":"South"} zone`, `${28+i*2} students`, "Active"]);

const flows: Record<string, ModuleFlow> = {
  dash: { title: "Vehicles Dashboard", subtitle: "Fleet, revenue and maintenance overview",
    ai: "Route 4 has 12 unpaid subscriptions worth ₹86,400. VH-1204 is due for maintenance in 6 days.",
    stats: [{label:"Vehicles",value:"24"},{label:"Routes",value:"18"},{label:"MTD Revenue",value:"₹8.4 L"},{label:"Dues",value:"₹1.6 L"}],
    columns: ["Route","Students","Revenue","Dues","Expenses"], rows: Array.from({length:6}).map((_,i)=>[`Route ${i+1}`, `${28+i*4}`, `₹${68+i*4},000`, `₹${8+i*2},000`, `₹${14+i*3},000`]) },
  fleet: { title: "Vehicles", subtitle: "Fleet directory", primaryAction: "Add Vehicle", columns: ["ID","Branch","Number","Driver","Route","Status"], rows: vehicles },
  routes: { title: "Routes", subtitle: "Configured pickup routes", primaryAction: "Add Route", columns: ["Route","Branch","Pickups","Zone","Students","Status"], rows: routes },
  drivers: { title: "Drivers", subtitle: "Linked to staff or quick-created", primaryAction: "Add Driver", columns: ["ID","Name","Licence","Vehicle","Route","Status"], rows: Array.from({length:8}).map((_,i)=>[`DR-${400+i}`, `Driver ${i+1}`, `MH${1000000+i}`, `VH-${1200+i}`, `Route ${i+1}`, "Active"]) },
  subs: { title: "Subscription", subtitle: "Enrol a student to a route", primaryAction: "Subscribe", columns: ["Student","Class","Route","Pickup","Amount","Status"], rows: Array.from({length:8}).map((_,i)=>[`Student ${i+1}`, "Grade 8-B", `Route ${i%6+1}`, "Andheri West", `₹${1200+i*100}/mo`, i%5===0?"Pending":"Active"]) },
  "bulk-subs": { title: "Bulk Subscription", subtitle: "Upload subscriptions via Excel", primaryAction: "Upload", columns: ["Batch","Rows","Errors","Value","Status"], rows: [["BATCH-042","124","0","₹1.4 L","Success"]] },
  maint: { title: "Expenses & Maintenance", subtitle: "Ledger of fuel, repairs, insurance", primaryAction: "Add Entry", columns: ["Date","Vehicle","Category","Amount","Vendor"], rows: Array.from({length:8}).map((_,i)=>[`2026-07-${14-i}`, `VH-${1200+i}`, i%3?"Fuel":"Maintenance", `₹${1200+i*400}`, `Vendor ${i+1}`]) },
  "r-monthly": { title: "Monthly Subscription Report", subtitle: "Collections per route per month", columns: ["Route","Students","Billed","Collected","Dues"], rows: Array.from({length:6}).map((_,i)=>[`Route ${i+1}`, `${28+i*4}`, `₹${84+i*4},000`, `₹${72+i*4},000`, `₹${12+i},000`]) },
  "r-annual": { title: "Annual Subscription Report", subtitle: "Session-level subscription summary", columns: ["Route","Students","Annual","Collected","Dues"], rows: Array.from({length:6}).map((_,i)=>[`Route ${i+1}`, `${28+i*4}`, `₹${8+i} L`, `₹${7+i} L`, `₹${1+i*0.2} L`]) },
  "r-att": { title: "Vehicle Attendance", subtitle: "Daily boarding attendance per vehicle", columns: ["Vehicle","Route","Boarded","Total","%"], rows: vehicles.slice(0,6).map((v,i)=>[v[0],v[4],`${28+i}`,`${32+i}`,`${88+i}%`]) },
  "r-rev": { title: "Annual Revenue", subtitle: "Session revenue projection", columns: ["Route","Projected","Actual","Variance","Status"], rows: Array.from({length:6}).map((_,i)=>[`Route ${i+1}`, `₹${10+i} L`, `₹${9+i} L`, i%2?"-4%":"+2%", "On track"]) },
  "r-dues": { title: "Fee Dues", subtitle: "Outstanding transport dues by route", ai: "42 students overdue > 30 days. Trigger reminder campaign?", primaryAction: "Send Reminders", columns: ["Student","Class","Route","Amount","Days"], rows: Array.from({length:8}).map((_,i)=>[`Student ${i+1}`, "Grade 8-A", `Route ${i%6+1}`, `₹${2400+i*400}`, `${18+i*3}`]) },
  "r-invalid": { title: "Invalid Subscription", subtitle: "Data anomalies to fix", columns: ["Student","Issue","Route","Detected","Status"], rows: [["Aarav Sharma","No pickup point","Route 4","2026-07-12","Open"],["Ira Rao","Route inactive","Route 9","2026-07-13","Open"]] },
  "r-rates": { title: "View Rates", subtitle: "Current subscription rates", columns: ["Route","Zone","Distance","Monthly","Annual"], rows: Array.from({length:6}).map((_,i)=>[`Route ${i+1}`, i%2?"North":"South", `${8+i} km`, `₹${1200+i*100}`, `₹${12000+i*1000}`]) },
  "c-route": { title: "Route Configuration", subtitle: "Define stops, distance and pickup times", primaryAction: "Add Route", columns: ["Route","Stops","Distance","Duration","Status"], rows: Array.from({length:6}).map((_,i)=>[`Route ${i+1}`,`${8+i}`,`${12+i} km`,`${45+i*3} min`,"Active"]) },
  "c-rates": { title: "Fee Rates", subtitle: "Distance / zone based rate slabs", primaryAction: "Add Slab", columns: ["Slab","Distance","Monthly","Annual","Status"], rows: [["Slab 1","0-5 km","₹1,000","₹10,000","Active"],["Slab 2","5-10 km","₹1,400","₹14,000","Active"],["Slab 3","10-15 km","₹1,800","₹18,000","Active"],["Slab 4","15+ km","₹2,200","₹22,000","Active"]] },
  "m-pickup": { title: "Pickup Point Master", subtitle: "Configured pickup points", primaryAction: "Add Pickup Point", columns: ["Name","Zone","Route","Students","Status"], rows: Array.from({length:8}).map((_,i)=>[`Pickup ${i+1}`, i%2?"North":"South", `Route ${i%6+1}`, `${8+i}`, "Active"]) },
  "m-vehicle": { title: "Vehicle Master", subtitle: "Registered fleet", primaryAction: "Add Vehicle", columns: ["ID","Branch","Number","Capacity","Status"], rows: vehicles.map(v=>[v[0], v[1], v[2], "42", v[5]]) },
};

function VehiclesPage() {
  return <ModuleShell title="Vehicles" subtitle="24 vehicles · 18 routes · 620 subscribed students" rail={rail} flows={flows} defaultFlow="dash" />;
}
