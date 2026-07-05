"use client";

import { useState, useTransition } from "react";
import { fetchWithCsrf } from "@/lib/http/fetch-with-csrf";

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
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-zinc-950">Add staff record</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Build the school staffing registry with role-neutral employment details.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-zinc-700">
              Employee code
              <input
                value={form.employeeCode}
                onChange={(event) => updateField("employeeCode", event.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-400 focus:bg-white"
                required
              />
            </label>
            <label className="block text-sm font-medium text-zinc-700">
              Full name
              <input
                value={form.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-400 focus:bg-white"
                required
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-zinc-700">
              Department
              <input
                value={form.department}
                onChange={(event) => updateField("department", event.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-400 focus:bg-white"
              />
            </label>
            <label className="block text-sm font-medium text-zinc-700">
              Job title
              <input
                value={form.jobTitle}
                onChange={(event) => updateField("jobTitle", event.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-400 focus:bg-white"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-zinc-700">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-400 focus:bg-white"
              />
            </label>
            <label className="block text-sm font-medium text-zinc-700">
              Phone
              <input
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-400 focus:bg-white"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm font-medium text-zinc-700">
              Employment type
              <select
                value={form.employmentType}
                onChange={(event) => updateField("employmentType", event.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-400 focus:bg-white"
              >
                <option value="full_time">Full time</option>
                <option value="part_time">Part time</option>
                <option value="contract">Contract</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-zinc-700">
              Joined on
              <input
                type="date"
                value={form.joinedOn}
                onChange={(event) => updateField("joinedOn", event.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-400 focus:bg-white"
              />
            </label>
            <label className="block text-sm font-medium text-zinc-700">
              Status
              <select
                value={form.status}
                onChange={(event) => updateField("status", event.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-400 focus:bg-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On leave</option>
              </select>
            </label>
          </div>

          <label className="block text-sm font-medium text-zinc-700">
            Notes
            <textarea
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              rows={4}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-400 focus:bg-white"
            />
          </label>

          {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
          {success ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Adding staff..." : "Add staff"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-950">Staff registry</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Operational directory for departments, roles, and employment status.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-600">
              <tr>
                <th className="px-6 py-3 font-medium">Staff member</th>
                <th className="px-6 py-3 font-medium">Department</th>
                <th className="px-6 py-3 font-medium">Employment</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id} className="border-t border-zinc-100">
                  <td className="px-6 py-4 align-top">
                    <div className="font-medium text-zinc-900">{member.fullName}</div>
                    <div className="mt-1 text-zinc-600">{member.employeeCode}</div>
                    {member.email ? <div className="mt-1 text-zinc-500">{member.email}</div> : null}
                  </td>
                  <td className="px-6 py-4 align-top text-zinc-600">
                    <div>{member.department ?? "-"}</div>
                    <div className="mt-1">{member.jobTitle ?? ""}</div>
                  </td>
                  <td className="px-6 py-4 align-top text-zinc-600">
                    <div>{member.employmentType}</div>
                    <div className="mt-1">{member.joinedOn ?? ""}</div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${member.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-700"}`}>
                      {member.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
