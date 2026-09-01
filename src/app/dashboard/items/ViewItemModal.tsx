"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Package, MapPin, DollarSign, Tag, User, Calendar, Mail } from "lucide-react";
import { ItemEntity } from "./types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getMediaUrl } from "@/lib/utils";

export interface ViewItemModalProps {
  item: ItemEntity | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewItemModal({
  item,
  isOpen,
  onOpenChange,
}: ViewItemModalProps) {
  if (!item) return null;

  const rawPhoto = item.photos?.[0];
  const photoUrl = rawPhoto ? getMediaUrl(rawPhoto) : "";
  const creator = typeof item.createdBy === "object" ? item.createdBy : null;
  const sellerName = creator?.name || "Platform Member";
  const sellerEmail = creator?.email || "";
  const initials = sellerName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "SP";

  const isAvailable = item.status === "AVAILABLE";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-6 rounded-2xl bg-white space-y-5 overflow-hidden">
        <DialogHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  isAvailable
                    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                    : "text-slate-600 bg-slate-100 border-slate-200"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                {item.status}
              </span>
              {item.condition && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    item.condition === "New"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                      : item.condition === "Used"
                      ? "bg-blue-50 text-blue-700 border-blue-200/60"
                      : "bg-amber-50 text-amber-700 border-amber-200/60"
                  }`}
                >
                  Condition: {item.condition}
                </span>
              )}
            </div>
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900 mt-2 leading-snug">
            {item.title}
          </DialogTitle>
        </DialogHeader>

        {/* Media / Photo & Key Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1 h-36 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center relative">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div className="flex flex-col items-center text-gray-400 gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 12v10"/></svg><span className="text-[11px] font-medium">Image Error</span></div>';
                  }
                }}
              />
            ) : (
              <div className="flex flex-col items-center text-gray-400 gap-1">
                <Package size={28} />
                <span className="text-[11px] font-medium">No Image</span>
              </div>
            )}
          </div>

          <div className="sm:col-span-2 space-y-3 flex flex-col justify-center">
            <div>
              <p className="text-xs text-gray-400 font-medium">Asking Price</p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-0.5">
                ${Number(item.price || 0).toLocaleString()}
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
              <MapPin size={15} className="text-gray-400 flex-shrink-0" />
              <span>Location: {item.location || "Not specified"}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <Calendar size={15} className="text-gray-400 flex-shrink-0" />
              <span>
                Listed:{" "}
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })
                  : "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Description Section */}
        {item.description && (
          <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-100/80">
            <p className="text-xs font-bold text-gray-700 mb-1">Product Overview & Specifications</p>
            <p className="text-xs text-gray-600 leading-relaxed font-normal whitespace-pre-wrap">
              {item.description}
            </p>
          </div>
        )}

        {/* Seller Info Card */}
        <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-indigo-200">
              {creator?.profilePicture && <AvatarImage src={creator.profilePicture} alt={sellerName} />}
              <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-bold text-gray-900">{sellerName}</p>
              {sellerEmail && (
                <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium mt-0.5">
                  <Mail size={12} className="text-gray-400" />
                  <span>{sellerEmail}</span>
                </div>
              )}
            </div>
          </div>
          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100/70 px-2.5 py-1 rounded-md">
            Seller Account
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
