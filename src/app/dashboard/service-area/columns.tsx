"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ChevronRight, Pencil, Trash2 } from "lucide-react"
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
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import api from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useState } from "react"
import { EditServiceAreaForm } from "@/components/forms/EditServiceAreaForm"

export interface ServiceArea {
  _id: string
  areaName: string
  status: string
  chauffeurCount: number
  cities: string[]
}

const ActionCell = ({ row }: { row: any }) => {
  const area = row.original as ServiceArea;
  const [editOpen, setEditOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/service-areas/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Service area deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["service-areas"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete service area");
    },
  });

  return (
    <div className="flex items-center justify-center gap-1">
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className="text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors p-2 rounded-lg inline-flex items-center justify-center"
            title="Edit Area"
          >
            <Pencil size={15} />
          </button>
        </DialogTrigger>
        <DialogContent onClick={(e) => e.stopPropagation()} className="sm:max-w-sm">
          <EditServiceAreaForm 
            defaultValues={{
              _id: area._id,
              areaName: area.areaName,
              status: area.status,
              city: area.cities?.join(", ") || ""
            }} 
            setOpen={setEditOpen} 
          />
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className="text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors p-2 rounded-lg inline-flex items-center justify-center"
            title="Delete Area"
            disabled={deleteMutation.isPending}
          >
            <Trash2 size={15} />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete
              the service area.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 text-white hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                deleteMutation.mutate(area._id);
              }}
              disabled={deleteMutation.isPending}
            >
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </div>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export const getColumns = (): ColumnDef<ServiceArea>[] => [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      return (
        <div className="w-8 flex items-center justify-center">
          <button
            className="p-1 rounded-md hover:bg-zinc-100 transition-colors cursor-pointer group"
            onClick={row.getToggleExpandedHandler()}
          >
            <ChevronRight
              className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ease-in-out ${
                row.getIsExpanded()
                  ? "rotate-90 text-indigo-500"
                  : "group-hover:text-zinc-600"
              }`}
            />
          </button>
        </div>
      )
    },
  },
  {
    accessorKey: "areaName",
    header: "Area Name",
    cell: ({ row }) => {
      const area = row.original
      return (
        <div>
          <p className="font-semibold text-sm text-zinc-900 leading-tight mb-0.5">
            {area.areaName}
          </p>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return status === "ACTIVE" ? (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/50">
          Active
        </span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200/50">
          Inactive
        </span>
      )
    },
  },
  {
    accessorKey: "chauffeurCount",
    header: () => <div className="text-center">Total Chauffeurs</div>,
    cell: ({ row }) => {
      const amount = row.getValue("chauffeurCount") as number
      return (
        <div className="text-center font-medium text-zinc-900">
          {amount}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => <ActionCell row={row} />,
  },
]
