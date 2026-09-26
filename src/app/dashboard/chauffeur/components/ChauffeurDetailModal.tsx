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
import { Mail, Phone, ShieldCheck, Loader2, CheckCircle2, Ban, Clock, Gift } from "lucide-react";
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
import { FilePreviewModal } from "./details-tabs/FilePreviewModal";
import { GrantFreeSubscriptionModal } from "./GrantFreeSubscriptionModal";
import { CustomModal } from "@/components/shared/CustomModal";

export function ChauffeurDetailModal({
  userId,
  isOpen,
  onOpenChange,
  fallbackData,
}: ChauffeurDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
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
    
    let cleanPath = url.startsWith("/") ? url : `/${url}`;
    
    // Assuming backend serves these from /uploads if not already present
    if (!cleanPath.startsWith("/uploads/")) {
      cleanPath = `/uploads${cleanPath}`;
    }
    
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
  const [documentStatusOverrides, setDocumentStatusOverrides] = useState<Record<string, string>>({});
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [isDocRejectModalOpen, setIsDocRejectModalOpen] = useState(false);
  const [docRejectReason, setDocRejectReason] = useState("Document unreadable or blurry");
  const [pendingRejectDocIds, setPendingRejectDocIds] = useState<string[]>([]);
  const [isDocRejecting, setIsDocRejecting] = useState(false);

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
  const rawDocuments: ApplicationDocument[] =
    (data?.documents as ApplicationDocument[] | undefined) ||
    (rawData?.user as { documents?: ApplicationDocument[] } | undefined)?.documents ||
    [];
  const documents: ApplicationDocument[] = rawDocuments.map((doc, idx) => {
    const dId = doc._id || (doc as { id?: string }).id || `${doc.documentType || "doc"}-${idx}`;
    const override =
      documentStatusOverrides[dId] ||
      (doc._id ? documentStatusOverrides[doc._id] : undefined) ||
      ((doc as { id?: string }).id ? documentStatusOverrides[(doc as { id?: string }).id!] : undefined);
    if (override) {
      return { ...doc, status: override };
    }
    return doc;
  });
  const serviceArea: ApplicationServiceArea | string | undefined =
    (data?.serviceArea as ApplicationServiceArea | string | undefined) ||
    (rawData?.user as { serviceArea?: ApplicationServiceArea | string } | undefined)?.serviceArea;
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
  const userBadges: string[] =
    Array.isArray(user?.badges) && user.badges.length > 0
      ? user.badges
      : Array.isArray(fallbackData?.badges) && fallbackData.badges.length > 0
      ? fallbackData.badges
      : user?.badge
      ? [user.badge]
      : fallbackData?.badge
      ? [fallbackData.badge]
      : [];

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

  const getDocumentIdentifier = (doc: ApplicationDocument, idx: number): string => {
    const candidate = doc._id || (doc as { id?: string }).id;
    if (candidate && typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
    return `${doc.documentType || "doc"}-${idx}`;
  };

  const handleToggleDocumentSelect = (id: string) => {
    setSelectedDocumentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllDocuments = () => {
    if (documents.length === 0) return;
    if (selectedDocumentIds.length === documents.length) {
      setSelectedDocumentIds([]);
    } else {
      setSelectedDocumentIds(documents.map((doc, idx) => getDocumentIdentifier(doc, idx)));
    }
  };

  const handleApproveDocuments = async (overrideIds?: string[]) => {
    const targetIds =
      overrideIds && overrideIds.length > 0
        ? overrideIds
        : selectedDocumentIds.length > 0
        ? selectedDocumentIds
        : documents.map((doc, idx) => getDocumentIdentifier(doc, idx));

    if (targetIds.length === 0) {
      toast.info("No documents selected to approve");
      return;
    }

    setIsDocApproving(true);
    try {
      await Promise.all(
        targetIds.map(async (docId) => {
          try {
            await api.patch(`/admin/documents/${docId}/status`, { status: "APPROVED" });
          } catch {
            await api.patch(`/documents/${docId}/approve`, { status: "APPROVED" }).catch(() => null);
          }
        })
      );

      toast.success(
        targetIds.length > 1
          ? `${targetIds.length} documents approved successfully`
          : "Document approved successfully"
      );

      setDocumentStatusOverrides((prev) => {
        const next = { ...prev };
        for (const id of targetIds) {
          next[id] = "APPROVED";
        }
        return next;
      });

      setSelectedDocumentIds([]);

      queryClient.setQueryData<Record<string, unknown>>(
        ["admin-chauffeur-details", userId],
        (oldData) => {
          if (!oldData) return oldData;
          const currentDocs =
            (oldData.documents as ApplicationDocument[]) ||
            ((oldData.user as { documents?: ApplicationDocument[] })?.documents) ||
            [];

          const updatedDocs = currentDocs.map((doc, idx) => {
            const dId = getDocumentIdentifier(doc, idx);
            if (targetIds.includes(dId) || (doc._id && targetIds.includes(doc._id))) {
              return { ...doc, status: "APPROVED" };
            }
            return doc;
          });

          return {
            ...oldData,
            documents: updatedDocs,
            user: oldData.user
              ? { ...(oldData.user as Record<string, unknown>), documents: updatedDocs }
              : oldData.user,
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-details", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-applications"] });
    } catch {
      toast.error("Failed to approve documents");
    } finally {
      setIsDocApproving(false);
    }
  };

  const handleOpenRejectDocumentsModal = (ids?: string[]) => {
    const targetIds =
      ids && ids.length > 0
        ? ids
        : selectedDocumentIds.length > 0
        ? selectedDocumentIds
        : documents.map((doc, idx) => getDocumentIdentifier(doc, idx));

    if (targetIds.length === 0) {
      toast.info("No documents selected to reject");
      return;
    }

    setPendingRejectDocIds(targetIds);
    setDocRejectReason("Document unreadable or blurry");
    setIsDocRejectModalOpen(true);
  };

  const handleConfirmRejectDocuments = async () => {
    if (pendingRejectDocIds.length === 0) return;
    const finalReason = docRejectReason.trim() || "Document rejected by administrator";
    setIsDocRejecting(true);
    try {
      await Promise.all(
        pendingRejectDocIds.map(async (docId) => {
          try {
            await api.patch(`/admin/documents/${docId}/status`, {
              status: "REJECTED",
              reason: finalReason,
              rejectionReason: finalReason,
            });
          } catch {
            await api.patch(`/documents/${docId}/reject`, {
              status: "REJECTED",
              reason: finalReason,
            }).catch(() => null);
          }
        })
      );

      toast.success(
        pendingRejectDocIds.length > 1
          ? `${pendingRejectDocIds.length} documents rejected`
          : "Document rejected"
      );

      setDocumentStatusOverrides((prev) => {
        const next = { ...prev };
        for (const id of pendingRejectDocIds) {
          next[id] = "REJECTED";
        }
        return next;
      });

      setSelectedDocumentIds([]);
      setIsDocRejectModalOpen(false);

      queryClient.setQueryData<Record<string, unknown>>(
        ["admin-chauffeur-details", userId],
        (oldData) => {
          if (!oldData) return oldData;
          const currentDocs =
            (oldData.documents as ApplicationDocument[]) ||
            ((oldData.user as { documents?: ApplicationDocument[] })?.documents) ||
            [];

          const updatedDocs = currentDocs.map((doc, idx) => {
            const dId = getDocumentIdentifier(doc, idx);
            if (pendingRejectDocIds.includes(dId) || (doc._id && pendingRejectDocIds.includes(doc._id))) {
              return { ...doc, status: "REJECTED", rejectionReason: finalReason };
            }
            return doc;
          });

          return {
            ...oldData,
            documents: updatedDocs,
            user: oldData.user
              ? { ...(oldData.user as Record<string, unknown>), documents: updatedDocs }
              : oldData.user,
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-details", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-applications"] });
    } catch {
      toast.error("Failed to reject documents");
    } finally {
      setIsDocRejecting(false);
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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Approved
        </span>
      );
    }
    if (s.includes("SUSPEND") || s.includes("REJECT") || s.includes("INFECTED")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 ring-1 ring-rose-200/80 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          {s.includes("REJECT") ? "Rejected" : "Suspended"}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200/80 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
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
                  Application Dossier: {name}
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
                  <div className="flex items-center gap-4 min-w-0">
                    <Avatar className="h-12 w-12 ring-2 ring-primary/10 shadow-sm flex-shrink-0">
                      {profilePicture && <AvatarImage src={profilePicture} alt={name} className="object-cover" />}
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                        {initial}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(appState)}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                          <ShieldCheck size={12} className="text-emerald-600" />
                          Account Status: {accountState === "VERIFIED" ? "Verified" : accountState}
                        </span>
                        {userBadges.map((badgeName) => (
                          <span
                            key={badgeName}
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                              badgeName.includes("Elite")
                                ? "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300"
                                : "bg-amber-100 text-amber-800 ring-1 ring-amber-300"
                            }`}
                            title={badgeName}
                          >
                            {badgeName}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-600 flex-wrap">
                        <span className="flex items-center gap-1.5 truncate" title={`ID: ${userId || "—"}`}>
                          <Mail size={13} className="text-gray-400" />
                          {email}
                        </span>
                        <span className="flex items-center gap-1.5 truncate">
                          <Phone size={13} className="text-gray-400" />
                          {phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-start sm:items-end gap-2 shrink-0">
                    {appState === "ACTIVE" && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setIsSubscriptionModalOpen(true)}
                        className="h-8 text-xs font-semibold text-purple-700 border-purple-200 hover:bg-purple-50 hover:text-purple-800 gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Gift size={13} className="text-purple-600" />
                        Manage Free Access
                      </Button>
                    )}
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
                      vehicles={vehicles}
                      appState={appState}
                      getStatusBadge={getStatusBadge}
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
                      selectedDocumentIds={selectedDocumentIds}
                      handleSelectAllDocuments={handleSelectAllDocuments}
                      handleToggleDocumentSelect={handleToggleDocumentSelect}
                      handleApproveDocuments={handleApproveDocuments}
                      handleOpenRejectDocumentsModal={handleOpenRejectDocumentsModal}
                      isDocApproving={isDocApproving}
                      isDocRejecting={isDocRejecting}
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
              className="rounded-xl px-5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border-gray-200 shadow-2xs cursor-pointer"
            >
              Close
            </Button>

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

      {/* Document Rejection Reason Modal */}
      <CustomModal
        isOpen={isDocRejectModalOpen}
        onOpenChange={setIsDocRejectModalOpen}
        title="Reject Document(s)"
        description={`Provide a remediation reason for rejecting ${pendingRejectDocIds.length} document(s).`}
        size="md"
        submitLabel="Confirm Document Rejection"
        onSubmit={(e) => {
          e.preventDefault();
          handleConfirmRejectDocuments();
        }}
        isSubmitting={isDocRejecting}
      >
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              Quick Reasons
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "Unreadable / Blurry", reason: "Document is unreadable, blurry, or low quality" },
                { label: "Expired Document", reason: "Document has expired and is no longer valid" },
                { label: "Wrong Document", reason: "Incorrect document type uploaded" },
                { label: "Name Mismatch", reason: "Name on document does not match account applicant" },
                { label: "Missing Pages", reason: "Document is incomplete or missing pages/back side" },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setDocRejectReason(item.reason)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
                    docRejectReason === item.reason
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
              Remediation Note / Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={docRejectReason}
              onChange={(e) => setDocRejectReason(e.target.value)}
              placeholder="e.g. Document is unreadable, blurry, or low quality"
              rows={3}
              className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none bg-zinc-50/50"
              required
            />
            <p className="text-[11px] text-gray-400">
              The driver will receive this remediation note to upload an updated document.
            </p>
          </div>
        </div>
      </CustomModal>

      {/* Standalone Interactive File & PDF Preview Dialog */}
      <FilePreviewModal
        previewFile={previewFile}
        onOpenChange={(open) => setPreviewFile((prev) => ({ ...prev, isOpen: open }))}
        onApprove={(docId) => handleApproveDocuments([docId])}
        onReject={(docId) => handleOpenRejectDocumentsModal([docId])}
      />

      {/* Grant/Revoke Free Subscription Modal */}
      <GrantFreeSubscriptionModal
        userId={userId}
        userName={name}
        userEmail={email}
        currentSubscription={
          (data?.subscription as unknown) ||
          (user as { subscription?: unknown })?.subscription ||
          fallbackData?.subscription
        }
        isOpen={isSubscriptionModalOpen}
        onOpenChange={setIsSubscriptionModalOpen}
      />
    </>
  );
}
