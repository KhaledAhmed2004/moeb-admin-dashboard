"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Eye,
  Trash2,
  MapPin,
  Calendar,
  Clock,
  Car,
  Plane,
  Building,
  Star,
  MoreHorizontal,
  Users,
  Pencil,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IAdminJob, IUserSummary, JobStatus } from "../types";
import {
  JobStatusBadge,
  RideStatusBadge,
} from "./JobStatusBadge";

export interface JobTableActions {
  onView: (job: IAdminJob) => void;
  onEdit?: (job: IAdminJob) => void;
  onUpdateStatus?: (jobId: string, status: JobStatus) => void;
  onDelete: (jobId: string) => void;
}

export const getJobColumns = (
  actions: JobTableActions,
  page: number = 1,
  limit: number = 10
): ColumnDef<IAdminJob>[] => [
  {
    id: "serial",
    header: () => <div className="text-center text-zinc-500 font-bold text-xs w-8">#</div>,
    cell: ({ row }) => {
      const serialNumber = (page - 1) * limit + row.index + 1;
      return (
        <div className="text-center font-mono text-xs font-semibold text-zinc-400 w-8">
          {serialNumber < 10 ? `0${serialNumber}` : serialNumber}
        </div>
      );
    },
  },
  {
    accessorKey: "route",
    header: "Routes",
    cell: ({ row }) => {
      const job = row.original;

      return (
        <div className="space-y-1.5 min-w-[210px] max-w-[270px]">
          {/* Pickup */}
          <div className="flex items-start gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100 mt-1 shrink-0" />
            <p
              className="text-xs font-semibold text-zinc-900 line-clamp-1 hover:text-indigo-600 cursor-pointer transition-colors"
              title={job.pickup}
              onClick={() => actions.onView(job)}
            >
              {job.pickup}
            </p>
          </div>

          {/* Dropoff */}
          <div className="flex items-start gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500 ring-2 ring-rose-100 mt-1 shrink-0" />
            <p
              className="text-xs text-zinc-600 line-clamp-1"
              title={job.dropoff}
            >
              {job.dropoff}
            </p>
          </div>

          {/* Timing / ASAP & Flight */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-0.5">
            {job.asap ? (
              <span className="inline-flex items-center gap-1 text-amber-800 font-bold bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full text-[10px] shadow-2xs">
                <Clock size={10} className="text-amber-600" /> ASAP
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md text-[10px] font-medium border border-zinc-200/60">
                <Calendar size={10} className="text-zinc-500" />
                {job.date
                  ? new Date(job.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "No date"}
                {job.time ? ` • ${job.time}` : ""}
              </span>
            )}

            {job.flightNumber && (
              <span className="inline-flex items-center gap-1 text-sky-700 bg-sky-50 border border-sky-200/80 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                <Plane size={10} className="text-sky-600" /> {job.flightNumber}
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "vehicleType",
    header: "Vehicle & Type",
    cell: ({ row }) => {
      const job = row.original;
      const isPublic = job.dispatchType === "ALL CHAUFFEURS";
      const isTargeted = job.dispatchType === "TARGETED CHAUFFEURS";
      const isPersonal = job.dispatchType === "PERSONAL NOTE";

      const dispatchLabel = isPublic
        ? "Public Dispatch"
        : isTargeted
        ? "Targeted"
        : isPersonal
        ? "Personal"
        : job.dispatchType || null;

      return (
        <div className="space-y-0.5 min-w-[130px]">
          <p className="font-semibold text-xs text-zinc-900">
            {job.vehicleType}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <span className="font-medium text-zinc-600">{job.jobType}</span>
            {dispatchLabel && (
              <>
                <span className="text-zinc-300">•</span>
                <span
                  className={
                    isPublic
                      ? "text-blue-600 font-medium"
                      : isTargeted
                      ? "text-purple-600 font-medium"
                      : "text-zinc-500 font-medium"
                  }
                >
                  {dispatchLabel}
                </span>
              </>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "createdBy",
    header: "Creator",
    cell: ({ row }) => {
      const job = row.original;
      const creator = (
        typeof job.createdBy === "object" ? job.createdBy : null
      ) as IUserSummary | null;

      if (!creator) {
        return (
          <span className="text-xs text-zinc-400 font-mono">
            {String(job.createdBy)?.slice(-6)}
          </span>
        );
      }

      return (
        <div className="flex items-center gap-2.5 max-w-[190px]">
          <Avatar className="h-8 w-8 shrink-0 border border-zinc-200/80 shadow-2xs">
            <AvatarImage src={creator.profilePicture} />
            <AvatarFallback className="text-[10px] bg-purple-100 text-purple-700 font-bold">
              {creator.name?.charAt(0) || "C"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-zinc-900 truncate">
              {creator.name}
            </p>
            {creator.companyName || creator.company ? (
              <p className="text-[11px] text-zinc-500 font-medium truncate flex items-center gap-1">
                <Building size={10} className="text-zinc-400 shrink-0" />
                <span>{creator.companyName || creator.company}</span>
              </p>
            ) : creator.phone ? (
              <p className="text-[11px] text-zinc-400 font-medium truncate">
                {creator.phone}
              </p>
            ) : null}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "assignedTo",
    header: "Chauffeur",
    cell: ({ row }) => {
      const job = row.original;
      const driver = (
        typeof job.assignedTo === "object" ? job.assignedTo : null
      ) as IUserSummary | null;

      if (!driver) {
        if (job.applicantCount && job.applicantCount > 0) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              {job.applicantCount} Applicant{job.applicantCount > 1 ? "s" : ""}
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100/90 text-zinc-500 border border-dashed border-zinc-300">
            <Clock size={10} className="text-zinc-400" />
            Unassigned
          </span>
        );
      }

      const driverBadges: string[] =
        Array.isArray(driver.badges) && driver.badges.length > 0
          ? driver.badges
          : driver.badge
          ? [driver.badge]
          : [];

      return (
        <div className="flex items-center gap-2.5 max-w-[200px]">
          <Avatar className="h-8 w-8 shrink-0 border border-zinc-200/80 shadow-2xs">
            <AvatarImage src={driver.profilePicture} />
            <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700 font-bold">
              {driver.name?.charAt(0) || "D"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1">
              <p className="text-xs font-semibold text-zinc-900 truncate">
                {driver.name}
              </p>
              {driver.averageRating ? (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 shrink-0">
                  <Star size={9} className="fill-amber-500 text-amber-500" />
                  {driver.averageRating}
                </span>
              ) : null}
              {driverBadges.map((badgeName) => (
                <span
                  key={badgeName}
                  className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold ${
                    badgeName.includes("Elite")
                      ? "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300"
                      : "bg-amber-100 text-amber-800 ring-1 ring-amber-300"
                  }`}
                  title={badgeName}
                >
                  {badgeName.includes("Elite") ? "Elite" : "Partner"}
                </span>
              ))}
            </div>
            {driver.phone && (
              <p className="text-[11px] text-zinc-400 font-medium truncate">
                {driver.phone}
              </p>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "paymentAmount",
    header: "Fare",
    cell: ({ row }) => {
      const job = row.original;
      return (
        <span className="font-extrabold text-sm text-zinc-900 tracking-tight">
          ${Number(job.paymentAmount || 0).toLocaleString()}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const job = row.original;
      return (
        <div className="space-y-1.5">
          <div>
            <JobStatusBadge status={job.status} />
          </div>
          {job.rideStatus && (
            <div>
              <RideStatusBadge rideStatus={job.rideStatus} />
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const job = row.original;
      return (
        <div className="flex items-center justify-center gap-1">
          {/* Quick View Button */}
          <button
            onClick={() => actions.onView(job)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye size={15} />
          </button>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                title="Actions"
              >
                <MoreHorizontal size={15} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 text-xs">
              <DropdownMenuItem
                onClick={() => (actions.onEdit ? actions.onEdit(job) : actions.onView(job))}
                className="cursor-pointer text-zinc-700 focus:text-zinc-900"
              >
                <Pencil size={13} className="mr-2 text-zinc-500" /> Edit Job
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => actions.onDelete(job._id)}
                className="cursor-pointer text-rose-600 focus:text-rose-700"
              >
                <Trash2 size={13} className="mr-2 text-rose-500" /> Delete Job
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
