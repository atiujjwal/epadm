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
import { FormSuccess } from "@/components/ui/form";
import { FormErrorSummary } from "@/components/ui/form-error-summary";

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
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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

  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return students.filter((student) => {
      const haystack = [
        student.admissionNumber,
        student.firstName,
        student.lastName ?? "",
        student.classLabel ?? "",
        student.sectionLabel ?? "",
        student.guardianName ?? "",
        student.guardianPhone ?? "",
      ].join(" ").toLowerCase();

      const matchesSearch = normalizedQuery.length === 0 || haystack.includes(normalizedQuery);
      const matchesStatus = statusFilter === "all" || student.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [query, statusFilter, students]);

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
    <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
      <section>
        <Card variant="elevated" padding="lg" className="xl:sticky xl:top-20">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-primary">Add student</h2>
            <p className="mt-1 text-xs text-secondary">
              Capture admission, classroom, and guardian information for the school registry.
            </p>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
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

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
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

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
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

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
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

            <FormErrorSummary errors={error ? [error] : []} />
            {success && <FormSuccess>{success}</FormSuccess>}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isPending}
              icon={<Plus className="h-3.5 w-3.5" />}
            >
              {isPending ? "Adding student..." : "Add student"}
            </Button>
          </form>
        </Card>
      </section>

      <section>
        <Card variant="elevated" padding="none">
          <div className="border-b px-4 py-3" style={{ borderColor: "var(--border-default)" }}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-primary">Student registry</h2>
                <p className="mt-1 text-xs text-secondary">
                  {filteredStudents.length} of {students.length} records visible
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  aria-label="Search students"
                  placeholder="Search students"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  leftElement={<Search className="h-3.5 w-3.5" />}
                  className="sm:w-56"
                />
                <Select
                  aria-label="Filter student status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  leftElement={<SlidersHorizontal className="h-3.5 w-3.5" />}
                  className="sm:w-36"
                >
                  <option value="all">All status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="alumni">Alumni</option>
                </Select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table variant="default" striped hoverable>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Guardian</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
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
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button type="button" variant="ghost" size="sm" iconOnly icon={<Eye className="h-3.5 w-3.5" />} title="View student">
                          View
                        </Button>
                        <Button type="button" variant="ghost" size="sm" iconOnly icon={<Pencil className="h-3.5 w-3.5" />} title="Edit student">
                          Edit
                        </Button>
                        <Button type="button" variant="ghost" size="sm" iconOnly icon={<Trash2 className="h-3.5 w-3.5" />} title="Delete student">
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted">
                      No students match the current filters.
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
