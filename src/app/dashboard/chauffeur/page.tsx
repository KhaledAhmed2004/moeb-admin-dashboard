"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Users, CheckCircle2, Clock, Ban } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { DataTable } from "./data-table";
import { getColumns, Chauffeur } from "./columns";
import { CustomTabs, TabOption } from "@/components/shared/CustomTabs";
import { StatCard, DriverStatsData } from "@/components/shared/StatCard";

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
        const params: Record<string, string | number> = {
          page,
          limit,
        };
        if (statusFilter !== "ALL") {
          params.status = statusFilter;
        }

        const response = await api.get("/user", { params });
        const resData = response.data;

        let list: Chauffeur[] = [];
        if (Array.isArray(resData?.data)) {
          list = resData.data;
        } else if (Array.isArray(resData?.data?.result)) {
          list = resData.data.result;
        } else if (Array.isArray(resData?.data?.users)) {
          list = resData.data.users;
        } else if (Array.isArray(resData?.data?.data)) {
          list = resData.data.data;
        } else if (Array.isArray(resData?.result)) {
          list = resData.result;
        } else if (Array.isArray(resData?.users)) {
          list = resData.users;
        } else if (Array.isArray(resData)) {
          list = resData;
        }

        const paginationMeta =
          resData?.pagination ||
          resData?.meta ||
          resData?.data?.pagination ||
          resData?.data?.meta;

        const totalCount =
          paginationMeta?.total ??
          paginationMeta?.totalCount ??
          paginationMeta?.totalRecords ??
          paginationMeta?.count ??
          list.length;

        const totalPages =
          paginationMeta?.totalPage ??
          paginationMeta?.totalPages ??
          Math.max(1, Math.ceil(totalCount / limit));

        return {
          items: list,
          pagination: {
            total: totalCount,
            limit: paginationMeta?.limit ?? limit,
            page: paginationMeta?.page ?? page,
            totalPage: totalPages,
          },
        };
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

  const tabOptions: TabOption[] = React.useMemo(
    () => [
      {
        label: "All Users",
        value: "ALL",
        icon: Users,
        badgeCount: allCount,
        badgeColor: "indigo",
      },
      {
        label: "Pending Applications",
        value: "PENDING",
        icon: Clock,
        badgeCount: pendingCount,
        badgeColor: "amber",
      },
      {
        label: "Approved & Active",
        value: "APPROVED",
        icon: CheckCircle2,
        badgeCount: approvedCount,
        badgeColor: "emerald",
      },
      {
        label: "Suspended",
        value: "SUSPENDED",
        icon: Ban,
        badgeCount: suspendedCount,
        badgeColor: "rose",
      },
    ],
    [allCount, pendingCount, approvedCount, suspendedCount]
  );

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
    link.download = `users_export_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("User data exported successfully!");
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-background">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Manage, verify, and monitor all registered users and
            accounts
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

      {/* Pure Metric Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={totalDrivers?.count ?? totalDrivers?.total ?? 0}
          metric={totalDrivers}
          isLoading={isStatsLoading}
        />
        <StatCard
          title="Approved Users"
          value={approvedDrivers?.count ?? approvedDrivers?.total ?? 0}
          metric={approvedDrivers}
          isLoading={isStatsLoading}
        />
        <StatCard
          title="Pending Approval"
          value={pendingDrivers?.count ?? pendingDrivers?.total ?? 0}
          metric={pendingDrivers}
          isLoading={isStatsLoading}
        />
        <StatCard
          title="Suspended Users"
          value={suspendedDrivers?.count ?? suspendedDrivers?.total ?? 0}
          metric={suspendedDrivers}
          isLoading={isStatsLoading}
        />
      </div>

      {/* Main Table with Reusable CustomTabs */}
      <div className="mt-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <CustomTabs
          options={tabOptions}
          value={statusFilter}
          onChange={handleStatusChange}
        />

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
