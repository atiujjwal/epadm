"use client";

import { useMemo, useState, useTransition } from "react";
import { ModuleShell, type ModuleFlow } from "@/components/workspace/module-shell";
import type { InnerRailGroup } from "@/components/workspace/inner-rail";
import type { LibraryBookRecord } from "@/lib/admin/library";
import { fetchWithCsrf } from "@/lib/http/fetch-with-csrf";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FormSuccess } from "@/components/ui/form";
import { FormErrorSummary } from "@/components/ui/form-error-summary";

type Props = {
  initialBooks: LibraryBookRecord[];
};

function LibraryCatalog({ initialBooks }: Props) {
  const [books, setBooks] = useState(initialBooks);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ accession: "", title: "", author: "", status: "available" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (b) =>
        b.accession.toLowerCase().includes(q) ||
        b.title.toLowerCase().includes(q) ||
        (b.author ?? "").toLowerCase().includes(q),
    );
  }, [query, books]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const response = await fetchWithCsrf("/api/admin/library", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accession: form.accession,
            title: form.title,
            author: form.author || undefined,
            status: form.status,
          }),
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          setError(payload?.error ?? "Could not add book.");
          return;
        }

        setBooks((current) => [payload.book, ...current]);
        setForm({ accession: "", title: "", author: "", status: "available" });
        setSuccess("Book added to catalogue.");
      } catch (submitError) {
        console.error("[library-catalog] submit failed:", submitError);
        setError("Could not add book.");
      }
    });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
      <section>
        <Card variant="elevated" padding="lg" className="xl:sticky xl:top-20">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-primary">Add title</h2>
            <p className="mt-1 text-xs text-secondary">
              Register a new accession in the library catalogue.
            </p>
          </div>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="accession">Accession</Label>
              <Input
                id="accession"
                value={form.accession}
                onChange={(e) => setForm((f) => ({ ...f, accession: e.target.value }))}
                placeholder="ACC-00021"
                required
              />
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={form.author}
                onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="bookStatus">Status</Label>
              <Select
                id="bookStatus"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="available">Available</option>
                <option value="issued">Issued</option>
                <option value="reserved">Reserved</option>
                <option value="lost">Lost</option>
              </Select>
            </div>
            <FormErrorSummary errors={error ? [error] : []} />
            {success ? <FormSuccess>{success}</FormSuccess> : null}
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Saving…" : "Add title"}
            </Button>
          </form>
        </Card>
      </section>

      <section className="space-y-3">
        <Input
          placeholder="Search accession, title, author…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Accession</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    {books.length === 0
                      ? "No books in catalogue — add your first title."
                      : "No books match your search."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell className="font-mono text-xs">{book.accession}</TableCell>
                    <TableCell>{book.title}</TableCell>
                    <TableCell>{book.author ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {book.status}
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

const rail: InnerRailGroup[] = [
  {
    label: "Operate",
    items: [
      { id: "dashboard", label: "Dashboard" },
      { id: "issue", label: "Issue Book" },
      { id: "return", label: "Return Book" },
      { id: "reserve", label: "Reservations" },
      { id: "fines", label: "Fines" },
      { id: "lost", label: "Lost / Damaged" },
    ],
  },
  {
    label: "Catalog",
    items: [
      { id: "catalog", label: "Books & Media" },
      { id: "members", label: "Members" },
      { id: "acquisitions", label: "Acquisitions" },
    ],
  },
  {
    label: "Reports",
    items: [
      { id: "overdue", label: "Overdue", count: 18 },
      { id: "reports", label: "Circulation" },
      { id: "popular", label: "Most Popular" },
      { id: "dormant", label: "Dormant Members" },
    ],
  },
  {
    label: "Configure",
    items: [
      { id: "cfg-rules", label: "Membership Rules" },
      { id: "cfg-fines", label: "Fine Slabs" },
      { id: "cfg-classification", label: "Classification (DDC)" },
    ],
  },
];

function buildFlows(books: LibraryBookRecord[]): Record<string, ModuleFlow> {
  const catalogRows = books.map((b) => [b.accession, b.title, b.author ?? "—", "—", "—", "—"]);
  const availableCount = books.filter((b) => b.status === "available").length;

  return {
    dashboard: {
      title: "Library at a glance",
      subtitle:
        books.length > 0
          ? `${books.length} title${books.length === 1 ? "" : "s"} · ${availableCount} available`
          : "8,412 titles · 12,904 copies · 1,246 active members",
      ai: "Copilot: 32 titles are checked out >60% of the time. Reordering 2 additional copies each would cut waitlist by ~40%.",
      stats: [
        { label: "Catalogue titles", value: String(books.length) },
        { label: "Available", value: String(availableCount) },
        { label: "Overdue", value: "18", delta: "₹1,240 fines" },
        { label: "Reservations", value: "27" },
      ],
      columns: ["Book", "Author", "Category", "Copies", "Available", "Waitlist"],
      rows:
        catalogRows.length > 0
          ? catalogRows.slice(0, 8)
          : [
              ["The Discovery of India", "Nehru", "History", "8", "0", "6"],
              ["Wings of Fire", "Kalam", "Biography", "12", "3", "0"],
              ["Physics NCERT XI", "NCERT", "Textbook", "80", "12", "0"],
              ["Harry Potter I", "Rowling", "Fiction", "10", "1", "4"],
            ],
      primaryAction: "Issue book",
    },
    issue: {
      title: "Issue Book",
      subtitle: "Scan member ID + book barcode. Auto-checks limits and dues.",
      columns: ["Timestamp", "Member", "Class", "Book", "Due", "Status"],
      rows: [
        ["10:12", "STU-1042 · Aarav Kumar", "IX-B", "Wings of Fire", "01 Aug", "Active"],
        ["10:18", "STU-0991 · Diya Patel", "X-A", "Harry Potter I", "01 Aug", "Active"],
        ["10:24", "STU-1120 · Ishaan Roy", "VIII-C", "Physics NCERT", "22 Aug", "Active"],
      ],
      primaryAction: "New issue",
    },
    return: {
      title: "Return Book",
      columns: ["Member", "Book", "Issued", "Due", "Returned", "Fine"],
      rows: [
        ["STU-0871 · Kabir Shah", "The Alchemist", "01 Jul", "15 Jul", "15 Jul", "—"],
        ["STU-1204 · Meera Nair", "Malgudi Days", "28 Jun", "12 Jul", "15 Jul", "₹15 · Pending"],
      ],
      primaryAction: "Process return",
    },
    reserve: {
      title: "Reservations",
      columns: ["Book", "Requested by", "Requested", "Position", "Status"],
      rows: [
        ["The Discovery of India", "STU-1042", "12 Jul", "1", "Active"],
        ["Harry Potter I", "STU-0991", "13 Jul", "2", "Active"],
        ["Wings of Fire", "STU-1120", "14 Jul", "1", "Pending"],
      ],
    },
    fines: {
      title: "Fines",
      subtitle: "Auto-calculated from fine slabs · settled via fee account.",
      columns: ["Member", "Book", "Days late", "Amount", "Status"],
      rows: [
        ["Meera Nair", "Malgudi Days", "3", "₹15", "Pending"],
        ["Aarav Kumar", "Physics NCERT", "5", "₹25", "Pending"],
      ],
      primaryAction: "Collect fine",
    },
    lost: {
      title: "Lost / Damaged",
      columns: ["Member", "Book", "Reported", "Replacement", "Status"],
      rows: [["STU-0761 · Yash V.", "Chemistry NCERT XI", "10 Jul", "₹480", "Pending"]],
    },
    catalog: {
      title: "Catalog",
      subtitle:
        books.length > 0
          ? `${books.length} title${books.length === 1 ? "" : "s"} in catalogue`
          : "Books and media accession register",
      columns: ["Accession", "Title", "Author", "DDC", "Copies", "Location"],
      rows:
        catalogRows.length > 0
          ? catalogRows
          : [
              ["ACC-00021", "Wings of Fire", "APJ Kalam", "920.KAL", "12", "R2 · S3"],
              ["ACC-00088", "Physics NCERT XI", "NCERT", "530.NCE", "80", "R4 · S1"],
              ["ACC-00142", "Malgudi Days", "R K Narayan", "823.NAR", "6", "R2 · S1"],
            ],
      content: <LibraryCatalog initialBooks={books} />,
      primaryAction: "Add title",
      emptyHint: books.length === 0 ? "No books yet — use the form to add your first title." : undefined,
    },
    members: {
      title: "Members",
      columns: ["Card #", "Name", "Type", "Limit", "Issued", "Fines"],
      rows: [
        ["LIB-1042", "Aarav Kumar", "Student · IX-B", "3", "1", "—"],
        ["LIB-EMP-031", "Anita Rao", "Staff · Maths", "6", "2", "—"],
        ["LIB-0991", "Diya Patel", "Student · X-A", "3", "2", "—"],
      ],
      primaryAction: "New member",
    },
    acquisitions: {
      title: "Acquisitions",
      columns: ["PO #", "Vendor", "Titles", "Copies", "Value", "Status"],
      rows: [
        ["PO-2026-14", "Rupa Books", "12", "84", "₹42,600", "Pending"],
        ["PO-2026-13", "OUP", "6", "48", "₹28,200", "Delivered"],
      ],
      primaryAction: "New PO",
    },
    overdue: {
      title: "Overdue (18)",
      ai: "12 of the 18 overdue books belong to 4 members with recurring returns. Consider a short suspension for 2 of them.",
      columns: ["Member", "Book", "Due", "Days late", "Fine"],
      rows: [
        ["Meera Nair", "Malgudi Days", "12 Jul", "3", "₹15"],
        ["Aarav Kumar", "Physics NCERT", "10 Jul", "5", "₹25"],
        ["Yash V.", "Chemistry NCERT", "05 Jul", "10", "₹50"],
      ],
    },
    reports: {
      title: "Circulation Report",
      columns: ["Week", "Issues", "Returns", "Reservations", "New members"],
      rows: [
        ["Wk 28", "924", "886", "42", "18"],
        ["Wk 27", "812", "802", "38", "12"],
        ["Wk 26", "780", "770", "31", "9"],
      ],
    },
    popular: {
      title: "Most popular titles",
      columns: ["Title", "Issues (90d)", "Avg. wait", "Copies"],
      rows: [
        ["Harry Potter I", "72", "4d", "10"],
        ["Wings of Fire", "68", "3d", "12"],
        ["Discovery of India", "42", "9d", "8"],
      ],
    },
    dormant: {
      title: "Dormant members",
      columns: ["Member", "Class", "Last issue", "Days idle"],
      rows: [
        ["Priya S.", "XI-A", "12 Feb", "154"],
        ["Rehan K.", "VII-B", "28 Mar", "109"],
      ],
    },
    "cfg-rules": {
      title: "Membership rules",
      columns: ["Type", "Max books", "Loan (days)", "Renewals", "Reservation cap"],
      rows: [
        ["Student · Primary", "2", "10", "1", "1"],
        ["Student · Secondary", "3", "14", "2", "2"],
        ["Staff · Teacher", "6", "30", "2", "3"],
        ["Staff · Admin", "3", "21", "1", "1"],
      ],
      primaryAction: "Edit rule",
    },
    "cfg-fines": {
      title: "Fine slabs",
      columns: ["Days late", "Per day", "Cap"],
      rows: [
        ["1 – 7", "₹5", "₹35"],
        ["8 – 21", "₹10", "₹140"],
        ["22+", "₹20", "Book price"],
      ],
    },
    "cfg-classification": {
      title: "DDC Classification",
      columns: ["Class", "Range", "Titles"],
      rows: [
        ["000 · General", "000–099", "142"],
        ["500 · Science", "500–599", "1,204"],
        ["800 · Literature", "800–899", "982"],
        ["900 · History", "900–999", "384"],
      ],
    },
  };
}

export function LibraryWorkspace({ initialBooks }: Props) {
  const flows = buildFlows(initialBooks);
  const availableCount = initialBooks.filter((b) => b.status === "available").length;

  return (
    <ModuleShell
      title="Library"
      subtitle={
        initialBooks.length > 0
          ? `${initialBooks.length} titles · ${availableCount} available · circulation & fines`
          : "Catalog · circulation · reservations · fines and acquisitions."
      }
      rail={rail}
      flows={flows}
      defaultFlow="dashboard"
    />
  );
}
