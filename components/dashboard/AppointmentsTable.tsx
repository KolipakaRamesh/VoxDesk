'use client';

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { formatDateTime, truncate, statusToBadge } from '@/lib/utils';
import type { Appointment } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AppointmentsTableProps {
  data: Appointment[];
}

const columns: ColumnDef<Appointment>[] = [
  {
    accessorKey: 'customer_name',
    header: 'Customer',
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-foreground">{row.original.customer_name}</p>
        <p className="text-xs font-mono text-muted-foreground">{row.original.customer_phone}</p>
      </div>
    ),
  },
  {
    accessorKey: 'service_type',
    header: 'Service',
    cell: ({ getValue }) => (
      <span className="rounded-md bg-accent/50 px-2 py-0.5 text-xs font-medium text-accent-foreground">
        {getValue() as string}
      </span>
    ),
  },
  {
    accessorKey: 'start_time',
    header: 'Date & Time',
    cell: ({ getValue }) => (
      <span className="text-sm text-foreground">
        {formatDateTime(getValue() as string)}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return <StatusBadge label={status} variant={statusToBadge(status)} />;
    },
  },
  {
    accessorKey: 'google_event_id',
    header: 'Calendar Event',
    cell: ({ getValue }) => {
      const id = getValue() as string | null;
      return id ? (
        <span className="font-mono text-xs text-muted-foreground">{truncate(id, 20)}</span>
      ) : (
        <span className="text-xs text-muted-foreground/50">—</span>
      );
    },
  },
  {
    accessorKey: 'notes',
    header: 'Notes',
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground">
        {truncate((getValue() as string) ?? '', 40)}
      </span>
    ),
  },
];

export function AppointmentsTable({ data }: AppointmentsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'start_time', desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search appointments…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full rounded-lg border border-border bg-muted/30 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-border/60">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={cn(
                        'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground',
                        header.column.getCanSort() && 'cursor-pointer select-none hover:text-foreground'
                      )}
                    >
                      <span className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && <ChevronUp className="h-3 w-3" />}
                        {header.column.getIsSorted() === 'desc' && <ChevronDown className="h-3 w-3" />}
                        {header.column.getCanSort() && !header.column.getIsSorted() && (
                          <ChevronsUpDown className="h-3 w-3 opacity-30" />
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center text-sm text-muted-foreground">
                    No appointments found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="table-row-hover border-b border-border/30 last:border-0">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {table.getFilteredRowModel().rows.length} total record(s)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount() || 1}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
