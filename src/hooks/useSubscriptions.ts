import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  ISubscriptionStatsResponse,
  ISubscriptionStats,
  ISubscriptionListResponse,
  ISubscriptionDetailResponse,
  ISubscriberDetail,
  ISubscriptionQueryParams,
} from "@/types/subscription";

// ─── 1. Subscriptions Stats Hook ─────────────────────────────────────────────
// Calls: GET /api/v1/admin/subscriptions/stats
export function useSubscriptionStats() {
  return useQuery<ISubscriptionStats>({
    queryKey: ["admin-subscriptions-stats"],
    queryFn: async () => {
      try {
        const response = await api.get<ISubscriptionStatsResponse>(
          "/admin/subscriptions/stats"
        );
        return response.data?.data;
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status === 404) {
          const fallback = await api.get<ISubscriptionStatsResponse>(
            "/api/v1/admin/subscriptions/stats"
          );
          return fallback.data?.data;
        }
        throw err;
      }
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });
}

// ─── 2. Subscriptions List Hook (with Pagination & Filters) ──────────────────
// Calls: GET /api/v1/admin/subscriptions?page=1&limit=10&platform=ios&status=active
export function useSubscriptions(params: ISubscriptionQueryParams) {
  const { page = 1, limit = 10, platform, status, search } = params;

  return useQuery<ISubscriptionListResponse>({
    queryKey: ["admin-subscriptions-list", page, limit, platform, status, search],
    queryFn: async () => {
      const queryParams: Record<string, string | number> = {
        page,
        limit,
      };

      if (platform && platform !== "all") {
        queryParams.platform = platform;
      }

      if (status && status !== "ALL") {
        queryParams.status = status.toLowerCase();
      }

      if (search && search.trim()) {
        queryParams.search = search.trim();
      }

      try {
        const response = await api.get<ISubscriptionListResponse>(
          "/admin/subscriptions",
          { params: queryParams }
        );
        return response.data;
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status === 404) {
          const fallback = await api.get<ISubscriptionListResponse>(
            "/api/v1/admin/subscriptions",
            { params: queryParams }
          );
          return fallback.data;
        }
        throw err;
      }
    },
    staleTime: 10000,
  });
}

// ─── 3. Subscription Detail Hook ─────────────────────────────────────────────
// Calls: GET /api/v1/admin/subscriptions/:id
export function useSubscriptionDetail(subscriptionId: string | null) {
  return useQuery<ISubscriberDetail>({
    queryKey: ["admin-subscription-detail", subscriptionId],
    queryFn: async () => {
      if (!subscriptionId) {
        throw new Error("No subscription ID provided");
      }

      try {
        const response = await api.get<ISubscriptionDetailResponse>(
          `/admin/subscriptions/${subscriptionId}`
        );
        return response.data?.data;
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status === 404) {
          const fallback = await api.get<ISubscriptionDetailResponse>(
            `/api/v1/admin/subscriptions/${subscriptionId}`
          );
          return fallback.data?.data;
        }
        throw err;
      }
    },
    enabled: Boolean(subscriptionId),
    staleTime: 20000,
  });
}
