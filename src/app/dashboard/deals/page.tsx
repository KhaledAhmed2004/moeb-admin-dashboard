"use client";

import { Handshake, CalendarCheck, Clock, CheckCircle2, XCircle, ArrowUp, ArrowDown, Search, Filter, Plus, MoreVertical, Calendar, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";

// Chart Data
const areaChartData = [
  { name: "Jan", uv: 70 }, { name: "Feb", uv: 100 }, { name: "Mar", uv: 130 }, { name: "Apr", uv: 170 },
  { name: "May", uv: 230 }, { name: "Jun", uv: 260 }, { name: "Jul", uv: 300 }, { name: "Aug", uv: 380 },
  { name: "Sep", uv: 300 }, { name: "Oct", uv: 240 }, { name: "Nov", uv: 180 }, { name: "Dec", uv: 130 }
];

const pieData = [
  { name: "Active", value: 842, color: "#4ade80", percentage: "67.6%" },
  { name: "Pending", value: 213, color: "#fbbf24", percentage: "17.1%" },
  { name: "Completed", value: 1035, color: "#3b82f6", percentage: "12.4%" },
  { name: "Cancelled", value: 106, color: "#f43f5e", percentage: "8.5%" }
];

// Table Data
const dealsData = [
  { id: "DL-1248", title: "Corporate Partnership Program", partner: "Blue Logistics Ltd.", partnerInit: "BL", partnerBg: "bg-blue-600 text-white", dealType: "Partnership", typeBg: "bg-purple-100 text-purple-700", status: "Active", value: "$24,500", start: "May 12, 2024", end: "May 12, 2025", iconBg: "bg-purple-100 text-purple-600" },
  { id: "DL-1247", title: "Summer Delivery Campaign", partner: "FastDeliver Inc.", partnerInit: "FD", partnerBg: "bg-blue-900 text-white", dealType: "Campaign", typeBg: "bg-blue-100 text-blue-700", status: "Pending", value: "$15,800", start: "May 20, 2024", end: "Aug 20, 2024", iconBg: "bg-blue-100 text-blue-600" },
  { id: "DL-1246", title: "Fleet Expansion Deal", partner: "MoveIt Solutions", partnerInit: "MS", partnerBg: "bg-gray-100 text-gray-700 border", dealType: "Service", typeBg: "bg-green-100 text-green-700", status: "Active", value: "$32,000", start: "Apr 10, 2024", end: "Apr 10, 2025", iconBg: "bg-green-100 text-green-600" },
  { id: "DL-1245", title: "Holiday Special Offer", partner: "QuickShip Co.", partnerInit: "QS", partnerBg: "bg-indigo-900 text-white", dealType: "Campaign", typeBg: "bg-blue-100 text-blue-700", status: "Completed", value: "$8,750", start: "Dec 01, 2023", end: "Dec 31, 2023", iconBg: "bg-orange-100 text-orange-600" },
  { id: "DL-1244", title: "Tech Integration Partnership", partner: "TeknoDrive", partnerInit: "TD", partnerBg: "bg-cyan-500 text-white", dealType: "Partnership", typeBg: "bg-purple-100 text-purple-700", status: "Cancelled", value: "$18,200", start: "Mar 05, 2024", end: "May 05, 2024", iconBg: "bg-red-100 text-red-600" },
];

const StatCard = ({ title, subtitle, value, trend, trendUp, icon: Icon, colorClass, bgColorClass, trendBgClass, trendTextClass }: any) => (
  <Card className="border-0 shadow-sm bg-white rounded-xl overflow-hidden ring-1 ring-black/5">
    <CardContent className="p-6 h-full flex flex-col justify-between">
      <div className="flex items-start gap-4 mb-6">
        <div className={`p-4 rounded-full ${bgColorClass} flex items-center justify-center`}>
          <Icon size={28} className={colorClass} strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <p className="text-[13px] font-bold text-gray-700">{title}</p>
            <div className={`flex items-center text-[11px] font-bold px-1.5 py-0.5 rounded ${trendBgClass} ${trendTextClass}`}>
               {trendUp ? <ArrowUp size={12} className="mr-0.5" /> : <ArrowDown size={12} className="mr-0.5" />}
               {trend}
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">{value}</h2>
        </div>
      </div>
      <p className="text-xs text-gray-500 font-medium mt-auto">{subtitle}</p>
    </CardContent>
  </Card>
);

const StatusIndicator = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    Active: "text-green-600 bg-green-50",
    Pending: "text-orange-500 bg-orange-50",
    Completed: "text-blue-600 bg-blue-50",
    Cancelled: "text-red-600 bg-red-50",
  };
  const dotStyles: Record<string, string> = {
    Active: "bg-green-500",
    Pending: "bg-orange-500",
    Completed: "bg-blue-500",
    Cancelled: "bg-red-500",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[status]}`}></span>
      {status}
    </span>
  );
};

export default function DealsManagementPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6 bg-background min-h-full">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Deals Management</h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">Track and manage all deals and partnerships</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard
          title="Total Deals"
          value="1,248"
          subtitle="All time deals"
          icon={Handshake}
          colorClass="text-purple-600"
          bgColorClass="bg-purple-100"
          trend="12.5%"
          trendUp={true}
          trendBgClass="bg-green-50"
          trendTextClass="text-green-600"
        />
        <StatCard
          title="Active Deals"
          value="842"
          subtitle="Currently active"
          icon={CalendarCheck}
          colorClass="text-green-600"
          bgColorClass="bg-green-100"
          trend="8.7%"
          trendUp={true}
          trendBgClass="bg-green-50"
          trendTextClass="text-green-600"
        />
        <StatCard
          title="Pending Deals"
          value="213"
          subtitle="Awaiting approval"
          icon={Clock}
          colorClass="text-orange-500"
          bgColorClass="bg-orange-100"
          trend="3.2%"
          trendUp={true}
          trendBgClass="bg-orange-50"
          trendTextClass="text-orange-600"
        />
        <StatCard
          title="Completed Deals"
          value="1,035"
          subtitle="Successfully completed"
          icon={CheckCircle2}
          colorClass="text-blue-600"
          bgColorClass="bg-blue-100"
          trend="15.4%"
          trendUp={true}
          trendBgClass="bg-green-50"
          trendTextClass="text-green-600"
        />
        <StatCard
          title="Cancelled Deals"
          value="106"
          subtitle="This month"
          icon={XCircle}
          colorClass="text-red-500"
          bgColorClass="bg-red-100"
          trend="4.1%"
          trendUp={false}
          trendBgClass="bg-red-50"
          trendTextClass="text-red-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column (Area Chart) */}
        <div className="xl:col-span-2 flex flex-col">
          <Card className="border-0 shadow-sm bg-white rounded-xl p-6 flex-1 ring-1 ring-black/5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-foreground">Deals Overview</h3>
              <select className="border border-gray-200 rounded-md text-sm px-3 py-1.5 bg-white text-gray-700 outline-none hover:bg-gray-50 cursor-pointer">
                <option>This Month</option>
                <option>Last Month</option>
                <option>This Year</option>
              </select>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <RechartsTooltip cursor={{ stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="uv" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" isAnimationActive={false} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right Column (Donut Chart) */}
        <div className="flex flex-col">
          <Card className="border-0 shadow-sm bg-white rounded-xl p-6 ring-1 ring-black/5 flex-1 flex flex-col">
            <h3 className="font-bold text-lg mb-6 text-foreground">Deals by Status</h3>
            <div className="flex flex-col xl:flex-row items-center justify-center gap-8 flex-1">
              <div className="w-[200px] h-[200px] relative flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value" stroke="none" isAnimationActive={false}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-foreground">1,248</span>
                  <span className="text-xs font-medium text-muted-foreground mt-1">Total Deals</span>
                </div>
              </div>
              <div className="flex flex-col gap-4 w-full xl:w-auto">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between xl:justify-start gap-4 xl:gap-8 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-gray-600">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900 mr-2">{item.value}</span>
                      <span className="text-xs font-medium text-gray-400">({item.percentage})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-0 shadow-sm bg-white rounded-xl ring-1 ring-black/5 mt-6 overflow-hidden">
        <CardContent className="p-0">
          {/* Table Controls */}
          <div className="p-5 flex flex-col xl:flex-row justify-between items-center gap-4 border-b border-gray-100">
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search deals by title, partner or ID..." 
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-gray-400 font-medium"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-purple-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter size={16} />
                Filter
              </button>
              <select className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg outline-none cursor-pointer hover:bg-gray-50 transition-colors">
                <option>Status</option>
                <option>Active</option>
                <option>Pending</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
              <select className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg outline-none cursor-pointer hover:bg-gray-50 transition-colors">
                <option>Deal Type</option>
                <option>Partnership</option>
                <option>Campaign</option>
                <option>Service</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-purple-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Calendar size={16} />
                Date Range
              </button>
            </div>
            
            <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-purple-700 transition-colors w-full xl:w-auto justify-center shadow-sm">
              <Plus size={18} strokeWidth={2.5} />
              Add New Deal
            </button>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Deal ID <span className="ml-1 text-[10px]">↕</span></th>
                  <th className="px-6 py-4">Deal Title <span className="ml-1 text-[10px]">↕</span></th>
                  <th className="px-6 py-4">Partner <span className="ml-1 text-[10px]">↕</span></th>
                  <th className="px-6 py-4">Deal Type <span className="ml-1 text-[10px]">↕</span></th>
                  <th className="px-6 py-4">Status <span className="ml-1 text-[10px]">↕</span></th>
                  <th className="px-6 py-4">Deal Value <span className="ml-1 text-[10px]">↕</span></th>
                  <th className="px-6 py-4">Start Date <span className="ml-1 text-[10px]">↕</span></th>
                  <th className="px-6 py-4">End Date <span className="ml-1 text-[10px]">↕</span></th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dealsData.map((deal) => (
                  <tr key={deal.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md ${deal.iconBg}`}>
                          <FileText size={16} />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{deal.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm text-gray-900 max-w-[180px] leading-tight">{deal.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold ${deal.partnerBg}`}>
                          {deal.partnerInit}
                        </div>
                        <span className="font-semibold text-sm text-gray-700">{deal.partner}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${deal.typeBg}`}>
                        {deal.dealType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusIndicator status={deal.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-bold">{deal.value}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-semibold">{deal.start}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-semibold">{deal.end}</td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-md hover:bg-gray-100 inline-flex items-center justify-center">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-5 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-100 text-sm">
            <span className="text-gray-500 font-semibold">Showing 1 to 5 of 1,248 results</span>
            <div className="flex items-center gap-1.5">
              <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                &larr;
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md bg-primary text-white font-bold shadow-sm">
                1
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors">
                2
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors">
                3
              </button>
              <span className="w-8 h-8 flex items-center justify-center text-gray-400 tracking-widest">...</span>
              <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors">
                250
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                &rarr;
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
