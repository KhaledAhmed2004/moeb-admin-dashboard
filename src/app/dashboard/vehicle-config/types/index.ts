export interface VehicleConfig {
  _id: string;
  id?: string;
  vehicleType: string;
  maxAge?: number;
  allowedColors?: string[];
  makesAndModels: string[];
  status: "ACTIVE" | "INACTIVE" | string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface VehicleConfigCursor {
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
}

export interface VehicleConfigPagination {
  total: number;
  limit: number;
  page: number;
  totalPage: number;
}

export interface VehicleConfigResponse {
  success: boolean;
  message: string;
  cursor?: VehicleConfigCursor;
  pagination?: VehicleConfigPagination;
  data: VehicleConfig[];
}

export interface VehicleConfigStatsData {
  totalCategories: number;
  totalModels: {
    total: number;
    count?: number;
    thisPeriodCount: number;
    lastPeriodCount: number;
    growth: number;
    growthType: "increase" | "decrease" | string;
  };
}

export interface VehicleConfigStatsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: VehicleConfigStatsData;
}
