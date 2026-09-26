import api from "@/lib/axios";
import {
  ApiResponse,
  IAdminSupportTicket,
  AdminTicketQueryParams,
  ISupportStats,
} from "../types/supportAdmin";

export const AdminSupportService = {
  // 1. Fetch all tickets with pagination & search
  getAllTickets: async (params?: AdminTicketQueryParams) => {
    const res = await api.get<ApiResponse<IAdminSupportTicket[]>>("/supports", {
      params,
    });
    return {
      tickets: res.data.data || [],
      pagination: res.data.pagination,
      total: res.data.pagination?.total ?? (res.data.data ? res.data.data.length : 0),
    };
  },

  // 2. Fetch single ticket details and thread
  getTicketById: async (ticketId: string): Promise<IAdminSupportTicket> => {
    const res = await api.get<ApiResponse<IAdminSupportTicket>>(`/supports/${ticketId}`);
    return res.data.data;
  },

  // 3. Send Admin reply
  replyToTicket: async (ticketId: string, message: string): Promise<IAdminSupportTicket> => {
    const res = await api.post<ApiResponse<IAdminSupportTicket>>(
      `/supports/${ticketId}/messages`,
      { message }
    );
    return res.data.data;
  },

  // 4. Delete ticket
  deleteTicket: async (ticketId: string): Promise<boolean> => {
    const res = await api.delete<ApiResponse<{ deleted: boolean }>>(
      `/supports/${ticketId}`
    );
    return res.data.data?.deleted ?? true;
  },

  // 4.5 Update Ticket Status
  updateTicketStatus: async (ticketId: string, status: string): Promise<IAdminSupportTicket> => {
    const res = await api.patch<ApiResponse<IAdminSupportTicket>>(
      `/supports/${ticketId}/status`,
      { status }
    );
    return res.data.data;
  },

  // 5. Get Support Statistics
  getSupportStats: async (): Promise<ISupportStats> => {
    const res = await api.get<ApiResponse<ISupportStats>>("/supports/stats");
    return res.data.data;
  },
};
