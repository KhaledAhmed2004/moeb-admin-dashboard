"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  User,
  Clock,
  Briefcase,
  Target,
  Calendar,
  TrendingUp,
  Users,
  CreditCard,
  Package,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { StatCard } from "@/components/shared/StatCard";

export interface AdminDashboardStatMetric {
  total: number;
  thisPeriodCount: number;
  lastPeriodCount: number;
  growth: number;
  growthType: "increase" | "decrease" | "no_change" | string;
}

export interface AdminDashboardStatsData {
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

// ─── Static chart data ───────────────────────────────────────────────────────

const areaChartData = [
  { name: "Jan", uv: 12 },
  { name: "Feb", uv: 19 },
  { name: "Mar", uv: 24 },
  { name: "Apr", uv: 38 },
  { name: "May", uv: 37 },
  { name: "Jun", uv: 65 },
  { name: "Jul", uv: 63 },
  { name: "Aug", uv: 95 },
  { name: "Sep", uv: 75 },
  { name: "Oct", uv: 60 },
  { name: "Nov", uv: 48 },
  { name: "Dec", uv: 38 },
];

const DEFAULT_PIE_DATA = [
  { name: "Users", value: 0, color: "#6366f1" },
  { name: "Pending Chauffeurs", value: 0, color: "#f59e0b" },
  { name: "Jobs", value: 0, color: "#3b82f6" },
  { name: "Items", value: 0, color: "#10b981" },
];

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

  const stats = statsResponse?.data;

  const pieData = useMemo(() => {
    if (!stats) return DEFAULT_PIE_DATA;
    return [
      { name: "Users", value: stats.users?.total ?? 0, color: "#6366f1" },
      { name: "Pending Chauffeurs", value: stats.pendingDrivers?.total ?? 0, color: "#f59e0b" },
      { name: "Jobs", value: stats.activeJobs?.total ?? 0, color: "#3b82f6" },
      { name: "Items", value: stats.totalItems?.total ?? 0, color: "#10b981" },
    ];
  }, [stats]);

  const pieTotal = useMemo(
    () => pieData.reduce((acc, curr) => acc + curr.value, 0),
    [pieData]
  );

  const chartPieData = useMemo(() => {
    const hasData = pieData.some((d) => d.value > 0);
    if (!hasData) {
      return [{ name: "No data", value: 1, color: "#e2e8f0" }];
    }
    return pieData.filter((d) => d.value > 0);
  }, [pieData]);

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-background">
      {/* ── Stats Row (Platform Growth Summary: 5 Cards from GET /api/v1/admin/stats) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        <StatCard
          title="Total Users"
          value={stats?.users?.total ?? 0}
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

        <StatCard
          title="Active Subscriptions"
          value={stats?.activeSubscriptions?.total ?? 0}
          metric={stats?.activeSubscriptions}
          icon={CreditCard}
          colorClass="text-emerald-700"
          bgColorClass="bg-emerald-50"
          subtitle="Active subscribers"
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

        <StatCard
          title="Pending Chauffeurs"
          value={stats?.pendingDrivers?.total ?? 0}
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
          value={stats?.activeJobs?.total ?? 0}
          metric={stats?.activeJobs}
          icon={Briefcase}
          colorClass="text-blue-700"
          bgColorClass="bg-blue-50"
          subtitle="Ongoing rides &amp; deliveries"
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
          value={stats?.totalItems?.total ?? 0}
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
        {/* Area Chart */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <Card className="border-0 shadow-sm bg-white rounded-xl p-6 flex-1 ring-1 ring-black/5">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-md">
                  <Calendar size={18} className="text-purple-600" />
                </div>
                <h3 className="font-bold text-lg text-foreground">
                  Monthly Posting Jobs
                </h3>
              </div>
              <select className="border border-gray-200 rounded-md text-sm px-3 py-1.5 bg-white text-gray-700 outline-none hover:bg-gray-50 cursor-pointer">
                <option>This Month</option>
                <option>Last Month</option>
                <option>This Year</option>
              </select>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={areaChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorUv"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#8b5cf6"
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="95%"
                        stopColor="#8b5cf6"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                  />
                  <RechartsTooltip
                    cursor={{
                      stroke: "#8b5cf6",
                      strokeWidth: 1,
                      strokeDasharray: "3 3",
                    }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="uv"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorUv)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg border border-gray-100">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Total Posted Jobs
                  </p>
                  <h4 className="text-2xl font-bold text-foreground">
                    {stats?.activeJobs?.total ?? 0}
                  </h4>
                </div>
                <div className="p-3 bg-purple-100 rounded-md text-purple-600">
                  <Briefcase size={20} />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg border border-gray-100">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Avg. Jobs / Month
                  </p>
                  <h4 className="text-2xl font-bold text-foreground">00</h4>
                </div>
                <div className="p-3 bg-blue-100 rounded-md text-blue-600">
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg border border-gray-100">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Highest Month
                  </p>
                  <h4 className="text-2xl font-bold text-foreground">Aug</h4>
                </div>
                <div className="p-3 bg-green-100 rounded-md text-green-600">
                  <TrendingUp size={20} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Pie Chart */}
          <Card className="border-0 shadow-sm bg-white rounded-xl p-6 ring-1 ring-black/5">
            <h3 className="font-bold text-lg mb-6 text-foreground">
              Platform Overview
            </h3>
            <div className="flex items-center gap-6">
              <div className="w-[160px] h-[160px] relative flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={chartPieData.length > 1 ? 5 : 0}
                      dataKey="value"
                      stroke="none"
                      isAnimationActive={false}
                    >
                      {chartPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-foreground">
                    {pieTotal}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Total
                  </span>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                {pieData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-semibold text-foreground text-xs">
                      {item.value}{" "}
                      <span className="text-muted-foreground font-normal">
                        ({pieTotal > 0 ? Math.round((item.value / pieTotal) * 100) : 0}%)
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-sm bg-white rounded-xl p-6 flex-1 ring-1 ring-black/5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-foreground">
                Recent Activity
              </h3>
              <button className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-md hover:bg-purple-100 transition-colors">
                View All
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 border border-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-100 text-purple-600 rounded-lg">
                    <User size={16} />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    New user registered
                  </span>
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  2 mins ago
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 border border-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg">
                    <Clock size={16} />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Chauffeur approval pending
                  </span>
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  15 mins ago
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 border border-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-orange-100 text-orange-600 rounded-lg">
                    <Briefcase size={16} />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    New job offer posted
                  </span>
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  1 hour ago
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 border border-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-green-100 text-green-600 rounded-lg">
                    <Target size={16} />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    New listing added
                  </span>
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  2 hours ago
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
