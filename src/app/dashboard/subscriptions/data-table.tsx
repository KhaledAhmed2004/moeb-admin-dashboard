"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { ISubscriptionPagination } from "@/types/subscription";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  pagination?: ISubscriptionPagination;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  emptyMessage?: string;
}

export function SubscriptionDataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  pagination,
  onPageChange,
  onLimitChange,
  emptyMessage = "No subscribers found.",
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPage ?? 1;
  const totalItems = pagination?.total ?? data.length;
  const currentLimit = pagination?.limit ?? 10;

  return (
    <div className="w-full space-y-4">
      {/* Table Container */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50/80">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-11 text-[11px] font-bold uppercase tracking-wider text-zinc-600 px-4"
                  >
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
            {isLoading ? (
              // Skeleton loading rows
              Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {columns.map((_, colIndex) => (
                    <TableCell
                      key={`cell-${index}-${colIndex}`}
                      className="px-4 py-3.5"
                    >
                      <Skeleton className="h-5 w-full rounded-md" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-zinc-50/80 transition-colors border-b border-zinc-100 last:border-b-0"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3 text-xs">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-44 text-center text-xs text-zinc-500 font-medium"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="p-3 bg-zinc-100 rounded-full text-zinc-400">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <p className="text-zinc-600 font-semibold">
                      {emptyMessage}
                    </p>
                    <p className="text-[11px] text-zinc-400 max-w-sm">
                      Try selecting a different filter or search query to find
                      subscription records.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 px-1">
        <div className="flex items-center gap-2">
          <span>
            Showing{" "}
            <strong className="text-zinc-900 font-bold">{data.length}</strong>{" "}
            of <strong className="text-zinc-900 font-bold">{totalItems}</strong>{" "}
            subscribers
          </span>
          {onLimitChange && (
            <div className="flex items-center gap-1.5 ml-4">
              <span className="text-zinc-400">Rows:</span>
              <Select
                value={String(currentLimit)}
                onValueChange={(val) => onLimitChange(Number(val))}
              >
                <SelectTrigger className="h-7 w-[68px] text-xs rounded-lg border-zinc-200">
                  <SelectValue placeholder={String(currentLimit)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-600 font-medium">
            Page {currentPage} of {totalPages || 1}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
              className="h-8 px-2.5 text-xs rounded-xl bg-white border-zinc-200 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
              className="h-8 px-2.5 text-xs rounded-xl bg-white border-zinc-200 cursor-pointer disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
