import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MessageSquare, Pencil, Trash2, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { IGroupChat } from "@/types/chatGroup";

export interface ChatGroupTableActions {
  onChat: (group: IGroupChat) => void;
  onEdit: (group: IGroupChat) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export const getChatGroupColumns = (
  actions: ChatGroupTableActions
): ColumnDef<IGroupChat>[] => [
  {
    accessorKey: "name",
    header: "Group Name",
    cell: ({ row }) => {
      const group = row.original;
      return (
        <div className="flex items-center gap-3 py-1">
          <Avatar className="h-9 w-9 border shrink-0">
            <AvatarImage src={group.avatar || undefined} />
            <AvatarFallback className="font-bold bg-indigo-50 text-indigo-600 text-xs">
              {group.name?.charAt(0).toUpperCase() || "G"}
            </AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
              {group.name}
            </p>
            {group.description && (
              <p className="text-xs text-zinc-500 truncate max-w-[220px]">
                {group.description}
              </p>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const isArchived = row.original.status === "ARCHIVED";
      return isArchived ? (
        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-600 border border-zinc-200/60 dark:bg-zinc-800 dark:text-zinc-400">
          Inactive
        </span>
      ) : (
        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          Active
        </span>
      );
    },
  },
  {
    id: "lastMessage",
    header: "Last Message",
    cell: ({ row }) => {
      const group = row.original;
      const lastActive = group.lastMessageAt
        ? new Date(group.lastMessageAt).toLocaleDateString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : null;

      return (
        <div className="max-w-[240px]">
          <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">
            {group.lastMessage || "No messages yet"}
          </p>
          {lastActive && (
            <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
              <Clock size={10} />
              {lastActive}
            </p>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const group = row.original;
      return (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => actions.onChat(group)}
            className="text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors p-2 rounded-lg inline-flex items-center justify-center cursor-pointer"
            title="Open Chat"
          >
            <MessageSquare size={15} />
          </button>

          <button
            onClick={() => actions.onEdit(group)}
            className="text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors p-2 rounded-lg inline-flex items-center justify-center cursor-pointer"
            title="Edit Group"
          >
            <Pencil size={15} />
          </button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                className="text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors p-2 rounded-lg inline-flex items-center justify-center cursor-pointer"
                title="Delete Group"
                disabled={actions.isDeleting}
              >
                <Trash2 size={15} />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete &quot;{group.name}&quot;.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-rose-600 text-white hover:bg-rose-700"
                  onClick={() => actions.onDelete(group._id)}
                  disabled={actions.isDeleting}
                >
                  {actions.isDeleting ? "Deleting..." : "Delete Group"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
  },
];
