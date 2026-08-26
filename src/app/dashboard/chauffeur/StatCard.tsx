"use client";

import { Skeleton } from "@/components/ui/skeleton";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DriverMetricStat {
  count?: number;
  total?: number;
  growth?: number | null;
  growthType?: "positive" | "negative" | "no_change" | "new" | "none" | string;
}

export interface DriverStatsData {
  period?: {
    type?: string;
    comparison?: string;
  };
  totalDrivers?: DriverMetricStat;
  totalChauffeurs?: DriverMetricStat;
  approvedDrivers?: DriverMetricStat;
  approvedChauffeurs?: DriverMetricStat;
  suspendedDrivers?: DriverMetricStat;
  suspendedChauffeurs?: DriverMetricStat;
  pendingDrivers?: DriverMetricStat;
  pendingChauffeurs?: DriverMetricStat;
}

// ─── Trend Helper ────────────────────────────────────────────────────────────

export const getTrendConfig = (metric?: DriverMetricStat) => {
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

  const isPositive = growth > 0 || growthType === "positive";
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

// ─── StatCard Component ──────────────────────────────────────────────────────

export interface StatCardProps {
  title: string;
  value: number | string;
  metric?: DriverMetricStat;
  isLoading?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

export const StatCard = ({
  title,
  value,
  metric,
  isLoading,
  isActive = false,
  onClick,
}: StatCardProps) => {
  const trendConfig = getTrendConfig(metric);

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-[24px] p-6 shadow-sm border transition-all cursor-pointer flex flex-col justify-between ${
        isActive
          ? "border-primary ring-2 ring-primary/20 shadow-md"
          : "border-gray-100/90 hover:border-gray-300"
      }`}
    >
      {/* Top Title */}
      <div>
        <p className="text-sm md:text-[15px] font-medium text-gray-500">
          {title}
        </p>
      </div>

      {/* Middle Big Value */}
      <div className="my-4">
        {isLoading ? (
          <Skeleton className="h-9 w-24 rounded-lg" />
        ) : (
          <h2 className="text-3xl lg:text-[34px] font-bold text-gray-900 tracking-tight">
            {typeof value === "number" ? value.toLocaleString() : value}
          </h2>
        )}
      </div>

      {/* Bottom Trend Pill + Comparison */}
      <div className="flex items-center gap-2">
        {isLoading ? (
          <Skeleton className="h-6 w-32 rounded-full" />
        ) : (
          <>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${trendConfig.pillClass}`}
            >
              {!trendConfig.isNew && (
                <span className="text-[9px] leading-none">
                  {trendConfig.trendUp ? "▲" : "▼"}
                </span>
              )}
              <span>{trendConfig.trend}</span>
            </span>
            <span className="text-xs text-gray-400 font-medium">
              VS Last Month
            </span>
          </>
        )}
      </div>
    </div>
  );
};
