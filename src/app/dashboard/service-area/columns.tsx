import React from "react";
import { Globe, Pencil, Trash2 } from "lucide-react";
import { ColumnDef } from "@/components/shared/DataTable";
import { ServiceArea } from "./page";
import { UseMutationResult } from "@tanstack/react-query";
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

interface GetServiceAreaColumnsProps {
  setEditingArea: (area: ServiceArea) => void;
  deleteMutation: UseMutationResult<unknown, unknown, string, unknown>;
}

export const getServiceAreaColumns = ({
  setEditingArea,
  deleteMutation,
}: GetServiceAreaColumnsProps): ColumnDef<ServiceArea>[] => [
  {
    header: "Area Name",
    accessorKey: "areaName",
    cell: (area) => (
      <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
        {area.areaName}
      </p>
    ),
  },
  {
    header: "Covered Cities",
    cell: (area) => (
      <div className="flex flex-wrap gap-1.5 max-w-xs">
        {area.cities && area.cities.length > 0 ? (
          area.cities.map((city, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700"
            >
              <Globe size={11} className="text-zinc-400" />
              {city}
            </span>
          ))
        ) : (
          <span className="text-xs text-zinc-400 italic">No cities listed</span>
        )}
      </div>
    ),
  },
  {
    header: "Status",
    cell: (area) =>
      area.status === "ACTIVE" ? (
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
    header: "Total Users",
    cell: (area) => (
      <div className="font-bold text-xs text-zinc-800 dark:text-zinc-200">
        {area.userCount ?? area.chauffeurCount ?? 0}
      </div>
    ),
  },
  {
    header: "Actions",
    className: "text-right",
    cell: (area) => (
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => setEditingArea(area)}
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
              disabled={deleteMutation.isPending}
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
                onClick={() => deleteMutation.mutate(area._id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Area"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    ),
  },
];
