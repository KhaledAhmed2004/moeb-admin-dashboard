import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import api from "@/lib/axios";
import { ServiceArea } from "../types";

export function useServiceAreaModal(
  area: ServiceArea | null | undefined,
  isOpen: boolean,
  onOpenChange: (open: boolean) => void
) {
  const isEdit = Boolean(area && area._id);
  const areaId = area?._id;
  const queryClient = useQueryClient();

  const [areaName, setAreaName] = useState<string>("");
  const [status, setStatus] = useState<string>("ACTIVE");

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

  useEffect(() => {
    if (detailResponse?.data) {
      const fetched = detailResponse.data;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (fetched.areaName) setAreaName(fetched.areaName);
      if (fetched.status) setStatus(fetched.status);
    }
  }, [detailResponse]);

  const [prevArea, setPrevArea] = useState<ServiceArea | null | undefined>(area);
  if (area !== prevArea) {
    setPrevArea(area);
    if (area) {
      setAreaName(area.areaName || "");
      setStatus(area.status || "ACTIVE");
    } else {
      setAreaName("");
      setStatus("ACTIVE");
    }
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const trimmedAreaName = areaName.trim();
      if (!trimmedAreaName) {
        throw new Error("Area name is required");
      }

      const payload = {
        areaName: trimmedAreaName,
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

  return {
    isEdit,
    areaName,
    setAreaName,
    status,
    setStatus,
    isFetchingDetail,
    saveMutation,
  };
}
