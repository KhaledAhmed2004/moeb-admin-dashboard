"use client";

import React, { ReactNode } from "react";
import { Search, Download, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { CustomInput } from "@/components/shared/CustomInput";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomSelect, CustomSelectOption } from "@/components/shared/CustomSelect";

import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T, index: number) => ReactNode;
  className?: string;
}

export interface StatusOption {
  label: string;
  value: string;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data?: T[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  statusFilter?: string;
  statusOptions?: StatusOption[];
  onStatusChange?: (value: string | undefined) => void;
  onExport?: () => void;
  actionSlot?: ReactNode;
  extraFilters?: ReactNode;
  emptyMessage?: string;
  // Pagination
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  keyExtractor?: (item: T, index: number) => string | number;
}

export function DataTable<T>({
  columns,
  data = [],
  isLoading = false,
  searchPlaceholder = "Search...",
  searchTerm = "",
  onSearchChange,
  statusFilter,
  statusOptions = [],
  onStatusChange,
  onExport,
  actionSlot,
  extraFilters,
  emptyMessage = "No items found.",
  currentPage = 1,
  totalPages = 1,
  totalItems,
  onPageChange,
  keyExtractor,
}: DataTableProps<T>) {
  return (
    <div className="space-y-4">
      {/* Search, Filter & Actions Toolbar */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {onSearchChange && (
            <div className="relative w-full sm:w-[300px]">
              <CustomInput
                icon={Search}
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          )}

          {statusOptions.length > 0 && onStatusChange && (
            <CustomSelect
              options={[
                { label: "All Status", value: "ALL" },
                ...statusOptions,
              ]}
              value={statusFilter || "ALL"}
              onChange={(val) => onStatusChange(val === "ALL" ? undefined : val)}
              placeholder="Filter by Status"
            />
          )}

          {extraFilters}
        </div>

        <div className="flex items-center gap-3 self-end xl:self-auto flex-wrap">
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="h-10 gap-2 border-gray-200 bg-white"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          )}
          {actionSlot}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-gray-200/80 bg-white shadow-xs overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/90 hover:bg-gray-50/90 dark:bg-zinc-800/60 border-b border-gray-200/80 dark:border-zinc-700">
              {columns.map((col, idx) => (
                <TableHead
                  key={idx}
                  className={cn("px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider dark:text-zinc-400", col.className)}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-200/70 dark:divide-zinc-800">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <TableRow key={`skeleton-${rIdx}`} className="border-b border-gray-200/70 dark:border-zinc-800">
                  {columns.map((_, cIdx) => (
                    <TableCell key={`skeleton-${rIdx}-${cIdx}`} className="px-6 py-5">
                      <Skeleton className="h-5 w-full rounded-md" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground px-6 py-8"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rIdx) => {
                const key = keyExtractor ? keyExtractor(row, rIdx) : (row as unknown as { _id?: string; id?: string })._id || (row as unknown as { _id?: string; id?: string }).id || rIdx;
                return (
                  <TableRow key={key} className="hover:bg-gray-50/60 transition-colors border-b border-gray-200/70 dark:border-zinc-800/80">
                    {columns.map((col, cIdx) => (
                      <TableCell key={cIdx} className={cn("px-6 py-4.5 align-middle text-sm text-gray-700 dark:text-zinc-300", col.className)}>
                        {col.cell
                          ? col.cell(row, rIdx)
                          : col.accessorKey
                          ? String(row[col.accessorKey] ?? "-")
                          : null}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Bar */}
      {onPageChange && (totalPages >= 1) && (
        <div className="flex items-center justify-between px-2 py-2 text-sm">
          <div className="text-muted-foreground">
            {totalItems !== undefined
              ? `Showing page ${currentPage} of ${totalPages} (${totalItems} total items)`
              : `Page ${currentPage} of ${totalPages}`}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium px-2">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
