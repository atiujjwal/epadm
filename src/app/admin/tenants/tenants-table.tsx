"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
          <Badge variant="outline">{info.getValue()}</Badge>
        ),
      }),
      columnHelper.accessor("isActive", {
        header: "Status",
        cell: (info) => (
          <Badge variant={info.getValue() ? "success" : "error"}>
            {info.getValue() ? "Active" : "Inactive"}
          </Badge>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Link
            href={`/admin/tenants/${row.original.id}`}
            className="text-sm font-medium text-indigo-700 hover:text-indigo-800"
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
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by name or slug"
          className="min-w-[240px] flex-1"
        />
        <Button
          type="button"
          onClick={runSearch}
          disabled={loading}
          variant="primary"
        >
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      <Table variant="spacious" striped hoverable>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="font-semibold">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
