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
      </div>
    </header>
  );
}
