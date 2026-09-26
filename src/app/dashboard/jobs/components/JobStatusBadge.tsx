"use client";

import React from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Car,
  Navigation,
  MapPin,
  UserCheck,
  CreditCard,
  Banknote,
  Users,
  Target,
  FileText,
} from "lucide-react";
import { DispatchType, JobStatus, PaymentStatus, RideStatus } from "../types";

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const norm = (status || "").toUpperCase();

  switch (norm) {
    case "PENDING":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs">
          <Clock size={12} className="text-amber-500" />
          Pending
        </span>
      );
    case "ASSIGNED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200/80 shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
          </span>
          Assigned
        </span>
      );
    case "COMPLETED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
          <CheckCircle2 size={12} className="text-emerald-600" />
          Completed
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200/80 shadow-2xs">
          <XCircle size={12} className="text-rose-500" />
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
          {status}
        </span>
      );
  }
}

export function RideStatusBadge({
  rideStatus,
}: {
  rideStatus?: RideStatus | null;
}) {
  if (!rideStatus) return null;

  const norm = rideStatus.toUpperCase();

  switch (norm) {
    case "ON THE WAY":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
          <Navigation size={10} className="text-indigo-600 animate-pulse" />
          On The Way
        </span>
      );
    case "AT THE LOCATION":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/80 shadow-2xs">
          <MapPin size={10} className="text-purple-600" />
          At Location
        </span>
      );
    case "POB":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200/80 shadow-2xs">
          <UserCheck size={10} className="text-teal-600" />
          Passenger On Board
        </span>
      );
    case "FINISHED":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
          <CheckCircle2 size={10} className="text-emerald-600" />
          Finished
        </span>
      );
    case "PENDING":
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100/90 text-zinc-600 border border-zinc-200/90 shadow-2xs">
          <Car size={10} className="text-zinc-500" />
          Driver Ready
        </span>
      );
  }
}

export function PaymentStatusBadge({
  status,
  type,
}: {
  status?: PaymentStatus;
  type?: string;
}) {
  const isPaid = (status || "").toUpperCase() === "PAID";
  return (
    <div className="flex flex-col items-start gap-1">
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${
          isPaid
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 ring-1 ring-emerald-400/20"
            : "bg-amber-50 text-amber-800 border border-amber-200/90 ring-1 ring-amber-400/20"
        }`}
      >
        {isPaid ? (
          <CheckCircle2 size={10} className="text-emerald-600" />
        ) : (
          <Clock size={10} className="text-amber-600" />
        )}
        {isPaid ? "PAID" : "UNPAID"}
      </span>
      {type && (
        <span className="text-[11px] text-zinc-500 font-medium flex items-center gap-1">
          {type.includes("CREDIT") ? (
            <CreditCard size={11} className="text-zinc-400" />
          ) : (
            <Banknote size={11} className="text-zinc-400" />
          )}
          {type.includes("CREDIT") ? "Card on file" : "Collect"}
        </span>
      )}
    </div>
  );
}

export function DispatchTypeBadge({ type }: { type: DispatchType }) {
  const norm = (type || "").toUpperCase();

  switch (norm) {
    case "ALL CHAUFFEURS":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/70 shadow-2xs">
          <Users size={11} className="text-blue-500" />
          Public Dispatch
        </span>
      );
    case "TARGETED CHAUFFEURS":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200/70 shadow-2xs">
          <Target size={11} className="text-violet-500" />
          Targeted Dispatch
        </span>
      );
    case "PERSONAL NOTE":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200 shadow-2xs">
          <FileText size={11} className="text-zinc-500" />
          Personal Note
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
          {type}
        </span>
      );
  }
}
