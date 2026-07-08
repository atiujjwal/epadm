"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type TenantRow = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  subscriptionTier: string;
  createdAt: string;
};

const columnHelper = createColumnHelper<TenantRow>();

export function TenantsTable({ initialRows }: { initialRows: TenantRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "School",
        cell: (info) => (
          <div>
            <div className="font-medium text-zinc-950">{info.getValue()}</div>
            <div className="text-xs text-zinc-500">{info.row.original.slug}</div>
          </div>
        ),
      }),
      columnHelper.accessor("subscriptionTier", {
        header: "Plan",
        cell: (info) => (
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium uppercase text-zinc-800">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("isActive", {
        header: "Status",
        cell: (info) => (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              info.getValue()
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {info.getValue() ? "Active" : "Inactive"}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Link
            href={`/admin/tenants/${row.original.id}`}
            className="text-sm font-medium text-amber-700 hover:text-amber-800"
          >
            Manage
          </Link>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  async function runSearch() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) {
        params.set("search", search);
      }
      const res = await fetch(`/api/platform/tenants?${params.toString()}`);
      const data = await res.json();
      setRows(data.tenants ?? []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by name or slug"
          className="min-w-[240px] flex-1 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm placeholder:text-zinc-500"
        />
        <button
          type="button"
          onClick={runSearch}
          disabled={loading}
          className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-[0.12em] text-zinc-700 font-semibold">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 font-medium">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t border-zinc-100">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-4 align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
