/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  IconClock,
  IconTarget,
  IconUser,
  IconUsersGroup,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import { useGetAllStatsQuery } from "@/redux/service/dashboard-stats/analyticsApi";

export function SectionCards({ data }: any) {
  const statisticsData = [
    {
      id: 1,
      amount: data?.data?.users?.total || 0,
      icon: IconUser,
      percentage: data?.data?.users?.formattedGrowth || "0%",
      description: "Total registered users",
      bgColor: "purple-100",
      iconColor: "purple",
    },
    {
      id: 2,
      amount: data?.data?.pendingDrivers?.total || 0,
      icon: IconClock,
      percentage: data?.data?.pendingDrivers?.formattedGrowth || "0%",
      description: "Pending drivers approvals",
      bgColor: "gray-100",
      iconColor: "gray",
    },
    {
      id: 3,
      amount: data?.data?.activeJobs?.total || 0,
      icon: IconUsersGroup,
      percentage: data?.data?.activeJobs?.formattedGrowth || "0%",
      description: "Active job offers",
      bgColor: "blue-100",
      iconColor: "blue",
    },
    {
      id: 4,
      amount: data?.data?.totalItems?.total || 0,
      icon: IconTarget,
      percentage: data?.data?.totalItems?.formattedGrowth || "0%",
      description: "Total Marketplace listings",
      bgColor: "orange-100",
      iconColor: "orange",
    },
  ];

  const bgColorMap: Record<string, string> = {
    "purple-100": "bg-purple-100",
    "gray-100": "bg-gray-100",
    "blue-100": "bg-blue-100",
    "orange-100": "bg-orange-100",
  };
  return (
    <div className=" *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4  *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {statisticsData?.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index} className="@container/card">
            <CardHeader>
              <CardDescription>
                <div
                  className={`w-10 h-10 ${bgColorMap[item.bgColor]} rounded-md flex items-center justify-center`}
                >
                  <Icon color={item.iconColor} />
                </div>
              </CardDescription>
              <CardTitle className="text-4xl font-bold tabular-nums ">
                {String(item.amount).padStart(2, "0")}
              </CardTitle>
              <CardAction>
                <Badge
                  variant={"outline"}
                  className="bg-green-200 text-green-600 border-green-600"
                >
                  {item.percentage}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="text-muted-foreground">{item.description}</div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
