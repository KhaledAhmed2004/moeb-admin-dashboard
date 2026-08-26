"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { MyModal } from "@/components/shared/MyModal";
import { AddServiceAreaForm } from "@/components/forms/AddServiceAreaForm";
import { getColumns, ServiceArea } from "./columns";
import { DataTable } from "./data-table";

export default function ServiceAreaPage() {
  const [open, setOpen] = useState(false);

  const { data: areas = [], isLoading, isError } = useQuery({
    queryKey: ["service-areas"],
    queryFn: async () => {
      const response = await api.get("/service-areas?status=ALL");
      // The backend returns { success, message, pagination, data: [...] }
      return response.data.data as ServiceArea[];
    },
  });

  const columns = getColumns();

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-[#fdfdfd] min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Service Areas</h1>
          <p className="text-sm text-zinc-500 mt-1.5 font-medium">Manage and monitor all the regions and cities where your services operate.</p>
        </div>
      </div>

      <div className="mt-4">
        {isError ? (
          <div className="py-12 text-center text-red-500 font-medium">
            Failed to load service areas. Please try again.
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={areas} 
            searchKey="areaName"
            isLoading={isLoading}
            actionNode={
              <button 
                onClick={() => setOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 h-10 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow active:scale-[0.98] whitespace-nowrap">
                <Plus size={16} strokeWidth={2.5} />
                Add Area
              </button>
            }
            renderSubComponent={({ row }) => (
              <div className="px-14 py-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    <span>Covered Cities</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {row.original.cities.map((city, cIdx) => (
                    <span
                      key={cIdx}
                      className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-white text-zinc-700 border border-zinc-200/80 shadow-sm hover:border-indigo-200 hover:text-indigo-700 transition-colors cursor-default"
                    >
                      {city}
                    </span>
                  ))}
                </div>
              </div>
            )}
          />
        )}
      </div>
      
      <MyModal open={open} onOpenChange={(val: boolean) => setOpen(val)}>
        <AddServiceAreaForm setOpen={setOpen} />
      </MyModal>
    </div>
  );
}
