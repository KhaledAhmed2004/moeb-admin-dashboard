"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/data-table/DataTable";
import { getColumns, VehicleConfigTableActions } from "./components/columns";
import { useVehicleConfigs } from "./hooks/useVehicleConfigs";
import { VehicleConfig } from "./types";
import { VehicleConfigDetailModal } from "./components/VehicleConfigDetailModal";
import { VehicleConfigModal } from "./components/VehicleConfigModal";

export default function VehicleConfigPage() {
  const { configs, isLoading, isError, pagination, setPage } =
    useVehicleConfigs();

  const [selectedConfig, setSelectedConfig] = useState<VehicleConfig | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const tableActions: VehicleConfigTableActions = useMemo(
    () => ({
      onView: (config: VehicleConfig) => {
        setSelectedConfig(config);
        setIsDetailOpen(true);
      },
      onEdit: (config: VehicleConfig) => {
        setSelectedConfig(config);
        setIsEditOpen(true);
      },
    }),
    [],
  );

  const columns = useMemo(() => getColumns(tableActions), [tableActions]);

  return (
    <main className="p-6 lg:p-8 space-y-6 bg-background min-h-screen">
      <PageHeader
        title="Vehicle Configurations"
        description="Manage fleet categories and dynamic make & model catalogs"
      />

      <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        {isError ? (
          <div className="py-12 text-center text-rose-500 font-medium text-xs">
            Failed to load vehicle configurations. Please check backend server.
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={configs}
            isLoading={isLoading}
            searchKey="vehicleType"
            searchPlaceholder="Search vehicle categories..."
            pagination={pagination}
            onPageChange={setPage}
            itemName="categories"
          />
        )}
      </section>

      <VehicleConfigDetailModal
        config={selectedConfig}
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onEdit={(config) => {
          setIsDetailOpen(false);
          setIsEditOpen(true);
        }}
      />

      <VehicleConfigModal
        isOpen={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            // clear selected config when modal closes so next open is clean
            setTimeout(() => setSelectedConfig(null), 200);
          }
        }}
        config={selectedConfig}
      />
    </main>
  );
}
