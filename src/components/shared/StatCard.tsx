"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface MetricStat {
  count?: number;
  total?: number;
  growth?: number | null;
  growthType?: "positive" | "negative" | "increase" | "decrease" | "no_change" | string;
}

export interface StatCardProps {
  title: string;
  value: number;
  metric?: MetricStat;
  isLoading?: boolean;
}

interface TrendConfig {
  text: string;
  isPositive: boolean;
  colorClass: string;
}

const defaultTrend: TrendConfig = {
  text: "0%",
  isPositive: true,
  colorClass: "bg-gray-100 text-gray-600",
};

export const getTrendConfig = (metric?: MetricStat): TrendConfig => {
  if (!metric) return defaultTrend;

  const { growth, growthType } = metric;
  const normalizedType = typeof growthType === "string" ? growthType.toLowerCase() : "";

  if (normalizedType === "no_change" || growth === 0 || growth == null) return defaultTrend;

  const isPositive =
    ["positive", "increase"].includes(normalizedType) ||
    (!["negative", "decrease"].includes(normalizedType) && growth > 0);

  return {
    text: `${Math.abs(growth)}%`,
    isPositive,
    colorClass: isPositive
      ? "bg-emerald-50 text-emerald-600"
      : "bg-rose-50 text-rose-600",
  };
};

// SUB-COMPONENTS
const TrendBadge = ({ text, isPositive, colorClass }: TrendConfig) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}
    >
      <span className="flex items-center">
          {isPositive ? (
            <TrendingUp size={12} strokeWidth={3} />
          ) : (
            <TrendingDown size={12} strokeWidth={3} />
          )}
      </span>
      <span>{text}</span>
    </span>
  );
};

export function StatCard({
  title,
  value,
  metric,
  isLoading = false,
}: StatCardProps) {
  const metricTrend = getTrendConfig(metric);

  const displayValue =
    typeof value === "number" ? value.toLocaleString() : value;

  return (
    <article className="bg-white rounded-[20px] p-6 shadow-xs border border-gray-200/80 transition-all flex flex-col justify-between hover:shadow-sm">
      <header className="flex items-center justify-between">
        <p className="text-[13px] md:text-sm font-medium text-gray-500">
          {title}
        </p>
      </header>

      <div className="my-3">
        {isLoading ? (
          <Skeleton className="h-9 w-24 rounded-lg" />
        ) : (
          <h2 className="text-3xl lg:text-[34px] font-bold text-gray-900 tracking-tight">
            {displayValue}
          </h2>
        )}
      </div>

      <footer className="flex items-center gap-2">
        {isLoading ? (
          <Skeleton className="h-6 w-32 rounded-full" />
        ) : (
          <>
            <TrendBadge {...metricTrend} />
            <span className="text-xs text-gray-400 font-medium">
              VS Last Month
            </span>
          </>
        )}
      </footer>
    </article>
  );
}
