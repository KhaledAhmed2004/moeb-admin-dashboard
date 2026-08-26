"use client";

import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Loader2, Car, Sparkles, AlertCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { VehicleConfig } from "./types";

interface VehicleConfigModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  config?: VehicleConfig | null; // null for Create, config for Edit
}

const PRESET_VEHICLE_TYPES = [
  "Sedan",
  "SUV",
  "Van/Sprinter",
  "Stretch Limousine",
];

const PRESET_COLORS = [
  "Black",
  "White",
  "Pearl White",
  "Silver",
  "Grey",
  "Navy Blue",
  "Beige",
];

export function VehicleConfigModal({
  isOpen,
  onOpenChange,
  config,
}: VehicleConfigModalProps) {
  const isEdit = Boolean(config && config._id);
  const queryClient = useQueryClient();

  const [vehicleType, setVehicleType] = useState<string>("Sedan");
  const [customType, setCustomType] = useState<string>("");
  const [isCustomType, setIsCustomType] = useState<boolean>(false);
  const [maxAge, setMaxAge] = useState<number>(5);
  const [allowedColors, setAllowedColors] = useState<string[]>(["Black"]);
  const [colorInput, setColorInput] = useState<string>("");
  const [makesAndModels, setMakesAndModels] = useState<string[]>([]);
  const [modelInput, setModelInput] = useState<string>("");
  const [status, setStatus] = useState<string>("ACTIVE");

  useEffect(() => {
    if (config) {
      if (PRESET_VEHICLE_TYPES.includes(config.vehicleType)) {
        setVehicleType(config.vehicleType);
        setIsCustomType(false);
        setCustomType("");
      } else {
        setVehicleType("custom");
        setIsCustomType(true);
        setCustomType(config.vehicleType || "");
      }
      setMaxAge(config.maxAge ?? 5);
      setAllowedColors(config.allowedColors || ["Black"]);
      setMakesAndModels(config.makesAndModels || []);
      setStatus(config.status || "ACTIVE");
    } else {
      setVehicleType("Sedan");
      setIsCustomType(false);
      setCustomType("");
      setMaxAge(5);
      setAllowedColors(["Black"]);
      setMakesAndModels([]);
      setStatus("ACTIVE");
    }
  }, [config, isOpen]);

  const handleTogglePresetColor = (color: string) => {
    if (allowedColors.includes(color)) {
      if (allowedColors.length === 1) {
        toast.warning("At least one allowed color is required");
        return;
      }
      setAllowedColors(allowedColors.filter((c) => c !== color));
    } else {
      setAllowedColors([...allowedColors, color]);
    }
  };

  const handleAddCustomColor = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = colorInput.trim();
    if (!trimmed) return;
    if (allowedColors.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      toast.info(`Color "${trimmed}" is already in the list`);
      setColorInput("");
      return;
    }
    setAllowedColors([...allowedColors, trimmed]);
    setColorInput("");
  };

  const handleRemoveColor = (colorToRemove: string) => {
    if (allowedColors.length === 1) {
      toast.warning("At least one color is required");
      return;
    }
    setAllowedColors(allowedColors.filter((c) => c !== colorToRemove));
  };

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
      const finalVehicleType = isCustomType ? customType.trim() : vehicleType;
      if (!finalVehicleType) {
        throw new Error("Vehicle category type is required");
      }
      if (!allowedColors.length) {
        throw new Error("At least one allowed color is required");
      }
      if (maxAge <= 0) {
        throw new Error("Max vehicle age must be greater than 0");
      }

      const payload = {
        vehicleType: finalVehicleType,
        maxAge: Number(maxAge),
        allowedColors,
        makesAndModels,
        status,
      };

      if (isEdit && config?._id) {
        const res = await api.patch(`/vehicle-configs/${config._id}`, payload);
        return res.data;
      } else {
        const res = await api.post("/vehicle-configs", payload);
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
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
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
                Configure fleet category rules, age threshold, color whitelist,
                and permitted models
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-zinc-50/50">
          {/* Row 1: Vehicle Type & Max Age */}
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
                <Select
                  value={vehicleType}
                  onValueChange={(val) => {
                    setVehicleType(val);
                    setIsCustomType(val === "custom");
                  }}
                >
                  <SelectTrigger className="h-9 text-xs bg-white">
                    <SelectValue placeholder="Select vehicle category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESET_VEHICLE_TYPES.map((type) => (
                      <SelectItem key={type} value={type} className="text-xs">
                        {type}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom" className="text-xs">
                      + Custom Category Type
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}

              {isCustomType && !isEdit && (
                <Input
                  placeholder="Enter custom category name (e.g. Electric Sedan)..."
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="h-9 text-xs mt-1.5 bg-white"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-700">
                Max Vehicle Age (Years) <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={maxAge}
                  onChange={(e) => setMaxAge(Number(e.target.value))}
                  className="h-9 text-xs bg-white pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                  Years Max
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Permits models made &ge; {new Date().getFullYear() - (maxAge || 0)}
              </p>
            </div>
          </div>

          {/* Row 2: Status */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-700">
              Category Lifecycle Status
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 text-xs bg-white">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE" className="text-xs">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    ACTIVE (Publicly visible to onboarding chauffeurs)
                  </span>
                </SelectItem>
                <SelectItem value="INACTIVE" className="text-xs">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    INACTIVE (Hidden from public dropdowns)
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Row 3: Allowed Colors Whitelist */}
          <div className="space-y-2.5 p-4 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                Allowed Colors Whitelist <span className="text-rose-500">*</span>
              </Label>
              <span className="text-[11px] text-gray-400 font-medium">
                {allowedColors.length} Selected
              </span>
            </div>

            {/* Quick Preset Selector */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_COLORS.map((color) => {
                const isSelected = allowedColors.includes(color);
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleTogglePresetColor(color)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs font-semibold"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {color}
                  </button>
                );
              })}
            </div>

            {/* Custom Color Input */}
            <div className="flex items-center gap-2 pt-1">
              <Input
                placeholder="Add custom color (e.g. Midnight Blue)..."
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomColor();
                  }
                }}
                className="h-8 text-xs bg-zinc-50 border-gray-200"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddCustomColor}
                className="h-8 px-3 text-xs font-semibold rounded-lg"
              >
                Add Color
              </Button>
            </div>

            {/* Selected Colors Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {allowedColors.map((color) => (
                <span
                  key={color}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200"
                >
                  {color}
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(color)}
                    className="text-gray-400 hover:text-rose-600 ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Row 4: Makes and Models Manager */}
          <div className="space-y-2.5 p-4 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  Permitted Makes & Models Catalog
                </Label>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Type a make and model (e.g. &quot;Tesla Model S Plaid&quot;) and press Enter
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  {makesAndModels.length} Models
                </span>
                {makesAndModels.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllModels}
                    className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Add Model Input */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Type model name (e.g. BMW 7 Series, Tesla Model X)..."
                value={modelInput}
                onChange={(e) => setModelInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddModel();
                  }
                }}
                className="h-8 text-xs bg-zinc-50 border-gray-200"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddModel}
                className="h-8 px-3 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus size={13} className="mr-1" /> Add Model
              </Button>
            </div>

            {/* Models Chip Container */}
            <div className="border border-gray-100 rounded-xl p-3 bg-zinc-50/60 max-h-48 overflow-y-auto">
              {makesAndModels.length === 0 ? (
                <div className="py-4 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
                  <AlertCircle size={14} />
                  No models added yet. Add models so drivers can select them.
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {makesAndModels.map((model, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-zinc-800 border border-zinc-200 shadow-2xs hover:border-indigo-200 transition-colors"
                    >
                      {model}
                      <button
                        type="button"
                        onClick={() => handleRemoveModel(model)}
                        className="text-gray-400 hover:text-rose-600 ml-1 cursor-pointer"
                        title="Remove model"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 px-6 border-t bg-gray-50/70 flex flex-row items-center justify-between gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl px-5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border-gray-200 shadow-2xs"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold px-6 shadow-xs"
          >
            {saveMutation.isPending && (
              <Loader2 size={14} className="animate-spin mr-1.5" />
            )}
            {isEdit ? "Save Configuration Changes" : "Create Vehicle Configuration"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
