import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Phone, ShieldCheck, Loader2, CheckCircle2, Ban, Clock } from "lucide-react";
import {
  ApplicationDetailsData,
  ApplicationUserDetails,
  ApplicationVehicle,
  ApplicationDocument,
  ApplicationServiceArea,
  ChauffeurDetailModalProps,
  PreviewFileState,
} from "../types";
import { ChauffeurOverviewTab } from "./details-tabs/ChauffeurOverviewTab";
import { ChauffeurVehiclesTab } from "./details-tabs/ChauffeurVehiclesTab";
import { ChauffeurDocumentsTab } from "./details-tabs/ChauffeurDocumentsTab";
import { ChauffeurServiceAreaTab } from "./details-tabs/ChauffeurServiceAreaTab";
import { FilePreviewModal } from "./details-tabs/FilePreviewModal";
import { CustomModal } from "@/components/shared/CustomModal";

export function ChauffeurDetailModal({
  userId,
  isOpen,
  onOpenChange,
  fallbackData,
}: ChauffeurDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [isBatchApproving, setIsBatchApproving] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("Failed background check — invalid TLC records");
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [suspendNote, setSuspendNote] = useState("Account suspended due to compliance/policy review");
  const [previewFile, setPreviewFile] = useState<PreviewFileState>({
    isOpen: false,
    title: "",
    url: "",
    isPdf: false,
  });

  const queryClient = useQueryClient();

  const isPdfFile = (urlOrMime?: string, filename?: string) => {
    if (!urlOrMime && !filename) return false;
    const combined = `${urlOrMime || ""} ${filename || ""}`.toLowerCase();
    return (
      combined.includes(".pdf") ||
      combined.includes("application/pdf") ||
      combined.endsWith(".pdf")
    );
  };

  const resolveFileUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
      return url;
    }
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";
    const origin = apiBase.replace(/\/api\/v1\/?$/, "");
    const cleanPath = url.replace(/^\/+/, "/");
    return `${origin}${cleanPath}`;
  };

  const { data, isLoading } = useQuery<Record<string, unknown>>({
    queryKey: ["admin-chauffeur-details", userId],
    queryFn: async (): Promise<Record<string, unknown>> => {
      if (!userId) throw new Error("No user ID provided");
      try {
        const response = await api.get(`/user/${userId}`);
        return (response.data?.data ?? response.data ?? {}) as Record<string, unknown>;
      } catch {
        try {
          const response = await api.get(`/admin/users/${userId}`);
          return (response.data?.data ?? response.data ?? {}) as Record<string, unknown>;
        } catch {
          const response = await api.get(`/admin/chauffeurs/${userId}`);
          return (response.data?.data ?? response.data ?? {}) as Record<string, unknown>;
        }
      }
    },
    enabled: isOpen && !!userId,
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const res = await api.patch(`/user/${id}/approve`);
        return res.data;
      } catch {
        try {
          const res = await api.post(`/user/${id}/approve`);
          return res.data;
        } catch {
          try {
            const res = await api.post(`/admin/chauffeurs/${id}/approve`);
            return res.data;
          } catch {
            const res = await api.patch(`/admin/users/${id}`, {
              status: "APPROVED",
              appState: "ACTIVE",
              accountState: "VERIFIED",
            });
            return res.data;
          }
        }
      }
    },
    onSuccess: (resData) => {
      toast.success(resData?.message || "Chauffeur approved successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-details", userId] });
    },
    onError: (err: unknown) => {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to approve application";
      toast.error(errorMsg);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      try {
        const res = await api.patch(`/user/${id}/reject`, { reason });
        return res.data;
      } catch {
        try {
          const res = await api.post(`/user/${id}/reject`, { reason });
          return res.data;
        } catch {
          try {
            const res = await api.patch(`/admin/users/${id}/reject`, { reason });
            return res.data;
          } catch {
            const res = await api.patch(`/admin/users/${id}`, {
              status: "REJECTED",
              appState: "REJECTED",
              rejectionReason: reason,
            });
            return res.data;
          }
        }
      }
    },
    onSuccess: (resData) => {
      toast.success(resData?.message || "Chauffeur application rejected successfully");
      setIsRejectModalOpen(false);
      setRejectReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-details", userId] });
    },
    onError: (err: unknown) => {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to reject application";
      toast.error(errorMsg);
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      const payload = { reason: note, note: note, blockReason: note };
      try {
        const res = await api.patch(`/user/${id}/suspend`, payload);
        return res.data;
      } catch {
        try {
          const res = await api.post(`/user/${id}/suspend`, payload);
          return res.data;
        } catch {
          try {
            const res = await api.patch(`/admin/users/${id}/suspend`, payload);
            return res.data;
          } catch {
            const res = await api.patch(`/admin/users/${id}`, {
              status: "SUSPENDED",
              appState: "SUSPENDED",
              accountState: "SUSPENDED",
              blockReason: note,
            });
            return res.data;
          }
        }
      }
    },
    onSuccess: (resData) => {
      toast.success(resData?.message || "User suspended successfully");
      setIsSuspendModalOpen(false);
      setSuspendNote("");
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-details", userId] });
    },
    onError: (err: unknown) => {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to suspend account";
      toast.error(errorMsg);
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const res = await api.patch(`/user/${id}/reactivate`);
        return res.data;
      } catch {
        try {
          const res = await api.patch(`/admin/user/${id}/reactivate`);
          return res.data;
        } catch {
          try {
            const res = await api.patch(`/admin/users/${id}/reactivate`);
            return res.data;
          } catch {
            const res = await api.patch(`/admin/users/${id}`, {
              status: "APPROVED",
              appState: "ACTIVE",
              accountState: "VERIFIED",
            });
            return res.data;
          }
        }
      }
    },
    onSuccess: (resData) => {
      toast.success(resData?.message || "Account reactivated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-details", userId] });
    },
    onError: (err: unknown) => {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to reactivate account";
      toast.error(errorMsg);
    },
  });

  // 1. Vehicle Approval Mutation (PATCH /api/v1/vehicles/approve)
  const approveVehiclesMutation = useMutation({
    mutationFn: async (vehicleIds: string[]) => {
      try {
        const res = await api.patch("/vehicles/approve", { vehicleIds });
        return res.data;
      } catch {
        try {
          const res = await Promise.all(
            vehicleIds.map((vId) =>
              api.patch(`/admin/vehicles/${vId}/status`, { status: "APPROVED" })
            )
          );
          return res[0]?.data;
        } catch {
          const res = await api.patch(`/vehicles/${vehicleIds[0]}/approve`);
          return res.data;
        }
      }
    },
    onSuccess: (resData, variables) => {
      toast.success(resData?.message || "Vehicle(s) approved successfully");
      setSelectedVehicleIds([]);

      const approvedIds = (resData?.data?.vehicleIds as string[] | undefined) || variables || [];
      setVehicleStatusOverrides((prev) => {
        const next = { ...prev };
        for (const id of approvedIds) {
          next[id] = "APPROVED";
        }
        return next;
      });

      queryClient.setQueryData<Record<string, unknown>>(
        ["admin-chauffeur-details", userId],
        (oldData) => {
          if (!oldData) return oldData;
          const currentVehicles = (
            (oldData.vehicles as ApplicationVehicle[]) ||
            ((oldData.user as { vehicles?: ApplicationVehicle[] })?.vehicles) ||
            []
          );

          const updatedVehicles = currentVehicles.map((v, idx) => {
            const vId = v._id || (v as { id?: string }).id || `${v.makeAndModel || "veh"}-${v.type || "type"}-${idx}`;
            if (
              (vId && approvedIds.includes(vId)) ||
              (v._id && approvedIds.includes(v._id)) ||
              ((v as { id?: string }).id && approvedIds.includes((v as { id?: string }).id!)) ||
              (approvedIds.length === 1 && currentVehicles.length === 1)
            ) {
              return { ...v, status: "APPROVED" };
            }
            return v;
          });

          return {
            ...oldData,
            vehicles: updatedVehicles,
            user: oldData.user
              ? { ...(oldData.user as Record<string, unknown>), vehicles: updatedVehicles }
              : oldData.user,
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-details", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-stats"] });
    },
    onError: (err: unknown) => {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to approve vehicle(s)";
      toast.error(errorMsg);
    },
  });

  // 2. Vehicle Rejection Mutation (PATCH /api/v1/vehicles/reject)
  const rejectVehiclesMutation = useMutation({
    mutationFn: async ({
      vehicleIds,
      reason,
      reasonCode,
    }: {
      vehicleIds: string[];
      reason: string;
      reasonCode?: string;
    }) => {
      try {
        const res = await api.patch("/vehicles/reject", {
          vehicleIds,
          reason,
          reasonCode: reasonCode || "REGISTRATION_UNREADABLE",
        });
        return res.data;
      } catch {
        try {
          const res = await Promise.all(
            vehicleIds.map((vId) =>
              api.patch(`/admin/vehicles/${vId}/status`, {
                status: "REJECTED",
                reason,
              })
            )
          );
          return res[0]?.data;
        } catch {
          const res = await api.patch(`/vehicles/${vehicleIds[0]}/reject`, { reason });
          return res.data;
        }
      }
    },
    onSuccess: (resData, variables) => {
      toast.success(resData?.message || "Vehicle(s) rejected successfully");
      setIsVehicleRejectModalOpen(false);
      setSelectedVehicleIds([]);

      const rejectedIds = (resData?.data?.vehicleIds as string[] | undefined) || variables?.vehicleIds || [];
      setVehicleStatusOverrides((prev) => {
        const next = { ...prev };
        for (const id of rejectedIds) {
          next[id] = "REJECTED";
        }
        return next;
      });

      queryClient.setQueryData<Record<string, unknown>>(
        ["admin-chauffeur-details", userId],
        (oldData) => {
          if (!oldData) return oldData;
          const currentVehicles = (
            (oldData.vehicles as ApplicationVehicle[]) ||
            ((oldData.user as { vehicles?: ApplicationVehicle[] })?.vehicles) ||
            []
          );

          const updatedVehicles = currentVehicles.map((v, idx) => {
            const vId = v._id || (v as { id?: string }).id || `${v.makeAndModel || "veh"}-${v.type || "type"}-${idx}`;
            if (
              (vId && rejectedIds.includes(vId)) ||
              (v._id && rejectedIds.includes(v._id)) ||
              ((v as { id?: string }).id && rejectedIds.includes((v as { id?: string }).id!)) ||
              (rejectedIds.length === 1 && currentVehicles.length === 1)
            ) {
              return { ...v, status: "REJECTED" };
            }
            return v;
          });

          return {
            ...oldData,
            vehicles: updatedVehicles,
            user: oldData.user
              ? { ...(oldData.user as Record<string, unknown>), vehicles: updatedVehicles }
              : oldData.user,
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-details", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-stats"] });
    },
    onError: (err: unknown) => {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to reject vehicle(s)";
      toast.error(errorMsg);
    },
  });

  const [isVehicleRejectModalOpen, setIsVehicleRejectModalOpen] = useState(false);
  const [vehicleRejectReason, setVehicleRejectReason] = useState("Vehicle registration document unreadable");
  const [vehicleRejectReasonCode, setVehicleRejectReasonCode] = useState("REGISTRATION_UNREADABLE");
  const [pendingRejectVehicleIds, setPendingRejectVehicleIds] = useState<string[]>([]);
  const [vehicleStatusOverrides, setVehicleStatusOverrides] = useState<Record<string, string>>({});

  const rawData = data;
  const user: ApplicationUserDetails | undefined =
    (data?.user as ApplicationUserDetails | undefined) ||
    (rawData?._id || rawData?.id || rawData?.email
      ? (data as unknown as ApplicationUserDetails)
      : undefined);
  const rawVehicles: ApplicationVehicle[] =
    (data?.vehicles as ApplicationVehicle[] | undefined) ||
    (rawData?.user as { vehicles?: ApplicationVehicle[] } | undefined)?.vehicles ||
    [];
  const vehicles: ApplicationVehicle[] = rawVehicles.map((v, idx) => {
    const vId = v._id || (v as { id?: string }).id || `${v.makeAndModel || "veh"}-${v.type || "type"}-${idx}`;
    const override =
      vehicleStatusOverrides[vId] ||
      (v._id ? vehicleStatusOverrides[v._id] : undefined) ||
      ((v as { id?: string }).id ? vehicleStatusOverrides[(v as { id?: string }).id!] : undefined);
    if (override) {
      return { ...v, status: override };
    }
    return v;
  });
  const documents: ApplicationDocument[] =
    (data?.documents as ApplicationDocument[] | undefined) ||
    (rawData?.user as { documents?: ApplicationDocument[] } | undefined)?.documents ||
    [];
  const serviceArea: ApplicationServiceArea | undefined =
    (data?.serviceArea as ApplicationServiceArea | undefined) ||
    (rawData?.user as { serviceArea?: ApplicationServiceArea } | undefined)?.serviceArea;
  const reviewSummary = (data?.reviewSummary as { averageRating?: number; totalReviews?: number } | undefined) || {
    averageRating:
      (data as unknown as { averageRating?: number })?.averageRating ??
      user?.averageRating ??
      0,
    totalReviews:
      (data as unknown as { totalReviews?: number })?.totalReviews ??
      user?.totalReviews ??
      0,
  };

  const name = user?.name || fallbackData?.name || "Chauffeur";
  const email = user?.email || fallbackData?.email || "—";
  const phone = user?.phone || fallbackData?.phone || "—";
  const profilePicture =
    user?.profilePicture ||
    (data as unknown as { profilePicture?: string; profile?: string })?.profilePicture ||
    (data as unknown as { profilePicture?: string; profile?: string })?.profile ||
    fallbackData?.profilePicture ||
    fallbackData?.profile;
  const appState = (
    user?.appState ||
    user?.status ||
    (data as unknown as { appState?: string; status?: string })?.appState ||
    (data as unknown as { appState?: string; status?: string })?.status ||
    fallbackData?.status ||
    "PENDING"
  ).toUpperCase();
  const accountState = (
    user?.accountState ||
    (data as unknown as { accountState?: string })?.accountState ||
    "VERIFIED"
  ).toUpperCase();
  const companyRole =
    user?.companyRole ||
    (data as unknown as { companyRole?: string })?.companyRole ||
    fallbackData?.companyRole ||
    "Chauffeur";
  const companyName =
    user?.companyName ||
    (data as unknown as { companyName?: string })?.companyName ||
    "N/A";
  const languages = user?.languages?.length ? user.languages.join(", ") : "English";
  const avgRating = reviewSummary?.averageRating ?? user?.averageRating ?? 0;
  const totalReviews = reviewSummary?.totalReviews ?? user?.totalReviews ?? 0;
  const createdAt =
    user?.createdAt ||
    (data as unknown as { createdAt?: string })?.createdAt ||
    fallbackData?.createdAt ||
    fallbackData?.joined;
  const updatedAt = user?.updatedAt || (data as unknown as { updatedAt?: string })?.updatedAt;
  const initial = (name?.[0] || "C").toUpperCase();

  const getVehicleIdentifier = (v: ApplicationVehicle, idx: number): string => {
    const candidate =
      v._id ||
      (v as { id?: string }).id ||
      (v as { vehicleId?: string }).vehicleId ||
      (typeof (v as { vehicle?: { _id?: string; id?: string } }).vehicle === "object"
        ? (v as { vehicle?: { _id?: string; id?: string } }).vehicle?._id ||
          (v as { vehicle?: { _id?: string; id?: string } }).vehicle?.id
        : undefined);

    if (candidate && typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }

    if (user?.selectedVehicle && /^[0-9a-fA-F]{24}$/.test(user.selectedVehicle)) {
      return user.selectedVehicle;
    }

    return `${v.makeAndModel || "veh"}-${v.type || "type"}-${idx}`;
  };

  const handleToggleVehicleSelect = (id: string) => {
    setSelectedVehicleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllVehicles = () => {
    if (vehicles.length === 0) return;
    if (selectedVehicleIds.length === vehicles.length) {
      setSelectedVehicleIds([]);
    } else {
      setSelectedVehicleIds(vehicles.map((v: ApplicationVehicle, idx: number) => getVehicleIdentifier(v, idx)));
    }
  };

  const resolveValidVehicleIds = (rawIds: string[]): string[] => {
    const validIds: string[] = [];

    for (const id of rawIds) {
      if (id && /^[0-9a-fA-F]{24}$/.test(id)) {
        validIds.push(id);
      }
    }

    // If no valid hex ID in rawIds, check user.selectedVehicle
    if (validIds.length === 0 && user?.selectedVehicle && /^[0-9a-fA-F]{24}$/.test(user.selectedVehicle)) {
      validIds.push(user.selectedVehicle);
    }

    return validIds;
  };

  const handleApproveVehicles = (overrideIds?: string[]) => {
    const rawIds =
      overrideIds && overrideIds.length > 0
        ? overrideIds
        : selectedVehicleIds.length > 0
        ? selectedVehicleIds
        : vehicles.map((v: ApplicationVehicle, idx: number) => getVehicleIdentifier(v, idx));

    if (rawIds.length === 0) {
      toast.info("No vehicles available to approve");
      return;
    }

    const resolvedIds = resolveValidVehicleIds(rawIds);

    if (resolvedIds.length === 0) {
      toast.error("Vehicle does not have a valid 24-character database ID to approve");
      return;
    }

    approveVehiclesMutation.mutate(resolvedIds);
  };

  const handleOpenRejectVehiclesModal = (ids?: string[]) => {
    const rawIds =
      ids && ids.length > 0
        ? ids
        : selectedVehicleIds.length > 0
        ? selectedVehicleIds
        : vehicles.map((v: ApplicationVehicle, idx: number) => getVehicleIdentifier(v, idx));

    if (rawIds.length === 0) {
      toast.info("No vehicles available to reject");
      return;
    }

    const resolvedIds = resolveValidVehicleIds(rawIds);

    if (resolvedIds.length === 0) {
      toast.error("Vehicle does not have a valid 24-character database ID to reject");
      return;
    }

    setPendingRejectVehicleIds(resolvedIds);
    setVehicleRejectReason("Vehicle registration document unreadable");
    setVehicleRejectReasonCode("REGISTRATION_UNREADABLE");
    setIsVehicleRejectModalOpen(true);
  };

  const [isDocApproving, setIsDocApproving] = useState(false);

  const handleApproveAllDocuments = async () => {
    if (documents.length === 0) {
      toast.info("No documents to approve");
      return;
    }
    setIsDocApproving(true);
    try {
      await Promise.all(
        documents.map((doc: ApplicationDocument, idx: number) => {
          const docId = doc._id || (doc as { id?: string }).id || `${idx}`;
          return api.patch(`/admin/documents/${docId}/status`, { status: "APPROVED" }).catch(() => null);
        })
      );
      toast.success("Documents approved successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-details", userId] });
    } catch {
      toast.error("Failed to approve documents");
    } finally {
      setIsDocApproving(false);
    }
  };

  const handleRejectAllDocuments = async () => {
    if (documents.length === 0) {
      toast.info("No documents to reject");
      return;
    }
    setIsDocApproving(true);
    try {
      await Promise.all(
        documents.map((doc: ApplicationDocument, idx: number) => {
          const docId = doc._id || (doc as { id?: string }).id || `${idx}`;
          return api.patch(`/admin/documents/${docId}/status`, { status: "REJECTED" }).catch(() => null);
        })
      );
      toast.success("Documents rejected");
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-details", userId] });
    } catch {
      toast.error("Failed to reject documents");
    } finally {
      setIsDocApproving(false);
    }
  };

  const formatDocName = (type: string) => {
    switch (type) {
      case "DRIVING_LICENSE":
        return "Driving License";
      case "HACK_LICENSE":
        return "Hack / Taxi License";
      case "LOCAL_PERMIT":
        return "Local Operating Permit";
      case "PROFILE_PICTURE":
        return "Profile Photo Verification";
      default:
        return type.replace(/_/g, " ");
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusBadge = (st: string) => {
    const s = (st || "").toUpperCase();
    if (s.includes("APPROV") || s.includes("ACTIVE") || s === "VERIFIED" || s === "CLEAN") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 shadow-2xs">
          <CheckCircle2 size={12} className="text-emerald-600" />
          Approved
        </span>
      );
    }
    if (s.includes("SUSPEND") || s.includes("REJECT") || s.includes("INFECTED")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 ring-1 ring-rose-200 shadow-2xs">
          <Ban size={12} className="text-rose-600" />
          {s.includes("REJECT") ? "Rejected" : "Suspended"}
        </span>
      );
    }
    if (s === "SCANNING_PENDING") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200 shadow-2xs">
          <Clock size={12} className="text-amber-600" />
          Scanning Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200 shadow-2xs">
        <Clock size={12} className="text-amber-600" />
        Pending Review
      </span>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl"
        >
          {/* Modal Header */}
          <DialogHeader className="p-6 pb-4 border-b bg-white">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Chauffeur Application Dossier
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 mt-0.5">
                  Complete credentials, vehicle fleet, and compliance document inspection
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/50">
            {isLoading ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Profile Hero Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-xs">
                  <Avatar className="h-16 w-16 ring-2 ring-primary/10 shadow-sm flex-shrink-0">
                    {profilePicture && <AvatarImage src={profilePicture} alt={name} className="object-cover" />}
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                      {initial}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg text-gray-900 truncate">{name}</h3>
                      {getStatusBadge(appState)}
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-1 font-mono">
                      ID: <span className="text-gray-700">{userId || "—"}</span>
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-600 flex-wrap">
                      <span className="flex items-center gap-1.5 truncate">
                        <Mail size={13} className="text-gray-400" />
                        {email}
                      </span>
                      <span className="flex items-center gap-1.5 truncate">
                        <Phone size={13} className="text-gray-400" />
                        {phone}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                        <ShieldCheck size={12} className="text-emerald-600" />
                        Identity: {accountState === "VERIFIED" ? "Verified" : accountState}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full justify-start bg-zinc-200/70 p-1 rounded-xl">
                    <TabsTrigger value="overview" className="rounded-lg text-xs font-semibold px-4 py-1.5">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="vehicles" className="rounded-lg text-xs font-semibold px-4 py-1.5 flex items-center gap-1.5">
                      Vehicles
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary/10 text-primary font-bold">
                        {vehicles.length}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="rounded-lg text-xs font-semibold px-4 py-1.5 flex items-center gap-1.5">
                      Documents
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary/10 text-primary font-bold">
                        {documents.length}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="compliance" className="rounded-lg text-xs font-semibold px-4 py-1.5">
                      Area & Verification
                    </TabsTrigger>
                  </TabsList>

                  {/* TAB 1: OVERVIEW */}
                  <TabsContent value="overview" className="mt-4">
                    <ChauffeurOverviewTab
                      user={user}
                      serviceArea={serviceArea}
                      fallbackData={fallbackData}
                      companyName={companyName}
                      companyRole={companyRole}
                      languages={languages}
                      avgRating={avgRating}
                      totalReviews={totalReviews}
                      createdAt={createdAt}
                      updatedAt={updatedAt}
                    />
                  </TabsContent>

                  {/* TAB 2: VEHICLES */}
                  <TabsContent value="vehicles" className="mt-4">
                    <ChauffeurVehiclesTab
                      vehicles={vehicles}
                      user={user}
                      selectedVehicleIds={selectedVehicleIds}
                      handleSelectAllVehicles={handleSelectAllVehicles}
                      handleToggleVehicleSelect={handleToggleVehicleSelect}
                      handleApproveVehicles={handleApproveVehicles}
                      handleOpenRejectVehiclesModal={handleOpenRejectVehiclesModal}
                      isApproving={approveVehiclesMutation.isPending}
                      isRejecting={rejectVehiclesMutation.isPending}
                      getStatusBadge={getStatusBadge}
                      resolveFileUrl={resolveFileUrl}
                      isPdfFile={isPdfFile}
                      setPreviewFile={setPreviewFile}
                    />
                  </TabsContent>

                  {/* TAB 3: DOCUMENTS */}
                  <TabsContent value="documents" className="mt-4">
                    <ChauffeurDocumentsTab
                      documents={documents}
                      formatDocName={formatDocName}
                      formatFileSize={formatFileSize}
                      getStatusBadge={getStatusBadge}
                      resolveFileUrl={resolveFileUrl}
                      isPdfFile={isPdfFile}
                      setPreviewFile={setPreviewFile}
                    />
                  </TabsContent>

                  {/* TAB 4: SERVICE AREA & VERIFICATION */}
                  <TabsContent value="compliance" className="mt-4">
                    <ChauffeurServiceAreaTab
                      serviceArea={serviceArea}
                      user={user}
                      accountState={accountState}
                      appState={appState}
                      getStatusBadge={getStatusBadge}
                    />
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>

          {/* Modal Footer with Decision Actions */}
          <DialogFooter className="p-4 px-6 border-t bg-gray-50/70 flex flex-row items-center justify-between gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl px-5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border-gray-200 shadow-2xs"
            >
              Close
            </Button>

            {/* Contextual Action Buttons based on Active Tab */}
            {activeTab === "vehicles" && (
              <div className="flex items-center gap-2.5 flex-nowrap">
                <Button
                  variant="outline"
                  onClick={() => handleOpenRejectVehiclesModal()}
                  disabled={approveVehiclesMutation.isPending || rejectVehiclesMutation.isPending}
                  className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 rounded-xl text-xs font-semibold px-4 transition-colors whitespace-nowrap cursor-pointer"
                >
                  {rejectVehiclesMutation.isPending && (
                    <Loader2 size={14} className="animate-spin mr-1.5" />
                  )}
                  {selectedVehicleIds.length > 1
                    ? `Reject Selected (${selectedVehicleIds.length})`
                    : "Reject Vehicle"}
                </Button>

                <Button
                  onClick={() => handleApproveVehicles()}
                  disabled={approveVehiclesMutation.isPending || rejectVehiclesMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold px-5 shadow-xs transition-all whitespace-nowrap cursor-pointer"
                >
                  {approveVehiclesMutation.isPending && (
                    <Loader2 size={14} className="animate-spin mr-1.5" />
                  )}
                  {selectedVehicleIds.length > 1
                    ? `Approve Selected (${selectedVehicleIds.length})`
                    : "Approve Vehicle"}
                </Button>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="flex items-center gap-2.5 flex-nowrap">
                <Button
                  variant="outline"
                  onClick={handleRejectAllDocuments}
                  disabled={isDocApproving}
                  className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 rounded-xl text-xs font-semibold px-4 transition-colors whitespace-nowrap cursor-pointer"
                >
                  {isDocApproving && <Loader2 size={14} className="animate-spin mr-1.5" />}
                  Reject Document
                </Button>

                <Button
                  onClick={handleApproveAllDocuments}
                  disabled={isDocApproving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold px-5 shadow-xs transition-all whitespace-nowrap cursor-pointer"
                >
                  {isDocApproving && <Loader2 size={14} className="animate-spin mr-1.5" />}
                  Approve Document
                </Button>
              </div>
            )}

            {activeTab !== "vehicles" && activeTab !== "documents" && (
              <div className="flex items-center gap-2.5 flex-nowrap">
                {appState === "PENDING" && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setRejectReason("Failed background check — invalid TLC records");
                        setIsRejectModalOpen(true);
                      }}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 rounded-xl text-xs font-semibold px-4 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {rejectMutation.isPending && (
                        <Loader2 size={14} className="animate-spin mr-1.5" />
                      )}
                      Reject Application
                    </Button>

                    <Button
                      onClick={() => userId && approveMutation.mutate(userId)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold px-5 shadow-xs transition-all whitespace-nowrap cursor-pointer"
                    >
                      {approveMutation.isPending && (
                        <Loader2 size={14} className="animate-spin mr-1.5" />
                      )}
                      Approve Full Application
                    </Button>
                  </>
                )}

                {(appState === "APPROVED" || appState === "ACTIVE" || appState === "VERIFIED") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSuspendNote("Account suspended due to policy/compliance review");
                      setIsSuspendModalOpen(true);
                    }}
                    disabled={suspendMutation.isPending}
                    className="text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl text-xs font-semibold px-4 whitespace-nowrap cursor-pointer"
                  >
                    {suspendMutation.isPending && (
                      <Loader2 size={14} className="animate-spin mr-1.5" />
                    )}
                    Suspend Account
                  </Button>
                )}

                {(appState === "SUSPENDED" || accountState === "SUSPENDED") && (
                  <Button
                    onClick={() => userId && reactivateMutation.mutate(userId)}
                    disabled={reactivateMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold px-4 whitespace-nowrap cursor-pointer"
                  >
                    {reactivateMutation.isPending && (
                      <Loader2 size={14} className="animate-spin mr-1.5" />
                    )}
                    Reactivate Account
                  </Button>
                )}
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspension Reason / Note Modal */}
      <CustomModal
        isOpen={isSuspendModalOpen}
        onOpenChange={setIsSuspendModalOpen}
        title="Suspend User Account"
        description="Please provide a suspension note or reason. This will be recorded as the block note."
        size="md"
        submitLabel="Confirm Suspension"
        onSubmit={(e) => {
          e.preventDefault();
          if (!userId) return;
          const finalNote =
            suspendNote.trim() || "Account suspended due to policy/compliance review";
          suspendMutation.mutate({ id: userId, note: finalNote });
        }}
        isSubmitting={suspendMutation.isPending}
      >
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700">
              Suspension Note / Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={suspendNote}
              onChange={(e) => setSuspendNote(e.target.value)}
              placeholder="e.g. Account suspended due to policy/compliance review"
              rows={4}
              className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none bg-zinc-50/50"
              required
            />
            <p className="text-[11px] text-gray-400">
              This note will be recorded and attached to the user profile audit.
            </p>
          </div>
        </div>
      </CustomModal>

      {/* Rejection Reason Modal */}
      <CustomModal
        isOpen={isRejectModalOpen}
        onOpenChange={setIsRejectModalOpen}
        title="Reject Chauffeur Application"
        description="Please provide the remediation reason for rejecting this application. The candidate will see this audit note."
        size="md"
        submitLabel="Confirm Rejection"
        onSubmit={(e) => {
          e.preventDefault();
          if (!userId) return;
          const finalReason =
            rejectReason.trim() || "Failed background check — invalid TLC records";
          rejectMutation.mutate({ id: userId, reason: finalReason });
        }}
        isSubmitting={rejectMutation.isPending}
      >
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700">
              Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Failed background check — invalid TLC records"
              rows={4}
              className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none bg-zinc-50/50"
              required
            />
            <p className="text-[11px] text-gray-400">
              This reason will be recorded in audit logs and visible to the applicant.
            </p>
          </div>
        </div>
      </CustomModal>

      {/* Vehicle Rejection Reason Modal */}
      <CustomModal
        isOpen={isVehicleRejectModalOpen}
        onOpenChange={setIsVehicleRejectModalOpen}
        title="Reject Vehicle(s)"
        description={`Provide a remediation reason for rejecting ${pendingRejectVehicleIds.length} vehicle(s).`}
        size="md"
        submitLabel="Confirm Vehicle Rejection"
        onSubmit={(e) => {
          e.preventDefault();
          if (pendingRejectVehicleIds.length === 0) return;
          const finalReason =
            vehicleRejectReason.trim() || "Vehicle registration document unreadable";
          rejectVehiclesMutation.mutate({
            vehicleIds: pendingRejectVehicleIds,
            reason: finalReason,
            reasonCode: vehicleRejectReasonCode || "REGISTRATION_UNREADABLE",
          });
        }}
        isSubmitting={rejectVehiclesMutation.isPending}
      >
        <div className="p-6 space-y-4">
          {/* Quick preset reasons */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              Quick Reasons
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "Registration Unreadable", reason: "Vehicle registration document unreadable", code: "REGISTRATION_UNREADABLE" },
                { label: "Insurance Expired", reason: "Commercial insurance document expired", code: "INSURANCE_EXPIRED" },
                { label: "Photos Invalid", reason: "Vehicle inspection photos do not meet platform standards", code: "PHOTOS_INVALID" },
                { label: "Permit Expired", reason: "TLC / Local operating permit license expired", code: "PERMIT_EXPIRED" },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setVehicleRejectReason(item.reason);
                    setVehicleRejectReasonCode(item.code);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
                    vehicleRejectReason === item.reason
                      ? "bg-rose-50 border-rose-300 text-rose-700 font-semibold"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700">
              Vehicle Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={vehicleRejectReason}
              onChange={(e) => setVehicleRejectReason(e.target.value)}
              placeholder="e.g. Vehicle registration document unreadable or Commercial insurance expired"
              rows={4}
              className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none bg-zinc-50/50"
              required
            />
            <p className="text-[11px] text-gray-400">
              Target vehicles to reject: <span className="font-semibold text-gray-700">{pendingRejectVehicleIds.length}</span>
            </p>
          </div>
        </div>
      </CustomModal>

      {/* Standalone Interactive File & PDF Preview Dialog */}
      <FilePreviewModal
        previewFile={previewFile}
        onOpenChange={(open) => setPreviewFile((prev) => ({ ...prev, isOpen: open }))}
      />
    </>
  );
}
