"use client";

import { useMemo, useState, useTransition } from "react";
import { Eye, Pencil, Plus, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { fetchWithCsrf } from "@/lib/http/fetch-with-csrf";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { FormError, FormSuccess } from "@/components/ui/form";

type StaffRecord = {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  jobTitle: string | null;
  employmentType: string;
  joinedOn: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
};

type Props = {
  initialStaff: StaffRecord[];
};

export function StaffRegistry({ initialStaff }: Props) {
  const [staff, setStaff] = useState(initialStaff);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState({
    employeeCode: "",
    fullName: "",
    email: "",
    phone: "",
    department: "",
    jobTitle: "",
    employmentType: "full_time",
    joinedOn: "",
    status: "active",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredStaff = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return staff.filter((member) => {
      const haystack = [
        member.employeeCode,
        member.fullName,
        member.email ?? "",
        member.phone ?? "",
        member.department ?? "",
        member.jobTitle ?? "",
        member.employmentType,
      ].join(" ").toLowerCase();

      const matchesSearch = normalizedQuery.length === 0 || haystack.includes(normalizedQuery);
      const matchesStatus = statusFilter === "all" || member.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [query, staff, statusFilter]);

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setForm({
      employeeCode: "",
      fullName: "",
      email: "",
      phone: "",
      department: "",
      jobTitle: "",
      employmentType: "full_time",
      joinedOn: "",
      status: "active",
      notes: "",
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const response = await fetchWithCsrf("/api/admin/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          setError(payload?.error ?? "Could not create staff record.");
          return;
        }

        setStaff((current) => [
          { ...payload.staff, createdAt: payload.staff.createdAt },
          ...current,
        ]);
        resetForm();
        setSuccess("Staff record added successfully.");
      } catch (submitError) {
        console.error("[staff-registry] submit failed:", submitError);
        setError("Could not create staff record.");
      }
    });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
      <section>
        <Card variant="elevated" padding="lg" className="xl:sticky xl:top-20">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-primary">Add staff record</h2>
            <p className="mt-1 text-xs text-secondary">
              Build the school staffing registry with role-neutral employment details.
            </p>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div>
                <Label htmlFor="employeeCode">Employee code</Label>
                <Input
                  id="employeeCode"
                  value={form.employeeCode}
                  onChange={(event) => updateField("employeeCode", event.target.value)}
                  className="w-full"
                  required
                />
              </div>
              <div>
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  className="w-full"
                  required
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={form.department}
                  onChange={(event) => updateField("department", event.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="jobTitle">Job title</Label>
                <Input
                  id="jobTitle"
                  value={form.jobTitle}
                  onChange={(event) => updateField("jobTitle", event.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div>
                <Label htmlFor="employmentType">Employment type</Label>
                <Select
                  id="employmentType"
                  value={form.employmentType}
                  onChange={(event) => updateField("employmentType", event.target.value)}
                  className="w-full"
                >
                  <option value="full_time">Full time</option>
                  <option value="part_time">Part time</option>
                  <option value="contract">Contract</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="joinedOn">Joined on</Label>
                <Input
                  id="joinedOn"
                  type="date"
                  value={form.joinedOn}
                  onChange={(event) => updateField("joinedOn", event.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  value={form.status}
                  onChange={(event) => updateField("status", event.target.value)}
                  className="w-full"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On leave</option>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                rows={4}
                className="w-full"
              />
            </div>

            {error && <FormError>{error}</FormError>}
            {success && <FormSuccess>{success}</FormSuccess>}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isPending}
              icon={<Plus className="h-3.5 w-3.5" />}
            >
              {isPending ? "Adding staff..." : "Add staff"}
            </Button>
          </form>
        </Card>
      </section>

      <section>
        <Card variant="elevated" padding="none">
          <div className="border-b px-4 py-3" style={{ borderColor: "var(--border-default)" }}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-primary">Staff registry</h2>
                <p className="mt-1 text-xs text-secondary">
                  {filteredStaff.length} of {staff.length} records visible
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  aria-label="Search staff"
                  placeholder="Search staff"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  leftElement={<Search className="h-3.5 w-3.5" />}
                  className="sm:w-56"
                />
                <Select
                  aria-label="Filter staff status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  leftElement={<SlidersHorizontal className="h-3.5 w-3.5" />}
                  className="sm:w-36"
                >
                  <option value="all">All status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On leave</option>
                </Select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table variant="default" striped hoverable>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff member</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Employment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="font-medium text-primary">{member.fullName}</div>
                      <div className="mt-1 text-secondary">{member.employeeCode}</div>
                      {member.email && <div className="mt-1 text-muted">{member.email}</div>}
                    </TableCell>
                    <TableCell className="text-secondary">
                      <div>{member.department ?? "-"}</div>
                      <div className="mt-1">{member.jobTitle ?? ""}</div>
                    </TableCell>
                    <TableCell className="text-secondary">
                      <div>{member.employmentType}</div>
                      <div className="mt-1">{member.joinedOn ?? ""}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.status === "active" ? "success" : "default"}>
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button type="button" variant="ghost" size="sm" iconOnly icon={<Eye className="h-3.5 w-3.5" />} title="View staff record">
                          View
                        </Button>
                        <Button type="button" variant="ghost" size="sm" iconOnly icon={<Pencil className="h-3.5 w-3.5" />} title="Edit staff record">
                          Edit
                        </Button>
                        <Button type="button" variant="ghost" size="sm" iconOnly icon={<Trash2 className="h-3.5 w-3.5" />} title="Delete staff record">
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredStaff.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted">
                      No staff records match the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </section>
    </div>
  );
}
