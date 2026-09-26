import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import api from "@/lib/axios";
import { ServiceArea } from "../types";

export function useServiceAreas() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const queryClient = useQueryClient();

  const { data: responseData, isLoading, isError } = useQuery({
    queryKey: ["service-areas", page, limit, statusFilter],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        page,
        limit,
      };
      if (statusFilter && statusFilter !== "ALL") params.status = statusFilter;

      const response = await api.get("/service-areas", { params });
      return response.data;
    },
  });

  const areas: ServiceArea[] = useMemo(() => {
    if (!responseData) return [];
    if (Array.isArray(responseData?.data)) return responseData.data;
    if (Array.isArray(responseData?.data?.result)) return responseData.data.result;
    if (Array.isArray(responseData)) return responseData;
    return [];
  }, [responseData]);

  const pagination = useMemo(() => {
    return responseData?.pagination || responseData?.meta || responseData?.data?.meta || null;
  }, [responseData]);

  const filteredAreas = useMemo(() => {
    if (pagination) return areas;

    return areas.filter((area) => {
      const matchesStatus =
        !statusFilter || statusFilter === "ALL" || area.status === statusFilter;

      return matchesStatus;
    });
  }, [areas, statusFilter, pagination]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/service-areas/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Service area deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["service-areas"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to delete service area");
    },
  });

  return {
    areas: filteredAreas,
    isLoading,
    isError,
    pagination,
    page,
    setPage,
    limit,
    setLimit,
    statusFilter,
    setStatusFilter,
    deleteMutation
  };
}
