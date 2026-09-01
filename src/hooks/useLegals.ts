import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  ILegalPage,
  CreateLegalPayload,
  UpdateLegalPayload,
  LegalApiResponse,
} from "@/types/legal";

// GET ALL LEGAL PAGES (Public / Browsing)
export const useGetLegals = () => {
  return useQuery({
    queryKey: ["legals"],
    queryFn: async () => {
      console.log("🚀 [GET] /api/v1/legals - Fetching all legal pages...");
      try {
        const response = await api.get<LegalApiResponse<ILegalPage[]>>("/legals");
        console.log("✅ [GET] /api/v1/legals SUCCESS:", response.data);
        const list = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? (response.data as unknown as ILegalPage[])
          : [];
        return list;
      } catch (error) {
        console.error("❌ [GET] /api/v1/legals ERROR:", error);
        throw error;
      }
    },
  });
};

// GET SINGLE LEGAL PAGE BY ID (Public / Lookup)
export const useGetLegalById = (legalId: string | null) => {
  return useQuery({
    queryKey: ["legal", legalId],
    queryFn: async () => {
      if (!legalId) return null;
      console.log(`🚀 [GET] /api/v1/legals/${legalId} - Fetching single legal page...`);
      try {
        const response = await api.get<LegalApiResponse<ILegalPage>>(`/legals/${legalId}`);
        console.log(`✅ [GET] /api/v1/legals/${legalId} SUCCESS:`, response.data);
        return response.data?.data ?? null;
      } catch (error) {
        console.error(`❌ [GET] /api/v1/legals/${legalId} ERROR:`, error);
        throw error;
      }
    },
    enabled: !!legalId,
  });
};

// CREATE LEGAL PAGE (Admin Operations)
export const useCreateLegal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateLegalPayload) => {
      console.log("🚀 [POST] /api/v1/legals - Creating legal page with payload:", payload);
      const response = await api.post<LegalApiResponse<ILegalPage>>("/legals", payload);
      console.log("✅ [POST] /api/v1/legals SUCCESS:", response.data);
      return response.data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Legal page created successfully");
      queryClient.invalidateQueries({ queryKey: ["legals"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      console.error("❌ [POST] /api/v1/legals ERROR:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to create legal page");
    },
  });
};

// UPDATE LEGAL PAGE (Admin Operations)
export const useUpdateLegal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      legalId,
      payload,
    }: {
      legalId: string;
      payload: UpdateLegalPayload;
    }) => {
      console.log(`🚀 [PATCH] /api/v1/legals/${legalId} - Updating legal page with payload:`, payload);
      const response = await api.patch<LegalApiResponse<ILegalPage>>(
        `/legals/${legalId}`,
        payload
      );
      console.log(`✅ [PATCH] /api/v1/legals/${legalId} SUCCESS:`, response.data);
      return response.data;
    },
    onSuccess: (res, variables) => {
      toast.success(res.message || "Legal page updated successfully");
      queryClient.invalidateQueries({ queryKey: ["legals"] });
      queryClient.invalidateQueries({ queryKey: ["legal", variables.legalId] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      console.error("❌ [PATCH] /api/v1/legals ERROR:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to update legal page");
    },
  });
};

// DELETE LEGAL PAGE (Admin Operations)
export const useDeleteLegal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (legalId: string) => {
      console.log(`🚀 [DELETE] /api/v1/legals/${legalId} - Deleting legal page...`);
      const response = await api.delete<LegalApiResponse<{ message?: string }>>(
        `/legals/${legalId}`
      );
      console.log(`✅ [DELETE] /api/v1/legals/${legalId} SUCCESS:`, response.data);
      return response.data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Legal page deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["legals"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      console.error("❌ [DELETE] /api/v1/legals ERROR:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to delete legal page");
    },
  });
};
