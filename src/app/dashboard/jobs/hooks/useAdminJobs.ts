"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import {
  AdminJobsResponse,
  IAdminJob,
  JobQueryParams,
  JobStats,
  JobStatus,
} from "../types";

export function useAdminJobs(params: JobQueryParams) {
  return useQuery<AdminJobsResponse>({
    queryKey: ["admin-jobs", params],
    queryFn: async () => {
      const cleanParams: Record<string, string | number> = {
        page: params.page || 1,
        limit: params.limit || 10,
      };

      if (params.searchTerm && params.searchTerm.trim()) {
        cleanParams.searchTerm = params.searchTerm.trim();
      }

      if (params.status && params.status !== "ALL") {
        cleanParams.status = params.status;
      }

      if (params.jobType && params.jobType !== "ALL") {
        cleanParams.jobType = params.jobType;
      }

      if (params.paymentStatus && params.paymentStatus !== "ALL") {
        cleanParams.paymentStatus = params.paymentStatus;
      }

      if (params.sort) {
        cleanParams.sort = params.sort;
      }

      const response = await api.get("/jobs/admin/all-jobs", {
        params: cleanParams,
      });

      const resData = response.data?.data ?? response.data;

      // Handle backend QueryBuilder meta or standard pagination
      const pagination = {
        total:
          resData?.meta?.total ??
          resData?.pagination?.total ??
          (Array.isArray(resData?.data) ? resData.data.length : 0),
        page:
          resData?.meta?.page ??
          resData?.pagination?.page ??
          params.page ??
          1,
        limit:
          resData?.meta?.limit ??
          resData?.pagination?.limit ??
          params.limit ??
          10,
        totalPage:
          resData?.meta?.totalPage ??
          resData?.pagination?.totalPage ??
          1,
      };

      const data = Array.isArray(resData?.data)
        ? resData.data
        : Array.isArray(resData)
        ? resData
        : [];

      return {
        pagination,
        data,
      };
    },
    refetchInterval: 30000,
  });
}

export function useAdminJobDetail(jobId: string | null) {
  return useQuery<IAdminJob>({
    queryKey: ["admin-job-detail", jobId],
    queryFn: async () => {
      if (!jobId) throw new Error("No Job ID provided");
      const response = await api.get(`/jobs/${jobId}`);
      return response.data?.data ?? response.data;
    },
    enabled: !!jobId,
  });
}

export function useAdminJobStats() {
  return useQuery<JobStats>({
    queryKey: ["admin-job-stats"],
    queryFn: async () => {
      try {
        const response = await api.get("/jobs/admin/stats");
        if (
          response.data?.data &&
          typeof response.data.data === "object" &&
          "total" in response.data.data
        ) {
          return response.data.data;
        }
      } catch {
        // Fallback to computing from /jobs/admin/all-jobs
      }

      try {
        const res = await api.get("/jobs/admin/all-jobs", {
          params: { limit: 500 },
        });
        const resData = res.data?.data ?? res.data;
        const items: IAdminJob[] = Array.isArray(resData?.data)
          ? resData.data
          : Array.isArray(resData)
          ? resData
          : [];
        const total =
          resData?.meta?.total ?? resData?.pagination?.total ?? items.length;
        const pending = items.filter(
          (j) => (j.status || "").toUpperCase() === "PENDING"
        ).length;
        const assigned = items.filter(
          (j) => (j.status || "").toUpperCase() === "ASSIGNED"
        ).length;
        const completed = items.filter(
          (j) => (j.status || "").toUpperCase() === "COMPLETED"
        ).length;
        const cancelled = items.filter(
          (j) => (j.status || "").toUpperCase() === "CANCELLED"
        ).length;
        const totalRevenue = items
          .filter((j) => (j.status || "").toUpperCase() === "COMPLETED")
          .reduce((acc, curr) => acc + (Number(curr.paymentAmount) || 0), 0);

        return {
          total,
          pending,
          assigned,
          completed,
          cancelled,
          totalRevenue,
        };
      } catch {
        return {
          total: 0,
          pending: 0,
          assigned: 0,
          completed: 0,
          cancelled: 0,
          totalRevenue: 0,
        };
      }
    },
    refetchInterval: 30000,
  });
}

export function useUpdateJobStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      jobId,
      status,
    }: {
      jobId: string;
      status: JobStatus;
    }) => {
      const response = await api.patch(`/jobs/${jobId}/status`, { status });
      return response.data?.data ?? response.data;
    },
    onSuccess: (_, variables) => {
      toast.success(`Job status updated to ${variables.status}`);
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-job-stats"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-job-detail", variables.jobId],
      });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message || "Failed to update job status";
      toast.error(msg);
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const response = await api.delete(`/jobs/${jobId}`);
      return response.data?.data ?? response.data;
    },
    onSuccess: () => {
      toast.success("Job deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-job-stats"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to delete job";
      toast.error(msg);
    },
  });
}

export function useCancelJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const response = await api.patch(`/jobs/${jobId}/cancel`);
      return response.data?.data ?? response.data;
    },
    onSuccess: (_, jobId) => {
      toast.success("Job cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-job-stats"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-job-detail", jobId],
      });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to cancel job";
      toast.error(msg);
    },
  });
}
