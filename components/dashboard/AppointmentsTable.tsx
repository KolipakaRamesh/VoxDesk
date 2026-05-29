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
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { formatAppointmentDateTime, formatDateTime, truncate, statusToBadge } from '@/lib/utils';
import type { Appointment } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AppointmentsTableProps {
  data: Appointment[];
}

const columns: ColumnDef<Appointment>[] = [
  {
    accessorKey: 'name',
    header: 'Customer',
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-foreground">{row.original.name}</p>
        <p className="text-xs font-mono text-muted-foreground">{row.original.phone}</p>
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ getValue }) => {
      const email = getValue() as string | null;
      return email ? (
        <span className="text-sm text-muted-foreground">{email}</span>
      ) : (
        <span className="text-xs text-muted-foreground/40">—</span>
      );
    },
  },
  {
    accessorKey: 'appointment_date',
    header: 'Date & Time',
    cell: ({ row }) => (
      <span className="text-sm text-foreground whitespace-nowrap">
        {formatAppointmentDateTime(row.original.appointment_date, row.original.appointment_time)}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return (
        <StatusBadge
          label={status.charAt(0).toUpperCase() + status.slice(1)}
          variant={statusToBadge(status)}
        />
      );
    },
  },
  {
    accessorKey: 'cancellation_reason',
    header: 'Reason',
    cell: ({ getValue }) => {
      const reason = getValue() as string | null;
      return reason ? (
        <span className="text-xs text-muted-foreground" title={reason}>
          {truncate(reason, 50)}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground/40">—</span>
      );
    },
  },
  {
    accessorKey: 'calendar_event_id',
    header: 'Calendar',
    cell: ({ getValue }) => {
      const id = getValue() as string | null;
      return id ? (
        <span className="font-mono text-xs text-muted-foreground">{truncate(id, 18)}</span>
      ) : (
        <span className="text-xs text-muted-foreground/40">—</span>
      );
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {formatDateTime(getValue() as string)}
      </span>
    ),
  },
];

export function AppointmentsTable({ data }: AppointmentsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'appointment_date', desc: true },
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
          placeholder="Search by name, phone, email…"
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
