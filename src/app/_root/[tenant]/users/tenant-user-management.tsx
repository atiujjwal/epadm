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
import { FormError, FormSuccess } from "@/components/ui/form";

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
      <section>
        <Card variant="elevated" padding="lg">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-zinc-950">Add tenant member</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Create a user or connect an existing identity to this school with a role.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  id="role"
                  value={role}
                  onChange={(event) => setRole(event.target.value as UserRole)}
                  className="w-full"
                >
                  {roleOptions.map((roleOption) => (
                    <option key={roleOption} value={roleOption}>
                      {roleLabels[roleOption]}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Temporary password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full"
                minLength={8}
                required
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
              {isPending ? "Adding member..." : "Add member"}
            </Button>
          </form>
        </Card>
      </section>

      <section>
        <Card variant="elevated" padding="none">
          <div className="border-b border-zinc-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-zinc-950">Current members</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Tenant-specific memberships, roles, and verification status.
            </p>
          </div>

          <div className="overflow-x-auto">
            <Table variant="spacious" striped>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.membershipId}>
                    <TableCell>
                      <div className="font-medium text-zinc-900">{member.name}</div>
                      <div className="mt-1 text-zinc-600">{member.email}</div>
                      {member.phone && (
                        <div className="mt-1 text-zinc-500">{member.phone}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{roleLabels[member.role]}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={member.isActive ? "success" : "default"}>
                          {member.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant={member.isVerified ? "success" : "error"}>
                          {member.isVerified ? "Verified" : "Pending verification"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-600">
                      {new Date(member.joinedAt).toLocaleDateString()}
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
