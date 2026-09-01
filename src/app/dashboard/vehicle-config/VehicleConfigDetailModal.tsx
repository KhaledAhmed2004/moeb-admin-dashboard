"use client";

import React from "react";
import { CustomModal } from "@/components/shared/CustomModal";
import { Button } from "@/components/ui/button";
import {
  Car,
  Layers,
  CheckCircle2,
  Ban,
  Clock,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
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
      queryClient.invalidateQueries({ queryKey: ["vehicle-configs-stats"] });
      onOpenChange(false);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(
        error.response?.data?.message || "Failed to update category status"
      );
    },
  });

  if (!config) return null;

  const isActive = config.status === "ACTIVE";
  const models = config.makesAndModels || [];

  const customFooter = (
    <div className="p-4 px-6 border-t border-zinc-100 bg-zinc-50/50 flex flex-row items-center justify-between gap-3 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
        className="rounded-xl px-5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border-gray-200 shadow-2xs cursor-pointer"
      >
        Close
      </Button>

      <div className="flex items-center gap-2">
        {onEdit && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              onEdit(config);
            }}
            className="rounded-xl px-4 text-xs font-semibold text-indigo-700 border-indigo-200 hover:bg-indigo-50 cursor-pointer"
          >
            Edit Rules
          </Button>
        )}

        {isActive ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => toggleStatusMutation.mutate("INACTIVE")}
            disabled={toggleStatusMutation.isPending}
            className="text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl text-xs font-semibold px-4 cursor-pointer"
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
            type="button"
            onClick={() => toggleStatusMutation.mutate("ACTIVE")}
            disabled={toggleStatusMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold px-4 shadow-xs cursor-pointer"
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
    </div>
  );

  return (
    <CustomModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={`${config.vehicleType} Configuration Details`}
      size="2xl"
      footer={customFooter}
    >
      <div className="space-y-6">
        {/* Key Rule Specifications (2 Cards: Category Type & Whitelisted Models) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Car size={13} className="text-indigo-600" />
              Category Type
            </span>
            <p className="text-lg font-bold text-gray-900">
              {config.vehicleType}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={13} className="text-indigo-600" />
              Whitelisted Models
            </span>
            <p className="text-lg font-bold text-indigo-700">
              {models.length} Models
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
                Models Catalog
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                {models.length} supported models
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-1">
            {models.length === 0 ? (
              <div className="w-full text-center py-6 text-xs text-gray-400 font-medium">
                No makes or models added to this category yet
              </div>
            ) : (
              models.map((model, idx) => (
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
    </CustomModal>
  );
}
