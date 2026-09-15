"use client"

import React, { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Eye, Pencil, Trash2, Loader2, User, Mail, Gift, Crown } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { AxiosError } from "axios"
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
import { CustomInput } from "@/components/shared/CustomInput"
import { CustomModal } from "@/components/shared/CustomModal"
import { FormFieldWrapper } from "@/components/shared/FormFieldWrapper"
import { ChauffeurDetailModal } from "./components/ChauffeurDetailModal"
import { GrantFreeSubscriptionModal } from "./components/GrantFreeSubscriptionModal"

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
  subscription?:
    | string
    | {
        status?: string;
        plan?: string;
        type?: string;
        isPremium?: boolean;
        platform?: string;
        expiresAt?: string | null;
        metadata?: {
          isComplimentary?: boolean;
          durationDays?: number | string;
        };
      }
    | null;
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

const SubscriptionBadge = ({ subscription }: { subscription: Chauffeur["subscription"] }) => {
  if (typeof subscription === "object" && subscription) {
    const isComp =
      subscription.metadata?.isComplimentary || subscription.platform === "admin";
    const isLifetime =
      subscription.metadata?.durationDays === "lifetime" ||
      (isComp && subscription.expiresAt === null) ||
      (subscription.isPremium && subscription.expiresAt === null);

    if (isLifetime) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 ring-1 ring-amber-300">
          <Crown size={12} className="text-amber-600" />
          Lifetime Free
        </span>
      );
    }

    if (isComp) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 ring-1 ring-purple-200">
          <Gift size={11} className="text-purple-600" />
          Complimentary
        </span>
      );
    }
  }

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
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [name, setName] = useState(chauffeur.name || "");
  const [email, setEmail] = useState(chauffeur.email || "");
  
  const queryClient = useQueryClient();
  const chauffeurId = chauffeur._id || chauffeur.id || "unknown";

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const res = await api.delete(`/user/${id}`);
        return res.data;
      } catch {
        try {
          const res = await api.delete(`/admin/users/${id}`);
          return res.data;
        } catch {
          const res = await api.delete(`/admin/user/${id}`);
          return res.data;
        }
      }
    },
    onSuccess: (resData) => {
      toast.success(resData?.message || "User deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-stats"] });
      queryClient.invalidateQueries({ queryKey: ["users-stats"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to delete user");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.patch(`/admin/users/${chauffeurId}`, {
        name,
        email,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("User profile updated successfully!");
      setIsEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-stats"] });
      queryClient.invalidateQueries({ queryKey: ["users-stats"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to update user");
    },
  });

  return (
    <div className="flex items-center justify-center gap-1">
      {/* View Details Button & Modal */}
      <button
        onClick={(e: React.MouseEvent) => {
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

      {/* Edit Chauffeur Trigger Button & CustomModal */}
      <button
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          setName(chauffeur.name || "");
          setEmail(chauffeur.email || "");
          setIsEditOpen(true);
        }}
        className="text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors p-2 rounded-lg inline-flex items-center justify-center cursor-pointer"
        title="Edit User"
      >
        <Pencil size={15} />
      </button>

      <CustomModal
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Edit User Profile"
        description="Make changes to the user profile details. Click save when you're done."
        size="md"
        submitLabel="Save Changes"
        onSubmit={() => updateMutation.mutate()}
        isSubmitting={updateMutation.isPending}
      >
        <div className="space-y-4">
          <FormFieldWrapper label="Full Name" htmlFor={`name-${chauffeurId}`} required>
            <CustomInput
              id={`name-${chauffeurId}`}
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormFieldWrapper>

          <FormFieldWrapper label="Email Address" htmlFor={`email-${chauffeurId}`} required>
            <CustomInput
              id={`email-${chauffeurId}`}
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormFieldWrapper>
        </div>
      </CustomModal>

      {/* Free Subscription / Complimentary Access Button & Modal */}
      <button
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          setIsSubModalOpen(true);
        }}
        className="text-zinc-400 hover:text-purple-600 hover:bg-purple-50 transition-colors p-2 rounded-lg inline-flex items-center justify-center cursor-pointer"
        title="Manage Complimentary Subscription"
      >
        <Gift size={15} />
      </button>

      <GrantFreeSubscriptionModal
        userId={chauffeur._id || chauffeur.id || null}
        userName={chauffeur.name}
        userEmail={chauffeur.email}
        currentSubscription={chauffeur.subscription}
        isOpen={isSubModalOpen}
        onOpenChange={setIsSubModalOpen}
      />

      {/* Delete Dialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            className="text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors p-2 rounded-lg inline-flex items-center justify-center cursor-pointer"
            title="Delete User"
            disabled={deleteMutation.isPending}
          >
            <Trash2 size={15} />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account and associated records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-destructive/90 cursor-pointer"
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
