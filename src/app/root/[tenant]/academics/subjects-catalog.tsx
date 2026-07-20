"use client";

import { useMemo, useState, useTransition } from "react";
import { fetchWithCsrf } from "@/lib/http/fetch-with-csrf";
import type { SubjectRecord } from "@/lib/admin/subjects";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FormError, FormSuccess } from "@/components/ui/form";

type Props = {
  initialSubjects: SubjectRecord[];
};

export function SubjectsCatalog({ initialSubjects }: Props) {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ name: "", code: "", status: "active" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subjects;
    return subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q),
    );
  }, [query, subjects]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const response = await fetchWithCsrf("/api/admin/subjects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          setError(payload?.error ?? "Could not create subject.");
          return;
        }

        setSubjects((current) => [payload.subject, ...current]);
        setForm({ name: "", code: "", status: "active" });
        setSuccess("Subject added.");
      } catch (submitError) {
        console.error("[subjects-catalog] submit failed:", submitError);
        setError("Could not create subject.");
      }
    });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
      <section>
        <Card variant="elevated" padding="lg" className="xl:sticky xl:top-20">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-primary">Add subject</h2>
            <p className="mt-1 text-xs text-secondary">
              Register core, elective, or co-scholastic subjects for the catalogue.
            </p>
          </div>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="subjectCode">Code</Label>
              <Input
                id="subjectCode"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="e.g. MAT103"
                required
              />
            </div>
            <div>
              <Label htmlFor="subjectName">Subject name</Label>
              <Input
                id="subjectName"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="subjectStatus">Status</Label>
              <Select
                id="subjectStatus"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
            {error ? <FormError>{error}</FormError> : null}
            {success ? <FormSuccess>{success}</FormSuccess> : null}
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Saving…" : "Add subject"}
            </Button>
          </form>
        </Card>
      </section>

      <section className="space-y-3">
        <Input
          placeholder="Search by code or name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    {subjects.length === 0
                      ? "No subjects yet — add your first subject."
                      : "No subjects match your search."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-mono text-xs">{subject.code}</TableCell>
                    <TableCell>{subject.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {subject.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
