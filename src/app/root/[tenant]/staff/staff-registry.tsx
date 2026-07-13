"use client";

import { useState, useTransition } from "react";
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
    <div className="grid gap-6 xl:grid-cols-[1.05fr_1.55fr]">
      <section>
        <Card variant="elevated" padding="lg">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-primary">Add staff record</h2>
            <p className="mt-1 text-sm text-secondary">
              Build the school staffing registry with role-neutral employment details.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
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

            <div className="grid gap-4 sm:grid-cols-2">
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

            <div className="grid gap-4 sm:grid-cols-2">
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

            <div className="grid gap-4 sm:grid-cols-3">
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
            >
              {isPending ? "Adding staff..." : "Add staff"}
            </Button>
          </form>
        </Card>
      </section>

      <section>
        <Card variant="elevated" padding="none">
          <div className="border-b px-6 py-4" style={{ borderColor: "var(--border-default)" }}>
            <h2 className="text-lg font-semibold text-primary">Staff registry</h2>
            <p className="mt-1 text-sm text-secondary">
              Operational directory for departments, roles, and employment status.
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table variant="spacious" striped>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff member</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Employment</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member) => (
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </section>
    </div>
  );
}
