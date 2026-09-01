import React from "react";
import { MapPin, Shield, AlertTriangle } from "lucide-react";
import { ApplicationServiceArea, ApplicationUserDetails } from "../../types";

interface ChauffeurServiceAreaTabProps {
  serviceArea?: ApplicationServiceArea;
  user?: ApplicationUserDetails;
  accountState: string;
  appState: string;
  getStatusBadge: (st: string) => React.ReactNode;
}

export function ChauffeurServiceAreaTab({
  serviceArea,
  user,
  accountState,
  appState,
  getStatusBadge,
}: ChauffeurServiceAreaTabProps) {
  return (
    <div className="space-y-4">
      {/* Service Area Card */}
      <div className="p-5 rounded-2xl border border-gray-100 bg-white shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <MapPin size={18} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Operating Service Area</h4>
              <p className="text-xs text-gray-400 font-mono">
                Area ID: {serviceArea?._id || user?.serviceAreaId || "N/A"}
              </p>
            </div>
          </div>
          <div>{getStatusBadge(serviceArea?.status || "ACTIVE")}</div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-zinc-50">
            <span className="text-gray-400 font-semibold uppercase text-[10px]">Territory Name</span>
            <p className="font-bold text-gray-900 text-sm mt-0.5">
              {serviceArea?.areaName || "New York Metropolitan"}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-zinc-50">
            <span className="text-gray-400 font-semibold uppercase text-[10px]">Territory Status</span>
            <p className="font-bold text-emerald-700 text-sm mt-0.5">
              {serviceArea?.status || "ACTIVE"}
            </p>
          </div>
        </div>

        {serviceArea?.cities && serviceArea.cities.length > 0 && (
          <div className="pt-2">
            <span className="text-gray-400 font-semibold uppercase text-[10px] block mb-1.5">
              Covered Service Cities
            </span>
            <div className="flex flex-wrap gap-1.5">
              {serviceArea.cities.map((city, cIdx) => (
                <span
                  key={cIdx}
                  className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/70"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Security & Verification Details */}
      <div className="p-5 rounded-2xl border border-gray-100 bg-white shadow-xs space-y-3">
        <div className="flex items-center gap-2.5 border-b pb-3">
          <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
            <Shield size={18} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-900">Security & Account Integrity</h4>
            <p className="text-xs text-gray-400">Lockout, verification, payment methods, and audit logs</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-zinc-50">
            <span className="text-gray-400 font-semibold uppercase text-[10px]">Account State</span>
            <p className="font-bold text-gray-900 mt-0.5">{accountState}</p>
          </div>
          <div className="p-3 rounded-lg bg-zinc-50">
            <span className="text-gray-400 font-semibold uppercase text-[10px]">App State</span>
            <p className="font-bold text-amber-700 mt-0.5">{appState}</p>
          </div>
          <div className="p-3 rounded-lg bg-zinc-50">
            <span className="text-gray-400 font-semibold uppercase text-[10px]">Card Payment</span>
            <p className="font-bold text-gray-900 mt-0.5">
              {user?.paymentMethods?.cardPayment?.status || "NOT_ACCEPTED"}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-zinc-50">
            <span className="text-gray-400 font-semibold uppercase text-[10px]">Login Attempts</span>
            <p className="font-bold text-gray-900 mt-0.5">{user?.loginAttempts ?? 0}</p>
          </div>
        </div>

        {user?.suspensionOrigin && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs">
            <AlertTriangle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Suspension Origin</p>
              <p className="mt-0.5">{user.suspensionOrigin}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
