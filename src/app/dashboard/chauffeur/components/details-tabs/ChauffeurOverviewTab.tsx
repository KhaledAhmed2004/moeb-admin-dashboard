import React from "react";
import { ApplicationUserDetails, ApplicationServiceArea } from "../../types";
import { Chauffeur } from "../../columns";

interface ChauffeurOverviewTabProps {
  user?: ApplicationUserDetails;
  serviceArea?: ApplicationServiceArea;
  fallbackData?: Chauffeur;
  companyName: string;
  companyRole: string;
  languages: string;
  avgRating: number;
  totalReviews: number;
  createdAt?: string;
  updatedAt?: string;
}

export function ChauffeurOverviewTab({
  user,
  serviceArea,
  fallbackData,
  companyName,
  companyRole,
  languages,
  avgRating,
  totalReviews,
  createdAt,
  updatedAt,
}: ChauffeurOverviewTabProps) {
  return (
    <div className="space-y-4">
      {/* Credentials Grid */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
          Professional & Identity Credentials
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-xs">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Company
            </span>
            <p className="text-sm font-semibold text-gray-900">{companyName}</p>
          </div>

          <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-xs">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Company Role
            </span>
            <p className="text-sm font-semibold text-gray-900">{companyRole || "Chauffeur"}</p>
          </div>

          <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-xs">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Languages
            </span>
            <p className="text-sm font-semibold text-gray-900 truncate" title={languages}>
              {languages}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-xs">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Primary Vehicle
            </span>
            <p className="text-xs font-mono font-semibold text-gray-800 truncate" title={user?.selectedVehicle}>
              {user?.selectedVehicle ? `#${user.selectedVehicle.slice(-8).toUpperCase()}` : "None Assigned"}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-xs">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Service Area
            </span>
            <p className="text-sm font-semibold text-gray-900">
              {serviceArea?.areaName || "Unassigned"}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-xs">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Rating & Reviews
            </span>
            <p className="text-sm font-semibold text-gray-900">
              {avgRating.toFixed(1)} ★{" "}
              <span className="text-xs text-gray-400 font-normal">({totalReviews} reviews)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Operational Performance Stats */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
          Operational Performance & Earnings
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-xs">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Jobs Dispatched
            </span>
            <p className="text-base font-bold text-gray-900">
              {fallbackData?.stats?.totalJobsCreated ?? 0}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-xs">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Completed Rides
            </span>
            <p className="text-base font-bold text-emerald-700">
              {fallbackData?.stats?.totalJobsCompleted ?? fallbackData?.trips ?? 0}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-xs">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Total Earnings
            </span>
            <p className="text-base font-bold text-indigo-700">
              ${(fallbackData?.stats?.earnings ?? 0).toLocaleString()}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-xs">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Payout Balance
            </span>
            <p className="text-base font-bold text-gray-900">
              ${(fallbackData?.stats?.payout ?? 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
          Timestamps & Record Lifecycle
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-xs">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Created At
            </span>
            <p className="text-sm font-medium text-gray-800">
              {createdAt
                ? new Date(createdAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "—"}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-xs">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Last Profile Update
            </span>
            <p className="text-sm font-medium text-gray-800">
              {updatedAt
                ? new Date(updatedAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
