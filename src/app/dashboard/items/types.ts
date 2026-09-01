export interface ItemUserCreator {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  profilePicture?: string;
}

export interface ItemEntity {
  _id: string;
  title: string;
  price: number;
  condition?: "New" | "Used" | "Refurbished" | string;
  status: "AVAILABLE" | "SOLD" | string;
  location?: string;
  description?: string;
  photos?: string[];
  createdBy?: string | ItemUserCreator;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateItemPayload {
  title: string;
  price: number;
  condition?: string;
  location?: string;
  description?: string;
  photos?: string[];
}

export interface UpdateItemPayload {
  title?: string;
  price?: number;
  condition?: string;
  location?: string;
  description?: string;
  photos?: string[];
}

export interface ItemStatMetric {
  total: number;
  thisPeriodCount?: number;
  lastPeriodCount?: number;
  growth: number;
  growthType: "increase" | "decrease" | "no_change" | string;
}

export interface ItemStatsData {
  totalItems: ItemStatMetric;
  availableItems: ItemStatMetric;
  soldItems: ItemStatMetric;
}

export interface ItemStatsResponse {
  success: boolean;
  statusCode?: number;
  message?: string;
  data: ItemStatsData;
}

