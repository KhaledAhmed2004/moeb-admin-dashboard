export type BroadcastAudience =
  | 'ALL'
  | 'CHAUFFEURS'
  | 'OWNERS'
  | 'MANAGERS'
  | 'OPERATORS';

export interface IBroadcast {
  _id: string;
  title: string;
  body: string;
  audience: BroadcastAudience;
  serviceAreaId?: {
    _id: string;
    areaName: string;
  } | string;
  serviceAreaName?: string;
  sentBy?: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  recipientCount: number;
  deviceTokenCount: number;
  type?: string;
  image?: string | null;
  video?: string | null;
  link?: {
    label?: string;
    url?: string;
  };
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface IBroadcastPayload {
  title: string;
  body: string;
  audience: BroadcastAudience;
  serviceAreaId?: string | null;
  type?: string;
  image?: string | null;
  video?: string | null;
  link?: {
    label?: string;
    url?: string;
  };
}

export interface IBroadcastStats {
  totalBroadcasts: number;
  totalRecipientsReached: number;
  totalPushDelivered: number;
  audienceBreakdown: Array<{
    _id: string;
    count: number;
  }>;
}

export interface IBroadcastQueryParams {
  page?: number;
  limit?: number;
  audience?: string;
}
