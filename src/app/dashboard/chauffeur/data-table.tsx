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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {searchKey && (
          <div className="relative max-w-sm w-full">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              placeholder={`Search ${searchKey}...`}
              value={
                (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              className="pl-9 h-10 text-xs bg-white rounded-xl border-gray-200"
            />
          </div>
        )}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-10 text-xs font-semibold rounded-xl bg-white border-gray-200"
              >
                Columns <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize text-xs"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          {actionSlot && <div>{actionSlot}</div>}
        </div>
      </div>

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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 text-xs">
        {/* Left Side: Summary & Page Size Selector */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-gray-600 font-medium">
            Showing <strong className="text-gray-900">{startRecord}</strong> to{" "}
            <strong className="text-gray-900">{endRecord}</strong> of{" "}
            <strong className="text-gray-900">{totalCount}</strong> chauffeurs
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">Rows per page:</span>
            <Select
              value={String(currentLimit)}
              onValueChange={handleLimitSelect}
            >
              <SelectTrigger className="h-8 w-16 text-xs bg-white rounded-lg border-gray-200">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5" className="text-xs">
                  5
                </SelectItem>
                <SelectItem value="10" className="text-xs">
                  10
                </SelectItem>
                <SelectItem value="20" className="text-xs">
                  20
                </SelectItem>
                <SelectItem value="50" className="text-xs">
                  50
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right Side: Page Navigation Buttons */}
        <div className="flex items-center gap-1">
          {/* First Page */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageClick(1)}
            disabled={currentPage === 1 || isLoading}
            className="h-8 w-8 rounded-lg bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            title="First Page"
          >
            <ChevronsLeft size={14} />
          </Button>

          {/* Previous Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className="h-8 px-2.5 rounded-lg bg-white border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold gap-1"
          >
            <ChevronLeft size={14} />
            Prev
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1 mx-1">
            {pageNumbers.map((p, idx) => {
              if (p === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-1.5 text-xs text-gray-400 font-bold"
                  >
                    ...
                  </span>
                );
              }
              const pageNum = Number(p);
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => handlePageClick(pageNum)}
                  disabled={isLoading}
                  className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary text-white shadow-xs"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage >= totalPagesCount || isLoading}
            className="h-8 px-2.5 rounded-lg bg-white border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold gap-1"
          >
            Next
            <ChevronRight size={14} />
          </Button>

          {/* Last Page */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageClick(totalPagesCount)}
            disabled={currentPage >= totalPagesCount || isLoading}
            className="h-8 w-8 rounded-lg bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            title="Last Page"
          >
            <ChevronsRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
