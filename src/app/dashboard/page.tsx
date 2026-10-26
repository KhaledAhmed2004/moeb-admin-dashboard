"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import api from "@/lib/axios";
import { StatCard } from "@/components/shared/StatCard";

export interface AdminDashboardStatMetric {
  total?: number;
  count?: number;
  thisPeriodCount?: number;
  lastPeriodCount?: number;
  growth: number;
  growthType: "increase" | "decrease" | "no_change" | string;
}

export interface AdminDashboardStatsData {
  period?: {
    type?: string;
    comparison?: string;
  };
  users: AdminDashboardStatMetric;
  activeSubscriptions: AdminDashboardStatMetric;
  pendingDrivers: AdminDashboardStatMetric;
  activeJobs: AdminDashboardStatMetric;
  totalItems: AdminDashboardStatMetric;
}

export interface AdminDashboardStatsResponse {
  success: boolean;
  message?: string;
  data: AdminDashboardStatsData;
}

export interface MonthlyTrendDataPoint {
  label: string;
  totalRevenue?: number;
  transactionCount?: number;
}

export interface AdminMonthlyTrendsData {
  jobTrends: MonthlyTrendDataPoint[];
  itemTrends: MonthlyTrendDataPoint[];
}

export interface AdminMonthlyTrendsResponse {
  success: boolean;
  statusCode?: number;
  message?: string;
  data: AdminMonthlyTrendsData;
}

// ─── Chart Configuration ─────────────────────────────────────────────────────

const chartConfig = {
  jobs: {
    label: "Job Completions",
    color: "#8b5cf6",
  },
  items: {
    label: "Marketplace Listings",
    color: "#10b981",
  },
} satisfies ChartConfig;



// ─── Main Page ───────────────────────────────────────────────────────────────

