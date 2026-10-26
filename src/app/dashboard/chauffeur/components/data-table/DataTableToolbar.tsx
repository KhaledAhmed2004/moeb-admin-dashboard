import React from "react";
import { Table } from "@tanstack/react-table";
import { Search, ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchKey?: string;
  searchPlaceholder?: string;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  actionSlot?: React.ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder,
  searchTerm,
  onSearchChange,
  actionSlot,
}: DataTableToolbarProps<TData>) {
  const isServerSearch = typeof onSearchChange === "function";
  const searchValue = isServerSearch
    ? (searchTerm ?? "")
    : searchKey
    ? ((table.getColumn(searchKey)?.getFilterValue() as string) ?? "")
    : "";

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    if (isServerSearch) {
      onSearchChange(val);
    } else if (searchKey) {
      table.getColumn(searchKey)?.setFilterValue(val);
    }
  };

  const handleClear = () => {
    if (isServerSearch) {
      onSearchChange("");
    } else if (searchKey) {
      table.getColumn(searchKey)?.setFilterValue("");
    }
  };

  const placeholderText =
    searchPlaceholder || (searchKey ? `Search ${searchKey}...` : "Search...");

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {(searchKey || isServerSearch) && (
        <div className="relative max-w-sm w-full">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder={placeholderText}
            value={searchValue}
            onChange={handleInputChange}
            className="pl-9 pr-8 h-10 text-xs bg-white rounded-xl border-gray-200"
          />
          {searchValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded cursor-pointer"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
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
  );
}
