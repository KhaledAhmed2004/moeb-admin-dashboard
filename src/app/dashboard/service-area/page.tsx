"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { CustomTabs, TabOption } from "@/components/shared/CustomTabs";
import { DataTable } from "@/components/shared/data-table/DataTable";
import { getServiceAreaColumns } from "./components/columns";
import { ServiceAreaModal } from "./components/ServiceAreaModal";
import { useServiceAreas } from "./hooks/useServiceAreas";
import { ServiceArea } from "./types";

export default function ServiceAreaPage() {
  const [open, setOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<ServiceArea | null>(null);

  const {
    areas,
    isLoading,
    isError,
    pagination,
    page,
    setPage,
    limit,
    setLimit,
    statusFilter,
    setStatusFilter,
    deleteMutation
  } = useServiceAreas();

  const tabOptions: TabOption[] = [
    { label: "All Areas", value: "ALL" },
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" },
  ];

  // Columns definition using helper
  const columns = useMemo(
    () =>
      getServiceAreaColumns({
        onEdit: (area) => setEditingArea(area),
        onDelete: (id) => deleteMutation.mutate(id),
        isDeleting: deleteMutation.isPending,
      }),
    [deleteMutation]
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-background min-h-screen">
      <PageHeader
        title="Service Areas"
        description="Manage and monitor operating territories, assignments, and status"
        action={
          <Button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 h-10 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus size={15} />
            Add Service Area
          </Button>
        }
      />

      {/* Main Content with Shared Reusable DataTable */}
      <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <CustomTabs
          options={tabOptions}
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
        />
        
        {isError ? (
          <div className="py-12 text-center text-rose-500 font-semibold text-xs">
            Failed to load service areas. Please refresh or try again.
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={areas}
            isLoading={isLoading}
            searchKey="areaName"
            searchPlaceholder="Search service areas..."
            pagination={{
              page,
              limit,
              total: pagination?.total ?? pagination?.totalRecords ?? areas.length,
              totalPage: pagination?.totalPage ?? pagination?.totalPages ?? Math.max(1, Math.ceil(areas.length / limit))
            }}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        )}
      </section>

      {/* Add/Edit Service Area Modal */}
      {(open || Boolean(editingArea)) && (
        <ServiceAreaModal
          isOpen={open || Boolean(editingArea)}
          onOpenChange={(val) => {
            if (!val) {
              setOpen(false);
              setEditingArea(null);
            }
          }}
          area={editingArea}
        />
      )}
    </div>
  );
}
