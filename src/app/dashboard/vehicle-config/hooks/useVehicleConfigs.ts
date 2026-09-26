import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getVehicleConfigs } from "@/services/vehicleConfigService";
import { VehicleConfig, VehicleConfigResponse } from "../types";

export function useVehicleConfigs() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const {
    data: configResponse,
    isLoading,
    isError,
  } = useQuery<VehicleConfigResponse>({
    queryKey: ["vehicle-configs", page, limit],
    queryFn: () => getVehicleConfigs(page, limit),
  });

  const configs: VehicleConfig[] = useMemo(() => {
    const rawData = configResponse?.data;
    if (Array.isArray(rawData)) {
      return rawData.map((c) => ({
        ...c,
        status: c.status || "ACTIVE",
      }));
    }
    return [];
  }, [configResponse]);

  return {
    configs,
    isLoading,
    isError,
    pagination: configResponse?.pagination,
    page,
    setPage,
    limit,
  };
}
