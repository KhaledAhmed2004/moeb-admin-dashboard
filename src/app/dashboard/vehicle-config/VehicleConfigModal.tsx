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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomInput } from "@/components/shared/CustomInput";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { Plus, X, Loader2, Car, Layers } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import api from "@/lib/axios";
import { VehicleConfig } from "./types";

interface VehicleConfigModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  config?: VehicleConfig | null; // null for Create, config for Edit
  existingTypes?: string[]; // Types already configured in the system
}

const VEHICLE_TYPES = [
  "Sedan",
  "SUV",
  "Van/Sprinter",
  "Stretch Limousine",
] as const;

export function VehicleConfigModal({
  isOpen,
  onOpenChange,
  config,
  existingTypes = [],
}: VehicleConfigModalProps) {
  const isEdit = Boolean(config && (config._id || config.id));
  const queryClient = useQueryClient();
  const configId = config?._id || config?.id;

  // Filter out types that already exist in the database (when in create mode)
  const availableVehicleTypes = React.useMemo(() => {
    if (isEdit) return Array.from(VEHICLE_TYPES);
    const existingLower = (existingTypes || []).map((t) => t.toLowerCase().trim());
    const remaining = VEHICLE_TYPES.filter(
      (t) => !existingLower.includes(t.toLowerCase().trim())
    );
    return remaining.length > 0 ? remaining : Array.from(VEHICLE_TYPES);
  }, [isEdit, existingTypes]);

  const [vehicleType, setVehicleType] = useState<string>(
    availableVehicleTypes[0] || "Sedan"
  );
  const [makesAndModels, setMakesAndModels] = useState<string[]>([]);
  const [modelInput, setModelInput] = useState<string>("");
  const [status, setStatus] = useState<string>("ACTIVE");

  // GET API to fetch existing configuration details when opening edit modal
  const { data: detailResponse, isLoading: isFetchingDetail } = useQuery<{
    success: boolean;
    data: VehicleConfig;
  }>({
    queryKey: ["vehicle-config-detail", configId],
    queryFn: async () => {
      if (!configId) throw new Error("No config ID");
      const res = await api.get(`/vehicle-configs/${configId}`);
      return res.data;
    },
    enabled: Boolean(isOpen && isEdit && configId),
    staleTime: 0,
  });

  // Populate form with existing configuration data from GET API or initial config
  React.useEffect(() => {
    if (detailResponse?.data) {
      const fetched = detailResponse.data;
      if (fetched.vehicleType) setVehicleType(fetched.vehicleType);
      if (Array.isArray(fetched.makesAndModels)) {
        setMakesAndModels(fetched.makesAndModels);
      }
      if (fetched.status) setStatus(fetched.status);
    }
  }, [detailResponse]);

  const [prevConfig, setPrevConfig] = useState<VehicleConfig | null | undefined>(config);
  if (config !== prevConfig) {
    setPrevConfig(config);
    if (config) {
      setVehicleType(config.vehicleType || "Sedan");
      setMakesAndModels(config.makesAndModels || []);
      setStatus(config.status || "ACTIVE");
    } else {
      setVehicleType(availableVehicleTypes[0] || "Sedan");
      setMakesAndModels([]);
      setStatus("ACTIVE");
    }
  }

  const handleAddModel = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = modelInput.trim();
    if (!trimmed) return;

    // Support comma or newline separated bulk adding
    const modelsToAdd = trimmed
      .split(/[\n,]+/)
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    const newModels = [...makesAndModels];
    let addedCount = 0;

    modelsToAdd.forEach((model) => {
      if (!newModels.some((m) => m.toLowerCase() === model.toLowerCase())) {
        newModels.push(model);
        addedCount++;
      }
    });

    if (addedCount === 0) {
      toast.info("Model(s) already exist in the list");
    } else {
      setMakesAndModels(newModels);
      setModelInput("");
    }
  };

  const handleRemoveModel = (modelToRemove: string) => {
    setMakesAndModels(makesAndModels.filter((m) => m !== modelToRemove));
  };

  const handleClearAllModels = () => {
    setMakesAndModels([]);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const targetId = config?._id || config?.id;

      if (!isEdit && !vehicleType) {
        throw new Error("Vehicle category type is required");
      }
      if (makesAndModels.length === 0) {
        throw new Error("At least one permitted make & model is required");
      }

      if (isEdit && targetId) {
        // PATCH /api/v1/vehicle-configs/:vehicleId
        // Updatable attributes: makesAndModels, status
        const updatePayload = {
          makesAndModels,
          status,
        };
        const res = await api.patch(`/vehicle-configs/${targetId}`, updatePayload);
        return res.data;
      } else {
        // POST /api/v1/vehicle-configs
        const createPayload = {
          vehicleType,
          makesAndModels,
          status,
        };
        const res = await api.post("/vehicle-configs", createPayload);
        return res.data;
      }
    },
    onSuccess: (data) => {
      toast.success(
        data?.message ||
          (isEdit
            ? "Vehicle configuration updated successfully!"
            : "Vehicle configuration created successfully!")
      );
      queryClient.invalidateQueries({ queryKey: ["vehicle-configs"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-configs-options"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-configs-stats"] });
      if (configId) {
        queryClient.invalidateQueries({
          queryKey: ["vehicle-config-detail", configId],
        });
      }
      onOpenChange(false);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to save vehicle configuration"
      );
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        className="sm:max-w-2xl max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl bg-white"
      >
        <DialogHeader className="p-6 pb-4 border-b bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700">
              <Car size={20} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                {isEdit
                  ? `Edit ${config?.vehicleType} Configuration`
                  : "Add Vehicle Configuration"}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                Configure standardized vehicle category and whitelisted luxury makes &amp; models
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-zinc-50/50">
          {isFetchingDetail ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 text-indigo-600 animate-spin" />
              <p className="text-xs text-gray-500 font-medium">
                Loading existing {config?.vehicleType || "vehicle"} configuration...
              </p>
            </div>
          ) : (
            <>
              {/* Row 1: Vehicle Type & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-700">
                Vehicle Category / Type <span className="text-rose-500">*</span>
              </Label>
              {isEdit ? (
                <Input
                  value={config?.vehicleType || ""}
                  disabled
                  className="bg-gray-100 text-gray-700 cursor-not-allowed font-medium text-xs h-9"
                />
              ) : (
                <CustomSelect
                  options={availableVehicleTypes.map((type) => ({
                    label: type,
                    value: type,
                  }))}
                  value={vehicleType}
                  onChange={(val) => {
                    setVehicleType(val);
                  }}
                  placeholder="Select vehicle category"
                  className="w-full"
                  triggerClassName="w-full"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-700">
                Operational Status
              </Label>
              <CustomSelect
                options={[
                  {
                    label: "Active",
                    value: "ACTIVE",
                  },
                  {
                    label: "Inactive",
                    value: "INACTIVE",
                  },
                ]}
                value={status}
                onChange={setStatus}
                placeholder="Select status"
                className="w-full"
                triggerClassName="w-full"
              />
            </div>
          </div>

          {/* Row 2: Permitted Makes & Models Catalog */}
          <div className="space-y-3 p-4 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Layers size={14} className="text-indigo-600" />
                  Whitelisted Makes &amp; Models <span className="text-rose-500">*</span>
                </Label>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Type make &amp; model name to add to compliant list
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                  {makesAndModels.length} Models
                </span>
                {makesAndModels.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllModels}
                    className="text-[11px] text-rose-600 hover:underline cursor-pointer font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Manual Add Model Input */}
            <div className="flex items-center gap-2 pt-1">
              <CustomInput
                placeholder="Enter model name (e.g. Mercedes-Benz S-Class) and click Add or press Enter..."
                value={modelInput}
                onChange={(e) => setModelInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddModel();
                  }
                }}
                className="h-9 text-xs bg-zinc-50 border-gray-200"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddModel}
                className="h-9 px-4 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
              >
                <Plus size={14} className="mr-1" />
                Add
              </Button>
            </div>

            {/* Whitelisted Models Grid / Pills */}
            <div className="min-h-[120px] max-h-[250px] overflow-y-auto p-3 rounded-xl bg-zinc-50/80 border border-zinc-200/80">
              {makesAndModels.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  No models added yet. Type a model name in the input above and press Enter or Add.
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {makesAndModels.map((model) => (
                    <span
                      key={model}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white text-gray-800 border border-gray-200 shadow-2xs"
                    >
                      <Car size={12} className="text-indigo-600" />
                      {model}
                      <button
                        type="button"
                        onClick={() => handleRemoveModel(model)}
                        className="text-gray-400 hover:text-rose-600 transition-colors ml-0.5 cursor-pointer"
                        title="Remove model"
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>

        {/* Modal Footer */}
        <DialogFooter className="p-4 px-6 border-t bg-white flex flex-row items-center justify-between gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl px-5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border-gray-200 shadow-2xs cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={
              saveMutation.isPending ||
              isFetchingDetail ||
              makesAndModels.length === 0
            }
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold px-6 shadow-xs cursor-pointer disabled:opacity-50"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 size={14} className="animate-spin mr-1.5" />
                Saving...
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Create Configuration"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
