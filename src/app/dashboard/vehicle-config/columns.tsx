"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronRight, Eye, Pencil, Trash2, Car, Palette, Calendar, Layers, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { VehicleConfig } from "./types";
import { VehicleConfigDetailModal } from "./VehicleConfigDetailModal";
import { VehicleConfigModal } from "./VehicleConfigModal";

interface ActionCellProps {
  config: VehicleConfig;
}

const ActionCell = ({ config }: ActionCellProps) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/vehicle-configs/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Vehicle configuration deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["vehicle-configs"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-configs-options"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete vehicle configuration"
      );
    },
  });

  const configId = config._id || config.id || "";

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

      {/* Delete Dialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className="text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors p-2 rounded-lg inline-flex items-center justify-center cursor-pointer"
            title="Delete Configuration"
            disabled={deleteMutation.isPending}
          >
            <Trash2 size={15} />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {config.vehicleType} Configuration?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the configuration for <strong>{config.vehicleType}</strong>.
              Chauffeurs will no longer be able to register vehicles under this category until it is re-created.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate(configId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 size={14} className="animate-spin mr-1.5" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1.5" />
              )}
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
            <p className="text-[11px] text-gray-400 font-mono mt-0.5">
              #{config._id?.slice(-6)?.toUpperCase() || "CONFIG"}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "maxAge",
    header: "Max Age Allowed",
    cell: ({ row }) => {
      const age = row.original.maxAge ?? 5;
      const minYear = new Date().getFullYear() - age;
      return (
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
            <Calendar size={12} className="text-gray-500" />
            Max {age} {age === 1 ? "Year" : "Years"}
          </div>
          <p className="text-[10px] text-gray-400 font-medium">
            Year &ge; {minYear}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "allowedColors",
    header: "Allowed Colors",
    cell: ({ row }) => {
      const colors = row.original.allowedColors || [];
      return (
        <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
          {colors.map((color, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-50 text-zinc-700 border border-zinc-200/80"
            >
              {color}
            </span>
          ))}
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
          <span
            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              isActive ? "bg-emerald-500" : "bg-gray-400"
            }`}
          />
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
