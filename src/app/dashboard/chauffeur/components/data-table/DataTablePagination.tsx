import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps {
  startRecord: number;
  endRecord: number;
  totalCount: number;
  currentLimit: number;
  currentPage: number;
  totalPagesCount: number;
  pageNumbers: (number | string)[];
  isLoading: boolean;
  handleLimitSelect: (value: string) => void;
  handlePageClick: (page: number) => void;
  itemName?: string;
}

export function DataTablePagination({
  startRecord,
  endRecord,
  totalCount,
  currentLimit,
  currentPage,
  totalPagesCount,
  pageNumbers,
  isLoading,
  handleLimitSelect,
  handlePageClick,
  itemName = "records",
}: DataTablePaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 text-xs">
      {/* Left Side: Summary & Page Size Selector */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-gray-600 font-medium">
          Showing <strong className="text-gray-900">{startRecord}</strong> to{" "}
          <strong className="text-gray-900">{endRecord}</strong> of{" "}
          <strong className="text-gray-900">{totalCount}</strong> {itemName}
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
  );
}
