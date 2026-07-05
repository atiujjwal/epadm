"use client";

import { useState, useTransition } from "react";
import { fetchWithCsrf } from "@/lib/http/fetch-with-csrf";

type UserRole =
  | "admin"
  | "teacher"
  | "student"
  | "parent"
  | "staff"
  | "accountant"
  | "librarian";

type TenantMemberRecord = {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  joinedAt: string;
  isVerified: boolean;
};

type Props = {
  initialMembers: TenantMemberRecord[];
  roleOptions: readonly UserRole[];
};

const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
  parent: "Parent",
  staff: "Staff",
  accountant: "Accountant",
  librarian: "Librarian",
};

export function TenantUserManagement({ initialMembers, roleOptions }: Props) {
  const [members, setMembers] = useState(initialMembers);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("teacher");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setRole("teacher");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const response = await fetchWithCsrf("/api/admin/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
            phone,
            role,
          }),
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          setError(payload?.error ?? "Could not create member.");
          return;
        }

        const created = payload.member;
        setMembers((current) => [
          {
            membershipId: created.membershipId,
            userId: created.user.id,
            name: created.user.name,
            email: created.user.email,
            phone: created.user.phone,
            role: created.role,
            isActive: created.user.isActive,
            joinedAt: created.joinedAt,
            isVerified: created.user.isVerified,
          },
          ...current,
        ]);
        resetForm();
        setSuccess("Member added successfully.");
      } catch (submitError) {
        console.error("[tenant-user-management] submit failed:", submitError);
        setError("Could not create member.");
      }
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_1.55fr]">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-zinc-950">Add tenant member</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Create a user or connect an existing identity to this school with a role.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Full name
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-400 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-400 focus:bg-white"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Role
              </label>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as UserRole)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-400 focus:bg-white"
              >
                {roleOptions.map((roleOption) => (
                  <option key={roleOption} value={roleOption}>
                    {roleLabels[roleOption]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Phone
              </label>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-400 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Temporary password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-400 focus:bg-white"
              minLength={8}
              required
            />
          </div>

          {error ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          {success ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {success}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Adding member..." : "Add member"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-950">Current members</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Tenant-specific memberships, roles, and verification status.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-600">
              <tr>
                <th className="px-6 py-3 font-medium">Member</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.membershipId} className="border-t border-zinc-100">
                  <td className="px-6 py-4 align-top">
                    <div className="font-medium text-zinc-900">{member.name}</div>
                    <div className="mt-1 text-zinc-600">{member.email}</div>
                    {member.phone ? (
                      <div className="mt-1 text-zinc-500">{member.phone}</div>
                    ) : null}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                      {roleLabels[member.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          member.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {member.isActive ? "Active" : "Inactive"}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          member.isVerified
                            ? "bg-sky-50 text-sky-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {member.isVerified ? "Verified" : "Pending verification"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top text-zinc-600">
                    {new Date(member.joinedAt).toLocaleDateString()}
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
