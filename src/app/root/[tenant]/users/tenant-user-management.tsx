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
  joinedAt: string | Date;
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
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("teacher");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return members.filter((member) => {
      const haystack = [
        member.name,
        member.email,
        member.phone ?? "",
        roleLabels[member.role],
        member.role,
      ].join(" ").toLowerCase();

      const matchesSearch = normalizedQuery.length === 0 || haystack.includes(normalizedQuery);
      const matchesRole = roleFilter === "all" || member.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [members, query, roleFilter]);

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
    <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
      <section>
        <Card variant="elevated" padding="lg" className="xl:sticky xl:top-20">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-primary">Add tenant member</h2>
            <p className="mt-1 text-xs text-secondary">
              Create a user or connect an existing identity to this school with a role.
            </p>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
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

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
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
              icon={<Plus className="h-3.5 w-3.5" />}
            >
              {isPending ? "Adding member..." : "Add member"}
            </Button>
          </form>
        </Card>
      </section>

      <section>
        <Card variant="elevated" padding="none">
          <div className="border-b px-4 py-3" style={{ borderColor: "var(--border-default)" }}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-primary">Current members</h2>
                <p className="mt-1 text-xs text-secondary">
                  {filteredMembers.length} of {members.length} memberships visible
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  aria-label="Search members"
                  placeholder="Search members"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  leftElement={<Search className="h-3.5 w-3.5" />}
                  className="sm:w-56"
                />
                <Select
                  aria-label="Filter member role"
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value)}
                  leftElement={<SlidersHorizontal className="h-3.5 w-3.5" />}
                  className="sm:w-36"
                >
                  <option value="all">All roles</option>
                  {roleOptions.map((roleOption) => (
                    <option key={roleOption} value={roleOption}>
                      {roleLabels[roleOption]}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table variant="default" striped hoverable>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.membershipId}>
                    <TableCell>
                      <div className="font-medium text-primary">{member.name}</div>
                      <div className="mt-1 text-secondary">{member.email}</div>
                      {member.phone && (
                        <div className="mt-1 text-muted">{member.phone}</div>
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
                    <TableCell className="text-secondary">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button type="button" variant="ghost" size="sm" iconOnly icon={<Eye className="h-3.5 w-3.5" />} title="View member">
                          View
                        </Button>
                        <Button type="button" variant="ghost" size="sm" iconOnly icon={<Pencil className="h-3.5 w-3.5" />} title="Edit member">
                          Edit
                        </Button>
                        <Button type="button" variant="ghost" size="sm" iconOnly icon={<Trash2 className="h-3.5 w-3.5" />} title="Delete member">
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredMembers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted">
                      No members match the current filters.
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
