"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MetricStat {
  count?: number;
  total?: number;
  growth?: number | null;
  growthType?: "positive" | "negative" | "no_change" | "new" | "none" | string;
}

export type DriverMetricStat = MetricStat;

export interface DriverStatsData {
  period?: {
    type?: string;
    comparison?: string;
  };
  totalDrivers?: MetricStat;
  totalChauffeurs?: MetricStat;
  approvedDrivers?: MetricStat;
  approvedChauffeurs?: MetricStat;
  suspendedDrivers?: MetricStat;
  suspendedChauffeurs?: MetricStat;
  pendingDrivers?: MetricStat;
  pendingChauffeurs?: MetricStat;
}

// ─── Trend Helper ────────────────────────────────────────────────────────────

export const getTrendConfig = (metric?: MetricStat) => {
  if (!metric) {
    return {
      trend: "0%",
      trendUp: true,
      pillClass: "bg-gray-100 text-gray-600",
      isNew: false,
    };
  }

  const { growth, growthType } = metric;

  if (growthType === "new" || growth === null || growth === undefined) {
    return {
      trend: "NEW",
      trendUp: true,
      pillClass: "bg-emerald-50 text-emerald-600",
      isNew: true,
    };
  }

  if (growthType === "no_change" || growth === 0) {
    return {
      trend: "0%",
      trendUp: true,
      pillClass: "bg-gray-100 text-gray-600",
      isNew: false,
    };
  }

  const isPositive =
    growthType === "decrease" || growthType === "negative"
      ? false
      : growth > 0 || growthType === "positive" || growthType === "increase";
  const absGrowth = Math.abs(growth);

  return {
    trend: `${absGrowth}%`,
    trendUp: isPositive,
    pillClass: isPositive
      ? "bg-emerald-50 text-emerald-600"
      : "bg-rose-50 text-rose-600",
    isNew: false,
  };
};

// ─── Reusable Universal StatCard Component ──────────────────────────────────

export interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  metric?: MetricStat;
  trend?: string;
  trendUp?: boolean;
  showTrend?: boolean;
  icon?: React.ElementType;
  colorClass?: string;
  bgColorClass?: string;
  trendBgClass?: string;
  trendTextClass?: string;
  isLoading?: boolean;
  comparisonText?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  metric,
  trend,
  trendUp,
  showTrend = true,
  icon: Icon,
  colorClass = "text-indigo-600",
  bgColorClass = "bg-indigo-50",
  trendBgClass,
  trendTextClass,
  isLoading = false,
  comparisonText = "VS Last Month",
}: StatCardProps) {
  const metricTrend = getTrendConfig(metric);

  const displayTrend = trend ?? metricTrend.trend;
  const isUp = trendUp !== undefined ? trendUp : metricTrend.trendUp;

  const pillStyle =
    trendBgClass && trendTextClass
      ? `${trendBgClass} ${trendTextClass}`
      : metricTrend.pillClass;

  const comparison = subtitle || comparisonText;

  return (
    <div className="bg-white rounded-[20px] p-6 shadow-xs border border-gray-200/80 transition-all flex flex-col justify-between hover:shadow-sm">
      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] md:text-sm font-medium text-gray-500">
          {title}
        </p>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${bgColorClass} flex items-center justify-center`}>
            <Icon size={18} className={colorClass} strokeWidth={2.5} />
          </div>
        )}
      </div>

      {/* Main Value */}
      <div className="my-3">
        {isLoading ? (
          <Skeleton className="h-9 w-24 rounded-lg" />
        ) : (
          <h2 className="text-3xl lg:text-[34px] font-bold text-gray-900 tracking-tight">
            {typeof value === "number" ? value.toLocaleString() : value}
          </h2>
        )}
      </div>

      {/* Trend Pill + Subtitle / Comparison */}
      <div className="flex items-center gap-2">
        {isLoading ? (
          <Skeleton className="h-6 w-32 rounded-full" />
        ) : (
          <>
            {showTrend && displayTrend && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${pillStyle}`}
              >
                {!metricTrend.isNew && (
                  <span className="text-[9px] leading-none">
                    {isUp ? "▲" : "▼"}
                  </span>
                )}
                <span>{displayTrend}</span>
              </span>
            )}
            {comparison && (
              <span className="text-xs text-gray-400 font-medium">
                {comparison}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
