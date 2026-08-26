"use client";

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
  CheckCircle2,
  Ban,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  StatCard,
  DriverStatsData,
} from "./chauffeur/StatCard";

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

const pieData = [
  { name: "Chauffeurs", value: 400, color: "#8b5cf6" },
  { name: "Jobs", value: 300, color: "#f59e0b" },
  { name: "Listings", value: 200, color: "#10b981" },
];

// ─── Main Page ───────────────────────────────────────────────────────────────

const MainPage = () => {
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ["admin-chauffeur-stats"],
    queryFn: async () => {
      const response = await api.get("/admin/chauffeur-stats");
      return response.data?.data as DriverStatsData;
    },
  });

  const totalDrivers = statsData?.totalChauffeurs ?? statsData?.totalDrivers;
  const pendingDrivers =
    statsData?.pendingChauffeurs ?? statsData?.pendingDrivers;
  const suspendedDrivers =
    statsData?.suspendedChauffeurs ?? statsData?.suspendedDrivers;
  const approvedDrivers =
    statsData?.approvedChauffeurs ??
    statsData?.approvedDrivers ?? {
      count: Math.max(
        0,
        (totalDrivers?.count ?? totalDrivers?.total ?? 0) -
          (pendingDrivers?.count ?? pendingDrivers?.total ?? 0) -
          (suspendedDrivers?.count ?? suspendedDrivers?.total ?? 0),
      ),
      growth: 0,
      growthType: "no_change",
    };

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-background">
      {/* ── Stats Row (chauffeur StatCard) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Chauffeurs"
          value={totalDrivers?.count ?? totalDrivers?.total ?? 0}
          metric={totalDrivers}
          isLoading={isStatsLoading}
        />
        <StatCard
          title="Approved Chauffeurs"
          value={approvedDrivers?.count ?? approvedDrivers?.total ?? 0}
          metric={approvedDrivers}
          isLoading={isStatsLoading}
        />
        <StatCard
          title="Pending Approval"
          value={pendingDrivers?.count ?? pendingDrivers?.total ?? 0}
          metric={pendingDrivers}
          isLoading={isStatsLoading}
        />
        <StatCard
          title="Suspended Chauffeurs"
          value={suspendedDrivers?.count ?? suspendedDrivers?.total ?? 0}
          metric={suspendedDrivers}
          isLoading={isStatsLoading}
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
                  <h4 className="text-2xl font-bold text-foreground">00</h4>
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
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                      isAnimationActive={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-foreground">00</span>
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
                      00 (0%)
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
