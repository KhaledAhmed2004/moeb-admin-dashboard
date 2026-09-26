import React from "react";
import { Car, Eye, ExternalLink } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ApplicationVehicle, ApplicationUserDetails, PreviewFileState } from "../../types";

interface ChauffeurVehiclesTabProps {
  vehicles: ApplicationVehicle[];
  user?: ApplicationUserDetails;
  selectedVehicleIds: string[];
  handleSelectAllVehicles: () => void;
  handleToggleVehicleSelect: (id: string) => void;
  handleApproveVehicles: (ids?: string[]) => void;
  handleOpenRejectVehiclesModal: (ids?: string[]) => void;
  isApproving: boolean;
  isRejecting: boolean;
  getStatusBadge: (st: string) => React.ReactNode;
  resolveFileUrl: (url?: string) => string;
  isPdfFile: (urlOrMime?: string, filename?: string) => boolean;
  setPreviewFile: React.Dispatch<React.SetStateAction<PreviewFileState>>;
}

export function ChauffeurVehiclesTab({
  vehicles,
  user,
  selectedVehicleIds,
  handleSelectAllVehicles,
  handleToggleVehicleSelect,
  handleApproveVehicles,
  handleOpenRejectVehiclesModal,
  isApproving,
  isRejecting,
  getStatusBadge,
  resolveFileUrl,
  isPdfFile,
  setPreviewFile,
}: ChauffeurVehiclesTabProps) {
  const getVehicleKey = (v: ApplicationVehicle, idx: number) =>
    v._id || (v as { id?: string }).id || `${v.makeAndModel || "veh"}-${v.type || "type"}-${idx}`;

  if (vehicles.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-100">
        <Car size={32} className="mx-auto text-gray-300 mb-2" />
        <p className="text-sm font-medium text-gray-600">No vehicles registered yet</p>
      </div>
    );
  }

  const allSelected = vehicles.length > 0 && selectedVehicleIds.length === vehicles.length;

  return (
    <div className="space-y-4">
      {/* Vehicle Selection Toolbar */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl bg-gray-50/80 border border-gray-200/80 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={handleSelectAllVehicles}
          >
            <Checkbox
              id="select-all-vehicles"
              checked={allSelected}
              onCheckedChange={handleSelectAllVehicles}
              onClick={(e) => e.stopPropagation()}
            />
            <label
              htmlFor="select-all-vehicles"
              className="text-xs font-bold text-gray-700 cursor-pointer select-none"
            >
              Select All Vehicles ({vehicles.length})
            </label>
          </div>
          {selectedVehicleIds.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary">
              {selectedVehicleIds.length} Selected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleOpenRejectVehiclesModal()}
            disabled={isApproving || isRejecting || selectedVehicleIds.length === 0}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 hover:border-rose-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRejecting ? "Rejecting..." : selectedVehicleIds.length > 1 ? `Reject Selected (${selectedVehicleIds.length})` : "Reject Vehicle"}
          </button>
          <button
            onClick={() => handleApproveVehicles()}
            disabled={isApproving || isRejecting || selectedVehicleIds.length === 0}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApproving ? "Approving..." : selectedVehicleIds.length > 1 ? `Approve Selected (${selectedVehicleIds.length})` : "Approve Vehicle"}
          </button>
        </div>
      </div>

      {/* Vehicle Cards */}
      {vehicles.map((v, idx) => {
        const vKey = getVehicleKey(v, idx);
        const isSelected =
          user?.selectedVehicle === v._id ||
          user?.selectedVehicle === (v as { id?: string }).id ||
          user?.selectedVehicle === vKey;
        const isChecked =
          selectedVehicleIds.includes(vKey) ||
          (v._id ? selectedVehicleIds.includes(v._id) : false) ||
          ((v as { id?: string }).id ? selectedVehicleIds.includes((v as { id?: string }).id!) : false);

        return (
          <div
            key={vKey}
            className={`p-5 rounded-2xl border bg-white shadow-xs space-y-4 transition-all ${
              isChecked
                ? "ring-2 ring-primary border-primary/50 bg-primary/[0.01]"
                : isSelected
                ? "ring-1 ring-purple-300 border-purple-200"
                : "border-gray-100"
            }`}
          >
            {/* Vehicle Header */}
            <div className="flex items-start justify-between gap-3 flex-wrap border-b pb-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => handleToggleVehicleSelect(vKey)}
                  className="cursor-pointer shrink-0"
                />

                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
                  <Car size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-base text-gray-900">
                    {v.makeAndModel || "Unknown Vehicle"} ({v.year || "—"})
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs">
                    <span className="font-semibold text-gray-500">
                      {v.type || "Sedan"}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-400 font-mono">
                      Added: {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap ml-9 sm:ml-0">
                {getStatusBadge(
                  v.status ||
                    (v as { approvalStatus?: string }).approvalStatus ||
                    (v as { vehicleStatus?: string }).vehicleStatus ||
                    "PENDING_REVIEW"
                )}
                {isSelected && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 ring-1 ring-purple-300">
                    Active Vehicle
                  </span>
                )}
              </div>
            </div>

            {/* Vehicle Spec Grid */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100">
                <span className="text-gray-400 uppercase font-semibold text-[10px]">License Plate</span>
                <p className="font-bold text-gray-900 mt-0.5">{v.licensePlate || v.licensePlateRaw || "N/A"}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100">
                <span className="text-gray-400 uppercase font-semibold text-[10px]">Exterior</span>
                <p className="font-bold text-gray-900 mt-0.5">{v.colorOutside || "N/A"}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100">
                <span className="text-gray-400 uppercase font-semibold text-[10px]">Interior</span>
                <p className="font-bold text-gray-900 mt-0.5">{v.colorInside || "N/A"}</p>
              </div>
            </div>

            {/* Insurance & Registration preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Commercial Insurance */}
              {(() => {
                const rawUrl = v.commercialInsurance?.image;
                const fileUrl = resolveFileUrl(rawUrl);
                const isPdf = isPdfFile(rawUrl);
                return (
                  <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/60 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-gray-900 text-xs">Commercial Insurance</p>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Expires:{" "}
                        {v.commercialInsurance?.expiryDate
                          ? new Date(v.commercialInsurance.expiryDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    {fileUrl && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() =>
                            setPreviewFile({
                              isOpen: true,
                              title: `${v.makeAndModel || "Vehicle"} - Commercial Insurance`,
                              url: fileUrl,
                              isPdf,
                            })
                          }
                          className="px-2.5 py-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Eye size={12} /> Preview
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Vehicle Registration */}
              {(() => {
                const rawUrl = v.vehicleRegistration?.image;
                const fileUrl = resolveFileUrl(rawUrl);
                const isPdf = isPdfFile(rawUrl);
                return (
                  <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/60 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-gray-900 text-xs">Registration Document</p>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Expires:{" "}
                        {v.vehicleRegistration?.expiryDate
                          ? new Date(v.vehicleRegistration.expiryDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    {fileUrl && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() =>
                            setPreviewFile({
                              isOpen: true,
                              title: `${v.makeAndModel || "Vehicle"} - Registration Document`,
                              url: fileUrl,
                              isPdf,
                            })
                          }
                          className="px-2.5 py-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Eye size={12} /> Preview
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Vehicle Photos Gallery */}
            {v.photos && (v.photos.frontView || v.photos.rearView || v.photos.interiorView) && (
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Vehicle Inspection Photos
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {v.photos.frontView && (
                    <button
                      onClick={() =>
                        setPreviewFile({
                          isOpen: true,
                          title: `${v.makeAndModel || "Vehicle"} - Front View`,
                          url: resolveFileUrl(v.photos!.frontView!),
                          isPdf: false,
                        })
                      }
                      className="block relative rounded-lg overflow-hidden border border-gray-200 aspect-[4/3] group bg-zinc-100 cursor-pointer"
                    >
                      <img
                        src={resolveFileUrl(v.photos.frontView)}
                        alt="Front View"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-medium">
                        Front
                      </span>
                    </button>
                  )}
                  {v.photos.rearView && (
                    <button
                      onClick={() =>
                        setPreviewFile({
                          isOpen: true,
                          title: `${v.makeAndModel || "Vehicle"} - Rear View`,
                          url: resolveFileUrl(v.photos!.rearView!),
                          isPdf: false,
                        })
                      }
                      className="block relative rounded-lg overflow-hidden border border-gray-200 aspect-[4/3] group bg-zinc-100 cursor-pointer"
                    >
                      <img
                        src={resolveFileUrl(v.photos.rearView)}
                        alt="Rear View"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-medium">
                        Rear
                      </span>
                    </button>
                  )}
                  {v.photos.interiorView && (
                    <button
                      onClick={() =>
                        setPreviewFile({
                          isOpen: true,
                          title: `${v.makeAndModel || "Vehicle"} - Interior View`,
                          url: resolveFileUrl(v.photos!.interiorView!),
                          isPdf: false,
                        })
                      }
                      className="block relative rounded-lg overflow-hidden border border-gray-200 aspect-[4/3] group bg-zinc-100 cursor-pointer"
                    >
                      <img
                        src={resolveFileUrl(v.photos.interiorView)}
                        alt="Interior View"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-medium">
                        Interior
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
