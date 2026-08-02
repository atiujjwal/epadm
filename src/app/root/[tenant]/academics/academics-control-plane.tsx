"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { fetchWithCsrf } from "@/lib/http/fetch-with-csrf";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { FormSuccess } from "@/components/ui/form";
import { FormErrorSummary } from "@/components/ui/form-error-summary";
import {
  createLocalId,
  displaySection,
  getSectionLabel,
  getSubjectName,
  getTeacherName,
  useAcademics,
  type AcademicClassRecord,
  type EnrollmentRecord,
  type SectionRecord,
  type SubjectRecord,
} from "./academics-state";

type TabId =
  | "overview"
  | "classes"
  | "subjects"
  | "mapping"
  | "streams"
  | "houses"
  | "calendar"
  | "roster"
  | "load"
  | "coverage";

type ClassSetupForm = "class" | "section" | "enrollment";

const tabs: { group: string; id: TabId; label: string }[] = [
  { group: "Operate", id: "overview", label: "Overview" },
  { group: "Operate", id: "classes", label: "Classes & Sections" },
  { group: "Operate", id: "subjects", label: "Subjects" },
  { group: "Operate", id: "mapping", label: "Class x Subject" },
  { group: "Operate", id: "streams", label: "Streams & Electives" },
  { group: "Operate", id: "houses", label: "House System" },
  { group: "Operate", id: "calendar", label: "Academic Calendar" },
  { group: "Reports", id: "roster", label: "Section Roster" },
  { group: "Reports", id: "load", label: "Teaching Load" },
  { group: "Reports", id: "coverage", label: "Curriculum Coverage" },
];

type RowAction<T> = {
  label: string;
  onClick: (row: T) => void;
  tone?: "default" | "danger";
};

