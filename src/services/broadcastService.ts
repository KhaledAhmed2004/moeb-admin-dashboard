import api from "@/lib/axios";
import {
  IBroadcast,
  IBroadcastPayload,
  IBroadcastStats,
  IBroadcastQueryParams,
} from "@/types/broadcast";

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data: T;
}

export const BroadcastService = {
  // Send broadcast notification
  sendBroadcast: async (payload: IBroadcastPayload | FormData) => {
    const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;
    const res = await api.post<ApiResponse<{
      broadcast: IBroadcast;
      recipientCount: number;
      deviceTokenCount: number;
    }>>("/notifications/broadcast", payload, {
      ...(isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}),
    });
    return res.data?.data;
  },

  // Get broadcast history
  getBroadcastHistory: async (params?: IBroadcastQueryParams) => {
    const res = await api.get<ApiResponse<IBroadcast[]>>(
      "/notifications/broadcasts",
      { params }
    );
    return {
      data: res.data?.data || [],
      pagination: res.data?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPage: 1,
      },
    };
  },

  // Get broadcast statistics
  getBroadcastStats: async (): Promise<IBroadcastStats> => {
    const res = await api.get<ApiResponse<IBroadcastStats>>(
      "/notifications/broadcasts/stats"
    );
    return (
      res.data?.data || {
        totalBroadcasts: 0,
        totalRecipientsReached: 0,
        totalPushDelivered: 0,
        audienceBreakdown: [],
      }
    );
  },

  // Fetch service areas for territory dropdown
  getServiceAreas: async () => {
    try {
      const res = await api.get<{
        success: boolean;
        data: Array<{ _id: string; areaName: string; status: string }>;
      }>("/service-areas", { params: { limit: 100 } });
      const list = res.data?.data;
      if (Array.isArray(list)) return list;
      return [];
    } catch {
      return [];
    }
  },

  // Delete broadcast message within 72 hours
  deleteBroadcast: async (broadcastId: string) => {
    const res = await api.delete<ApiResponse<{
      deleted: boolean;
      broadcastId: string;
      deletedNotificationsCount: number;
    }>>(`/notifications/broadcast/${broadcastId}`);
    return res.data;
  },
};
