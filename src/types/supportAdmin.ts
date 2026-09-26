// Standard API Envelope
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

// User object populated in ticket
export interface TicketUserRef {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  profileImg?: string;
  phone?: string;
  role?: string;
}

// Single message in ticket thread
export interface ISupportMessage {
  _id: string;
  sender: TicketUserRef | string;
  message: string;
  attachments?: string[];
  createdAt: string;
}

export const SUPPORT_STATUSES = ['PENDING', 'IN_PROGRESS', 'RESOLVED'] as const;
export type ISupportStatus = (typeof SUPPORT_STATUSES)[number];

// Support Ticket Entity (Admin view)
export interface IAdminSupportTicket {
  _id: string;
  id?: string;
  subject: string;
  user: TicketUserRef;
  status: ISupportStatus;
  messages: ISupportMessage[];
  chat?: { _id: string };
  createdAt: string;
  updatedAt: string;
}

// Query parameters for Table filtering
export interface AdminTicketQueryParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: string;
  sort?: string; // e.g. '-createdAt'
}

// Admin reply payload
export interface SendTicketReplyPayload {
  message: string;
}

// Support Statistics
export interface ISupportStats {
  period: {
    type: string;
    comparison: string;
  };
  totalTickets: { count: number; growth: number; growthType: "POSITIVE" | "NEGATIVE" };
  pendingTickets: { count: number; growth: number; growthType: "POSITIVE" | "NEGATIVE" };
  inProgressTickets: { count: number; growth: number; growthType: "POSITIVE" | "NEGATIVE" };
  resolvedTickets: { count: number; growth: number; growthType: "POSITIVE" | "NEGATIVE" };
}
