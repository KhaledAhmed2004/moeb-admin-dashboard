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
import {
  Mail,
  Phone,
  Building2,
  Briefcase,
  Globe,
  Award,
  Calendar,
  Star,
  ShieldCheck,
  Car,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  MapPin,
  FileCheck,
  ExternalLink,
  Shield,
  Layers,
  Image as ImageIcon,
  CreditCard,
  Ban,
  UserCheck,
  Loader2,
  Eye,
  Download,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Chauffeur } from "./columns";

export interface VehicleRegistration {
  image?: string;
  expiryDate?: string;
  _id?: string;
}

export interface CommercialInsurance {
  image?: string;
  expiryDate?: string;
  _id?: string;
}

export interface VehiclePhotos {
  frontView?: string;
  rearView?: string;
  interiorView?: string;
  _id?: string;
}

export interface ApplicationVehicle {
  _id: string;
  owner?: string;
  type?: string;
  makeAndModel?: string;
  colorInside?: string;
  colorOutside?: string;
  year?: number;
  licensePlate?: string;
  licensePlateRaw?: string;
  vehicleRegistration?: VehicleRegistration;
  commercialInsurance?: CommercialInsurance;
  photos?: VehiclePhotos;
  status?: string;
  rejectionReason?: string | null;
  version?: number;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApplicationDocument {
  _id: string;
  userId?: string;
  entityId?: string | null;
  documentType: string;
  storageKey?: string;
  originalFilename?: string;
  mimeType?: string;
  sizeBytes?: number;
  expiryDate?: string;
  status: string;
  version?: number;
  scanResult?: unknown;
  scanAttempts?: number;
  rejectionReason?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApplicationServiceArea {
  _id: string;
  areaName: string;
  cities?: string[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApplicationUserDetails {
  _id?: string;
  id?: string;
  name: string;
  role?: string;
  email: string;
  phone: string;
  serviceAreaId?: string;
  languages?: string[];
  experience?: number;
  companyName?: string;
  companyRole?: string;
  profilePicture?: string;
  accountState?: string;
  appState?: string;
  status?: string;
  suspensionOrigin?: string | null;
  deviceTokens?: string[];
  selectedVehicle?: string;
  averageRating?: number;
  totalReviews?: number;
  paymentMethods?: {
    cardPayment?: {
      status?: string;
    };
  };
  loginAttempts?: number;
  lockUntil?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApplicationDetailsData {
  user?: ApplicationUserDetails;
  vehicles?: ApplicationVehicle[];
  documents?: ApplicationDocument[];
  serviceArea?: ApplicationServiceArea;
  subscription?: unknown;
  reviewSummary?: {
    averageRating?: number;
    totalReviews?: number;
  };
}

interface ChauffeurDetailModalProps {
  userId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  fallbackData?: Chauffeur;
}

export function ChauffeurDetailModal({
  userId,
  isOpen,
  onOpenChange,
  fallbackData,
}: ChauffeurDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [previewFile, setPreviewFile] = useState<{
    isOpen: boolean;
    title: string;
    url: string;
    isPdf: boolean;
  }>({
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
      combined.includes("/pdf")
    );
  };

  const resolveFileUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";
    const origin = apiBase.replace(/\/api\/v1\/?$/, "");
    const cleanPath = url.replace(/^\/+/, "/");
    return `${origin}${cleanPath}`;
  };

  const { data, isLoading } = useQuery<ApplicationDetailsData>({
    queryKey: ["admin-chauffeur-details", userId],
    queryFn: async () => {
      if (!userId) throw new Error("No user ID provided");
      try {
        const response = await api.get(`/admin/chauffeurs/${userId}`);
        return response.data?.data;
      } catch {
        const response = await api.get(`/admin/applications/${userId}`);
        return response.data?.data;
      }
    },
    enabled: isOpen && !!userId,
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const res = await api.post(`/admin/chauffeurs/${id}/approve`);
        return res.data;
      } catch {
        try {
          const res = await api.post(`/admin/applications/${id}/approve`);
          return res.data;
        } catch {
          try {
            const res = await api.patch(`/admin/chauffeurs/${id}/approve`);
            return res.data;
          } catch {
            const res = await api.patch(`/admin/applications/${id}/approve`);
            return res.data;
          }
        }
      }
    },
    onSuccess: (resData) => {
      toast.success(resData?.message || "User approved successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-details", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-application-details", userId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to approve chauffeur application");
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const res = await api.post(`/admin/chauffeurs/${id}/reject`, {
          reason: "Application rejected by admin inspection",
        });
        return res.data;
      } catch {
        try {
          const res = await api.post(`/admin/chauffeurs/${id}/suspend`);
          return res.data;
        } catch {
          try {
            const res = await api.patch(`/admin/applications/${id}/suspend`);
            return res.data;
          } catch {
            const res = await api.patch(`/admin/users/${id}`, { status: "SUSPENDED", appState: "SUSPENDED" });
            return res.data;
          }
        }
      }
    },
    onSuccess: (resData) => {
      toast.success(resData?.message || "Chauffeur application rejected successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-details", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-application-details", userId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to reject application");
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const res = await api.post(`/admin/chauffeurs/${id}/activate`);
        return res.data;
      } catch {
        try {
          const res = await api.patch(`/admin/chauffeurs/${id}/activate`);
          return res.data;
        } catch {
          try {
            const res = await api.patch(`/admin/applications/${id}/activate`);
            return res.data;
          } catch {
            const res = await api.patch(`/admin/users/${id}`, { status: "APPROVED", appState: "APPROVED" });
            return res.data;
          }
        }
      }
    },
    onSuccess: (resData) => {
      toast.success(resData?.message || "Chauffeur account reactivated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-details", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-application-details", userId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to reactivate chauffeur");
    },
  });

  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [isBatchApproving, setIsBatchApproving] = useState(false);

