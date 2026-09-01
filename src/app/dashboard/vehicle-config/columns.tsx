"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronRight, Eye, Pencil, Car, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VehicleConfig } from "./types";
import { VehicleConfigDetailModal } from "./VehicleConfigDetailModal";
import { VehicleConfigModal } from "./VehicleConfigModal";

interface ActionCellProps {
  config: VehicleConfig;
}

const ActionCell = ({ config }: ActionCellProps) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <div className="flex items-center justify-center gap-1">
      {/* View Details */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsDetailOpen(true);
        }}
        className="text-zinc-400 hover:text-blue-600 hover:bg-blue-50 transition-colors p-2 rounded-lg inline-flex items-center justify-center cursor-pointer"
        title="View Configuration Details"
      >
        <Eye size={15} />
      </button>

      <VehicleConfigDetailModal
        config={config}
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onEdit={() => setIsEditOpen(true)}
      />

      {/* Edit Dialog */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsEditOpen(true);
        }}
        className="text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors p-2 rounded-lg inline-flex items-center justify-center cursor-pointer"
        title="Edit Configuration"
      >
        <Pencil size={15} />
      </button>

      <VehicleConfigModal
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        config={config}
      />
    </div>
  );
};

export const getColumns = (): ColumnDef<VehicleConfig>[] => [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      const isExpanded = row.getIsExpanded();
      return (
        <div className="w-8 flex items-center justify-center">
          <button
            type="button"
            className="p-1.5 rounded-md hover:bg-zinc-100 transition-colors cursor-pointer group"
            onClick={(e) => {
              e.stopPropagation();
              row.toggleExpanded();
            }}
            title={isExpanded ? "Collapse details" : "Expand models catalog"}
          >
            <ChevronRight
              className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ease-in-out ${
                isExpanded
                  ? "rotate-90 text-indigo-600 font-bold"
                  : "group-hover:text-zinc-600"
              }`}
            />
          </button>
        </div>
      );
    },
  },
  {
    accessorKey: "vehicleType",
    header: "Category & Type",
    cell: ({ row }) => {
      const config = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700">
            <Car size={18} />
          </div>
          <div>
            <p className="font-bold text-sm text-gray-900 leading-tight">
              {config.vehicleType}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "makesAndModels",
    header: "Supported Models",
    cell: ({ row }) => {
      const count = row.original.makesAndModels?.length || 0;
      return (
        <div className="flex items-center gap-1.5">
          <Badge
            variant="secondary"
            className="text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 transition-colors"
          >
            <Layers size={12} className="mr-1" />
            {count} {count === 1 ? "Model" : "Models"}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = (row.original.status || "ACTIVE").toUpperCase();
      const isActive = status === "ACTIVE";
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            isActive
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-gray-100 text-gray-600 border border-gray-200"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => <ActionCell config={row.original} />,
  },
];
