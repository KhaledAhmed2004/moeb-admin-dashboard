"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Car,
  Calendar,
  Palette,
  Layers,
  Search,
  CheckCircle2,
  Ban,
  Clock,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { VehicleConfig } from "./types";

interface VehicleConfigDetailModalProps {
  config: VehicleConfig | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (config: VehicleConfig) => void;
}

export function VehicleConfigDetailModal({
  config,
  isOpen,
  onOpenChange,
  onEdit,
}: VehicleConfigDetailModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const toggleStatusMutation = useMutation({
    mutationFn: async (newStatus: "ACTIVE" | "INACTIVE") => {
      if (!config?._id) return;
      const res = await api.patch(`/vehicle-configs/${config._id}`, {
        status: newStatus,
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(
        data?.message || "Vehicle configuration status updated successfully!"
      );
      queryClient.invalidateQueries({ queryKey: ["vehicle-configs"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-configs-options"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update category status"
      );
    },
  });

  if (!config) return null;

  const isActive = config.status === "ACTIVE";
  const filteredModels = (config.makesAndModels || []).filter((model) =>
    model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getColorBg = (colorName: string) => {
    const c = colorName.toLowerCase();
    if (c.includes("black")) return "bg-black border-gray-700";
    if (c.includes("white")) return "bg-white border-gray-300";
    if (c.includes("silver") || c.includes("grey") || c.includes("gray"))
      return "bg-gray-400 border-gray-500";
    if (c.includes("blue")) return "bg-blue-600 border-blue-700";
    if (c.includes("red")) return "bg-red-600 border-red-700";
    return "bg-zinc-600 border-zinc-700";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl bg-white"
      >
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b bg-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-700">
                <Car size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-xl font-bold text-gray-900">
                    {config.vehicleType}
                  </DialogTitle>
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {config.status || "ACTIVE"}
                  </Badge>
                </div>
                <DialogDescription className="text-xs text-gray-500 font-mono mt-0.5">
                  Config ID: {config._id}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/50">
          {/* Key Rule Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={13} className="text-indigo-600" />
                Max Vehicle Age
              </span>
              <p className="text-lg font-bold text-gray-900">
                {config.maxAge} {config.maxAge === 1 ? "Year" : "Years"}
              </p>
              <p className="text-[11px] text-gray-500">
                Vehicles manufactured &ge; {new Date().getFullYear() - config.maxAge}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Palette size={13} className="text-purple-600" />
                Allowed Colors
              </span>
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                {config.allowedColors?.map((color, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200"
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full border ${getColorBg(
                        color
                      )}`}
                    />
                    {color}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={13} className="text-emerald-600" />
                Permitted Catalog
              </span>
              <p className="text-lg font-bold text-emerald-700">
                {config.makesAndModels?.length || 0} Models
              </p>
              <p className="text-[11px] text-gray-500">
                Available to onboarding chauffeurs
              </p>
            </div>
          </div>

          {/* Makes & Models Catalog */}
          <div className="p-5 rounded-2xl border border-gray-100 bg-white shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
              <div>
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-indigo-600" />
                  Permitted Makes & Models Catalog
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Showing {filteredModels.length} of{" "}
                  {config.makesAndModels?.length || 0} supported models
                </p>
              </div>

              <div className="relative max-w-xs w-full">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                  placeholder="Filter model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-xs bg-zinc-50 border-gray-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-1">
              {filteredModels.length === 0 ? (
                <div className="w-full text-center py-6 text-xs text-gray-400 font-medium">
                  No matching makes or models found
                </div>
              ) : (
                filteredModels.map((model, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-50 hover:bg-indigo-50/60 text-zinc-800 hover:text-indigo-900 border border-zinc-200/80 transition-colors shadow-2xs"
                  >
                    {model}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-400 font-semibold uppercase text-[10px] block mb-0.5">
                Created At
              </span>
              <p className="font-medium text-gray-800 flex items-center gap-1.5">
                <Clock size={12} className="text-gray-400" />
                {config.createdAt
                  ? new Date(config.createdAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "—"}
              </p>
            </div>
            <div>
              <span className="text-gray-400 font-semibold uppercase text-[10px] block mb-0.5">
                Last Updated
              </span>
              <p className="font-medium text-gray-800 flex items-center gap-1.5">
                <Clock size={12} className="text-gray-400" />
                {config.updatedAt
                  ? new Date(config.updatedAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-4 px-6 border-t bg-gray-50/70 flex flex-row items-center justify-between gap-3 w-full">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl px-5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border-gray-200 shadow-2xs"
          >
            Close
          </Button>

          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(config);
                }}
                className="rounded-xl px-4 text-xs font-semibold text-indigo-700 border-indigo-200 hover:bg-indigo-50"
              >
                Edit Rules
              </Button>
            )}

            {isActive ? (
              <Button
                variant="outline"
                onClick={() => toggleStatusMutation.mutate("INACTIVE")}
                disabled={toggleStatusMutation.isPending}
                className="text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl text-xs font-semibold px-4"
              >
                {toggleStatusMutation.isPending ? (
                  <Loader2 size={13} className="animate-spin mr-1.5" />
                ) : (
                  <Ban size={13} className="mr-1.5" />
                )}
                Deactivate Category
              </Button>
            ) : (
              <Button
                onClick={() => toggleStatusMutation.mutate("ACTIVE")}
                disabled={toggleStatusMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold px-4 shadow-xs"
              >
                {toggleStatusMutation.isPending ? (
                  <Loader2 size={13} className="animate-spin mr-1.5" />
                ) : (
                  <CheckCircle2 size={13} className="mr-1.5" />
                )}
                Activate Category
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
