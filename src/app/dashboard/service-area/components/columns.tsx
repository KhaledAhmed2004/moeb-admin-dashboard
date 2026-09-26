import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { ServiceArea } from "../types";
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

export interface ServiceAreaTableActions {
  onEdit: (area: ServiceArea) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export const getServiceAreaColumns = (
  actions: ServiceAreaTableActions
): ColumnDef<ServiceArea>[] => [
  {
    accessorKey: "areaName",
    header: "Area Name",
    cell: ({ row }) => (
      <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
        {row.original.areaName}
      </p>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) =>
      row.original.status === "ACTIVE" ? (
        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          Active
        </span>
      ) : (
        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-600 border border-zinc-200/60 dark:bg-zinc-800 dark:text-zinc-400">
          Inactive
        </span>
      ),
  },
  {
    id: "totalUsers",
    header: "Total Users",
    cell: ({ row }) => (
      <div className="font-bold text-xs text-zinc-800 dark:text-zinc-200">
        {row.original.userCount ?? 0}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const area = row.original;
      return (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => actions.onEdit(area)}
            className="text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors p-2 rounded-lg inline-flex items-center justify-center cursor-pointer"
            title="Edit Area"
          >
            <Pencil size={15} />
          </button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                className="text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors p-2 rounded-lg inline-flex items-center justify-center cursor-pointer"
                title="Delete Area"
                disabled={actions.isDeleting}
              >
                <Trash2 size={15} />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete &quot;{area.areaName}&quot;.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-rose-600 text-white hover:bg-rose-700"
                  onClick={() => actions.onDelete(area._id)}
                  disabled={actions.isDeleting}
                >
                  {actions.isDeleting ? "Deleting..." : "Delete Area"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
  },
];
