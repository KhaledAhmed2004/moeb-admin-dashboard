"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconBell } from "@tabler/icons-react";

const routeConfig: Record<string, { title: string }> = {
  "/dashboard": { title: "Dashboard" },
  "/dashboard/chauffeur": { title: "User Management" },
  "/dashboard/vehicle-config": { title: "Vehicle Configurations" },
  // "/dashboard/deals": { title: "Deals Management" },
  "/dashboard/items": { title: "Item Management" },
  "/dashboard/support": { title: "Support" },
  "/dashboard/terms-and-condition": { title: "Legal Policy" },
  "/dashboard/service-area": { title: "Service Area" },
  "/dashboard/profile": { title: "Admin Profile & Security" },
};

export function SiteHeader() {
  const pathname = usePathname();
  const notifications = { data: [1, 2] };

  const currentRoute = routeConfig[pathname] || {
    title:
      pathname
        .split("/")
        .pop()
        ?.replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()) || "Dashboard",
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200/80 bg-background transition-[width,height] ease-linear">
      <div className="flex w-full items-center justify-between px-4 lg:px-8">
        {/* Left Section: Sidebar Trigger & Clean Breadcrumbs */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1 text-foreground cursor-pointer" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {pathname === "/dashboard" ? (
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold text-foreground">
                    Dashboard
                  </BreadcrumbPage>
                </BreadcrumbItem>
              ) : (
                <>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink asChild>
                      <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                        Dashboard
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-semibold text-foreground">
                      {currentRoute.title}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Right Section: Notification Bell Only */}
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="relative cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-white border shadow-xs flex items-center justify-center text-primary hover:bg-gray-50 transition-colors">
                  {notifications.data.length > 0 && (
                    <div className="w-4 h-4 rounded-full bg-primary absolute -top-1 -right-1 border-2 border-white flex items-center justify-center">
                      <span className="text-[9px] text-white font-bold">
                        {notifications.data.length}
                      </span>
                    </div>
                  )}
                  <IconBell size={20} />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px] rounded-xl shadow-lg border">
              <div className="px-4 py-3 border-b">
                <h4 className="font-bold text-sm text-foreground">Notifications</h4>
              </div>
              <div className="p-4 text-center text-xs text-muted-foreground">
                You have {notifications.data.length} new notifications
              </div>
              <DropdownMenuSeparator />
              <div className="p-2 text-center">
                <Link
                  href="/dashboard"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  View all
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
