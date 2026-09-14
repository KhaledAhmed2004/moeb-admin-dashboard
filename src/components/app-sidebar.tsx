"use client";

import {
  IconCalendarUser,
  IconCar,
  IconCreditCard,
  IconDashboard,
  IconMapPin,
  IconMessage,
  IconNotes,
  IconPackage,
  IconUsersGroup,
} from "@tabler/icons-react";
import * as React from "react";

import logo from "@/assets/logo.png";
import { NavDocuments } from "@/components/nav-documents";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { SidebarFooter } from "@/components/ui/sidebar";

const data = {
  documents: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      name: "User Management",
      url: "/dashboard/chauffeur",
      icon: IconUsersGroup,
    },
    {
      name: "Subscriptions",
      url: "/dashboard/subscriptions",
      icon: IconCreditCard,
    },
    {
      name: "Vehicle Configurations",
      url: "/dashboard/vehicle-config",
      icon: IconCar,
    },
    {
      name: "Deals Management",
      url: "/dashboard/deals",
      icon: IconCalendarUser,
    },
    {
      name: "Item Management",
      url: "/dashboard/items",
      icon: IconPackage,
    },
    {
      name: "Support",
      url: "/dashboard/support",
      icon: IconMessage,
    },
    {
      name: "Legal Policy",
      url: "/dashboard/terms-and-condition",
      icon: IconNotes,
    },
    {
      name: "Service Area",
      url: "/dashboard/service-area",
      icon: IconMapPin,
    },
  ],
  user: {
    name: "Admin",
    email: "admin@ekkali.com",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop",
  }
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* <SidebarMenuButton asChild className=" flex items-center border"> */}
            <div className="flex items-center justify-center pb-2">
              <Link
                href="/"
                className="block w-full duration-300  overflow-hidden"
              >
                <Image
                  src={logo}
                  className="w-full h-full"
                  width={300}
                  height={300}
                  alt="Ekkali logo"
                />
              </Link>
            </div>
            {/* </SidebarMenuButton> */}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavDocuments items={data.documents} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
