"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { CustomTabs, TabOption } from "@/components/shared/CustomTabs";
import { DataTable } from "@/components/shared/data-table/DataTable";
import { toast } from "sonner";
import { ChatGroupService } from "@/services/chatGroupService";
import { IGroupChat } from "@/types/chatGroup";
import { getChatGroupColumns } from "./components/columns";
import { ChatGroupModal } from "./components/ChatGroupModal";
import { GroupChatDrawer } from "./components/GroupChatDrawer";

export default function ChatGroupsPage() {
  const queryClient = useQueryClient();

  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals & Drawer State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<IGroupChat | null>(null);
  const [chatDrawerGroup, setChatDrawerGroup] =
    useState<IGroupChat | null>(null);

  // Fetch groups
  const {
    data: groups = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["chat-groups"],
    queryFn: () => ChatGroupService.getAllGroups(),
    staleTime: 5000,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (groupId: string) => ChatGroupService.deleteGroup(groupId),
    onSuccess: () => {
      toast.success("Chat group deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["chat-groups"] });
    },
    onError: (err: unknown) => {
      const axiosErr = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        axiosErr?.response?.data?.message ||
        axiosErr?.message ||
        "Failed to delete group";
      toast.error(msg);
    },
  });

  const tabOptions: TabOption[] = [
    { label: "All Groups", value: "ALL" },
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" },
  ];

  // Filter groups based on status
  const filteredGroups = useMemo(() => {
    if (statusFilter === "ACTIVE") {
      return groups.filter((g) => g.status !== "ARCHIVED");
    }
    if (statusFilter === "INACTIVE") {
      return groups.filter((g) => g.status === "ARCHIVED");
    }
    return groups;
  }, [groups, statusFilter]);

  // Paginated slice
  const paginatedGroups = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredGroups.slice(start, start + limit);
  }, [filteredGroups, page, limit]);

  // Columns definition
  const columns = useMemo(
    () =>
      getChatGroupColumns({
        onChat: (group) => setChatDrawerGroup(group),
        onEdit: (group) => {
          setEditingGroup(group);
          setIsModalOpen(true);
        },
        onDelete: (id) => deleteMutation.mutate(id),
        isDeleting: deleteMutation.isPending,
      }),
    [deleteMutation]
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-background min-h-screen">
      <PageHeader
        title="Chat Groups"
        description="Manage and monitor chat groups, participant assignments, and group communications"
        action={
          <Button
            onClick={() => {
              setEditingGroup(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 h-10 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus size={15} />
            Add Chat Group
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
            Failed to load chat groups. Please refresh or try again.
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={paginatedGroups}
            isLoading={isLoading}
            searchKey="name"
            searchPlaceholder="Search chat groups..."
            pagination={{
              page,
              limit,
              total: filteredGroups.length,
              totalPage: Math.max(
                1,
                Math.ceil(filteredGroups.length / limit)
              ),
            }}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        )}
      </section>

      {/* Add / Edit Chat Group Modal */}
      {(isModalOpen || Boolean(editingGroup)) && (
        <ChatGroupModal
          isOpen={isModalOpen || Boolean(editingGroup)}
          onOpenChange={(val) => {
            if (!val) {
               setIsModalOpen(false);
              setEditingGroup(null);
            }
          }}
          group={editingGroup}
        />
      )}

      {/* Live Group Chat Drawer */}
      <GroupChatDrawer
        group={chatDrawerGroup}
        isOpen={Boolean(chatDrawerGroup)}
        onClose={() => setChatDrawerGroup(null)}
      />
    </div>
  );
}
