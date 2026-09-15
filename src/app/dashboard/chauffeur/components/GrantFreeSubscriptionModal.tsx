"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Gift,
  Crown,
  Calendar,
  Infinity as InfinityIcon,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  User,
  Mail,
  ShieldCheck,
  Ban,
  Sparkles,
  Clock,
} from "lucide-react";
import api from "@/lib/axios";

export interface GrantFreeSubscriptionModalProps {
  userId: string | null;
  userName?: string;
  userEmail?: string;
  currentSubscription?:
    | string
    | {
        status?: string;
        plan?: string;
        type?: string;
        isPremium?: boolean;
        expiresAt?: string | null;
        platform?: string;
        metadata?: {
          isComplimentary?: boolean;
          durationDays?: number | string;
          grantedAt?: string;
        };
      }
    | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type DurationOption = "7" | "14" | "30" | "90" | "365" | "lifetime" | "custom";

export function GrantFreeSubscriptionModal({
  userId,
  userName = "User",
  userEmail,
  currentSubscription,
  isOpen,
  onOpenChange,
  onSuccess,
}: GrantFreeSubscriptionModalProps) {
  const queryClient = useQueryClient();

  const [selectedDuration, setSelectedDuration] = useState<DurationOption>("30");
  const [customDays, setCustomDays] = useState<string>("60");
  const [activeTab, setActiveTab] = useState<"grant" | "revoke">("grant");
  const [liveSubscription, setLiveSubscription] = useState<Record<string, unknown> | null>(null);

  // Reset live state on modal close/open
  useEffect(() => {
    if (!isOpen) {
      setLiveSubscription(null);
    }
  }, [isOpen]);

  // ─── Query 1: Fetch Live User Details to get populated subscription ───────
  const { data: liveUserData, isLoading: isUserLoading } = useQuery({
    queryKey: ["user-subscription-live", userId],
    queryFn: async () => {
      if (!userId) return null;
      try {
        const res = await api.get(`/user/${userId}`);
        return (res.data?.data ?? res.data) as Record<string, unknown>;
      } catch {
        try {
          const res = await api.get(`/admin/users/${userId}`);
          return (res.data?.data ?? res.data) as Record<string, unknown>;
        } catch {
          return null;
        }
      }
    },
    enabled: isOpen && Boolean(userId),
    staleTime: 5000,
  });

  // ─── Query 2: Search in Admin Subscriptions for accurate subscription record ─
  const { data: matchedAdminSub } = useQuery({
    queryKey: ["admin-subscription-by-user", userId, userEmail],
    queryFn: async () => {
      if (!userId && !userEmail) return null;
      try {
        const res = await api.get("/admin/subscriptions", {
          params: { search: userEmail || userId, limit: 10 },
        });
        const items =
          (res.data?.data?.items as Array<Record<string, unknown>>) ||
          (res.data?.data?.subscriptions as Array<Record<string, unknown>>) ||
          (res.data?.data as Array<Record<string, unknown>>) ||
          (res.data?.items as Array<Record<string, unknown>>) ||
          [];
        if (Array.isArray(items)) {
          return (
            items.find((sub) => {
              const sUserId = sub.userId || (sub.user as { _id?: string })?._id;
              const sEmail = (sub.user as { email?: string })?.email;
              if (sUserId && sUserId === userId) return true;
              if (sEmail && userEmail && sEmail.toLowerCase() === userEmail.toLowerCase()) {
                return true;
              }
              return false;
            }) || null
          );
        }
        return null;
      } catch {
        return null;
      }
    },
    enabled: isOpen && (Boolean(userId) || Boolean(userEmail)),
    staleTime: 5000,
  });

  // ─── Determine Effective Subscription ─────────────────────────────────────
  const effectiveSubscription = React.useMemo(() => {
    if (liveSubscription) return liveSubscription;
    if (matchedAdminSub) return matchedAdminSub;
    if (liveUserData?.subscription && typeof liveUserData.subscription === "object") {
      return liveUserData.subscription as Record<string, unknown>;
    }
    if (
      (liveUserData?.user as { subscription?: unknown })?.subscription &&
      typeof (liveUserData?.user as { subscription?: unknown })?.subscription === "object"
    ) {
      return (liveUserData?.user as { subscription: Record<string, unknown> })?.subscription;
    }
    if (currentSubscription && typeof currentSubscription === "object") {
      return currentSubscription as Record<string, unknown>;
    }
    if (liveUserData && liveUserData.isPremium !== undefined) {
      return {
        isPremium: liveUserData.isPremium,
        plan: liveUserData.plan,
        status: liveUserData.isPremium ? "active" : "inactive",
        expiresAt: liveUserData.expiresAt,
      };
    }
    return null;
  }, [liveSubscription, matchedAdminSub, liveUserData, currentSubscription]);

  // ─── Extract Detailed Subscription Insights ───────────────────────────────
  const subDetails = React.useMemo(() => {
    if (!effectiveSubscription) {
      return {
        isLifetime: false,
        isComplimentary: false,
        isActive: false,
        isPremium: false,
        plan: "free",
        status: "none",
        expiresAt: null as string | null,
        durationDays: null as string | number | null,
        grantedAt: null as string | null,
        platform: null as string | null,
      };
    }

    const metadata = (effectiveSubscription.metadata as Record<string, unknown>) || {};
    const isComp = Boolean(
      metadata.isComplimentary ||
        effectiveSubscription.platform === "admin" ||
        (typeof effectiveSubscription.plan === "string" &&
          effectiveSubscription.plan.toLowerCase().includes("complimentary"))
    );

    const durationMeta = metadata.durationDays as string | number | undefined;
    const isLifetime = Boolean(
      durationMeta === "lifetime" ||
        (isComp && effectiveSubscription.expiresAt === null) ||
        (effectiveSubscription.isPremium && effectiveSubscription.expiresAt === null)
    );

    const isActive = Boolean(
      ((effectiveSubscription.status as string) || "").toLowerCase() === "active" ||
        effectiveSubscription.isPremium === true
    );

    const expiresAt =
      (effectiveSubscription.expiresAt as string | null) ||
      (effectiveSubscription.currentPeriodEnd as string | null) ||
      null;

    return {
      isLifetime,
      isComplimentary: isComp,
      isActive,
      isPremium: Boolean(effectiveSubscription.isPremium),
      plan: (effectiveSubscription.plan as string) || "yearly",
      status: (
        (effectiveSubscription.status as string) || (isActive ? "active" : "inactive")
      ).toLowerCase(),
      expiresAt,
      durationDays: durationMeta ?? null,
      grantedAt:
        (metadata.grantedAt as string) ||
        (effectiveSubscription.createdAt as string) ||
        null,
      platform: (effectiveSubscription.platform as string) || null,
    };
  }, [effectiveSubscription]);

  // Pre-select preset if user currently has lifetime or specific duration
  useEffect(() => {
    if (subDetails.isLifetime && subDetails.isActive) {
      setSelectedDuration("lifetime");
    }
  }, [subDetails.isLifetime, subDetails.isActive]);

  // Calculate durationDays payload
  const resolvedDurationDays = React.useMemo<number | null>(() => {
    if (selectedDuration === "lifetime") return null;
    if (selectedDuration === "custom") {
      const parsed = parseInt(customDays, 10);
      return isNaN(parsed) || parsed < 1 ? 30 : parsed;
    }
    return parseInt(selectedDuration, 10);
  }, [selectedDuration, customDays]);

  // Calculate estimated expiration date for preview
  const previewExpiryDate = React.useMemo(() => {
    if (selectedDuration === "lifetime") return "Never (Permanent Lifetime Access)";
    const days = resolvedDurationDays;
    if (!days) return "N/A";
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, [selectedDuration, resolvedDurationDays]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Never";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // ─── 1. Grant Free Subscription Mutation ──────────────────────────────────
  const grantMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("User ID is missing");
      const payload = {
        durationDays: resolvedDurationDays,
      };

      try {
        const res = await api.post(`/subscriptions/grant-free/${userId}`, payload);
        return res.data;
      } catch (err: unknown) {
        const axiosErr = err as AxiosError;
        if (axiosErr.response?.status === 404) {
          const fallback = await api.post(
            `/api/v1/subscriptions/grant-free/${userId}`,
            payload
          );
          return fallback.data;
        }
        throw err;
      }
    },
    onSuccess: (resData) => {
      toast.success(
        resData?.message || "Free complimentary subscription granted successfully!"
      );
      if (resData?.data) {
        setLiveSubscription(resData.data as Record<string, unknown>);
      }
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-details", userId] });
      queryClient.invalidateQueries({ queryKey: ["user-subscription-live", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-subscription-by-user", userId, userEmail] });
      queryClient.invalidateQueries({ queryKey: ["users-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions-stats"] });

      if (onSuccess) onSuccess();
    },
    onError: (error: AxiosError<{ message?: string; errorMessages?: Array<{ message: string }> }>) => {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.errorMessages?.[0]?.message ||
        "Failed to grant free subscription";
      toast.error(errorMsg);
    },
  });

  // ─── 2. Revoke Free Subscription Mutation ─────────────────────────────────
  const revokeMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("User ID is missing");

      try {
        const res = await api.post(`/subscriptions/revoke-free/${userId}`, {});
        return res.data;
      } catch (err: unknown) {
        const axiosErr = err as AxiosError;
        if (axiosErr.response?.status === 404) {
          const fallback = await api.post(
            `/api/v1/subscriptions/revoke-free/${userId}`,
            {}
          );
          return fallback.data;
        }
        throw err;
      }
    },
    onSuccess: (resData) => {
      toast.success(
        resData?.message || "Free complimentary subscription revoked successfully!"
      );
      if (resData?.data) {
        setLiveSubscription(resData.data as Record<string, unknown>);
      }
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-details", userId] });
      queryClient.invalidateQueries({ queryKey: ["user-subscription-live", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-subscription-by-user", userId, userEmail] });
      queryClient.invalidateQueries({ queryKey: ["users-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions-stats"] });

      if (onSuccess) onSuccess();
    },
    onError: (error: AxiosError<{ message?: string; errorMessages?: Array<{ message: string }> }>) => {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.errorMessages?.[0]?.message ||
        "Failed to revoke subscription";
      toast.error(errorMsg);
    },
  });

  const durationOptions: Array<{
    id: DurationOption;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    isPopular?: boolean;
    isHighlight?: boolean;
  }> = [
    {
      id: "7",
      label: "7 Days",
      sublabel: "Trial pass",
      icon: <Calendar className="w-4 h-4 text-zinc-500" />,
    },
    {
      id: "14",
      label: "14 Days",
      sublabel: "2 Weeks",
      icon: <Calendar className="w-4 h-4 text-zinc-500" />,
    },
    {
      id: "30",
      label: "30 Days",
      sublabel: "1 Month (Standard)",
      icon: <Calendar className="w-4 h-4 text-purple-600" />,
      isPopular: true,
    },
    {
      id: "90",
      label: "90 Days",
      sublabel: "3 Months (Quarterly)",
      icon: <Calendar className="w-4 h-4 text-zinc-500" />,
    },
    {
      id: "365",
      label: "365 Days",
      sublabel: "1 Year Full Access",
      icon: <Crown className="w-4 h-4 text-amber-500" />,
    },
    {
      id: "lifetime",
      label: "Lifetime",
      sublabel: "Permanent VIP",
      icon: <InfinityIcon className="w-4 h-4 text-emerald-600" />,
      isHighlight: true,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg p-0 overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-2xl">
        {/* Header with gradient accent */}
        <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-zinc-950 text-white p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-36 h-36 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  Manage Complimentary Access
                </DialogTitle>
                <DialogDescription className="text-xs text-purple-200/80">
                  Grant, extend, or revoke complimentary VIP premium access
                </DialogDescription>
              </div>
            </div>

            {/* User Details Pill */}
            <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-300" />
                  {userName}
                </span>
                {userEmail && (
                  <span className="text-purple-200/70 flex items-center gap-1 truncate max-w-[200px]" title={userEmail}>
                    <Mail className="w-3 h-3 text-purple-300/70" />
                    {userEmail}
                  </span>
                )}
              </div>
              {userId && (
                <span className="font-mono text-[11px] text-purple-300/80 bg-white/10 px-2 py-0.5 rounded">
                  ID: #{userId.slice(-6).toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tab Switcher: Grant vs Revoke */}
        <div className="px-6 pt-3.5 pb-2.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-1.5 p-1 bg-gray-200/70 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("grant")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "grant"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-purple-600" />
                Grant / Extend
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("revoke")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "revoke"
                  ? "bg-white text-rose-600 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Ban className="w-3.5 h-3.5 text-rose-600" />
                Revoke Access
              </span>
            </button>
          </div>

          {/* Current Quick Indicator */}
          <div className="flex items-center gap-1.5 text-xs">
            {isUserLoading ? (
              <span className="text-gray-400 text-[11px] flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Checking status...
              </span>
            ) : subDetails.isLifetime && subDetails.isActive ? (
              <Badge className="bg-amber-50 text-amber-800 border-amber-300 text-[11px] font-bold gap-1 py-0.5 px-2 shadow-2xs">
                <Crown className="w-3 h-3 text-amber-600" />
                Lifetime VIP
              </Badge>
            ) : subDetails.isComplimentary && subDetails.isActive ? (
              <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[11px] font-bold gap-1 py-0.5 px-2">
                <Gift className="w-3 h-3 text-purple-600" />
                Complimentary
              </Badge>
            ) : subDetails.isActive ? (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-bold gap-1 py-0.5 px-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Paid Active
              </Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-500 border-gray-200 text-[11px] py-0.5 px-2">
                Standard / Free
              </Badge>
            )}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 max-h-[62vh] overflow-y-auto">
          {/* ─────────────────────────────────────────────────────────────────
              1. PROMINENT CURRENT SUBSCRIPTION STATUS CARD (বর্তমান অবস্থা)
          ─────────────────────────────────────────────────────────────────── */}
          <div className="transition-all">
            {subDetails.isLifetime && subDetails.isActive ? (
              /* Lifetime VIP State */
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 via-emerald-50/50 to-purple-50 border-2 border-emerald-400/60 shadow-xs relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none text-emerald-900">
                  <InfinityIcon size={90} />
                </div>
                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-sm shrink-0">
                      <InfinityIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                          Lifetime Free Access
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        </h4>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-300">
                          Active VIP
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">
                        This user currently enjoys unrestricted permanent premium access with <strong>no expiry date</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-emerald-200/60 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Granted By: <strong className="text-gray-900">Admin Complimentary</strong>
                  </span>
                  <span className="text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded">
                    Expires: Never (Lifetime)
                  </span>
                </div>
              </div>
            ) : subDetails.isComplimentary && subDetails.isActive ? (
              /* Time-Limited Complimentary State */
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 shadow-xs relative overflow-hidden">
                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-sm shrink-0">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-gray-900">
                          Complimentary Premium Access
                        </h4>
                        <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border border-purple-300">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">
                        User has temporary complimentary premium access granted by Admin.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-purple-200/60 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    Duration: <strong className="text-gray-900">{subDetails.durationDays ? `${subDetails.durationDays} Days` : "Custom"}</strong>
                  </span>
                  <span className="text-purple-800 font-bold bg-purple-100 px-2 py-0.5 rounded">
                    Valid Until: {formatDate(subDetails.expiresAt)}
                  </span>
                </div>
              </div>
            ) : subDetails.isActive ? (
              /* Standard Paid Subscriber State */
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-gray-900">
                        Paid Active Subscription
                      </h4>
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                        {subDetails.plan.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Platform: {subDetails.platform || "In-App"} • Expires: {formatDate(subDetails.expiresAt)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Standard Free User State */
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-gray-200 text-gray-600 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-gray-900">
                      Current State: Standard Free User
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      No active premium subscription. Select a duration below to grant free access.
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-gray-500 bg-white text-[10px] shrink-0">
                  Free Tier
                </Badge>
              </div>
            )}
          </div>

          {activeTab === "grant" ? (
            <>
              {/* Duration Options Grid */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Select New Subscription Duration
                  </label>
                  {subDetails.isLifetime && subDetails.isActive && (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Lifetime currently active
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {durationOptions.map((opt) => {
                    const isSelected = selectedDuration === opt.id;
                    const isCurrent =
                      opt.id === "lifetime" &&
                      subDetails.isLifetime &&
                      subDetails.isActive;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedDuration(opt.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? "border-purple-600 bg-purple-50/50 shadow-xs ring-2 ring-purple-500/20"
                            : isCurrent
                            ? "border-emerald-400 bg-emerald-50/40"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/60 bg-white"
                        }`}
                      >
                        {isCurrent && (
                          <span className="absolute -top-2 left-2 bg-emerald-600 text-white text-[8px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow-2xs">
                            Current
                          </span>
                        )}
                        {opt.isPopular && !isCurrent && (
                          <span className="absolute -top-2 right-2 bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                            Popular
                          </span>
                        )}
                        {opt.isHighlight && (
                          <span className="absolute -top-2 right-2 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                            VIP
                          </span>
                        )}
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-gray-900">
                            {opt.label}
                          </span>
                          {opt.icon}
                        </div>
                        <span className="text-[11px] text-gray-500">
                          {opt.sublabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Duration Input */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedDuration("custom")}
                  className={`text-xs font-semibold flex items-center gap-1.5 mb-2 cursor-pointer ${
                    selectedDuration === "custom"
                      ? "text-purple-600"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Or specify custom days
                </button>

                {selectedDuration === "custom" && (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
                    <Input
                      type="number"
                      min={1}
                      max={3650}
                      value={customDays}
                      onChange={(e) => setCustomDays(e.target.value)}
                      placeholder="Enter number of days (e.g., 45)"
                      className="bg-white text-sm"
                    />
                    <span className="text-xs text-gray-600 font-medium whitespace-nowrap">
                      Days
                    </span>
                  </div>
                )}
              </div>

              {/* Summary / Confirmation Preview */}
              <div className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/40 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-gray-900">
                    Complimentary Premium Tier
                  </p>
                  <p className="text-gray-600">
                    Will grant the user unrestricted full access.
                  </p>
                  <div className="flex items-center gap-2 pt-1 font-medium text-purple-900">
                    <span>Will be valid until:</span>
                    <span className="font-bold underline text-purple-700">
                      {previewExpiryDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={grantMutation.isPending}
                  className="cursor-pointer"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={() => grantMutation.mutate()}
                  disabled={grantMutation.isPending || !userId}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold cursor-pointer gap-2"
                >
                  {grantMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Granting Access...
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4" />
                      Confirm & Grant Free Access
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            /* Revoke Tab Content */
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1.5 text-rose-900">
                  <p className="font-bold text-sm text-rose-800">
                    Revoke Complimentary Free Access
                  </p>
                  <p className="text-rose-700 leading-relaxed">
                    This action will immediately cancel complimentary subscription
                    benefits for <strong>{userName}</strong>. The user account will
                    be reverted to the standard free tier.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 space-y-1">
                <p className="font-semibold text-gray-800">Action Summary:</p>
                <p>• Plan: Changes to <code>free</code></p>
                <p>• Status: <code>inactive</code></p>
                <p>• Expiration: Immediately expired</p>
              </div>

              {/* Revoke Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={revokeMutation.isPending}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => revokeMutation.mutate()}
                  disabled={revokeMutation.isPending || !userId}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer gap-2"
                >
                  {revokeMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Revoking Access...
                    </>
                  ) : (
                    <>
                      <Ban className="w-4 h-4" />
                      Revoke Free Subscription Now
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
