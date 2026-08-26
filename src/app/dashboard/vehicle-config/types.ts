export interface VehicleConfig {
  _id: string;
  id?: string;
  vehicleType: string;
  maxAge: number;
  allowedColors: string[];
  makesAndModels: string[];
  status: "ACTIVE" | "INACTIVE" | string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
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
  pagination?: VehicleConfigPagination;
  data: VehicleConfig[];
}
