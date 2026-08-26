"use client";

import { 
  Store, Eye, CheckCircle2, ArrowUp, ArrowDown, 
  Search, Filter, Plus, MoreVertical, Calendar
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Dummy Data for Sparklines
const generateSparkline = (base: number) => 
  Array.from({ length: 10 }).map((_, i) => ({ value: base + Math.random() * 20 }));

// Table Data
const listingsData = [
  { id: "JS-1001", title: "Luxury Apartment in Downtown", location: "New York, NY", owner: "John Smith", init: "JS", category: "Apartment", catBg: "bg-purple-100 text-purple-700", price: "$2,500 / mo", status: "Active", views: 428, created: "May 12, 2024", img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=150&h=100" },
  { id: "MB-1002", title: "Toyota Camry 2022", location: "Los Angeles, CA", owner: "Michael Brown", init: "MB", category: "Vehicle", catBg: "bg-blue-100 text-blue-700", price: "$28,000", status: "Active", views: 312, created: "May 10, 2024", img: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?auto=format&fit=crop&q=80&w=150&h=100" },
  { id: "SJ-1003", title: "Canon EOS R5 Camera", location: "Chicago, IL", owner: "Sarah Johnson", init: "SJ", category: "Electronics", catBg: "bg-orange-100 text-orange-700", price: "$3,200", status: "Pending", views: 86, created: "May 20, 2024", img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=150&h=100" },
  { id: "DW-1004", title: "Modern Sofa Set", location: "Houston, TX", owner: "David Wilson", init: "DW", category: "Furniture", catBg: "bg-green-100 text-green-700", price: "$850", status: "Active", views: 174, created: "May 08, 2024", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=150&h=100" },
  { id: "ED-1005", title: "Mountain Bike - Trek Marlin 7", location: "Seattle, WA", owner: "Emma Davis", init: "ED", category: "Sports", catBg: "bg-purple-100 text-purple-700", price: "$650", status: "Sold", views: 231, created: "May 03, 2024", img: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&q=80&w=150&h=100" },
  { id: "JT-1006", title: "Complete Set of Science Books", location: "Boston, MA", owner: "James Taylor", init: "JT", category: "Books", catBg: "bg-red-100 text-red-700", price: "$120", status: "Inactive", views: 44, created: "Apr 28, 2024", img: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=150&h=100" },
  { id: "OM-1007", title: "Dining Table with 6 Chairs", location: "Miami, FL", owner: "Olivia Martinez", init: "OM", category: "Furniture", catBg: "bg-green-100 text-green-700", price: "$1,200", status: "Pending", views: 67, created: "May 21, 2024", img: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80&w=150&h=100" },
];

const StatCard = ({ title, subtitle, value, trend, trendUp, icon: Icon, colorClass, bgColorClass, trendBgClass, trendTextClass, chartColor }: any) => {
  const data = generateSparkline(10);
  return (
    <Card className="border-0 shadow-sm bg-white rounded-xl overflow-hidden ring-1 ring-black/5">
      <CardContent className="p-5 flex flex-col justify-between h-full relative">
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-full ${bgColorClass} flex items-center justify-center`}>
            <Icon size={24} className={colorClass} strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs font-bold text-gray-700">{title}</p>
              <div className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${trendBgClass} ${trendTextClass}`}>
                 {trendUp ? <ArrowUp size={10} className="mr-0.5" /> : <ArrowDown size={10} className="mr-0.5" />}
                 {trend}
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h2>
          </div>
        </div>
        <p className="text-[11px] text-gray-500 font-medium mb-2">{subtitle}</p>
        
        {/* Sparkline */}
        <div className="h-10 w-full -ml-2 -mb-2 mt-auto">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke={chartColor} strokeWidth={2} fillOpacity={1} fill={`url(#gradient-${title.replace(/\s+/g, '')})`} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const StatusIndicator = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    Active: "text-green-600 bg-green-50",
    Pending: "text-orange-500 bg-orange-50",
    Sold: "text-blue-600 bg-blue-50",
    Inactive: "text-gray-600 bg-gray-100",
  };
  const dotStyles: Record<string, string> = {
    Active: "bg-green-500",
    Pending: "bg-orange-500",
    Sold: "bg-blue-500",
    Inactive: "bg-gray-500",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[status]}`}></span>
      {status}
    </span>
  );
};

export default function MarketplaceManagementPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6 bg-background min-h-full">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Marketplace Management</h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">Manage all marketplace listings and monitor their performance</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Listings"
          value="1,248"
          subtitle="All time listings"
          icon={Store}
          colorClass="text-purple-600"
          bgColorClass="bg-purple-100"
          trend="12.5%"
          trendUp={true}
          trendBgClass="bg-green-50"
          trendTextClass="text-green-600"
          chartColor="#a855f7"
        />
        <StatCard
          title="Active Listings"
          value="842"
          subtitle="Currently live"
          icon={Eye}
          colorClass="text-green-600"
          bgColorClass="bg-green-100"
          trend="8.7%"
          trendUp={true}
          trendBgClass="bg-green-50"
          trendTextClass="text-green-600"
          chartColor="#22c55e"
        />
        <StatCard
          title="Sold"
          value="542"
          subtitle="Total sold items"
          icon={CheckCircle2}
          colorClass="text-blue-600"
          bgColorClass="bg-blue-100"
          trend="15.4%"
          trendUp={true}
          trendBgClass="bg-green-50"
          trendTextClass="text-green-600"
          chartColor="#3b82f6"
        />
      </div>

      {/* Data Table Section */}
      <div className="w-full">
        <Card className="border-0 shadow-sm bg-white rounded-xl ring-1 ring-black/5">
          <CardContent className="p-0">
            {/* Table Controls */}
            <div className="p-5 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-gray-100">
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="relative w-full sm:w-[280px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search listings by title, location or owner..." 
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-gray-400 font-medium"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-purple-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Filter size={16} />
                  Filter
                </button>
                <select className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg outline-none cursor-pointer hover:bg-gray-50 transition-colors">
                  <option>Category</option>
                  <option>Apartment</option>
                  <option>Vehicle</option>
                  <option>Electronics</option>
                </select>
                <select className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg outline-none cursor-pointer hover:bg-gray-50 transition-colors">
                  <option>Status</option>
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Sold</option>
                </select>
                <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-purple-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Calendar size={16} />
                  Date Range
                </button>
              </div>
              
              <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-purple-700 transition-colors w-full lg:w-auto justify-center shadow-sm">
                <Plus size={18} strokeWidth={2.5} />
                Add New Listing
              </button>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-white border-b border-gray-100">
                    <th colSpan={8} className="px-6 py-4 font-bold text-lg text-foreground">Marketplace Listings</th>
                  </tr>
                  <tr className="bg-white border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-3">Listing</th>
                    <th className="px-6 py-3">Owner</th>
                    <th className="px-6 py-3">Category <span className="ml-1 text-[9px]">↕</span></th>
                    <th className="px-6 py-3">Price</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Views <span className="ml-1 text-[9px]">↕</span></th>
                    <th className="px-6 py-3">Created On <span className="ml-1 text-[9px]">↕</span></th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {listingsData.map((listing) => (
                    <tr key={listing.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img src={listing.img} alt={listing.title} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900 leading-tight mb-0.5">{listing.title}</p>
                            <p className="text-xs text-gray-500 font-medium">{listing.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gray-200 text-gray-700 text-xs font-bold">{listing.init}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-sm text-gray-900">{listing.owner}</p>
                            <p className="text-[11px] text-gray-400 font-medium">{listing.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${listing.catBg}`}>
                          {listing.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-bold">{listing.price}</td>
                      <td className="px-6 py-4">
                        <StatusIndicator status={listing.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">{listing.views}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-medium">{listing.created}</td>
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
              <span className="text-gray-500 font-semibold">Showing 1 to 7 of 1,248 results</span>
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
                  178
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                  &rarr;
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
