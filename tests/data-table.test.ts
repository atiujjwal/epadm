import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/students",
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

import { DataTable, type DataTableProps } from "@/components/ui/data-table";

type Row = { id: string; name: string };

const baseProps: DataTableProps<Row> = {
  data: [],
  columns: [
    { key: "name", header: "Name", cell: (row) => row.name },
  ],
  getRowId: (row) => row.id,
};

function render(props: Partial<DataTableProps<Row>>) {
  return renderToStaticMarkup(
    React.createElement(DataTable<Row>, { ...baseProps, ...props }),
  );
}

describe("DataTable states", () => {
  it("renders the error state with its correlation id", () => {
    const html = render({ error: "Could not load students", errorCorrelationId: "req-123" });
    expect(html).toContain("Something went wrong");
    expect(html).toContain("req-123");
  });

  it("renders the loading skeleton state", () => {
    const html = render({ isLoading: true });
    expect(html).toContain('aria-label="Loading data"');
    expect(html).toContain('aria-busy="true"');
  });

  it("renders the empty state", () => {
    const html = render({ emptyTitle: "No students yet" });
    expect(html).toContain("No students yet");
  });

  it("renders the filtered no-results state", () => {
    const html = render({ hasActiveFilters: true, onClearFilters: vi.fn() });
    expect(html).toContain("No results for your current filters");
    expect(html).toContain("Clear all filters");
  });

  it("renders the data state", () => {
    const html = render({ data: [{ id: "1", name: "Ada Lovelace" }] });
    expect(html).toContain("Name");
    expect(html).toContain("Ada Lovelace");
  });
});
