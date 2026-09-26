"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VehicleConfig } from "../types";

export interface VehicleConfigTableActions {
  onView: (config: VehicleConfig) => void;
  onEdit: (config: VehicleConfig) => void;
}

export const getColumns = (
  actions: VehicleConfigTableActions
): ColumnDef<VehicleConfig>[] => [
  {
    accessorKey: "vehicleType",
    header: "Category & Type",
    cell: ({ row }) => {
      const config = row.original;
      return (
        <div className="flex items-center gap-3">
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
            {count} {count === 1 ? "Model" : "Models"}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const config = row.original;
      return (
        <div className="flex items-center justify-center gap-1">
          {/* View Details */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              actions.onView(config);
            }}
            className="text-zinc-400 hover:text-blue-600 hover:bg-blue-50 transition-colors p-2 rounded-lg inline-flex items-center justify-center cursor-pointer"
            title="View Configuration Details"
          >
            <Eye size={15} />
          </button>

          {/* Edit Dialog */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              actions.onEdit(config);
            }}
            className="text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors p-2 rounded-lg inline-flex items-center justify-center cursor-pointer"
            title="Edit Configuration"
          >
            <Pencil size={15} />
          </button>
        </div>
      );
    },
  },
];
