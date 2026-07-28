"use client";

import { useMemo, useState, useTransition } from "react";
import { ModuleShell, type ModuleFlow } from "@/components/workspace/module-shell";
import type { InnerRailGroup } from "@/components/workspace/inner-rail";
import type { VehicleRecord } from "@/lib/admin/vehicles";
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
  Bus,
  Route as RouteIcon,
  Users,
  Wrench,
  Receipt,
  FileBarChart2,
  MapPin,
  DollarSign,
  ClipboardList,
  AlertTriangle,
  ListChecks,
} from "lucide-react";

type Props = {
  initialVehicles: VehicleRecord[];
};

function vehicleTableRows(vehicles: VehicleRecord[]): string[][] {
  return vehicles.map((v) => [
    v.code,
    "—",
    v.numberPlate,
    v.driverName ?? "—",
    v.routeName ?? "—",
    v.status,
  ]);
}

function FleetCatalog({ initialVehicles }: Props) {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({
    code: "",
    numberPlate: "",
    driverName: "",
    routeName: "",
    studentCount: "0",
    status: "active",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter(
      (v) =>
        v.code.toLowerCase().includes(q) ||
        v.numberPlate.toLowerCase().includes(q) ||
        (v.driverName ?? "").toLowerCase().includes(q) ||
        (v.routeName ?? "").toLowerCase().includes(q),
    );
  }, [query, vehicles]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const response = await fetchWithCsrf("/api/admin/vehicles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: form.code,
            numberPlate: form.numberPlate,
            driverName: form.driverName || undefined,
            routeName: form.routeName || undefined,
            studentCount: Number(form.studentCount) || 0,
            status: form.status,
          }),
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          setError(payload?.error ?? "Could not add vehicle.");
          return;
        }

        const created = payload.vehicle as VehicleRecord;
        setVehicles((current) => [created, ...current]);
        setForm({
          code: "",
          numberPlate: "",
          driverName: "",
          routeName: "",
          studentCount: "0",
          status: "active",
        });
        setSuccess("Vehicle added to fleet.");
      } catch (submitError) {
        console.error("[vehicles-fleet] submit failed:", submitError);
        setError("Could not add vehicle.");
      }
    });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
      <section>
        <Card variant="elevated" padding="lg" className="xl:sticky xl:top-20">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-primary">Add vehicle</h2>
            <p className="mt-1 text-xs text-secondary">Register a new vehicle in the fleet.</p>
          </div>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="code">Vehicle code</Label>
              <Input
                id="code"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="VH-1201"
                required
              />
            </div>
            <div>
              <Label htmlFor="numberPlate">Number plate</Label>
              <Input
                id="numberPlate"
                value={form.numberPlate}
                onChange={(e) => setForm((f) => ({ ...f, numberPlate: e.target.value }))}
                placeholder="MH-01-AB-1234"
                required
              />
            </div>
            <div>
              <Label htmlFor="driverName">Driver</Label>
              <Input
                id="driverName"
                value={form.driverName}
                onChange={(e) => setForm((f) => ({ ...f, driverName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="routeName">Route</Label>
              <Input
                id="routeName"
                value={form.routeName}
                onChange={(e) => setForm((f) => ({ ...f, routeName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="studentCount">Students</Label>
              <Input
                id="studentCount"
                type="number"
                min={0}
                value={form.studentCount}
                onChange={(e) => setForm((f) => ({ ...f, studentCount: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="vehicleStatus">Status</Label>
              <Select
                id="vehicleStatus"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
            <FormErrorSummary errors={error ? [error] : []} />
            {success ? <FormSuccess>{success}</FormSuccess> : null}
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Saving…" : "Add vehicle"}
            </Button>
          </form>
        </Card>
      </section>

      <section className="space-y-3">
        <Input
          placeholder="Search code, plate, driver, route…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Plate</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {vehicles.length === 0
                      ? "No vehicles in fleet — add your first vehicle."
                      : "No vehicles match your search."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-mono text-xs">{vehicle.code}</TableCell>
                    <TableCell>{vehicle.numberPlate}</TableCell>
                    <TableCell>{vehicle.driverName ?? "—"}</TableCell>
                    <TableCell>{vehicle.routeName ?? "—"}</TableCell>
                    <TableCell>{vehicle.studentCount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {vehicle.status}
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

function buildRail(vehicleCount: number): InnerRailGroup[] {
  return [
    {
      label: "Operate",
      items: [
        { id: "dash", label: "Dashboard", icon: <Home className="h-3.5 w-3.5" /> },
        {
          id: "fleet",
          label: "Vehicles",
          count: vehicleCount > 0 ? vehicleCount : 24,
          icon: <Bus className="h-3.5 w-3.5" />,
        },
        { id: "routes", label: "Routes", count: 18, icon: <RouteIcon className="h-3.5 w-3.5" /> },
        { id: "drivers", label: "Drivers", count: 26, icon: <Users className="h-3.5 w-3.5" /> },
        { id: "subs", label: "Subscription", icon: <Receipt className="h-3.5 w-3.5" /> },
        { id: "bulk-subs", label: "Bulk Subscription", icon: <ClipboardList className="h-3.5 w-3.5" /> },
        { id: "maint", label: "Expenses & Maintenance", icon: <Wrench className="h-3.5 w-3.5" /> },
      ],
    },
    {
      label: "Reports",
      items: [
        { id: "r-monthly", label: "Monthly Subscription", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
        { id: "r-annual", label: "Annual Subscription", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
        { id: "r-att", label: "Vehicle Attendance", icon: <ListChecks className="h-3.5 w-3.5" /> },
        { id: "r-rev", label: "Annual Revenue", icon: <DollarSign className="h-3.5 w-3.5" /> },
        { id: "r-dues", label: "Fee Dues", count: 42, icon: <AlertTriangle className="h-3.5 w-3.5" /> },
        { id: "r-invalid", label: "Invalid Subscription", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
        { id: "r-rates", label: "View Rates", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
      ],
    },
    {
      label: "Configure",
      items: [
        { id: "c-route", label: "Route", icon: <RouteIcon className="h-3.5 w-3.5" /> },
        { id: "c-rates", label: "Fee Rates", icon: <DollarSign className="h-3.5 w-3.5" /> },
      ],
    },
    {
      label: "Master",
      items: [
        { id: "m-pickup", label: "Pickup Point", icon: <MapPin className="h-3.5 w-3.5" /> },
        { id: "m-vehicle", label: "Vehicle", icon: <Bus className="h-3.5 w-3.5" /> },
      ],
    },
  ];
}

function buildFlows(vehicles: VehicleRecord[]): Record<string, ModuleFlow> {
  const fleetRows = vehicleTableRows(vehicles);
  const mockVehicles = Array.from({ length: 10 }).map((_, i) => [
    `VH-${1200 + i}`,
    `Branch ${(i % 3) + 1}`,
    `MH-01-A${1200 + i}`,
    `Driver ${i + 1}`,
    `Route ${i + 1}`,
    i % 5 === 0 ? "Maintenance" : "Active",
  ]);
  const activeCount = vehicles.filter((v) => v.status === "active").length;
  const totalStudents = vehicles.reduce((sum, v) => sum + v.studentCount, 0);

  return {
    dash: {
      title: "Vehicles Dashboard",
      subtitle:
        vehicles.length > 0
          ? `${vehicles.length} vehicle${vehicles.length === 1 ? "" : "s"} · ${totalStudents} subscribed students`
          : "Fleet, revenue and maintenance overview",
      ai: "Route 4 has 12 unpaid subscriptions worth ₹86,400. VH-1204 is due for maintenance in 6 days.",
      stats: [
        { label: "Vehicles", value: vehicles.length > 0 ? String(vehicles.length) : "24" },
        { label: "Active", value: vehicles.length > 0 ? String(activeCount) : "22" },
        { label: "MTD Revenue", value: "₹8.4 L" },
        { label: "Dues", value: "₹1.6 L" },
      ],
      columns: ["Route", "Students", "Revenue", "Dues", "Expenses"],
      rows: Array.from({ length: 6 }).map((_, i) => [
        `Route ${i + 1}`,
        `${28 + i * 4}`,
        `₹${68 + i * 4},000`,
        `₹${8 + i * 2},000`,
        `₹${14 + i * 3},000`,
      ]),
    },
    fleet: {
      title: "Vehicles",
      subtitle:
        vehicles.length > 0
          ? `${vehicles.length} vehicle${vehicles.length === 1 ? "" : "s"} in fleet`
          : "Fleet directory",
      primaryAction: "Add Vehicle",
      columns: ["ID", "Branch", "Number", "Driver", "Route", "Status"],
      rows: fleetRows.length > 0 ? fleetRows : mockVehicles,
      content: <FleetCatalog initialVehicles={vehicles} />,
      emptyHint: vehicles.length === 0 ? "No vehicles yet — use the form to add your first vehicle." : undefined,
    },
    routes: {
      title: "Routes",
      subtitle: "Configured pickup routes",
      primaryAction: "Add Route",
      columns: ["Route", "Branch", "Pickups", "Zone", "Students", "Status"],
      rows: Array.from({ length: 8 }).map((_, i) => [
        `Route ${i + 1}`,
        `Branch ${(i % 3) + 1}`,
        `${12 + i} pickups`,
        i % 2 ? "North" : "South",
        `${28 + i * 2} students`,
        "Active",
      ]),
    },
    drivers: {
      title: "Drivers",
      subtitle: "Linked to staff or quick-created",
      primaryAction: "Add Driver",
      columns: ["ID", "Name", "Licence", "Vehicle", "Route", "Status"],
      rows: Array.from({ length: 8 }).map((_, i) => [
        `DR-${400 + i}`,
        `Driver ${i + 1}`,
        `MH${1000000 + i}`,
        `VH-${1200 + i}`,
        `Route ${i + 1}`,
        "Active",
      ]),
    },
    subs: {
      title: "Subscription",
      subtitle: "Enrol a student to a route",
      primaryAction: "Subscribe",
      columns: ["Student", "Class", "Route", "Pickup", "Amount", "Status"],
      rows: Array.from({ length: 8 }).map((_, i) => [
        `Student ${i + 1}`,
        "Grade 8-B",
        `Route ${(i % 6) + 1}`,
        "Andheri West",
        `₹${1200 + i * 100}/mo`,
        i % 5 === 0 ? "Pending" : "Active",
      ]),
    },
    "bulk-subs": {
      title: "Bulk Subscription",
      subtitle: "Upload subscriptions via Excel",
      primaryAction: "Upload",
      columns: ["Batch", "Rows", "Errors", "Value", "Status"],
      rows: [["BATCH-042", "124", "0", "₹1.4 L", "Success"]],
    },
    maint: {
      title: "Expenses & Maintenance",
      subtitle: "Ledger of fuel, repairs, insurance",
      primaryAction: "Add Entry",
      columns: ["Date", "Vehicle", "Category", "Amount", "Vendor"],
      rows: Array.from({ length: 8 }).map((_, i) => [
        `2026-07-${14 - i}`,
        `VH-${1200 + i}`,
        i % 3 ? "Fuel" : "Maintenance",
        `₹${1200 + i * 400}`,
        `Vendor ${i + 1}`,
      ]),
    },
    "r-monthly": {
      title: "Monthly Subscription Report",
      subtitle: "Collections per route per month",
      columns: ["Route", "Students", "Billed", "Collected", "Dues"],
      rows: Array.from({ length: 6 }).map((_, i) => [
        `Route ${i + 1}`,
        `${28 + i * 4}`,
        `₹${84 + i * 4},000`,
        `₹${72 + i * 4},000`,
        `₹${12 + i},000`,
      ]),
    },
    "r-annual": {
      title: "Annual Subscription Report",
      subtitle: "Session-level subscription summary",
      columns: ["Route", "Students", "Annual", "Collected", "Dues"],
      rows: Array.from({ length: 6 }).map((_, i) => [
        `Route ${i + 1}`,
        `${28 + i * 4}`,
        `₹${8 + i} L`,
        `₹${7 + i} L`,
        `₹${1 + i * 0.2} L`,
      ]),
    },
    "r-att": {
      title: "Vehicle Attendance",
      subtitle: "Daily boarding attendance per vehicle",
      columns: ["Vehicle", "Route", "Boarded", "Total", "%"],
      rows: (fleetRows.length > 0 ? fleetRows : mockVehicles)
        .slice(0, 6)
        .map((v, i) => [v[0], v[4], `${28 + i}`, `${32 + i}`, `${88 + i}%`]),
    },
    "r-rev": {
      title: "Annual Revenue",
      subtitle: "Session revenue projection",
      columns: ["Route", "Projected", "Actual", "Variance", "Status"],
      rows: Array.from({ length: 6 }).map((_, i) => [
        `Route ${i + 1}`,
        `₹${10 + i} L`,
        `₹${9 + i} L`,
        i % 2 ? "-4%" : "+2%",
        "On track",
      ]),
    },
    "r-dues": {
      title: "Fee Dues",
      subtitle: "Outstanding transport dues by route",
      ai: "42 students overdue > 30 days. Trigger reminder campaign?",
      primaryAction: "Send Reminders",
      columns: ["Student", "Class", "Route", "Amount", "Days"],
      rows: Array.from({ length: 8 }).map((_, i) => [
        `Student ${i + 1}`,
        "Grade 8-A",
        `Route ${(i % 6) + 1}`,
        `₹${2400 + i * 400}`,
        `${18 + i * 3}`,
      ]),
    },
    "r-invalid": {
      title: "Invalid Subscription",
      subtitle: "Data anomalies to fix",
      columns: ["Student", "Issue", "Route", "Detected", "Status"],
      rows: [
        ["Aarav Sharma", "No pickup point", "Route 4", "2026-07-12", "Open"],
        ["Ira Rao", "Route inactive", "Route 9", "2026-07-13", "Open"],
      ],
    },
    "r-rates": {
      title: "View Rates",
      subtitle: "Current subscription rates",
      columns: ["Route", "Zone", "Distance", "Monthly", "Annual"],
      rows: Array.from({ length: 6 }).map((_, i) => [
        `Route ${i + 1}`,
        i % 2 ? "North" : "South",
        `${8 + i} km`,
        `₹${1200 + i * 100}`,
        `₹${12000 + i * 1000}`,
      ]),
    },
    "c-route": {
      title: "Route Configuration",
      subtitle: "Define stops, distance and pickup times",
      primaryAction: "Add Route",
      columns: ["Route", "Stops", "Distance", "Duration", "Status"],
      rows: Array.from({ length: 6 }).map((_, i) => [
        `Route ${i + 1}`,
        `${8 + i}`,
        `${12 + i} km`,
        `${45 + i * 3} min`,
        "Active",
      ]),
    },
    "c-rates": {
      title: "Fee Rates",
      subtitle: "Distance / zone based rate slabs",
      primaryAction: "Add Slab",
      columns: ["Slab", "Distance", "Monthly", "Annual", "Status"],
      rows: [
        ["Slab 1", "0-5 km", "₹1,000", "₹10,000", "Active"],
        ["Slab 2", "5-10 km", "₹1,400", "₹14,000", "Active"],
        ["Slab 3", "10-15 km", "₹1,800", "₹18,000", "Active"],
        ["Slab 4", "15+ km", "₹2,200", "₹22,000", "Active"],
      ],
    },
    "m-pickup": {
      title: "Pickup Point Master",
      subtitle: "Configured pickup points",
      primaryAction: "Add Pickup Point",
      columns: ["Name", "Zone", "Route", "Students", "Status"],
      rows: Array.from({ length: 8 }).map((_, i) => [
        `Pickup ${i + 1}`,
        i % 2 ? "North" : "South",
        `Route ${(i % 6) + 1}`,
        `${8 + i}`,
        "Active",
      ]),
    },
    "m-vehicle": {
      title: "Vehicle Master",
      subtitle: "Registered fleet",
      primaryAction: "Add Vehicle",
      columns: ["ID", "Branch", "Number", "Capacity", "Status"],
      rows: (fleetRows.length > 0 ? fleetRows : mockVehicles).map((v) => [
        v[0],
        v[1],
        v[2],
        "42",
        v[5],
      ]),
    },
  };
}

export function VehiclesWorkspace({ initialVehicles }: Props) {
  const flows = buildFlows(initialVehicles);
  const rail = buildRail(initialVehicles.length);
  const activeCount = initialVehicles.filter((v) => v.status === "active").length;

  return (
    <ModuleShell
      title="Vehicles"
      subtitle={
        initialVehicles.length > 0
          ? `${initialVehicles.length} vehicles · ${activeCount} active · transport fleet`
          : "24 vehicles · 18 routes · 620 subscribed students"
      }
      rail={rail}
      flows={flows}
      defaultFlow="dash"
    />
  );
}
