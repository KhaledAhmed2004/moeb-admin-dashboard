"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  ExpandedState,
  useReactTable,
  Row,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTableToolbar } from "./components/data-table/DataTableToolbar";
import { DataTablePagination } from "./components/data-table/DataTablePagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactElement;
  actionSlot?: React.ReactNode;
  isLoading?: boolean;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  renderSubComponent,
  actionSlot,
  isLoading = false,
  page: serverPage,
  limit: serverLimit,
  total: serverTotal,
  totalPages: serverTotalPages,
  onPageChange,
  onLimitChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const isServerPagination = typeof onPageChange === "function";

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(isServerPagination
      ? {}
      : {
          getPaginationRowModel: getPaginationRowModel(),
        }),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onExpandedChange: setExpanded,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      expanded,
    },
  });

  // Pagination parameters
  const currentPage = isServerPagination
    ? serverPage || 1
    : table.getState().pagination.pageIndex + 1;
  const currentLimit = isServerPagination
    ? serverLimit || 10
    : table.getState().pagination.pageSize;
  const totalCount = isServerPagination
    ? serverTotal ?? data.length
    : table.getFilteredRowModel().rows.length;
  const totalPagesCount = isServerPagination
    ? serverTotalPages || Math.ceil(totalCount / currentLimit) || 1
    : table.getPageCount() || 1;

  const startRecord =
    totalCount === 0 ? 0 : (currentPage - 1) * currentLimit + 1;
  const endRecord = Math.min(currentPage * currentLimit, totalCount);

  const handlePageClick = (p: number) => {
    if (p < 1 || p > totalPagesCount || p === currentPage) return;
    if (isServerPagination && onPageChange) {
      onPageChange(p);
    } else {
      table.setPageIndex(p - 1);
    }
  };

  const handleLimitSelect = (newLimStr: string) => {
    const newLim = Number(newLimStr);
    if (isServerPagination && onLimitChange) {
      onLimitChange(newLim);
    } else {
      table.setPageSize(newLim);
    }
  };

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPagesCount <= 7) {
      for (let i = 1; i <= totalPagesCount; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push("...");
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPagesCount - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      if (currentPage < totalPagesCount - 2) {
        pages.push("...");
      }
      if (!pages.includes(totalPagesCount)) {
        pages.push(totalPagesCount);
      }
    }
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="w-full space-y-4">
      {/* Top Search & Column Controls Bar */}
      <DataTableToolbar
        table={table}
        searchKey={searchKey}
        actionSlot={actionSlot}
      />

      {/* Main Table */}
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-zinc-50/80">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={`text-xs font-bold text-gray-700 py-3.5 ${
                        header.column.id === "expander"
                          ? "w-[40px] px-2 text-center"
                          : ""
                      }`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, colIdx) => (
                    <TableCell key={colIdx} className="py-4">
                      <Skeleton className="h-5 w-full max-w-[120px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-zinc-50/60 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={`py-3.5 ${
                          cell.column.id === "expander"
                            ? "w-[40px] px-2 text-center"
                            : ""
                        }`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && renderSubComponent && (
                    <TableRow className="bg-zinc-50/80 hover:bg-zinc-50/80 border-t border-b">
                      <TableCell
                        colSpan={row.getVisibleCells().length}
                        className="p-0"
                      >
                        {renderSubComponent({ row })}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-28 text-center text-xs text-gray-400 font-medium"
                >
                  No chauffeurs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Interactive Pagination Footer */}
      <DataTablePagination
        startRecord={startRecord}
        endRecord={endRecord}
        totalCount={totalCount}
        currentLimit={currentLimit}
        currentPage={currentPage}
        totalPagesCount={totalPagesCount}
        pageNumbers={pageNumbers}
        isLoading={isLoading}
        handleLimitSelect={handleLimitSelect}
        handlePageClick={handlePageClick}
      />
    </div>
  );
}
