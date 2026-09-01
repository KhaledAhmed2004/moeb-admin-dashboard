"use client";

import { Handshake, CalendarCheck, Clock, CheckCircle2, XCircle, ArrowUp, ArrowDown, Plus, MoreVertical, FileText } from "lucide-react";
import { useState, useMemo } from "react";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { AddDealModal, NewDealPayload } from "./AddDealModal";
import { StatCard } from "@/components/shared/StatCard";

// Table Data
const dealsData: NewDealPayload[] = [
  { id: "DL-1248", title: "Corporate Partnership Program", partner: "Blue Logistics Ltd.", partnerInit: "BL", partnerBg: "bg-blue-600 text-white", dealType: "Partnership", typeBg: "bg-purple-100 text-purple-700", status: "Active", value: "$24,500", start: "May 12, 2024", end: "May 12, 2025", iconBg: "bg-purple-100 text-purple-600" },
  { id: "DL-1247", title: "Summer Delivery Campaign", partner: "FastDeliver Inc.", partnerInit: "FD", partnerBg: "bg-blue-900 text-white", dealType: "Campaign", typeBg: "bg-blue-100 text-blue-700", status: "Pending", value: "$15,800", start: "May 20, 2024", end: "Aug 20, 2024", iconBg: "bg-blue-100 text-blue-600" },
  { id: "DL-1246", title: "Fleet Expansion Deal", partner: "MoveIt Solutions", partnerInit: "MS", partnerBg: "bg-gray-100 text-gray-700 border", dealType: "Service", typeBg: "bg-green-100 text-green-700", status: "Active", value: "$32,000", start: "Apr 10, 2024", end: "Apr 10, 2025", iconBg: "bg-green-100 text-green-600" },
  { id: "DL-1245", title: "Holiday Special Offer", partner: "QuickShip Co.", partnerInit: "QS", partnerBg: "bg-indigo-900 text-white", dealType: "Campaign", typeBg: "bg-blue-100 text-blue-700", status: "Completed", value: "$8,750", start: "Dec 01, 2023", end: "Dec 31, 2023", iconBg: "bg-orange-100 text-orange-600" },
  { id: "DL-1244", title: "Tech Integration Partnership", partner: "TeknoDrive", partnerInit: "TD", partnerBg: "bg-cyan-500 text-white", dealType: "Partnership", typeBg: "bg-purple-100 text-purple-700", status: "Cancelled", value: "$18,200", start: "Mar 05, 2024", end: "May 05, 2024", iconBg: "bg-red-100 text-red-600" },
];

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
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${styles[status] || styles.Active}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[status] || dotStyles.Active}`}></span>
      {status}
    </span>
  );
};

export default function DealsManagementPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [dealsList, setDealsList] = useState<NewDealPayload[]>(dealsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [dealTypeFilter, setDealTypeFilter] = useState("ALL");

  const filteredDeals = useMemo(() => {
    return dealsList.filter((deal) => {
      const matchesSearch =
        !searchTerm ||
        deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.partner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || statusFilter === "ALL" || deal.status === statusFilter;
      const matchesType = dealTypeFilter === "ALL" || deal.dealType === dealTypeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [dealsList, searchTerm, statusFilter, dealTypeFilter]);

  const columns: ColumnDef<NewDealPayload>[] = [
    {
      header: "Deal ID",
      cell: (deal) => (
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-md ${deal.iconBg}`}>
            <FileText size={16} />
          </div>
          <span className="text-sm font-semibold text-gray-700">{deal.id}</span>
        </div>
      ),
    },
    {
      header: "Deal Title",
      cell: (deal) => (
        <p className="font-bold text-sm text-gray-900 max-w-[180px] leading-tight">{deal.title}</p>
      ),
    },
    {
      header: "Partner",
      cell: (deal) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold ${deal.partnerBg}`}>
            {deal.partnerInit}
          </div>
          <span className="font-semibold text-sm text-gray-700">{deal.partner}</span>
        </div>
      ),
    },
    {
      header: "Deal Type",
      cell: (deal) => (
        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${deal.typeBg}`}>
          {deal.dealType}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (deal) => <StatusIndicator status={deal.status} />,
    },
    {
      header: "Deal Value",
      cell: (deal) => <span className="text-sm text-gray-900 font-bold">{deal.value}</span>,
    },
    {
      header: "Start Date",
      cell: (deal) => <span className="text-sm text-gray-500 font-semibold">{deal.start}</span>,
    },
    {
      header: "End Date",
      cell: (deal) => <span className="text-sm text-gray-500 font-semibold">{deal.end}</span>,
    },
    {
      header: "Actions",
      className: "text-center",
      cell: () => (
        <button className="text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-md hover:bg-gray-100 inline-flex items-center justify-center cursor-pointer">
          <MoreVertical size={18} />
        </button>
      ),
    },
  ];

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

      {/* Main Table Using Shared DataTable */}
      <div className="mt-6">
        <DataTable
          columns={columns}
          data={filteredDeals}
          searchPlaceholder="Search deals by title, partner or ID..."
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          statusOptions={[
            { label: "Active", value: "Active" },
            { label: "Pending", value: "Pending" },
            { label: "Completed", value: "Completed" },
            { label: "Cancelled", value: "Cancelled" },
          ]}
          onStatusChange={setStatusFilter}
          extraFilters={
            <>
              <CustomSelect
                options={[
                  { label: "All Deal Types", value: "ALL" },
                  { label: "Partnership", value: "Partnership" },
                  { label: "Campaign", value: "Campaign" },
                  { label: "Service", value: "Service" },
                ]}
                value={dealTypeFilter}
                onChange={setDealTypeFilter}
                placeholder="Deal Type"
              />
              <DateRangePicker />
            </>
          }
          actionSlot={
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-purple-700 transition-colors justify-center shadow-sm cursor-pointer"
            >
              <Plus size={18} strokeWidth={2.5} />
              Add New Deal
            </button>
          }
          emptyMessage="No deals found."
          keyExtractor={(deal) => deal.id}
        />
      </div>

      {/* Add New Deal Modal */}
      <AddDealModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onAddDeal={(newDeal) => setDealsList([newDeal, ...dealsList])}
      />
    </div>
  );
}
