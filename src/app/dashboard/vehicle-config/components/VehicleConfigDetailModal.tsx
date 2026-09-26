"use client";

import { CustomModal } from "@/components/shared/CustomModal";
import { Button } from "@/components/ui/button";
import { VehicleConfig } from "../types";

interface VehicleConfigDetailModalProps {
  config: VehicleConfig | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (config: VehicleConfig) => void;
}

export function VehicleConfigDetailModal({
  config,
  isOpen,
  onOpenChange,
  onEdit,
}: VehicleConfigDetailModalProps) {
  if (!config) return null;

  const models = config.makesAndModels || [];

  const customFooter = (
    <div className="p-4 px-6 border-t border-zinc-100 bg-zinc-50/50 flex flex-row items-center justify-end gap-3 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
        className="rounded-xl px-5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border-gray-200 shadow-2xs cursor-pointer"
      >
        Close
      </Button>

      {onEdit && (
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            onOpenChange(false);
            onEdit(config);
          }}
          className="rounded-xl px-4 text-xs font-semibold text-indigo-700 border-indigo-200 hover:bg-indigo-50 cursor-pointer"
        >
          Edit Rules
        </Button>
      )}
    </div>
  );

  return (
    <CustomModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={`${config.vehicleType} Configuration Details`}
      description={`${models.length} supported models available for onboarding`}
      size="2xl"
      footer={customFooter}
    >
      <div className="flex flex-wrap gap-2">
        {models.length === 0 ? (
            <div className="w-full text-center py-8 text-xs text-gray-400 font-medium">
              No makes or models added to this category yet
            </div>
          ) : (
            models.map((model, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-50 hover:bg-indigo-50/60 text-zinc-800 hover:text-indigo-900 border border-zinc-200/80 transition-colors shadow-2xs"
              >
                {model}
              </span>
            ))
          )}
      </div>
    </CustomModal>
  );
}
