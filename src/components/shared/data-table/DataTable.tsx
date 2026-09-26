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
import { DataTableToolbar } from "./DataTableToolbar";
import { DataTablePagination } from "./DataTablePagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactElement;
  actionSlot?: React.ReactNode;
  isLoading?: boolean;
  hideToolbar?: boolean;
  
  // Pagination object 
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPage?: number;
  };
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  itemName?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder,
  renderSubComponent,
  actionSlot,
  isLoading = false,
  hideToolbar = false,
  pagination,
  onPageChange,
  onLimitChange,
  itemName = "items",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const isServerPagination = !!onPageChange;

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
    getRowCanExpand: () => !!renderSubComponent,
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

  // Pagination parameters logic
  const currentPage = isServerPagination
    ? pagination?.page || 1
    : table.getState().pagination.pageIndex + 1;
    
  const currentLimit = isServerPagination
    ? pagination?.limit || 10
    : table.getState().pagination.pageSize;
    
  const totalCount = isServerPagination
    ? pagination?.total || 0
    : table.getFilteredRowModel().rows.length;
    
  const totalPagesCount = isServerPagination
    ? pagination?.totalPage || Math.ceil(totalCount / currentLimit)
    : table.getPageCount();

  const startRecord = (currentPage - 1) * currentLimit + (totalCount > 0 ? 1 : 0);
  const endRecord = Math.min(currentPage * currentLimit, totalCount);

  // Dynamic pagination numbers logic
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPagesCount <= 5) {
      for (let i = 1; i <= totalPagesCount; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPagesCount);
      } else if (currentPage >= totalPagesCount - 2) {
        pages.push(
          1,
          "...",
          totalPagesCount - 3,
          totalPagesCount - 2,
          totalPagesCount - 1,
          totalPagesCount
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPagesCount
        );
      }
    }
    return pages;
  };

  const handlePageClick = (page: number) => {
    if (page < 1 || page > totalPagesCount) return;
    if (isServerPagination && onPageChange) {
      onPageChange(page);
    } else {
      table.setPageIndex(page - 1);
    }
  };

  const handleLimitSelect = (value: string) => {
    const newLimit = parseInt(value, 10);
    if (isServerPagination && onLimitChange) {
      onLimitChange(newLimit);
    } else {
      table.setPageSize(newLimit);
    }
  };

  return (
    <div className="space-y-4">
      {!hideToolbar && (
        <DataTableToolbar 
          table={table} 
          searchKey={searchKey} 
          searchPlaceholder={searchPlaceholder}
          actionSlot={actionSlot} 
        />
      )}

      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-gray-100 hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-11 text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: currentLimit }).map((_, i) => (
                <TableRow key={i} className="border-gray-50">
                  {columns.map((_, j) => (
                    <TableCell key={j} className="py-4">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    className="border-gray-50 hover:bg-gray-50/50 transition-colors group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && renderSubComponent && (
                    <TableRow className="bg-gray-50/30">
                      <TableCell colSpan={row.getVisibleCells().length}>
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
                  className="h-32 text-center text-sm text-gray-500"
                >
                  No {itemName} found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        startRecord={startRecord}
        endRecord={endRecord}
        totalCount={totalCount}
        currentLimit={currentLimit}
        currentPage={currentPage}
        totalPagesCount={totalPagesCount}
        pageNumbers={getPageNumbers()}
        isLoading={isLoading}
        handleLimitSelect={handleLimitSelect}
        handlePageClick={handlePageClick}
        itemName={itemName}
      />
    </div>
  );
}
