"use client";

import { useEffect, useMemo, useState, useTransition, type Dispatch, type FormEvent, type SetStateAction } from "react";
import {
  Cake,
  Download,
  FileText,
  IdCard,
  LockKeyhole,
  Plus,
  Printer,
  Search,
  Trash2,
  Users2,
} from "lucide-react";
import { PageHeader } from "@/components/workspace/app-shell";
import { ExportMenu } from "@/components/workspace/export-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormError, FormSuccess } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { fetchWithCsrf } from "@/lib/http/fetch-with-csrf";

type StaffRecord = {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  jobTitle: string | null;
  dateOfBirth: string | null;
  employmentType: string;
  status: string;
  notes: string | null;
  joinedOn: string | null;
  createdAt: Date | string;
};

type DepartmentRecord = {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  headStaffId: string | null;
  headName: string | null;
  isSystem: boolean;
  status: string;
  vacancies: number;
  headcount: number;
  activeCount: number;
  createdAt: Date | string;
};

type Props = {
  initialStaff: StaffRecord[];
  initialDepartments: DepartmentRecord[];
  total: number;
  active: number;
};

type TabId = "dashboard" | "staffs" | "departments" | "notes" | "id-cards";

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "dashboard", label: "Dashboard" },
  { id: "staffs", label: "Staffs" },
  { id: "departments", label: "Departments" },
  { id: "notes", label: "Notes" },
  { id: "id-cards", label: "ID Cards" },
];

const emptyStaffForm = {
  id: "",
  employeeCode: "",
  fullName: "",
  email: "",
  phone: "",
  department: "",
  jobTitle: "",
  dateOfBirth: "",
  employmentType: "full_time",
  joinedOn: "",
  status: "active",
  notes: "",
};

const emptyDepartmentForm = {
  id: "",
  code: "",
  name: "",
  description: "",
  headStaffId: "",
  status: "active",
  vacancies: "0",
};