  const handleToggleVehicleSelect = (id: string) => {
    setSelectedVehicleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllVehicles = () => {
    if (selectedVehicleIds.length === (data?.vehicles?.length || 0)) {
      setSelectedVehicleIds([]);
    } else {
      setSelectedVehicleIds((data?.vehicles || []).map((v) => v._id).filter(Boolean) as string[]);
    }
  };

  const approveSingleVehicle = async (vehicleId: string) => {
    try {
      const res = await api.post(`/admin/vehicles/${vehicleId}/approve`);
      return res.data;
    } catch {
      try {
        const res = await api.patch(`/admin/vehicles/${vehicleId}/approve`);
        return res.data;
      } catch {
        const res = await api.patch(`/admin/vehicles/${vehicleId}`, { status: "APPROVED" });
        return res.data;
      }
    }
  };

  const rejectSingleVehicle = async (vehicleId: string, reason?: string) => {
    try {
      const res = await api.post(`/admin/vehicles/${vehicleId}/reject`, {
        reason: reason || "Vehicle rejected by admin inspection",
      });
      return res.data;
    } catch {
      try {
        const res = await api.patch(`/admin/vehicles/${vehicleId}/reject`, {
          reason: reason || "Vehicle rejected by admin inspection",
        });
        return res.data;
      } catch {
        const res = await api.patch(`/admin/vehicles/${vehicleId}`, { status: "REJECTED" });
        return res.data;
      }
    }
  };

  const approveVehicleMutation = useMutation({
    mutationFn: (vehicleId: string) => approveSingleVehicle(vehicleId),
    onSuccess: (data) => {
      toast.success(data?.message || "Vehicle approved successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-details", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-application-details", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-applications"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to approve vehicle");
    },
  });

  const rejectVehicleMutation = useMutation({
    mutationFn: (vehicleId: string) => rejectSingleVehicle(vehicleId),
    onSuccess: (data) => {
      toast.success(data?.message || "Vehicle rejected successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-details", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-application-details", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-applications"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to reject vehicle");
    },
  });

  const handleBatchApproveVehicles = async () => {
    if (!selectedVehicleIds.length) return;
    setIsBatchApproving(true);
    try {
      try {
        const res = await api.post(`/admin/vehicles/approve`, {
          vehicleIds: selectedVehicleIds,
        });
        const approvedCount = res.data?.data?.approvedCount || selectedVehicleIds.length;
        toast.success(res.data?.message || `${approvedCount} vehicle(s) approved successfully!`);
      } catch {
        // Fallback to concurrent individual approvals
        const results = await Promise.allSettled(
          selectedVehicleIds.map((id) => approveSingleVehicle(id))
        );
        const count = results.filter((r) => r.status === "fulfilled").length;
        toast.success(`${count} vehicle(s) approved successfully!`);
      }
      setSelectedVehicleIds([]);
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-details", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-application-details", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-applications"] });
    } catch {
      toast.error("Failed to approve selected vehicles");
    } finally {
      setIsBatchApproving(false);
    }
  };

  const handleBatchRejectVehicles = async () => {
    if (!selectedVehicleIds.length) return;
    setIsBatchApproving(true);
    try {
      const results = await Promise.allSettled(
        selectedVehicleIds.map((id) => rejectSingleVehicle(id))
      );
      const count = results.filter((r) => r.status === "fulfilled").length;
      toast.success(`${count} vehicle(s) rejected successfully!`);
      setSelectedVehicleIds([]);
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-details", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-application-details", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-applications"] });
    } catch {
      toast.error("Failed to reject vehicles");
    } finally {
      setIsBatchApproving(false);
    }
  };

  const user = data?.user;
  const vehicles = data?.vehicles || [];
  const documents = data?.documents || [];
  const serviceArea = data?.serviceArea;
  const reviewSummary = data?.reviewSummary;

  // Resolved user info
  const name = user?.name || fallbackData?.name || "Chauffeur";
  const email = user?.email || fallbackData?.email || "—";
  const phone = user?.phone || fallbackData?.phone || "—";
  const profilePicture = user?.profilePicture || fallbackData?.profilePicture || fallbackData?.profile;
  const appState = (user?.appState || user?.status || fallbackData?.status || "PENDING").toUpperCase();
  const accountState = (user?.accountState || "VERIFIED").toUpperCase();
  const companyRole = user?.companyRole || fallbackData?.companyRole || "Chauffeur";
  const companyName = user?.companyName || "N/A";
  const experience = user?.experience !== undefined ? `${user.experience} Years` : "N/A";
  const languages = user?.languages?.length ? user.languages.join(", ") : "English";
  const avgRating = reviewSummary?.averageRating ?? user?.averageRating ?? 0;
  const totalReviews = reviewSummary?.totalReviews ?? user?.totalReviews ?? 0;
  const createdAt = user?.createdAt || fallbackData?.createdAt || fallbackData?.joined;
  const updatedAt = user?.updatedAt;
  const initial = (name?.[0] || "C").toUpperCase();

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
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
          Approved
        </span>
      );
    }
    if (s.includes("SUSPEND") || s.includes("REJECT") || s.includes("INFECTED")) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 ring-1 ring-rose-200">
          {s.includes("REJECT") ? "Rejected" : "Suspended"}
        </span>
      );
    }
    if (s === "SCANNING_PENDING") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200">
          Scanning Pending
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200">
        Pending Review
      </span>
    );
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        onClick={(e) => e.stopPropagation()}
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
                <TabsContent value="overview" className="mt-4 space-y-4">
                  {/* Credentials Grid */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
                      Professional & Identity Credentials
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-xs">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                          Company
                        </span>
                        <p className="text-sm font-semibold text-gray-900">{companyName}</p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-xs">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                          Company Role
                        </span>
                        <p className="text-sm font-semibold text-gray-900">{companyRole || "Chauffeur"}</p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-xs">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                          Languages
                        </span>
                        <p className="text-sm font-semibold text-gray-900 truncate" title={languages}>
                          {languages}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-xs">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                          Primary Vehicle
                        </span>
                        <p className="text-xs font-mono font-semibold text-gray-800 truncate" title={user?.selectedVehicle}>
                          {user?.selectedVehicle ? `#${user.selectedVehicle.slice(-8).toUpperCase()}` : "None Assigned"}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-xs">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                          Service Area
                        </span>
                        <p className="text-sm font-semibold text-gray-900">
                          {serviceArea?.areaName || "Unassigned"}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-xs">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                          Rating & Reviews
                        </span>
                        <p className="text-sm font-semibold text-gray-900">
                          {avgRating.toFixed(1)} ★{" "}
                          <span className="text-xs text-gray-400 font-normal">({totalReviews} reviews)</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Operational Performance Stats */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
                      Operational Performance & Earnings
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-xs">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                          Jobs Dispatched
                        </span>
                        <p className="text-base font-bold text-gray-900">
                          {fallbackData?.stats?.totalJobsCreated ?? 0}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-xs">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                          Completed Rides
                        </span>
                        <p className="text-base font-bold text-emerald-700">
                          {fallbackData?.stats?.totalJobsCompleted ?? fallbackData?.trips ?? 0}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-xs">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                          Total Earnings
                        </span>
                        <p className="text-base font-bold text-indigo-700">
                          ${(fallbackData?.stats?.earnings ?? 0).toLocaleString()}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-xs">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                          Payout Balance
                        </span>
                        <p className="text-base font-bold text-gray-900">
                          ${(fallbackData?.stats?.payout ?? 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
                      Timestamps & Record Lifecycle
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-xs">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                          Created At
                        </span>
                        <p className="text-sm font-medium text-gray-800">
                          {createdAt
                            ? new Date(createdAt).toLocaleString("en-US", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })
                            : "—"}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-xs">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                          Last Profile Update
                        </span>
                        <p className="text-sm font-medium text-gray-800">
                          {updatedAt
                            ? new Date(updatedAt).toLocaleString("en-US", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* TAB 2: VEHICLES */}
                <TabsContent value="vehicles" className="mt-4 space-y-4">
                  {vehicles.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-gray-100">
                      <Car size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-sm font-medium text-gray-600">No vehicles registered yet</p>
                    </div>
                  ) : (
                    <>
                      {/* Vehicle Selection & Batch Approval Toolbar */}
                      <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-gray-50/80 border border-gray-200/80 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="select-all-vehicles"
                              checked={
                                vehicles.length > 0 && selectedVehicleIds.length === vehicles.length
                              }
                              onCheckedChange={handleSelectAllVehicles}
                            />
                            <label
                              htmlFor="select-all-vehicles"
                              className="text-xs font-bold text-gray-700 cursor-pointer select-none"
                            >
                              Select All Vehicles ({vehicles.length})
                            </label>
                          </div>
                          {selectedVehicleIds.length > 0 && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary">
                              {selectedVehicleIds.length} Selected
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {selectedVehicleIds.length > 0 && (
                            <>
                              <Button
                                size="sm"
                                onClick={handleBatchApproveVehicles}
                                disabled={isBatchApproving}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold h-8 gap-1.5 shadow-xs"
                              >
                                {isBatchApproving ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <CheckCircle2 size={13} />
                                )}
                                Approve Selected ({selectedVehicleIds.length})
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleBatchRejectVehicles}
                                disabled={isBatchApproving}
                                className="text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl text-xs font-semibold h-8 gap-1.5"
                              >
                                <Ban size={13} />
                                Reject Selected
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Vehicle Cards */}
                      {vehicles.map((v, idx) => {
                        const isSelected = user?.selectedVehicle === v._id;
                        const isChecked = selectedVehicleIds.includes(v._id || "");
                        return (
                          <div
                            key={v._id || idx}
                            className={`p-5 rounded-2xl border bg-white shadow-xs space-y-4 transition-all ${
                              isChecked
                                ? "ring-2 ring-primary border-primary/50 bg-primary/[0.01]"
                                : isSelected
                                ? "ring-1 ring-purple-300 border-purple-200"
                                : "border-gray-100"
                            }`}
                          >
                            {/* Vehicle Header */}
                            <div className="flex items-start justify-between gap-3 flex-wrap border-b pb-3">
                              <div className="flex items-center gap-3">
                                {/* Individual Checkbox */}
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={() => v._id && handleToggleVehicleSelect(v._id)}
                                  className="mt-0.5"
                                />

                                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
                                  <Car size={20} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-bold text-base text-gray-900">
                                      {v.makeAndModel || "Unknown Vehicle"} ({v.year || "—"})
                                    </h4>
                                    <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700">
                                      {v.type || "Sedan"}
                                    </span>
                                    {isSelected && (
                                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 ring-1 ring-purple-300">
                                        ★ Active Vehicle
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                                    ID: {v._id} • Added:{" "}
                                    {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : "—"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                <div>{getStatusBadge(v.status || "PENDING_REVIEW")}</div>

                                {v.status !== "APPROVED" && v._id && (
                                  <button
                                    onClick={() => approveVehicleMutation.mutate(v._id!)}
                                    disabled={approveVehicleMutation.isPending}
                                    className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                    title="Approve this vehicle"
                                  >
                                    <CheckCircle2 size={13} /> Approve
                                  </button>
                                )}

                                {v.status !== "REJECTED" && v._id && (
                                  <button
                                    onClick={() => rejectVehicleMutation.mutate(v._id!)}
                                    disabled={rejectVehicleMutation.isPending}
                                    className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                    title="Reject this vehicle"
                                  >
                                    <Ban size={13} /> Reject
                                  </button>
                                )}
                              </div>
                            </div>

                          {/* Vehicle Spec Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100">
                              <span className="text-gray-400 uppercase font-semibold text-[10px]">License Plate</span>
                              <p className="font-bold text-gray-900 mt-0.5">{v.licensePlate || v.licensePlateRaw || "N/A"}</p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100">
                              <span className="text-gray-400 uppercase font-semibold text-[10px]">Outside Color</span>
                              <p className="font-bold text-gray-900 mt-0.5">{v.colorOutside || "N/A"}</p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100">
                              <span className="text-gray-400 uppercase font-semibold text-[10px]">Inside Color</span>
                              <p className="font-bold text-gray-900 mt-0.5">{v.colorInside || "N/A"}</p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100">
                              <span className="text-gray-400 uppercase font-semibold text-[10px]">Registration Expiry</span>
                              <p className="font-bold text-gray-900 mt-0.5">
                                {v.vehicleRegistration?.expiryDate
                                  ? new Date(v.vehicleRegistration.expiryDate).toLocaleDateString()
                                  : "N/A"}
                              </p>
                            </div>
                          </div>

                          {/* Insurance & Registration preview with PDF/Image handling */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            {/* Commercial Insurance */}
                            {(() => {
                              const rawUrl = v.commercialInsurance?.image;
                              const fileUrl = resolveFileUrl(rawUrl);
                              const isPdf = isPdfFile(rawUrl);
                              return (
                                <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/60 flex items-center justify-between gap-3">
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <p className="font-bold text-gray-900 text-xs">Commercial Insurance</p>
                                      <span
                                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                          isPdf
                                            ? "bg-rose-100 text-rose-700 ring-1 ring-rose-200"
                                            : "bg-blue-100 text-blue-700 ring-1 ring-blue-200"
                                        }`}
                                      >
                                        {isPdf ? "PDF" : "IMAGE"}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-0.5">
                                      Expires:{" "}
                                      {v.commercialInsurance?.expiryDate
                                        ? new Date(v.commercialInsurance.expiryDate).toLocaleDateString()
                                        : "N/A"}
                                    </p>
                                  </div>
                                  {fileUrl && (
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        onClick={() =>
                                          setPreviewFile({
                                            isOpen: true,
                                            title: `${v.makeAndModel || "Vehicle"} - Commercial Insurance`,
                                            url: fileUrl,
                                            isPdf,
                                          })
                                        }
                                        className="px-2.5 py-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                      >
                                        <Eye size={12} /> Preview
                                      </button>
                                      <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                                        title="Open in new tab"
                                      >
                                        <ExternalLink size={13} />
                                      </a>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                            {/* Vehicle Registration */}
                            {(() => {
                              const rawUrl = v.vehicleRegistration?.image;
                              const fileUrl = resolveFileUrl(rawUrl);
                              const isPdf = isPdfFile(rawUrl);
                              return (
                                <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/60 flex items-center justify-between gap-3">
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <p className="font-bold text-gray-900 text-xs">Registration Document</p>
                                      <span
                                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                          isPdf
                                            ? "bg-rose-100 text-rose-700 ring-1 ring-rose-200"
                                            : "bg-blue-100 text-blue-700 ring-1 ring-blue-200"
                                        }`}
                                      >
                                        {isPdf ? "PDF" : "IMAGE"}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-0.5">
                                      Expires:{" "}
                                      {v.vehicleRegistration?.expiryDate
                                        ? new Date(v.vehicleRegistration.expiryDate).toLocaleDateString()
                                        : "N/A"}
                                    </p>
                                  </div>
                                  {fileUrl && (
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        onClick={() =>
                                          setPreviewFile({
                                            isOpen: true,
                                            title: `${v.makeAndModel || "Vehicle"} - Registration Document`,
                                            url: fileUrl,
                                            isPdf,
                                          })
                                        }
                                        className="px-2.5 py-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                      >
                                        <Eye size={12} /> Preview
                                      </button>
                                      <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                                        title="Open in new tab"
                                      >
                                        <ExternalLink size={13} />
                                      </a>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>

                          {/* Vehicle Photos Gallery */}
                          {v.photos && (v.photos.frontView || v.photos.rearView || v.photos.interiorView) && (
                            <div>
                              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Vehicle Inspection Photos
                              </p>
                              <div className="grid grid-cols-3 gap-2">
                                {v.photos.frontView && (
                                  <button
                                    onClick={() =>
                                      setPreviewFile({
                                        isOpen: true,
                                        title: `${v.makeAndModel || "Vehicle"} - Front View`,
                                        url: resolveFileUrl(v.photos!.frontView!),
                                        isPdf: false,
                                      })
                                    }
                                    className="block relative rounded-lg overflow-hidden border border-gray-200 aspect-[4/3] group bg-zinc-100 cursor-pointer"
                                  >
                                    <img
                                      src={resolveFileUrl(v.photos.frontView)}
                                      alt="Front View"
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-medium">
                                      Front
                                    </span>
                                  </button>
                                )}
                                {v.photos.rearView && (
                                  <button
                                    onClick={() =>
                                      setPreviewFile({
                                        isOpen: true,
                                        title: `${v.makeAndModel || "Vehicle"} - Rear View`,
                                        url: resolveFileUrl(v.photos!.rearView!),
                                        isPdf: false,
                                      })
                                    }
                                    className="block relative rounded-lg overflow-hidden border border-gray-200 aspect-[4/3] group bg-zinc-100 cursor-pointer"
                                  >
                                    <img
                                      src={resolveFileUrl(v.photos.rearView)}
                                      alt="Rear View"
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-medium">
                                      Rear
                                    </span>
                                  </button>
                                )}
                                {v.photos.interiorView && (
                                  <button
                                    onClick={() =>
                                      setPreviewFile({
                                        isOpen: true,
                                        title: `${v.makeAndModel || "Vehicle"} - Interior View`,
                                        url: resolveFileUrl(v.photos!.interiorView!),
                                        isPdf: false,
                                      })
                                    }
                                    className="block relative rounded-lg overflow-hidden border border-gray-200 aspect-[4/3] group bg-zinc-100 cursor-pointer"
                                  >
                                    <img
                                      src={resolveFileUrl(v.photos.interiorView)}
                                      alt="Interior View"
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-medium">
                                      Interior
                                    </span>
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    </>
                  )}
                </TabsContent>

                {/* TAB 3: DOCUMENTS */}
                <TabsContent value="documents" className="mt-4 space-y-3">
                  {documents.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-gray-100">
                      <FileText size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-sm font-medium text-gray-600">No documents submitted yet</p>
                    </div>
                  ) : (
                    documents.map((doc, idx) => {
                      const fileUrl = resolveFileUrl(doc.storageKey);
                      const isPdf = Boolean(
                        isPdfFile(doc.storageKey, doc.originalFilename) ||
                        (doc.mimeType && doc.mimeType.includes("pdf"))
                      );
                      return (
                        <div
                          key={doc._id || idx}
                          className="p-4 rounded-xl border border-gray-100 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2.5 rounded-xl flex-shrink-0 mt-0.5 ${
                                isPdf ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-700"
                              }`}
                            >
                              {isPdf ? <FileText size={18} /> : <FileCheck size={18} />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="font-bold text-sm text-gray-900">
                                  {formatDocName(doc.documentType)}
                                </h5>
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                    isPdf
                                      ? "bg-rose-100 text-rose-700 ring-1 ring-rose-200"
                                      : "bg-blue-100 text-blue-700 ring-1 ring-blue-200"
                                  }`}
                                >
                                  {isPdf ? "PDF" : "IMAGE"}
                                </span>
                                {getStatusBadge(doc.status)}
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">
                                File:{" "}
                                <span className="font-mono text-gray-700">
                                  {doc.originalFilename || "document"}
                                </span>{" "}
                                • {formatFileSize(doc.sizeBytes)} •{" "}
                                {doc.mimeType || (isPdf ? "application/pdf" : "image/jpeg")}
                              </p>
                              {doc.expiryDate && (
                                <p className="text-xs text-emerald-700 font-medium mt-1 flex items-center gap-1">
                                  <Calendar size={12} />
                                  Valid until: {new Date(doc.expiryDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>

                          {fileUrl && (
                            <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                              <button
                                onClick={() =>
                                  setPreviewFile({
                                    isOpen: true,
                                    title: formatDocName(doc.documentType),
                                    url: fileUrl,
                                    isPdf,
                                  })
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors cursor-pointer"
                              >
                                <Eye size={13} />
                                Preview
                              </button>
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                              >
                                <ExternalLink size={12} />
                                Open
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </TabsContent>

                {/* TAB 4: SERVICE AREA & VERIFICATION */}
                <TabsContent value="compliance" className="mt-4 space-y-4">
                  {/* Service Area Card */}
                  <div className="p-5 rounded-2xl border border-gray-100 bg-white shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">Operating Service Area</h4>
                          <p className="text-xs text-gray-400 font-mono">
                            Area ID: {serviceArea?._id || user?.serviceAreaId || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div>{getStatusBadge(serviceArea?.status || "ACTIVE")}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-zinc-50">
                        <span className="text-gray-400 font-semibold uppercase text-[10px]">Territory Name</span>
                        <p className="font-bold text-gray-900 text-sm mt-0.5">
                          {serviceArea?.areaName || "New York Metropolitan"}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-zinc-50">
                        <span className="text-gray-400 font-semibold uppercase text-[10px]">Territory Status</span>
                        <p className="font-bold text-emerald-700 text-sm mt-0.5">
                          {serviceArea?.status || "ACTIVE"}
                        </p>
                      </div>
                    </div>

                    {serviceArea?.cities && serviceArea.cities.length > 0 && (
                      <div className="pt-2">
                        <span className="text-gray-400 font-semibold uppercase text-[10px] block mb-1.5">
                          Covered Service Cities
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {serviceArea.cities.map((city, cIdx) => (
                            <span
                              key={cIdx}
                              className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/70"
                            >
                              {city}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Security & Verification Details */}
                  <div className="p-5 rounded-2xl border border-gray-100 bg-white shadow-xs space-y-3">
                    <div className="flex items-center gap-2.5 border-b pb-3">
                      <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
                        <Shield size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">Security & Account Integrity</h4>
                        <p className="text-xs text-gray-400">Lockout, verification, payment methods, and audit logs</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-zinc-50">
                        <span className="text-gray-400 font-semibold uppercase text-[10px]">Account State</span>
                        <p className="font-bold text-gray-900 mt-0.5">{accountState}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-zinc-50">
                        <span className="text-gray-400 font-semibold uppercase text-[10px]">App State</span>
                        <p className="font-bold text-amber-700 mt-0.5">{appState}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-zinc-50">
                        <span className="text-gray-400 font-semibold uppercase text-[10px]">Card Payment</span>
                        <p className="font-bold text-gray-900 mt-0.5">
                          {user?.paymentMethods?.cardPayment?.status || "NOT_ACCEPTED"}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-zinc-50">
                        <span className="text-gray-400 font-semibold uppercase text-[10px]">Login Attempts</span>
                        <p className="font-bold text-gray-900 mt-0.5">{user?.loginAttempts ?? 0}</p>
                      </div>
                    </div>

                    {user?.suspensionOrigin && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs">
                        <AlertTriangle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Suspension Origin</p>
                          <p className="mt-0.5">{user.suspensionOrigin}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <DialogFooter className="p-4 px-6 border-t bg-gray-50/70 flex flex-row items-center justify-between gap-3 w-full">
          {/* Left Side: Close Dismiss Action */}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl px-5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border-gray-200 shadow-2xs"
          >
            Close
          </Button>

          {/* Right Side: Primary Application Decision Actions */}
          <div className="flex items-center gap-2.5 flex-nowrap">
            {appState === "PENDING" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => userId && suspendMutation.mutate(userId)}
                  disabled={approveMutation.isPending || suspendMutation.isPending}
                  className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 rounded-xl text-xs font-semibold px-4 transition-colors whitespace-nowrap"
                >
                  {suspendMutation.isPending && (
                    <Loader2 size={14} className="animate-spin mr-1.5" />
                  )}
                  Reject Application
                </Button>

                <Button
                  onClick={() => userId && approveMutation.mutate(userId)}
                  disabled={approveMutation.isPending || suspendMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold px-5 shadow-xs transition-all whitespace-nowrap"
                >
                  {approveMutation.isPending && (
                    <Loader2 size={14} className="animate-spin mr-1.5" />
                  )}
                  Approve Full Application
                </Button>
              </>
            )}

            {appState === "APPROVED" && (
              <Button
                variant="outline"
                onClick={() => userId && suspendMutation.mutate(userId)}
                disabled={suspendMutation.isPending}
                className="text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl text-xs font-semibold px-4 whitespace-nowrap"
              >
                {suspendMutation.isPending && (
                  <Loader2 size={14} className="animate-spin mr-1.5" />
                )}
                Suspend Account
              </Button>
            )}

            {appState === "SUSPENDED" && (
              <Button
                onClick={() => userId && reactivateMutation.mutate(userId)}
                disabled={reactivateMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold px-4 whitespace-nowrap"
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

    {/* Standalone Interactive File & PDF Preview Dialog */}
    <Dialog open={previewFile.isOpen} onOpenChange={(open) => setPreviewFile((prev) => ({ ...prev, isOpen: open }))}>
      <DialogContent className="max-w-4xl max-h-[92vh] p-0 overflow-hidden flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200">
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between pr-10">
          <div className="flex items-center gap-2.5">
            {previewFile.isPdf ? (
              <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                <FileText size={20} />
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                <ImageIcon size={20} />
              </div>
            )}
            <div>
              <DialogTitle className="text-base font-bold text-gray-900">{previewFile.title}</DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {previewFile.isPdf ? "PDF Document Viewer" : "Image Preview"}
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={previewFile.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <ExternalLink size={13} />
              Open Original
            </a>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-4 bg-zinc-900/5 flex items-center justify-center min-h-[420px]">
          {previewFile.isPdf ? (
            <div className="w-full h-[620px] flex flex-col">
              <iframe
                src={previewFile.url}
                title={previewFile.title}
                className="w-full h-full rounded-xl border border-gray-200 bg-white"
              />
            </div>
          ) : (
            <div className="max-h-[620px] flex items-center justify-center">
              <img
                src={previewFile.url}
                alt={previewFile.title}
                className="max-h-[580px] w-auto object-contain rounded-xl shadow-lg border border-gray-200 bg-white"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
