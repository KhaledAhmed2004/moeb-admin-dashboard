import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { VehicleConfig } from "../types";
import {
  getVehicleConfigDetail,
  createVehicleConfig,
  updateVehicleConfig,
} from "@/services/vehicleConfigService";

interface UseVehicleConfigModalProps {
  config?: VehicleConfig | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  existingTypes?: string[];
}

export function useVehicleConfigModal({
  config,
  isOpen,
  onOpenChange,
  existingTypes = [],
}: UseVehicleConfigModalProps) {
  const isEdit = Boolean(config && (config._id || config.id));
  const queryClient = useQueryClient();
  const configId = config?._id || config?.id;

  const [vehicleType, setVehicleType] = useState<string>(
    config?.vehicleType || "Sedan"
  );
  const [makesAndModels, setMakesAndModels] = useState<string[]>([]);
  const [modelInput, setModelInput] = useState<string>("");
  const [status, setStatus] = useState<string>("ACTIVE");
  const [prevConfig, setPrevConfig] = useState<VehicleConfig | null | undefined>(config);

  // Fetch detail for edit mode
  const { data: detailResponse, isLoading: isFetchingDetail } = useQuery<{
    success: boolean;
    data: VehicleConfig;
  }>({
    queryKey: ["vehicle-config-detail", configId],
    queryFn: async () => {
      if (!configId) throw new Error("No config ID");
      return await getVehicleConfigDetail(configId);
    },
    enabled: Boolean(isOpen && isEdit && configId),
    staleTime: 0,
  });

  // Populate form with existing configuration data from API
  useEffect(() => {
    if (detailResponse?.data) {
      const fetched = detailResponse.data;
      if (fetched.vehicleType) setVehicleType(fetched.vehicleType);
      if (Array.isArray(fetched.makesAndModels)) {
        setMakesAndModels(fetched.makesAndModels);
      }
      if (fetched.status) setStatus(fetched.status);
    }
  }, [detailResponse]);

  // Sync config prop to state
  if (config !== prevConfig) {
    setPrevConfig(config);
    if (config) {
      setVehicleType(config.vehicleType || "Sedan");
      setMakesAndModels(config.makesAndModels || []);
      setStatus(config.status || "ACTIVE");
    } else {
      setVehicleType("Sedan");
      setMakesAndModels([]);
      setStatus("ACTIVE");
    }
  }

  const handleAddModel = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = modelInput.trim();
    if (!trimmed) return;

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
    setMakesAndModels((prev) => prev.filter((m) => m !== modelToRemove));
  };

  const hasChanges = useMemo(() => {
    const originalModels =
      detailResponse?.data?.makesAndModels || config?.makesAndModels || [];
    if (makesAndModels.length !== originalModels.length) return true;

    const currentSorted = [...makesAndModels].sort();
    const originalSorted = [...originalModels].sort();
    return JSON.stringify(currentSorted) !== JSON.stringify(originalSorted);
  }, [makesAndModels, detailResponse?.data?.makesAndModels, config?.makesAndModels]);

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
        const updatePayload = { makesAndModels };
        return await updateVehicleConfig(targetId, updatePayload);
      } else {
        const createPayload = {
          vehicleType,
          makesAndModels,
          status,
        };
        return await createVehicleConfig(createPayload);
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

  return {
    formState: {
      vehicleType,
      setVehicleType,
      makesAndModels,
      modelInput,
      setModelInput,
      status,
      setStatus,
      isEdit,
      isFetchingDetail,
      hasChanges,
      configId,
    },
    actions: {
      handleAddModel,
      handleRemoveModel,
    },
    saveMutation,
  };
}
