"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Check,
  Copy,
  Calendar,
  CreditCard,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Tag,
  Phone,
  Mail,
} from "lucide-react";
import { useSubscriptionDetail } from "@/hooks/useSubscriptions";
import { ISubscriberDetail } from "@/types/subscription";

interface SubscriberDetailModalProps {
  subscriptionId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<ISubscriberDetail> | null;
}

export function SubscriberDetailModal({
  subscriptionId,
  isOpen,
  onOpenChange,
  initialData,
}: SubscriberDetailModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { data: fetchedData, isLoading } = useSubscriptionDetail(
    isOpen ? subscriptionId : null
  );

  const data = (fetchedData ?? initialData) as ISubscriberDetail | undefined;

  const handleCopy = (text: string | null | undefined, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getValidityBadge = (status?: string, isExpired?: boolean) => {
    const normalized = (status || (isExpired ? "EXPIRED" : "ACTIVE")).toUpperCase();
    switch (normalized) {
      case "ACTIVE":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 gap-1.5 px-3 py-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Active Subscription
          </Badge>
        );
      case "EXPIRING_SOON":
        return (
          <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 gap-1.5 px-3 py-1 font-semibold">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Expiring Soon
          </Badge>
        );
      case "EXPIRED":
      case "INACTIVE":
        return (
          <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 gap-1.5 px-3 py-1 font-semibold">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            {normalized === "INACTIVE" ? "Inactive" : "Expired"}
          </Badge>
        );
      case "CANCELED":
        return (
          <Badge className="bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200 gap-1.5 px-3 py-1 font-semibold">
            <XCircle className="w-3.5 h-3.5 text-zinc-500" />
            Canceled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1.5 px-3 py-1">
            {normalized}
          </Badge>
        );
    }
  };

  const getPlatformIcon = (platform?: string) => {
    const p = (platform || "").toLowerCase();
    if (p.includes("android") || p.includes("google")) {
      return (
        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
          <Smartphone className="w-4 h-4 text-emerald-600" /> Google Play Store (Android)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-zinc-800 font-medium">
        <Smartphone className="w-4 h-4 text-zinc-900" /> Apple App Store (iOS)
      </span>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                Subscription Details
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 mt-1">
                Order / Txn ID: {data?.orderId || data?.latestTransactionId || data?.originalTransactionId || data?._id || "..."}
              </DialogDescription>
            </div>
            {data && getValidityBadge(data.validityStatus, data.isExpired)}
          </div>
        </DialogHeader>

        {isLoading && !data ? (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-14 h-14 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-36 w-full rounded-xl" />
          </div>
        ) : !data ? (
          <div className="p-8 text-center text-sm text-zinc-500">
            No subscription details found.
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* User Profile Card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
              <div className="flex items-center gap-3.5">
                <Avatar className="w-12 h-12 border-2 border-white shadow-xs">
                  <AvatarImage
                    src={data.user?.profilePicture}
                    alt={data.user?.name || "Subscriber"}
                  />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold text-base">
                    {(data.user?.name || "User").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-zinc-900">
                      {data.user?.name || "Unknown Subscriber"}
                    </h3>
                    {data.user?.companyRole && (
                      <Badge variant="outline" className="text-[10px] font-semibold bg-white">
                        {data.user.companyRole}
                      </Badge>
                    )}
                    {data.user?.appState && (
                      <Badge className="text-[10px] bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-bold">
                        {data.user.appState}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-500 mt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-zinc-400" />
                      {data.user?.email || "No email"}
                    </span>
                    {data.user?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-zinc-400" />
                        {data.user.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {data.user?._id && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(data.user?._id, "User ID")}
                  className="h-8 text-xs gap-1.5 self-end sm:self-center"
                >
                  {copiedKey === "User ID" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-zinc-500" />
                  )}
                  Copy User ID
                </Button>
              )}
            </div>

            {/* Plan Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/70 to-purple-50/50 border border-indigo-100/80">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 block">
                  Subscription Plan
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-lg font-black text-indigo-950">
                    {data.planLabel || data.plan || "YEARLY"}
                  </span>
                  {data.isPremium && (
                    <Badge className="bg-amber-400/20 text-amber-800 border-amber-300 text-[10px] font-bold">
                      PRO
                    </Badge>
                  )}
                </div>
                <span className="text-[11px] text-indigo-700/80 mt-1 block">
                  Status: <span className="font-semibold uppercase">{data.status}</span>
                </span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block">
                  Platform Store
                </span>
                <div className="mt-1 text-sm font-bold text-zinc-900">
                  {data.platformLabel || getPlatformIcon(data.platform)}
                </div>
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  Channel: <span className="font-medium capitalize">{data.platform}</span>
                </span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block">
                  Validity & Remaining
                </span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span
                    className={`text-lg font-black ${
                      (data.daysRemaining ?? 0) > 30
                        ? "text-emerald-700"
                        : (data.daysRemaining ?? 0) > 0
                        ? "text-amber-700"
                        : "text-rose-700"
                    }`}
                  >
                    {data.daysRemaining !== null && data.daysRemaining !== undefined
                      ? `${data.daysRemaining} days`
                      : data.isExpired
                      ? "Expired"
                      : "Active"}
                  </span>
                  {data.daysRemaining !== null && data.daysRemaining !== undefined && (
                    <span className="text-xs text-zinc-500 font-medium">left</span>
                  )}
                </div>
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  Expires: {formatDate(data.expiresAt)}
                </span>
              </div>
            </div>

            {/* In-App Purchase & Store Identifiers */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-zinc-400" />
                Store & Transaction Credentials
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Product ID */}
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                      Product ID
                    </span>
                    <span className="font-mono text-zinc-800 font-semibold truncate block">
                      {data.productId || "None"}
                    </span>
                  </div>
                  {data.productId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 shrink-0"
                      onClick={() => handleCopy(data.productId, "Product ID")}
                    >
                      {copiedKey === "Product ID" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                    </Button>
                  )}
                </div>

                {/* Order ID */}
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                      Store Order ID
                    </span>
                    <span className="font-mono text-zinc-800 font-semibold truncate block">
                      {data.orderId || "N/A (In-App Store)"}
                    </span>
                  </div>
                  {data.orderId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 shrink-0"
                      onClick={() => handleCopy(data.orderId, "Order ID")}
                    >
                      {copiedKey === "Order ID" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                    </Button>
                  )}
                </div>

                {/* Latest Transaction ID */}
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                      Latest Transaction ID
                    </span>
                    <span className="font-mono text-zinc-800 font-semibold truncate block">
                      {data.latestTransactionId || data.originalTransactionId || "N/A"}
                    </span>
                  </div>
                  {(data.latestTransactionId || data.originalTransactionId) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 shrink-0"
                      onClick={() =>
                        handleCopy(
                          data.latestTransactionId || data.originalTransactionId,
                          "Transaction ID"
                        )
                      }
                    >
                      {copiedKey === "Transaction ID" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                    </Button>
                  )}
                </div>

                {/* Original Transaction ID */}
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                      Original Transaction ID
                    </span>
                    <span className="font-mono text-zinc-800 font-semibold truncate block">
                      {data.originalTransactionId || "N/A"}
                    </span>
                  </div>
                  {data.originalTransactionId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 shrink-0"
                      onClick={() =>
                        handleCopy(data.originalTransactionId, "Original Transaction ID")
                      }
                    >
                      {copiedKey === "Original Transaction ID" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Purchase Token if present */}
              {data.purchaseToken && (
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-zinc-400">
                      Google Play Purchase Token
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[11px] gap-1"
                      onClick={() => handleCopy(data.purchaseToken, "Purchase Token")}
                    >
                      {copiedKey === "Purchase Token" ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-zinc-400" />
                      )}
                      Copy Token
                    </Button>
                  </div>
                  <p className="font-mono text-[11px] text-zinc-600 break-all bg-white p-2 rounded-lg border border-zinc-100">
                    {data.purchaseToken}
                  </p>
                </div>
              )}
            </div>

            {/* Timeline Dates */}
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                Subscription Lifecycle & Dates
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-xs">
                <div className="flex justify-between py-1 border-b border-zinc-200/50">
                  <span className="text-zinc-500">Subscription Started:</span>
                  <span className="font-medium text-zinc-800">
                    {formatDate(data.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-200/50">
                  <span className="text-zinc-500">Expiration / Renews:</span>
                  <span className="font-semibold text-zinc-900">
                    {formatDate(data.expiresAt)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-200/50">
                  <span className="text-zinc-500">Last Synced / Updated:</span>
                  <span className="font-medium text-zinc-800">
                    {formatDate(data.updatedAt)}
                  </span>
                </div>
                {data.currentPeriodEnd && (
                  <div className="flex justify-between py-1 border-b border-zinc-200/50">
                    <span className="text-zinc-500">Current Period End:</span>
                    <span className="font-medium text-zinc-800">
                      {formatDate(data.currentPeriodEnd)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
