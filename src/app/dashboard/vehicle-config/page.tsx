"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Car,
  Plus,
  Layers,
  CheckCircle2,
  Ban,
  Download,
  Palette,
  Calendar,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "./data-table";
import { getColumns } from "./columns";
import { VehicleConfig, VehicleConfigResponse } from "./types";
import { VehicleConfigModal } from "./VehicleConfigModal";

export default function VehicleConfigPage() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: configResponse, isLoading, isError } = useQuery<VehicleConfigResponse>({
    queryKey: ["vehicle-configs"],
    queryFn: async () => {
      const response = await api.get("/vehicle-configs");
      return response.data;
    },
  });

  const allConfigs: VehicleConfig[] = useMemo(() => {
    const rawData = configResponse?.data;
    if (Array.isArray(rawData)) return rawData;
    return [];
  }, [configResponse]);

  const filteredConfigs = useMemo(() => {
    if (statusFilter === "ALL") return allConfigs;
    return allConfigs.filter(
      (c) => (c.status || "ACTIVE").toUpperCase() === statusFilter
    );
  }, [allConfigs, statusFilter]);

  // Metrics
  const totalCount = allConfigs.length;
  const activeCount = allConfigs.filter(
    (c) => (c.status || "ACTIVE").toUpperCase() === "ACTIVE"
  ).length;
  const inactiveCount = allConfigs.filter(
    (c) => (c.status || "").toUpperCase() === "INACTIVE"
  ).length;
  const totalModelsCount = allConfigs.reduce(
    (acc, curr) => acc + (curr.makesAndModels?.length || 0),
    0
  );

  const handleExportCSV = () => {
    if (!filteredConfigs.length) {
      toast.error("No vehicle configurations to export");
      return;
    }
    const headers = [
      "Vehicle Type",
      "Max Age (Years)",
      "Allowed Colors",
      "Supported Models Count",
      "Status",
      "Permitted Makes & Models",
    ];
    const rows = filteredConfigs.map((c) => [
      `"${c.vehicleType || ""}"`,
      `"${c.maxAge || 5}"`,
      `"${(c.allowedColors || []).join(", ")}"`,
      `"${c.makesAndModels?.length || 0}"`,
      `"${c.status || "ACTIVE"}"`,
      `"${(c.makesAndModels || []).join(" | ")}"`,
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fleet_vehicle_configs_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Vehicle configurations exported successfully!");
  };

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
                Manage fleet categories, age thresholds, allowed colors, and dynamic make &amp; model catalogs
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="flex items-center gap-2 h-10 px-3.5 text-xs font-semibold text-gray-700 bg-white border-gray-200 rounded-xl hover:bg-gray-50 shadow-2xs"
          >
            <Download size={14} />
            Export CSV
          </Button>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 h-10 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all"
          >
            <Plus size={15} />
            Add Configuration
          </Button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Categories */}
        <div
          onClick={() => setStatusFilter("ALL")}
          className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${
            statusFilter === "ALL"
              ? "border-indigo-500 ring-2 ring-indigo-100"
              : "border-gray-100 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">
              Total Categories
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <Car size={16} />
            </div>
          </div>
          <div className="my-3">
            {isLoading ? (
              <Skeleton className="h-8 w-16 rounded-lg" />
            ) : (
              <h3 className="text-2xl font-bold text-gray-900">{totalCount}</h3>
            )}
          </div>
          <span className="text-[11px] text-gray-400 font-medium">
            Standard fleet categories
          </span>
        </div>

        {/* Card 2: Active Categories */}
        <div
          onClick={() => setStatusFilter("ACTIVE")}
          className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${
            statusFilter === "ACTIVE"
              ? "border-emerald-500 ring-2 ring-emerald-100"
              : "border-gray-100 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">
              Active Categories
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="my-3">
            {isLoading ? (
              <Skeleton className="h-8 w-16 rounded-lg" />
            ) : (
              <h3 className="text-2xl font-bold text-emerald-700">
                {activeCount}
              </h3>
            )}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">
            Visible in onboarding options
          </span>
        </div>

        {/* Card 3: Inactive Categories */}
        <div
          onClick={() => setStatusFilter("INACTIVE")}
          className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${
            statusFilter === "INACTIVE"
              ? "border-rose-500 ring-2 ring-rose-100"
              : "border-gray-100 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">
              Inactive Categories
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <Ban size={16} />
            </div>
          </div>
          <div className="my-3">
            {isLoading ? (
              <Skeleton className="h-8 w-16 rounded-lg" />
            ) : (
              <h3 className="text-2xl font-bold text-rose-700">
                {inactiveCount}
              </h3>
            )}
          </div>
          <span className="text-[11px] text-rose-600 font-medium">
            Hidden from public feeds
          </span>
        </div>

        {/* Card 4: Total Supported Models */}
        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">
              Fleet Catalog Models
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Layers size={16} />
            </div>
          </div>
          <div className="my-3">
            {isLoading ? (
              <Skeleton className="h-8 w-16 rounded-lg" />
            ) : (
              <h3 className="text-2xl font-bold text-purple-700">
                {totalModelsCount}
              </h3>
            )}
          </div>
          <span className="text-[11px] text-gray-400 font-medium">
            Across all {totalCount} categories
          </span>
        </div>
      </div>

      {/* Main Table Card with Shadcn Tabs */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        {/* Status Filter Tabs using shadcn/ui */}
        <Tabs
          value={statusFilter}
          onValueChange={setStatusFilter}
          className="w-full"
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <TabsList className="bg-muted/70 p-1 rounded-xl h-auto flex-wrap">
              <TabsTrigger
                value="ALL"
                className="rounded-lg text-xs font-semibold px-3.5 py-1.5 flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all"
              >
                <Car size={13} />
                All Categories
                <Badge
                  variant="secondary"
                  className="ml-1 px-1.5 py-0 h-4 text-[10px] font-bold rounded-full"
                >
                  {totalCount}
                </Badge>
              </TabsTrigger>

              <TabsTrigger
                value="ACTIVE"
                className="rounded-lg text-xs font-semibold px-3.5 py-1.5 flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-emerald-700 data-[state=active]:shadow-xs transition-all"
              >
                <CheckCircle2 size={13} />
                Active Categories
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {activeCount}
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="INACTIVE"
                className="rounded-lg text-xs font-semibold px-3.5 py-1.5 flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-rose-700 data-[state=active]:shadow-xs transition-all"
              >
                <Ban size={13} />
                Inactive Categories
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                  {inactiveCount}
                </span>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>

        {isError ? (
          <div className="py-12 text-center text-rose-500 font-medium text-xs">
            Failed to load vehicle configurations. Please check backend server.
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredConfigs}
            isLoading={isLoading}
            searchKey="vehicleType"
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
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-gray-400" />
                        Max Age: <strong>{cfg.maxAge} Years</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Palette size={13} className="text-gray-400" />
                        Colors: <strong>{(cfg.allowedColors || []).join(", ")}</strong>
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
      />
    </div>
  );
}
