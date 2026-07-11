"use client";

import { useState, useTransition } from "react";
import { fetchWithCsrf } from "@/lib/http/fetch-with-csrf";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormError, FormSuccess } from "@/components/ui/form";

type ClassRecord = {
  id: string;
  code: string;
  name: string;
  academicYear: string;
  status: string;
  homeroomStaffId: string | null;
  homeroomStaffName: string | null;
  createdAt: string;
};

type SectionRecord = {
  id: string;
  classId: string;
  className: string;
  classCode: string;
  name: string;
  capacity: number | null;
  status: string;
  createdAt: string;
};

type EnrollmentRecord = {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  classId: string;
  className: string;
  sectionId: string | null;
  sectionName: string | null;
  academicYear: string;
  rollNumber: string | null;
  status: string;
  enrolledOn: string | null;
  createdAt: string;
};

type StudentOption = { id: string; label: string; admissionNumber: string };
type StaffOption = { id: string; label: string };

type Props = {
  initialClasses: ClassRecord[];
  initialSections: SectionRecord[];
  initialEnrollments: EnrollmentRecord[];
  students: StudentOption[];
  staff: StaffOption[];
};

export function AcademicStructureWorkspace({
  initialClasses,
  initialSections,
  initialEnrollments,
  students,
  staff,
}: Props) {
  const [classes, setClasses] = useState(initialClasses);
  const [sections, setSections] = useState(initialSections);
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [classForm, setClassForm] = useState({
    code: "",
    name: "",
    academicYear: "2026-2027",
    status: "active",
    homeroomStaffId: "",
  });

  const [sectionForm, setSectionForm] = useState({
    classId: "",
    name: "",
    capacity: "",
    status: "active",
  });

  const [enrollmentForm, setEnrollmentForm] = useState({
    studentId: "",
    classId: "",
    sectionId: "",
    academicYear: "2026-2027",
    rollNumber: "",
    status: "active",
    enrolledOn: "",
  });

  const sectionOptionsForSelectedClass = sections.filter(
    (section) => section.classId === enrollmentForm.classId,
  );

  function clearMessages() {
    setError(null);
    setSuccess(null);
  }

  async function postJson(url: string, body: unknown) {
    const response = await fetchWithCsrf(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.error ?? "Request failed.");
    }
    return payload;
  }

  function handleCreateClass(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearMessages();
    startTransition(async () => {
      try {
        const payload = await postJson("/api/admin/academics/classes", classForm);
        const classRecord = payload.class;
        const homeroomName =
          staff.find((member) => member.id === classRecord.homeroomStaffId)?.label ?? null;
        setClasses((current) => [
          { ...classRecord, createdAt: classRecord.createdAt, homeroomStaffName: homeroomName },
          ...current,
        ]);
        setClassForm({
          code: "",
          name: "",
          academicYear: classForm.academicYear,
          status: "active",
          homeroomStaffId: "",
        });
        setSuccess("Class created.");
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Could not create class.");
      }
    });
  }

  function handleCreateSection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearMessages();
    startTransition(async () => {
      try {
        const payload = await postJson("/api/admin/academics/sections", {
          ...sectionForm,
          capacity: sectionForm.capacity ? Number(sectionForm.capacity) : undefined,
        });
        const section = payload.section;
        const classRecord = classes.find((item) => item.id === section.classId);
        setSections((current) => [
          {
            ...section,
            createdAt: section.createdAt,
            className: classRecord?.name ?? "",
            classCode: classRecord?.code ?? "",
          },
          ...current,
        ]);
        setSectionForm({
          classId: "",
          name: "",
          capacity: "",
          status: "active",
        });
        setSuccess("Section created.");
      } catch (submitError) {
        setError(
          submitError instanceof Error ? submitError.message : "Could not create section.",
        );
      }
    });
  }

  function handleCreateEnrollment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearMessages();
    startTransition(async () => {
      try {
        const payload = await postJson(
          "/api/admin/academics/enrollments",
          enrollmentForm,
        );
        const enrollment = payload.enrollment;
        const student = students.find((item) => item.id === enrollment.studentId);
        const classRecord = classes.find((item) => item.id === enrollment.classId);
        const section = sections.find((item) => item.id === enrollment.sectionId);
        setEnrollments((current) => [
          {
            ...enrollment,
            createdAt: enrollment.createdAt,
            studentName: student?.label ?? "",
            admissionNumber: student?.admissionNumber ?? "",
            className: classRecord?.name ?? "",
            sectionName: section?.name ?? null,
          },
          ...current,
        ]);
        setEnrollmentForm({
          studentId: "",
          classId: "",
          sectionId: "",
          academicYear: enrollmentForm.academicYear,
          rollNumber: "",
          status: "active",
          enrolledOn: "",
        });
        setSuccess("Enrollment created.");
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Could not create enrollment.",
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      {error && <FormError>{error}</FormError>}
      {success && <FormSuccess>{success}</FormSuccess>}

      <div className="grid gap-6 xl:grid-cols-3">
        <section>
          <Card variant="elevated" padding="lg">
            <h2 className="text-lg font-semibold text-zinc-950">Create class</h2>
            <form className="mt-4 space-y-4" onSubmit={handleCreateClass}>
              <Input
                value={classForm.code}
                onChange={(event) => setClassForm((v) => ({ ...v, code: event.target.value }))}
                placeholder="Code"
                className="w-full"
                required
              />
              <Input
                value={classForm.name}
                onChange={(event) => setClassForm((v) => ({ ...v, name: event.target.value }))}
                placeholder="Class name"
                className="w-full"
                required
              />
              <Input
                value={classForm.academicYear}
                onChange={(event) =>
                  setClassForm((v) => ({ ...v, academicYear: event.target.value }))
                }
                placeholder="Academic year"
                className="w-full"
                required
              />
              <Select
                value={classForm.homeroomStaffId}
                onChange={(event) =>
                  setClassForm((v) => ({ ...v, homeroomStaffId: event.target.value }))
                }
                className="w-full"
              >
                <option value="">Homeroom staff</option>
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.label}
                  </option>
                ))}
              </Select>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isPending}
              >
                Add class
              </Button>
            </form>
          </Card>
        </section>

        <section>
          <Card variant="elevated" padding="lg">
            <h2 className="text-lg font-semibold text-zinc-950">Create section</h2>
            <form className="mt-4 space-y-4" onSubmit={handleCreateSection}>
              <Select
                value={sectionForm.classId}
                onChange={(event) => setSectionForm((v) => ({ ...v, classId: event.target.value }))}
                className="w-full"
                required
              >
                <option value="">Select class</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.code})
                  </option>
                ))}
              </Select>
              <Input
                value={sectionForm.name}
                onChange={(event) => setSectionForm((v) => ({ ...v, name: event.target.value }))}
                placeholder="Section name"
                className="w-full"
                required
              />
              <Input
                value={sectionForm.capacity}
                onChange={(event) =>
                  setSectionForm((v) => ({ ...v, capacity: event.target.value }))
                }
                placeholder="Capacity"
                className="w-full"
              />
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isPending}
              >
                Add section
              </Button>
            </form>
          </Card>
        </section>

        <section>
          <Card variant="elevated" padding="lg">
            <h2 className="text-lg font-semibold text-zinc-950">Enroll student</h2>
            <form className="mt-4 space-y-4" onSubmit={handleCreateEnrollment}>
              <Select
                value={enrollmentForm.studentId}
                onChange={(event) =>
                  setEnrollmentForm((v) => ({ ...v, studentId: event.target.value }))
                }
                className="w-full"
                required
              >
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.label} ({student.admissionNumber})
                  </option>
                ))}
              </Select>
              <Select
                value={enrollmentForm.classId}
                onChange={(event) =>
                  setEnrollmentForm((v) => ({
                    ...v,
                    classId: event.target.value,
                    sectionId: "",
                  }))
                }
                className="w-full"
                required
              >
                <option value="">Select class</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.code})
                  </option>
                ))}
              </Select>
              <Select
                value={enrollmentForm.sectionId}
                onChange={(event) =>
                  setEnrollmentForm((v) => ({ ...v, sectionId: event.target.value }))
                }
                className="w-full"
              >
                <option value="">Section</option>
                {sectionOptionsForSelectedClass.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </Select>
              <Input
                value={enrollmentForm.academicYear}
                onChange={(event) =>
                  setEnrollmentForm((v) => ({ ...v, academicYear: event.target.value }))
                }
                placeholder="Academic year"
                className="w-full"
                required
              />
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isPending}
              >
                Enroll student
              </Button>
            </form>
          </Card>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section>
          <Card variant="elevated" padding="none">
            <div className="border-b border-zinc-200 px-5 py-4">
              <h3 className="font-semibold text-zinc-950">Classes</h3>
            </div>
            <div className="space-y-3 p-5">
              {classes.map((item) => (
                <div key={item.id} className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                  <div className="font-medium text-zinc-900">{item.name}</div>
                  <div className="mt-1 text-sm text-zinc-600">
                    {item.code} • {item.academicYear}
                  </div>
                  {item.homeroomStaffName && (
                    <div className="mt-1 text-xs text-zinc-500">
                      Homeroom: {item.homeroomStaffName}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section>
          <Card variant="elevated" padding="none">
            <div className="border-b border-zinc-200 px-5 py-4">
              <h3 className="font-semibold text-zinc-950">Sections</h3>
            </div>
            <div className="space-y-3 p-5">
              {sections.map((item) => (
                <div key={item.id} className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                  <div className="font-medium text-zinc-900">
                    {item.classCode} / {item.name}
                  </div>
                  <div className="mt-1 text-sm text-zinc-600">{item.className}</div>
                  {item.capacity && (
                    <div className="mt-1 text-xs text-zinc-500">Capacity: {item.capacity}</div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section>
          <Card variant="elevated" padding="none">
            <div className="border-b border-zinc-200 px-5 py-4">
              <h3 className="font-semibold text-zinc-950">Enrollments</h3>
            </div>
            <div className="space-y-3 p-5">
              {enrollments.map((item) => (
                <div key={item.id} className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                  <div className="font-medium text-zinc-900">{item.studentName}</div>
                  <div className="mt-1 text-sm text-zinc-600">
                    {item.className}{item.sectionName ? ` / ${item.sectionName}` : ""} • {item.academicYear}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">{item.admissionNumber}</div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
