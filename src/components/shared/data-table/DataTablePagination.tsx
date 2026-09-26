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
          className="h-8 rounded-lg bg-white border-gray-200 text-gray-600 hover:bg-gray-50 gap-1 px-3"
        >
          <ChevronLeft size={14} />
          <span>Prev</span>
        </Button>

        {/* Dynamic Page Numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {pageNumbers.map((pageNum, index) => {
            if (pageNum === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-gray-400 font-medium"
                >
                  ...
                </span>
              );
            }

            const num = pageNum as number;
            const isCurrent = num === currentPage;

            return (
              <Button
                key={num}
                variant={isCurrent ? "default" : "outline"}
                size="icon"
                onClick={() => handlePageClick(num)}
                disabled={isLoading}
                className={`h-8 w-8 rounded-lg ${
                  isCurrent
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white border-transparent"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {num}
              </Button>
            );
          })}
        </div>

        {/* Next Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPagesCount || totalPagesCount === 0 || isLoading}
          className="h-8 rounded-lg bg-white border-gray-200 text-gray-600 hover:bg-gray-50 gap-1 px-3"
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </Button>

        {/* Last Page */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageClick(totalPagesCount)}
          disabled={currentPage === totalPagesCount || totalPagesCount === 0 || isLoading}
          className="h-8 w-8 rounded-lg bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          title="Last Page"
        >
          <ChevronsRight size={14} />
        </Button>
      </div>
    </div>
  );
}
