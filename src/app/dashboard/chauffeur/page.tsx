"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Users, CheckCircle2, Clock, Ban } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { DataTable } from "./data-table";
import { getColumns, Chauffeur } from "./columns";
import { StatCard, DriverStatsData, DriverMetricStat } from "./StatCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function ChauffeurManagementPage() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ["admin-chauffeur-stats"],
    queryFn: async () => {
      const response = await api.get("/admin/chauffeur-stats");
      return response.data?.data as DriverStatsData;
    },
  });

  const { data: applicationsResult, isLoading: isApplicationsLoading } =
    useQuery({
      queryKey: ["admin-chauffeur-applications", statusFilter, page, limit],
      queryFn: async () => {
        const params: Record<string, any> = {
          page,
          limit,
        };
        if (statusFilter !== "ALL") {
          params.status = statusFilter;
        }

        try {
          const response = await api.get("/admin/chauffeurs", { params });
          const rawData = response.data?.data ?? response.data;
          const pagination = response.data?.pagination;
          const list: Chauffeur[] = Array.isArray(rawData)
            ? rawData
            : Array.isArray(rawData?.data)
            ? rawData.data
            : [];

          return {
            items: list,
            pagination: pagination || {
              total: list.length,
              limit,
              page,
              totalPage: Math.ceil(list.length / limit) || 1,
            },
          };
        } catch {
          const response = await api.get("/admin/applications", { params });
          const rawData = response.data?.data ?? response.data;
          const pagination = response.data?.pagination;
          const list: Chauffeur[] = Array.isArray(rawData)
            ? rawData
            : Array.isArray(rawData?.data)
            ? rawData.data
            : [];

          return {
            items: list,
            pagination: pagination || {
              total: list.length,
              limit,
              page,
              totalPage: Math.ceil(list.length / limit) || 1,
            },
          };
        }
      },
    });

  const applications = applicationsResult?.items || [];
  const pagination = applicationsResult?.pagination;

  const totalDrivers = statsData?.totalChauffeurs ?? statsData?.totalDrivers;
  const pendingDrivers =
    statsData?.pendingChauffeurs ?? statsData?.pendingDrivers;
  const suspendedDrivers =
    statsData?.suspendedChauffeurs ?? statsData?.suspendedDrivers;
  const approvedDrivers = statsData?.approvedChauffeurs ??
    statsData?.approvedDrivers ?? {
      count: Math.max(
        0,
        (totalDrivers?.count ?? totalDrivers?.total ?? 0) -
          (pendingDrivers?.count ?? pendingDrivers?.total ?? 0) -
          (suspendedDrivers?.count ?? suspendedDrivers?.total ?? 0),
      ),
      growth: 0,
      growthType: "no_change",
    };

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  const allCount =
    totalDrivers?.count ?? totalDrivers?.total ?? (statusFilter === "ALL" ? pagination?.total ?? applications.length : 0);
  const pendingCount =
    pendingDrivers?.count ??
    pendingDrivers?.total ??
    (statusFilter === "PENDING" ? pagination?.total ?? applications.length : 0);
  const approvedCount =
    approvedDrivers?.count ??
    approvedDrivers?.total ??
    (statusFilter === "APPROVED" ? pagination?.total ?? applications.length : 0);
  const suspendedCount =
    suspendedDrivers?.count ??
    suspendedDrivers?.total ??
    (statusFilter === "SUSPENDED" ? pagination?.total ?? applications.length : 0);

  const handleExportCSV = async () => {
    if (!applications.length) {
      toast.error("No data to export");
      return;
    }
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Status",
      "Subscription",
      "Role",
      "Joined Date",
      "Completed Trips",
    ];
    const rows = applications.map((app) => [
      `"${app.name || ""}"`,
      `"${app.email || ""}"`,
      `"${app.phone || ""}"`,
      `"${app.status || ""}"`,
      `"${typeof app.subscription === "string" ? app.subscription : app.subscription?.status || "None"}"`,
      `"${app.companyRole || "Chauffeur"}"`,
      `"${app.createdAt ? new Date(app.createdAt).toLocaleDateString() : app.joined || ""}"`,
      `"${app.stats?.totalJobsCompleted ?? app.trips ?? 0}"`,
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chauffeurs_export_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Chauffeur data exported successfully!");
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-background">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Chauffeur Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Manage, verify, and monitor all registered chauffeurs and
            applications
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Interactive Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Chauffeurs"
          value={totalDrivers?.count ?? totalDrivers?.total ?? 0}
          metric={totalDrivers}
          isLoading={isStatsLoading}
          isActive={statusFilter === "ALL"}
          onClick={() => handleStatusChange("ALL")}
        />
        <StatCard
          title="Approved Chauffeurs"
          value={approvedDrivers?.count ?? approvedDrivers?.total ?? 0}
          metric={approvedDrivers}
          isLoading={isStatsLoading}
          isActive={statusFilter === "APPROVED"}
          onClick={() => handleStatusChange("APPROVED")}
        />
        <StatCard
          title="Pending Approval"
          value={pendingDrivers?.count ?? pendingDrivers?.total ?? 0}
          metric={pendingDrivers}
          isLoading={isStatsLoading}
          isActive={statusFilter === "PENDING"}
          onClick={() => handleStatusChange("PENDING")}
        />
        <StatCard
          title="Suspended Chauffeurs"
          value={suspendedDrivers?.count ?? suspendedDrivers?.total ?? 0}
          metric={suspendedDrivers}
          isLoading={isStatsLoading}
          isActive={statusFilter === "SUSPENDED"}
          onClick={() => handleStatusChange("SUSPENDED")}
        />
      </div>

      {/* Main Table with Lifecycle Status Tabs */}
      <div className="mt-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        {/* Status Filter Tabs using shadcn/ui */}
        <Tabs
          value={statusFilter}
          onValueChange={handleStatusChange}
          className="w-full"
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <TabsList className="bg-muted/70 p-1 rounded-xl h-auto flex-wrap">
              <TabsTrigger
                value="ALL"
                className="rounded-lg text-xs font-semibold px-3.5 py-1.5 flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all"
              >
                <Users size={13} />
                All Chauffeurs
                <Badge
                  variant="secondary"
                  className="ml-1 px-1.5 py-0 h-4 text-[10px] font-bold rounded-full"
                >
                  {allCount}
                </Badge>
              </TabsTrigger>

              <TabsTrigger
                value="PENDING"
                className="rounded-lg text-xs font-semibold px-3.5 py-1.5 flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-amber-700 data-[state=active]:shadow-xs transition-all"
              >
                <Clock size={13} />
                Pending Applications
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {pendingCount}
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="APPROVED"
                className="rounded-lg text-xs font-semibold px-3.5 py-1.5 flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-emerald-700 data-[state=active]:shadow-xs transition-all"
              >
                <CheckCircle2 size={13} />
                Approved & Active
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {approvedCount}
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="SUSPENDED"
                className="rounded-lg text-xs font-semibold px-3.5 py-1.5 flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-rose-700 data-[state=active]:shadow-xs transition-all"
              >
                <Ban size={13} />
                Suspended
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                  {suspendedCount}
                </span>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>

        <DataTable
          columns={getColumns()}
          data={applications}
          isLoading={isApplicationsLoading}
          searchKey="name"
          page={page}
          limit={limit}
          total={pagination?.total ?? applications.length}
          totalPages={pagination?.totalPage ?? 1}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}
