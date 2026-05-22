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
} from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { formatDateTime, formatDuration, truncate, statusToBadge } from '@/lib/utils';
import type { CallLog } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CallLogsTableProps {
  data: CallLog[];
}

const columns: ColumnDef<CallLog>[] = [
  {
    accessorKey: 'call_id',
    header: 'Call ID',
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {truncate(getValue() as string, 24)}
      </span>
    ),
  },
  {
    accessorKey: 'from_number',
    header: 'From',
    cell: ({ getValue }) => (
      <span className="font-mono text-sm text-foreground">
        {(getValue() as string) ?? '—'}
      </span>
    ),
  },
  {
    accessorKey: 'started_at',
    header: 'Start Time',
    cell: ({ getValue }) => {
      const v = getValue() as string | null;
      return <span className="text-sm">{v ? formatDateTime(v) : '—'}</span>;
    },
  },
  {
    accessorKey: 'duration_secs',
    header: 'Duration',
    cell: ({ getValue }) => (
      <span className="text-sm">{formatDuration(getValue() as number)}</span>
    ),
  },
  {
    accessorKey: 'outcome',
    header: 'Outcome',
    cell: ({ getValue }) => {
      const outcome = getValue() as string;
      return (
        <StatusBadge
          label={outcome.replace(/_/g, ' ')}
          variant={statusToBadge(outcome)}
        />
      );
    },
  },
  {
    accessorKey: 'transcript',
    header: 'Transcript',
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground">
        {truncate((getValue() as string) ?? '', 60)}
      </span>
    ),
  },
];

export function CallLogsTable({ data }: CallLogsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'started_at', desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

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
          placeholder="Search by number, outcome…"
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
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Full Log
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
                    No call logs found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.flatMap((row) => {
                  const isExpanded = expandedRow === row.id;
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
                      <td className="px-4 py-3">
                        {row.original.transcript && (
                          <button
                            onClick={() =>
                              setExpandedRow(isExpanded ? null : row.id)
                            }
                            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                          >
                            <ExpandIcon
                              className={cn(
                                'h-3 w-3 transition-transform',
                                isExpanded && 'rotate-180'
                              )}
                            />
                            {isExpanded ? 'Collapse' : 'Expand'}
                          </button>
                        )}
                      </td>
                    </tr>,
                    isExpanded && (
                      <tr key={`${row.id}-expanded`} className="bg-muted/10">
                        <td colSpan={columns.length + 1} className="px-4 pb-4 pt-2">
                          <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Full Transcript
                            </p>
                            <p className="whitespace-pre-wrap font-mono text-xs text-foreground/80">
                              {row.original.transcript}
                            </p>
                            {row.original.error_message && (
                              <div className="mt-3 rounded-md bg-rose-400/10 p-3">
                                <p className="text-xs font-semibold text-rose-400">Error</p>
                                <p className="mt-1 text-xs text-rose-300">
                                  {row.original.error_message}
                                </p>
                              </div>
                            )}
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
            {table.getFilteredRowModel().rows.length} total call(s)
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
