"use client";

import React, { useMemo, useState } from "react";
import {
  Layers,
  Clock,
  Car,
  CheckCircle2,
  Search,
  Filter,
  X,
  Trash2,
  Download,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { CustomTabs, TabOption } from "@/components/shared/CustomTabs";
import { DataTable } from "@/components/shared/data-table/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as XLSX from "xlsx-js-style";
import { toast } from "sonner";
import {
  useAdminJobs,
  useAdminJobStats,
  useDeleteJob,
  useUpdateJobStatus,
} from "./hooks/useAdminJobs";
import { getJobColumns, JobTableActions } from "./components/columns";
import { JobDetailModal } from "./components/JobDetailModal";
import { IAdminJob, JobStatus } from "./types";

export default function JobManagementPage() {
  // Filters & Pagination state
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [jobTypeFilter, setJobTypeFilter] = useState<string>("ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Modal state
  const [selectedJob, setSelectedJob] = useState<IAdminJob | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);

  // Stats Query
  const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } =
    useAdminJobStats();

  // Jobs Query
  const {
    data: jobsResponse,
    isLoading: isJobsLoading,
    isError,
    refetch: refetchJobs,
  } = useAdminJobs({
    page,
    limit,
    searchTerm,
    status: statusFilter,
    jobType: jobTypeFilter,
    paymentStatus: paymentStatusFilter,
  });

  const updateStatusMutation = useUpdateJobStatus();
  const deleteMutation = useDeleteJob();

  const handleRefresh = () => {
    refetchJobs();
    refetchStats();
  };

  // Tabs
  const tabOptions: TabOption[] = [
    {
      label: "All Jobs",
      value: "ALL",
      badgeCount: stats?.total,
      badgeColor: "indigo",
    },
    {
      label: "Pending",
      value: "PENDING",
      badgeCount: stats?.pending,
      badgeColor: "amber",
    },
    {
      label: "Assigned",
      value: "ASSIGNED",
      badgeCount: stats?.assigned,
      badgeColor: "indigo",
    },
    {
      label: "Completed",
      value: "COMPLETED",
      badgeCount: stats?.completed,
      badgeColor: "emerald",
    },
    {
      label: "Cancelled",
      value: "CANCELLED",
      badgeCount: stats?.cancelled,
      badgeColor: "rose",
    },
  ];

  // Table Actions
  const tableActions: JobTableActions = useMemo(
    () => ({
      onView: (job: IAdminJob) => {
        setSelectedJob(job);
        setIsDetailModalOpen(true);
      },
      onEdit: (job: IAdminJob) => {
        setSelectedJob(job);
        setIsDetailModalOpen(true);
      },
      onUpdateStatus: (jobId: string, status: JobStatus) => {
        updateStatusMutation.mutate({ jobId, status });
      },
      onDelete: (jobId: string) => {
        setDeleteJobId(jobId);
      },
    }),
    [updateStatusMutation, deleteMutation]
  );

  const columns = useMemo(
    () => getJobColumns(tableActions, page, limit),
    [tableActions, page, limit]
  );

  const hasActiveFilters =
    searchTerm !== "" ||
    statusFilter !== "ALL" ||
    jobTypeFilter !== "ALL" ||
    paymentStatusFilter !== "ALL";

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setJobTypeFilter("ALL");
    setPaymentStatusFilter("ALL");
    setPage(1);
  };

  const handleExport = () => {
    const jobs = jobsResponse?.data;
    if (!jobs || jobs.length === 0) {
      toast.error("No jobs available to export.");
      return;
    }

    const dataToExport = jobs.map((job) => {
      let formattedDate = "";
      const rawDate = job.createdAt || job.date || "";
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
        "ID": job._id || "",
        "Pickup": job.pickup || "N/A",
        "Dropoff": job.dropoff || "N/A",
        "Type": job.jobType || "N/A",
        "Payment Status": (job.paymentStatus || "UNPAID").toUpperCase(),
        "Status": (job.status || "PENDING").toUpperCase(),
        "Created At": formattedDate,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet([]);
    
    // Add a title header to the sheet
    XLSX.utils.sheet_add_aoa(worksheet, [
      ["Jobs Directory Export"],
      [`Generated on: ${new Date().toLocaleDateString()}`],
      [] // Empty row for spacing
    ], { origin: "A1" });

    // Append the JSON data starting at row 4
    XLSX.utils.sheet_add_json(worksheet, dataToExport, { origin: "A4", skipHeader: false });
    
    // Apply styling to title
    if (worksheet["A1"]) {
      worksheet["A1"].s = {
        font: { bold: true, sz: 14, color: { rgb: "1F2937" } }, // Gray 800
      };
    }
    if (worksheet["A2"]) {
      worksheet["A2"].s = {
        font: { italic: true, color: { rgb: "6B7280" } }, // Gray 500
      };
    }

    // Apply styling to table headers (Row 4, Columns A to G)
    const columns = ["A", "B", "C", "D", "E", "F", "G"];
    columns.forEach((col) => {
      const cell = worksheet[`${col}4`];
      if (cell) {
        cell.s = {
          fill: { fgColor: { rgb: "4F46E5" } }, // Indigo 600
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

    // Set column widths to make the sheet more readable
    const wscols = [
      { wch: 28 }, // ID
      { wch: 30 }, // Pickup
      { wch: 30 }, // Dropoff
      { wch: 15 }, // Type
      { wch: 15 }, // Payment Status
      { wch: 15 }, // Status
      { wch: 20 }, // Created At
    ];
    worksheet["!cols"] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs");
    
    const dateStr = new Date().toISOString().split("T")[0];
    XLSX.writeFile(workbook, `jobs_export_${dateStr}.xlsx`);
  };

  return (
    <main className="p-6 lg:p-8 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <PageHeader
        title="Job Management"
        description="Monitor, dispatch, and track ride requests and chauffeur assignments across the system"
        action={
          <Button
            variant="outline"
            className="gap-2 cursor-pointer"
            onClick={handleExport}
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        }
      />

      {/* Metrics StatCards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Rides"
          value={stats?.total ?? 0}
          isLoading={isStatsLoading}
        />
        <StatCard
          title="Pending Dispatch"
          value={stats?.pending ?? 0}
          isLoading={isStatsLoading}
        />
        <StatCard
          title="Active / In Progress"
          value={stats?.assigned ?? 0}
          isLoading={isStatsLoading}
        />
        <StatCard
          title="Completed Trips"
          value={stats?.completed ?? 0}
          isLoading={isStatsLoading}
        />
      </section>

      {/* Main Table Section */}
      <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CustomTabs
            options={tabOptions}
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
          />

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-zinc-500 hover:text-rose-600 gap-1 h-8"
            >
              <X size={13} />
              Reset Filters
            </Button>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px] max-w-sm">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <Input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search pickup, dropoff, flight, vehicle..."
              className="pl-9 h-9 text-xs rounded-xl bg-zinc-50/50 border-zinc-200"
            />
          </div>

          {/* Job Type Filter */}
          <div className="w-40">
            <Select
              value={jobTypeFilter}
              onValueChange={(val) => {
                setJobTypeFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 text-xs bg-zinc-50/50 border-zinc-200 rounded-xl">
                <SelectValue placeholder="Booking Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Trip Types</SelectItem>
                <SelectItem value="ONE WAY">One Way</SelectItem>
                <SelectItem value="BY THE HOUR">By The Hour</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status Filter */}
          <div className="w-40">
            <Select
              value={paymentStatusFilter}
              onValueChange={(val) => {
                setPaymentStatusFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 text-xs bg-zinc-50/50 border-zinc-200 rounded-xl">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Payments</SelectItem>
                <SelectItem value="PAID">Paid Only</SelectItem>
                <SelectItem value="UNPAID">Unpaid Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table Content */}
        {isError ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-rose-500 font-semibold text-sm">
              Failed to load jobs
            </p>
            <p className="text-xs text-zinc-400">
              Please check your connection or backend server.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="text-xs mt-2"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={jobsResponse?.data || []}
            isLoading={isJobsLoading}
            hideToolbar={true}
            pagination={{
              page,
              limit,
              total: jobsResponse?.pagination?.total ?? (jobsResponse?.data?.length || 0),
              totalPage:
                jobsResponse?.pagination?.totalPage ??
                Math.max(
                  1,
                  Math.ceil(
                    (jobsResponse?.pagination?.total ??
                      jobsResponse?.data?.length ??
                      0) / limit
                  )
                ),
            }}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            itemName="jobs"
          />
        )}
      </section>

      {/* Job Details Modal */}
      <JobDetailModal
        jobId={selectedJob?._id || null}
        isOpen={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        initialData={selectedJob}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={!!deleteJobId}
        onOpenChange={(open) => !open && setDeleteJobId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5 text-red-600" />
              Permanently Delete Job
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this job? This action cannot be undone and will permanently remove all associated records from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deleteJobId) {
                  deleteMutation.mutate(deleteJobId, {
                    onSuccess: () => setDeleteJobId(null),
                  });
                }
              }}
            >
              {deleteMutation.isPending ? "Deleting..." : "Permanently Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
