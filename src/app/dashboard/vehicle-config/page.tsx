"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, Car } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/data-table/DataTable";
import { getColumns, VehicleConfigTableActions } from "./components/columns";
import { useVehicleConfigs } from "./hooks/useVehicleConfigs";
import { VehicleConfig } from "./types";
import { VehicleConfigDetailModal } from "./components/VehicleConfigDetailModal";
import { VehicleConfigModal } from "./components/VehicleConfigModal";
import { Button } from "@/components/ui/button";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteVehicleConfig } from "@/services/vehicleConfigService";
import { toast } from "sonner";

export default function VehicleConfigPage() {
  const queryClient = useQueryClient();
  const { configs, isLoading, isError, pagination, setPage } =
    useVehicleConfigs();

  const [selectedConfig, setSelectedConfig] = useState<VehicleConfig | null>(
    null,
  );
  const [configToDelete, setConfigToDelete] = useState<VehicleConfig | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVehicleConfig(id),
    onSuccess: () => {
      toast.success("Vehicle configuration deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["vehicle-configs"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-configs-options"] });
      setIsDeleteOpen(false);
      setConfigToDelete(null);
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete vehicle configuration",
      );
      setIsDeleteOpen(false);
    },
  });

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
      onDelete: (config: VehicleConfig) => {
        setConfigToDelete(config);
        setIsDeleteOpen(true);
      },
    }),
    [],
  );

  const columns = useMemo(() => getColumns(tableActions), [tableActions]);

  const handleOpenAddModal = () => {
    setSelectedConfig(null);
    setIsEditOpen(true);
  };

  return (
    <main className="p-6 lg:p-8 space-y-6 bg-background min-h-screen">
      <PageHeader
        title="Vehicle Configurations"
        description="Manage fleet categories and dynamic make & model catalogs"
        action={
          <Button
            onClick={handleOpenAddModal}
            className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-all"
          >
            <Plus size={16} />
            <span>Add Configuration</span>
          </Button>
        }
      />

      <section className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 space-y-4">
        {isError ? (
          <div className="py-12 text-center text-rose-500 font-medium text-xs">
            Failed to load vehicle configurations. Please check backend server.
          </div>
        ) : configs.length === 0 && !isLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Car size={24} />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-gray-100">
                No Vehicle Configurations Found
              </p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                Define your vehicle categories (e.g. Sedan, SUV, Van) and permitted models to allow drivers to register and onboard.
              </p>
            </div>
            <Button
              onClick={handleOpenAddModal}
              className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus size={14} />
              <span>Create First Configuration</span>
            </Button>
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

      {/* Details View Modal */}
      <VehicleConfigDetailModal
        config={selectedConfig}
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onEdit={(config) => {
          setIsDetailOpen(false);
          setSelectedConfig(config);
          setIsEditOpen(true);
        }}
      />

      {/* Add / Edit Configuration Modal */}
      <VehicleConfigModal
        isOpen={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setTimeout(() => setSelectedConfig(null), 200);
          }
        }}
        config={selectedConfig}
        existingTypes={configs.map((c) => c.vehicleType)}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <Trash2 className="h-5 w-5 text-rose-600" />
              Delete Vehicle Configuration
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-xs pt-1 text-muted-foreground">
                <p>
                  Are you sure you want to delete the configuration for{" "}
                  <strong className="text-zinc-900 dark:text-zinc-100 font-bold">
                    {configToDelete?.vehicleType}
                  </strong>
                  ?
                </p>
                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  <p className="font-semibold text-xs">
                    {configToDelete?.makesAndModels?.length || 0} supported models will be removed.
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Drivers will no longer be able to select this category during onboarding.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteMutation.isPending}
              className="rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const targetId = configToDelete?._id || configToDelete?.id;
                if (targetId) {
                  deleteMutation.mutate(targetId);
                }
              }}
              disabled={deleteMutation.isPending}
              className="rounded-xl text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Configuration"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
