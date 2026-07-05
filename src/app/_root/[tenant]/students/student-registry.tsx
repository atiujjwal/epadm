"use client";

import { useState, useTransition } from "react";
import { fetchWithCsrf } from "@/lib/http/fetch-with-csrf";

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
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-zinc-950">Add student</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Capture admission, classroom, and guardian information for the school registry.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-zinc-700">
              Admission number
              <input
                value={form.admissionNumber}
                onChange={(event) => updateField("admissionNumber", event.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-400 focus:bg-white"
                required
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
                <option value="alumni">Alumni</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-zinc-700">
              First name
              <input
                value={form.firstName}
                onChange={(event) => updateField("firstName", event.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-400 focus:bg-white"
                required
              />
            </label>
            <label className="block text-sm font-medium text-zinc-700">
              Last name
              <input
                value={form.lastName}
                onChange={(event) => updateField("lastName", event.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-400 focus:bg-white"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm font-medium text-zinc-700">
              Class
              <input
                value={form.classLabel}
                onChange={(event) => updateField("classLabel", event.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-400 focus:bg-white"
              />
            </label>
            <label className="block text-sm font-medium text-zinc-700">
              Section
              <input
                value={form.sectionLabel}
                onChange={(event) => updateField("sectionLabel", event.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-400 focus:bg-white"
              />
            </label>
            <label className="block text-sm font-medium text-zinc-700">
              Birth date
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(event) => updateField("dateOfBirth", event.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-400 focus:bg-white"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-zinc-700">
              Guardian name
              <input
                value={form.guardianName}
                onChange={(event) => updateField("guardianName", event.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-400 focus:bg-white"
              />
            </label>
            <label className="block text-sm font-medium text-zinc-700">
              Guardian phone
              <input
                value={form.guardianPhone}
                onChange={(event) => updateField("guardianPhone", event.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-400 focus:bg-white"
              />
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
            {isPending ? "Adding student..." : "Add student"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-950">Student registry</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Admission-focused view of current students across the tenant.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-600">
              <tr>
                <th className="px-6 py-3 font-medium">Student</th>
                <th className="px-6 py-3 font-medium">Class</th>
                <th className="px-6 py-3 font-medium">Guardian</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-t border-zinc-100">
                  <td className="px-6 py-4 align-top">
                    <div className="font-medium text-zinc-900">
                      {student.firstName} {student.lastName ?? ""}
                    </div>
                    <div className="mt-1 text-zinc-600">{student.admissionNumber}</div>
                  </td>
                  <td className="px-6 py-4 align-top text-zinc-600">
                    {(student.classLabel ?? "-") + (student.sectionLabel ? ` / ${student.sectionLabel}` : "")}
                  </td>
                  <td className="px-6 py-4 align-top text-zinc-600">
                    <div>{student.guardianName ?? "-"}</div>
                    <div className="mt-1">{student.guardianPhone ?? ""}</div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${student.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-700"}`}>
                      {student.status}
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
