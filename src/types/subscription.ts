// ─── Subscription Domain Types & API Interfaces ───────────────────────────────

export type SubscriptionPlanType = "FREE" | "YEARLY" | string;

export type SubscriptionStatus =
  | "active"
  | "inactive"
  | "canceled"
  | "past_due"
  | "trialing"
  | string;

export type SubscriptionPlatform = "ios" | "android" | string;

export type SubscriptionValidityStatus =
  | "ACTIVE"
  | "EXPIRING_SOON"
  | "EXPIRED"
  | "CANCELED"
  | "FREE"
  | string;

import { MetricStat } from "@/components/shared/StatCard";

export interface ISubscriptionMetricStat extends MetricStat {
  thisPeriodCount?: number;
  lastPeriodCount?: number;
}

// ১. স্ট্যাটাস কার্ডস টাইপ
export interface ISubscriptionStats {
  period?: {
    type?: string;
    comparison?: string;
  };
  totalSubscribers?: ISubscriptionMetricStat | number;
  activeSubscribers?: ISubscriptionMetricStat | number;
  expiringSoon?: ISubscriptionMetricStat | number;
  canceledSubscribers?: ISubscriptionMetricStat | number;
  expiredSubscribers?: ISubscriptionMetricStat | number;
  platforms?: {
    ios: number;
    android: number;
    stripe?: number;
  };
  plans?: {
    yearly: number;
    free: number;
  };
  totalSubscribersCount?: number;
  activeSubscribersCount?: number;
  expiringSoonCount?: number;
  canceledSubscribersCount?: number;
  expiredSubscribersCount?: number;
  newSubscribersThisMonth?: number;
  activeGrowth?: {
    growthPercentage: number;
    growthType: "increase" | "decrease" | "no_change" | string;
  };
}

export interface ISubscriptionStatsResponse {
  success: boolean;
  message: string;
  data: ISubscriptionStats;
}

// User object embedded in subscriber
export interface ISubscriberUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  companyRole?: string;
  appState?: string;
  role?: string;
  accountState?: string;
  createdAt?: string;
}

// ২. টেবিল আইটেম টাইপ
export interface ISubscriberItem {
  _id: string;
  user: ISubscriberUser | null;
  plan: SubscriptionPlanType;
  status: SubscriptionStatus;
  isPremium: boolean;
  platform: SubscriptionPlatform;
  productId: string | null;
  originalTransactionId: string | null;
  latestTransactionId: string | null;
  purchaseToken: string | null;
  orderId: string | null;
  expiresAt: string | null;
  currentPeriodEnd?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ৩. ডিটেইল মোডাল / পেজ টাইপ
export interface ISubscriberDetail extends ISubscriberItem {
  planLabel: string;
  platformLabel: string;
  receiptData?: unknown | null;
  isExpired: boolean;
  daysRemaining: number | null;
  validityStatus: SubscriptionValidityStatus;
  metadata?: Record<string, unknown>;
}

export interface ISubscriptionPagination {
  total: number;
  limit: number;
  page: number;
  totalPage: number;
}

// List API Response
export interface ISubscriptionListResponse {
  success: boolean;
  message: string;
  pagination: ISubscriptionPagination;
  data: ISubscriberItem[];
}

// Detail API Response
export interface ISubscriptionDetailResponse {
  success: boolean;
  message: string;
  data: ISubscriberDetail;
}

// Query parameters for fetching subscriptions
export interface ISubscriptionQueryParams {
  page?: number;
  limit?: number;
  platform?: string;
  status?: string;
  search?: string;
}