const MainPage = () => {
  // Query platform statistics: GET /api/v1/admin/stats
  const { data: statsResponse, isLoading: isStatsLoading } = useQuery<AdminDashboardStatsResponse>({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      try {
        const response = await api.get("/admin/stats");
        return response.data;
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status === 404) {
          const response = await api.get("/api/v1/admin/stats");
          return response.data;
        }
        throw err;
      }
    },
  });

  // Query recent platform activities: GET /api/v1/admin/recent-activities?limit=5

  // Query monthly time trends: GET /api/v1/admin/monthly-trends?year=...&range=...&metric=...
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [chartPeriod, setChartPeriod] = useState<string>("this-year");
  const [trendMetric, setTrendMetric] = useState<string>("all");

  const {
    data: trendsResponse,
    isLoading: isTrendsLoading,
  } = useQuery<AdminMonthlyTrendsResponse>({
    queryKey: ["admin-monthly-trends", selectedYear, chartPeriod, trendMetric],
    queryFn: async () => {
      const params: Record<string, string | number> = {};
      if (selectedYear) {
        params.year = Number(selectedYear);
      }
      if (chartPeriod && chartPeriod !== "this-year") {
        params.range = chartPeriod === "6-months" || chartPeriod === "6m" ? "6m" : "3m";
      }
      if (trendMetric && trendMetric !== "all") {
        params.metric = trendMetric;
      }

      try {
        const response = await api.get("/admin/monthly-trends", { params });
        return response.data;
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status === 404) {
          const response = await api.get("/api/v1/admin/monthly-trends", { params });
          return response.data;
        }
        throw err;
      }
    },
  });

  const stats = statsResponse?.data;


  const monthlyChartData = useMemo(() => {
    const rawJobTrends = trendsResponse?.data?.jobTrends || [];
    const rawItemTrends = trendsResponse?.data?.itemTrends || [];

    // Determine the list of data points to display from whichever non-empty array returned
    const sourceArray = rawJobTrends.length > 0 ? rawJobTrends : rawItemTrends;

    if (sourceArray.length > 0) {
      return sourceArray.map((point, idx) => {
        const label = point.label;
        const jobItem = rawJobTrends.find(
          (j) => j.label?.toLowerCase() === label?.toLowerCase()
        ) || (rawJobTrends.length > idx ? rawJobTrends[idx] : undefined);

        const itemItem = rawItemTrends.find(
          (i) => i.label?.toLowerCase() === label?.toLowerCase()
        ) || (rawItemTrends.length > idx ? rawItemTrends[idx] : undefined);

        return {
          month: label,
          jobs: jobItem?.transactionCount ?? jobItem?.totalRevenue ?? 0,
          items: itemItem?.transactionCount ?? itemItem?.totalRevenue ?? 0,
        };
      });
    }

    const defaultMonths = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    return defaultMonths.map((month) => ({
      month,
      jobs: 0,
      items: 0,
    }));
  }, [trendsResponse]);

  const filteredChartData = monthlyChartData;



  return (
    <div className="p-6 lg:p-8 space-y-6 bg-background">
      {/* ── Stats Row (Platform Growth Summary: 5 Cards from GET /api/v1/admin/stats) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        <Link href="/dashboard/chauffeur" className="block cursor-pointer transition-transform hover:scale-[1.01]">
          <StatCard
            title="Total Users"
            value={stats?.users?.count ?? 0}
            metric={stats?.users}
            isLoading={isStatsLoading}
          />
        </Link>

        <Link href="/dashboard/subscriptions" className="block cursor-pointer transition-transform hover:scale-[1.01]">
          <StatCard
            title="Active Subscriptions"
            value={stats?.activeSubscriptions?.count ?? 0}
            metric={stats?.activeSubscriptions}
            isLoading={isStatsLoading}
          />
        </Link>

        <Link href="/dashboard/chauffeur" className="block cursor-pointer transition-transform hover:scale-[1.01]">
          <StatCard
            title="Pending Chauffeurs"
            value={stats?.pendingDrivers?.count ?? 0}
            metric={stats?.pendingDrivers}
            isLoading={isStatsLoading}
          />
        </Link>

        <Link href="/dashboard/jobs" className="block cursor-pointer transition-transform hover:scale-[1.01]">
          <StatCard
            title="Active Jobs"
            value={stats?.activeJobs?.count ?? 0}
            metric={stats?.activeJobs}
            isLoading={isStatsLoading}
          />
        </Link>

        <Link href="/dashboard/items" className="block cursor-pointer transition-transform hover:scale-[1.01]">
          <StatCard
            title="Marketplace Items"
            value={stats?.totalItems?.count ?? 0}
            metric={stats?.totalItems}
            isLoading={isStatsLoading}
          />
        </Link>
      </div>

      {/* ── Charts Row ── */}
      <div className="w-full">
        {/* Monthly Trends Chart using shadcn/ui */}
        <Card className="border-0 shadow-sm bg-white rounded-xl ring-1 ring-black/5 flex flex-col justify-between py-6">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 px-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 rounded-lg text-purple-600">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-foreground">
                    Monthly Trends
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Time-series trend analysis for jobs &amp; marketplace listings
                  </CardDescription>
                </div>
              </div>

              <CardAction className="flex items-center gap-2">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger size="sm" className="w-[95px] rounded-lg bg-gray-50 border-gray-200 text-xs font-medium cursor-pointer">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="2026" className="text-xs">2026</SelectItem>
                    <SelectItem value="2025" className="text-xs">2025</SelectItem>
                    <SelectItem value="2024" className="text-xs">2024</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={trendMetric} onValueChange={setTrendMetric}>
                  <SelectTrigger size="sm" className="w-[125px] rounded-lg bg-gray-50 border-gray-200 text-xs font-medium cursor-pointer">
                    <SelectValue placeholder="All Trends" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all" className="text-xs">All Trends</SelectItem>
                    <SelectItem value="jobs" className="text-xs">Jobs Only</SelectItem>
                    <SelectItem value="items" className="text-xs">Items Only</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={chartPeriod} onValueChange={setChartPeriod}>
                  <SelectTrigger size="sm" className="w-[115px] rounded-lg bg-gray-50 border-gray-200 text-xs font-medium cursor-pointer">
                    <SelectValue placeholder="This Year" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="this-year" className="text-xs">Full Year</SelectItem>
                    <SelectItem value="6m" className="text-xs">Last 6 Months</SelectItem>
                    <SelectItem value="3m" className="text-xs">Last 3 Months</SelectItem>
                  </SelectContent>
                </Select>
              </CardAction>
            </CardHeader>

            {/* Visual Legend Indicator */}
            <div className="flex items-center gap-4 px-6 pt-1 text-xs font-medium text-muted-foreground">
              {(trendMetric === "all" || trendMetric === "jobs") && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span>Job Completions</span>
                </div>
              )}
              {(trendMetric === "all" || trendMetric === "items") && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Marketplace Listings</span>
                </div>
              )}
            </div>

            <CardContent className="pt-4 pb-6 px-6 flex-1 flex flex-col justify-center">
              {isTrendsLoading ? (
                <div className="h-[360px] w-full flex items-center justify-center animate-pulse bg-gray-50/50 rounded-xl">
                  <div className="w-full h-[280px] bg-gray-200/50 rounded-xl mx-4" />
                </div>
              ) : (
                <ChartContainer config={chartConfig} className="h-[360px] w-full">
                  <AreaChart
                    accessibilityLayer
                    data={filteredChartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="shadcnColorJobs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="shadcnColorItems" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f3f4f6"
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tickMargin={8}
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickMargin={8}
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                    />
                    <ChartTooltip
                      cursor={{
                        stroke: "#8b5cf6",
                        strokeWidth: 1,
                        strokeDasharray: "3 3",
                      }}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    {(trendMetric === "all" || trendMetric === "items") && (
                      <Area
                        type="natural"
                        dataKey="items"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#shadcnColorItems)"
                      />
                    )}
                    {(trendMetric === "all" || trendMetric === "jobs") && (
                      <Area
                        type="natural"
                        dataKey="jobs"
                        stroke="#8b5cf6"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#shadcnColorJobs)"
                      />
                    )}
                  </AreaChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
      </div>
    </div>
  );
};

export default MainPage;
