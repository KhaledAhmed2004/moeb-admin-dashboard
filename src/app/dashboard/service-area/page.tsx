"use client";

import { useState, useMemo } from "react";
import { Plus, MapPin } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/DataTable";
import { getServiceAreaColumns } from "./columns";
import { ServiceAreaModal } from "./ServiceAreaModal";
import { toast } from "sonner";
import { AxiosError } from "axios";

export interface ServiceArea {
  _id: string;
  areaName: string;
  status: string;
  chauffeurCount?: number;
  userCount?: number;
  cities: string[];
  createdAt?: string;
  updatedAt?: string;
}

export default function ServiceAreaPage() {
  const [open, setOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<ServiceArea | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const queryClient = useQueryClient();

  // Query service areas from API
  const { data: areas = [], isLoading, isError } = useQuery({
    queryKey: ["service-areas"],
    queryFn: async () => {
      const response = await api.get("/service-areas");
      const list = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];
      return list as ServiceArea[];
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/service-areas/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Service area deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["service-areas"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to delete service area");
    },
  });

  // Client-side filtering for search & status
  const filteredAreas = useMemo(() => {
    return areas.filter((area) => {
      const matchesSearch =
        !searchTerm ||
        area.areaName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        area.cities?.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        !statusFilter || statusFilter === "ALL" || area.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [areas, searchTerm, statusFilter]);

  // Columns definition using helper
  const columns = useMemo(
    () => getServiceAreaColumns({ setEditingArea, deleteMutation }),
    [deleteMutation]
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-background min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700">
              <MapPin size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Service Areas
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                Manage and monitor operating territories, covered cities catalog, and status
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 h-10 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus size={15} />
          Add Service Area
        </Button>
      </div>

      {/* Main Content with Shared Reusable DataTable */}
      <div className="mt-4">
        {isError ? (
          <div className="py-12 text-center text-rose-500 font-semibold text-xs">
            Failed to load service areas. Please refresh or try again.
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredAreas}
            isLoading={isLoading}
            searchPlaceholder="Search areas by name or city..."
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            statusOptions={[
              { label: "Active", value: "ACTIVE" },
              { label: "Inactive", value: "INACTIVE" },
            ]}
            onStatusChange={setStatusFilter}
            emptyMessage="No service areas found."
            keyExtractor={(item) => item._id}
          />
        )}
      </div>

      {/* Add Service Area Modal */}
      <ServiceAreaModal
        isOpen={open}
        onOpenChange={setOpen}
        area={null}
      />

      {/* Edit Service Area Modal */}
      <ServiceAreaModal
        isOpen={Boolean(editingArea)}
        onOpenChange={(val) => !val && setEditingArea(null)}
        area={editingArea}
      />
    </div>
  );
}
