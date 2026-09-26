"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Loader2,
  User,
  ShieldCheck,
  Clock,
  Ticket,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { AdminSupportService } from "@/services/adminSupportService";
import { ISupportMessage } from "@/types/supportAdmin";

interface TicketDetailDrawerProps {
  ticketId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onTicketUpdated?: () => void;
}

export function TicketDetailDrawer({
  ticketId,
  isOpen,
  onClose,
  onTicketUpdated,
}: TicketDetailDrawerProps) {
  const queryClient = useQueryClient();
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch ticket details & full conversation thread
  const {
    data: ticket,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["support-ticket", ticketId],
    queryFn: () => (ticketId ? AdminSupportService.getTicketById(ticketId) : null),
    enabled: Boolean(ticketId && isOpen),
    refetchInterval: isOpen ? 3000 : false, // Fast 3s polling while thread is open for near-realtime sync
  });

  // Scroll to bottom when messages update
  useEffect(() => {
    if (ticket?.messages?.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [ticket?.messages?.length]);

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: (msg: string) => {
      if (!ticketId) throw new Error("Missing ticket ID");
      return AdminSupportService.replyToTicket(ticketId, msg);
    },
    onSuccess: (updated) => {
      setReplyText("");
      queryClient.setQueryData(["support-ticket", ticketId], updated);
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      toast.success("Reply sent successfully");
      if (onTicketUpdated) onTicketUpdated();
    },
    onError: (err: unknown) => {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to send reply";
      toast.error(errorMsg);
    },
  });

  // Status mutation
  const statusMutation = useMutation({
    mutationFn: (newStatus: string) => {
      if (!ticketId) throw new Error("Missing ticket ID");
      return AdminSupportService.updateTicketStatus(ticketId, newStatus);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["support-ticket", ticketId], updated);
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["support-stats"] });
      toast.success("Status updated successfully");
      if (onTicketUpdated) onTicketUpdated();
    },
    onError: (err: unknown) => {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update status";
      toast.error(errorMsg);
    },
  });

  const handleSendReply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = replyText.trim();
    if (!text || !ticketId || replyMutation.isPending) return;
    replyMutation.mutate(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const formatMessageTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const formatMessageDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const customerId =
    ticket?.user?.id ||
    ticket?.user?._id ||
    (typeof ticket?.user === "string" ? ticket?.user : "");

  const customerEmail =
    typeof ticket?.user === "object" ? ticket?.user?.email?.toLowerCase() : "";
  const customerName =
    typeof ticket?.user === "object" ? ticket?.user?.name?.trim() : "";

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 flex flex-col gap-0 bg-white border-l border-gray-200 shadow-2xl h-full"
      >
        {/* Drawer Header */}
        <SheetHeader className="p-5 pb-4 border-b border-gray-100 bg-white space-y-3">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <Ticket className="w-4 h-4" />
                </span>
                <Badge variant="outline" className="text-[11px] font-mono font-medium text-gray-500 bg-gray-50">
                  #{ticketId ? ticketId.slice(-6).toUpperCase() : ""}
                </Badge>
                {isFetching && !isLoading && (
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Updating...
                  </span>
                )}
              </div>
              <SheetTitle className="text-base font-bold text-gray-900 leading-snug">
                {ticket?.subject || (isLoading ? "Loading conversation..." : "Support Ticket")}
              </SheetTitle>
              <SheetDescription className="text-xs text-gray-500">
                Created on {ticket?.createdAt ? formatMessageDate(ticket.createdAt) : "..."}
              </SheetDescription>
            </div>
            {/* Status Dropdown */}
            {ticket && (
              <div className="shrink-0 w-36 mt-1">
                <Select
                  value={ticket.status}
                  onValueChange={(value) => statusMutation.mutate(value)}
                  disabled={statusMutation.isPending || isLoading}
                >
                  <SelectTrigger className="h-8 text-xs font-semibold">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING" className="text-xs font-semibold text-amber-700">PENDING</SelectItem>
                    <SelectItem value="IN_PROGRESS" className="text-xs font-semibold text-blue-700">IN PROGRESS</SelectItem>
                    <SelectItem value="RESOLVED" className="text-xs font-semibold text-emerald-700">RESOLVED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Customer Info Card */}
          {ticket?.user && (
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0">
                  {(ticket.user.name?.[0] || "U").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {ticket.user.name}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">
                    {ticket.user.email}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px] text-gray-600 shrink-0">
                Customer
              </Badge>
            </div>
          )}
        </SheetHeader>

        {/* Message Thread History */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              <p className="text-xs">Loading message thread...</p>
            </div>
          ) : !ticket?.messages || ticket.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 space-y-2 text-center p-6">
              <div className="p-3 rounded-full bg-gray-100 text-gray-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-600">No messages in this thread yet</p>
              <p className="text-xs text-gray-400 max-w-xs">
                Be the first to reply to this customer below.
              </p>
            </div>
          ) : (
            ticket.messages.map((msg: ISupportMessage, idx: number) => {
              const senderObj = typeof msg.sender === "object" ? msg.sender : null;
              const senderId =
                senderObj?.id ||
                senderObj?._id ||
                (typeof msg.sender === "string" ? msg.sender : "");
              const senderEmail = senderObj?.email?.toLowerCase() || "";
              const senderName = senderObj?.name?.trim() || "";
              const senderRole = (senderObj?.role || "").toUpperCase();

              // Robust check: Is this message sent by an admin/super_admin or the customer?
              const isAdminRole = senderRole === "ADMIN" || senderRole === "SUPER_ADMIN";
              const isUserRole = senderRole === "USER" || senderRole === "CHAUFFEUR";

              const matchesCustomerId = Boolean(customerId && senderId && customerId.toString() === senderId.toString());
              const matchesCustomerEmail = Boolean(customerEmail && senderEmail && customerEmail === senderEmail);
              const matchesCustomerName = Boolean(customerName && senderName && customerName === senderName);

              // It's a customer message if role is user/chauffeur, or matches customer id/email/name AND is not admin role
              const isCustomer = isUserRole || (!isAdminRole && (matchesCustomerId || matchesCustomerEmail || matchesCustomerName));

              return (
                <div
                  key={msg._id || idx}
                  className={`flex flex-col ${isCustomer ? "items-start" : "items-end"}`}
                >
                  {/* Sender & Timestamp */}
                  <div className={`flex items-center gap-1.5 text-[11px] mb-1 px-1 ${isCustomer ? "text-gray-500" : "text-purple-600"}`}>
                    {isCustomer ? (
                      <>
                        <div className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[9px] font-bold">
                          {(senderName?.[0] || customerName?.[0] || "U").toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-700">
                          {senderName || customerName || "Customer"}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 font-medium">
                          Customer
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-gray-400">
                          <Clock className="w-2.5 h-2.5" />
                          {formatMessageTime(msg.createdAt)}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="flex items-center gap-0.5 text-gray-400">
                          <Clock className="w-2.5 h-2.5" />
                          {formatMessageTime(msg.createdAt)}
                        </span>
                        <span>•</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                        <span className="font-semibold text-purple-700">
                          Support Admin {senderName ? `(${senderName})` : ""}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 font-medium">
                          Admin
                        </span>
                      </>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`p-3.5 max-w-[85%] text-xs leading-relaxed shadow-xs ${
                      isCustomer
                        ? "bg-white text-gray-800 border border-gray-200/90 rounded-2xl rounded-tl-xs"
                        : "bg-purple-600 text-white rounded-2xl rounded-tr-xs"
                    }`}
                  >
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {msg.attachments.map((att, aIdx) => (
                          <a
                            key={aIdx}
                            href={att}
                            target="_blank"
                            rel="noreferrer"
                            className={`block rounded-lg overflow-hidden border ${isCustomer ? "border-black/10" : "border-white/20"} hover:opacity-90 transition`}
                          >
                            <img
                              src={att}
                              alt="attachment"
                              className="max-h-40 max-w-full rounded object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Input Form */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <form onSubmit={handleSendReply} className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Type official admin response... (Press Enter to send)"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={replyMutation.isPending || isLoading}
              className="flex-1 text-xs h-10 bg-gray-50 focus:bg-white border-gray-200"
            />
            <Button
              type="submit"
              disabled={replyMutation.isPending || !replyText.trim() || isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs h-10 px-4 cursor-pointer gap-1.5 shadow-xs shrink-0"
            >
              {replyMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Sending
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Send Reply
                </>
              )}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
