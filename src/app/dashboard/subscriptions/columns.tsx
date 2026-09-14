"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ISubscriberItem } from "@/types/subscription";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, Eye, Copy, Phone, Calendar } from "lucide-react";
import { toast } from "sonner";

interface GetColumnsOptions {
  onViewDetails: (subscriber: ISubscriberItem) => void;
}

export const getSubscriptionColumns = ({
  onViewDetails,
}: GetColumnsOptions): ColumnDef<ISubscriberItem>[] => [
  {
    id: "user",
    header: "Subscriber",
    cell: ({ row }) => {
      const item = row.original;
      const user = item.user;
      const initials = (user?.name || "U").slice(0, 2).toUpperCase();

      return (
        <div className="flex items-center gap-3 py-1">
          <div className="relative shrink-0">
            <Avatar className="h-9 w-9 border border-zinc-200 shadow-2xs">
              <AvatarImage src={user?.profilePicture} alt={user?.name || "User"} />
              <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {user?.appState === "ACTIVE" && (
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
                title="Active Account"
              />
            )}
          </div>
          <div className="flex flex-col min-w-0 max-w-[220px]">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-bold text-xs text-zinc-900 truncate">
                {user?.name || "Anonymous Subscriber"}
              </span>
              {user?.companyRole && (
                <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200/60">
                  {user.companyRole}
                </span>
              )}
            </div>
            <span className="text-[11px] text-zinc-500 truncate">
              {user?.email || "No email available"}
            </span>
            {user?.phone && (
              <span className="text-[10px] text-zinc-400 truncate flex items-center gap-1 mt-0.5">
                <Phone className="w-2.5 h-2.5 shrink-0 text-zinc-400" />
                {user.phone}
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "plan",
    header: "Plan & SKU",
    cell: ({ row }) => {
      const item = row.original;
      const plan = (item.plan || "YEARLY").toUpperCase();
      const isPremium = item.isPremium;
      const productId = item.productId;

      return (
        <div className="flex flex-col gap-1 items-start">
          <div className="flex items-center gap-1.5">
            <Badge
              className={`text-[11px] font-bold px-2 py-0.5 border ${
                plan === "YEARLY"
                  ? "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900 border-amber-300/80 shadow-2xs"
                  : plan === "MONTHLY"
                  ? "bg-blue-50 text-blue-800 border-blue-200"
                  : "bg-zinc-100 text-zinc-700 border-zinc-200"
              }`}
            >
              {plan}
            </Badge>
            {isPremium ? (
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200">
                PRO
              </span>
            ) : (
              <span className="text-[9px] font-medium uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500">
                Standard
              </span>
            )}
          </div>
          {productId && (
            <span
              className="text-[10px] font-mono text-zinc-400 max-w-[150px] truncate block"
              title={`Store SKU: ${productId}`}
            >
              {productId}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "platform",
    header: "Platform",
    cell: ({ row }) => {
      const platform = (row.original.platform || "ios").toLowerCase();

      if (platform === "android" || platform === "google") {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            Google Play
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-900 text-white shadow-2xs">
          <Smartphone className="w-3.5 h-3.5" />
          Apple iOS
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = (row.original.status || "active").toLowerCase();
      const expiresAt = row.original.expiresAt;
      const isDateExpired = expiresAt ? new Date(expiresAt).getTime() < Date.now() : false;

      // Active status
      if (status === "active" && !isDateExpired) {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      }

      // Inactive / Expired status
      if (status === "inactive" || status === "expired" || isDateExpired) {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 ring-1 ring-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {status === "inactive" ? "Inactive" : "Expired"}
          </span>
        );
      }

      // Canceled
      if (status === "canceled") {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            Canceled
          </span>
        );
      }

      // Past Due
      if (status === "past_due") {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 ring-1 ring-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Past Due
          </span>
        );
      }

      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 capitalize">
          {status}
        </span>
      );
    },
  },
  {
    id: "transaction",
    header: "Store Order / Txn ID",
    cell: ({ row }) => {
      const item = row.original;
      const orderId = item.orderId;
      const idToDisplay =
        orderId ||
        item.latestTransactionId ||
        item.originalTransactionId ||
        item._id;

      const isGoogleOrder = Boolean(orderId && orderId.startsWith("GPA."));

      const handleCopy = () => {
        if (!idToDisplay) return;
        navigator.clipboard.writeText(idToDisplay);
        toast.success(
          isGoogleOrder
            ? "Google Play Order ID copied"
            : "Transaction ID copied"
        );
      };

      return (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <code
              className="text-[11px] font-mono font-semibold text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200/60 max-w-[170px] truncate block"
              title={idToDisplay}
            >
              {idToDisplay}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-6 w-6 p-0 hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 shrink-0 cursor-pointer"
              title="Copy ID"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
          <span className="text-[10px] text-zinc-400 font-medium">
            {isGoogleOrder
              ? "Google Play Order"
              : item.latestTransactionId || item.originalTransactionId
              ? "Apple Store Txn"
              : "Subscription Ref"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "expiresAt",
    header: "Billing Period & Expiry",
    cell: ({ row }) => {
      const { createdAt, expiresAt } = row.original;

      const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      };

      if (!expiresAt) {
        return (
          <div className="flex flex-col text-xs">
            <span className="font-semibold text-zinc-800">Lifetime / No Expiry</span>
            {createdAt && (
              <span className="text-[10px] text-zinc-400">
                Started: {formatDate(createdAt)}
              </span>
            )}
          </div>
        );
      }

      const expiryDate = new Date(expiresAt);
      const isExpired = expiryDate.getTime() < Date.now();
      const diffDays = Math.ceil(
        (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      return (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-zinc-900">
              {formatDate(expiresAt)}
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                isExpired
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : diffDays <= 30
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
            >
              {isExpired ? "Expired" : `${diffDays}d left`}
            </span>
          </div>
          {createdAt && (
            <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
              Started: {formatDate(createdAt)}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(row.original)}
          className="h-8 text-xs font-semibold gap-1.5 rounded-xl border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer shadow-2xs"
        >
          <Eye className="w-3.5 h-3.5 text-zinc-500" />
          Details
        </Button>
      );
    },
  },
];
