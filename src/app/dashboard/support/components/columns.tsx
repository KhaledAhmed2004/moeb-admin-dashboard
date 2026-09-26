import React from "react";
import { ColumnDef } from "@/components/shared/DataTable";
import { IAdminSupportTicket } from "@/types/supportAdmin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Trash2, Calendar, User, Eye } from "lucide-react";

interface GetSupportColumnsProps {
  onViewTicket: (ticket: IAdminSupportTicket) => void;
  onDeleteTicket: (ticket: IAdminSupportTicket) => void;
}

export function getSupportColumns({
  onViewTicket,
  onDeleteTicket,
}: GetSupportColumnsProps): ColumnDef<IAdminSupportTicket>[] {
  return [
    {
      header: "Ticket ID",
      cell: (ticket) => (
        <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100/80 px-2 py-1 rounded-md border border-gray-200/60">
          #{ticket._id.slice(-6).toUpperCase()}
        </span>
      ),
    },
    {
      header: "Subject",
      cell: (ticket) => (
        <div className="max-w-[280px]">
          <p
            onClick={() => onViewTicket(ticket)}
            className="font-bold text-sm text-gray-900 hover:text-purple-600 transition-colors cursor-pointer truncate"
            title={ticket.subject}
          >
            {ticket.subject || "No Subject"}
          </p>
          {ticket.messages?.[ticket.messages.length - 1] && (
            <p className="text-[11px] text-gray-500 truncate mt-0.5">
              Latest: {ticket.messages[ticket.messages.length - 1].message}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Customer",
      cell: (ticket) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs shrink-0">
            {(ticket.user?.name?.[0] || "U").toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-xs text-gray-900 truncate">
              {ticket.user?.name || "Anonymous User"}
            </p>
            <p className="text-[11px] text-gray-500 truncate">
              {ticket.user?.email || "No email"}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (ticket) => {
        const getStatusColor = (s: string) => {
          switch (s) {
            case "PENDING":
              return "bg-amber-100 text-amber-700 border-amber-200";
            case "IN_PROGRESS":
              return "bg-blue-100 text-blue-700 border-blue-200";
            case "RESOLVED":
              return "bg-emerald-100 text-emerald-700 border-emerald-200";
            default:
              return "bg-gray-100 text-gray-700 border-gray-200";
          }
        };
        return (
          <Badge variant="outline" className={`font-semibold text-[10px] uppercase tracking-wider ${getStatusColor(ticket.status || "PENDING")}`}>
            {(ticket.status || "PENDING").replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      header: "Messages",
      cell: (ticket) => {
        const count = ticket.messages?.length || 0;
        return (
          <Badge
            variant="secondary"
            className="gap-1 text-[11px] font-medium bg-purple-50 text-purple-700 border-purple-200/60 py-0.5 px-2"
          >
            <MessageSquare className="w-3 h-3 text-purple-600" />
            {count} {count === 1 ? "msg" : "msgs"}
          </Badge>
        );
      },
    },
    {
      header: "Created Date",
      cell: (ticket) => {
        try {
          const d = new Date(ticket.createdAt);
          return (
            <div className="text-xs text-gray-600 space-y-0.5">
              <p className="font-medium text-gray-800 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gray-400" />
                {d.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <p className="text-[10px] text-gray-400">
                {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          );
        } catch {
          return <span className="text-xs text-gray-400">{ticket.createdAt}</span>;
        }
      },
    },
    {
      header: "Actions",
      cell: (ticket) => (
        <div className="flex items-center gap-1.5 justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onViewTicket(ticket)}
            className="h-8 px-2.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-200 cursor-pointer gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            View Thread
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDeleteTicket(ticket)}
            className="h-8 w-8 p-0 text-gray-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
            title="Delete Ticket"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];
}
