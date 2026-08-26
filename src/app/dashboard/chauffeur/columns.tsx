"use client"

import React, { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Eye, Pencil, Trash2, Loader2 } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import api from "@/lib/axios"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChauffeurDetailModal } from "./ChauffeurDetailModal"

export interface ChauffeurStats {
  totalJobsCreated?: number;
  totalJobsCompleted?: number;
  payout?: number;
  earnings?: number;
}

export interface Chauffeur {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  profile?: string;
  profilePicture?: string;
  companyRole?: string;
  subscription?: string | { status?: string; plan?: string; type?: string } | null;
  stats?: ChauffeurStats;
  joined?: string;
  createdAt?: string;
  trips?: number;
  avatarBg?: string;
  initial?: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  const normalized = (status || "PENDING").toUpperCase();
  const styles: Record<string, { cls: string; label: string }> = {
    APPROVED: { cls: "bg-green-100 text-green-700", label: "Approved" },
    PENDING: { cls: "bg-orange-100 text-orange-700", label: "Pending" },
    SUSPENDED: { cls: "bg-red-100 text-red-700", label: "Suspended" },
    REJECTED: { cls: "bg-red-100 text-red-700", label: "Rejected" },
  };
  const current = styles[normalized] || { cls: "bg-gray-100 text-gray-700", label: status || "Unknown" };
  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${current.cls}`}>
      {current.label}
    </span>
  );
};

const SubscriptionBadge = ({ subscription }: { subscription: any }) => {
  let subText = "None";
  if (typeof subscription === "string") {
    subText = subscription;
  } else if (subscription && typeof subscription === "object") {
    subText = subscription.status || subscription.plan || subscription.type || "Active";
  }

  const normalized = subText.toUpperCase();
  const config: Record<string, { cls: string; label: string }> = {
    ACTIVE:  { cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", label: "Active"  },
    EXPIRED: { cls: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",          label: "Expired" },
    TRIAL:   { cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",        label: "Trial"   },
    NONE:    { cls: "bg-gray-100 text-gray-500 ring-1 ring-gray-200",          label: "None"    },
  };
  const current = config[normalized] || config["NONE"];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${current.cls}`}>
      {current.label}
    </span>
  );
};

const ActionCell = ({ chauffeur }: { chauffeur: Chauffeur }) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [name, setName] = useState(chauffeur.name || "");
  const [email, setEmail] = useState(chauffeur.email || "");
  const [status, setStatus] = useState(chauffeur.status || "PENDING");
  
  const queryClient = useQueryClient();
  const chauffeurId = chauffeur._id || chauffeur.id || "unknown";

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/users/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Chauffeur deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-stats"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete chauffeur");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.patch(`/admin/users/${chauffeurId}`, {
        name,
        email,
        status,
        appState: status,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Chauffeur profile updated successfully!");
      setIsEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-stats"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update chauffeur");
    },
  });

  return (
    <div className="flex items-center justify-center gap-1">
      {/* View Details Button & Modal */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsDetailOpen(true);
        }}
        className="text-zinc-400 hover:text-blue-600 hover:bg-blue-50 transition-colors p-2 rounded-lg inline-flex items-center justify-center cursor-pointer"
        title="View Details"
      >
        <Eye size={15} />
      </button>

      <ChauffeurDetailModal
        userId={chauffeur._id || chauffeur.id || null}
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        fallbackData={chauffeur}
      />

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogTrigger asChild>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setName(chauffeur.name || "");
              setEmail(chauffeur.email || "");
              setStatus(chauffeur.status || "PENDING");
              setIsEditOpen(true);
            }}
            className="text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors p-2 rounded-lg inline-flex items-center justify-center cursor-pointer"
            title="Edit Chauffeur"
          >
            <Pencil size={15} />
          </button>
        </DialogTrigger>
        <DialogContent onClick={(e) => e.stopPropagation()} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Chauffeur</DialogTitle>
            <DialogDescription>
              Make changes to the chauffeur profile and status. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor={`name-${chauffeurId}`}>Full Name</Label>
              <Input
                id={`name-${chauffeurId}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`email-${chauffeurId}`}>Email</Label>
              <Input
                id={`email-${chauffeurId}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`status-${chauffeurId}`}>Account Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="button"
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 size={14} className="animate-spin mr-1.5" />}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className="text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors p-2 rounded-lg inline-flex items-center justify-center cursor-pointer"
            title="Delete Chauffeur"
            disabled={deleteMutation.isPending}
          >
            <Trash2 size={15} />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the chauffeur account and associated records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate(chauffeurId)}
            >
              {deleteMutation.isPending ? (
                <Loader2 size={14} className="animate-spin mr-1.5" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1.5" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export const getColumns = (): ColumnDef<Chauffeur>[] => [
  {
    accessorKey: "name",
    header: "Chauffeur",
    cell: ({ row }) => {
      const chauffeur = row.original;
      const initial = (chauffeur.initial || chauffeur.name?.[0] || "C").toUpperCase();
      const idDisplay = chauffeur._id ? `#${chauffeur._id.slice(-6).toUpperCase()}` : chauffeur.id || "";
      const avatarSrc = chauffeur.profilePicture || chauffeur.profile;

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {avatarSrc && <AvatarImage src={avatarSrc} alt={chauffeur.name} />}
            <AvatarFallback className={`${chauffeur.avatarBg || "bg-purple-100 text-purple-700"} font-semibold text-sm`}>
              {initial}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm text-gray-900">{chauffeur.name || "Unnamed Chauffeur"}</p>
            <p className="text-[11px] text-gray-400 font-medium">{idDisplay}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="text-sm text-gray-600 font-medium">{row.getValue("email") || "—"}</div>,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <div className="text-sm text-gray-600 font-medium">{row.getValue("phone") || "—"}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    accessorKey: "subscription",
    header: "Subscription",
    cell: ({ row }) => <SubscriptionBadge subscription={row.original.subscription} />,
  },
  {
    accessorKey: "createdAt",
    header: "Joined On",
    cell: ({ row }) => {
      const dateVal = row.original.createdAt || row.original.joined;
      if (!dateVal) return <div className="text-sm text-gray-400 font-medium">—</div>;
      const parsed = new Date(dateVal);
      const formatted = parsed.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
      return <div className="text-sm text-gray-600 font-medium">{formatted !== "Invalid Date" ? formatted : dateVal}</div>;
    },
  },
  {
    accessorKey: "trips",
    header: "Trips",
    cell: ({ row }) => {
      const trips = row.original.stats?.totalJobsCompleted ?? row.original.trips ?? 0;
      return <div className="text-sm text-gray-600 font-medium">{trips}</div>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => <ActionCell chauffeur={row.original} />,
  },
];
