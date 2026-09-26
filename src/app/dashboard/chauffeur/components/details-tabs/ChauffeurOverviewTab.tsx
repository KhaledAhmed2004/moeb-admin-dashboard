import React from "react";
import {
  Shield,
  AlertTriangle,
  CreditCard,
  Smartphone,
  Globe,
  Car,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  DollarSign,
  Wallet,
  Activity,
  Layers,
} from "lucide-react";
import { ApplicationUserDetails, ApplicationServiceArea, ApplicationVehicle } from "../../types";
import { Chauffeur } from "../../columns";

interface ChauffeurOverviewTabProps {
  user?: ApplicationUserDetails;
  serviceArea?: ApplicationServiceArea | string;
  fallbackData?: Chauffeur;
  companyName: string;
  companyRole: string;
  languages: string;
  avgRating: number;
  totalReviews: number;
  createdAt?: string;
  updatedAt?: string;
  vehicles?: ApplicationVehicle[];
  appState?: string;
  getStatusBadge: (st: string) => React.ReactNode;
  subscription?: unknown;
}

export function ChauffeurOverviewTab({
  user,
  fallbackData,
  languages,
  createdAt,
  updatedAt,
  vehicles = [],
  appState = "PENDING",
  subscription,
}: ChauffeurOverviewTabProps) {
  // Subscription info resolution
  const rawSub =
    subscription ||
    (user as unknown as { subscription?: unknown })?.subscription ||
    fallbackData?.subscription;

  const subObj =
    typeof rawSub === "object" && rawSub !== null
      ? (rawSub as {
          status?: string;
          plan?: string;
          type?: string;
          expiresAt?: string | null;
          metadata?: { isComplimentary?: boolean; durationDays?: number | string };
        })
      : undefined;

  const subPlanName =
    subObj?.plan ||
    (subObj?.metadata?.isComplimentary ? "Complimentary Pass" : "Standard Tier");

  const subExpiryText = subObj?.expiresAt
    ? new Date(subObj.expiresAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : subObj?.metadata?.isComplimentary
    ? "Active Complimentary"
    : "Lifetime / Ongoing";

  // Primary vehicle resolution
  const primaryVehicle =
    vehicles.find(
      (v) =>
        v._id === user?.selectedVehicle ||
        (v as unknown as { id?: string }).id === user?.selectedVehicle
    ) || vehicles[0];

  const vehicleSummary = primaryVehicle
    ? `${primaryVehicle.makeAndModel || "Vehicle"}${
        primaryVehicle.year ? ` (${primaryVehicle.year})` : ""
      }${primaryVehicle.licensePlate ? ` • ${primaryVehicle.licensePlate}` : ""}`
    : vehicles.length > 0
    ? `${vehicles.length} Vehicles Registered`
    : "None registered";

  // Payment methods resolution
  const pm = user?.paymentMethods;
  const zelleEmail = pm?.zelle?.email;
  const venmoUser = pm?.venmo?.username;
  const cashAppTag = pm?.cashApp?.cashtag;
  const isCardAccepted =
    pm?.cardPayment?.status === "ACCEPTED" || pm?.cardPayment?.status === "VERIFIED";

  // Performance stats
  const totalJobs = fallbackData?.stats?.totalJobsCreated ?? 0;
  const completedRides =
    fallbackData?.stats?.totalJobsCompleted ?? fallbackData?.trips ?? 0;
  const earnings = fallbackData?.stats?.earnings ?? 0;
  const payout = fallbackData?.stats?.payout ?? 0;

  return (
    <div className="space-y-6">
      {/* SECTION 1: Membership & Platform Credentials (No redundant header data) */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
          <Layers size={14} className="text-gray-400" />
          Membership & Platform Profile
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Subscription Plan */}
          <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-2xs">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Subscription Plan
            </span>
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-purple-600 shrink-0" />
              <p className="text-sm font-bold text-gray-900 truncate">{subPlanName}</p>
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">
              {subExpiryText}
            </span>
          </div>

          {/* Onboarding State */}
          <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-2xs">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Onboarding Status
            </span>
            <div className="flex items-center gap-1.5">
              {user?.isOnboard ? (
                <>
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <p className="text-sm font-bold text-emerald-700">Completed</p>
                </>
              ) : (
                <>
                  <Clock size={14} className="text-amber-500 shrink-0" />
                  <p className="text-sm font-bold text-amber-700">Pending Review</p>
                </>
              )}
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">
              {user?.isOnboard ? "Full platform access" : "Awaiting verification"}
            </span>
          </div>

          {/* Primary Assigned Vehicle */}
          <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-2xs">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Primary Vehicle
            </span>
            <div className="flex items-center gap-1.5">
              <Car size={14} className="text-blue-600 shrink-0" />
              <p className="text-sm font-semibold text-gray-900 truncate">
                {vehicleSummary}
              </p>
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">
              {vehicles.length} vehicle{vehicles.length === 1 ? "" : "s"} in fleet
            </span>
          </div>

          {/* Languages Spoken */}
          <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-2xs">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Languages Spoken
            </span>
            <div className="flex items-center gap-1.5">
              <Globe size={14} className="text-teal-600 shrink-0" />
              <p className="text-sm font-semibold text-gray-900 truncate">
                {languages || "English"}
              </p>
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">
              Communication support
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: Payment & Payout Accounts */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
          <Wallet size={14} className="text-gray-400" />
          Payment & Payout Configuration
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Zelle */}
          <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-2xs flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider block mb-1">
                Zelle
              </span>
              <p className="text-sm font-medium text-gray-900 truncate">
                {zelleEmail || <span className="text-gray-400">Not configured</span>}
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  zelleEmail ? "bg-emerald-500" : "bg-gray-300"
                }`}
              />
              <span className="text-[11px] text-gray-500">
                {zelleEmail ? "Connected" : "Unlinked"}
              </span>
            </div>
          </div>

          {/* Venmo */}
          <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-2xs flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-sky-600 uppercase tracking-wider block mb-1">
                Venmo
              </span>
              <p className="text-sm font-medium text-gray-900 truncate">
                {venmoUser ? `@${venmoUser}` : <span className="text-gray-400">Not configured</span>}
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  venmoUser ? "bg-emerald-500" : "bg-gray-300"
                }`}
              />
              <span className="text-[11px] text-gray-500">
                {venmoUser ? "Connected" : "Unlinked"}
              </span>
            </div>
          </div>

          {/* Cash App */}
          <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-2xs flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block mb-1">
                Cash App
              </span>
              <p className="text-sm font-medium text-gray-900 truncate">
                {cashAppTag ? `$${cashAppTag}` : <span className="text-gray-400">Not configured</span>}
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  cashAppTag ? "bg-emerald-500" : "bg-gray-300"
                }`}
              />
              <span className="text-[11px] text-gray-500">
                {cashAppTag ? "Connected" : "Unlinked"}
              </span>
            </div>
          </div>

          {/* Card Processing Terminal */}
          <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-2xs flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block mb-1">
                Card Processing
              </span>
              <div className="flex items-center gap-1.5">
                <CreditCard size={14} className="text-blue-600" />
                <p className="text-sm font-medium text-gray-900">
                  {isCardAccepted ? "Supported" : "Not Configured"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isCardAccepted ? "bg-emerald-500" : "bg-amber-400"
                }`}
              />
              <span className="text-[11px] text-gray-500">
                {isCardAccepted ? "Ready for in-person" : "Standard dispatch only"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Operational Performance & Earnings */}
      {appState !== "PENDING" && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
            <Activity size={14} className="text-gray-400" />
            Operational Performance & Earnings
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-2xs">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                Jobs Dispatched
              </span>
              <p className="text-lg font-bold text-gray-900">{totalJobs}</p>
              <span className="text-[11px] text-gray-400">Total assigned trips</span>
            </div>

            <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-2xs">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                Completed Rides
              </span>
              <p className="text-lg font-bold text-emerald-700">{completedRides}</p>
              <span className="text-[11px] text-gray-400">Successfully fulfilled</span>
            </div>

            <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-2xs">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                Total Earnings
              </span>
              <p className="text-lg font-bold text-indigo-700">
                ${earnings.toLocaleString()}
              </p>
              <span className="text-[11px] text-gray-400">Gross revenue</span>
            </div>

            <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-2xs">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                Payout Balance
              </span>
              <p className="text-lg font-bold text-gray-900">
                ${payout.toLocaleString()}
              </p>
              <span className="text-[11px] text-gray-400">Pending settlement</span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: Account Security & System Audit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Security Overview */}
        <div className="p-5 rounded-2xl border border-gray-100 bg-white shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Shield size={18} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Account Security</h4>
              <p className="text-xs text-gray-400">Login and account protection status</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-gray-100">
              <span className="text-gray-600 font-medium">Login Activity</span>
              <div className="flex items-center gap-1.5">
                {(user?.loginAttempts ?? 0) > 0 ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="font-semibold text-rose-700">
                      {user?.loginAttempts} failed attempts
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-emerald-700">
                      No suspicious activity
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-gray-100">
              <span className="text-gray-600 font-medium">Device Push Tokens</span>
              <div className="flex items-center gap-1.5">
                <Smartphone size={13} className="text-gray-400" />
                <span className="font-semibold text-gray-800">
                  {user?.deviceTokens?.length ?? 0} active device(s)
                </span>
              </div>
            </div>

            {user?.suspensionOrigin && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs">
                <AlertTriangle size={15} className="text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Suspension Trigger</p>
                  <p className="mt-0.5 text-rose-700">{user.suspensionOrigin}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Audit & Lifecycle */}
        <div className="p-5 rounded-2xl border border-gray-100 bg-white shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Clock size={18} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Record Lifecycle & Audit</h4>
              <p className="text-xs text-gray-400">Database synchronization history</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-gray-100">
              <span className="text-gray-600 font-medium">Account Created</span>
              <span className="font-semibold text-gray-800">
                {createdAt
                  ? new Date(createdAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "—"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-gray-100">
              <span className="text-gray-600 font-medium">Last Profile Update</span>
              <span className="font-semibold text-gray-800">
                {updatedAt
                  ? new Date(updatedAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
