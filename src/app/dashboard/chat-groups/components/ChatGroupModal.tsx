"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CustomInput } from "@/components/shared/CustomInput";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ChatGroupService } from "@/services/chatGroupService";
import { IGroupChat } from "@/types/chatGroup";

interface ChatGroupModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  group?: IGroupChat | null; // null for Create, group object for Edit
}

export function ChatGroupModal({
  isOpen,
  onOpenChange,
  group,
}: ChatGroupModalProps) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(group && group._id);

  const [name, setName] = useState(group?.name || "");
  const [status, setStatus] = useState<"ACTIVE" | "ARCHIVED" | "DISABLED">(
    group?.status || "ACTIVE"
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Group name is required");

      if (isEdit && group?._id) {
        return ChatGroupService.updateGroup(group._id, {
          name: name.trim(),
          status,
        });
      } else {
        return ChatGroupService.createGroup({
          name: name.trim(),
          status,
        });
      }
    },
    onSuccess: (data) => {
      toast.success(
        isEdit
          ? `Group "${data.name}" updated successfully`
          : `Group "${data.name}" created successfully`
      );
      queryClient.invalidateQueries({ queryKey: ["chat-groups"] });
      if (group?._id) {
        queryClient.invalidateQueries({ queryKey: ["chat-group", group._id] });
      }
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      const axiosErr = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        axiosErr?.response?.data?.message ||
        axiosErr?.message ||
        "Failed to save group";
      toast.error(msg);
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        className="sm:max-w-lg overflow-hidden flex flex-col p-0 gap-0 rounded-2xl bg-white"
      >
        <DialogHeader className="p-6 pb-4 border-b bg-white">
          <div>
            <DialogTitle className="text-lg font-bold text-gray-900">
              {isEdit ? `Edit ${group?.name || "Chat Group"}` : "Add Chat Group"}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 mt-0.5">
              Configure chat group name and operational status
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4 bg-zinc-50/50">
          {/* Group Name Input */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-700">
              Group Name <span className="text-rose-500">*</span>
            </Label>
            <CustomInput
              placeholder="Enter group name (e.g. VIP Fleet, Operations, Support Group)..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 text-xs"
              disabled={saveMutation.isPending}
            />
          </div>

          {/* Status Select */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-700">
              Operational Status
            </Label>
            <CustomSelect
              options={[
                {
                  label: "Active",
                  value: "ACTIVE",
                },
                {
                  label: "Inactive",
                  value: "ARCHIVED",
                },
              ]}
              value={status}
              onChange={(val) =>
                setStatus(val as "ACTIVE" | "ARCHIVED" | "DISABLED")
              }
              placeholder="Select status"
              className="w-full"
              triggerClassName="w-full"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <DialogFooter className="p-4 px-6 border-t bg-white flex flex-row items-center justify-between gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saveMutation.isPending}
            className="rounded-xl px-5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border-gray-200 shadow-2xs cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !name.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold px-6 shadow-xs cursor-pointer disabled:opacity-50"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 size={14} className="animate-spin mr-1.5" />
                Saving...
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Create Chat Group"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
