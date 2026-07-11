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

type StudentRecord = {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  classLabel: string | null;
  sectionLabel: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
};

type Props = {
  initialStudents: StudentRecord[];
};

export function StudentRegistry({ initialStudents }: Props) {
  const [students, setStudents] = useState(initialStudents);
  const [form, setForm] = useState({
    admissionNumber: "",
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    classLabel: "",
    sectionLabel: "",
    guardianName: "",
    guardianPhone: "",
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
      admissionNumber: "",
      firstName: "",
      lastName: "",
      gender: "",
      dateOfBirth: "",
      classLabel: "",
      sectionLabel: "",
      guardianName: "",
      guardianPhone: "",
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
        const response = await fetchWithCsrf("/api/admin/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          setError(payload?.error ?? "Could not create student.");
          return;
        }

        setStudents((current) => [
          { ...payload.student, createdAt: payload.student.createdAt },
          ...current,
        ]);
        resetForm();
        setSuccess("Student added successfully.");
      } catch (submitError) {
        console.error("[student-registry] submit failed:", submitError);
        setError("Could not create student.");
      }
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_1.55fr]">
      <section>
        <Card variant="elevated" padding="lg">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-primary">Add student</h2>
            <p className="mt-1 text-sm text-secondary">
              Capture admission, classroom, and guardian information for the school registry.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="admissionNumber">Admission number</Label>
                <Input
                  id="admissionNumber"
                  value={form.admissionNumber}
                  onChange={(event) => updateField("admissionNumber", event.target.value)}
                  className="w-full"
                  required
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
                  <option value="alumni">Alumni</option>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(event) => updateField("firstName", event.target.value)}
                  className="w-full"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(event) => updateField("lastName", event.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="classLabel">Class</Label>
                <Input
                  id="classLabel"
                  value={form.classLabel}
                  onChange={(event) => updateField("classLabel", event.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="sectionLabel">Section</Label>
                <Input
                  id="sectionLabel"
                  value={form.sectionLabel}
                  onChange={(event) => updateField("sectionLabel", event.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Birth date</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(event) => updateField("dateOfBirth", event.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="guardianName">Guardian name</Label>
                <Input
                  id="guardianName"
                  value={form.guardianName}
                  onChange={(event) => updateField("guardianName", event.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="guardianPhone">Guardian phone</Label>
                <Input
                  id="guardianPhone"
                  value={form.guardianPhone}
                  onChange={(event) => updateField("guardianPhone", event.target.value)}
                  className="w-full"
                />
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
              {isPending ? "Adding student..." : "Add student"}
            </Button>
          </form>
        </Card>
      </section>

      <section>
        <Card variant="elevated" padding="none">
          <div className="border-b px-6 py-4" style={{ borderColor: "var(--border-default)" }}>
            <h2 className="text-lg font-semibold text-primary">Student registry</h2>
            <p className="mt-1 text-sm text-secondary">
              Admission-focused view of current students across the tenant.
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table variant="spacious" striped>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Guardian</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="font-medium text-primary">
                        {student.firstName} {student.lastName ?? ""}
                      </div>
                      <div className="mt-1 text-secondary">{student.admissionNumber}</div>
                    </TableCell>
                    <TableCell className="text-secondary">
                      {(student.classLabel ?? "-") + (student.sectionLabel ? ` / ${student.sectionLabel}` : "")}
                    </TableCell>
                    <TableCell className="text-secondary">
                      <div>{student.guardianName ?? "-"}</div>
                      <div className="mt-1">{student.guardianPhone ?? ""}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.status === "active" ? "success" : "default"}>
                        {student.status}
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
