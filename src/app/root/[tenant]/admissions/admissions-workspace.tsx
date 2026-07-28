"use client";

import { useMemo, useState, useTransition } from "react";
import { PageHeader } from "@/components/workspace/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSuccess } from "@/components/ui/form";
import { FormErrorSummary } from "@/components/ui/form-error-summary";
import { fetchWithCsrf } from "@/lib/http/fetch-with-csrf";
import type { AdmissionRecord } from "@/lib/admin/admissions";
import { Plus } from "lucide-react";

const STAGE_COLUMNS = [
  { id: "inquiry", label: "Enquiry" },
  { id: "applied", label: "Applied" },
  { id: "assessed", label: "Assessed" },
  { id: "offered", label: "Offered" },
  { id: "enrolled", label: "Enrolled" },
] as const;

const stageColors = ["bg-info", "bg-chart-5", "bg-warning", "bg-primary", "bg-success"];
const slaTone = ["text-success", "text-info", "text-warning", "text-primary", "text-success"];

function normalizeStage(stage: string) {
  const key = stage.trim().toLowerCase();
  if (key === "enquiry") return "inquiry";
  return key;
}

function daysSince(date: Date | string) {
  const then = new Date(date).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - then) / (1000 * 60 * 60 * 24)));
}

type Props = {
  initialAdmissions: AdmissionRecord[];
};

export function AdmissionsWorkspace({ initialAdmissions }: Props) {
  const [admissions, setAdmissions] = useState(initialAdmissions);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    applicantName: "",
    grade: "",
    stage: "inquiry",
    fitScore: "",
    owner: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const grouped = useMemo(() => {
    const buckets = Object.fromEntries(STAGE_COLUMNS.map((s) => [s.id, [] as AdmissionRecord[]]));
    for (const record of admissions) {
      const key = normalizeStage(record.stage);
      if (key in buckets) {
        buckets[key].push(record);
      } else {
        buckets.inquiry.push(record);
      }
    }
    return STAGE_COLUMNS.map((col) => ({
      ...col,
      items: buckets[col.id],
    }));
  }, [admissions]);

  const total = admissions.length;
  const enrolled = grouped.find((c) => c.id === "enrolled")?.items.length ?? 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const payload = {
          applicantName: form.applicantName,
          grade: form.grade,
          stage: form.stage,
          fitScore: form.fitScore ? Number(form.fitScore) : undefined,
          owner: form.owner || undefined,
        };

        const response = await fetchWithCsrf("/api/admin/admissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          setError(data?.error ?? "Could not create applicant.");
          return;
        }

        const created = data.admission as AdmissionRecord;
        setAdmissions((current) => [created, ...current]);
        setForm({ applicantName: "", grade: "", stage: "inquiry", fitScore: "", owner: "" });
        setShowForm(false);
        setSuccess("Applicant added to pipeline.");
      } catch (submitError) {
        console.error("[admissions-workspace] submit failed:", submitError);
        setError("Could not create applicant.");
      }
    });
  }

  return (
    <>
      <PageHeader
        title="Admissions pipeline"
        subtitle={
          total > 0
            ? `${total} applicant${total === 1 ? "" : "s"} · ${enrolled} enrolled`
            : "No applicants yet — add your first enquiry"
        }
        actions={
          <Button
            size="sm"
            className="h-8 gap-1.5 text-[12px]"
            onClick={() => setShowForm((v) => !v)}
          >
            <Plus className="h-3.5 w-3.5" /> New applicant
          </Button>
        }
      />

      <div className="p-6 space-y-4">
        {showForm ? (
          <div className="rounded-md border bg-surface p-4 max-w-lg">
            <h2 className="text-[13px] font-semibold mb-3">New applicant</h2>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="applicantName">Applicant name</Label>
                <Input
                  id="applicantName"
                  value={form.applicantName}
                  onChange={(e) => setForm((f) => ({ ...f, applicantName: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="grade">Grade</Label>
                  <Input
                    id="grade"
                    value={form.grade}
                    onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}
                    placeholder="e.g. VII"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stage">Stage</Label>
                  <select
                    id="stage"
                    value={form.stage}
                    onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value }))}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {STAGE_COLUMNS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="fitScore">Fit score (0–100)</Label>
                  <Input
                    id="fitScore"
                    type="number"
                    min={0}
                    max={100}
                    value={form.fitScore}
                    onChange={(e) => setForm((f) => ({ ...f, fitScore: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="owner">Owner</Label>
                  <Input
                    id="owner"
                    value={form.owner}
                    onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
                    placeholder="Counsellor"
                  />
                </div>
              </div>
              <FormErrorSummary errors={error ? [error] : []} />
              {success ? <FormSuccess>{success}</FormSuccess> : null}
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={isPending}>
                  {isPending ? "Saving…" : "Add applicant"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        ) : null}

        {!showForm && success ? (
          <div className="rounded-md border border-success/30 bg-success/10 px-4 py-2 text-[12px] text-success">
            {success}
          </div>
        ) : null}

        {total === 0 ? (
          <div className="rounded-md border border-dashed p-12 text-center">
            <p className="text-[13px] text-muted-foreground">
              No applicants in the pipeline yet.
            </p>
            <Button
              size="sm"
              className="mt-4 gap-1.5"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-3.5 w-3.5" /> Add first applicant
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {grouped.map((col, ci) => (
              <div key={col.id} className="rounded-md border bg-surface flex flex-col min-h-[420px]">
                <div className="px-3 py-2.5 border-b flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${stageColors[ci]}`} />
                  <div className="text-[12px] font-semibold">{col.label}</div>
                  <Badge variant="outline" className="h-5 text-[10px] font-mono ml-auto">
                    {col.items.length}
                  </Badge>
                </div>
                <div className="p-2 space-y-2 flex-1">
                  {col.items.length === 0 ? (
                    <div className="text-[11px] text-muted-foreground text-center py-8">
                      No applicants
                    </div>
                  ) : (
                    col.items.map((record) => {
                      const days = daysSince(record.createdAt);
                      const fit = record.fitScore ?? 0;
                      return (
                        <div
                          key={record.id}
                          className="rounded-sm border bg-background p-2.5 hover:border-primary/40 cursor-pointer transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-[12px] font-medium">{record.applicantName}</div>
                            <Badge
                              variant="outline"
                              className={`h-4 text-[9px] font-mono ${slaTone[ci]}`}
                            >
                              {ci === 0 && days === 0
                                ? "New"
                                : ci === 4
                                  ? "Done"
                                  : `${days}d`}
                            </Badge>
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-1">
                            Grade {record.grade}
                            {record.owner ? ` · ${record.owner}` : ""}
                            {days > 0 ? ` · ${days}d ago` : ""}
                          </div>
                          {record.fitScore != null ? (
                            <div className="mt-2 flex items-center gap-1">
                              <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
                                Fit
                              </div>
                              <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full bg-primary"
                                  style={{ width: `${fit}%` }}
                                />
                              </div>
                              <div className="text-[9px] font-mono">{fit}</div>
                            </div>
                          ) : null}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
