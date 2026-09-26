"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  MapPin,
  Calendar,
  Clock,
  Car,
  DollarSign,
  User,
  Phone,
  Mail,
  Building,
  Plane,
  FileText,
  Star,
  Copy,
  Check,
  CheckCircle2,
  Trash2,
  Navigation,
  ShieldCheck,
  AlertCircle,
  Radio,
  X,
  CreditCard,
  Banknote,
} from "lucide-react";
import {
  useAdminJobDetail,
  useCancelJob,
  useDeleteJob,
  useUpdateJobStatus,
} from "../hooks/useAdminJobs";
import { IAdminJob, IUserSummary, JobStatus } from "../types";
import {
  DispatchTypeBadge,
  JobStatusBadge,
  PaymentStatusBadge,
  RideStatusBadge,
} from "./JobStatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JobDetailModalProps {
  jobId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: IAdminJob | null;
}

export function JobDetailModal({
  jobId,
  isOpen,
  onOpenChange,
  initialData,
}: JobDetailModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const { data: fetchedJob, isLoading } = useAdminJobDetail(
    isOpen ? jobId : null
  );
  const updateStatusMutation = useUpdateJobStatus();
  const cancelJobMutation = useCancelJob();
  const deleteJobMutation = useDeleteJob();

  const job = (fetchedJob ?? initialData) as IAdminJob | undefined;

  const handleCopy = (text: string | null | undefined, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleStatusChange = (newStatus: JobStatus) => {
    if (!job) return;
    updateStatusMutation.mutate({ jobId: job._id, status: newStatus });
  };

  const handleConfirmCancel = () => {
    if (!job) return;
    cancelJobMutation.mutate(job._id, {
      onSuccess: () => setIsCancelAlertOpen(false),
    });
  };

  const handleConfirmDelete = () => {
    if (!job) return;
    deleteJobMutation.mutate(job._id, {
      onSuccess: () => {
        setIsDeleteAlertOpen(false);
        onOpenChange(false);
      },
    });
  };

  const creator = (
    job && typeof job.createdBy === "object" ? job.createdBy : null
  ) as IUserSummary | null;

  const driver = (
    job && typeof job.assignedTo === "object" ? job.assignedTo : null
  ) as IUserSummary | null;

  const applicantDriver = (
    job?.applicant && typeof job.applicant.driver === "object"
      ? job.applicant.driver
      : null
  ) as IUserSummary | null;


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-4xl max-h-[92vh] overflow-y-auto p-0 gap-0 rounded-2xl border-zinc-200/90 shadow-2xl bg-white"
      >
        {/* Header section - Modern Executive Look */}
        <div className="p-6 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white rounded-t-2xl relative border-b border-zinc-800">
          <DialogHeader className="space-y-3">
            {/* Header Top Row: Route Title & Status / Close */}
            <div className="flex items-start sm:items-center justify-between gap-4">
              <DialogTitle className="text-lg sm:text-xl font-bold text-white text-left tracking-tight flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span className="flex items-center gap-2 truncate max-w-xs sm:max-w-sm">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shrink-0 ring-4 ring-emerald-400/20" />
                    <span className="truncate">{job?.pickup || "Pickup Location"}</span>
                  </span>
                  <span className="hidden sm:inline text-zinc-500 font-normal">➔</span>
                  <span className="flex items-center gap-2 truncate max-w-xs sm:max-w-sm">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400 shrink-0 ring-4 ring-rose-400/20" />
                    <span className="truncate">{job?.dropoff || "Dropoff Destination"}</span>
                  </span>
                </div>
              </DialogTitle>

              {/* Status Badges & Close Button */}
              <div className="flex items-center gap-2.5 shrink-0 pt-0.5 sm:pt-0">
                {job && (
                  <div className="flex items-center gap-2">
                    <JobStatusBadge status={job.status} />
                    {job.rideStatus && (
                      <RideStatusBadge rideStatus={job.rideStatus} />
                    )}
                  </div>
                )}
                <button
                  onClick={() => onOpenChange(false)}
                  className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer ml-1"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Quick Meta Badges */}
            <DialogDescription className="text-zinc-300 text-left text-xs pt-1 flex flex-wrap items-center gap-2.5">
              {job?.asap ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Clock size={12} className="text-amber-400 animate-pulse" />
                  ASAP Ride (Immediate Dispatch)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-200 border border-zinc-700">
                  <Calendar size={12} className="text-zinc-400" />
                  {job?.date
                    ? new Date(job.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "No date"}{" "}
                  at {job?.time || "N/A"}
                </span>
              )}

              {job?.flightNumber && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  <Plane size={12} className="text-sky-400" />
                  Flight #{job.flightNumber}
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Car size={12} className="text-indigo-400" />
                {job?.vehicleType} • {job?.jobType}
              </span>

              {job && <DispatchTypeBadge type={job.dispatchType} />}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 bg-zinc-50/60">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full rounded-xl" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
              </div>
            </div>
          ) : !job ? (
            <div className="py-16 text-center text-zinc-500 space-y-2">
              <AlertCircle className="w-10 h-10 text-zinc-300 mx-auto" />
              <p className="text-sm font-medium">Job details could not be found.</p>
            </div>
          ) : (
            <>
              {/* Trip Overview Cards (4 Clean Stat Metrics) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* 1. Fare & Payment */}
                <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Fare Amount
                    </p>
                    <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                      <DollarSign size={14} />
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xl font-bold text-zinc-900 tracking-tight">
                      ${job.paymentAmount}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          (job.paymentStatus || "").toUpperCase() === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {job.paymentStatus || "UNPAID"}
                      </span>
                      <span className="text-[11px] text-zinc-500 truncate">
                        {job.paymentType?.toLowerCase().includes("credit")
                          ? "Card on file"
                          : "Collect cash"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Vehicle Class & Type */}
                <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Vehicle & Class
                    </p>
                    <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                      <Car size={14} />
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-base font-bold text-zinc-900 truncate">
                      {job.vehicleType}
                    </p>
                    <p className="text-[11px] text-zinc-500 font-medium mt-0.5 capitalize">
                      {job.jobType ? job.jobType.toLowerCase() : "One way"}
                    </p>
                  </div>
                </div>

                {/* 3. Schedule Timing */}
                <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Schedule Timing
                    </p>
                    <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                      <Clock size={14} />
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-base font-bold text-zinc-900 truncate">
                      {job.asap ? "⚡ ASAP" : job.time || "Scheduled"}
                    </p>
                    <p className="text-[11px] text-zinc-500 font-medium mt-0.5 truncate">
                      {job.asap
                        ? "Immediate dispatch"
                        : job.date
                        ? new Date(job.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "Flexible timing"}
                    </p>
                  </div>
                </div>

                {/* 4. Territory & Dispatch */}
                <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Service Area
                    </p>
                    <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                      <MapPin size={14} />
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-bold text-zinc-900 truncate" title={job.serviceArea || "Global / City"}>
                      {job.serviceArea || "Global / City"}
                    </p>
                    <p className="text-[11px] text-zinc-500 font-medium mt-0.5 truncate">
                      {job.companyName || "STA Dispatch"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Route & Passenger Information Card */}
              <div className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                    <Navigation size={14} className="text-indigo-600" />
                    Trip Itinerary & Navigation
                  </h4>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    Direct Point-to-Point Route
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Visual Route Timeline (7 Cols) */}
                  <div className="lg:col-span-7 space-y-1 relative pl-1">
                    {/* Pickup Node */}
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center mt-1">
                        <span className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center ring-4 ring-emerald-100 shrink-0">
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        </span>
                        <div className="w-0.5 h-12 bg-gradient-to-b from-emerald-500 via-zinc-300 to-rose-500 my-1" />
                      </div>
                      <div className="flex-1 min-w-0 pb-2">
                        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                          PICKUP LOCATION
                        </p>
                        <p className="font-semibold text-zinc-900 text-sm mt-0.5 leading-snug break-words">
                          {job.pickup}
                        </p>
                      </div>
                    </div>

                    {/* Dropoff Node */}
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <span className="h-4 w-4 rounded-full bg-rose-500 flex items-center justify-center ring-4 ring-rose-100 shrink-0">
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                          DROPOFF DESTINATION
                        </p>
                        <p className="font-semibold text-zinc-900 text-sm mt-0.5 leading-snug break-words">
                          {job.dropoff}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Passenger & Instructions Box (5 Cols) */}
                  <div className="lg:col-span-5 bg-zinc-50/80 p-4 rounded-xl border border-zinc-200/70 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-200/60 pb-2">
                      <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                        <User size={13} className="text-zinc-500" />
                        Passenger Information
                      </span>
                      <Badge variant="outline" className="text-[10px] bg-white text-zinc-600 font-medium">
                        Rider
                      </Badge>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Name:</span>
                        <span className="font-semibold text-zinc-900">
                          {job.passengerName || "Same as Client"}
                        </span>
                      </div>

                      {job.passengerPhone ? (
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Phone:</span>
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${job.passengerPhone}`}
                              className="font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                            >
                              <Phone size={11} />
                              {job.passengerPhone}
                            </a>
                            <button
                              onClick={() => handleCopy(job.passengerPhone, "Passenger phone")}
                              className="p-1 rounded hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 transition"
                              title="Copy phone"
                            >
                              <Copy size={11} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Phone:</span>
                          <span className="text-zinc-400 italic">Not provided</span>
                        </div>
                      )}
                    </div>

                    {/* Special Instructions Note */}
                    {job.instruction ? (
                      <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/70 text-xs space-y-1">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                          <FileText size={11} /> Special Instructions
                        </div>
                        <p className="text-amber-900 italic text-[11px] leading-relaxed">
                          &ldquo;{job.instruction}&rdquo;
                        </p>
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg bg-white/70 border border-zinc-200/50 text-center">
                        <span className="text-[11px] text-zinc-400">
                          No special notes from client
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Creator & Assigned Chauffeur (2 Balanced Cards) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Client / Creator Card */}
                <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                    <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Building size={14} className="text-purple-600" />
                      Job Creator / Client
                    </h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                      Client
                    </span>
                  </div>

                  {creator ? (
                    <div className="flex items-start gap-3.5">
                      <Avatar className="h-11 w-11 border border-zinc-200 shrink-0">
                        <AvatarImage src={creator.profilePicture} />
                        <AvatarFallback className="bg-purple-100 text-purple-700 text-sm font-bold">
                          {creator.name?.charAt(0) || "C"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1.5 text-xs flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-zinc-900 text-sm truncate">
                            {creator.name}
                          </p>
                          {(creator.companyName || creator.company) && (
                            <Badge variant="outline" className="text-[10px] bg-zinc-50 text-zinc-700 shrink-0">
                              {creator.companyName || creator.company}
                            </Badge>
                          )}
                        </div>

                        {creator.email && (
                          <a
                            href={`mailto:${creator.email}`}
                            className="text-zinc-500 hover:text-zinc-900 text-[11px] flex items-center gap-1.5 truncate"
                          >
                            <Mail size={12} className="text-zinc-400 shrink-0" />
                            <span className="truncate">{creator.email}</span>
                          </a>
                        )}

                        {creator.phone && (
                          <div className="flex items-center justify-between gap-1 text-zinc-500 text-[11px]">
                            <a
                              href={`tel:${creator.phone}`}
                              className="hover:text-zinc-900 flex items-center gap-1.5 truncate"
                            >
                              <Phone size={12} className="text-zinc-400 shrink-0" />
                              <span>{creator.phone}</span>
                            </a>
                            <button
                              onClick={() => handleCopy(creator.phone, "Client phone")}
                              className="text-zinc-400 hover:text-zinc-700 p-0.5 rounded"
                              title="Copy phone"
                            >
                              <Copy size={11} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 italic">
                      Client ID: {String(job.createdBy)}
                    </p>
                  )}
                </div>

                {/* 2. Assigned Chauffeur Card */}
                <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                    <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Car size={14} className="text-blue-600" />
                      Assigned Chauffeur
                    </h4>
                    {driver ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                        Confirmed Driver
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">
                        Dispatch Open
                      </span>
                    )}
                  </div>

                  {driver ? (
                    <div className="flex items-start gap-3.5">
                      <Avatar className="h-11 w-11 border border-zinc-200 shrink-0">
                        <AvatarImage src={driver.profilePicture} />
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-bold">
                          {driver.name?.charAt(0) || "D"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1.5 text-xs flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-zinc-900 text-sm truncate">
                            {driver.name}
                          </p>
                          {driver.averageRating ? (
                            <span className="flex items-center gap-1 text-amber-700 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80 shrink-0">
                              <Star size={11} className="fill-amber-500 text-amber-500" />
                              {driver.averageRating}
                            </span>
                          ) : null}
                        </div>

                        {driver.email && (
                          <a
                            href={`mailto:${driver.email}`}
                            className="text-zinc-500 hover:text-zinc-900 text-[11px] flex items-center gap-1.5 truncate"
                          >
                            <Mail size={12} className="text-zinc-400 shrink-0" />
                            <span className="truncate">{driver.email}</span>
                          </a>
                        )}

                        {driver.phone && (
                          <div className="flex items-center justify-between gap-1 text-zinc-500 text-[11px]">
                            <a
                              href={`tel:${driver.phone}`}
                              className="hover:text-zinc-900 flex items-center gap-1.5 truncate"
                            >
                              <Phone size={12} className="text-zinc-400 shrink-0" />
                              <span>{driver.phone}</span>
                            </a>
                            <button
                              onClick={() => handleCopy(driver.phone, "Driver phone")}
                              className="text-zinc-400 hover:text-zinc-700 p-0.5 rounded"
                              title="Copy phone"
                            >
                              <Copy size={11} />
                            </button>
                          </div>
                        )}

                        {job.rideStatus && (
                          <div className="pt-1">
                            <RideStatusBadge rideStatus={job.rideStatus} />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : applicantDriver ? (
                    <div className="bg-amber-50/80 p-3 rounded-lg border border-amber-200/80 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-amber-900">
                          Pending Applicant: {applicantDriver.name}
                        </p>
                        <Badge className="bg-amber-200 text-amber-900 text-[10px]">
                          Pending Approval
                        </Badge>
                      </div>
                      <p className="text-amber-700 text-[11px]">
                        Waiting for job creator approval to confirm assignment.
                      </p>
                    </div>
                  ) : (
                    /* Beautiful Empty State for Unassigned Chauffeur */
                    <div className="p-3.5 rounded-lg bg-zinc-50 border border-dashed border-zinc-200 text-center space-y-1.5">
                      <div className="flex items-center justify-center gap-1.5 text-zinc-600 font-semibold text-xs">
                        <Radio size={14} className="text-amber-500 animate-pulse" />
                        <span>Awaiting Chauffeur Acceptance</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                        This ride is broadcasted and open for applications from eligible chauffeurs in{" "}
                        <span className="font-medium text-zinc-700">
                          {job.serviceArea || "the service area"}
                        </span>
                        .
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews & Ratings Section (if available) */}
              {(job.reviewByDriver?.rating || job.reviewByCreator?.rating) && (
                <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                    Trip Ratings & Feedback
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {job.reviewByCreator?.rating && (
                      <div className="bg-zinc-50 p-3.5 rounded-lg border border-zinc-200/70 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-zinc-800">
                            Client Review for Chauffeur
                          </span>
                          <span className="flex items-center gap-1 text-amber-600 font-bold bg-white px-2 py-0.5 rounded border border-amber-200">
                            <Star size={12} className="fill-amber-500 text-amber-500" />
                            {job.reviewByCreator.rating} / 5
                          </span>
                        </div>
                        {job.reviewByCreator.comment && (
                          <p className="text-zinc-600 text-[11px] italic mt-1 bg-white p-2 rounded border border-zinc-100">
                            &ldquo;{job.reviewByCreator.comment}&rdquo;
                          </p>
                        )}
                      </div>
                    )}

                    {job.reviewByDriver?.rating && (
                      <div className="bg-zinc-50 p-3.5 rounded-lg border border-zinc-200/70 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-zinc-800">
                            Chauffeur Review for Client
                          </span>
                          <span className="flex items-center gap-1 text-amber-600 font-bold bg-white px-2 py-0.5 rounded border border-amber-200">
                            <Star size={12} className="fill-amber-500 text-amber-500" />
                            {job.reviewByDriver.rating} / 5
                          </span>
                        </div>
                        {job.reviewByDriver.comment && (
                          <p className="text-zinc-600 text-[11px] italic mt-1 bg-white p-2 rounded border border-zinc-100">
                            &ldquo;{job.reviewByDriver.comment}&rdquo;
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Action Bar (Footer with Clear Visual Distinction) */}
              <div className="bg-white p-4 rounded-xl border border-zinc-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
                {/* Left: Status Selector */}
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-zinc-700">
                    Change Status:
                  </span>
                  <Select
                    value={job.status}
                    onValueChange={(val) => handleStatusChange(val as JobStatus)}
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger className="h-9 w-40 text-xs font-semibold bg-zinc-50 border-zinc-200 focus:bg-white transition cursor-pointer">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING" className="text-xs font-semibold text-amber-800">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-amber-500" />
                          PENDING
                        </span>
                      </SelectItem>
                      <SelectItem value="ASSIGNED" className="text-xs font-semibold text-blue-800">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                          ASSIGNED
                        </span>
                      </SelectItem>
                      <SelectItem value="COMPLETED" className="text-xs font-semibold text-emerald-800">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          COMPLETED
                        </span>
                      </SelectItem>
                      <SelectItem value="CANCELLED" className="text-xs font-semibold text-rose-800">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-rose-500" />
                          CANCELLED
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {updateStatusMutation.isPending && (
                    <span className="text-xs text-zinc-400 animate-pulse">
                      Updating...
                    </span>
                  )}
                </div>

                {/* Right: Action Buttons (Cancel, Delete, Close) */}
                <div className="flex items-center gap-2">
                  {job.status !== "CANCELLED" && job.status !== "COMPLETED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCancelAlertOpen(true)}
                      disabled={cancelJobMutation.isPending}
                      className="h-9 text-xs font-semibold text-amber-700 border-amber-200 hover:bg-amber-50 cursor-pointer transition gap-1.5"
                    >
                      <AlertCircle size={13} />
                      Cancel Job
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDeleteAlertOpen(true)}
                    disabled={deleteJobMutation.isPending}
                    className="h-9 text-xs font-semibold text-rose-700 border-rose-200 hover:bg-rose-50 cursor-pointer transition gap-1.5"
                  >
                    <Trash2 size={13} />
                    Delete Job
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onOpenChange(false)}
                    className="h-9 text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 cursor-pointer transition px-4"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Shadcn Cancel Job Confirmation Dialog */}
        <AlertDialog open={isCancelAlertOpen} onOpenChange={setIsCancelAlertOpen}>
          <AlertDialogContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Cancel Ride Confirmation
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this job? The assigned chauffeur and passenger will be notified that this ride has been cancelled.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={cancelJobMutation.isPending}>
                Keep Job
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                disabled={cancelJobMutation.isPending}
                onClick={(e) => {
                  e.preventDefault();
                  handleConfirmCancel();
                }}
              >
                {cancelJobMutation.isPending ? "Cancelling..." : "Yes, Cancel Job"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Shadcn Delete Job Confirmation Dialog */}
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5 text-red-600" />
                Permanently Delete Job
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete this job? This action cannot be undone and will permanently remove all associated records from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteJobMutation.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                disabled={deleteJobMutation.isPending}
                onClick={(e) => {
                  e.preventDefault();
                  handleConfirmDelete();
                }}
              >
                {deleteJobMutation.isPending ? "Deleting..." : "Permanently Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}

