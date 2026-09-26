"use client";

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
import { ServiceArea } from "../types";
import { useServiceAreaModal } from "../hooks/useServiceAreaModal";

interface ServiceAreaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  area?: ServiceArea | null; // null for Create, area object for Edit
}

export function ServiceAreaModal({
  isOpen,
  onOpenChange,
  area,
}: ServiceAreaModalProps) {
  const {
    isEdit,
    areaName,
    setAreaName,
    status,
    setStatus,
    isFetchingDetail,
    saveMutation,
  } = useServiceAreaModal(area, isOpen, onOpenChange);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        className="sm:max-w-lg overflow-hidden flex flex-col p-0 gap-0 rounded-2xl bg-white"
      >
        <DialogHeader className="p-6 pb-4 border-b bg-white">
          <div>
            <DialogTitle className="text-lg font-bold text-gray-900">
              {isEdit
                ? `Edit ${area?.areaName || "Service Area"}`
                : "Add Service Area"}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 mt-0.5">
              Configure operating territory and lifecycle status
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4 bg-zinc-50/50">
          {isFetchingDetail ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 text-indigo-600 animate-spin" />
              <p className="text-xs text-gray-500 font-medium">
                Loading existing service area details...
              </p>
            </div>
          ) : (
            <>
              {/* Area Name Input */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700">
                  Area Name <span className="text-rose-500">*</span>
                </Label>
                <CustomInput
                  placeholder="Enter area name (e.g. Dubai Central, London Metro)..."
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                  className="h-9 text-xs"
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
                      value: "INACTIVE",
                    },
                  ]}
                  value={status}
                  onChange={setStatus}
                  placeholder="Select status"
                  className="w-full"
                  triggerClassName="w-full"
                />
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <DialogFooter className="p-4 px-6 border-t bg-white flex flex-row items-center justify-between gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl px-5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border-gray-200 shadow-2xs cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={
              saveMutation.isPending ||
              isFetchingDetail ||
              !areaName.trim()
            }
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
              "Create Service Area"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