function isAcademicStaff(member: StaffRecord) {
  const text = `${member.jobTitle ?? ""} ${member.department ?? ""}`.toLowerCase();
  return text.includes("teacher") || text.includes("academic");
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function currentMonthBirthday(member: StaffRecord) {
  if (!member.dateOfBirth) return false;
  const [, month] = member.dateOfBirth.split("-");
  const nowMonth = String(new Date().getMonth() + 1).padStart(2, "0");
  return month === nowMonth;
}

async function requestJson(url: string, method: "POST" | "PATCH" | "DELETE", body: unknown) {
  const response = await fetchWithCsrf(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error ?? "Request failed.");
  return payload;
}

export function StaffWorkspace({ initialStaff, initialDepartments, total, active }: Props) {
  const [tab, setTab] = useState<TabId>("dashboard");
  const [staff, setStaff] = useState(initialStaff);
  const [departments, setDepartments] = useState(initialDepartments);
  const [departmentToEdit, setDepartmentToEdit] = useState<DepartmentRecord | null>(null);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const activeCount = staff.filter((member) => member.status === "active").length || active;

  return (
    <>
      <PageHeader
        title="Staff"
        subtitle={`${(staff.length || total).toLocaleString()} staff records - live registry`}
        actions={<ExportMenu />}
      />

      <div className="sticky top-14 z-20 border-b bg-surface/95 backdrop-blur">
        <div className="flex min-w-max items-stretch gap-1 px-4">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setMessage(null);
                setTab(item.id);
              }}
              className={`relative flex h-10 items-center px-3 text-[12px] transition-colors ${
                tab === item.id ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
              {tab === item.id ? <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" /> : null}
            </button>
          ))}
        </div>
      </div>

      <main className="space-y-4 p-6">
        {message?.type === "error" ? <FormError>{message.text}</FormError> : null}
        {message?.type === "success" ? <FormSuccess>{message.text}</FormSuccess> : null}
        {tab === "dashboard" ? <DashboardTab staff={staff} departments={departments} activeCount={activeCount} setTab={setTab} setMessage={setMessage} setDepartments={setDepartments} setDepartmentToEdit={setDepartmentToEdit} /> : null}
        {tab === "staffs" ? <StaffsTab staff={staff} setStaff={setStaff} departments={departments} setMessage={setMessage} /> : null}
        {tab === "departments" ? <DepartmentsTab staff={staff} departments={departments} setDepartments={setDepartments} setMessage={setMessage} departmentToEdit={departmentToEdit} setDepartmentToEdit={setDepartmentToEdit} /> : null}
        {tab === "notes" ? <NotesTab staff={staff} setStaff={setStaff} setMessage={setMessage} /> : null}
        {tab === "id-cards" ? <IdCardsTab staff={staff} departments={departments} setMessage={setMessage} /> : null}
      </main>
    </>
  );
}

function DashboardTab({
  staff,
  departments,
  activeCount,
  setTab,
  setMessage,
  setDepartments,
  setDepartmentToEdit,
}: {
  staff: StaffRecord[];
  departments: DepartmentRecord[];
  activeCount: number;
  setTab: (tab: TabId) => void;
  setMessage: (message: { type: "error" | "success"; text: string } | null) => void;
  setDepartments: Dispatch<SetStateAction<DepartmentRecord[]>>;
  setDepartmentToEdit: Dispatch<SetStateAction<DepartmentRecord | null>>;
}) {
  const onLeave = staff.filter((member) => member.status === "on_leave").length;
  const vacancies = departments.reduce((sum, department) => sum + department.vacancies, 0);
  const birthdays = staff
    .filter(currentMonthBirthday)
    .sort((a, b) => (a.dateOfBirth ?? "").slice(8).localeCompare((b.dateOfBirth ?? "").slice(8)));

  return (
    <section className="space-y-4">
      <h2 className="text-[15px] font-semibold">Staff Overview</h2>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-border md:grid-cols-5">
        {[
          ["Total Staff", staff.length],
          ["Active Staff", activeCount],
          ["On Leave", onLeave],
          ["Total Departments", departments.length],
          ["Vacancies", vacancies],
        ].map(([label, value]) => (
          <div key={label} className="bg-surface p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className="mt-0.5 font-mono text-[16px] font-semibold">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card padding="none" className="overflow-hidden rounded-lg">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold">Department Breakdown</h2>
              <p className="mt-1 text-xs text-muted-foreground">Headcount, active staff, vacancies, and department actions.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Department</th>
                  <th className="px-3 py-2 text-left">Head</th>
                  <th className="px-3 py-2 text-left">Headcount</th>
                  <th className="px-3 py-2 text-left">Active</th>
                  <th className="px-3 py-2 text-left">Vacancies</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {departments.map((department) => (
                  <tr key={department.id}>
                    <td className="px-3 py-2 font-medium">{department.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{department.headName ?? "-"}</td>
                    <td className="px-3 py-2">{department.headcount}</td>
                    <td className="px-3 py-2">{department.activeCount}</td>
                    <td className="px-3 py-2">{department.vacancies}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        className="text-primary hover:underline"
                        onClick={() => {
                          setDepartmentToEdit(department);
                          setTab("departments");
                        }}
                      >
                        Edit
                      </button>
                      {department.isSystem ? (
                        <span className="ml-3 inline-flex align-middle" title="System defaults cannot be deleted">
                          <button
                            type="button"
                            className="text-muted-foreground opacity-60"
                            disabled
                            aria-label="System defaults cannot be deleted"
                          >
                            <LockKeyhole className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="ml-3 inline-flex align-middle text-danger hover:text-danger/80"
                          title="Delete department"
                          onClick={async () => {
                            if (!confirm(`Delete ${department.name}?`)) return;
                            try {
                              await requestJson("/api/admin/staff/departments", "DELETE", { id: department.id });
                              setDepartments((current) => current.filter((item) => item.id !== department.id));
                              setMessage({ type: "success", text: "Department deleted." });
                            } catch (error) {
                              setMessage({ type: "error", text: error instanceof Error ? error.message : "Could not delete department." });
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {departments.length === 0 ? (
                  <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">No departments yet.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>

        <Card padding="lg" className="rounded-lg">
          <div className="flex items-center gap-2">
            <Cake className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Upcoming Birthdays</h2>
          </div>
          <div className="mt-4 space-y-3">
            {birthdays.map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="text-sm font-medium">{member.fullName}</div>
                  <div className="text-xs text-muted-foreground">{member.department ?? "No department"}</div>
                </div>
                <div className="font-mono text-xs">{member.dateOfBirth?.slice(5)}</div>
              </div>
            ))}
            {birthdays.length === 0 ? <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">No birthdays this month.</div> : null}
          </div>
        </Card>
      </div>
    </section>
  );
}

function StaffsTab({
  staff,
  setStaff,
  departments,
  setMessage,
}: {
  staff: StaffRecord[];
  setStaff: Dispatch<SetStateAction<StaffRecord[]>>;
  departments: DepartmentRecord[];
  setMessage: (message: { type: "error" | "success"; text: string } | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyStaffForm);
  const [isPending, startTransition] = useTransition();
  const filtered = useMemo(
    () =>
      staff.filter((member) => {
        const haystack = [member.employeeCode, member.fullName, member.email, member.phone, member.department, member.jobTitle, member.employmentType].join(" ").toLowerCase();
        return (!query.trim() || haystack.includes(query.trim().toLowerCase())) && (status === "all" || member.status === status);
      }),
    [query, staff, status],
  );

  function setField(name: keyof typeof emptyStaffForm, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function saveStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    if (!form.dateOfBirth) {
      setMessage({ type: "error", text: "Date of Birth is required." });
      return;
    }
    startTransition(async () => {
      try {
        const method = form.id ? "PATCH" : "POST";
        const payload = await requestJson("/api/admin/staff", method, form);
        setStaff((current) => form.id ? current.map((member) => member.id === form.id ? { ...payload.staff, dateOfBirth: payload.staff.dateOfBirth ? String(payload.staff.dateOfBirth) : null, joinedOn: payload.staff.joinedOn ? String(payload.staff.joinedOn) : null } : member) : [{ ...payload.staff, dateOfBirth: payload.staff.dateOfBirth ? String(payload.staff.dateOfBirth) : null, joinedOn: payload.staff.joinedOn ? String(payload.staff.joinedOn) : null }, ...current]);
        setForm(emptyStaffForm);
        setOpen(false);
        setMessage({ type: "success", text: form.id ? "Staff record updated." : "Staff record added." });
      } catch (error) {
        setMessage({ type: "error", text: error instanceof Error ? error.message : "Could not save staff record." });
      }
    });
  }

  async function deleteStaff(id: string) {
    if (!confirm("Delete this staff record?")) return;
    try {
      await requestJson("/api/admin/staff", "DELETE", { id });
      setStaff((current) => current.filter((member) => member.id !== id));
      setMessage({ type: "success", text: "Staff record deleted." });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Could not delete staff record." });
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold">Staffs</h2>
          <p className="mt-1 text-xs text-muted-foreground">Create, update, and manage staff records.</p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setForm(emptyStaffForm);
            setOpen(true);
          }}
          icon={<Plus className="h-3.5 w-3.5" />}
        >
          Add Staff
        </Button>
      </div>

      {open ? (
        <Card padding="lg" className="rounded-lg">
          <div>
            <h3 className="text-sm font-semibold text-primary">{form.id ? "Edit staff" : "Add staff record"}</h3>
            <p className="mt-1 text-xs text-muted-foreground">Teachers and academic staff will appear in Academics class-teacher selection.</p>
          </div>
          <form className="mt-4 grid gap-3 lg:grid-cols-3" onSubmit={saveStaff}>
            <div className="space-y-1.5">
              <Label htmlFor="staff-employee-code">Employee code</Label>
              <Input id="staff-employee-code" value={form.employeeCode} onChange={(event) => setField("employeeCode", event.target.value)} placeholder="EMP-001" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="staff-full-name">Full name</Label>
              <Input id="staff-full-name" value={form.fullName} onChange={(event) => setField("fullName", event.target.value)} placeholder="Anita Sharma" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="staff-dob">Date of Birth</Label>
              <Input id="staff-dob" type="date" value={form.dateOfBirth} onChange={(event) => setField("dateOfBirth", event.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="staff-department">Department</Label>
              <Select id="staff-department" value={form.department} onChange={(event) => setField("department", event.target.value)}>
                <option value="">Select department</option>
                {departments.map((department) => <option key={department.id} value={department.name}>{department.name}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="staff-job-title">Job title</Label>
              <Input id="staff-job-title" value={form.jobTitle} onChange={(event) => setField("jobTitle", event.target.value)} placeholder="Teacher" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="staff-email">Email</Label>
              <Input id="staff-email" type="email" value={form.email} onChange={(event) => setField("email", event.target.value)} placeholder="anita@school.edu" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="staff-phone">Phone</Label>
              <Input id="staff-phone" value={form.phone} onChange={(event) => setField("phone", event.target.value)} placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="staff-joined-on">Joined on</Label>
              <Input id="staff-joined-on" type="date" value={form.joinedOn} onChange={(event) => setField("joinedOn", event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="staff-employment-type">Employment type</Label>
              <Select id="staff-employment-type" value={form.employmentType} onChange={(event) => setField("employmentType", event.target.value)}>
                <option value="full_time">Full time</option>
                <option value="part_time">Part time</option>
                <option value="contract">Contract</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="staff-status">Status</Label>
              <Select id="staff-status" value={form.status} onChange={(event) => setField("status", event.target.value)}>
                <option value="active">Active</option>
                <option value="on_leave">On leave</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
            <div className="space-y-1.5 lg:col-span-2">
              <Label htmlFor="staff-notes">Notes</Label>
              <Textarea id="staff-notes" value={form.notes} onChange={(event) => setField("notes", event.target.value)} rows={3} placeholder="Optional staff notes" />
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" disabled={isPending} icon={<Plus className="h-3.5 w-3.5" />}>{isPending ? "Saving..." : form.id ? "Update staff" : "Save"}</Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setForm(emptyStaffForm);
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card padding="none" className="overflow-hidden rounded-lg">
        <div className="flex flex-col gap-3 border-b px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold">Staffs</h2>
            <p className="mt-1 text-xs text-muted-foreground">{filtered.length} of {staff.length} records visible</p>
          </div>
          <div className="flex gap-2">
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search staff" leftElement={<Search className="h-3.5 w-3.5" />} />
            <Select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="on_leave">On leave</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Staff member</th>
                <th className="px-3 py-2 text-left">Department</th>
                <th className="px-3 py-2 text-left">DOB</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((member) => (
                <tr key={member.id}>
                  <td className="px-3 py-2">
                    <div className="font-medium">{member.fullName}</div>
                    <div className="text-muted-foreground">{member.employeeCode} {isAcademicStaff(member) ? "- Academic" : ""}</div>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{member.department ?? "-"}<div>{member.jobTitle ?? ""}</div></td>
                  <td className="px-3 py-2 font-mono">{member.dateOfBirth ?? "-"}</td>
                  <td className="px-3 py-2"><Badge variant={member.status === "active" ? "success" : "default"}>{member.status}</Badge></td>
                  <td className="px-3 py-2 text-right">
                    <button type="button" className="text-primary hover:underline" onClick={() => setMessage({ type: "success", text: `${member.fullName}: ${member.email ?? "No email"}` })}>View</button>
                    <button type="button" className="ml-3 text-primary hover:underline" onClick={() => { setForm({ id: member.id, employeeCode: member.employeeCode, fullName: member.fullName, email: member.email ?? "", phone: member.phone ?? "", department: member.department ?? "", jobTitle: member.jobTitle ?? "", dateOfBirth: member.dateOfBirth ?? "", employmentType: member.employmentType, joinedOn: member.joinedOn ?? "", status: member.status, notes: member.notes ?? "" }); setOpen(true); }}>Edit</button>
                    <button type="button" className="ml-3 text-danger hover:underline" onClick={() => deleteStaff(member.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? <tr><td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">No staff records match the current filters.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}

function DepartmentsTab({
  staff,
  departments,
  setDepartments,
  setMessage,
  departmentToEdit,
  setDepartmentToEdit,
}: {
  staff: StaffRecord[];
  departments: DepartmentRecord[];
  setDepartments: Dispatch<SetStateAction<DepartmentRecord[]>>;
  setMessage: (message: { type: "error" | "success"; text: string } | null) => void;
  departmentToEdit: DepartmentRecord | null;
  setDepartmentToEdit: Dispatch<SetStateAction<DepartmentRecord | null>>;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyDepartmentForm);
  const [isPending, startTransition] = useTransition();

  function setField(name: keyof typeof emptyDepartmentForm, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  useEffect(() => {
    if (!departmentToEdit) return;
    queueMicrotask(() => {
      setForm({
        id: departmentToEdit.id,
        code: departmentToEdit.code ?? "",
        name: departmentToEdit.name,
        description: departmentToEdit.description ?? "",
        headStaffId: departmentToEdit.headStaffId ?? "",
        status: departmentToEdit.status,
        vacancies: String(departmentToEdit.vacancies),
      });
      setOpen(true);
      setDepartmentToEdit(null);
    });
  }, [departmentToEdit, setDepartmentToEdit]);

  function saveDepartment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      try {
        const payload = await requestJson("/api/admin/staff/departments", form.id ? "PATCH" : "POST", { ...form, vacancies: Number(form.vacancies) });
        const head = staff.find((member) => member.id === payload.department.headStaffId);
        const existing = departments.find((item) => item.id === payload.department.id);
        const record = { ...payload.department, headName: head?.fullName ?? null, headcount: existing?.headcount ?? 0, activeCount: existing?.activeCount ?? 0 };
        setDepartments((current) => form.id ? current.map((department) => department.id === form.id ? record : department) : [record, ...current]);
        setForm(emptyDepartmentForm);
        setOpen(false);
        setMessage({ type: "success", text: "Department saved." });
      } catch (error) {
        setMessage({ type: "error", text: error instanceof Error ? error.message : "Could not save department." });
      }
    });
  }

  async function deleteDepartment(id: string) {
    if (!confirm("Delete this department?")) return;
    try {
      await requestJson("/api/admin/staff/departments", "DELETE", { id });
      setDepartments((current) => current.filter((department) => department.id !== id));
      setMessage({ type: "success", text: "Department deleted." });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Could not delete department." });
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold">Departments</h2>
          <p className="mt-1 text-xs text-muted-foreground">Department master with heads, vacancies, and active headcount.</p>
        </div>
        <Button type="button" onClick={() => { setForm(emptyDepartmentForm); setOpen(true); }} icon={<Plus className="h-3.5 w-3.5" />}>Add Department</Button>
      </div>
      {open ? (
        <Card padding="lg" className="rounded-lg">
          <div>
            <h3 className="text-sm font-semibold text-primary">{form.id ? "Edit department" : "Add department record"}</h3>
            <p className="mt-1 text-xs text-muted-foreground">Create custom department masters with an optional code, head, and description.</p>
          </div>
          <form className="mt-4 grid gap-3 lg:grid-cols-2" onSubmit={saveDepartment}>
            <div className="space-y-1.5">
              <Label htmlFor="department-name">Department name</Label>
              <Input id="department-name" value={form.name} onChange={(event) => setField("name", event.target.value)} placeholder="Co-curricular" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="department-code">Code</Label>
              <Input id="department-code" value={form.code} onChange={(event) => setField("code", event.target.value)} placeholder="CCA" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="department-head">Head of department</Label>
              <Select id="department-head" value={form.headStaffId} onChange={(event) => setField("headStaffId", event.target.value)}>
                <option value="">Select head</option>
                {staff.map((member) => <option key={member.id} value={member.id}>{member.fullName}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5 lg:col-span-2">
              <Label htmlFor="department-description">Description</Label>
              <Textarea id="department-description" value={form.description} onChange={(event) => setField("description", event.target.value)} rows={3} placeholder="What this department manages" />
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save"}</Button>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      ) : null}
      <Card padding="none" className="overflow-hidden rounded-lg">
        <table className="w-full text-[12px]">
          <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Code</th>
              <th className="px-3 py-2 text-left">Department</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Head</th>
              <th className="px-3 py-2 text-left">Headcount</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {departments.map((department) => (
              <tr key={department.id}>
                <td className="px-3 py-2 font-mono">{department.code ?? "-"}</td>
                <td className="px-3 py-2">
                  <div className="font-medium">{department.name}</div>
                  <div className="max-w-[320px] truncate text-muted-foreground">{department.description ?? "No description"}</div>
                </td>
                <td className="px-3 py-2">
                  <Badge variant={department.isSystem ? "default" : "success"}>{department.isSystem ? "System" : "Custom"}</Badge>
                </td>
                <td className="px-3 py-2 text-muted-foreground">{department.headName ?? "-"}</td>
                <td className="px-3 py-2">{department.headcount}</td>
                <td className="px-3 py-2 text-right">
                  <button type="button" className="text-primary hover:underline" onClick={() => { setForm({ id: department.id, code: department.code ?? "", name: department.name, description: department.description ?? "", headStaffId: department.headStaffId ?? "", status: department.status, vacancies: String(department.vacancies) }); setOpen(true); }}>Edit</button>
                  {department.isSystem ? (
                    <span className="ml-3 inline-flex align-middle" title="System defaults cannot be deleted">
                      <button
                        type="button"
                        className="text-muted-foreground opacity-60"
                        disabled
                        aria-label="System defaults cannot be deleted"
                      >
                        <LockKeyhole className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="ml-3 inline-flex align-middle text-danger hover:text-danger/80"
                      title="Delete department"
                      onClick={() => deleteDepartment(department.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {departments.length === 0 ? <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">No departments yet.</td></tr> : null}
          </tbody>
        </table>
      </Card>
    </section>
  );
}

function NotesTab({
  staff,
  setStaff,
  setMessage,
}: {
  staff: StaffRecord[];
  setStaff: Dispatch<SetStateAction<StaffRecord[]>>;
  setMessage: (message: { type: "error" | "success"; text: string } | null) => void;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-[15px] font-semibold">Notes</h2>
      <Card padding="none" className="overflow-hidden rounded-lg">
        <table className="w-full text-[12px]">
          <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-3 py-2 text-left">Staff</th><th className="px-3 py-2 text-left">Note</th><th className="px-3 py-2 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {staff.map((member) => (
              <tr key={member.id}>
                <td className="px-3 py-2 font-medium">{member.fullName}</td>
                <td className="px-3 py-2 text-muted-foreground">{member.notes ?? "No notes"}</td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={async () => {
                      const notes = prompt("Update notes", member.notes ?? "");
                      if (notes === null) return;
                      try {
                        const payload = await requestJson("/api/admin/staff", "PATCH", { ...member, dateOfBirth: member.dateOfBirth ?? "", email: member.email ?? "", phone: member.phone ?? "", department: member.department ?? "", jobTitle: member.jobTitle ?? "", joinedOn: member.joinedOn ?? "", notes });
                        setStaff((current) => current.map((item) => item.id === member.id ? { ...payload.staff, dateOfBirth: payload.staff.dateOfBirth ? String(payload.staff.dateOfBirth) : null, joinedOn: payload.staff.joinedOn ? String(payload.staff.joinedOn) : null } : item));
                        setMessage({ type: "success", text: "Notes updated." });
                      } catch (error) {
                        setMessage({ type: "error", text: error instanceof Error ? error.message : "Could not update notes." });
                      }
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {staff.length === 0 ? <tr><td colSpan={3} className="px-3 py-8 text-center text-muted-foreground">No staff notes yet.</td></tr> : null}
          </tbody>
        </table>
      </Card>
    </section>
  );
}

function IdCardsTab({
  staff,
  departments,
  setMessage,
}: {
  staff: StaffRecord[];
  departments: DepartmentRecord[];
  setMessage: (message: { type: "error" | "success"; text: string } | null) => void;
}) {
  const [department, setDepartment] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const visible = staff.filter((member) => (department === "all" || member.department === department) && (status === "all" || member.status === status));

  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const selectedStaff = visible.filter((member) => selected.includes(member.id));

  function printSelected() {
    if (selectedStaff.length === 0) {
      setMessage({ type: "error", text: "Select at least one staff card." });
      return;
    }
    window.print();
  }

  return (
    <section className="space-y-4">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          [data-print-card="true"],
          [data-print-card="true"] * {
            visibility: visible;
          }
          [data-print-selected="false"] {
            display: none !important;
          }
          [data-print-card="true"] {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold">ID Cards</h2>
          <p className="mt-1 text-xs text-muted-foreground">Printable previews with department and status filters.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={department} onChange={(event) => setDepartment(event.target.value)}>
            <option value="all">All departments</option>
            {departments.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
          </Select>
          <Select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="on_leave">On leave</option>
            <option value="inactive">Inactive</option>
          </Select>
          <Button type="button" variant="secondary" onClick={() => setSelected(visible.map((member) => member.id))} icon={<Users2 className="h-3.5 w-3.5" />}>Select All</Button>
          <Button type="button" onClick={printSelected} icon={<Printer className="h-3.5 w-3.5" />}>Print Selected</Button>
          <Button type="button" variant="secondary" onClick={printSelected} icon={<Download className="h-3.5 w-3.5" />}>Export PDF</Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((member) => (
          <button
            key={member.id}
            type="button"
            onClick={() => toggle(member.id)}
            data-print-card="true"
            data-print-selected={selected.includes(member.id) ? "true" : "false"}
            className={`text-left ${selected.includes(member.id) ? "ring-2 ring-primary" : ""}`}
          >
            <Card padding="lg" className="rounded-lg">
              <div className="flex items-start justify-between">
                <div className="grid h-14 w-14 place-items-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">{initials(member.fullName)}</div>
                <IdCard className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="mt-5 text-lg font-semibold">{member.fullName}</div>
              <div className="font-mono text-xs text-muted-foreground">{member.employeeCode}</div>
              <div className="mt-4 grid gap-1 text-xs">
                <div><span className="text-muted-foreground">Department:</span> {member.department ?? "-"}</div>
                <div><span className="text-muted-foreground">Role:</span> {member.jobTitle ?? "-"}</div>
                <div><span className="text-muted-foreground">Phone:</span> {member.phone ?? "-"}</div>
                <div><span className="text-muted-foreground">DOB:</span> {member.dateOfBirth ?? "-"}</div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <Badge variant={member.status === "active" ? "success" : "default"}>{member.status}</Badge>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>
          </button>
        ))}
        {visible.length === 0 ? <Card padding="lg" className="rounded-lg border-dashed text-center text-sm text-muted-foreground">No staff cards match the filters.</Card> : null}
      </div>
    </section>
  );
}
