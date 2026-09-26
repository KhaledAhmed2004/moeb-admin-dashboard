"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import api from "@/lib/axios";
import {
  ArrowLeft,
  Mail,
  Phone,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Ban,
  Gift,
  Car,
  FileCheck,
  Star,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Briefcase,
  Building2,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ApplicationUserDetails,
  ApplicationVehicle,
  ApplicationDocument,
  ApplicationServiceArea,
  PreviewFileState,
} from "../types";
import { Chauffeur } from "../columns";
import { ChauffeurOverviewTab } from "../components/details-tabs/ChauffeurOverviewTab";
import { ChauffeurVehiclesTab } from "../components/details-tabs/ChauffeurVehiclesTab";
import { ChauffeurDocumentsTab } from "../components/details-tabs/ChauffeurDocumentsTab";
import { FilePreviewModal } from "../components/details-tabs/FilePreviewModal";
import { GrantFreeSubscriptionModal } from "../components/GrantFreeSubscriptionModal";
import { CustomModal } from "@/components/shared/CustomModal";

export default function ChauffeurDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = (params?.id as string) || "";
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("overview");
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
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
  const [isDocApproving, setIsDocApproving] = useState(false);
  const [isDocRejecting, setIsDocRejecting] = useState(false);

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
    if (!cleanPath.startsWith("/uploads/")) {
      cleanPath = `/uploads${cleanPath}`;
    }
    return `${origin}${cleanPath}`;
  };

  // Fetch Chauffeur Details
  const { data, isLoading, isError, refetch } = useQuery<Record<string, unknown>>({
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
    enabled: !!userId,
  });

  // Approve Full Application
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

  // Reject Application
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

  // Suspend User
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

  // Reactivate User
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

  // Approve Vehicles
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

  // Reject Vehicles
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

  // Data extraction
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

  const serviceAreaName =
    typeof serviceArea === "string"
      ? serviceArea
      : (serviceArea as { areaName?: string })?.areaName ||
        (user as unknown as { serviceAreaName?: string })?.serviceAreaName ||
        (user as unknown as { serviceArea?: string })?.serviceArea ||
        "";

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

  const name = user?.name || "Chauffeur";
  const email = user?.email || "—";
  const phone = user?.phone || "—";
  const profilePicture =
    user?.profilePicture ||
    (data as unknown as { profilePicture?: string; profile?: string })?.profilePicture ||
    (data as unknown as { profilePicture?: string; profile?: string })?.profile;

  const appState = (
    user?.appState ||
    user?.status ||
    (data as unknown as { appState?: string; status?: string })?.appState ||
    (data as unknown as { appState?: string; status?: string })?.status ||
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
    (data as unknown as { createdAt?: string })?.createdAt;
  const updatedAt = user?.updatedAt || (data as unknown as { updatedAt?: string })?.updatedAt;
  const initial = (name?.[0] || "C").toUpperCase();

  const userBadges: string[] =
    Array.isArray(user?.badges) && user.badges.length > 0
      ? user.badges
      : user?.badge
      ? [user.badge]
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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Approved
        </span>
      );
    }
    if (s.includes("SUSPEND") || s.includes("REJECT") || s.includes("INFECTED")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 ring-1 ring-rose-200 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          {s.includes("REJECT") ? "Rejected" : "Suspended"}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Pending Review
      </span>
    );
  };

  if (isError) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/chauffeur")}
          className="gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} /> Back to Users
        </Button>
        <div className="p-8 rounded-2xl border border-rose-200 bg-rose-50/50 text-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-gray-900">User Dossier Not Found</h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Unable to locate chauffeur records for ID: <span className="font-mono text-xs">{userId}</span>. The account may have been removed or the ID is invalid.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => refetch()} className="gap-1.5">
              <RefreshCw size={14} /> Retry
            </Button>
            <Button onClick={() => router.push("/dashboard/chauffeur")}>
              Return to Users List
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 w-full bg-background">
      {/* Top Navigation Bar with Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/chauffeur">Users</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-gray-900 truncate max-w-[200px]">
                {name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Hero Profile Card */}
      {isLoading ? (
        <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4 min-w-0">
              <Avatar className="h-16 w-16 ring-4 ring-primary/10 shadow-sm shrink-0">
                {profilePicture && <AvatarImage src={profilePicture} alt={name} className="object-cover" />}
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                  {initial}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2 min-w-0">
                {/* Level 1: Primary Identity & System Status */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight truncate">{name}</h1>
                  {getStatusBadge(appState)}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                    <ShieldCheck size={12} className="text-emerald-600" />
                    {accountState === "VERIFIED" ? "Verified" : accountState}
                  </span>
                  {userBadges.map((badgeName) => (
                    <span
                      key={badgeName}
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        badgeName.includes("Elite")
                          ? "bg-amber-100 text-amber-900 ring-1 ring-amber-300"
                          : "bg-yellow-50 text-yellow-800 ring-1 ring-yellow-300"
                      }`}
                    >
                      {badgeName}
                    </span>
                  ))}
                </div>

                {/* Level 2: Professional Role & Organization */}
                <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
                  {companyName && companyName !== "N/A" && (
                    <>
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 size={13} className="text-gray-400" />
                        <span className="text-gray-400 font-medium">Company:</span>
                        <span className="font-semibold text-gray-800">{companyName}</span>
                      </span>
                      <span className="text-gray-300">•</span>
                    </>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase size={13} className="text-gray-400" />
                    <span className="text-gray-400 font-medium">Role:</span>
                    <span className="font-semibold text-gray-800">{companyRole}</span>
                  </span>
                </div>

                {/* Level 3: Contact Channels & Account History */}
                <div className="flex items-center gap-3.5 text-xs text-gray-500 flex-wrap pt-0.5">
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Mail size={13} className="text-gray-400" />
                    {email}
                  </a>
                  <span className="text-gray-300">•</span>
                  <a
                    href={`tel:${phone}`}
                    className="inline-flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Phone size={13} className="text-gray-400" />
                    {phone}
                  </a>
                  {createdAt && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="inline-flex items-center gap-1.5 text-gray-500">
                        <Calendar size={13} className="text-gray-400" />
                        Joined <span className="font-medium text-gray-700">{new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Service Area Location Badge & Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-center gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100">
              {/* Service Area Pill */}
              {serviceAreaName && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
                  <MapPin size={13} className="text-blue-600 shrink-0" />
                  <span className="text-blue-500 font-normal">Service Area:</span>
                  <span className="font-semibold">{serviceAreaName}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {appState === "PENDING" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRejectReason("Failed background check — invalid TLC records");
                        setIsRejectModalOpen(true);
                      }}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 rounded-xl text-xs font-semibold h-9 px-4 cursor-pointer"
                    >
                      {rejectMutation.isPending ? (
                        <Loader2 size={14} className="animate-spin mr-1.5" />
                      ) : (
                        <Ban size={14} className="mr-1.5" />
                      )}
                      Reject Application
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => userId && approveMutation.mutate(userId)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold h-9 px-5 shadow-xs cursor-pointer"
                    >
                      {approveMutation.isPending ? (
                        <Loader2 size={14} className="animate-spin mr-1.5" />
                      ) : (
                        <CheckCircle2 size={14} className="mr-1.5" />
                      )}
                      Approve Full Application
                    </Button>
                  </>
                )}

                {(appState === "APPROVED" || appState === "ACTIVE" || appState === "VERIFIED") && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSubscriptionModalOpen(true)}
                      className="h-9 text-xs font-semibold text-purple-700 border-purple-200 hover:bg-purple-50 hover:text-purple-800 rounded-xl gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Gift size={14} className="text-purple-600" />
                      Manage Free Access
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSuspendNote("Account suspended due to compliance/policy review");
                        setIsSuspendModalOpen(true);
                      }}
                      disabled={suspendMutation.isPending}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 rounded-xl text-xs font-semibold h-9 px-4 cursor-pointer"
                    >
                      {suspendMutation.isPending ? (
                        <Loader2 size={14} className="animate-spin mr-1.5" />
                      ) : (
                        <Ban size={14} className="mr-1.5" />
                      )}
                      Suspend Account
                    </Button>
                  </>
                )}

                {(appState === "SUSPENDED" || appState === "REJECTED") && (
                  <Button
                    size="sm"
                    onClick={() => userId && reactivateMutation.mutate(userId)}
                    disabled={reactivateMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold h-9 px-5 shadow-xs cursor-pointer"
                  >
                    {reactivateMutation.isPending ? (
                      <Loader2 size={14} className="animate-spin mr-1.5" />
                    ) : (
                      <CheckCircle2 size={14} className="mr-1.5" />
                    )}
                    Reactivate Account
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            <div className="p-3 rounded-xl bg-zinc-50 border border-gray-100 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700 shrink-0">
                <Car size={18} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-500">Fleet Size</p>
                <p className="text-base font-bold text-gray-900">{vehicles.length} Vehicles</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 border border-gray-100 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                <FileCheck size={18} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-500">Documents</p>
                <p className="text-base font-bold text-gray-900">{documents.length} Files</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 border border-gray-100 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                <Star size={18} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-500">Rating</p>
                <p className="text-base font-bold text-gray-900">
                  {avgRating.toFixed(1)} <span className="text-xs font-normal text-gray-500">({totalReviews})</span>
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 border border-gray-100 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-700 shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-500">Compliance</p>
                <p className="text-base font-bold text-gray-900">
                  {documents.every((d) => d.status === "APPROVED") ? "100% Verified" : "Review Needed"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Tabs Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start bg-zinc-100 p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg text-xs font-semibold px-5 py-2 cursor-pointer">
              Overview
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="rounded-lg text-xs font-semibold px-5 py-2 flex items-center gap-2 cursor-pointer">
              Vehicles
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary font-bold">
                {vehicles.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="rounded-lg text-xs font-semibold px-5 py-2 flex items-center gap-2 cursor-pointer">
              Documents
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary font-bold">
                {documents.length}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: OVERVIEW */}
          <TabsContent value="overview" className="mt-6">
            <ChauffeurOverviewTab
              user={user}
              serviceArea={serviceArea}
              fallbackData={data as unknown as Chauffeur}
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
              subscription={data?.subscription || (data?.user as unknown as { subscription?: unknown })?.subscription}
            />
          </TabsContent>

          {/* TAB 2: VEHICLES */}
          <TabsContent value="vehicles" className="mt-6">
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
          <TabsContent value="documents" className="mt-6">
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
      </div>

      {/* Single-Level Clean File Preview Modal */}
      <FilePreviewModal
        previewFile={previewFile}
        onOpenChange={(open) => setPreviewFile((prev) => ({ ...prev, isOpen: open }))}
        onApprove={(docId) => handleApproveDocuments([docId])}
        onReject={(docId) => handleOpenRejectDocumentsModal([docId])}
      />

      {/* Grant Complimentary Access Modal */}
      <GrantFreeSubscriptionModal
        userId={userId}
        userName={name}
        userEmail={email}
        currentSubscription={
          (data?.subscription as any) ||
          (user as { subscription?: any })?.subscription
        }
        isOpen={isSubscriptionModalOpen}
        onOpenChange={setIsSubscriptionModalOpen}
      />

      {/* Application Rejection Modal */}
      <CustomModal
        isOpen={isRejectModalOpen}
        onOpenChange={setIsRejectModalOpen}
        title="Reject Chauffeur Application"
        description="Specify the justification for rejecting this chauffeur application."
        size="md"
        submitLabel="Confirm Rejection"
        onSubmit={(e) => {
          e.preventDefault();
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

      {/* Suspend Account Modal */}
      <CustomModal
        isOpen={isSuspendModalOpen}
        onOpenChange={setIsSuspendModalOpen}
        title="Suspend Chauffeur Account"
        description="Provide a compliance or administrative reason for suspending this user."
        size="md"
        submitLabel="Confirm Suspension"
        onSubmit={(e) => {
          e.preventDefault();
          const finalNote =
            suspendNote.trim() || "Account suspended due to compliance/policy review";
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
              placeholder="e.g. Compliance review or customer incident report"
              rows={4}
              className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none bg-zinc-50/50"
              required
            />
            <p className="text-[11px] text-gray-400">
              The user will lose chauffeur dispatch permissions immediately while suspended.
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
          </div>
        </div>
      </CustomModal>
    </div>
  );
}
