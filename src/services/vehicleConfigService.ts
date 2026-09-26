import api from "@/lib/axios";
import { VehicleConfig } from "@/app/dashboard/vehicle-config/types";

export const getVehicleConfigDetail = async (id: string) => {
  const res = await api.get(`/vehicle-configs/${id}`);
  return res.data;
};

export const createVehicleConfig = async (payload: Partial<VehicleConfig>) => {
  const res = await api.post("/vehicle-configs", payload);
  return res.data;
};

export const updateVehicleConfig = async (id: string, payload: Partial<VehicleConfig>) => {
  const res = await api.patch(`/vehicle-configs/${id}`, payload);
  return res.data;
};

export const getVehicleConfigs = async (page: number, limit: number) => {
  try {
    const res = await api.get("/vehicle-configs", {
      params: { page, limit },
    });
    return res.data;
  } catch {
    const res = await api.get("/vehicle-configs/options");
    return res.data;
  }
};
