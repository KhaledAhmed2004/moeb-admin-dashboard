"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  User,
  Clock,
  Briefcase,
  TrendingUp,
  Users,
  CreditCard,
  Package,
  Activity,
} from "lucide-react";
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

export interface AdminRecentActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface AdminRecentActivitiesResponse {
  success: boolean;
  message?: string;
  data: AdminRecentActivityItem[];
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    if (diffMs < 60 * 1000) {
      return "Just now";
    }

    const diffMins = Math.floor(diffMs / (60 * 1000));
    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? "min" : "mins"} ago`;
    }

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) {
      return "Yesterday";
    }
    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }

    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) {
      return `${diffWeeks} ${diffWeeks === 1 ? "week" : "weeks"} ago`;
    }

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) {
      return `${diffMonths} ${diffMonths === 1 ? "month" : "months"} ago`;
    }

    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} ${diffYears === 1 ? "year" : "years"} ago`;
  } catch {
    return dateString;
  }
}

function getActivityConfig(type?: string) {
  const normalizedType = (type || "").toUpperCase();

  if (
    normalizedType.includes("ITEM") ||
    normalizedType.includes("LISTING") ||
    normalizedType.includes("MARKETPLACE")
  ) {
    return {
      icon: Package,
      iconClass: "text-emerald-600",
      bgClass: "bg-emerald-100",
    };
  }

  if (
    normalizedType.includes("JOB") ||
    normalizedType.includes("RIDE") ||
    normalizedType.includes("DELIVERY") ||
    normalizedType.includes("OFFER")
  ) {
    return {
      icon: Briefcase,
      iconClass: "text-blue-600",
      bgClass: "bg-blue-100",
    };
  }

  if (
    normalizedType.includes("CHAUFFEUR") ||
    normalizedType.includes("DRIVER")
  ) {
    return {
      icon: Clock,
      iconClass: "text-amber-600",
      bgClass: "bg-amber-100",
    };
  }

  if (
    normalizedType.includes("USER") ||
    normalizedType.includes("REGISTER") ||
    normalizedType.includes("ACCOUNT")
  ) {
    return {
      icon: User,
      iconClass: "text-purple-600",
      bgClass: "bg-purple-100",
    };
  }

  if (
    normalizedType.includes("SUBSCRIPTION") ||
    normalizedType.includes("PAYMENT")
  ) {
    return {
      icon: CreditCard,
      iconClass: "text-indigo-600",
      bgClass: "bg-indigo-100",
    };
  }

  return {
    icon: Activity,
    iconClass: "text-slate-600",
    bgClass: "bg-slate-100",
  };
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
  const {
    data: activitiesResponse,
    isLoading: isActivitiesLoading,
  } = useQuery<AdminRecentActivitiesResponse>({
    queryKey: ["admin-recent-activities", 5],
    queryFn: async () => {
      try {
        const response = await api.get("/admin/recent-activities", {
          params: { limit: 5 },
        });
        return response.data;
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status === 404) {
          const response = await api.get("/api/v1/admin/recent-activities", {
            params: { limit: 5 },
          });
          return response.data;
        }
        throw err;
      }
    },
    refetchInterval: 30000,
  });

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

  const activities = useMemo(() => {
    const rawData = activitiesResponse?.data;
    if (!Array.isArray(rawData)) return [];
    return rawData.slice(0, 5);
  }, [activitiesResponse]);

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
        <StatCard
          title="Total Users"
          value={stats?.users?.count ?? stats?.users?.total ?? 0}
          metric={stats?.users}
          icon={Users}
          colorClass="text-indigo-700"
          bgColorClass="bg-indigo-50"
          subtitle="Registered users"
          isLoading={isStatsLoading}
          trend={stats?.users?.growth !== undefined ? `${stats.users.growth}%` : undefined}
          trendUp={stats?.users?.growthType !== "decrease"}
          trendBgClass={
            stats?.users?.growthType === "decrease"
              ? "bg-rose-50 border border-rose-200"
              : "bg-emerald-50 border border-emerald-200"
          }
          trendTextClass={
            stats?.users?.growthType === "decrease"
              ? "text-rose-600 font-semibold"
              : "text-emerald-600 font-semibold"
          }
          comparisonText="vs last period"
        />

        <Link href="/dashboard/subscriptions" className="block cursor-pointer transition-transform hover:scale-[1.01]">
          <StatCard
            title="Active Subscriptions"
            value={stats?.activeSubscriptions?.count ?? stats?.activeSubscriptions?.total ?? 0}
            metric={stats?.activeSubscriptions}
            icon={CreditCard}
            colorClass="text-emerald-700"
            bgColorClass="bg-emerald-50"
            subtitle="Active subscribers • View all"
            isLoading={isStatsLoading}
            trend={
              stats?.activeSubscriptions?.growth !== undefined
                ? `${stats.activeSubscriptions.growth}%`
                : undefined
            }
            trendUp={stats?.activeSubscriptions?.growthType !== "decrease"}
            trendBgClass={
              stats?.activeSubscriptions?.growthType === "decrease"
                ? "bg-rose-50 border border-rose-200"
                : "bg-emerald-50 border border-emerald-200"
            }
            trendTextClass={
              stats?.activeSubscriptions?.growthType === "decrease"
                ? "text-rose-600 font-semibold"
                : "text-emerald-600 font-semibold"
            }
            comparisonText="vs last period"
          />
        </Link>

        <StatCard
          title="Pending Chauffeurs"
          value={stats?.pendingDrivers?.count ?? stats?.pendingDrivers?.total ?? 0}
          metric={stats?.pendingDrivers}
          icon={Clock}
          colorClass="text-amber-700"
          bgColorClass="bg-amber-50"
          subtitle="Awaiting review"
          isLoading={isStatsLoading}
          trend={
            stats?.pendingDrivers?.growth !== undefined
              ? `${stats.pendingDrivers.growth}%`
              : undefined
          }
          trendUp={stats?.pendingDrivers?.growthType !== "decrease"}
          trendBgClass={
            stats?.pendingDrivers?.growthType === "decrease"
              ? "bg-rose-50 border border-rose-200"
              : "bg-emerald-50 border border-emerald-200"
          }
          trendTextClass={
            stats?.pendingDrivers?.growthType === "decrease"
              ? "text-rose-600 font-semibold"
              : "text-emerald-600 font-semibold"
          }
          comparisonText="vs last period"
        />

        <StatCard
          title="Active Jobs"
          value={stats?.activeJobs?.count ?? stats?.activeJobs?.total ?? 0}
          metric={stats?.activeJobs}
          icon={Briefcase}
          colorClass="text-blue-700"
          bgColorClass="bg-blue-50"
          subtitle="Ongoing rides & deliveries"
          isLoading={isStatsLoading}
          trend={
            stats?.activeJobs?.growth !== undefined
              ? `${stats.activeJobs.growth}%`
              : undefined
          }
          trendUp={stats?.activeJobs?.growthType !== "decrease"}
          trendBgClass={
            stats?.activeJobs?.growthType === "decrease"
              ? "bg-rose-50 border border-rose-200"
              : "bg-emerald-50 border border-emerald-200"
          }
          trendTextClass={
            stats?.activeJobs?.growthType === "decrease"
              ? "text-rose-600 font-semibold"
              : "text-emerald-600 font-semibold"
          }
          comparisonText="vs last period"
        />

        <StatCard
          title="Marketplace Items"
          value={stats?.totalItems?.count ?? stats?.totalItems?.total ?? 0}
          metric={stats?.totalItems}
          icon={Package}
          colorClass="text-purple-700"
          bgColorClass="bg-purple-50"
          subtitle="Active listings"
          isLoading={isStatsLoading}
          trend={
            stats?.totalItems?.growth !== undefined
              ? `${stats.totalItems.growth}%`
              : undefined
          }
          trendUp={stats?.totalItems?.growthType !== "decrease"}
          trendBgClass={
            stats?.totalItems?.growthType === "decrease"
              ? "bg-rose-50 border border-rose-200"
              : "bg-emerald-50 border border-emerald-200"
          }
          trendTextClass={
            stats?.totalItems?.growthType === "decrease"
              ? "text-rose-600 font-semibold"
              : "text-emerald-600 font-semibold"
          }
          comparisonText="vs last period"
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Monthly Trends Chart using shadcn/ui */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <Card className="border-0 shadow-sm bg-white rounded-xl ring-1 ring-black/5 flex-1 flex flex-col justify-between py-6">
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

        {/* Right Column */}
        <div className="flex flex-col">
          {/* Recent Activity */}
          <Card className="border-0 shadow-sm bg-white rounded-xl p-6 flex-1 ring-1 ring-black/5 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-foreground">
                Recent Activity
              </h3>
            </div>

            {isActivitiesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 rounded-xl bg-gray-50/80 border border-gray-100 animate-pulse"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-200 flex-shrink-0" />
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="h-3.5 bg-gray-200 rounded w-2/4" />
                        <div className="h-2.5 bg-gray-200 rounded w-3/4" />
                      </div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-14 flex-shrink-0" />
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Clock className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm font-medium text-gray-600">No recent activities</p>
                <p className="text-xs text-gray-400">Recent platform events will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => {
                  const { icon: ActivityIcon, iconClass, bgClass } = getActivityConfig(activity.type);
                  return (
                    <div
                      key={activity.id}
                      className="flex justify-between items-center p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 border border-gray-100 transition-colors group"
                      title={activity.timestamp ? new Date(activity.timestamp).toLocaleString() : undefined}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        <div className={`p-2.5 ${bgClass} ${iconClass} rounded-lg flex-shrink-0`}>
                          <ActivityIcon size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {activity.title}
                          </p>
                          {activity.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {activity.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap flex-shrink-0">
                        {formatRelativeTime(activity.timestamp)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