function matchesSearch(values: unknown[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return values.some((value) => String(value ?? "").toLowerCase().includes(q));
}

function DataTable<T extends { id: string }>({
  rows,
  columns,
  empty,
  actions,
}: {
  rows: T[];
  columns: { key: string; label: string; render: (row: T) => React.ReactNode }[];
  empty: string;
  actions: RowAction<T>[];
}) {
  return (
    <div className="overflow-hidden rounded-md border bg-surface">
      <table className="w-full text-[12px]">
        <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="border-b px-3 py-2 text-left font-medium">
                {column.label}
              </th>
            ))}
            <th className="border-b px-3 py-2 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="px-3 py-8 text-center text-muted-foreground">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/40">
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-2 align-top">
                    {column.render(row)}
                  </td>
                ))}
                <td className="whitespace-nowrap px-3 py-2 text-right">
                  {actions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => action.onClick(row)}
                      className={action.tone === "danger" ? "ml-3 text-[11px] text-danger hover:underline" : "ml-3 text-[11px] text-primary hover:underline"}
                    >
                      {action.label}
                    </button>
                  ))}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function SearchFilter({
  query,
  onQuery,
  filter,
  onFilter,
  options,
}: {
  query: string;
  onQuery: (value: string) => void;
  filter: string;
  onFilter: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        value={query}
        onChange={(event) => onQuery(event.target.value)}
        placeholder="Search..."
        className="h-8 max-w-xs text-[12px]"
      />
      <Select
        value={filter}
        onChange={(event) => onFilter(event.target.value)}
        className="h-8 max-w-48 rounded-md text-[12px]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const tone =
    normalized.includes("warning") || normalized.includes("trial")
      ? "border-warning/20 bg-warning/10 text-warning"
      : normalized.includes("critical") || normalized.includes("blocked")
        ? "border-danger/20 bg-danger/10 text-danger"
        : "border-success/20 bg-success/10 text-success";
  return (
    <Badge variant="outline" className={`h-5 text-[10px] capitalize ${tone}`}>
      {value}
    </Badge>
  );
}

async function postJson(url: string, body: unknown) {
  const response = await fetchWithCsrf(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error ?? "Request failed.");
  return payload;
}

export function AcademicsControlPlane() {
  const [active, setActive] = useState<TabId>("overview");

  return (
    <>
      <div className="sticky top-14 z-20 border-b bg-surface/95 backdrop-blur">
        <div className="flex items-center gap-1.5 px-6 py-1.5 text-[11px] text-muted-foreground">
          <span>Academics Setup</span>
          <span>/</span>
          <span className="font-medium text-foreground">{tabs.find((tab) => tab.id === active)?.label}</span>
        </div>
        <div className="overflow-x-auto px-4">
          <div className="flex min-w-max items-stretch gap-3">
            {["Operate", "Reports"].map((group, index) => (
              <div key={group} className="flex items-center gap-1.5">
                {index > 0 ? <div className="mx-1 h-5 w-px bg-border" /> : null}
                <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/50">
                  {group}
                </span>
                {tabs.filter((tab) => tab.group === group).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActive(tab.id)}
                    className={`relative flex h-9 items-center whitespace-nowrap px-2.5 text-[12px] transition-colors ${
                      active === tab.id ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                    {active === tab.id ? <span className="absolute inset-x-1.5 -bottom-px h-0.5 rounded-full bg-primary" /> : null}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-4 p-6">
        {active === "overview" ? <OverviewTab /> : null}
        {active === "classes" ? <ClassesTab /> : null}
        {active === "subjects" ? <SubjectsTab /> : null}
        {active === "mapping" ? <ClassSubjectTab /> : null}
        {active === "streams" ? <StreamsTab /> : null}
        {active === "houses" ? <HousesTab /> : null}
        {active === "calendar" ? <CalendarTab /> : null}
        {active === "roster" ? <RosterReport /> : null}
        {active === "load" ? <TeachingLoadReport /> : null}
        {active === "coverage" ? <CoverageReport /> : null}
      </div>
    </>
  );
}

function OverviewTab() {
  const { state } = useAcademics();
  const stats = [
    ["Classes", state.classes.length],
    ["Sections", state.sections.length],
    ["Enrollments", state.enrollments.length],
    ["Subjects", state.subjects.length],
    ["Mappings", state.assignments.length],
    ["Houses", state.houses.length],
    ["Streams", state.streams.length],
    ["Working days", state.terms.reduce((sum, term) => sum + term.workingDays, 0)],
  ];
  return (
    <div className="space-y-4">
      <h2 className="text-[15px] font-semibold">Academic Overview</h2>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-border md:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="bg-surface p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className="mt-0.5 font-mono text-[16px] font-semibold">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClassesTab() {
  const { state, dispatch } = useAcademics();
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState<ClassSetupForm | null>(null);
  const [isPending, startTransition] = useTransition();
  const currentAcademicYear = state.academicYears.find((year) => year.isCurrent) ?? state.academicYears[0];
  const defaultAcademicYearId = currentAcademicYear?.id ?? "";
  const [classForm, setClassForm] = useState({ id: "", code: "", name: "", academicYearId: defaultAcademicYearId, status: "active", classTeacherId: "" });
  const [sectionForm, setSectionForm] = useState({ id: "", classId: "", name: "", capacity: "", status: "active", room: "" });
  const [enrollmentForm, setEnrollmentForm] = useState({
    id: "",
    studentId: "",
    classId: "",
    sectionId: "",
    academicYear: currentAcademicYear?.name ?? "",
    rollNumber: "",
    status: "active",
    enrolledOn: "",
    houseId: "",
    streamId: "",
  });

  const sectionOptions = state.sections.filter((section) => section.classId === enrollmentForm.classId);
  const filteredClasses = state.classes.filter((item) =>
    (filter === "all" || item.status === filter) &&
    matchesSearch([item.code, item.name, item.academicYearName ?? item.academicYear, item.classTeacherName ?? item.homeroomStaffName], query),
  );
  const filteredSections = state.sections.filter((item) =>
    (filter === "all" || item.status === filter) &&
    matchesSearch([item.classCode, item.name, item.className, item.room], query),
  );
  const filteredEnrollments = state.enrollments.filter((item) =>
    (filter === "all" || item.status === filter) &&
    matchesSearch([item.studentName, item.admissionNumber, item.className, item.sectionName, item.rollNumber], query),
  );

  function validateClass() {
    const code = classForm.code.trim().toUpperCase();
    if (!code || !classForm.name.trim()) return "Class code and name are required.";
    if (!classForm.academicYearId) return "Select an academic year.";
    if (!classForm.classTeacherId) return "Select a class teacher.";
    if (!classForm.id && state.classes.some((item) => item.code === code && item.academicYearId === classForm.academicYearId)) {
      return "A class with this code already exists for the academic year.";
    }
    return null;
  }

  function saveClass(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const validation = validateClass();
    if (validation) return setMessage({ type: "error", text: validation });
    startTransition(async () => {
      try {
        let record: AcademicClassRecord;
        const academicYear = state.academicYears.find((item) => item.id === classForm.academicYearId);
        const teacher = state.teachers.find((item) => item.id === classForm.classTeacherId);
        if (classForm.id) {
          const payload = await fetchWithCsrf("/api/admin/academics/classes", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(classForm),
          });
          const data = await payload.json().catch(() => null);
          if (!payload.ok) throw new Error(data?.error ?? "Could not update class.");
          record = {
            ...state.classes.find((item) => item.id === classForm.id)!,
            ...data.class,
            academicYearName: academicYear?.name ?? data.class.academicYear,
            homeroomStaffName: teacher?.label ?? null,
            classTeacherName: teacher?.label ?? null,
          };
        } else {
          const payload = await postJson("/api/admin/academics/classes", classForm);
          record = {
            ...payload.class,
            academicYearName: academicYear?.name ?? payload.class.academicYear,
            homeroomStaffName: teacher?.label ?? null,
            classTeacherName: teacher?.label ?? null,
          };
        }
        dispatch({ type: "class/upsert", record });
        setClassForm({ id: "", code: "", name: "", academicYearId: classForm.academicYearId, status: "active", classTeacherId: "" });
        setOpenForm(null);
        setMessage({ type: "success", text: "Class saved." });
      } catch (error) {
        setMessage({ type: "error", text: error instanceof Error ? error.message : "Could not save class." });
      }
    });
  }

  function saveSection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    if (!sectionForm.classId || !sectionForm.name.trim()) return setMessage({ type: "error", text: "Class and section name are required." });
    const sectionName = sectionForm.name.trim().toUpperCase();
    if (!sectionForm.id && state.sections.some((item) => item.classId === sectionForm.classId && item.name === sectionName)) {
      return setMessage({ type: "error", text: "This section already exists for the selected class." });
    }
    startTransition(async () => {
      try {
        const classRecord = state.classes.find((item) => item.id === sectionForm.classId);
        let record: SectionRecord;
        if (sectionForm.id) {
          record = { ...state.sections.find((item) => item.id === sectionForm.id)!, classId: sectionForm.classId, className: classRecord?.name ?? "", classCode: classRecord?.code ?? "", name: sectionName, capacity: sectionForm.capacity ? Number(sectionForm.capacity) : null, status: sectionForm.status, room: sectionForm.room || null };
        } else {
          const payload = await postJson("/api/admin/academics/sections", { ...sectionForm, capacity: sectionForm.capacity ? Number(sectionForm.capacity) : undefined });
          record = { ...payload.section, className: classRecord?.name ?? "", classCode: classRecord?.code ?? "", room: sectionForm.room || null };
        }
        dispatch({ type: "section/upsert", record });
        setSectionForm({ id: "", classId: "", name: "", capacity: "", status: "active", room: "" });
        setOpenForm(null);
        setMessage({ type: "success", text: "Section saved." });
      } catch (error) {
        setMessage({ type: "error", text: error instanceof Error ? error.message : "Could not save section." });
      }
    });
  }

  function saveEnrollment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    if (!enrollmentForm.studentId || !enrollmentForm.classId || !enrollmentForm.academicYear.trim()) {
      return setMessage({ type: "error", text: "Student, class, and academic year are required." });
    }
    if (!enrollmentForm.id && state.enrollments.some((item) => item.studentId === enrollmentForm.studentId && item.academicYear === enrollmentForm.academicYear.trim())) {
      return setMessage({ type: "error", text: "This student is already enrolled for the academic year." });
    }
    startTransition(async () => {
      try {
        const student = state.students.find((item) => item.id === enrollmentForm.studentId);
        const classRecord = state.classes.find((item) => item.id === enrollmentForm.classId);
        const section = state.sections.find((item) => item.id === enrollmentForm.sectionId);
        let record: EnrollmentRecord;
        if (enrollmentForm.id) {
          record = { ...state.enrollments.find((item) => item.id === enrollmentForm.id)!, ...enrollmentForm, sectionId: enrollmentForm.sectionId || null, rollNumber: enrollmentForm.rollNumber || null, enrolledOn: enrollmentForm.enrolledOn || null, houseId: enrollmentForm.houseId || null, streamId: enrollmentForm.streamId || null, studentName: student?.label ?? "", admissionNumber: student?.admissionNumber ?? "", className: classRecord?.name ?? "", sectionName: section?.name ?? null };
        } else {
          const payload = await postJson("/api/admin/academics/enrollments", enrollmentForm);
          record = { ...payload.enrollment, studentName: student?.label ?? "", admissionNumber: student?.admissionNumber ?? "", className: classRecord?.name ?? "", sectionName: section?.name ?? null, houseId: enrollmentForm.houseId || null, streamId: enrollmentForm.streamId || null };
        }
        dispatch({ type: "enrollment/upsert", record });
        setEnrollmentForm({ id: "", studentId: "", classId: "", sectionId: "", academicYear: enrollmentForm.academicYear, rollNumber: "", status: "active", enrolledOn: "", houseId: "", streamId: "" });
        setOpenForm(null);
        setMessage({ type: "success", text: "Enrollment saved." });
      } catch (error) {
        setMessage({ type: "error", text: error instanceof Error ? error.message : "Could not save enrollment." });
      }
    });
  }

  function deleteClass(row: AcademicClassRecord) {
    if (state.sections.some((section) => section.classId === row.id) || state.enrollments.some((enrollment) => enrollment.classId === row.id)) {
      return setMessage({ type: "error", text: "Cannot delete a class with sections or enrollments." });
    }
    dispatch({ type: "class/delete", id: row.id });
  }

  function deleteSection(row: SectionRecord) {
    if (state.enrollments.some((enrollment) => enrollment.sectionId === row.id) || state.assignments.some((assignment) => assignment.sectionId === row.id)) {
      return setMessage({ type: "error", text: "Cannot delete a section with enrollments or subject assignments." });
    }
    dispatch({ type: "section/delete", id: row.id });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold">Classes & Sections</h2>
          <p className="mt-1 text-xs text-muted-foreground">Create classes, sections, and student enrollments from one setup surface.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => {
              setClassForm({ id: "", code: "", name: "", academicYearId: defaultAcademicYearId, status: "active", classTeacherId: "" });
              setOpenForm("class");
            }}
            icon={<Plus className="h-3.5 w-3.5" />}
          >
            Add Class
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setSectionForm({ id: "", classId: "", name: "", capacity: "", status: "active", room: "" });
              setOpenForm("section");
            }}
            icon={<Plus className="h-3.5 w-3.5" />}
          >
            Add Section
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setEnrollmentForm({ id: "", studentId: "", classId: "", sectionId: "", academicYear: currentAcademicYear?.name ?? "", rollNumber: "", status: "active", enrolledOn: "", houseId: "", streamId: "" });
              setOpenForm("enrollment");
            }}
            icon={<Plus className="h-3.5 w-3.5" />}
          >
            Enroll Student
          </Button>
        </div>
      </div>
      <FormErrorSummary errors={message?.type === "error" ? [message.text] : []} />
      {message?.type === "success" ? <FormSuccess>{message.text}</FormSuccess> : null}
      {view ? <FormSuccess>Viewing: {view}</FormSuccess> : null}
      {openForm === "class" ? (
        <Card padding="lg" className="rounded-lg">
          <div>
            <h3 className="text-sm font-semibold text-primary">{classForm.id ? "Edit class" : "Add class record"}</h3>
            <p className="mt-1 text-xs text-muted-foreground">Create a class for the selected academic year with a required class teacher.</p>
          </div>
          <form className="mt-4 grid gap-3 lg:grid-cols-4" onSubmit={saveClass}>
            <div className="space-y-1.5">
              <Label htmlFor="academic-class-code">Class code</Label>
              <Input id="academic-class-code" value={classForm.code} onChange={(event) => setClassForm((v) => ({ ...v, code: event.target.value }))} placeholder="VI" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="academic-class-name">Class name</Label>
              <Input id="academic-class-name" value={classForm.name} onChange={(event) => setClassForm((v) => ({ ...v, name: event.target.value }))} placeholder="Class VI" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="academic-class-year">Academic year</Label>
              <Select id="academic-class-year" value={classForm.academicYearId} onChange={(event) => setClassForm((v) => ({ ...v, academicYearId: event.target.value }))} required>
                <option value="">Select academic year</option>
                {state.academicYears.map((year) => <option key={year.id} value={year.id}>{year.name}{year.isCurrent ? " (Current)" : ""}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="academic-class-teacher">Class teacher</Label>
              <Select id="academic-class-teacher" value={classForm.classTeacherId} onChange={(event) => setClassForm((v) => ({ ...v, classTeacherId: event.target.value }))} required>
                <option value="">Select class teacher</option>
                {state.teachers.map((member) => <option key={member.id} value={member.id}>{member.label}</option>)}
              </Select>
            </div>
            <div className="flex items-end gap-2 lg:col-span-4">
              <Button type="submit" disabled={isPending} icon={<Plus className="h-3.5 w-3.5" />}>{isPending ? "Saving..." : classForm.id ? "Update class" : "Save"}</Button>
              <Button type="button" variant="secondary" onClick={() => setOpenForm(null)}>Cancel</Button>
            </div>
          </form>
        </Card>
      ) : null}
      {openForm === "section" ? (
        <Card padding="lg" className="rounded-lg">
          <div>
            <h3 className="text-sm font-semibold text-primary">{sectionForm.id ? "Edit section" : "Add section record"}</h3>
            <p className="mt-1 text-xs text-muted-foreground">Create a section under an existing class with room and capacity details.</p>
          </div>
          <form className="mt-4 grid gap-3 lg:grid-cols-5" onSubmit={saveSection}>
            <div className="space-y-1.5">
              <Label htmlFor="academic-section-class">Class</Label>
              <Select id="academic-section-class" value={sectionForm.classId} onChange={(event) => setSectionForm((v) => ({ ...v, classId: event.target.value }))} required>
                <option value="">Select class</option>
                {state.classes.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="academic-section-name">Section name</Label>
              <Input id="academic-section-name" value={sectionForm.name} onChange={(event) => setSectionForm((v) => ({ ...v, name: event.target.value }))} placeholder="A" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="academic-section-capacity">Capacity</Label>
              <Input id="academic-section-capacity" type="number" min={1} value={sectionForm.capacity} onChange={(event) => setSectionForm((v) => ({ ...v, capacity: event.target.value }))} placeholder="40" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="academic-section-room">Room</Label>
              <Input id="academic-section-room" value={sectionForm.room} onChange={(event) => setSectionForm((v) => ({ ...v, room: event.target.value }))} placeholder="B-204" />
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" disabled={isPending} icon={<Plus className="h-3.5 w-3.5" />}>{isPending ? "Saving..." : sectionForm.id ? "Update section" : "Save"}</Button>
              <Button type="button" variant="secondary" onClick={() => setOpenForm(null)}>Cancel</Button>
            </div>
          </form>
        </Card>
      ) : null}
      {openForm === "enrollment" ? (
        <Card padding="lg" className="rounded-lg">
          <div>
            <h3 className="text-sm font-semibold text-primary">{enrollmentForm.id ? "Edit enrollment" : "Add enrollment record"}</h3>
            <p className="mt-1 text-xs text-muted-foreground">Enroll a student into class, section, house, stream, and academic year.</p>
          </div>
          <form className="mt-4 grid gap-3 lg:grid-cols-4" onSubmit={saveEnrollment}>
            <div className="space-y-1.5">
              <Label htmlFor="academic-enrollment-student">Student</Label>
              <Select id="academic-enrollment-student" value={enrollmentForm.studentId} onChange={(event) => setEnrollmentForm((v) => ({ ...v, studentId: event.target.value }))} required>
                <option value="">Select student</option>
                {state.students.map((student) => <option key={student.id} value={student.id}>{student.label} ({student.admissionNumber})</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="academic-enrollment-class">Class</Label>
              <Select id="academic-enrollment-class" value={enrollmentForm.classId} onChange={(event) => setEnrollmentForm((v) => ({ ...v, classId: event.target.value, sectionId: "" }))} required>
                <option value="">Select class</option>
                {state.classes.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="academic-enrollment-section">Section</Label>
              <Select id="academic-enrollment-section" value={enrollmentForm.sectionId} onChange={(event) => setEnrollmentForm((v) => ({ ...v, sectionId: event.target.value }))}>
                <option value="">Select section</option>
                {sectionOptions.map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="academic-enrollment-year">Academic year</Label>
              <Select id="academic-enrollment-year" value={enrollmentForm.academicYear} onChange={(event) => setEnrollmentForm((v) => ({ ...v, academicYear: event.target.value }))} required>
                <option value="">Select academic year</option>
                {state.academicYears.map((year) => <option key={year.id} value={year.name}>{year.name}{year.isCurrent ? " (Current)" : ""}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="academic-enrollment-house">House</Label>
              <Select id="academic-enrollment-house" value={enrollmentForm.houseId} onChange={(event) => setEnrollmentForm((v) => ({ ...v, houseId: event.target.value }))}>
                <option value="">Select house (optional)</option>
                {state.houses.map((house) => <option key={house.id} value={house.id}>{house.name} ({house.color})</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="academic-enrollment-stream">Stream</Label>
              <Select id="academic-enrollment-stream" value={enrollmentForm.streamId} onChange={(event) => setEnrollmentForm((v) => ({ ...v, streamId: event.target.value }))}>
                <option value="">Select stream (optional)</option>
                {state.streams.map((stream) => <option key={stream.id} value={stream.id}>{stream.name}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="academic-enrollment-roll">Roll number</Label>
              <Input id="academic-enrollment-roll" value={enrollmentForm.rollNumber} onChange={(event) => setEnrollmentForm((v) => ({ ...v, rollNumber: event.target.value }))} placeholder="12" />
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" disabled={isPending} icon={<Plus className="h-3.5 w-3.5" />}>{isPending ? "Saving..." : enrollmentForm.id ? "Update enrollment" : "Save"}</Button>
              <Button type="button" variant="secondary" onClick={() => setOpenForm(null)}>Cancel</Button>
            </div>
          </form>
        </Card>
      ) : null}
      <SearchFilter query={query} onQuery={setQuery} filter={filter} onFilter={setFilter} options={[{ label: "All statuses", value: "all" }, { label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }]} />
      <div className="grid gap-4 xl:grid-cols-3">
        <DataTable
          rows={filteredClasses}
          empty="No classes match."
          columns={[
            { key: "code", label: "Code", render: (row) => <span className="font-mono">{row.code}</span> },
            { key: "name", label: "Class", render: (row) => row.name },
            { key: "year", label: "Academic Year", render: (row) => row.academicYearName ?? row.academicYear },
            { key: "teacher", label: "Class Teacher", render: (row) => row.classTeacherName ?? row.homeroomStaffName ?? "-" },
          ]}
          actions={[
            { label: "View", onClick: (row) => setView(`${row.name} / ${row.academicYearName ?? row.academicYear}`) },
            { label: "Edit", onClick: (row) => { setClassForm({ id: row.id, code: row.code, name: row.name, academicYearId: row.academicYearId ?? "", status: row.status, classTeacherId: row.classTeacherId ?? row.homeroomStaffId ?? "" }); setOpenForm("class"); } },
            { label: "Delete", tone: "danger", onClick: deleteClass },
          ]}
        />
        <DataTable
          rows={filteredSections}
          empty="No sections match."
          columns={[
            { key: "section", label: "Section", render: (row) => <span className="font-mono">{displaySection(row)}</span> },
            { key: "class", label: "Class", render: (row) => row.className },
            { key: "room", label: "Room", render: (row) => row.room ?? "-" },
          ]}
          actions={[
            { label: "View", onClick: (row) => setView(`${displaySection(row)} / capacity ${row.capacity ?? "unset"}`) },
            { label: "Edit", onClick: (row) => { setSectionForm({ id: row.id, classId: row.classId, name: row.name, capacity: row.capacity ? String(row.capacity) : "", status: row.status, room: row.room ?? "" }); setOpenForm("section"); } },
            { label: "Delete", tone: "danger", onClick: deleteSection },
          ]}
        />
        <DataTable
          rows={filteredEnrollments}
          empty="No enrollments match."
          columns={[
            { key: "student", label: "Student", render: (row) => row.studentName },
            { key: "class", label: "Class", render: (row) => `${row.className}${row.sectionName ? ` / ${row.sectionName}` : ""}` },
            { key: "house", label: "House", render: (row) => state.houses.find((house) => house.id === row.houseId)?.name ?? "-" },
          ]}
          actions={[
            { label: "View", onClick: (row) => setView(`${row.studentName} / ${row.admissionNumber}`) },
            { label: "Edit", onClick: (row) => { setEnrollmentForm({ id: row.id, studentId: row.studentId, classId: row.classId, sectionId: row.sectionId ?? "", academicYear: row.academicYear, rollNumber: row.rollNumber ?? "", status: row.status, enrolledOn: row.enrolledOn ?? "", houseId: row.houseId ?? "", streamId: row.streamId ?? "" }); setOpenForm("enrollment"); } },
            { label: "Delete", tone: "danger", onClick: (row) => dispatch({ type: "enrollment/delete", id: row.id }) },
          ]}
        />
      </div>
    </div>
  );
}

function SubjectsTab() {
  const { state, dispatch } = useAcademics();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ id: "", code: "", name: "", status: "active" });
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const filtered = state.subjects.filter((subject) => (filter === "all" || subject.status === filter) && matchesSearch([subject.code, subject.name, subject.status], query));

  function saveSubject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = form.code.trim().toUpperCase();
    if (!code || !form.name.trim()) return setMessage({ type: "error", text: "Subject code and name are required." });
    if (!form.id && state.subjects.some((subject) => subject.code === code)) return setMessage({ type: "error", text: "A subject with this code already exists." });
    startTransition(async () => {
      try {
        const record = form.id
          ? { ...state.subjects.find((subject) => subject.id === form.id)!, code, name: form.name.trim(), status: form.status }
          : (await postJson("/api/admin/subjects", { code, name: form.name, status: form.status })).subject;
        dispatch({ type: "subject/upsert", record });
        setForm({ id: "", code: "", name: "", status: "active" });
        setOpen(false);
        setMessage({ type: "success", text: "Subject saved." });
      } catch (error) {
        setMessage({ type: "error", text: error instanceof Error ? error.message : "Could not save subject." });
      }
    });
  }

  function deleteSubject(row: SubjectRecord) {
    if (state.assignments.some((assignment) => assignment.subjectId === row.id) || state.streams.some((stream) => stream.subjectIds.includes(row.id))) {
      return setMessage({ type: "error", text: "Cannot delete a subject used in class mappings or streams." });
    }
    dispatch({ type: "subject/delete", id: row.id });
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold">Subjects</h2>
          <p className="mt-1 text-xs text-muted-foreground">Maintain the subject master used across class mappings and reports.</p>
        </div>
        <Button type="button" onClick={() => { setForm({ id: "", code: "", name: "", status: "active" }); setOpen(true); }} icon={<Plus className="h-3.5 w-3.5" />}>Add Subject</Button>
      </div>
      <FormErrorSummary errors={message?.type === "error" ? [message.text] : []} />
      {message?.type === "success" ? <FormSuccess>{message.text}</FormSuccess> : null}
      {open ? (
        <Card padding="lg" className="rounded-lg">
          <div>
            <h3 className="text-sm font-semibold text-primary">{form.id ? "Edit subject" : "Add subject record"}</h3>
            <p className="mt-1 text-xs text-muted-foreground">Create a subject code and display name for academic planning.</p>
          </div>
          <form className="mt-4 grid gap-3 lg:grid-cols-2" onSubmit={saveSubject}>
            <div className="space-y-1.5">
              <Label htmlFor="subject-code">Subject code</Label>
              <Input id="subject-code" value={form.code} onChange={(event) => setForm((v) => ({ ...v, code: event.target.value }))} placeholder="ENG" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subject-name">Subject name</Label>
              <Input id="subject-name" value={form.name} onChange={(event) => setForm((v) => ({ ...v, name: event.target.value }))} placeholder="English" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subject-status">Status</Label>
              <Select id="subject-status" value={form.status} onChange={(event) => setForm((v) => ({ ...v, status: event.target.value }))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" disabled={isPending} icon={<Plus className="h-3.5 w-3.5" />}>{isPending ? "Saving..." : form.id ? "Update subject" : "Save"}</Button>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      ) : null}
      <section className="space-y-3">
        <SearchFilter query={query} onQuery={setQuery} filter={filter} onFilter={setFilter} options={[{ label: "All statuses", value: "all" }, { label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }]} />
        <DataTable
          rows={filtered}
          empty="No subjects match."
          columns={[
            { key: "code", label: "Code", render: (row) => <span className="font-mono">{row.code}</span> },
            { key: "name", label: "Subject", render: (row) => row.name },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
          ]}
          actions={[
            { label: "View", onClick: (row) => setMessage({ type: "success", text: `${row.code}: ${row.name}` }) },
            { label: "Edit", onClick: (row) => { setForm({ id: row.id, code: row.code, name: row.name, status: row.status }); setOpen(true); } },
            { label: "Delete", tone: "danger", onClick: deleteSubject },
          ]}
        />
      </section>
    </section>
  );
}

function ClassSubjectTab() {
  const { state, dispatch } = useAcademics();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ id: "", sectionId: "", subjectId: "", teacherId: "", weeklyPeriods: "5", plannedUnits: "12", completedUnits: "0" });
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const rows = state.assignments.filter((row) => (filter === "all" || row.sectionId === filter) && matchesSearch([getSectionLabel(state, row.sectionId), getSubjectName(state, row.subjectId), getTeacherName(state, row.teacherId), row.weeklyPeriods], query));

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.sectionId || !form.subjectId || !form.teacherId || Number(form.weeklyPeriods) < 1) return setMessage("Section, subject, teacher, and periods are required.");
    const duplicate = state.assignments.some((item) => item.id !== form.id && item.sectionId === form.sectionId && item.subjectId === form.subjectId);
    if (duplicate) return setMessage("This subject is already mapped to the section.");
    dispatch({
      type: "assignment/upsert",
      record: {
        id: form.id || createLocalId("as"),
        sectionId: form.sectionId,
        subjectId: form.subjectId,
        teacherId: form.teacherId,
        weeklyPeriods: Number(form.weeklyPeriods),
        plannedUnits: Number(form.plannedUnits || 0),
        completedUnits: Number(form.completedUnits || 0),
      },
    });
    setForm({ id: "", sectionId: "", subjectId: "", teacherId: "", weeklyPeriods: "5", plannedUnits: "12", completedUnits: "0" });
    setOpen(false);
    setMessage("Assignment saved. Teaching Load and Coverage reports updated.");
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold">Class x Subject</h2>
          <p className="mt-1 text-xs text-muted-foreground">Map subjects and teachers to sections for load and coverage reports.</p>
        </div>
        <Button type="button" onClick={() => { setForm({ id: "", sectionId: "", subjectId: "", teacherId: "", weeklyPeriods: "5", plannedUnits: "12", completedUnits: "0" }); setOpen(true); }} icon={<Plus className="h-3.5 w-3.5" />}>Add Assignment</Button>
      </div>
      {message ? <FormSuccess>{message}</FormSuccess> : null}
      {open ? (
        <Card padding="lg" className="rounded-lg">
          <div>
            <h3 className="text-sm font-semibold text-primary">{form.id ? "Edit assignment" : "Add assignment record"}</h3>
            <p className="mt-1 text-xs text-muted-foreground">Assign a subject teacher and weekly plan to a class section.</p>
          </div>
          <form className="mt-4 grid gap-3 lg:grid-cols-3" onSubmit={save}>
            <div className="space-y-1.5">
              <Label htmlFor="assignment-section">Section</Label>
              <Select id="assignment-section" value={form.sectionId} onChange={(event) => setForm((v) => ({ ...v, sectionId: event.target.value }))} required>
                <option value="">Select section</option>
                {state.sections.map((section) => <option key={section.id} value={section.id}>{displaySection(section)}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="assignment-subject">Subject</Label>
              <Select id="assignment-subject" value={form.subjectId} onChange={(event) => setForm((v) => ({ ...v, subjectId: event.target.value }))} required>
                <option value="">Select subject</option>
                {state.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.code} / {subject.name}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="assignment-teacher">Teacher</Label>
              <Select id="assignment-teacher" value={form.teacherId} onChange={(event) => setForm((v) => ({ ...v, teacherId: event.target.value }))} required>
                <option value="">Select teacher</option>
                {state.teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.label}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="assignment-periods">Weekly periods</Label>
              <Input id="assignment-periods" type="number" min={1} max={12} value={form.weeklyPeriods} onChange={(event) => setForm((v) => ({ ...v, weeklyPeriods: event.target.value }))} placeholder="5" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="assignment-planned">Planned units</Label>
              <Input id="assignment-planned" type="number" min={0} value={form.plannedUnits} onChange={(event) => setForm((v) => ({ ...v, plannedUnits: event.target.value }))} placeholder="12" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="assignment-completed">Completed units</Label>
              <Input id="assignment-completed" type="number" min={0} value={form.completedUnits} onChange={(event) => setForm((v) => ({ ...v, completedUnits: event.target.value }))} placeholder="0" />
            </div>
            <div className="flex items-end gap-2 lg:col-span-3">
              <Button type="submit" icon={<Plus className="h-3.5 w-3.5" />}>{form.id ? "Update assignment" : "Save"}</Button>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      ) : null}
      <section className="space-y-3">
        <SearchFilter query={query} onQuery={setQuery} filter={filter} onFilter={setFilter} options={[{ label: "All sections", value: "all" }, ...state.sections.map((section) => ({ label: displaySection(section), value: section.id }))]} />
        <DataTable
          rows={rows}
          empty="No class-subject assignments match."
          columns={[
            { key: "section", label: "Class", render: (row) => getSectionLabel(state, row.sectionId) },
            { key: "subject", label: "Subject", render: (row) => getSubjectName(state, row.subjectId) },
            { key: "teacher", label: "Teacher", render: (row) => getTeacherName(state, row.teacherId) },
            { key: "periods", label: "Weekly Periods", render: (row) => row.weeklyPeriods },
          ]}
          actions={[
            { label: "View", onClick: (row) => setMessage(`${getSectionLabel(state, row.sectionId)} / ${getSubjectName(state, row.subjectId)}`) },
            { label: "Edit", onClick: (row) => { setForm({ id: row.id, sectionId: row.sectionId, subjectId: row.subjectId, teacherId: row.teacherId, weeklyPeriods: String(row.weeklyPeriods), plannedUnits: String(row.plannedUnits), completedUnits: String(row.completedUnits) }); setOpen(true); } },
            { label: "Delete", tone: "danger", onClick: (row) => dispatch({ type: "assignment/delete", id: row.id }) },
          ]}
        />
      </section>
    </section>
  );
}

function StreamsTab() {
  const { state, dispatch } = useAcademics();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ id: "", code: "", name: "", grade: "", capacity: "40", status: "active" });
  const [open, setOpen] = useState(false);
  const rows = state.streams.filter((stream) => (filter === "all" || stream.status === filter) && matchesSearch([stream.code, stream.name, stream.grade], query));
  const enrollmentCount = (id: string) => state.enrollments.filter((enrollment) => enrollment.streamId === id).length;
  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.code.trim() || !form.name.trim() || Number(form.capacity) < 1) return;
    dispatch({ type: "stream/upsert", record: { id: form.id || createLocalId("stream"), code: form.code.trim().toUpperCase(), name: form.name.trim(), grade: form.grade.trim(), capacity: Number(form.capacity), status: form.status, subjectIds: [] } });
    setForm({ id: "", code: "", name: "", grade: "", capacity: "40", status: "active" });
    setOpen(false);
  }
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold">Streams & Electives</h2>
          <p className="mt-1 text-xs text-muted-foreground">Manage specialization tracks and capacity planning.</p>
        </div>
        <Button type="button" onClick={() => { setForm({ id: "", code: "", name: "", grade: "", capacity: "40", status: "active" }); setOpen(true); }} icon={<Plus className="h-3.5 w-3.5" />}>Add Stream</Button>
      </div>
      {open ? (
        <Card padding="lg" className="rounded-lg">
          <div>
            <h3 className="text-sm font-semibold text-primary">{form.id ? "Edit stream" : "Add stream record"}</h3>
            <p className="mt-1 text-xs text-muted-foreground">Create a stream with a grade band and seat capacity.</p>
          </div>
          <form className="mt-4 grid gap-3 lg:grid-cols-2" onSubmit={save}>
            <div className="space-y-1.5">
              <Label htmlFor="stream-code">Stream code</Label>
              <Input id="stream-code" value={form.code} onChange={(event) => setForm((v) => ({ ...v, code: event.target.value }))} placeholder="SCI" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stream-name">Stream name</Label>
              <Input id="stream-name" value={form.name} onChange={(event) => setForm((v) => ({ ...v, name: event.target.value }))} placeholder="Science PCM" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stream-grade">Grade band</Label>
              <Input id="stream-grade" value={form.grade} onChange={(event) => setForm((v) => ({ ...v, grade: event.target.value }))} placeholder="XI-XII" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stream-capacity">Capacity</Label>
              <Input id="stream-capacity" type="number" min={1} value={form.capacity} onChange={(event) => setForm((v) => ({ ...v, capacity: event.target.value }))} placeholder="40" required />
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" icon={<Plus className="h-3.5 w-3.5" />}>{form.id ? "Update stream" : "Save"}</Button>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      ) : null}
      <section className="space-y-3">
        <SearchFilter query={query} onQuery={setQuery} filter={filter} onFilter={setFilter} options={[{ label: "All statuses", value: "all" }, { label: "Active", value: "active" }]} />
        <DataTable
          rows={rows}
          empty="No streams match."
          columns={[
            { key: "name", label: "Stream", render: (row) => row.name },
            { key: "grade", label: "Grade", render: (row) => row.grade },
            { key: "capacity", label: "Capacity", render: (row) => row.capacity },
            { key: "enrolled", label: "Enrolled", render: (row) => enrollmentCount(row.id) },
            { key: "fill", label: "Fill %", render: (row) => `${Math.round((enrollmentCount(row.id) / row.capacity) * 100)}%` },
          ]}
          actions={[
            { label: "View", onClick: () => undefined },
            { label: "Edit", onClick: (row) => { setForm({ id: row.id, code: row.code, name: row.name, grade: row.grade, capacity: String(row.capacity), status: row.status }); setOpen(true); } },
            { label: "Delete", tone: "danger", onClick: (row) => state.enrollments.some((enrollment) => enrollment.streamId === row.id) ? undefined : dispatch({ type: "stream/delete", id: row.id }) },
          ]}
        />
      </section>
    </section>
  );
}

function HousesTab() {
  const { state, dispatch } = useAcademics();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ id: "", name: "", color: "", captain: "", viceCaptain: "", sportsPoints: "0", academicPoints: "0", culturalPoints: "0" });
  const [open, setOpen] = useState(false);
  const rows = state.houses.filter((house) => matchesSearch([house.name, house.color, house.captain, house.viceCaptain], query));
  const memberCount = (id: string) => state.enrollments.filter((enrollment) => enrollment.houseId === id).length;
  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.color.trim()) return;
    dispatch({ type: "house/upsert", record: { id: form.id || createLocalId("house"), name: form.name.trim(), color: form.color.trim(), captain: form.captain.trim(), viceCaptain: form.viceCaptain.trim(), sportsPoints: Number(form.sportsPoints), academicPoints: Number(form.academicPoints), culturalPoints: Number(form.culturalPoints) } });
    setForm({ id: "", name: "", color: "", captain: "", viceCaptain: "", sportsPoints: "0", academicPoints: "0", culturalPoints: "0" });
    setOpen(false);
  }
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold">House System</h2>
          <p className="mt-1 text-xs text-muted-foreground">Manage houses, captains, and inter-house points.</p>
        </div>
        <Button type="button" onClick={() => { setForm({ id: "", name: "", color: "", captain: "", viceCaptain: "", sportsPoints: "0", academicPoints: "0", culturalPoints: "0" }); setOpen(true); }} icon={<Plus className="h-3.5 w-3.5" />}>Add House</Button>
      </div>
      {open ? (
        <Card padding="lg" className="rounded-lg">
          <div>
            <h3 className="text-sm font-semibold text-primary">{form.id ? "Edit house" : "Add house record"}</h3>
            <p className="mt-1 text-xs text-muted-foreground">Create house teams and track sports, academic, and cultural points.</p>
          </div>
          <form className="mt-4 grid gap-3 lg:grid-cols-2" onSubmit={save}>
            <div className="space-y-1.5">
              <Label htmlFor="house-name">House name</Label>
              <Input id="house-name" value={form.name} onChange={(event) => setForm((v) => ({ ...v, name: event.target.value }))} placeholder="Ganga" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="house-color">House color</Label>
              <Input id="house-color" value={form.color} onChange={(event) => setForm((v) => ({ ...v, color: event.target.value }))} placeholder="Blue" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="house-captain">Captain</Label>
              <Input id="house-captain" value={form.captain} onChange={(event) => setForm((v) => ({ ...v, captain: event.target.value }))} placeholder="Captain name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="house-vice-captain">Vice captain</Label>
              <Input id="house-vice-captain" value={form.viceCaptain} onChange={(event) => setForm((v) => ({ ...v, viceCaptain: event.target.value }))} placeholder="Vice captain name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="house-sports-points">Sports points</Label>
              <Input id="house-sports-points" type="number" min={0} value={form.sportsPoints} onChange={(event) => setForm((v) => ({ ...v, sportsPoints: event.target.value }))} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="house-academic-points">Academic points</Label>
              <Input id="house-academic-points" type="number" min={0} value={form.academicPoints} onChange={(event) => setForm((v) => ({ ...v, academicPoints: event.target.value }))} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="house-cultural-points">Cultural points</Label>
              <Input id="house-cultural-points" type="number" min={0} value={form.culturalPoints} onChange={(event) => setForm((v) => ({ ...v, culturalPoints: event.target.value }))} placeholder="0" />
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" icon={<Plus className="h-3.5 w-3.5" />}>{form.id ? "Update house" : "Save"}</Button>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      ) : null}
      <section className="space-y-3">
        <SearchFilter query={query} onQuery={setQuery} filter={filter} onFilter={setFilter} options={[{ label: "All houses", value: "all" }]} />
        <DataTable
          rows={rows}
          empty="No houses match."
          columns={[
            { key: "house", label: "House", render: (row) => `${row.name} (${row.color})` },
            { key: "members", label: "Members", render: (row) => memberCount(row.id) },
            { key: "points", label: "Total Points", render: (row) => row.sportsPoints + row.academicPoints + row.culturalPoints },
            { key: "captain", label: "Captain", render: (row) => row.captain || "-" },
          ]}
          actions={[
            { label: "View", onClick: () => undefined },
            { label: "Edit", onClick: (row) => { setForm({ id: row.id, name: row.name, color: row.color, captain: row.captain, viceCaptain: row.viceCaptain, sportsPoints: String(row.sportsPoints), academicPoints: String(row.academicPoints), culturalPoints: String(row.culturalPoints) }); setOpen(true); } },
            { label: "Delete", tone: "danger", onClick: (row) => memberCount(row.id) > 0 ? undefined : dispatch({ type: "house/delete", id: row.id }) },
          ]}
        />
      </section>
    </section>
  );
}

function CalendarTab() {
  const { state, dispatch } = useAcademics();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ id: "", name: "", startDate: "", endDate: "", workingDays: "0", holidays: "0", hoursPerDay: "5" });
  const [open, setOpen] = useState(false);
  const rows = state.terms.filter((term) => matchesSearch([term.name, term.startDate, term.endDate], query));
  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.startDate || !form.endDate || Number(form.workingDays) < 1) return;
    dispatch({ type: "term/upsert", record: { id: form.id || createLocalId("term"), name: form.name.trim(), startDate: form.startDate, endDate: form.endDate, workingDays: Number(form.workingDays), holidays: Number(form.holidays), hoursPerDay: Number(form.hoursPerDay) } });
    setForm({ id: "", name: "", startDate: "", endDate: "", workingDays: "0", holidays: "0", hoursPerDay: "5" });
    setOpen(false);
  }
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold">Academic Calendar</h2>
          <p className="mt-1 text-xs text-muted-foreground">Set term dates and instructional hours used by coverage reports.</p>
        </div>
        <Button type="button" onClick={() => { setForm({ id: "", name: "", startDate: "", endDate: "", workingDays: "0", holidays: "0", hoursPerDay: "5" }); setOpen(true); }} icon={<Plus className="h-3.5 w-3.5" />}>Add Term</Button>
      </div>
      {open ? (
        <Card padding="lg" className="rounded-lg">
          <div>
            <h3 className="text-sm font-semibold text-primary">{form.id ? "Edit term" : "Add term record"}</h3>
            <p className="mt-1 text-xs text-muted-foreground">Define the working calendar that drives planned instructional hours.</p>
          </div>
          <form className="mt-4 grid gap-3 lg:grid-cols-2" onSubmit={save}>
            <div className="space-y-1.5">
              <Label htmlFor="term-name">Term name</Label>
              <Input id="term-name" value={form.name} onChange={(event) => setForm((v) => ({ ...v, name: event.target.value }))} placeholder="Term 1" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="term-start">Start date</Label>
              <Input id="term-start" type="date" value={form.startDate} onChange={(event) => setForm((v) => ({ ...v, startDate: event.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="term-end">End date</Label>
              <Input id="term-end" type="date" value={form.endDate} onChange={(event) => setForm((v) => ({ ...v, endDate: event.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="term-working-days">Working days</Label>
              <Input id="term-working-days" type="number" min={1} value={form.workingDays} onChange={(event) => setForm((v) => ({ ...v, workingDays: event.target.value }))} placeholder="90" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="term-holidays">Holidays</Label>
              <Input id="term-holidays" type="number" min={0} value={form.holidays} onChange={(event) => setForm((v) => ({ ...v, holidays: event.target.value }))} placeholder="8" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="term-hours">Hours per day</Label>
              <Input id="term-hours" type="number" min={1} value={form.hoursPerDay} onChange={(event) => setForm((v) => ({ ...v, hoursPerDay: event.target.value }))} placeholder="5" required />
            </div>
            <div className="flex items-end gap-2 lg:col-span-2">
              <Button type="submit" icon={<Plus className="h-3.5 w-3.5" />}>{form.id ? "Update term" : "Save"}</Button>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      ) : null}
      <section className="space-y-3">
        <SearchFilter query={query} onQuery={setQuery} filter={filter} onFilter={setFilter} options={[{ label: "All terms", value: "all" }]} />
        <DataTable
          rows={rows}
          empty="No terms match."
          columns={[
            { key: "term", label: "Term", render: (row) => row.name },
            { key: "dates", label: "Dates", render: (row) => `${row.startDate} to ${row.endDate}` },
            { key: "days", label: "Working Days", render: (row) => row.workingDays },
            { key: "hours", label: "Planned Hours", render: (row) => row.workingDays * row.hoursPerDay },
          ]}
          actions={[
            { label: "View", onClick: () => undefined },
            { label: "Edit", onClick: (row) => { setForm({ id: row.id, name: row.name, startDate: row.startDate, endDate: row.endDate, workingDays: String(row.workingDays), holidays: String(row.holidays), hoursPerDay: String(row.hoursPerDay) }); setOpen(true); } },
            { label: "Delete", tone: "danger", onClick: (row) => dispatch({ type: "term/delete", id: row.id }) },
          ]}
        />
      </section>
    </section>
  );
}

function RosterReport() {
  const { state, dispatch } = useAcademics();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState<string | null>(null);
  const rows = state.sections.map((section) => ({
    id: section.id,
    section,
    classTeacher: state.classes.find((item) => item.id === section.classId)?.classTeacherName ?? state.classes.find((item) => item.id === section.classId)?.homeroomStaffName ?? "Unassigned",
    strength: state.enrollments.filter((enrollment) => enrollment.sectionId === section.id).length,
    room: section.room ?? "-",
  })).filter((row) => (filter === "all" || row.section.classId === filter) && matchesSearch([displaySection(row.section), row.classTeacher, row.room], query));
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-[15px] font-semibold">Section Roster</h2>
        <p className="mt-1 text-xs text-muted-foreground">Derived from classes, sections, enrollments, rooms, and class teachers.</p>
      </div>
      {message ? <FormSuccess>{message}</FormSuccess> : null}
      <SearchFilter query={query} onQuery={setQuery} filter={filter} onFilter={setFilter} options={[{ label: "All classes", value: "all" }, ...state.classes.map((item) => ({ label: item.name, value: item.id }))]} />
      <DataTable rows={rows} empty="No roster rows match." columns={[
        { key: "section", label: "Section", render: (row) => displaySection(row.section) },
        { key: "teacher", label: "Class Teacher", render: (row) => row.classTeacher },
        { key: "strength", label: "Strength", render: (row) => row.strength },
        { key: "room", label: "Room", render: (row) => row.room },
      ]} actions={[
        { label: "View", onClick: (row) => setMessage(`${displaySection(row.section)} has ${row.strength} enrolled students and meets in ${row.room}.`) },
        { label: "Edit", onClick: (row) => setMessage(`Edit ${displaySection(row.section)} from Classes & Sections to change room, class teacher, or capacity.`) },
        {
          label: "Delete",
          tone: "danger",
          onClick: (row) => {
            if (row.strength > 0 || state.assignments.some((assignment) => assignment.sectionId === row.id)) {
              setMessage("Cannot delete a roster section with students or subject assignments.");
              return;
            }
            dispatch({ type: "section/delete", id: row.id });
          },
        },
      ]} />
    </section>
  );
}

function TeachingLoadReport() {
  const { state } = useAcademics();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState<string | null>(null);
  const rows = state.teachers.map((teacher) => {
    const assignments = state.assignments.filter((assignment) => assignment.teacherId === teacher.id);
    const periods = assignments.reduce((sum, assignment) => sum + assignment.weeklyPeriods, 0);
    return {
      id: teacher.id,
      teacher: teacher.label,
      classes: Array.from(new Set(assignments.map((assignment) => getSectionLabel(state, assignment.sectionId)))).join(", ") || "-",
      weeklyPeriods: periods,
      utilisation: `${Math.round((periods / 36) * 100)}%`,
      status: periods > 36 ? "WARNING" : periods < 28 ? "Trial" : "OK",
    };
  }).filter((row) => (filter === "all" || row.status === filter) && matchesSearch([row.teacher, row.classes, row.weeklyPeriods, row.status], query));
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-[15px] font-semibold">Teaching Load</h2>
        <p className="mt-1 text-xs text-muted-foreground">Derived from Class x Subject assignments and weekly periods.</p>
      </div>
      {message ? <FormSuccess>{message}</FormSuccess> : null}
      <SearchFilter query={query} onQuery={setQuery} filter={filter} onFilter={setFilter} options={[{ label: "All statuses", value: "all" }, { label: "OK", value: "OK" }, { label: "Warning", value: "WARNING" }, { label: "Trial", value: "Trial" }]} />
      <DataTable rows={rows} empty="No teaching load rows match." columns={[
        { key: "teacher", label: "Teacher", render: (row) => row.teacher },
        { key: "classes", label: "Classes", render: (row) => row.classes },
        { key: "periods", label: "Weekly Periods", render: (row) => row.weeklyPeriods },
        { key: "util", label: "Utilisation", render: (row) => row.utilisation },
        { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
      ]} actions={[
        { label: "View", onClick: (row) => setMessage(`${row.teacher}: ${row.weeklyPeriods} periods/week across ${row.classes}.`) },
        { label: "Edit", onClick: () => setMessage("Edit teaching load by changing weekly periods in Class x Subject.") },
        { label: "Delete", tone: "danger", onClick: () => setMessage("Teaching load rows are derived from Class x Subject assignments and cannot be deleted directly.") },
      ]} />
    </section>
  );
}

function CoverageReport() {
  const { state } = useAcademics();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState<string | null>(null);
  const plannedHours = state.terms.reduce((sum, term) => sum + term.workingDays * term.hoursPerDay, 0);
  const rows = state.assignments.map((assignment) => {
    const percent = assignment.plannedUnits > 0 ? Math.round((assignment.completedUnits / assignment.plannedUnits) * 100) : 0;
    return {
      id: assignment.id,
      section: getSectionLabel(state, assignment.sectionId),
      subject: getSubjectName(state, assignment.subjectId),
      plannedUnits: assignment.plannedUnits,
      completedUnits: assignment.completedUnits,
      percent,
      expectedHours: Math.round((assignment.weeklyPeriods / 40) * plannedHours),
      status: percent >= 85 ? "OK" : percent >= 65 ? "Warning" : "Critical",
    };
  }).filter((row) => (filter === "all" || row.status === filter) && matchesSearch([row.section, row.subject, row.percent, row.status], query));
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-[15px] font-semibold">Curriculum Coverage</h2>
        <p className="mt-1 text-xs text-muted-foreground">Derived from planned units, completed units, and academic calendar working hours.</p>
      </div>
      {message ? <FormSuccess>{message}</FormSuccess> : null}
      <SearchFilter query={query} onQuery={setQuery} filter={filter} onFilter={setFilter} options={[{ label: "All statuses", value: "all" }, { label: "OK", value: "OK" }, { label: "Warning", value: "Warning" }, { label: "Critical", value: "Critical" }]} />
      <DataTable rows={rows} empty="No coverage rows match." columns={[
        { key: "section", label: "Class", render: (row) => row.section },
        { key: "subject", label: "Subject", render: (row) => row.subject },
        { key: "planned", label: "Planned Units", render: (row) => row.plannedUnits },
        { key: "complete", label: "Completed", render: (row) => row.completedUnits },
        { key: "percent", label: "% Complete", render: (row) => `${row.percent}%` },
        { key: "hours", label: "Expected Hours", render: (row) => row.expectedHours },
        { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
      ]} actions={[
        { label: "View", onClick: (row) => setMessage(`${row.section} ${row.subject}: ${row.completedUnits}/${row.plannedUnits} units complete.`) },
        { label: "Edit", onClick: () => setMessage("Edit coverage by changing planned and completed units in Class x Subject.") },
        { label: "Delete", tone: "danger", onClick: () => setMessage("Coverage rows are derived from Class x Subject assignments and cannot be deleted directly.") },
      ]} />
    </section>
  );
}
