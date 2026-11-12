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

interface RawPaginationMeta {
  total?: number;
  page?: number;
  limit?: number;
  totalPage?: number;
}

interface RawJobsEnvelope {
  data?: IAdminJob[] | { data?: IAdminJob[]; meta?: RawPaginationMeta; pagination?: RawPaginationMeta };
  meta?: RawPaginationMeta;
  pagination?: RawPaginationMeta;
}

/** Normalize both `{ data: [...], meta }` and `{ data: { data: [...], meta } }` API responses. */
function extractJobsListAndMeta(raw: RawJobsEnvelope | IAdminJob[] | undefined) {
  if (Array.isArray(raw)) {
    return { items: raw, meta: undefined };
  }

  const inner = raw?.data;
  const items: IAdminJob[] = Array.isArray(inner)
    ? inner
    : Array.isArray(inner?.data)
    ? inner.data
    : [];

  const innerObj = inner && !Array.isArray(inner) ? inner : undefined;
  const meta = innerObj?.meta ?? innerObj?.pagination ?? raw?.meta ?? raw?.pagination;

  return { items, meta };
}

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

      const { items, meta } = extractJobsListAndMeta(response.data);
      const total = meta?.total ?? items.length;
      const limit = meta?.limit ?? params.limit ?? 10;

      const pagination = {
        total,
        page: meta?.page ?? params.page ?? 1,
        limit,
        totalPage: meta?.totalPage ?? Math.max(1, Math.ceil(total / limit)),
      };

      return {
        pagination,
        data: items,
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
        const rawStats = response.data?.data ?? response.data;
        if (rawStats && typeof rawStats === "object" && "total" in rawStats) {
          const statsData = rawStats as Partial<JobStats>;
          const total = Number(statsData.total) || 0;
          const pending = Number(statsData.pending) || 0;
          const assigned = Number(statsData.assigned) || 0;
          const completed = Number(statsData.completed) || 0;
          const cancelled = Number(statsData.cancelled) || 0;
          const expired =
            typeof statsData.expired === "number"
              ? statsData.expired
              : Math.max(
                  0,
                  total - (pending + assigned + completed + cancelled)
                );

          return {
            total,
            pending,
            assigned,
            completed,
            cancelled,
            expired,
            totalRevenue: Number(statsData.totalRevenue) || 0,
          };
        }
      } catch {
        // Fallback to computing from /jobs/admin/all-jobs
      }

      try {
        const res = await api.get("/jobs/admin/all-jobs", {
          params: { limit: 500 },
        });
        const { items, meta } = extractJobsListAndMeta(res.data);
        const total = meta?.total ?? items.length;

        let pending = 0;
        let assigned = 0;
        let completed = 0;
        let cancelled = 0;
        let expired = 0;
        let totalRevenue = 0;

        for (const job of items) {
          const status = (job.status || "").toUpperCase();
          if (status === "PENDING") pending++;
          else if (status === "ASSIGNED") assigned++;
          else if (status === "COMPLETED") {
            completed++;
            totalRevenue += Number(job.paymentAmount) || 0;
          } else if (status === "CANCELLED") cancelled++;
          else if (status === "EXPIRED") expired++;
        }

        return {
          total,
          pending,
          assigned,
          completed,
          cancelled,
          expired,
          totalRevenue,
        };
      } catch {
        return {
          total: 0,
          pending: 0,
          assigned: 0,
          completed: 0,
          cancelled: 0,
          expired: 0,
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
