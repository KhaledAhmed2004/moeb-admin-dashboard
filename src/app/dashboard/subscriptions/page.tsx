"use client";

import  { useState, useMemo } from "react";
import { Users, CheckCircle2, Clock, Ban, Search, Layers } from "lucide-react";
import { StatCard, MetricStat } from "@/components/shared/StatCard";
import { CustomTabs, TabOption } from "@/components/shared/CustomTabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useSubscriptionStats,
  useSubscriptions,
} from "@/hooks/useSubscriptions";
import { ISubscriberItem } from "@/types/subscription";
import { getSubscriptionColumns } from "./columns";
import { SubscriptionDataTable } from "./data-table";
import { SubscriberDetailModal } from "./components/SubscriberDetailModal";

function extractMetric(data: unknown, ...keys: string[]): MetricStat {
  if (!data || typeof data !== "object") {
    return { count: 0, total: 0, growth: 0, growthType: "no_change" };
  }

  const record = data as Record<string, unknown>;
  for (const key of keys) {
    const val = record[key];
    if (val !== undefined && val !== null) {
      if (typeof val === "number") {
        return {
          count: val,
          total: val,
          growth: 0,
          growthType: "no_change",
        };
      }
      if (typeof val === "object") {
        const obj = val as Record<string, unknown>;
        const count =
          typeof obj.count === "number"
            ? obj.count
            : typeof obj.total === "number"
              ? obj.total
              : typeof obj.thisPeriodCount === "number"
                ? obj.thisPeriodCount
                : 0;
        const growth = typeof obj.growth === "number" ? obj.growth : 0;
        const growthType =
          typeof obj.growthType === "string"
            ? obj.growthType
            : growth > 0
              ? "positive"
              : growth < 0
                ? "negative"
                : "no_change";
        return {
          count,
          total: count,
          growth,
          growthType,
        };
      }
    }
  }

  return { count: 0, total: 0, growth: 0, growthType: "no_change" };
}

export default function SubscriptionsPage() {
  // Query States
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Modal State
  const [selectedSubscriber, setSelectedSubscriber] =
    useState<ISubscriberItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // Fetch Stats: GET /api/v1/admin/subscriptions/stats
  const {
    data: stats,
    isLoading: isStatsLoading,
  } = useSubscriptionStats();

  // Fetch Subscriptions: GET /api/v1/admin/subscriptions?page=1&limit=10&platform=ios&status=active
  const {
    data: subscriptionsResponse,
    isLoading: isListLoading,
  } = useSubscriptions({
    page,
    limit,
    platform: platformFilter,
    status: statusFilter,
    search: searchTerm,
  });

  const subscribers = useMemo(() => {
    return subscriptionsResponse?.data || [];
  }, [subscriptionsResponse]);

  const pagination = useMemo(() => {
    return subscriptionsResponse?.pagination;
  }, [subscriptionsResponse]);

  // Metric extractions supporting both new MetricStat objects and legacy numbers
  const totalSubscribersMetric = useMemo(
    () => extractMetric(stats, "totalSubscribers", "totalSubscribersCount"),
    [stats],
  );
  const activeSubscribersMetric = useMemo(
    () => extractMetric(stats, "activeSubscribers", "activeSubscribersCount"),
    [stats],
  );
  const expiringSoonMetric = useMemo(
    () => extractMetric(stats, "expiringSoon", "expiringSoonCount"),
    [stats],
  );
  const canceledSubscribersMetric = useMemo(
    () =>
      extractMetric(stats, "canceledSubscribers", "canceledSubscribersCount"),
    [stats],
  );
  const expiredSubscribersMetric = useMemo(
    () => extractMetric(stats, "expiredSubscribers", "expiredSubscribersCount"),
    [stats],
  );

  // Status Filter Tabs with dynamic badge counts
  const tabOptions: TabOption[] = useMemo(
    () => [
      {
        label: "All Subscriptions",
        value: "ALL",
        icon: Layers,
        badgeCount: totalSubscribersMetric.count,
        badgeColor: "indigo",
      },
      {
        label: "Active",
        value: "ACTIVE",
        icon: CheckCircle2,
        badgeCount: activeSubscribersMetric.count,
        badgeColor: "emerald",
      },
      {
        label: "Expiring Soon",
        value: "EXPIRING_SOON",
        icon: Clock,
        badgeCount: expiringSoonMetric.count,
        badgeColor: "amber",
      },
      {
        label: "Expired",
        value: "EXPIRED",
        icon: Ban,
        badgeCount: expiredSubscribersMetric.count,
        badgeColor: "rose",
      },
      {
        label: "Canceled",
        value: "CANCELED",
        icon: Ban,
        badgeCount: canceledSubscribersMetric.count,
        badgeColor: "gray",
      },
    ],
    [
      totalSubscribersMetric.count,
      activeSubscribersMetric.count,
      expiringSoonMetric.count,
      expiredSubscribersMetric.count,
      canceledSubscribersMetric.count,
    ],
  );

  const handleViewDetails = (subscriber: ISubscriberItem) => {
    setSelectedSubscriber(subscriber);
    setIsDetailModalOpen(true);
  };

  const columns = useMemo(
    () =>
      getSubscriptionColumns({
        onViewDetails: handleViewDetails,
      }),
    [],
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-background min-h-screen w-full">
      {/* Page Header */}
      <PageHeader
        title="Subscription Management"
        description="Real-time in-app store receipts, recurring billing status, and subscriber lifecycle management."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Subscribers"
          value={totalSubscribersMetric.count ?? 0}
          metric={totalSubscribersMetric}
          isLoading={isStatsLoading}
        />

        <StatCard
          title="Active Subscribers"
          value={activeSubscribersMetric.count ?? 0}
          metric={activeSubscribersMetric}
          isLoading={isStatsLoading}
        />

        <StatCard
          title="Expiring Soon"
          value={expiringSoonMetric.count ?? 0}
          metric={expiringSoonMetric}
          isLoading={isStatsLoading}
        />

        <StatCard
          title="Canceled Subscribers"
          value={canceledSubscribersMetric.count ?? 0}
          metric={canceledSubscribersMetric}
          isLoading={isStatsLoading}
        />
      </div>

      {/* ─── 2. Filter Tabs & Search Controls ───────────────────────────── */}
      <div className="space-y-3">
        {/* Status CustomTabs */}
        <div className="overflow-x-auto pb-1">
          <CustomTabs
            options={tabOptions}
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
          />
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Search Input */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search by subscriber name, email, order ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-10 text-xs bg-white rounded-xl border-zinc-200 shadow-2xs"
            />
          </div>

          {/* Platform Filter Dropdown */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-zinc-500 font-medium">Platform:</span>
            <Select
              value={platformFilter}
              onValueChange={(val) => {
                setPlatformFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-[170px] text-xs font-medium rounded-xl bg-white border-zinc-200 shadow-2xs">
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="ios">Apple iOS</SelectItem>
                <SelectItem value="android">Google Play</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ─── 3. Subscriptions Data Table ─────────────────────────────────── */}
      <SubscriptionDataTable
        columns={columns}
        data={subscribers}
        isLoading={isListLoading}
        pagination={pagination}
        onPageChange={(newPage) => setPage(newPage)}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        emptyMessage="No subscription records matching current filters."
      />

      {/* ─── 5. Subscriber Detail Modal ──────────────────────────────────── */}
      <SubscriberDetailModal
        subscriptionId={
          selectedSubscriber?._id || selectedSubscriber?.user?._id || null
        }
        isOpen={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        initialData={selectedSubscriber}
      />
    </div>
  );
}
