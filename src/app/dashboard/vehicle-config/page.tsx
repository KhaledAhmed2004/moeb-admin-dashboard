"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Car,
  Plus,
  Layers,
  CheckCircle2,
  Ban,
  Sparkles,
} from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { toast } from "sonner";
import api from "@/lib/axios";
import { CustomTabs, TabOption } from "@/components/shared/CustomTabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "./data-table";
import { getColumns } from "./columns";
import {
  VehicleConfig,
  VehicleConfigResponse,
  VehicleConfigStatsResponse,
} from "./types";
import { VehicleConfigModal } from "./VehicleConfigModal";

export default function VehicleConfigPage() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch Configurations Data (Admin endpoint with offset pagination)
  const { data: configResponse, isLoading: isConfigsLoading, isError } = useQuery<VehicleConfigResponse>({
    queryKey: ["vehicle-configs", page, limit],
    queryFn: async () => {
      try {
        const response = await api.get("/vehicle-configs", {
          params: { page, limit },
        });
        return response.data;
      } catch {
        const response = await api.get("/vehicle-configs/options");
        return response.data;
      }
    },
  });

  // Fetch Real-time Statistics
  const { data: statsResponse, isLoading: isStatsLoading } = useQuery<VehicleConfigStatsResponse>({
    queryKey: ["vehicle-configs-stats"],
    queryFn: async () => {
      const response = await api.get("/vehicle-configs/stats");
      return response.data;
    },
  });

  const statsData = statsResponse?.data;

  const allConfigs: VehicleConfig[] = useMemo(() => {
    const rawData = configResponse?.data;
    if (Array.isArray(rawData)) {
      return rawData.map((c) => ({
        ...c,
        status: c.status || "ACTIVE",
      }));
    }
    return [];
  }, [configResponse]);

  const filteredConfigs = useMemo(() => {
    if (statusFilter === "ALL") return allConfigs;
    return allConfigs.filter(
      (c) => (c.status || "ACTIVE").toUpperCase() === statusFilter
    );
  }, [allConfigs, statusFilter]);

  // Metrics (prioritize backend stats API with fallback to local count)
  const totalCount = statsData?.totalCategories ?? allConfigs.length;
  const activeCount = allConfigs.filter(
    (c) => (c.status || "ACTIVE").toUpperCase() === "ACTIVE"
  ).length;
  const inactiveCount = allConfigs.filter(
    (c) => (c.status || "").toUpperCase() === "INACTIVE"
  ).length;
  const totalModelsCount =
    statsData?.totalModels?.total ??
    allConfigs.reduce(
      (acc, curr) => acc + (curr.makesAndModels?.length || 0),
      0
    );

  const tabOptions: TabOption[] = useMemo(
    () => [
      {
        label: "All Categories",
        value: "ALL",
        icon: Car,
        badgeCount: totalCount,
        badgeColor: "indigo",
      },
      {
        label: "Active Categories",
        value: "ACTIVE",
        icon: CheckCircle2,
        badgeCount: activeCount,
        badgeColor: "emerald",
      },
      {
        label: "Inactive Categories",
        value: "INACTIVE",
        icon: Ban,
        badgeCount: inactiveCount,
        badgeColor: "rose",
      },
    ],
    [totalCount, activeCount, inactiveCount]
  );

  const existingTypes = useMemo(() => {
    return allConfigs.map((c) => c.vehicleType).filter(Boolean);
  }, [allConfigs]);

  const canAddMoreConfigs = useMemo(() => {
    const STANDARD_TYPES = ["sedan", "suv", "van/sprinter", "stretch limousine"];
    const existingLower = existingTypes.map((t) => t.toLowerCase().trim());
    return STANDARD_TYPES.some((type) => !existingLower.includes(type));
  }, [existingTypes]);

  const columns = useMemo(() => getColumns(), []);

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-background min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700">
              <Car size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Vehicle Configurations
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                Manage fleet categories and dynamic make &amp; model catalogs
              </p>
            </div>
          </div>
        </div>

        {canAddMoreConfigs && (
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 h-10 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus size={15} />
              Add Configuration
            </Button>
          </div>
        )}
      </div>

      {/* Top Metric Stat Cards (2 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <StatCard
          title="Total Categories"
          value={totalCount}
          subtitle="Configured fleet categories"
          icon={Car}
          colorClass="text-indigo-700"
          bgColorClass="bg-indigo-50"
          showTrend={false}
          isLoading={isConfigsLoading || isStatsLoading}
        />

        <StatCard
          title="Total Models"
          value={totalModelsCount}
          icon={Layers}
          colorClass="text-purple-700"
          bgColorClass="bg-purple-50"
          isLoading={isConfigsLoading || isStatsLoading}
          trend={`${statsData?.totalModels?.growth ?? 0}%`}
          trendUp={statsData?.totalModels?.growthType !== "decrease"}
          trendBgClass={
            statsData?.totalModels?.growthType === "decrease"
              ? "bg-rose-50 border border-rose-200"
              : "bg-emerald-50 border border-emerald-200"
          }
          trendTextClass={
            statsData?.totalModels?.growthType === "decrease"
              ? "text-rose-600 font-semibold"
              : "text-emerald-600 font-semibold"
          }
          comparisonText={`Growth: ${statsData?.totalModels?.growth ?? 0}% · Type: ${statsData?.totalModels?.growthType || "no_change"}`}
        />
      </div>

      {/* Main Table Card with Reusable CustomTabs */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <CustomTabs
          options={tabOptions}
          value={statusFilter}
          onChange={setStatusFilter}
        />

        {isError ? (
          <div className="py-12 text-center text-rose-500 font-medium text-xs">
            Failed to load vehicle configurations. Please check backend server.
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredConfigs}
            isLoading={isConfigsLoading}
            searchKey="vehicleType"
            pagination={configResponse?.pagination}
            onPageChange={setPage}
            renderSubComponent={({ row }) => {
              const cfg = row.original;
              const models = cfg.makesAndModels || [];
              return (
                <div className="p-5 pl-14 bg-zinc-50/70 border-b space-y-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {cfg.vehicleType} Permitted Models Catalog ({models.length})
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pt-1">
                    {models.length === 0 ? (
                      <span className="text-xs text-gray-400 italic">
                        No models added to this category yet.
                      </span>
                    ) : (
                      models.map((model, mIdx) => (
                        <span
                          key={mIdx}
                          className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-zinc-800 border border-zinc-200/80 shadow-2xs hover:border-indigo-200 hover:text-indigo-700 transition-colors"
                        >
                          {model}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              );
            }}
          />
        )}
      </div>

      {/* Add Modal */}
      <VehicleConfigModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        config={null}
        existingTypes={existingTypes}
      />
    </div>
  );
}
