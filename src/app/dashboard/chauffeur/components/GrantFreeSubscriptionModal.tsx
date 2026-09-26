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
import {
  Gift,
  Crown,
  Calendar,
  Loader2,
  Sparkles,
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

type DurationOption = "7" | "30" | "365";

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

  // Pre-select preset if user currently has active complimentary duration matching our options
  useEffect(() => {
    if (subDetails.durationDays && subDetails.isActive) {
      const str = String(subDetails.durationDays);
      if (str === "7" || str === "30" || str === "365") {
        setSelectedDuration(str as DurationOption);
      }
    }
  }, [subDetails.durationDays, subDetails.isActive]);

  // Calculate durationDays payload (7, 30, or 365)
  const resolvedDurationDays = React.useMemo<number>(() => {
    return parseInt(selectedDuration, 10) || 30;
  }, [selectedDuration]);

  // Calculate estimated expiration date for preview
  const previewExpiryDate = React.useMemo(() => {
    const days = resolvedDurationDays;
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, [resolvedDurationDays]);

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
  }> = [
    {
      id: "7",
      label: "7 Days",
      sublabel: "1 Week Pass",
    },
    {
      id: "30",
      label: "30 Days",
      sublabel: "1 Month Pass",
    },
    {
      id: "365",
      label: "365 Days",
      sublabel: "1 Year Pass",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full p-0 overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-xl flex flex-col">
        {/* Clean Header */}
        <div className="w-full p-5 pb-4 border-b border-gray-100 flex items-start gap-3 bg-white">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 shrink-0 mt-0.5">
            <Gift className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <DialogTitle className="text-base font-bold text-gray-900">
              Gift Free Subscription
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 mt-0.5">
              Grant complimentary VIP access to{" "}
              <span className="font-semibold text-gray-800">{userName}</span>
            </DialogDescription>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Active Complimentary Access Banner (Only shown if user currently has an active plan) */}
          {subDetails.isActive && (
            <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-purple-950 min-w-0">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="truncate">
                  <strong className="font-semibold">Currently Active</strong>
                  {subDetails.expiresAt && (
                    <span className="text-purple-700 ml-1">
                      (Expires {formatDate(subDetails.expiresAt)})
                    </span>
                  )}
                </span>
              </div>
              {subDetails.isComplimentary && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => revokeMutation.mutate()}
                  disabled={revokeMutation.isPending}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-100/60 h-7 text-xs font-semibold px-2 cursor-pointer shrink-0"
                >
                  {revokeMutation.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    "Revoke"
                  )}
                </Button>
              )}
            </div>
          )}

          {/* 3 Duration Cards: 7 Days, 30 Days, 365 Days */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5 block">
              Select Duration
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {durationOptions.map((opt) => {
                const isSelected = selectedDuration === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedDuration(opt.id)}
                    className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? "border-purple-600 bg-purple-50/70 shadow-xs ring-2 ring-purple-500/20"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 bg-white"
                    }`}
                  >
                    <span className="font-bold text-sm text-gray-900">
                      {opt.label}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      {opt.sublabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clean Valid Until Preview */}
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs text-gray-600">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              Valid until
            </span>
            <span className="font-bold text-purple-700 bg-purple-50/80 px-2 py-0.5 rounded border border-purple-100">
              {previewExpiryDate}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full p-4 bg-gray-50/60 border-t border-gray-100 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={grantMutation.isPending}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => grantMutation.mutate()}
            disabled={grantMutation.isPending || !userId}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold cursor-pointer gap-1.5 shadow-xs"
          >
            {grantMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Granting...
              </>
            ) : (
              <>
                <Crown className="w-4 h-4" />
                Grant Access
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
