"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, CheckCircle2, DollarSign, MoreVertical, Trash2, Edit3, CheckCheck, MapPin, Eye } from "lucide-react";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { StatCard } from "@/components/shared/StatCard";
import { toast } from "sonner";
import api from "@/lib/axios";
import { ItemEntity, ItemStatsResponse } from "./types";
import { EditItemModal } from "./EditItemModal";
import { ViewItemModal } from "./ViewItemModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getMediaUrl } from "@/lib/utils";

export default function ItemManagementPage() {
  const queryClient = useQueryClient();
  const [viewingItem, setViewingItem] = useState<ItemEntity | null>(null);
  const [editingItem, setEditingItem] = useState<ItemEntity | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [conditionFilter, setConditionFilter] = useState("ALL");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Fetch Items from Backend API: GET /api/v1/items
  const { data: itemsResponse, isLoading, refetch } = useQuery({
    queryKey: ["admin-items", searchTerm, statusFilter, conditionFilter, page, limit],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        page,
        limit,
      };
      if (searchTerm.trim()) params.searchTerm = searchTerm.trim();
      if (statusFilter && statusFilter !== "ALL") params.status = statusFilter;
      if (conditionFilter && conditionFilter !== "ALL") params.condition = conditionFilter;

      try {
        const response = await api.get("/items", { params });
        return response.data;
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status === 404) {
          const response = await api.get("/api/v1/items", { params });
          return response.data;
        }
        throw err;
      }
    },
  });

  // Fetch Items Statistics: GET /api/v1/items/stats
  const {
    data: statsResponse,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useQuery<ItemStatsResponse>({
    queryKey: ["items-stats"],
    queryFn: async () => {
      try {
        const response = await api.get("/items/stats");
        return response.data;
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status === 404) {
          const response = await api.get("/api/v1/items/stats");
          return response.data;
        }
        throw err;
      }
    },
  });

  const statsData = statsResponse?.data;

  const rawItems: ItemEntity[] = useMemo(() => {
    const data = itemsResponse?.data;
    if (Array.isArray(data)) return data;
    return [];
  }, [itemsResponse]);

  // Pagination Metadata from Backend
  const pagination = itemsResponse?.pagination;
  const totalPages = pagination?.totalPage || pagination?.totalPages || 1;
  const totalItems = pagination?.total !== undefined ? pagination.total : rawItems.length;
  const currentPage = pagination?.page || page;

  // Derived Metrics (Fallback if stats query is loading)
  const totalCount = totalItems;
  const availableCount = rawItems.filter((i) => i.status === "AVAILABLE").length;
  const soldCount = rawItems.filter((i) => i.status === "SOLD").length;

  // Mark as Sold Mutation: PATCH /items/:itemId/sold
  const markAsSoldMutation = useMutation({
    mutationFn: async (itemId: string) => {
      try {
        const res = await api.patch(`/items/${itemId}/sold`);
        return res.data;
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status === 404) {
          const res = await api.patch(`/api/v1/items/${itemId}/sold`);
          return res.data;
        }
        throw err;
      }
    },
    onSuccess: () => {
      toast.success("Item marked as SOLD!");
      queryClient.invalidateQueries({ queryKey: ["admin-items"] });
      queryClient.invalidateQueries({ queryKey: ["items-stats"] });
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || "Failed to mark item as sold.");
    },
  });

  // Delete Item Mutation: DELETE /items/:itemId
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      try {
        const res = await api.delete(`/items/${itemId}`);
        return res.data;
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status === 404) {
          const res = await api.delete(`/api/v1/items/${itemId}`);
          return res.data;
        }
        throw err;
      }
    },
    onSuccess: () => {
      toast.success("Item deleted permanently!");
      setDeletingItemId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-items"] });
      queryClient.invalidateQueries({ queryKey: ["items-stats"] });
    },
    onError: (err: unknown) => {
      setDeletingItemId(null);
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || "Failed to delete item.");
    },
  });

  // Compact Table Columns (Optimized width to prevent horizontal scrollbar)
  const columns: ColumnDef<ItemEntity>[] = [
    {
      header: "Listing Item",
      cell: (item) => {
        const rawPhoto = item.photos?.[0];
        const photoUrl = rawPhoto ? getMediaUrl(rawPhoto) : "";
        return (
          <div className="flex items-center gap-2.5 max-w-[200px]">
            {photoUrl ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100 flex items-center justify-center">
                <img
                  src={photoUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.classList.add("bg-purple-50", "text-purple-600");
                      parent.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 12v10"/></svg>';
                    }
                  }}
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                <Package size={18} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-bold text-xs text-gray-900 leading-tight truncate" title={item.title}>
                {item.title}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Condition",
      cell: (item) => {
        const condition = item.condition || "New";
        const bgMap: Record<string, string> = {
          New: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
          Used: "bg-blue-50 text-blue-700 border-blue-200/60",
          Refurbished: "bg-amber-50 text-amber-700 border-amber-200/60",
        };
        return (
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${bgMap[condition] || "bg-gray-100 text-gray-700"}`}>
            {condition}
          </span>
        );
      },
    },
    {
      header: "Status",
      cell: (item) => {
        const isAvailable = item.status === "AVAILABLE";
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
              isAvailable
                ? "text-emerald-700 bg-emerald-50 border-emerald-200/60"
                : "text-slate-600 bg-slate-100 border-slate-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isAvailable ? "bg-emerald-500" : "bg-slate-400"
              }`}
            ></span>
            {item.status}
          </span>
        );
      },
    },
    {
      header: "Price ($)",
      cell: (item) => (
        <span className="text-xs text-gray-900 font-bold">
          ${Number(item.price || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Location",
      cell: (item) => (
        <div className="flex items-center gap-1 text-xs text-gray-600 font-medium max-w-[110px] truncate" title={item.location}>
          <MapPin size={13} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">{item.location || "N/A"}</span>
        </div>
      ),
    },
    {
      header: "Seller",
      cell: (item) => {
        const creator = typeof item.createdBy === "object" ? item.createdBy : null;
        const name = creator?.name || "Seller";
        const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "SP";
        return (
          <div className="flex items-center gap-2 max-w-[130px]" title={`${name} (${creator?.email || ''})`}>
            <Avatar className="h-6 w-6 flex-shrink-0">
              {creator?.profilePicture && <AvatarImage src={getMediaUrl(creator.profilePicture)} alt={name} />}
              <AvatarFallback className="bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold text-xs text-gray-800 truncate">{name}</span>
          </div>
        );
      },
    },
    {
      header: "Listed Date",
      cell: (item) => (
        <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">
          {item.createdAt
            ? new Date(item.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })
            : "-"}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-center",
      cell: (item) => (
        <div className="flex items-center justify-center gap-1">
          {/* Quick View Button */}
          <button
            onClick={() => setViewingItem(item)}
            title="View Details"
            className="text-indigo-600 hover:text-indigo-800 transition-colors p-1.5 rounded-md hover:bg-indigo-50 inline-flex items-center justify-center cursor-pointer"
          >
            <Eye size={16} />
          </button>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-md hover:bg-gray-100 inline-flex items-center justify-center cursor-pointer">
                <MoreVertical size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {item.status === "AVAILABLE" && (
                <DropdownMenuItem
                  onClick={() => markAsSoldMutation.mutate(item._id)}
                  className="gap-2 text-emerald-600 font-medium cursor-pointer"
                >
                  <CheckCheck size={15} />
                  Mark as Sold
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => setEditingItem(item)}
                className="gap-2 text-gray-700 font-medium cursor-pointer"
              >
                <Edit3 size={15} />
                Edit Listing
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeletingItemId(item._id)}
                className="gap-2 text-rose-600 font-medium cursor-pointer"
              >
                <Trash2 size={15} />
                Delete Listing
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-background min-h-full">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Item Management</h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          Inspect, create, update, and manage all marketplace listings platform-wide
        </p>
      </div>

      {/* Stats Row (3 Cards from GET /api/v1/items/stats) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Items"
          value={statsData?.totalItems?.count ?? totalCount}
          metric={statsData?.totalItems}
          isLoading={isLoading || isStatsLoading}
        />

        <StatCard
          title="Available Items"
          value={statsData?.availableItems?.count ?? availableCount}
          metric={statsData?.availableItems}
          isLoading={isLoading || isStatsLoading}
        />

        <StatCard
          title="Sold Items"
          value={statsData?.soldItems?.count ?? soldCount}
          metric={statsData?.soldItems}
          isLoading={isLoading || isStatsLoading}
        />
      </div>

      {/* Main Content Using Global Reusable DataTable */}
      <div className="mt-6">
        <DataTable
          columns={columns}
          data={rawItems}
          isLoading={isLoading}
          searchPlaceholder="Search items by title, location or seller..."
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setPage(1);
          }}
          statusFilter={statusFilter}
          statusOptions={[
            { label: "AVAILABLE", value: "AVAILABLE" },
            { label: "SOLD", value: "SOLD" },
          ]}
          onStatusChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
          extraFilters={
            <CustomSelect
              options={[
                { label: "All Conditions", value: "ALL" },
                { label: "New", value: "New" },
                { label: "Used", value: "Used" },
                { label: "Refurbished", value: "Refurbished" },
              ]}
              value={conditionFilter}
              onChange={(val) => {
                setConditionFilter(val);
                setPage(1);
              }}
              placeholder="Condition"
            />
          }
          emptyMessage="No items found in platform catalog."
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={limit}
          onPageChange={(newPage) => setPage(newPage)}
          keyExtractor={(item) => item._id}
        />
      </div>

      {/* View Item Modal */}
      <ViewItemModal
        item={viewingItem}
        isOpen={!!viewingItem}
        onOpenChange={(open) => {
          if (!open) setViewingItem(null);
        }}
      />

      {/* Edit Item Modal */}
      <EditItemModal
        item={editingItem}
        isOpen={!!editingItem}
        onOpenChange={(open) => {
          if (!open) setEditingItem(null);
        }}
        onSuccess={() => {
          refetch();
          refetchStats();
        }}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deletingItemId} onOpenChange={(open) => !open && setDeletingItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the item listing from MongoDB and clean up photo assets.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingItemId && deleteItemMutation.mutate(deletingItemId)}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
