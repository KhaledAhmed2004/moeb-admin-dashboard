"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Trash2,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
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
import { DataTable } from "@/components/shared/DataTable";
import { StatCard } from "@/components/shared/StatCard";
import { toast } from "sonner";
import { AdminSupportService } from "@/services/adminSupportService";
import { IAdminSupportTicket } from "@/types/supportAdmin";
import { getSupportColumns } from "./components/columns";
import { TicketDetailDrawer } from "./components/TicketDetailDrawer";

export default function SupportCenterPage() {
  const queryClient = useQueryClient();

  // Table State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Drawer & Modal State
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<IAdminSupportTicket | null>(null);

  // ─── 1. Query: Fetch Support Tickets ──────────────────────────────────────
  const {
    data: ticketsData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["support-tickets", page, limit, searchTerm],
    queryFn: () =>
      AdminSupportService.getAllTickets({
        page,
        limit,
        searchTerm: searchTerm.trim() || undefined,
        sort: "-createdAt",
      }),
    staleTime: 5000,
  });

  const tickets = ticketsData?.tickets || [];
  const pagination = ticketsData?.pagination;
  const totalTickets = pagination?.total ?? tickets.length;
  const totalPages = pagination?.totalPage ?? Math.max(1, Math.ceil(totalTickets / limit));



  // ─── 3. Query: Fetch Support Stats ────────────────────────────────────────
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["support-stats"],
    queryFn: () => AdminSupportService.getSupportStats(),
    staleTime: 60000,
  });

  // ─── 2. Mutation: Delete Ticket ───────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => AdminSupportService.deleteTicket(id),
    onSuccess: () => {
      toast.success("Support ticket deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      setTicketToDelete(null);
    },
    onError: (err: unknown) => {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to delete ticket";
      toast.error(errorMsg);
    },
  });

  // Action handlers
  const handleViewTicket = (ticket: IAdminSupportTicket) => {
    setSelectedTicketId(ticket._id);
    setIsDrawerOpen(true);
  };

  const handleDeleteTicketPrompt = (ticket: IAdminSupportTicket) => {
    setTicketToDelete(ticket);
  };

  const handleConfirmDelete = () => {
    if (!ticketToDelete?._id) return;
    deleteMutation.mutate(ticketToDelete._id);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset to page 1 on new search
  };

  // Table Columns
  const columns = useMemo(
    () =>
      getSupportColumns({
        onViewTicket: handleViewTicket,
        onDeleteTicket: handleDeleteTicketPrompt,
      }),
    []
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-background min-h-screen">
      {/* ─── Header Section ───────────────────────────────────────────── */}
      <PageHeader
        title="Support Ticket Management"
        description="Monitor customer inquiries, reply to support threads, and manage platform tickets"
      />

      {/* ─── Metric Overview Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Tickets"
          value={stats?.totalTickets?.count ?? 0}
          metric={stats?.totalTickets}
          isLoading={isStatsLoading}
        />
        <StatCard
          title="Pending Tickets"
          value={stats?.pendingTickets?.count ?? 0}
          metric={stats?.pendingTickets}
          isLoading={isStatsLoading}
        />
        <StatCard
          title="In Progress"
          value={stats?.inProgressTickets?.count ?? 0}
          metric={stats?.inProgressTickets}
          isLoading={isStatsLoading}
        />
        <StatCard
          title="Resolved Tickets"
          value={stats?.resolvedTickets?.count ?? 0}
          metric={stats?.resolvedTickets}
          isLoading={isStatsLoading}
        />
      </div>

      {/* ─── Tickets Data Table ─────────────────────────────────────────── */}
      <Card className="border border-gray-100 shadow-xs bg-white rounded-xl p-5">
        <DataTable
          columns={columns}
          data={tickets}
          isLoading={isLoading}
          searchPlaceholder="Search tickets by subject..."
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalTickets}
          pageSize={limit}
          onPageChange={(newPage) => setPage(newPage)}
          emptyMessage="No support tickets found matching your query."
          keyExtractor={(ticket) => ticket._id}
        />
      </Card>

      {/* ─── Ticket Details & Conversation Thread Drawer ────────────────── */}
      <TicketDetailDrawer
        ticketId={selectedTicketId}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedTicketId(null);
        }}
        onTicketUpdated={() => refetch()}
      />

      {/* ─── Delete Confirmation Modal ─────────────────────────────────── */}
      <AlertDialog
        open={Boolean(ticketToDelete)}
        onOpenChange={(open) => !open && setTicketToDelete(null)}
      >
        <AlertDialogContent className="max-w-md bg-white rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                <Trash2 className="w-4 h-4" />
              </span>
              Delete Support Ticket
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-gray-500 leading-relaxed">
              Are you sure you want to permanently delete ticket{" "}
              <strong className="text-gray-800">
                &ldquo;{ticketToDelete?.subject}&rdquo;
              </strong>{" "}
              (#{ticketToDelete?._id.slice(-6).toUpperCase()})? This action cannot be undone and will delete the entire conversation history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel
              disabled={deleteMutation.isPending}
              className="text-xs h-9 cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs h-9 cursor-pointer"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Deleting...
                </>
              ) : (
                "Delete Ticket"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
