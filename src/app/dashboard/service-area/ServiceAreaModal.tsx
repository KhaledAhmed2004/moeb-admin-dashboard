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
import { Label } from "@/components/ui/label";
import { CustomInput } from "@/components/shared/CustomInput";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { Plus, X, Loader2, MapPin, Globe } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import api from "@/lib/axios";
import { ServiceArea } from "./page";

interface ServiceAreaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  area?: ServiceArea | null; // null for Create, area object for Edit
}

export function ServiceAreaModal({
  isOpen,
  onOpenChange,
  area,
}: ServiceAreaModalProps) {
  const isEdit = Boolean(area && area._id);
  const areaId = area?._id;
  const queryClient = useQueryClient();

  const [areaName, setAreaName] = useState<string>("");
  const [cities, setCities] = useState<string[]>([]);
  const [cityInput, setCityInput] = useState<string>("");
  const [status, setStatus] = useState<string>("ACTIVE");

  // GET API to fetch existing service area details when opening edit modal
  const { data: detailResponse, isLoading: isFetchingDetail } = useQuery<{
    success: boolean;
    data: ServiceArea;
  }>({
    queryKey: ["service-area-detail", areaId],
    queryFn: async () => {
      if (!areaId) throw new Error("No area ID");
      const res = await api.get(`/service-areas/${areaId}`);
      return res.data;
    },
    enabled: Boolean(isOpen && isEdit && areaId),
    staleTime: 0,
  });

  // Populate form with existing service area data from GET API or initial prop
  useEffect(() => {
    if (detailResponse?.data) {
      const fetched = detailResponse.data;
      if (fetched.areaName) setAreaName(fetched.areaName);
      if (Array.isArray(fetched.cities)) {
        setCities(fetched.cities);
      }
      if (fetched.status) setStatus(fetched.status);
    }
  }, [detailResponse]);

  const [prevArea, setPrevArea] = useState<ServiceArea | null | undefined>(area);
  if (area !== prevArea) {
    setPrevArea(area);
    if (area) {
      setAreaName(area.areaName || "");
      setCities(area.cities || []);
      setStatus(area.status || "ACTIVE");
    } else {
      setAreaName("");
      setCities([]);
      setStatus("ACTIVE");
    }
  }

  const handleAddCity = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = cityInput.trim();
    if (!trimmed) return;

    // Support comma or newline separated bulk adding
    const citiesToAdd = trimmed
      .split(/[\n,]+/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const newCities = [...cities];
    let addedCount = 0;

    citiesToAdd.forEach((cityName) => {
      if (!newCities.some((c) => c.toLowerCase() === cityName.toLowerCase())) {
        newCities.push(cityName);
        addedCount++;
      }
    });

    if (addedCount === 0) {
      toast.info("City/cities already exist in the list");
    } else {
      setCities(newCities);
      setCityInput("");
    }
  };

  const handleRemoveCity = (cityToRemove: string) => {
    setCities(cities.filter((c) => c !== cityToRemove));
  };

  const handleClearAllCities = () => {
    setCities([]);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const trimmedAreaName = areaName.trim();
      if (!trimmedAreaName) {
        throw new Error("Area name is required");
      }
      if (cities.length === 0) {
        throw new Error("At least one covered city is required");
      }

      const payload = {
        areaName: trimmedAreaName,
        cities,
        status,
      };

      if (isEdit && areaId) {
        const res = await api.patch(`/service-areas/${areaId}`, payload);
        return res.data;
      } else {
        const res = await api.post("/service-areas", payload);
        return res.data;
      }
    },
    onSuccess: (data) => {
      toast.success(
        data?.message ||
          (isEdit
            ? "Service area updated successfully!"
            : "Service area added successfully!")
      );
      queryClient.invalidateQueries({ queryKey: ["service-areas"] });
      if (areaId) {
        queryClient.invalidateQueries({
          queryKey: ["service-area-detail", areaId],
        });
      }
      onOpenChange(false);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to save service area"
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
              <MapPin size={20} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                {isEdit
                  ? `Edit ${area?.areaName || "Service Area"}`
                  : "Add Service Area"}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                Configure operating territory, covered cities, and lifecycle status
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-zinc-50/50">
          {isFetchingDetail ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 text-indigo-600 animate-spin" />
              <p className="text-xs text-gray-500 font-medium">
                Loading existing service area details...
              </p>
            </div>
          ) : (
            <>
              {/* Row 1: Area Name & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700">
                    Area Name <span className="text-rose-500">*</span>
                  </Label>
                  <CustomInput
                    icon={MapPin}
                    placeholder="Enter area name (e.g. Dubai Central, London Metro)..."
                    value={areaName}
                    onChange={(e) => setAreaName(e.target.value)}
                    className="h-9 text-xs"
                  />
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

              {/* Row 2: Covered Cities Whitelist */}
              <div className="space-y-3 p-4 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <Globe size={14} className="text-indigo-600" />
                      Covered Cities <span className="text-rose-500">*</span>
                    </Label>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Enter city or district name and click Add or press Enter
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                      {cities.length} Cities
                    </span>
                    {cities.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAllCities}
                        className="text-[11px] text-rose-600 hover:underline cursor-pointer font-medium"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                {/* City Input Row */}
                <div className="flex items-center gap-2 pt-1">
                  <CustomInput
                    icon={Globe}
                    placeholder="Enter city name (e.g. Downtown, Marina) and press Enter or Add..."
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCity();
                      }
                    }}
                    className="h-9 text-xs bg-zinc-50 border-gray-200"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddCity}
                    className="h-9 px-4 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
                  >
                    <Plus size={14} className="mr-1" />
                    Add
                  </Button>
                </div>

                {/* Covered Cities Grid / Pills */}
                <div className="min-h-[120px] max-h-[250px] overflow-y-auto p-3 rounded-xl bg-zinc-50/80 border border-zinc-200/80">
                  {cities.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400">
                      No cities added yet. Type a city name above and press Enter or click Add.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {cities.map((city) => (
                        <span
                          key={city}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white text-gray-800 border border-gray-200 shadow-2xs"
                        >
                          <Globe size={12} className="text-indigo-600" />
                          {city}
                          <button
                            type="button"
                            onClick={() => handleRemoveCity(city)}
                            className="text-gray-400 hover:text-rose-600 transition-colors ml-0.5 cursor-pointer"
                            title="Remove city"
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
              !areaName.trim() ||
              cities.length === 0
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
              "Create Service Area"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
