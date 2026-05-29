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
  ChevronDown as ExpandIcon,
  AlertCircle,
} from 'lucide-react';
import { formatDateTime, truncate, errorTypeToBadge } from '@/lib/utils';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import type { ErrorLog } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ErrorLogsTableProps {
  data: ErrorLog[];
}

const columns: ColumnDef<ErrorLog>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-muted-foreground">#{getValue() as number}</span>
    ),
  },
  {
    accessorKey: 'error_type',
    header: 'Error Type',
    cell: ({ getValue }) => {
      const type = getValue() as string;
      return (
        <StatusBadge
          label={type}
          variant={errorTypeToBadge(type)}
        />
      );
    },
  },
  {
    accessorKey: 'error_message',
    header: 'Message',
    cell: ({ getValue }) => (
      <span className="text-sm text-foreground/80">
        {truncate((getValue() as string) ?? '', 70)}
      </span>
    ),
  },
  {
    accessorKey: 'created_at',
    header: 'Occurred At',
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {formatDateTime(getValue() as string)}
      </span>
    ),
  },
];

export function ErrorLogsTable({ data }: ErrorLogsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'created_at', desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

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
    initialState: { pagination: { pageSize: 20 } },
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by error type or message…"
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
                  {/* Details column header */}
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Details
                  </th>
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="py-16 text-center text-sm text-muted-foreground"
                  >
                    No workflow errors recorded. 🎉
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.flatMap((row) => {
                  const isExpanded = expandedRow === row.original.id;
                  const hasDetails = !!row.original.appointment_data;

                  return [
                    <tr
                      key={row.id}
                      className="table-row-hover border-b border-border/30 last:border-0"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                      {/* Expand button */}
                      <td className="px-4 py-3">
                        {hasDetails ? (
                          <button
                            onClick={() =>
                              setExpandedRow(isExpanded ? null : row.original.id)
                            }
                            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                          >
                            <ExpandIcon
                              className={cn(
                                'h-3 w-3 transition-transform',
                                isExpanded && 'rotate-180'
                              )}
                            />
                            {isExpanded ? 'Collapse' : 'View Data'}
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground/40">—</span>
                        )}
                      </td>
                    </tr>,

                    isExpanded && hasDetails && (
                      <tr key={`${row.id}-expanded`} className="bg-muted/10">
                        <td colSpan={columns.length + 1} className="px-4 pb-4 pt-2">
                          <div className="rounded-lg border border-rose-400/20 bg-rose-400/5 p-4">
                            <div className="mb-2 flex items-center gap-2">
                              <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
                              <p className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                                Appointment Data at Time of Error
                              </p>
                            </div>
                            <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-foreground/70">
                              {JSON.stringify(row.original.appointment_data, null, 2)}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    ),
                  ].filter(Boolean);
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {table.getFilteredRowModel().rows.length} total error(s)
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
