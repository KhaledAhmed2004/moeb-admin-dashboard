"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, CheckCircle2, Clock, Ban, Download } from "lucide-react";
import * as XLSX from "xlsx-js-style";
import api from "@/lib/axios";
import { DataTable } from "./data-table";
import { getColumns, Chauffeur } from "./columns";
import { CustomTabs, TabOption } from "@/components/shared/CustomTabs";
import { StatCard, MetricStat } from "@/components/shared/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";

function extractMetric(data: unknown, ...keys: string[]): MetricStat {
  if (!data || typeof data !== "object") {
    return { count: 0, growth: 0, growthType: "no_change" };
  }

  const record = data as Record<string, unknown>;
  for (const key of keys) {
    const val = record[key];
    if (val !== undefined && val !== null) {
      if (typeof val === "number") {
        return {
          count: val,
          growth: 0,
          growthType: "no_change",
        };
      }
      if (typeof val === "object") {
        const obj = val as Record<string, unknown>;
        const count =
          typeof obj.count === "number"
            ? obj.count
            : typeof obj.total === "number"
            ? obj.total
            : typeof obj.thisPeriodCount === "number"
            ? obj.thisPeriodCount
            : 0;
        const growth = typeof obj.growth === "number" ? obj.growth : 0;
        const growthType =
          typeof obj.growthType === "string"
            ? obj.growthType
            : growth > 0
            ? "positive"
            : growth < 0
            ? "negative"
            : "no_change";
        return {
          count,
          growth,
          growthType,
        };
      }
    }
  }

  return { count: 0, growth: 0, growthType: "no_change" };
}

export default function ChauffeurManagementPage() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Fetch Users Statistics: GET /api/v1/users/stats
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ["users-stats"],
    queryFn: async () => {
      try {
        const response = await api.get("/users/stats");
        return response.data?.data ?? response.data;
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status === 404) {
          try {
            const fallback = await api.get("/user/stats");
            return fallback.data?.data ?? fallback.data;
          } catch {
            const adminFallback = await api.get("/admin/chauffeur-stats");
            return adminFallback.data?.data ?? adminFallback.data;
          }
        }
        throw err;
      }
    },
    refetchInterval: 30000,
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

  const totalUsers = extractMetric(
    statsData,
    "totalUsers",
    "total",
    "totalDrivers",
    "totalChauffeurs",
    "users"
  );
  const pendingDrivers = extractMetric(
    statsData,
    "pendingApproval",
    "pendingUsers",
    "pendingDrivers",
    "pendingChauffeurs",
    "pending"
  );
  const suspendedDrivers = extractMetric(
    statsData,
    "suspendedUsers",
    "suspendedDrivers",
    "suspendedChauffeurs",
    "suspended"
  );

  const statsRecord = statsData as Record<string, unknown> | undefined;
  const hasExplicitApproved =
    statsRecord &&
    (statsRecord.approvedUsers !== undefined ||
      statsRecord.approved !== undefined ||
      statsRecord.approvedDrivers !== undefined ||
      statsRecord.approvedChauffeurs !== undefined);

  const approvedDrivers: MetricStat = hasExplicitApproved
    ? extractMetric(
        statsData,
        "approvedUsers",
        "approved",
        "approvedDrivers",
        "approvedChauffeurs"
      )
    : {
        count: Math.max(
          0,
          (totalUsers.count ?? 0) -
            (pendingDrivers.count ?? 0) -
            (suspendedDrivers.count ?? 0)
        ),
        total: Math.max(
          0,
          (totalUsers.count ?? 0) -
            (pendingDrivers.count ?? 0) -
            (suspendedDrivers.count ?? 0)
        ),
        growth: 0,
        growthType: "no_change",
      };

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  const handleExport = () => {
    if (!applications || applications.length === 0) return;
    
    const dataToExport = applications.map((app) => {
      let formattedDate = "";
      const rawDate = app.createdAt || app.joined || "";
      if (rawDate) {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        } else {
          formattedDate = rawDate.toString();
        }
      }

      return {
        "ID": app._id || app.id || "",
        "Name": app.name || "N/A",
        "Email": app.email || "N/A",
        "Phone": app.phone || "N/A",
        "Status": (app.status || "PENDING").toUpperCase(),
        "Joined": formattedDate,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet([]);
    
    XLSX.utils.sheet_add_aoa(worksheet, [
      ["Chauffeurs Directory Export"],
      [`Generated on: ${new Date().toLocaleDateString()}`],
      []
    ], { origin: "A1" });

    XLSX.utils.sheet_add_json(worksheet, dataToExport, { origin: "A4", skipHeader: false });
    
    if (worksheet["A1"]) {
      worksheet["A1"].s = {
        font: { bold: true, sz: 14, color: { rgb: "1F2937" } },
      };
    }
    if (worksheet["A2"]) {
      worksheet["A2"].s = {
        font: { italic: true, color: { rgb: "6B7280" } },
      };
    }

    const columns = ["A", "B", "C", "D", "E", "F"];
    columns.forEach((col) => {
      const cell = worksheet[`${col}4`];
      if (cell) {
        cell.s = {
          fill: { fgColor: { rgb: "4F46E5" } },
          font: { bold: true, color: { rgb: "FFFFFF" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "E5E7EB" } },
            bottom: { style: "thin", color: { rgb: "E5E7EB" } },
            left: { style: "thin", color: { rgb: "E5E7EB" } },
            right: { style: "thin", color: { rgb: "E5E7EB" } },
          }
        };
      }
    });

    const wscols = [
      { wch: 28 },
      { wch: 25 },
      { wch: 35 },
      { wch: 20 },
      { wch: 15 },
      { wch: 25 },
    ];
    worksheet["!cols"] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Chauffeurs");
    
    const dateStr = new Date().toISOString().split("T")[0];
    XLSX.writeFile(workbook, `chauffeurs_export_${dateStr}.xlsx`);
  };

  const allCount =
    totalUsers.count ?? (statusFilter === "ALL" ? pagination?.total ?? applications.length : 0);
  const pendingCount =
    pendingDrivers.count ??
    (statusFilter === "PENDING" ? pagination?.total ?? applications.length : 0);
  const approvedCount =
    approvedDrivers.count ??
    (statusFilter === "APPROVED" ? pagination?.total ?? applications.length : 0);
  const suspendedCount =
    suspendedDrivers.count ??
    (statusFilter === "SUSPENDED" ? pagination?.total ?? applications.length : 0);;

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

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-background">
      {/* Header Section */}
      <PageHeader 
        title="User Management"
        description="Manage, verify, and monitor all registered users and accounts"
        action={
          <Button variant="outline" className="gap-2 cursor-pointer" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Export
          </Button>
        }
      />

      {/* Pure Metric Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={totalUsers?.count ?? 0}
          metric={totalUsers}
          isLoading={isStatsLoading}
        />
        <StatCard
          title="Approved Users"
          value={approvedDrivers?.count ?? 0}
          metric={approvedDrivers}
          isLoading={isStatsLoading}
        />
        <StatCard
          title="Pending Approval"
          value={pendingDrivers?.count ?? 0}
          metric={pendingDrivers}
          isLoading={isStatsLoading}
        />
        <StatCard
          title="Suspended Users"
          value={suspendedDrivers?.count ?? 0}
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
