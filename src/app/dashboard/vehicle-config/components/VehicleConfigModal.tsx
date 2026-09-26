import { Loader2, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/shared/CustomInput";
import { VehicleConfig } from "../types";
import { useVehicleConfigModal } from "../hooks/useVehicleConfigModal";

interface VehicleConfigModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  config?: VehicleConfig | null;
  existingTypes?: string[];
}

export function VehicleConfigModal({
  isOpen,
  onOpenChange,
  config,
  existingTypes = [],
}: VehicleConfigModalProps) {
  const { formState, actions, saveMutation } = useVehicleConfigModal({
    config,
    isOpen,
    onOpenChange,
    existingTypes,
  });

  const {
    makesAndModels,
    modelInput,
    setModelInput,
    isEdit,
    isFetchingDetail,
    hasChanges,
  } = formState;

  const { handleAddModel, handleRemoveModel } = actions;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        className="sm:max-w-2xl max-h-[92vh] overflow-hidden p-0 gap-0 rounded-2xl bg-white"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!saveMutation.isPending) {
              saveMutation.mutate();
            }
          }}
          className="flex flex-col h-full"
        >
          <DialogHeader className="p-6 pb-4 border-b bg-white">
            <DialogTitle className="text-lg font-bold text-gray-900">
              {isEdit
                ? `Edit ${config?.vehicleType} Configuration`
                : "Add Vehicle Configuration"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Manage whitelisted vehicle models for this category
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">
            {isFetchingDetail ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-7 w-7 text-indigo-600 animate-spin" />
                <p className="text-xs text-gray-500 font-medium">
                  Loading existing {config?.vehicleType || "vehicle"}{" "}
                  configuration...
                </p>
              </div>
            ) : (
              <>
                {/* Permitted Makes & Models Catalog */}
                <div className="space-y-4">
                  {/* Manual Add Model Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <CustomInput
                      placeholder="Enter model name (e.g. Mercedes-Benz S-Class) and click Add or press Enter..."
                      value={modelInput}
                      onChange={(e) => setModelInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddModel();
                        }
                      }}
                      className="h-9 text-xs bg-zinc-50 border-gray-200"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddModel}
                      className="h-9 px-4 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
                    >
                      <Plus size={14} className="mr-1" />
                      Add
                    </Button>
                  </div>

                  <div className="min-h-[120px] max-h-[250px] overflow-y-auto p-3 rounded-xl bg-zinc-50/80 border border-zinc-200/80">
                    {makesAndModels.length === 0 ? (
                      <div className="py-8 text-center text-xs text-gray-400">
                        No models added yet. Type a model name in the input
                        above and press Enter or Add.
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {makesAndModels.map((model) => (
                          <span
                            key={model}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white text-gray-800 border border-gray-200 shadow-2xs"
                          >
                            {model}
                            <button
                              type="button"
                              onClick={() => handleRemoveModel(model)}
                              className="text-gray-400 hover:text-rose-600 transition-colors ml-0.5 cursor-pointer"
                              title="Remove model"
                            >
                              <X size={13} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="p-4 px-6 border-t bg-white flex flex-row items-center justify-end gap-3 w-full">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl px-5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border-gray-200 shadow-2xs cursor-pointer"
              >
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="submit"
              disabled={
                saveMutation.isPending ||
                isFetchingDetail ||
                makesAndModels.length === 0 ||
                (isEdit && !hasChanges)
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
                "Create Configuration"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
